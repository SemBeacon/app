import { defineStore } from 'pinia';
import { Absolute2DPosition, DataSerializer } from '@openhps/core';
import { Store } from '@openhps/rdf';
import { BLESemBeacon } from '@sembeacon/openhps';
import { BLEBeaconObject, BLEAltBeacon, BLEiBeacon, BLEEddystoneURL } from '@openhps/rf';
import { Floor } from '@openhps/geospatial';
import { Toast } from '@capacitor/toast';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { toRaw, type Raw } from 'vue';
import { useEnvironmentStore } from './environment';
import { useLogger } from './logger';
import { useSettings } from './settings';
import { ControllerState } from './types';
import { createDemoBeacons, DEMO_SCAN_INFO } from '@/demo/demoBeacons';
import { BeaconFilter, emptyBeaconFilter, isFilterActive } from '@/utils/FilterBeacons';
import { BeaconScanner, ScanInfo } from '@/services/BeaconScanner';
import { isNetworkError, isOnline, onNetworkChange } from '@/services/Network';
import { semBeaconService, storeBeacon } from '@/services/semBeacon';

/** Scan info of a beacon; kept under this name for the components that use it. */
export type Beacon = ScanInfo;

export interface BeaconState {
    state: ControllerState;
    scanning: boolean;
    /** Whether the browser reports a network connection. */
    online: boolean;
    // Raw<> keeps the class types: Pinia's state typing would otherwise unwrap the class
    // instances into plain object types
    beacons: Map<string, Raw<BLEBeaconObject>>;
    beaconInfo: Map<string, Beacon>;
    /** Avoid showing the same "details could not be loaded" toast for every beacon. */
    resolutionNoticeShown: boolean;
    /** SemBeacon flag filter (session only). */
    filter: BeaconFilter;
    /** Whether the app is showing demo data (enables local actuation). */
    demoMode: boolean;
}

/** Scan info is written at most this often while scanning. */
export const SAVE_DELAY_MS = 2000;
const STORAGE_KEY = 'beacon.scanning';

// Driver objects and timers: not reactive state
const scanner = new BeaconScanner(Capacitor.getPlatform());
let saveTimer: ReturnType<typeof setTimeout> | undefined;
let listening = false;
let networkListening = false;
/** UIDs that are being resolved, so repeated scans do not start a resolution each time. */
const resolving = new Set<string>();

/**
 * A beacon with its latest scan info, without modifying the stored beacon: the beacon is
 * the prototype, so class checks (instanceof) and its getters keep working.
 */
function withScanInfo(beacon: BLEBeaconObject, info?: Beacon): BLEBeaconObject & Beacon {
    return Object.assign(Object.create(beacon), info) as BLEBeaconObject & Beacon;
}

function describe(beacon: BLEBeaconObject): string {
    if (beacon instanceof BLESemBeacon) {
        return `SemBeacon ${beacon.uid} with namespace=${beacon.namespaceId}, instance=${beacon.instanceId}`;
    } else if (beacon instanceof BLEiBeacon || beacon instanceof BLEAltBeacon) {
        return `${beacon.constructor.name} ${beacon.uid} with major=${beacon.major}, minor=${beacon.minor}`;
    } else if (beacon instanceof BLEEddystoneURL) {
        return `Eddystone URL ${beacon.uid} with URL=${beacon.url}`;
    }
    return `beacon ${beacon.uid}`;
}

