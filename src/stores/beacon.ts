import { defineStore } from 'pinia';
import { CallbackNode, CallbackSinkNode, DataFrame, MemoryDataService, Model, ModelBuilder, WorkerNode } from '@openhps/core';
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
} from '@openhps/rf';
import { SemBeaconService } from '@/services/SemBeaconService';
import { LocalStorageDriver } from '@openhps/localstorage';
import { useEnvironmentStore } from './environment';
import { Toast } from '@capacitor/toast';

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
}

export interface BeaconState {
    namespaces: Record<string, SemBeaconNamespace>;
    source: BLESourceNode;
    model: Model | undefined;
    beaconInfo: Map<string, Beacon>;
    beaconObjects: Map<string, BLEBeaconObject>;
}

export const useBeaconStore = defineStore('beacon', {
    state: (): BeaconState => ({
        namespaces: {},
        source: new BLESourceNode({
            uid: "ble"
        }),
        model: undefined,
        beaconObjects: new Map(),
        beaconInfo: new Map()
    }),
    getters: {
        beacons(): Array<BLEBeaconObject & Beacon> {
            return Array.from((this.beaconObjects as Map<string, BLEBeaconObject>).values()).map((beacon: any) => {
                const info = this.beaconInfo.get(beacon.uid);
                if (info) {
                    beacon.rssi = info.rssi;
                    beacon.lastSeen = info.lastSeen;
                }
                return beacon;
            }) as Array<BLEBeaconObject & Beacon>;
        },
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
                const environmentStore = useEnvironmentStore();
                const service = this.model.findDataService(SemBeaconService);
                if (beacon instanceof BLESemBeacon) {
                    // Add SemBeacon namespace structure
                    const namespace = this.namespaces[beacon.namespaceId.toString()] ?? {
                        beacons: {},
                        model: undefined
                    };
                    this.namespaces[beacon.namespaceId.toString()] = namespace;
                    service.insert(beacon.uid, beacon).then((insertedBeacon: BLESemBeacon) => {
                        if (insertedBeacon && insertedBeacon.resourceData) {
                            namespace.beacons[insertedBeacon.instanceId.toString()] = insertedBeacon;
                            environmentStore.fetchEnvironments(insertedBeacon.resourceData);
                            Toast.show({
                                text: `Detected nearby SemBeacon!`,
                            })
                        } else if (beacon) {
                            // Detected SemBeacon but no instance id
                            console.warn(`Detected nearby SemBeacon but could not fetch additional information!`, beacon);
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
                ModelBuilder.create()
                    //.withLogger(console.log)
                    // .addService(new SemBeaconService(new LocalStorageDriver(BLESemBeacon, {
                    //     namespace: "sembeacon",
                    // })))
                    .addService(new SemBeaconService(new MemoryDataService(BLESemBeacon)))
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
                    .to(new CallbackSinkNode((frame: DataFrame) => {
                        // Add beacons
                        frame.getObjects()
                            .forEach((beacon: BLEBeaconObject) => {
                                if (beacon instanceof BLEBeaconObject) {
                                    const relativeRSSI: RelativeRSSI = frame.source.getRelativePosition(beacon.uid) as RelativeRSSI;
                                    const beaconInfo = {
                                        lastSeen: Date.now(),
                                        rssi: relativeRSSI ? relativeRSSI.rssi : undefined
                                    };
                                    this.beaconInfo.set(beacon.uid, beaconInfo);
                                    console.log(beacon.uid, beaconInfo);
                                    this.addBeacon(beacon);
                                }
                            });
                    }, {
                        persistence: false  // Already done using "addBeacon"
                    }))
                    .build().then((model: Model) => {
                        this.model = model;
                        const service = this.model.findDataService(SemBeaconService);
                        service.on('insert', (uid, beacon) => {
                            this.beaconObjects.set(uid, beacon);
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
