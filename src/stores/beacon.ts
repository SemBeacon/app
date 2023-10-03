import { defineStore } from 'pinia';
import { CallbackSinkNode, DataFrame, Model, ModelBuilder, RelativeDistance } from '@openhps/core';
import { BLESourceNode } from '@openhps/capacitor-bluetooth';
import { BLESemBeacon } from '@/models/BLESemBeacon';
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
} from '@openhps/rf';
import { SemBeaconService } from '@/services/SemBeaconService';
import { LocalStorageDriver } from '@openhps/localstorage';
import { useEnvironmentStore } from './environment';
import { Toast } from '@capacitor/toast';
import { useLogger } from './logger';

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
    namespaces: Record<string, SemBeaconNamespace>;
    source: BLESourceNode;
    model: Model | undefined;
    beacons: Map<string, BLEBeaconObject & Beacon>;
    beaconInfo: Map<string, BLEBeaconObject>;
}

export const useBeaconStore = defineStore('beacon', {
    state: (): BeaconState => ({
        namespaces: {},
        source: new BLESourceNode({
            uid: "ble"
        }),
        model: undefined,
        beacons: new Map(),
        beaconInfo: new Map()
    }),
    getters: {
        sourceNode(): BLESourceNode {
            return this.source;
        },
        isScanning(): boolean {
            return (this.source as BLESourceNode).isRunning();
        }
    },
    actions: {
        findBeaconInfo(uid: string): Beacon {
            return this.beaconInfo.get(uid);
        },
        findByUID(uid: string): Promise<BLEBeaconObject & Beacon> {
            if (!this.model) {
                return undefined;
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
                    service.insert(beacon.uid, beacon);
                    resolve();
                }
            });
        },
        initialize(): Promise<void> {
            return new Promise((resolve, reject) => {
                const logger = useLogger();

                ModelBuilder.create()
                    .addService(new SemBeaconService(
                        new LocalStorageDriver(BLESemBeacon, {
                            namespace: "sembeacon",
                        }), 
                        {
                            accessToken: "2cd7bc12126759042bfb3ebe1160aafda0bc65df"
                        }))
                    .from(this.source as BLESourceNode)
                    .via(new BLEBeaconClassifierNode({
                        resetUID: true,
                        types: [
                            BLESemBeacon,
                            BLEAltBeacon,
                            BLEiBeacon,
                            BLEEddystoneURL,
                            BLEEddystoneUID
                        ]
                    }))
                    .via(new RelativeRSSIProcessing({
                        environmentFactor: 2.2,
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
                                        logger.log("info", `Detected SemBeacon ${beacon.knownAddresses[0].toString()} with namespace=${beacon.namespaceId.toString()}, instance=${beacon.instanceId.toString()}, RSSI=${beaconInfo.rssi}, distance=${beaconInfo.distance}`);
                                    } else if (beacon instanceof BLEiBeacon) {
                                        logger.log("info", `Detected iBeacon ${beacon.knownAddresses[0].toString()} with major=${beacon.major}, minor=${beacon.minor}, RSSI=${beaconInfo.rssi}, distance=${beaconInfo.distance}`);
                                    } else {
                                        logger.log("info", `Detected beacon ${beacon.knownAddresses[0].toString()} with RSSI=${beaconInfo.rssi} and distance=${beaconInfo.distance}`);
                                    }
                                    this.addBeacon(beacon);
                                }
                            });
                    }, {
                        persistence: false  // Already done using "addBeacon"
                    }))
                    .build().then((model: Model) => {
                        this.model = model;
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
                                logger.log("info", `Added SemBeacon ${beacon.knownAddresses[0].toString()} with namespace=${beacon.namespaceId.toString()}, instance=${beacon.instanceId.toString()}`);
                            } else if (beacon instanceof BLEiBeacon) {
                                logger.log("info", `Added iBeacon ${beacon.knownAddresses[0].toString()} with major=${beacon.major}, minor=${beacon.minor}`);
                            } else {
                                logger.log("info", `Added beacon ${beacon.knownAddresses[0].toString()}`);
                            }
                        });
                        this.model.on('error', console.error);
                        resolve();
                    }).catch(reject);
            });
        },
        startScan(): Promise<void> {
            return new Promise((resolve, reject) => {
                const source: BLESourceNode = this.source;
                source.start().then(resolve).catch(reject);
            });
        },
        stopScan(): Promise<void> {
            return new Promise((resolve, reject) => {
                const source: BLESourceNode = this.source;
                source.stop().then(resolve).catch(reject);
            });
        }
    }
});
