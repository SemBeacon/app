import { defineStore } from 'pinia';
import { CallbackSinkNode, DataFrame, Model, ModelBuilder, RelativeDistance } from '@openhps/core';
import { BLESourceNode } from '@openhps/capacitor-bluetooth';
import { BLEiBeaconSourceNode } from "@openhps/cordova-ibeacon";
import { BLESemBeacon, SEMBEACON_FLAG_HAS_POSITION, SEMBEACON_FLAG_HAS_SYSTEM } from '@/models/BLESemBeacon';
import { 
    BLEBeaconObject, 
    BLEBeaconClassifierNode, 
    BLEAltBeacon,
    BLEiBeacon,
    BLEEddystoneUID,
    BLEEddystoneURL,
    RelativeRSSI,
    RelativeRSSIProcessing,
    PropagationModel,
    BLEEddystoneTLM,
    BLEEddystone,
    BLEEddystoneTLMBuilder,
    BLEEddystoneURLBuilder,
    BLEAltBeaconBuilder,
    BLEUUID,
    BLEiBeaconBuilder,
} from '@openhps/rf';
import { SemBeaconService } from '@/services/SemBeaconService';
import { LocalStorageDriver } from '@openhps/localstorage';
import { useEnvironmentStore } from './environment';
import { Toast } from '@capacitor/toast';
import { useLogger } from './logger';
import { Capacitor } from '@capacitor/core';
import { BLESemBeaconBuilder } from '@/models/BLESemBeaconBuilder';
import { ControllerState } from './types';

export interface BeaconScan {
    results: number;
}

export interface SemBeaconNamespace {
    beacons: Record<string, BLESemBeacon>;
    model: Model;
}

export interface Beacon {
    rssi: number;
    lastSeen: number;
    distance: number;
}

export interface BeaconState {
    proximityUUIDs: string[];
    namespaces: Record<string, SemBeaconNamespace>;
    sources: (BLESourceNode | BLEiBeaconSourceNode)[];
    model: Model | undefined;
    beacons: Map<string, BLEBeaconObject & Beacon>;
    beaconInfo: Map<string, BLEBeaconObject>;
    state?: ControllerState;
}

