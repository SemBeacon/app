import { defineStore } from 'pinia';
import { CallbackSinkNode, DataFrame, GeographicalPosition, Model, ModelBuilder } from '@openhps/core';
import { GeolocationSourceNode } from '@openhps/capacitor-geolocation';
import { Capacitor } from '@capacitor/core';

export const useGeolocationStore = defineStore('geolocation', {
    state: () => ({
        position: undefined,
        model: undefined,
        source: new GeolocationSourceNode({
            interval: 15000,
        })
    }),
    getters: {
        sourceNode(): GeolocationSourceNode {
            return this.source;
        },
        location(): GeographicalPosition {
            return this.position;
        }
    },
    actions: {
        initialize(): Promise<void> {
            return new Promise((resolve, reject) => {
                if (this.model !== undefined) {
                    return resolve();
                }
                ModelBuilder.create()
                    .from(this.source)
                    .to(new CallbackSinkNode((frame: DataFrame) => {
                        if (this.position === undefined || this.position.distanceTo(frame.source.position) > 5) {
                            console.log("Updating geolocation position");
                            this.position = frame.source.position;
                        } else {
                            console.log("Skipping update of geolocation position due to no change");
                        }
                    }))
                    .build().then((model: Model) => {
                        this.model = model;
                        this.model.on('error', console.error);
                        if (Capacitor.getPlatform() === 'web') {
                            return resolve();
                        } else {
                            return GeolocationSourceNode.requestPermissions();
                        }
                    }).then(() => resolve()).catch(reject);
            });
        }
    }
});
