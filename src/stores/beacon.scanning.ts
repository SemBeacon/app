import { defineStore } from 'pinia';
import {
    Absolute2DPosition,
    CallbackSinkNode,
    DataFrame,
    DataSerializer,
    FrameMergeNode,
    Model,
    ModelBuilder,
    RelativeDistance,
    TimeUnit,
    WorkerNode,
} from '@openhps/core';
import { BLESourceNode, ScanMode } from '@openhps/capacitor-bluetooth';
import { BLEiBeaconSourceNode } from '@openhps/cordova-ibeacon';
import {
    BLESemBeaconBuilder,
    SemBeaconService,
    BLESemBeacon,
    SEMBEACON_FLAG_HAS_POSITION,
    SEMBEACON_FLAG_HAS_SYSTEM,
    ResolveOptions,
} from '@sembeacon/openhps';
import {
    BLEBeaconObject,
    BLEAltBeacon,
    BLEiBeacon,
    RelativeRSSI,
    BLEEddystoneTLMBuilder,
    BLEEddystoneURLBuilder,
    BLEAltBeaconBuilder,
    BLEUUID,
    BLEiBeaconBuilder,
} from '@openhps/rf';
import { useEnvironmentStore } from './environment';
import { Toast } from '@capacitor/toast';
import { useLogger } from './logger';
import { Capacitor } from '@capacitor/core';
import { ControllerState } from './types';
import { Preferences } from '@capacitor/preferences';
import { toRaw } from 'vue';
import { CapacitorPreferencesDriver } from '@openhps/capacitor-preferences';
import { Floor } from '@openhps/geospatial';
import { IriString } from '@openhps/rdf';

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
    proximityUUIDs: string[];
    namespaces: Record<string, SemBeaconNamespace>;
    sources: (BLESourceNode | BLEiBeaconSourceNode)[];
    beacons: Map<string, BLEBeaconObject>;
    beaconInfo: Map<string, Beacon>;
    state?: ControllerState;
}

let model: Model | undefined;
const beaconService = new SemBeaconService(
    new CapacitorPreferencesDriver(BLESemBeacon, {
        namespace: 'sembeacon',
    }),
    {
        urlShortener: (url: string): Promise<string> => {
            return new Promise((resolve, reject) => {
                fetch(
                    `https://s.sembeacon.org/shorten?api=Y5Y2SRZ2zo&uri=${encodeURIComponent(url)}`,
                )
                    .then((response) => {
                        resolve(response.json());
                    })
                    .catch(reject);
            });
        },
        cors: 'https://proxy.sembeacon.org/?api=xWzD9b4eRBdWz&uri=' as IriString,
        uid: 'sembeacon-service',
        timeout: 15000,
        minTimeout: 60000
    },
);