export const useBeaconStore = defineStore('beacon.scanning', {
    state: (): BeaconState => ({
        state: ControllerState.PENDING,
        proximityUUIDs: [],
        namespaces: {},
        sources: [
            new BLESourceNode({
                uid: "ble",
                debug: false,
            }), 
            ...(
                Capacitor.getPlatform() === 'ios' ?
                [
                    new BLEiBeaconSourceNode({
                        uid: "ble-ibeacon",
                        debug: true,
                        uuids: [
                            "53b71dca-eb49-4ba6-a697-59f3acd184b1"
                        ]
                    })] : []
            )
        ],
        model: undefined,
        beacons: new Map(),
        beaconInfo: new Map()
    }),
    getters: {
        cacheSize(): number {
            return (this.beacons as Map<string, BLEBeaconObject>).size;
        },
        isScanning(): boolean {
            return (this.sources as BLESourceNode)[0].isRunning();
        },
        isAdvertising(): boolean {
            return this.advertising;
        }
    },
    actions: {
        populate(): void {
            Promise.all([
                BLESemBeaconBuilder.create()
                    .namespaceId(BLEUUID.fromString("77f340db-ac0d-20e8-aa3a-f656a29f236c"))
                    .instanceId("9c7ce6fc")
                    .calibratedRSSI(-56)
                    .shortResourceUri("https://bit.ly/3JsEnF9")
                    .flag(SEMBEACON_FLAG_HAS_POSITION)
                    .flag(SEMBEACON_FLAG_HAS_SYSTEM)
                    .build(),
                BLEiBeaconBuilder.create()
                    .proximityUUID(BLEUUID.fromString("77f340db-ac0d-20e8-aa3a-f656a29f236c"))
                    .calibratedRSSI(-56)
                    .major(51243)
                    .minor(14124)
                    .build(),
                BLEAltBeaconBuilder.create()
                    .proximityUUID(BLEUUID.fromString("77f340db-ac0d-20e8-aa3a-f656a29f236c"))
                    .major(51243)
                    .minor(14124)
                    .calibratedRSSI(-56)
                    .build(),
                BLEEddystoneURLBuilder.create()
                    .calibratedRSSI(-56)
                    .url("https://maximvdw.be")
                    .build(),
                BLEEddystoneTLMBuilder.create()
                    .calibratedRSSI(-56)
                    .voltage(3215)
                    .temperature(25.91)
                    .uptime(5)
                    .advertiseCount(100)
                    .build(),
            ]).then(beacons => {
                beacons.forEach((beacon: any) => {
                    beacon.uid = beacon.computeUID();
                    const beaconInfo = {
                        lastSeen: Date.now(),
                        rssi: -64,
                        distance: 1.5
                    };
                    this.beaconInfo.set(beacon.uid, beaconInfo);
                    this.addBeacon(beacon);
                });
            });
        },
        findBeaconInfo(uid: string): Beacon {
            return this.beaconInfo.get(uid);
        },
        findByUID(uid: string): Promise<BLEBeaconObject & Beacon> {
            if (!this.model) {
                return new Promise((resolve) => resolve(undefined));
            }
            const service = this.model.findDataService(SemBeaconService);
            return service.findByUID(uid);
        },
        findByNamespace(namespace: string): BLESemBeacon[] {
            return this.namespaces[namespace as any].beacons as BLESemBeacon[];
        },
        addBeacon(beacon: BLEBeaconObject): Promise<void> {
            return new Promise((resolve) => {
                const logger = useLogger();
                const environmentStore = useEnvironmentStore();
                const service = this.model.findDataService(SemBeaconService);
                if (beacon instanceof BLESemBeacon) {
                    // Add SemBeacon namespace structure
                    const namespace = this.namespaces[beacon.namespaceId.toString()] ?? {
                        beacons: {},
                        model: undefined
                    };
                    this.namespaces[beacon.namespaceId.toString()] = namespace;
                    logger.log("info", `Detecting SemBeacon with URI=${beacon.shortResourceUri}`);
                    service.insert(beacon.uid, beacon).then((insertedBeacon: BLEBeaconObject) => {
                        if (insertedBeacon && insertedBeacon instanceof BLESemBeacon && insertedBeacon.resourceData) {
                            namespace.beacons[insertedBeacon.instanceId.toString()] = insertedBeacon;
                            environmentStore.fetchEnvironments(insertedBeacon.resourceData);
                            Toast.show({
                                text: `Detected nearby SemBeacon!`,
                            });
                            logger.log("info", `Retrieved information for SemBeacon ${beacon.resourceUri}`);
                        }
                    });
                    resolve();
                } else {
                    if (beacon instanceof BLEiBeacon) {
                        const uuidStr = beacon.proximityUUID.toString();
                        if (!this.proximityUUIDs.includes(uuidStr)) {
                            this.proximityUUIDs.push(uuidStr);
                            // Update source node
                        }
                    }
                    service.insert(beacon.uid, beacon);
                    resolve();
                }
            });
        },
        initialize(): Promise<void> {
            return new Promise((resolve, reject) => {
                this.state = ControllerState.INITIALIZING;
                const logger = useLogger();
                logger.log('info', 'Initializing beacon scanner model ...');
                ModelBuilder.create()
                    .addService(new SemBeaconService(
                        new LocalStorageDriver(BLESemBeacon, {
                            namespace: "sembeacon",
                        }), 
                        {
                            accessToken: "2cd7bc12126759042bfb3ebe1160aafda0bc65df",
                            cors: true
                        }))
                    .from(...this.sources)
                    .via(new BLEBeaconClassifierNode({
                        resetUID: true,
                        types: [
                            BLESemBeacon,
                            BLEAltBeacon,
                            BLEiBeacon,
                            BLEEddystoneURL,
                            BLEEddystoneUID,
                            BLEEddystoneTLM,
                        ]
                    }))
                    .via(new RelativeRSSIProcessing({
                        environmentFactor: 2.0,
                        propagationModel: PropagationModel.LOG_DISTANCE
                    }))
                    .to(new CallbackSinkNode((frame: DataFrame) => {
                        // Add beacons
                        frame.getObjects()
                            .forEach((beacon: BLEBeaconObject) => {
                                if (beacon instanceof BLEBeaconObject) {
                                    const relativeRSSI = frame.source.getRelativePosition(beacon.uid, RelativeRSSI.name) as RelativeRSSI;
                                    const relativeDistance = frame.source.getRelativePosition(beacon.uid, RelativeDistance.name) as RelativeDistance;
                                    const beaconInfo = {
                                        lastSeen: Date.now(),
                                        rssi: relativeRSSI ? relativeRSSI.rssi : undefined,
                                        distance: relativeDistance ? Math.round(relativeDistance.referenceValue * 100) / 100 : undefined
                                    };
                                    this.beaconInfo.set(beacon.uid, beaconInfo);
                                    if (beacon instanceof BLESemBeacon) {
                                        logger.log("info", `Detected SemBeacon ${beacon.uid} with namespace=${beacon.namespaceId.toString()}, instance=${beacon.instanceId.toString()}, RSSI=${beaconInfo.rssi}, distance=${beaconInfo.distance}`);
                                    } else if (beacon instanceof BLEiBeacon) {
                                        logger.log("info", `Detected iBeacon ${beacon.uid} with major=${beacon.major}, minor=${beacon.minor}, RSSI=${beaconInfo.rssi}, distance=${beaconInfo.distance}`);
                                    } else if (beacon instanceof BLEEddystone) {
                                        logger.log("info", `Detected Eddystone ${beacon.uid} with RSSI=${beaconInfo.rssi} and distance=${beaconInfo.distance}`);
                                    } else {
                                        logger.log("info", `Detected beacon ${beacon.uid} with RSSI=${beaconInfo.rssi} and distance=${beaconInfo.distance}`);
                                    }
                                    this.addBeacon(beacon);
                                }
                            });
                    }, {
                        persistence: false  // Already done using "addBeacon"
                    }))
                    .build().then((model: Model) => {
                        this.model = model;
                        logger.log('info', 'Initialized beacon scanner model');
                        const service = this.model.findDataService(SemBeaconService);
                        service.on('beacon', (beacon) => {
                            const info = this.beaconInfo.get(beacon.uid);
                            if (info) {
                                beacon.rssi = info.rssi;
                                beacon.distance = info.distance;
                                beacon.lastSeen = info.lastSeen;
                            } else {
                                beacon.rssi = undefined;
                                beacon.distance = undefined;
                                beacon.lastSeen = undefined;
                            }
                            console.log("Beacon", beacon);
                            this.beacons.set(beacon.uid, beacon);
                            if (beacon instanceof BLESemBeacon) {
                                logger.log("info", `Added SemBeacon ${beacon.uid} with namespace=${beacon.namespaceId.toString()}, instance=${beacon.instanceId.toString()}`);
                            } else if (beacon instanceof BLEiBeacon) {
                                logger.log("info", `Added iBeacon ${beacon.uid} with major=${beacon.major}, minor=${beacon.minor}`);
                            } else {
                                logger.log("info", `Added beacon ${beacon.uid}`);
                            }
                        });
                        this.model.on('error', console.error);
                        this.state = ControllerState.READY;
                        this.populate();
                        resolve();
                    }).catch((error: Error) => {
                        this.state = ControllerState.NO_PERMISSION;
                        reject(error);
                    });
            });
        },
        startScan(): Promise<void> {
            return new Promise((resolve, reject) => {
                const logger = useLogger();
                logger.log('info', 'Starting BLE scan ...');
                const sources: BLESourceNode[] = this.sources;
                Promise.all(sources.map(source => {
                    return source.start();
                })).then(() => resolve()).catch(reject);
            });
        },
        stopScan(): Promise<void> {
            return new Promise((resolve, reject) => {
                const logger = useLogger();
                logger.log('info', 'Stopping BLE scan ...');
                const sources: BLESourceNode[] = this.sources;
                Promise.all(sources.map(source => {
                    return source.stop();
                })).then(() => resolve()).catch(reject);
            });
        },
        clear(): void {
            this.namespaces = {};
            this.beacons = new Map();
            this.beaconInfo = new Map();
            const service = this.model.findDataService(SemBeaconService);
            service.deleteAll();
        }
    }
});
