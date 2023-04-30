import { defineStore } from 'pinia';
import { CallbackSinkNode, DataFrame, GeographicalPosition, Model, ModelBuilder } from '@openhps/core';
import { GeolocationSourceNode } from '@openhps/capacitor-geolocation';

export const useGeolocationStore = defineStore('geolocation', {
    state: () => ({
        position: undefined,
        model: undefined,
        source: new GeolocationSourceNode()
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
                ModelBuilder.create()
                    .from(this.source)
                    .to(new CallbackSinkNode((frame: DataFrame) => {
                        this.position = frame.source.position;
                    }))
                    .build().then((model: Model) => {
                        this.model = model;
                        this.model.on('error', console.error);
                        resolve();
                    }).catch(reject);
            });
        }
    }
});