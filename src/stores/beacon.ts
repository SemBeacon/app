import { defineStore } from 'pinia';
import { CallbackNode, CallbackSinkNode, DataFrame, Model, ModelBuilder } from '@openhps/core';
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
    beacons: Map<string, BLEBeaconObject & Beacon>;
}
  
export const useBeaconStore = defineStore('beacon', {
    state: (): BeaconState => ({
        namespaces: {},
        source: new BLESourceNode({
            uid: "ble",
        }),
        beacons: new Map(),
        model: undefined
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
        findByUID(uid: string): BLESemBeacon & Beacon {
            return this.beacons.get(uid);
        },
        findByNamespace(namespace: string): BLESemBeacon[] {
            return this.namespaces[namespace as any].beacons as BLESemBeacon[];
        },
        addBeacon(beacon: BLEBeaconObject & Beacon): Promise<void> {
            return new Promise((resolve) => {
                const service = this.model.findDataService(SemBeaconService);
                if (beacon instanceof BLESemBeacon) {
                    // Add SemBeacon namespace structure
                    const namespace = this.namespaces[beacon.namespaceId.toString()] ?? {
                        beacons: {},
                        model: undefined
                    };
                    this.namespaces[beacon.namespaceId.toString()] = namespace;
                    namespace.beacons[beacon.instanceId.toString()] = beacon;
                    service.insertObject(beacon);
                }
                // Add beacon to output
                this.beacons.set(beacon.uid, beacon);
                resolve();
            });
        },
        initialize(): Promise<void> {
            return new Promise((resolve, reject) => {
                ModelBuilder.create()
                    //.withLogger(console.log)
                    .addService(new SemBeaconService(new LocalStorageDriver(BLESemBeacon)))
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
                            .forEach((beacon: BLEBeaconObject & Beacon) => {
                                if (beacon instanceof BLEBeaconObject) {
                                    const relativeRSSI: RelativeRSSI = frame.source.getRelativePosition(beacon.uid) as RelativeRSSI;
                                    beacon.lastSeen = Date.now();
                                    if (relativeRSSI) {
                                        beacon.rssi = relativeRSSI.rssi;
                                    }
                                    this.addBeacon(beacon);
                                }
                            });
                    }))
                    .build().then((model: Model) => {
                        this.model = model;
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
