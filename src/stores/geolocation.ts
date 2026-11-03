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
import { SensorSourceNode } from '@openhps/capacitor-sensors';
import { Capacitor } from '@capacitor/core';
import { ControllerState } from './types';
import { useLogger } from './logger';
import type { Raw } from 'vue';

// Driver objects: not reactive state
const geolocationSource = new GeolocationSourceNode({
    interval: 15000,
    source: new DataObject('phone'),
});
const orientationSource = new SensorSourceNode({
    interval: 500,
    sensors: [AbsoluteOrientationSensor],
    source: new DataObject('phone'),
});
let model: Model | undefined;

export const useGeolocationStore = defineStore('geolocation', {
    state: () => ({
        // Raw<> keeps the class type (Pinia's state typing would unwrap it)
        position: undefined as Raw<GeographicalPosition> | undefined,
        running: false,
        state: ControllerState.PENDING,
    }),
    getters: {
        location(): GeographicalPosition | undefined {
            return this.position;
        },
    },
    actions: {
        async start(): Promise<void> {
            this.running = true;
            if (Capacitor.getPlatform() === 'ios') {
                await SensorSourceNode.requestPermissions();
            }
            await Promise.all([geolocationSource.start(), orientationSource.start()]);
        },
        async stop(): Promise<void> {
            this.running = false;
            await Promise.all([geolocationSource.stop(), orientationSource.stop()]);
        },
        /** Position (every 15 s) combined with the latest device orientation. */
        async initialize(): Promise<void> {
            const logger = useLogger();
            this.state = ControllerState.INITIALIZING;
            try {
                model = await ModelBuilder.create()
                    .addShape(
                        GraphBuilder.create()
                            .from(orientationSource)
                            .debounce(500, TimeUnit.MILLISECOND)
                            .to('orientation'),
                    )
                    .from(geolocationSource, 'orientation')
                    .to(
                        new CallbackSinkNode((frame: DataFrame) => {
                            const position = frame.source.position as GeographicalPosition;
                            if (!position) {
                                return;
                            }
                            const orientation = frame.getSensor(AbsoluteOrientationSensor);
                            position.orientation = orientation
                                ? orientation.value
                                : this.position?.orientation;
                            this.position = position;
                        }),
                    )
                    .build();
                model.on('error', console.error);
                if (Capacitor.getPlatform() !== 'web') {
                    await Promise.all([
                        GeolocationSourceNode.requestPermissions(),
                        SensorSourceNode.requestPermissions([AbsoluteOrientationSensor]),
                    ]);
                }
                logger.log('info', 'Geolocation initialized successfully');
                this.state = ControllerState.READY;
            } catch (err) {
                logger.log('error', `Geolocation initialization failed: ${err.message}`);
                this.state = ControllerState.NO_PERMISSION;
                throw err;
            }
        },
    },
});
