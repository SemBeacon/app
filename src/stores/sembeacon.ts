import { defineStore } from 'pinia';
import { CallbackSinkNode, DataFrame, Model, ModelBuilder } from '@openhps/core';
import { BLESourceNode } from '@openhps/capacitor-bluetooth';
import { BLESemBeacon } from '@/models/BLESemBeacon';
import { BLEObject } from '@openhps/rf';

export interface SemBeaconScan {
    results: number;
}

export interface SemBeaconNamespace {
    beacons: Record<string, BLESemBeacon>;
    model: Model;
}

export interface SemBeaconState {
    namespaces: Record<string, SemBeaconNamespace>;
    source: BLESourceNode;
    model: Model | undefined;
}
  
export const useSemBeaconStore = defineStore('sembeacon', {
    state: (): SemBeaconState => ({
        namespaces: {},
        source: new BLESourceNode({
            uid: "ble",
        }),
        model: undefined
    }),
    getters: {
        findByUUID(): BLESemBeacon {
            return new BLESemBeacon();
        }
    },
    actions: {
        addBeacon(beacon: BLESemBeacon): Promise<void> {
            return new Promise((resolve, reject) => {

            });
        },
        initialize(): Promise<void> {
            return new Promise((resolve, reject) => {
                ModelBuilder.create()
                    .from(this.source as BLESourceNode)
                    .via("ble")
                    .filterObjects((object: BLEObject) => {
                        // Filter sembeacons
                        return true;
                    })
                    .to(new CallbackSinkNode((frame: DataFrame) => {
                        // Add beacons
                        frame.getObjects(BLESemBeacon).forEach(beacon => {
                            this.addBeacon(beacon);
                        });
                    }))
                    .build().then((model: Model) => {
                        resolve();
                    }).catch(reject);
            });
        },
        scan(): Promise<SemBeaconScan> {
            return new Promise((resolve, reject) => {
                
            });
        }
    }
});
