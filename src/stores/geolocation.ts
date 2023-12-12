import { defineStore } from 'pinia';
import {
    AbsoluteOrientationSensor,
    CallbackSinkNode,
    DataFrame,
    DataObject,
    GeographicalPosition,
    GraphBuilder,
    Model,
    ModelBuilder,
    TimeUnit,
} from '@openhps/core';
import { GeolocationSourceNode } from '@openhps/capacitor-geolocation';
import { Capacitor } from '@capacitor/core';
import { ControllerState } from './types';
import { SensorSourceNode } from '@openhps/capacitor-sensors';

export const useGeolocationStore = defineStore('geolocation', {
    state: () => ({
        position: undefined,
        model: undefined,
        sources: [
            new GeolocationSourceNode({
                interval: 15000,
                source: new DataObject('phone'),
            }),
            new SensorSourceNode({
                interval: 500,
                sensors: [AbsoluteOrientationSensor],
                source: new DataObject('phone'),
            }),
        ],
        state: ControllerState.PENDING,
    }),
    getters: {
        location(): GeographicalPosition {
            return this.position;
        },
    },
    actions: {
        start(): void {
            this.sources[0].start();
            this.sources[1].start();
        },
        stop(): void {
            this.sources[0].stop();
            this.sources[1].stop();
        },
        initialize(): Promise<void> {
            this.state = ControllerState.INITIALIZING;
            return new Promise((resolve, reject) => {
                ModelBuilder.create()
                    .addShape(
                        GraphBuilder.create()
                            .from(this.sources[1])
                            .debounce(500, TimeUnit.MILLISECOND)
                            .to('orientation'),
                    )
                    .from(this.sources[0], 'orientation')
                    .to(
                        new CallbackSinkNode((frame: DataFrame) => {
                            const position = frame.source.position;
                            const orientation = frame.getSensor(AbsoluteOrientationSensor);

                            if (position) {
                                if (orientation) {
                                    position.orientation = orientation.value;
                                } else if (this.position) {
                                    position.orientation = this.position.orientation;
                                }
                                this.position = position;
                            }
                        }),
                    )
                    .build()
                    .then((model: Model) => {
                        this.model = model;
                        this.model.on('error', console.error);
                        if (Capacitor.getPlatform() === 'web') {
                            return resolve();
                        } else {
                            return Promise.all([
                                GeolocationSourceNode.requestPermissions(),
                                SensorSourceNode.requestPermissions([AbsoluteOrientationSensor]),
                            ]);
                        }
                    })
                    .then(() => {
                        this.state = ControllerState.READY;
                        resolve();
                    })
                    .catch((err) => {
                        this.state = ControllerState.NO_PERMISSION;
                        reject(err);
                    });
            });
        },
    },
});
