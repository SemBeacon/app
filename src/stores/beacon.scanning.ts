import { defineStore } from 'pinia';
import { Absolute2DPosition, DataSerializer } from '@openhps/core';
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
import { BeaconScanner, ScanInfo } from '@/services/BeaconScanner';
import { semBeaconService, storeBeacon } from '@/services/semBeacon';

/** Scan info of a beacon; kept under this name for the components that use it. */
export type Beacon = ScanInfo;

export interface BeaconState {
    state: ControllerState;
    scanning: boolean;
    // Raw<> keeps the class types: Pinia's state typing would otherwise unwrap the class
    // instances into plain object types
    beacons: Map<string, Raw<BLEBeaconObject>>;
    beaconInfo: Map<string, Beacon>;
}

/** Scan info is written at most this often while scanning. */
export const SAVE_DELAY_MS = 2000;
const STORAGE_KEY = 'beacon.scanning';

// Driver objects and timers: not reactive state
const scanner = new BeaconScanner(Capacitor.getPlatform());
let saveTimer: ReturnType<typeof setTimeout> | undefined;
let listening = false;

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
        beacons: new Map(),
        beaconInfo: new Map(),
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
            await this.addUUID(beacon.namespaceId.toString());
            logger.log(
                'info',
                `Detecting SemBeacon with URI=${beacon.shortResourceUri}, NS=${beacon.namespaceId}, ID=${beacon.instanceId}`,
            );
            const inserted = await storeBeacon(beacon).catch((err) => {
                logger.log('warn', `Unable to resolve SemBeacon ${beacon.uid}: ${err}`);
                return undefined;
            });
            if (inserted instanceof BLESemBeacon && inserted.resourceData) {
                useEnvironmentStore().fetchEnvironments(inserted.resourceData);
                if (inserted.createdTimestamp === inserted.modifiedTimestamp) {
                    Toast.show({ text: `Detected new nearby SemBeacon!` });
                }
                logger.log('info', `Retrieved information for SemBeacon ${inserted.resourceUri}`);
            }
            this.scheduleSave();
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
            const logger = useLogger();
            logger.log('info', 'Initializing beacon scanner model ...');
            semBeaconService.logger = (level: string, message: string) => logger.log(level, message);
            // initialize() runs again when the app resumes: register the listener once
            if (!listening) {
                listening = true;
                semBeaconService.on('beacon', (beacon: BLEBeaconObject) => {
                    this.beacons.set(beacon.uid, beacon);
                    logger.log('info', `Added ${describe(beacon)}`);
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
