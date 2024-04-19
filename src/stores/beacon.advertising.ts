import { defineStore } from 'pinia';
import {
    BLEBeaconObject,
    BLEAltBeaconBuilder,
    BLEAltBeacon,
    BLEiBeacon,
    BLEiBeaconBuilder,
    BLEEddystoneURL,
    BLEEddystoneURLBuilder,
    BLEEddystoneUIDBuilder,
    BLEEddystoneUID,
} from '@openhps/rf';
import { Toast } from '@capacitor/toast';
import { useLogger } from './logger';
import { BLESemBeaconBuilder, BLESemBeacon } from '@sembeacon/openhps';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { ControllerState } from './types';
import { Preferences } from '@capacitor/preferences';
import type { BluetoothlePlugin } from 'cordova-plugin-bluetoothle';
import { DataSerializer } from '@openhps/core';
import { toRaw } from 'vue';
import { ForegroundService } from '@capawesome-team/capacitor-android-foreground-service';
const bluetoothle = (window as any).bluetoothle as BluetoothlePlugin.Bluetoothle;

export type SimulatedBeacon = BLEBeaconObject & {
    advertising: boolean;
    latency: BluetoothlePlugin.AdvertiseMode;
    power: BluetoothlePlugin.TxPowerLevel;
};

export interface BeaconAdvertisingState {
    beacons: Map<string, SimulatedBeacon>;
    state: ControllerState;
    watchDog?: number;
}

