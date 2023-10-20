import { defineStore } from 'pinia';
import { SEMBEACON_FLAG_HAS_POSITION, SEMBEACON_FLAG_HAS_SYSTEM } from '@/models/BLESemBeacon';
import { 
    BLEBeaconObject,
    BLEEddystoneURLBuilder,
    BLEUUID,
    BLEiBeaconBuilder,
} from '@openhps/rf';
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

export interface SimulatedBeacon {
    advertising: boolean;
    object: BLEBeaconObject;
}

export interface BeaconAdvertisingState {
    beacons: SimulatedBeacon[];
}

export const useBeaconAdvertisingStore = defineStore('beacon.advertising', {
    state: (): BeaconAdvertisingState => ({
        beacons: []
    }),
    getters: {
        isAdvertising(): boolean {
            return this.advertising;
        }
    },
    actions: {
        populate(): void {
            Promise.all([
                BLESemBeaconBuilder.create()
                    .displayName("OpenHPS2021/BEACON_08")
                    .namespaceId(BLEUUID.fromString("77f340db-ac0d-20e8-aa3a-f656a29f236c"))
                    .instanceId("9c7ce6fc")
                    .calibratedRSSI(-56)
                    .shortResourceUri("https://bit.ly/3JsEnF9")
                    .flag(SEMBEACON_FLAG_HAS_POSITION)
                    .flag(SEMBEACON_FLAG_HAS_SYSTEM)
                    .build(),
                BLESemBeaconBuilder.create()
                    .displayName("OpenHPS2021/BEACON_08")
                    .namespaceId(BLEUUID.fromString("77f340db-ac0d-20e8-aa3a-f656a29f236c"))
                    .instanceId("f335b0ea")
                    .calibratedRSSI(-56)
                    .shortResourceUri("https://bit.ly/3Nf0iRi")
                    .flag(SEMBEACON_FLAG_HAS_POSITION)
                    .flag(SEMBEACON_FLAG_HAS_SYSTEM)
                    .build(),
                BLEiBeaconBuilder.create()
                    .proximityUUID(BLEUUID.fromString("77f340db-ac0d-20e8-aa3a-f656a29f236c"))
                    .calibratedRSSI(-56)
                    .major(51243)
                    .minor(14124)
                    .build(),
                // BLEAltBeaconBuilder.create()
                //     .beaconId(BLEUUID.fromString("77f340db-ac0d-20e8-aa3a-f656a29f236c"))
                //     .calibratedRSSI(-56)
                //     .build()
                BLEEddystoneURLBuilder.create()
                    .calibratedRSSI(-56)
                    .url("https://maximvdw.be")
                    .build()
            ]).then(beacons => {
                this.beacons.push(...beacons.map(beacon => {
                    return {
                        object: beacon,
                        advertising: false
                    } as SimulatedBeacon;
                }));
            });
        },
        initialize(): Promise<void> {
            this.populate();
            return new Promise((resolve, reject) => {
                const bluetoothle = (window as any).bluetoothle;
                const logger = useLogger();
                const platform = Capacitor.getPlatform();
                if (platform === 'android') {
                    bluetoothle.requestPermissionBtAdvertise(() => {
                        resolve();
                    }, (error) => {
                        logger.log('error', error);
                        reject(error);
                    });
                } else if (platform === 'ios') {
                    bluetoothle.requestPermissions(() => {
                        resolve();
                    }, (error) => {
                        logger.log('error', error);
                        reject(error);
                    });
                }
            });
        },
        startAdvertising(beaconData: any): void {
            const bluetoothle = (window as any).bluetoothle;
            const logger = useLogger();
            bluetoothle.initialize((result) => {
                logger.log('debug', result);
                BLESemBeaconBuilder.create()
                    .namespaceId(BLEUUID.fromString(beaconData.namespaceId))
                    .instanceId(beaconData.instanceId)
                    .calibratedRSSI(-56)
                    .shortResourceUri(beaconData.shortResourceUri)
                    .flag(SEMBEACON_FLAG_HAS_POSITION)
                    .flag(SEMBEACON_FLAG_HAS_SYSTEM)
                    .build().then(beacon => {
                        console.log(beacon);
                        const manufacturerData = beacon.manufacturerData.get(0xFFFF);
                        const service = beacon.getServiceByUUID(BLEUUID.fromString('FEAA'));
                        bluetoothle.startAdvertising((result) => {
                            logger.log('debug', result);
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
                            identifier: beacon.computeUID(),
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
                            services: ["FEAA"],     // iOS
                            service: "FEAA",        // Android
                            serviceData: bluetoothle.bytesToEncodedString(service.data),
                            includeDeviceName: false,
                            includeTxPowerLevel: false,
                        });
                    });
                    BLESemBeaconBuilder.create()
                    .namespaceId(BLEUUID.fromString(beaconData.namespaceId))
                    .instanceId("f335b0ea")
                    .calibratedRSSI(-56)
                    .shortResourceUri("https://bit.ly/3Nf0iRi")
                    .flag(SEMBEACON_FLAG_HAS_POSITION)
                    .flag(SEMBEACON_FLAG_HAS_SYSTEM)
                    .build().then(beacon => {
                        console.log(beacon);
                        const manufacturerData = beacon.manufacturerData.get(0xFFFF);
                        const service = beacon.getServiceByUUID(BLEUUID.fromString('FEAA'));
                        bluetoothle.startAdvertising((result) => {
                            logger.log('debug', result);
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
                            identifier: beacon.computeUID(),
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
                            services: ["FEAA"],     // iOS
                            service: "FEAA",        // Android
                            serviceData: bluetoothle.bytesToEncodedString(service.data),
                            includeDeviceName: false,
                            includeTxPowerLevel: false,
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
        addSimulatedBeacon(beacon: BLEBeaconObject): void {
            this.beacons.push(beacon);
        }
    }
});
