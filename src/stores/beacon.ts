import { defineStore } from 'pinia';
import { CallbackSinkNode, DataFrame, Model, ModelBuilder } from '@openhps/core';
import { BLESourceNode } from '@openhps/capacitor-bluetooth';
import { BLESemBeacon } from '@/models/BLESemBeacon';
import { 
    BLEBeaconObject, 
    BLEBeaconClassifierNode, 
    BLEAltBeacon,
    BLEiBeacon,
    BLEEddystoneUID,
    BLEEddystoneURL,
    BLEObject
} from '@openhps/rf';
import { SemBeaconService } from '@/services/SemBeaconService';

export interface BeaconScan {
    results: number;
}

export interface SemBeaconNamespace {
    beacons: Record<string, BLESemBeacon>;
    model: Model;
}

export interface BeaconState {
    namespaces: Record<string, SemBeaconNamespace>;
    source: BLESourceNode;
    model: Model | undefined;
    beacons: Map<string, BLEBeaconObject>;
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
        findByUUID(): BLESemBeacon {
            return new BLESemBeacon();
        },
        isScanning(): boolean {
            return (this.source as BLESourceNode).isRunning();
        }
    },
    actions: {
        addBeacon(beacon: BLEBeaconObject): Promise<void> {
            return new Promise((resolve) => {
                if (beacon instanceof BLESemBeacon) {
                    // Add SemBeacon namespace structure
                } else if (beacon instanceof BLEAltBeacon) {
                    console.log(beacon)
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
                    .addService(new SemBeaconService())
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
                        frame.getObjects(BLEObject)
                            .forEach(beacon => {
                                this.addBeacon(beacon);
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