export const useBeaconAdvertisingStore = defineStore('beacon.advertising', {
    state: (): BeaconAdvertisingState => ({
        beacons: new Map(),
        state: ControllerState.PENDING,
        watchDog: undefined
    }),
    getters: {
        advertisingBeacons(): SimulatedBeacon[] {
            return Array.from(this.beacons.values()).filter(
                (b: SimulatedBeacon) => b.advertising,
            ) as SimulatedBeacon[];
        },
    },
    actions: {
        findByUID(uid: string): SimulatedBeacon {
            return this.beacons.get(uid);
        },
        initializeNotifications(): Promise<void> {
            return new Promise((resolve) => {
                if (Capacitor.getPlatform() !== 'web') {
                    Promise.all([
                        ForegroundService.requestPermissions(),
                        LocalNotifications.requestPermissions()
                    ])
                        .then(() => {
                            if (Capacitor.getPlatform() === 'android') {
                                LocalNotifications.registerActionTypes({
                                    types: [
                                        {
                                            id: 'sembeacon-1',
                                            actions: [
                                                {
                                                    id: 'stop',
                                                    title: 'Stop broadcasting',
                                                    destructive: true,
                                                },
                                            ],
                                        },
                                    ],
                                }).catch(console.error);
                                LocalNotifications.createChannel({
                                    importance: 3,
                                    id: 'sembeacon-advertising',
                                    name: 'SemBeacon Advertising',
                                    vibration: false,
                                    sound: '',
                                    visibility: 1,
                                }).catch(console.error);
                            }
                            LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
                                if (action.actionId == 'stop') {
                                    this.stopAdvertising();
                                }
                            });
                            resolve();
                        })
                        .catch(() => {
                            resolve();
                        });
                } else {
                    resolve();
                }
            });
        },
        requestPermission(): Promise<void> {
            return new Promise((resolve, reject) => {
                const logger = useLogger();
                const platform = Capacitor.getPlatform();
                if (platform === 'android') {
                    bluetoothle.requestPermissionBtAdvertise(
                        (result) => {
                            if (!result.requestPermission) {
                                reject(new Error('No permission'));
                            } else {
                                resolve();
                            }
                        },
                        (error: BluetoothlePlugin.Error) => {
                            logger.log('error', error);
                            reject(error);
                        },
                    );
                } else if (platform === 'ios') {
                    bluetoothle.requestPermission(
                        (result) => {
                            if (!result.requestPermission) {
                                reject(new Error('No permission'));
                            } else {
                                resolve();
                            }
                        },
                        (error) => {
                            logger.log('error', error);
                            reject(error);
                        },
                    );
                } else {
                    resolve();
                }
            });
        },
        initialize(): Promise<void> {
            this.state = ControllerState.INITIALIZING;
            return new Promise((resolve, reject) => {
                const logger = useLogger();
                this.load()
                    .then(() => {
                        if (!bluetoothle) {
                            this.state = ControllerState.DISABLED;
                            return resolve();
                        }

                        logger.log('info', 'Checking advertising permissions ...');
                        return this.requestPermission();
                    })
                    .then(() => {
                        logger.log('info', 'Initializing Bluetooth advertiser ...');
                        bluetoothle.initialize(
                            (result) => {
                                if (result.status !== 'enabled') {
                                    this.state = ControllerState.DISABLED;
                                    return reject(new Error(`Bluetooth is disabled!`));
                                }
                                this.state = ControllerState.READY;
                            },
                            {
                                request: true,
                                statusReceiver: false,
                                restoreKey: 'sembeacon',
                            },
                        );
                    })
                    .catch((error: Error) => {
                        this.state = ControllerState.NO_PERMISSION;
                        reject(error);
                    });
            });
        },
        startAdvertising(beacon: SimulatedBeacon): void {
            // Extract advertisement and scan response data
            let advertisementParams: BluetoothlePlugin.AdvertisingParams = {
                identifier: beacon.computeUID(),
                includeDeviceName: false,
                includeTxPowerLevel: false,
                connectable: false,
                discoverable: true,
                mode: beacon.latency ?? "lowLatency",
                txPowerLevel: beacon.power ?? "high",
                timeout: 0,
            };
            let scanResponseParams: any = undefined;
            const manufacturerId: number =
                beacon.manufacturerData.size > 0
                    ? beacon.manufacturerData.keys().next().value
                    : undefined;
            if (manufacturerId) {
                const manufacturerData = beacon.manufacturerData.get(manufacturerId);
                advertisementParams.manufacturerId = manufacturerId;
                advertisementParams.manufacturerSpecificData =
                    bluetoothle.bytesToEncodedString(manufacturerData);
            }
            if (beacon.services.length > 0) {
                const service = beacon.services[0];
                const data = {
                    services: [service.uuid.toString()], // iOS
                    service: service.uuid.toString(), // Android
                    serviceData: bluetoothle.bytesToEncodedString(service.data),
                    includeDeviceName: false,
                    includeTxPowerLevel: false,
                };
                if (manufacturerId) {
                    // Use as scan response
                    scanResponseParams = data;
                } else {
                    advertisementParams = {
                        ...advertisementParams,
                        ...data,
                    };
                }
            }

            const logger = useLogger();
            bluetoothle.startAdvertising(
                () => {
                    logger.log('info', `${beacon.constructor.name} advertising started!`);
                    beacon.advertising = true;
                    this.startForegroundService();
                },
                (error: any) => {
                    logger.log('error', error);
                    Toast.show({
                        text: `Error while starting advertising! ${error.message}.`,
                    });
                    beacon.advertising = false;
                },
                advertisementParams,
                scanResponseParams,
            );
        },
        stopAdvertising(beacon?: SimulatedBeacon) {
            const logger = useLogger();
            bluetoothle.stopAdvertising(
                () => {
                    if (beacon) {
                        beacon.advertising = false;
                    } else {
                        (this.beacons as Map<string, SimulatedBeacon>).forEach((beacon) => {
                            beacon.advertising = false;
                        });
                    }
                    this.stopForegroundService();
                },
                (error: BluetoothlePlugin.Error) => {
                    logger.log('error', error);
                    Toast.show({
                        text: `Error while stopping advertising! ${error.message}.`,
                    });
                },
                beacon
                    ? {
                          identifier: beacon.uid,
                      }
                    : undefined,
            );
        },
        delete(beacon: BLEBeaconObject): void {
            this.beacons.delete(beacon.uid);
            this.save();
        },
        isAdvertising(beacon: SimulatedBeacon): Promise<boolean> {
            return new Promise((resolve, reject) => {
                bluetoothle.isAdvertising(
                    (result) => {
                        console.log("Checked if advertising", beacon.uid, result.isAdvertising);
                        resolve(result.isAdvertising);
                    },
                    (error) => {
                        reject(error);
                    },
                    beacon
                        ? {
                              identifier: beacon.uid,
                          }
                        : undefined,
                );
            });
        },
        buildBeacon(beacon: BLEBeaconObject): Promise<BLEBeaconObject> {
            return new Promise((resolve, reject) => {
                if (beacon instanceof BLESemBeacon) {
                    BLESemBeaconBuilder.fromBeacon(beacon).build().then(resolve).catch(reject);
                } else if (beacon instanceof BLEAltBeacon) {
                    BLEAltBeaconBuilder.fromBeacon(beacon).build().then(resolve).catch(reject);
                } else if (beacon instanceof BLEiBeacon) {
                    BLEiBeaconBuilder.fromBeacon(beacon).build().then(resolve).catch(reject);
                } else if (beacon instanceof BLEEddystoneURL) {
                    BLEEddystoneURLBuilder.fromBeacon(beacon).build().then(resolve).catch(reject);
                } else if (beacon instanceof BLEEddystoneUID) {
                    BLEEddystoneUIDBuilder.fromBeacon(beacon).build().then(resolve).catch(reject);
                }
            });
        },
        addSimulatedBeacon(uid: string, beacon: BLEBeaconObject & (Partial<SimulatedBeacon> | any)): void {
            this.buildBeacon(beacon).then((beacon) => {
                if (!this.beacons.has(uid)) {
                    (beacon as any).advertising = false;
                }
                beacon.uid = uid;
                beacon.latency = beacon.latency ?? 'lowLatency';
                beacon.power = beacon.power ?? 'high';
                this.beacons.set(uid, beacon);
                return this.save();
            }).then(() => {
                return this.isAdvertising(beacon);
            }).then((advertising) => {
                this.beacons.get(uid).advertising = advertising;  
            });
        },
        load(): Promise<void> {
            return new Promise((resolve, reject) => {
                const logger = useLogger();
                logger.log('info', `Loading advertising beacons ...`);
                Preferences.get({
                    key: 'beacon.advertising',
                })
                    .then((result) => {
                        if (result.value && result.value !== 'undefined') {
                            const data = JSON.parse(result.value);
                            if (data) {
                                const beacons: { [k: string]: any } =
                                    DataSerializer.deserialize(data);
                                this.beacons = new Map(Object.entries(beacons));
                                // Check if beacons are still advertising
                                (this.beacons as Map<string, SimulatedBeacon>).forEach((beacon) => {
                                    this.isAdvertising(beacon).then((advertising) => {
                                        beacon.advertising = advertising;
                                    });
                                });
                            }
                        }
                        resolve();
                    })
                    .catch(reject);
            });
        },
        save(): Promise<void> {
            return new Promise((resolve, reject) => {
                Promise.resolve(
                    this.state === ControllerState.READY ? Promise.resolve() : this.load(),
                )
                    .then(() => {
                        const serialized = DataSerializer.serialize(
                            Object.fromEntries(toRaw(this.beacons).entries()),
                        );
                        const logger = useLogger();
                        logger.log('info', `Saving advertising beacons ...`);
                        return Preferences.set({
                            key: 'beacon.advertising',
                            value: JSON.stringify(serialized),
                        });
                    })
                    .then(resolve)
                    .catch(reject);
            });
        },
        async updateNotification(): Promise<void> {
            const beaconCount = this.advertisingBeacons.length;
            if (beaconCount !== 0) {
                await LocalNotifications.schedule({
                    notifications: [
                        {
                            title: 'SemBeacon Advertising',
                            body: `Broadcasting ${beaconCount} beacon${beaconCount === 1 ? '' : 's'} ...`,
                            id: 4868791,
                            channelId: 'sembeacon-advertising',
                            actionTypeId: 'sembeacon-1',
                            ongoing: true,
                        },
                    ],
                });
            } else {
                await LocalNotifications.cancel({
                    notifications: [
                        {
                            id: 4868791,
                        },
                    ],
                });
            }
        },
        async startForegroundService(): Promise<void> {
            // Create a foreground watchdog to ensure the user is aware of the service
            this.watchDog = setInterval(() => {
                this.updateNotification();
            }, 5000);

            const beaconCount = this.advertisingBeacons.length;
            if (beaconCount !== 0) {
                ForegroundService.addListener('buttonClicked', event => {
                    if (event.buttonId === 1) {
                        this.stopAdvertising();
                    }
                });
                await ForegroundService.startForegroundService({
                    title: 'SemBeacon Advertising',
                    body: `Broadcasting ${beaconCount} beacon${beaconCount === 1 ? '' : 's'} ...`,
                    id: 4868791,
                    smallIcon: 'ic_stat_icon',
                    buttons: [
                        {
                            id: 1,
                            title: 'Stop broadcasting',
                        },
                    ]
                });
            } else {
                await this.stopForegroundService();
            }
        },
        async stopForegroundService(): Promise<void> {
            if (this.watchDog) {
                clearInterval(this.watchDog);
                this.watchDog = undefined;
            }
            await ForegroundService.stopForegroundService();
        }
    },
});