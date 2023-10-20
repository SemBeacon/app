import { defineStore } from 'pinia';
import { CallbackNode, CallbackSinkNode, DataFrame, Model, ModelBuilder, RelativeDistance } from '@openhps/core';
import { BLESourceNode } from '@openhps/capacitor-bluetooth';
import { BLESemBeacon, SEMBEACON_FLAG_HAS_POSITION, SEMBEACON_FLAG_HAS_SYSTEM } from '@/models/BLESemBeacon';
import { 
    BLEBeaconObject, 
    BLEBeaconClassifierNode, 
    BLEAltBeacon,
    BLEiBeacon,
    BLEEddystoneUID,
    BLEEddystoneURL,
    RelativeRSSI,
    RelativeRSSIProcessing,
    PropagationModel,
    BLEUUID,
    BLEEddystoneTLM,
    BLEEddystone,
    BLEObject,
} from '@openhps/rf';
import { SemBeaconService } from '@/services/SemBeaconService';
import { LocalStorageDriver } from '@openhps/localstorage';
import { useEnvironmentStore } from './environment';
import { Toast } from '@capacitor/toast';
import { useLogger } from './logger';
import { BLESemBeaconBuilder } from '@/models/BLESemBeaconBuilder';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() !== 'web') {
    LocalNotifications.requestPermissions().then(() => {
        if (Capacitor.getPlatform() === 'android') {
            LocalNotifications.registerActionTypes({
                types: [
                    {
                        id: "sembeacon-1",
                        actions: [
                            {
                                id: "stop",
                                title: "Stop broadcasting",
                                destructive: true,
                            },
                        ]
                    }
                ]
            }).catch(console.error); 
            LocalNotifications.createChannel({
                importance: 3,
                id: 'sembeacon-advertising',
                name: "SemBeacon Advertising",
                vibration: false,
                sound: "",
                visibility: 1,
            }).catch(console.error); 
        }
    });
}

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
    namespaces: Record<string, SemBeaconNamespace>;
    source: BLESourceNode;
    model: Model | undefined;
    beacons: Map<string, BLEBeaconObject & Beacon>;
    beaconInfo: Map<string, BLEBeaconObject>;
    advertising: boolean;
}