export const useBeaconStore = defineStore('beacon.scanning', {
    state: (): BeaconState => ({
        state: ControllerState.PENDING,
        scanning: false,
        online: isOnline(),
        beacons: new Map(),
        beaconInfo: new Map(),
        resolutionNoticeShown: false,
        filter: emptyBeaconFilter(),
        demoMode: false,
    }),
    getters: {
        service: () => semBeaconService,
        cacheSize(): number {
            return this.beacons.size;
        },
        isScanning(): boolean {
            return this.scanning;
        },
        beaconsWithInfo(): Array<BLEBeaconObject & Beacon> {
            return Array.from(this.beacons.values(), (beacon) =>
                withScanInfo(beacon, this.beaconInfo.get(beacon.uid)),
            );
        },
        /** SemBeacons whose online resource could not be resolved. */
        unresolvedBeacons(): Array<BLEBeaconObject & Beacon> {
            return this.beaconsWithInfo.filter((beacon) => beacon.resolutionError !== undefined);
        },
        filterActive(): boolean {
            return isFilterActive(this.filter);
        },
        /** Positioned beacons on a floor, or in one of the floor's spaces. */
        beaconsOnFloor(): (floor: Floor) => Array<BLEBeaconObject & Beacon> {
            const environmentStore = useEnvironmentStore();
            return (floor: Floor) => {
                const spaceUIDs = new Set(
                    Array.from(environmentStore.environments.values())
                        .filter((space) => space.parentUID === floor.uid)
                        .map((space) => space.uid),
                );
                return this.beaconsWithInfo.filter((beacon) => {
                    const onFloor =
                        !beacon.parentUID ||
                        beacon.parentUID === floor.uid ||
                        spaceUIDs.has(beacon.parentUID);
                    const position = beacon.position as unknown as Absolute2DPosition;
                    return onFloor && position?.x !== undefined && !Number.isNaN(position.x);
                });
            };
        },
    },
    actions: {
        /** Add the demo beacons as if they were just detected (see src/demo). */
        async addDemoBeacons(): Promise<void> {
            const beacons = await createDemoBeacons();
            await Promise.all(
                beacons.map((beacon) => {
                    this.beaconInfo.set(beacon.uid, { ...DEMO_SCAN_INFO, lastSeen: Date.now() });
                    return this.addBeacon(beacon);
                }),
            );
            await this.save();
        },
        findBeaconInfo(uid: string): Beacon | undefined {
            return this.beaconInfo.get(uid);
        },
        /**
         * Find a beacon among the detected ones, falling back to persisted beacons. Never
         * rejects or hangs: resolves undefined when the beacon is unknown, also when the
         * scanner model could not be built (e.g. no Bluetooth support).
         */
        async findByUID(uid: string): Promise<BLEBeaconObject | undefined> {
            const detected = this.beacons.get(uid);
            if (detected) {
                return detected;
            }
            try {
                return await semBeaconService.findByUID(uid);
            } catch {
                return undefined;
            }
        },
        /** Store a detected SemBeacon and resolve its resource (environment, user, ...). */
        async addSemBeacon(beacon: BLESemBeacon): Promise<void> {
            const logger = useLogger();
            if (beacon.namespaceId === undefined || beacon.instanceId === undefined) {
                throw new Error('SemBeacon is missing namespace or instance ID');
            }
            if (resolving.has(beacon.uid)) {
                return;
            }
            resolving.add(beacon.uid);
            // Show the beacon even while (or when) its resource cannot be resolved: an
            // offline demo must not make the SemBeacon silently disappear. Keep an already
            // resolved beacon, though: replacing it with the raw advertisement drops its
            // resource data (name, object) until the next resolution and makes the list
            // items flicker on every scan frame.
            if (!this.beacons.has(beacon.uid)) {
                this.beacons.set(beacon.uid, beacon);
            }
            try {
                await this.addUUID(beacon.namespaceId.toString());
                logger.log(
                    'info',
                    `Detecting SemBeacon with URI=${beacon.shortResourceUri}, NS=${beacon.namespaceId}, ID=${beacon.instanceId}`,
                );
                const inserted = await storeBeacon(beacon).catch((err) => {
                    const error = isNetworkError(err) ? 'offline' : 'failed';
                    this.setResolutionError(beacon.uid, error);
                    this.notifyResolutionError(error);
                    logger.log('warn', `Unable to resolve SemBeacon ${beacon.uid}: ${err}`);
                    return undefined;
                });
                if (inserted instanceof BLESemBeacon) {
                    this.clearResolutionError(beacon.uid);
                    this.beacons.set(inserted.uid, inserted);
                    if (inserted.resourceData) {
                        useEnvironmentStore().fetchEnvironments(inserted.resourceData);
                        if (inserted.createdTimestamp === inserted.modifiedTimestamp) {
                            Toast.show({ text: `Detected new nearby SemBeacon!` });
                        }
                        logger.log(
                            'info',
                            `Retrieved information for SemBeacon ${inserted.resourceUri}`,
                        );
                    }
                }
            } finally {
                resolving.delete(beacon.uid);
                this.scheduleSave();
            }
        },
        /** Mark a SemBeacon as unresolved so the UI can offer a retry. */
        setResolutionError(uid: string, error: 'offline' | 'failed'): void {
            const info = this.beaconInfo.get(uid);
            if (!info) {
                return;
            }
            this.beaconInfo.set(uid, { ...info, resolutionError: error });
            this.scheduleSave();
        },
        clearResolutionError(uid: string): void {
            // The detail page copies the error onto the beacon object; clear it there too so
            // a retry hides the error card even when the service returns the same object.
            const beacon = this.beacons.get(uid) as (BLEBeaconObject & Beacon) | undefined;
            if (beacon?.resolutionError !== undefined) {
                delete beacon.resolutionError;
            }
            const info = this.beaconInfo.get(uid);
            if (!info || info.resolutionError === undefined) {
                return;
            }
            const { resolutionError: _, ...rest } = info;
            this.beaconInfo.set(uid, rest);
            this.scheduleSave();
        },
        /** Explain why beacon details are missing, once per offline period. */
        notifyResolutionError(error: 'offline' | 'failed'): void {
            if (this.resolutionNoticeShown) {
                return;
            }
            this.resolutionNoticeShown = true;
            Toast.show({
                text:
                    error === 'offline'
                        ? 'You are offline. Beacon details could not be loaded.'
                        : 'Unable to load the details of a detected SemBeacon.',
            }).catch(console.error);
        },
        /**
         * Force a fresh resource resolve, bypassing the service cache. Used for retries and
         * for reloading the transient RDF data of a persisted beacon.
         * @returns the resolved beacon, or undefined when it still cannot be resolved
         */
        async reloadResolution(uid: string): Promise<BLESemBeacon | undefined> {
            const beacon = this.beacons.get(uid);
            if (!(beacon instanceof BLESemBeacon)) {
                return undefined;
            }
            try {
                const result = await semBeaconService.resolve(beacon as BLESemBeacon, {
                    resolveAll: false,
                    persistence: false,
                });
                if (!result.result) {
                    return undefined;
                }
                const resolved = result.result as BLESemBeacon;
                resolved.resourceData = new Store(result.data);
                this.beacons.set(resolved.uid, resolved);
                this.clearResolutionError(resolved.uid);
                this.scheduleSave();
                return resolved;
            } catch (err) {
                const error = isNetworkError(err) ? 'offline' : 'failed';
                this.setResolutionError(uid, error);
                this.notifyResolutionError(error);
                useLogger().log('warn', `Unable to load SemBeacon ${uid}: ${err}`);
                return undefined;
            }
        },
        /** Try to resolve a SemBeacon again, e.g. from the offline banner or detail page. */
        async retryResolution(uid: string): Promise<BLESemBeacon | undefined> {
            return this.reloadResolution(uid);
        },
        /** Retry every SemBeacon whose resource could not be resolved. */
        async retryUnresolved(): Promise<void> {
            const unresolved = Array.from(this.beacons.values()).filter(
                (beacon) =>
                    beacon instanceof BLESemBeacon &&
                    this.beaconInfo.get(beacon.uid)?.resolutionError !== undefined,
            ) as BLESemBeacon[];
            await Promise.all(unresolved.map((beacon) => this.reloadResolution(beacon.uid)));
        },
        async addBeacon(beacon: BLEBeaconObject): Promise<void> {
            if (beacon instanceof BLESemBeacon) {
                return this.addSemBeacon(beacon);
            }
            if (beacon instanceof BLEEddystoneURL && Capacitor.getPlatform() === 'ios') {
                // iOS does not report SemBeacon advertisements, but their Eddystone-URL
                // fallback: check whether the URL describes a SemBeacon
                const semBeacon = await storeBeacon(BLESemBeacon.fromEddystoneURL(beacon)).catch(
                    () => undefined,
                );
                if (semBeacon instanceof BLESemBeacon) {
                    return this.addSemBeacon(semBeacon);
                }
                useLogger().log('info', `Eddystone URL is not a SemBeacon: ${beacon.uid}`);
            }
            await storeBeacon(beacon);
            this.scheduleSave();
        },
        async initialize(): Promise<void> {
            this.state = ControllerState.INITIALIZING;
            this.online = isOnline();
            const logger = useLogger();
            logger.log('info', 'Initializing beacon scanner model ...');
            semBeaconService.logger = (level: string, message: string) =>
                logger.log(level, message);
            // initialize() runs again when the app resumes: register the listener once
            if (!listening) {
                listening = true;
                semBeaconService.on('beacon', (beacon: BLEBeaconObject) => {
                    this.beacons.set(beacon.uid, beacon);
                    logger.log('info', `Added ${describe(beacon)}`);
                });
            }
            if (!networkListening) {
                networkListening = true;
                this.online = isOnline();
                onNetworkChange((online) => {
                    this.online = online;
                    if (online) {
                        // A new connectivity period: allow another error toast
                        this.resolutionNoticeShown = false;
                        this.retryUnresolved().catch((err) =>
                            logger.log('warn', `Unable to retry beacon resolution: ${err}`),
                        );
                    }
                });
            }
            try {
                await scanner.build(semBeaconService, logger.log, (beacon, info) => {
                    this.beaconInfo.set(beacon.uid, info);
                    this.addBeacon(beacon).catch((err) =>
                        logger.log('error', `Unable to add beacon ${beacon.uid}: ${err}`),
                    );
                });
                logger.log('info', 'Initialized beacon scanner model');
                this.state = ControllerState.READY;
            } catch (error) {
                // Capacitor plugins reject with code UNAVAILABLE when the platform lacks the
                // API (e.g. browsers without Web Bluetooth scanning)
                this.state =
                    (error as { code?: string })?.code === 'UNAVAILABLE'
                        ? ControllerState.NOT_SUPPORTED
                        : ControllerState.NO_PERMISSION;
                // Previously detected beacons can still be shown
                await this.load();
                throw error;
            }
            await this.load();
            if (this.online && this.unresolvedBeacons.length > 0) {
                // Persisted beacons whose resource could not be loaded while offline
                this.retryUnresolved().catch((err) =>
                    logger.log('warn', `Unable to retry beacon resolution: ${err}`),
                );
            }
        },
        async startScan(): Promise<void> {
            useLogger().log('info', 'Starting BLE scan ...');
            await scanner.setProximityUUIDs(Object.keys(useSettings().data.uuids));
            await scanner.start();
            this.scanning = true;
        },
        async stopScan(): Promise<void> {
            useLogger().log('info', 'Stopping BLE scan ...');
            await scanner.stop();
            this.scanning = false;
        },
        setFilter(filter: BeaconFilter): void {
            this.filter = { flags: [...new Set(filter.flags)] };
        },
        clearFilter(): void {
            this.filter = emptyBeaconFilter();
        },
        /** Forget all detected beacons and the environments resolved from them. */
        clear(): void {
            useEnvironmentStore().clear();
            this.beacons = new Map();
            this.beaconInfo = new Map();
            semBeaconService.deleteAll();
            this.save().catch(console.error);
        },
        async load(): Promise<void> {
            const { value } = await Preferences.get({ key: STORAGE_KEY });
            const data = value && value !== 'undefined' ? JSON.parse(value) : undefined;
            if (!data) {
                return;
            }
            const info: Record<string, Beacon> = DataSerializer.deserialize(data);
            this.beaconInfo = new Map(Object.entries(info));
            const stored = await semBeaconService.findAll();
            stored.forEach((beacon) => this.beacons.set(beacon.uid, beacon));
            await useEnvironmentStore().load();
        },
        /** Persist scan info (beacons themselves are stored by the SemBeacon service). */
        async save(): Promise<void> {
            clearTimeout(saveTimer);
            saveTimer = undefined;
            useLogger().log('info', 'Saving beacons and environments ...');
            const serialized = DataSerializer.serialize(
                Object.fromEntries(toRaw(this.beaconInfo).entries()),
            );
            await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(serialized) });
            await useEnvironmentStore().save();
        },
        /** Save soon; while scanning, beacons are reported several times per second. */
        scheduleSave(): void {
            if (saveTimer === undefined) {
                saveTimer = setTimeout(() => {
                    this.save().catch(console.error);
                }, SAVE_DELAY_MS);
            }
        },
        /** Known namespace: iOS needs it to range for the beacon. */
        async addUUID(uuid: string): Promise<void> {
            const settings = useSettings();
            if (await settings.registerUuid(uuid)) {
                await scanner.setProximityUUIDs(Object.keys(settings.data.uuids));
                useLogger().log('info', `Added known UUID ${uuid} to settings for iOS`);
            }
        },
    },
});