export const useBeaconStore = defineStore('beacon.scanning', {
    state: (): BeaconState => ({
        state: ControllerState.PENDING,
        proximityUUIDs: [],
        namespaces: {},
        sources: [
            new BLESourceNode({
                uid: 'ble',
                processRaw: false,
                scanMode: ScanMode.SCAN_MODE_BALANCED,
            }),
            ...(Capacitor.getPlatform() === 'ios'
                ? [
                      new BLEiBeaconSourceNode({
                          uid: 'ble-ibeacon',
                          debug: true,
                          uuids: ['53b71dca-eb49-4ba6-a697-59f3acd184b1'],
                      }),
                  ]
                : []),
        ],
        beacons: new Map(),
        beaconInfo: new Map(),
    }),
    getters: {
        service(): SemBeaconService {
            return beaconService;
        },
        worker(): WorkerNode<any, any> {
            return model.findNodeByUID('worker') as WorkerNode<any, any>;
        },
        cacheSize(): number {
            return (this.beacons as Map<string, BLEBeaconObject>).size;
        },
        isScanning(): boolean {
            return (this.sources as BLESourceNode)[0].isRunning();
        },
        isAdvertising(): boolean {
            return this.advertising;
        },
        beaconsOnFloor(): (floor: Floor) => Array<BLEBeaconObject & Beacon> {
            const environmentStore = useEnvironmentStore();
            return (floor: Floor) => {
                const spaces = Array.from(environmentStore.environments.values()).filter(
                    (space) => {
                        return space.parentUID === floor.uid;
                    },
                );
                const beacons = Array.from(this.beacons.values())
                    .filter((beacon: BLEBeaconObject) => {
                        if (beacon.parentUID) {
                            // Check if the beacon is in the current floor
                            if (
                                spaces.find((space) => space.uid === beacon.parentUID) ||
                                beacon.parentUID === floor.uid
                            ) {
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return true;
                        }
                    })
                    .map((beacon: BLEBeaconObject & Beacon) => {
                        const info = this.beaconInfo.get(beacon.uid);
                        if (info) {
                            beacon.rssi = info.rssi;
                            beacon.lastSeen = info.lastSeen;
                            beacon.distance = info.distance;
                        }
                        return beacon as BLEBeaconObject & Beacon;
                    })
                    .filter((beacon) => {
                        // Beacon has a position
                        const position = beacon.position as unknown as Absolute2DPosition;
                        return (
                            position !== undefined &&
                            position.x !== undefined &&
                            !Number.isNaN(position.x)
                        );
                    });
                return beacons;
            };
        },
        beaconsWithInfo(): Array<BLEBeaconObject & Beacon> {
            return Array.from(this.beacons.values()).map((beacon: BLEBeaconObject & Beacon) => {
                const info = this.beaconInfo.get(beacon.uid);
                if (info) {
                    beacon.rssi = info.rssi;
                    beacon.lastSeen = info.lastSeen;
                    beacon.distance = info.distance;
                }
                return beacon as BLEBeaconObject & Beacon;
            });
        },
    },
    actions: {
        populate(): void {
            Promise.all([
                BLESemBeaconBuilder.create()
                    .namespaceId(BLEUUID.fromString('77f340db-ac0d-20e8-aa3a-f656a29f236c'))
                    .instanceId('c187d748')
                    .calibratedRSSI(-56)
                    .shortResourceUri('https://bit.ly/3JsEnF9')
                    .flag(SEMBEACON_FLAG_HAS_POSITION)
                    .flag(SEMBEACON_FLAG_HAS_SYSTEM)
                    .build(),
                BLESemBeaconBuilder.create()
                    .resourceUri('https://solid.maximvdw.be/profile/card#me')
                    .instanceId(0x01)
                    .calibratedRSSI(-56)
                    .build(),
                BLESemBeaconBuilder.create()
                    .resourceUri('https://ruben.verborgh.org/profile/#me')
                    .instanceId(0x01)
                    .calibratedRSSI(-56)
                    .build(),
                BLESemBeaconBuilder.create()
                    .resourceUri('https://solid.dyn.hofmannsnet.de/jan/profile/card#me')
                    .instanceId(0x01)
                    .calibratedRSSI(-56)
                    .build(),
                BLESemBeaconBuilder.create()
                    .resourceUri('https://schmid.solidcommunity.net/profile/card#me')
                    .instanceId(0x01)
                    .calibratedRSSI(-56)
                    .build(),
                BLEiBeaconBuilder.create()
                    .proximityUUID(BLEUUID.fromString('77f340db-ac0d-20e8-aa3a-f656a29f236c'))
                    .calibratedRSSI(-56)
                    .major(51243)
                    .minor(14124)
                    .build(),
                BLEAltBeaconBuilder.create()
                    .proximityUUID(BLEUUID.fromString('77f340db-ac0d-20e8-aa3a-f656a29f236c'))
                    .major(51243)
                    .manufacturerId(0x0118)
                    .minor(14124)
                    .calibratedRSSI(-56)
                    .build(),
                BLEEddystoneURLBuilder.create()
                    .calibratedRSSI(-56)
                    .url('https://maximvdw.be')
                    .build(),
                BLEEddystoneTLMBuilder.create()
                    .calibratedRSSI(-56)
                    .voltage(3215)
                    .temperature(25.91)
                    .uptime(5)
                    .advertiseCount(100)
                    .build(),
            ]).then((beacons) => {
                beacons.forEach((beacon: any) => {
                    beacon.uid = beacon.computeUID();
                    const beaconInfo = {
                        lastSeen: Date.now(),
                        rssi: -64,
                        distance: 1.5,
                    };
                    this.beaconInfo.set(beacon.uid, beaconInfo);
                    this.addBeacon(beacon);
                });
            });
        },
        findBeaconInfo(uid: string): Beacon {
            return this.beaconInfo.get(uid);
        },
        findByUID(uid: string): Promise<BLEBeaconObject> {
            return new Promise((resolve) => {
                if (!model) {
                    return new Promise((resolve) => resolve(undefined));
                }
                const service = model.findService(SemBeaconService);
                service
                    .findByUID(uid)
                    .then((beacon) => {
                        resolve(beacon);
                    })
                    .catch(() => {
                        resolve(undefined);
                    });
            });
        },
        findByNamespace(namespace: string): BLESemBeacon[] {
            return this.namespaces[namespace as any].beacons as BLESemBeacon[];
        },
        addBeacon(beacon: BLEBeaconObject): Promise<void> {
            return new Promise((resolve, reject) => {
                const logger = useLogger();
                const environmentStore = useEnvironmentStore();
                const service = model.findService(SemBeaconService);
                if (beacon instanceof BLESemBeacon) {
                    if (beacon.namespaceId === undefined || beacon.instanceId === undefined) {
                        return reject(new Error('SemBeacon is missing namespace or instance ID'));
                    }
                    // Add SemBeacon namespace structure
                    const namespace = this.namespaces[beacon.namespaceId.toString()] ?? {
                        beacons: {},
                        model: undefined,
                    };
                    this.namespaces[beacon.namespaceId.toString()] = namespace;
                    logger.log(
                        'info',
                        `Detecting SemBeacon with URI=${beacon.shortResourceUri}, NS=${beacon.namespaceId.toString()}, ID=${beacon.instanceId.toString()}`,
                    );
                    service
                        .insert(beacon.uid, beacon)
                        .then((insertedBeacon: BLEBeaconObject) => {
                            if (
                                insertedBeacon &&
                                insertedBeacon instanceof BLESemBeacon &&
                                insertedBeacon.resourceData
                            ) {
                                namespace.beacons[insertedBeacon.instanceId.toString()] =
                                    insertedBeacon;
                                environmentStore.fetchEnvironments(insertedBeacon.resourceData);
                                if (
                                    insertedBeacon.createdTimestamp ===
                                    insertedBeacon.modifiedTimestamp
                                ) {
                                    Toast.show({
                                        text: `Detected new nearby SemBeacon!`,
                                    });
                                }
                                logger.log(
                                    'info',
                                    `Retrieved information for SemBeacon ${insertedBeacon.resourceUri}`,
                                );
                            }
                            return Promise.resolve();
                        })
                        .finally(() => {
                            this.save().then(resolve).catch(reject);
                        });
                } else {
                    if (beacon instanceof BLEiBeacon) {
                        const uuidStr = beacon.proximityUUID.toString();
                        if (!this.proximityUUIDs.includes(uuidStr)) {
                            this.proximityUUIDs.push(uuidStr);
                            // Update source node
                        }
                    }
                    service.insert(beacon.uid, beacon);
                    this.save().then(resolve).catch(reject);
                }
            });
        },
        initialize(): Promise<void> {
            return new Promise((resolve, reject) => {
                this.state = ControllerState.INITIALIZING;
                const logger = useLogger();
                logger.log('info', 'Initializing beacon scanner model ...');
                beaconService.logger = (level: string, message: string) =>
                    logger.log(level, message);
                ModelBuilder.create()
                    .withLogger(logger.log)
                    .addService(beaconService)
                    .from(...this.sources)
                    .via(
                        new FrameMergeNode(
                            (frame) => frame.source.uid,
                            (frame) => frame.uid,
                            {
                                timeout: 500, // After 500ms, push the frame
                                timeoutUnit: TimeUnit.MILLISECOND,
                                minCount: 1, // Minimum amount of frames to receive
                                maxCount: 50, // Max count can be as big as you want
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
                                        existingObject?: BLESemBeacon
                                    ) => {
                                        return new Promise((resolve, reject) => {
                                            const service = model.findDataService(
                                                'sembeacon-worker-service',
                                            ) as unknown as SemBeaconService;
                                            service
                                                .resolve(object, options, existingObject)
                                                .then((result) => {
                                                    resolve(result);
                                                })
                                                .catch(reject);
                                        });
                                    },
                                },
                            ],
                        }),
                    )
                    .to(
                        new CallbackSinkNode(
                            (frame: DataFrame) => {
                                // Add beacons
                                frame.getObjects().forEach((beacon: BLEBeaconObject) => {
                                    if (beacon instanceof BLEBeaconObject) {
                                        const relativeRSSI = frame.source.getRelativePosition(
                                            beacon.uid,
                                            RelativeRSSI.name,
                                        ) as RelativeRSSI;
                                        const relativeDistance = frame.source.getRelativePosition(
                                            beacon.uid,
                                            RelativeDistance.name,
                                        ) as RelativeDistance;
                                        const beaconInfo = {
                                            lastSeen: Date.now(),
                                            rssi: relativeRSSI ? relativeRSSI.rssi : undefined,
                                            distance: relativeDistance
                                                ? Math.round(
                                                      relativeDistance.referenceValue * 100,
                                                  ) / 100
                                                : undefined,
                                        };
                                        this.beaconInfo.set(beacon.uid, beaconInfo);
                                        this.addBeacon(beacon);
                                    }
                                });
                            },
                            {
                                persistence: false, // Already done using "addBeacon"
                            },
                        ),
                    )
                    .build()
                    .then((m: Model) => {
                        model = m;
                        logger.log('info', 'Initialized beacon scanner model');
                        const service = model.findService<SemBeaconService>(SemBeaconService);
                        service.on('beacon', (beacon: BLEBeaconObject) => {
                            this.beacons.set(beacon.uid, beacon);
                            if (beacon instanceof BLESemBeacon) {
                                logger.log(
                                    'info',
                                    `Added SemBeacon ${
                                        beacon.uid
                                    } with namespace=${beacon.namespaceId.toString()}, instance=${beacon.instanceId.toString()}`,
                                );
                            } else if (beacon instanceof BLEiBeacon) {
                                logger.log(
                                    'info',
                                    `Added iBeacon ${beacon.uid} with major=${beacon.major}, minor=${beacon.minor}`,
                                );
                            } else if (beacon instanceof BLEAltBeacon) {
                                logger.log(
                                    'info',
                                    `Added AltBeacon ${beacon.uid} with major=${beacon.major}, minor=${beacon.minor}`,
                                );
                            } else {
                                logger.log('info', `Added beacon ${beacon.uid}`);
                            }
                        });
                        model.on('error', console.error);
                        this.state = ControllerState.READY;

                        service.resolve = (object: BLESemBeacon, options: ResolveOptions, existingObject?: BLESemBeacon) => {
                            logger.log(
                                'debug',
                                `Resolving SemBeacon (${object.resourceUri ?? object.shortResourceUri}) on worker`,
                            );
                            return this.worker.invokeMethod('resolve', object, options, existingObject);
                        };

                        return this.load();
                    })
                    .then(() => {
                        if (Capacitor.getPlatform() === 'web' && this.beaconInfo.size === 0) {
                            this.populate();
                        }
                        resolve();
                    })
                    .catch((error: Error) => {
                        this.state = ControllerState.NO_PERMISSION;
                        reject(error);
                    });
            });
        },
        startScan(): Promise<void> {
            return new Promise((resolve, reject) => {
                const logger = useLogger();
                logger.log('info', 'Starting BLE scan ...');
                const sources: BLESourceNode[] = this.sources;
                Promise.all(
                    sources.map((source) => {
                        return source.start();
                    }),
                )
                    .then(() => resolve())
                    .catch(reject);
            });
        },
        stopScan(): Promise<void> {
            return new Promise((resolve, reject) => {
                const logger = useLogger();
                logger.log('info', 'Stopping BLE scan ...');
                const sources: BLESourceNode[] = this.sources;
                Promise.all(
                    sources.map((source) => {
                        return source.stop();
                    }),
                )
                    .then(() => resolve())
                    .catch(reject);
            });
        },
        clear(): void {
            const environmentStore = useEnvironmentStore();

            environmentStore.clear();
            this.namespaces = {};
            this.beacons = new Map();
            this.beaconInfo = new Map();
            const service = model.findService(SemBeaconService);
            service.deleteAll();
            this.save();
        },
        load(): Promise<void> {
            return new Promise((resolve, reject) => {
                const environmentStore = useEnvironmentStore();

                Preferences.get({
                    key: 'beacon.scanning',
                })
                    .then((result) => {
                        if (result.value && result.value !== 'undefined') {
                            const data = JSON.parse(result.value);
                            if (data) {
                                const beacons: { [k: string]: any } =
                                    DataSerializer.deserialize(data);
                                this.beaconInfo = new Map(Object.entries(beacons));
                                beaconService
                                    .findAll()
                                    .then((storedBeacons) => {
                                        storedBeacons.forEach((b) => {
                                            this.beacons.set(b.uid, b);
                                        });
                                        return environmentStore.load();
                                    })
                                    .then(() => {
                                        resolve();
                                    })
                                    .catch(reject);
                            }
                        } else {
                            resolve();
                        }
                    })
                    .catch(reject);
            });
        },
        save(): Promise<void> {
            return new Promise((resolve, reject) => {
                const logger = useLogger();
                logger.log('info', 'Saving beacons and environments ...');
                const environmentStore = useEnvironmentStore();

                const serialized = DataSerializer.serialize(
                    Object.fromEntries(toRaw(this.beaconInfo).entries()),
                );
                Preferences.set({
                    key: 'beacon.scanning',
                    value: JSON.stringify(serialized),
                })
                    .then(() => {
                        return environmentStore.save();
                    })
                    .then(resolve)
                    .catch(reject);
            });
        },
    },
});