export const useBeaconStore = defineStore('beacon', {
    state: (): BeaconState => ({
        namespaces: {},
        source: new BLESourceNode({
            uid: "ble",
            debug: false,
            // uuids: Capacitor.getPlatform() === 'ios' ? 
            //     ['0000FEAA-0000-1000-8000-00805F9B34FB'] : 
            //     undefined
        }),
        model: undefined,
        beacons: new Map(),
        beaconInfo: new Map(),
        advertising: false
    }),
    getters: {
        cacheSize(): number {
            return (this.beacons as Map<string, BLEBeaconObject>).size;
        },
        sourceNode(): BLESourceNode {
            return this.source;
        },
        isScanning(): boolean {
            return (this.source as BLESourceNode).isRunning();
        },
        isAdvertising(): boolean {
            return this.advertising;
        }
    },
    actions: {
        startAdvertising(beaconData: any): void {
            const bluetoothle = (window as any).bluetoothle;
            const logger = useLogger();
            bluetoothle.initialize(() => {
                bluetoothle.requestPermissionBtAdvertise(() => {
                    BLESemBeaconBuilder.create()
                        .namespaceId(BLEUUID.fromString(beaconData.namespaceId))
                        .instanceId(beaconData.instanceId)
                        .calibratedRSSI(-56)
                        .shortResourceUri(beaconData.shortResourceUri)
                        .flag(SEMBEACON_FLAG_HAS_POSITION)
                        .flag(SEMBEACON_FLAG_HAS_SYSTEM)
                        .build().then(beacon => {
                            const manufacturerData = beacon.manufacturerData.get(0xFFFF);
                            const service = beacon.getServiceByUUID(BLEUUID.fromString('FEAA'));
                            bluetoothle.startAdvertising(() => {
                                logger.log('info', `SemBeacon advertising started!`);
                                Toast.show({
                                    text: `Advertising of SemBeacon started!`,
                                });
                                LocalNotifications.schedule({
                                    notifications: [
                                        {
                                          title: 'SemBeacon Advertising',
                                          body: 'Broadcasting SemBeacon ...',
                                          id: 1,
                                          channelId: "sembeacon-advertising",
                                          actionTypeId: 'sembeacon-1',
                                          ongoing: true
                                        },
                                      ]
                                });
                                LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
                                    if (action.actionId == "stop") {
                                        this.stopAdvertising();
                                    }
                                });
                                this.advertising = true;
                            }, (error: any) => {
                                logger.log('error', error);
                                Toast.show({
                                    text: `Error while starting advertising! ${error.message}.`,
                                });
                            }, {
                                manufacturerId: 0xFFFF,
                                manufacturerSpecificData: bluetoothle.bytesToEncodedString(manufacturerData),
                                includeDeviceName: false,
                                includeTxPowerLevel: false,
                                connectable: false,
                                mode: 'lowLatency',
                                txPowerLevel: 'high',
                                timeout: 0,
                                discoverable: true
                            }, {
                                service: "FEAA",
                                serviceData: bluetoothle.bytesToEncodedString(service.data),
                                includeDeviceName: false,
                                includeTxPowerLevel: false,
                            });
                    });
                }, (error) => {
                    logger.log('error', error);
                    Toast.show({
                        text: `Error while requesting advertising permission! ${error.message}.`,
                    });
                });
            }, {
                request: true,
                statusReceiver: false,
                restoreKey: "sembeacon"
            });
        },
        stopAdvertising() {
            const bluetoothle = (window as any).bluetoothle;
            const logger = useLogger();
            bluetoothle.stopAdvertising(() => {
                this.advertising = false;
                Toast.show({
                    text: `Stopped advertising!`,
                });
                LocalNotifications.removeAllListeners();
                LocalNotifications.cancel({
                    notifications: [
                        {
                            id: 1
                        }
                    ]
                });
            }, (error) => {
                logger.log('error', error);
                Toast.show({
                    text: `Error while stopping advertising! ${error.message}.`,
                });
            });
        },
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
                const logger = useLogger();
                const environmentStore = useEnvironmentStore();
                const service = this.model.findDataService(SemBeaconService);
                if (beacon instanceof BLESemBeacon) {
                    // Add SemBeacon namespace structure
                    const namespace = this.namespaces[beacon.namespaceId.toString()] ?? {
                        beacons: {},
                        model: undefined
                    };
                    this.namespaces[beacon.namespaceId.toString()] = namespace;
                    logger.log("info", `Detecting SemBeacon with URI=${beacon.shortResourceUri}`);
                    service.insert(beacon.uid, beacon).then((insertedBeacon: BLEBeaconObject) => {
                        if (insertedBeacon && insertedBeacon instanceof BLESemBeacon && insertedBeacon.resourceData) {
                            namespace.beacons[insertedBeacon.instanceId.toString()] = insertedBeacon;
                            environmentStore.fetchEnvironments(insertedBeacon.resourceData);
                            Toast.show({
                                text: `Detected nearby SemBeacon!`,
                            });
                            logger.log("info", `Retrieved information for SemBeacon ${beacon.resourceUri}`);
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
                const logger = useLogger();
                logger.log('info', 'Initializing beacon scanner model ...');
                ModelBuilder.create()
                    .addService(new SemBeaconService(
                        new LocalStorageDriver(BLESemBeacon, {
                            namespace: "sembeacon",
                        }), 
                        {
                            accessToken: "2cd7bc12126759042bfb3ebe1160aafda0bc65df",
                            cors: true
                        }))
                    .from(this.source as BLESourceNode)
                    .via(new CallbackNode(frame => {
                        const object: BLEObject = frame.getObjects().filter(o => o.uid !== frame.source.uid)[0];
                        if (object.manufacturerData.size > 0) {
                            console.log(object)
                        }
                    }))
                    .via(new BLEBeaconClassifierNode({
                        resetUID: true,
                        types: [
                            BLESemBeacon,
                            BLEAltBeacon,
                            BLEiBeacon,
                            BLEEddystoneURL,
                            BLEEddystoneUID,
                            BLEEddystoneTLM,
                        ]
                    }))
                    .via(new RelativeRSSIProcessing({
                        environmentFactor: 2.0,
                        propagationModel: PropagationModel.LOG_DISTANCE
                    }))
                    .to(new CallbackSinkNode((frame: DataFrame) => {
                        // Add beacons
                        frame.getObjects()
                            .forEach((beacon: BLEBeaconObject) => {
                                if (beacon instanceof BLEBeaconObject) {
                                    const relativeRSSI = frame.source.getRelativePosition(beacon.uid, RelativeRSSI.name) as RelativeRSSI;
                                    const relativeDistance = frame.source.getRelativePosition(beacon.uid, RelativeDistance.name) as RelativeDistance;
                                    const beaconInfo = {
                                        lastSeen: Date.now(),
                                        rssi: relativeRSSI ? relativeRSSI.rssi : undefined,
                                        distance: relativeDistance ? Math.round(relativeDistance.referenceValue * 100) / 100 : undefined
                                    };
                                    this.beaconInfo.set(beacon.uid, beaconInfo);
                                    if (beacon instanceof BLESemBeacon) {
                                        logger.log("info", `Detected SemBeacon ${beacon.uid} with namespace=${beacon.namespaceId.toString()}, instance=${beacon.instanceId.toString()}, RSSI=${beaconInfo.rssi}, distance=${beaconInfo.distance}`);
                                    } else if (beacon instanceof BLEiBeacon) {
                                        logger.log("info", `Detected iBeacon ${beacon.uid} with major=${beacon.major}, minor=${beacon.minor}, RSSI=${beaconInfo.rssi}, distance=${beaconInfo.distance}`);
                                    } else if (beacon instanceof BLEEddystone) {
                                        logger.log("info", `Detected Eddystone ${beacon.uid} with RSSI=${beaconInfo.rssi} and distance=${beaconInfo.distance}`);
                                    } else {
                                        logger.log("info", `Detected beacon ${beacon.uid} with RSSI=${beaconInfo.rssi} and distance=${beaconInfo.distance}`);
                                    }
                                    this.addBeacon(beacon);
                                }
                            });
                    }, {
                        persistence: false  // Already done using "addBeacon"
                    }))
                    .build().then((model: Model) => {
                        this.model = model;
                        logger.log('info', 'Initialized beacon scanning model.');
                        const service = this.model.findDataService(SemBeaconService);
                        service.on('beacon', (beacon) => {
                            const info = this.beaconInfo.get(beacon.uid);
                            if (info) {
                                beacon.rssi = info.rssi;
                                beacon.distance = info.distance;
                                beacon.lastSeen = info.lastSeen;
                            } else {
                                beacon.rssi = undefined;
                                beacon.distance = undefined;
                                beacon.lastSeen = undefined;
                            }
                            console.log("Beacon", beacon);
                            this.beacons.set(beacon.uid, beacon);
                            if (beacon instanceof BLESemBeacon) {
                                logger.log("info", `Added SemBeacon ${beacon.uid} with namespace=${beacon.namespaceId.toString()}, instance=${beacon.instanceId.toString()}`);
                            } else if (beacon instanceof BLEiBeacon) {
                                logger.log("info", `Added iBeacon ${beacon.uid} with major=${beacon.major}, minor=${beacon.minor}`);
                            } else {
                                logger.log("info", `Added beacon ${beacon.uid}`);
                            }
                        });
                        this.model.on('error', console.error);
                        resolve();
                    }).catch(reject);
            });
        },
        startScan(): Promise<void> {
            return new Promise((resolve, reject) => {
                const logger = useLogger();
                logger.log('info', 'Starting BLE scan ...');
                const source: BLESourceNode = this.source;
                source.start().then(resolve).catch(reject);
            });
        },
        stopScan(): Promise<void> {
            return new Promise((resolve, reject) => {
                const logger = useLogger();
                logger.log('info', 'Stopping BLE scan ...');
                const source: BLESourceNode = this.source;
                source.stop().then(resolve).catch(reject);
            });
        },
        clear(): void {
            this.namespaces = {};
            this.beacons = new Map();
            this.beaconInfo = new Map();
            const service = this.model.findDataService(SemBeaconService);
            service.deleteAll();
        }
    }
});
