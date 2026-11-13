import {
    CallbackSinkNode,
    DataFrame,
    FrameMergeNode,
    Model,
    ModelBuilder,
    RelativeDistance,
    TimeUnit,
    WorkerNode,
} from '@openhps/core';
import { BLESourceNode, ScanMode } from '@openhps/capacitor-bluetooth';
import { BLEiBeaconSourceNode } from '@openhps/cordova-ibeacon';
import { BLESemBeacon, ResolveOptions, ResolveResult, SemBeaconService } from '@sembeacon/openhps';
import { BLEBeaconObject, RelativeRSSI } from '@openhps/rf';

/** Latest scan measurement of a beacon. */
export interface ScanInfo {
    rssi: number;
    lastSeen: number;
    distance: number;
    /** Set when the SemBeacon resource could not be resolved. */
    resolutionError?: 'offline' | 'failed';
}

export type Logger = (level: string, message: string, error?: Error) => void;

/** Eddystone service UUID: iOS only reports BLE devices for UUIDs it was asked for. */
const EDDYSTONE_SERVICE = '0000feaa-0000-1000-8000-00805f9b34fb';

/**
 * Bluetooth scanning pipeline: hardware sources → frame merging → classification and
 * SemBeacon resolution in Web Workers → callback with each detected beacon.
 *
 * Holds driver objects, so it must stay outside reactive (Pinia) state.
 */
export class BeaconScanner {
    readonly sources: (BLESourceNode | BLEiBeaconSourceNode)[];
    private model?: Model;

    constructor(platform: string) {
        this.sources = [
            new BLESourceNode({
                uid: 'ble',
                processRaw: false,
                scanMode: ScanMode.SCAN_MODE_BALANCED,
                uuids: platform === 'ios' ? [EDDYSTONE_SERVICE] : undefined,
            }),
            // iOS hides iBeacons from BLE scans; Core Location ranging needs their UUIDs
            ...(platform === 'ios'
                ? [new BLEiBeaconSourceNode({ uid: 'ble-ibeacon', debug: true, uuids: [] })]
                : []),
        ];
    }

    get isBuilt(): boolean {
        return this.model !== undefined;
    }

    /**
     * Build the OpenHPS model. Rejects when the platform lacks Bluetooth scanning (Capacitor
     * error code UNAVAILABLE) or permissions are missing.
     */
    async build(
        service: SemBeaconService,
        logger: Logger,
        onBeacon: (beacon: BLEBeaconObject, info: ScanInfo) => void,
    ): Promise<void> {
        const model = await ModelBuilder.create()
            .withLogger(logger)
            .addService(service)
            .from(...(this.sources as BLESourceNode[]))
            .via(
                new FrameMergeNode(
                    (frame) => frame.source.uid,
                    (frame) => frame.uid,
                    {
                        timeout: 500, // Push merged frames after 500ms
                        timeoutUnit: TimeUnit.MILLISECOND,
                        minCount: 1,
                        maxCount: 50,
                    },
                ),
            )
            .via(
                new WorkerNode('/js/workers/BLEScannerWorker.worker.js', {
                    uid: 'worker',
                    poolSize: 4,
                    type: 'module',
                    worker: '/js/vendor/openhps/worker.openhps-core.es.min.js',
                    methods: [
                        {
                            name: 'resolve',
                            handler: (
                                model: Model,
                                object: BLESemBeacon,
                                options: ResolveOptions,
                                existingObject?: BLESemBeacon,
                            ) => {
                                const workerService = model.findDataService(
                                    'sembeacon-worker-service',
                                ) as unknown as SemBeaconService;
                                return workerService.resolve(object, options, existingObject);
                            },
                        },
                    ],
                }),
            )
            .to(
                new CallbackSinkNode(
                    (frame: DataFrame) => {
                        frame.getObjects().forEach((beacon) => {
                            if (beacon instanceof BLEBeaconObject) {
                                onBeacon(beacon, scanInfo(frame, beacon));
                            }
                        });
                    },
                    // Persistence is done by the caller
                    { persistence: false },
                ),
            )
            .build();
        model.on('error', (error: Error) => logger('error', error.message, error));
        this.model = model;

        // Resolve SemBeacon resources on a worker instead of the UI thread
        const worker = model.findNodeByUID('worker') as WorkerNode<any, any>;
        const modelService = model.findService(SemBeaconService) as SemBeaconService;
        modelService.resolve = (object, options, existingObject) => {
            logger(
                'debug',
                `Resolving SemBeacon (${object.resourceUri ?? object.shortResourceUri}) on worker`,
            );
            return worker.invokeMethod(
                'resolve',
                object,
                options,
                existingObject,
            ) as unknown as Promise<ResolveResult>;
        };
    }

    /** UUIDs to range for on iOS (iBeacon / SemBeacon namespaces). */
    async setProximityUUIDs(uuids: string[]): Promise<void> {
        const iBeaconSource = this.sources.find((s) => s instanceof BLEiBeaconSourceNode);
        if (iBeaconSource) {
            await (iBeaconSource as BLEiBeaconSourceNode).setProximityUUIDs(uuids);
        }
    }

    async start(): Promise<void> {
        await Promise.all(this.sources.map((source) => source.start()));
    }

    async stop(): Promise<void> {
        await Promise.all(this.sources.map((source) => source.stop()));
    }
}

function scanInfo(frame: DataFrame, beacon: BLEBeaconObject): ScanInfo {
    const rssi = frame.source.getRelativePosition(beacon.uid, RelativeRSSI.name) as RelativeRSSI;
    const distance = frame.source.getRelativePosition(
        beacon.uid,
        RelativeDistance.name,
    ) as RelativeDistance;
    return {
        lastSeen: Date.now(),
        rssi: rssi?.rssi,
        distance: distance ? Math.round(distance.referenceValue * 100) / 100 : undefined,
    };
}
