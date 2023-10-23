import { defineStore } from 'pinia';
import { SEMBEACON_FLAG_HAS_POSITION, SEMBEACON_FLAG_HAS_SYSTEM } from '@/models/BLESemBeacon';
import { 
    BLEBeaconObject,
    BLEEddystoneURLBuilder,
    BLEUUID,
    BLEiBeaconBuilder,
    BLEAltBeaconBuilder,
    BLEEddystoneTLMBuilder,
} from '@openhps/rf';
import { Toast } from '@capacitor/toast';
import { useLogger } from './logger';
import { BLESemBeaconBuilder } from '@/models/BLESemBeaconBuilder';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { ControllerState } from './types';

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

export type SimulatedBeacon = BLEBeaconObject & {
    advertising: boolean;
}

export interface BeaconAdvertisingState {
    beacons: Map<string, SimulatedBeacon>;
    state: ControllerState;
}

export const useBeaconAdvertisingStore = defineStore('beacon.advertising', {
    state: (): BeaconAdvertisingState => ({
        beacons: new Map(),
        state: ControllerState.PENDING
    }),
    getters: {

    },
    actions: {
        findByUID(uid: string): Promise<SimulatedBeacon> {
            return this.beacons.get(uid);
        },
        populate(): void {
            Promise.all([
                BLESemBeaconBuilder.create()
                    .namespaceId(BLEUUID.fromString("77f340db-ac0d-20e8-aa3a-f656a29f236c"))
                    .instanceId("9c7ce6fc")
                    .calibratedRSSI(-56)
                    .shortResourceUri("https://bit.ly/3JsEnF9")
                    .flag(SEMBEACON_FLAG_HAS_POSITION)
                    .flag(SEMBEACON_FLAG_HAS_SYSTEM)
                    .build(),
                BLEiBeaconBuilder.create()
                    .proximityUUID(BLEUUID.fromString("77f340db-ac0d-20e8-aa3a-f656a29f236c"))
                    .calibratedRSSI(-56)
                    .major(51243)
                    .minor(14124)
                    .build(),
                BLEAltBeaconBuilder.create()
                    .proximityUUID(BLEUUID.fromString("77f340db-ac0d-20e8-aa3a-f656a29f236c"))
                    .major(51243)
                    .minor(14124)
                    .calibratedRSSI(-56)
                    .build(),
                BLEEddystoneURLBuilder.create()
                    .calibratedRSSI(-56)
                    .url("https://maximvdw.be")
                    .build(),
                BLEEddystoneTLMBuilder.create()
                    .calibratedRSSI(-56)
                    .voltage(3215)
                    .temperature(25.91)
                    .uptime(5)
                    .advertiseCount(100)
                    .build(),
            ]).then(beacons => {
                beacons.forEach(beacon => {
                    this.addSimulatedBeacon(beacon);
                });
            });
        },
        initialize(): Promise<void> {
            this.state = ControllerState.INITIALIZING;
            this.populate();
            return new Promise((resolve, reject) => {
                const bluetoothle = (window as any).bluetoothle;
                if (!bluetoothle) {
                    return resolve();
                }
                const logger = useLogger();
                const platform = Capacitor.getPlatform();
                bluetoothle.initialize((result) => {
                    if (result.status !== 'enabled') {
                        return reject(new Error(`Bluetooth is disabled!`));
                    }
                    if (platform === 'android') {
                        bluetoothle.requestPermissionBtAdvertise(() => {
                            this.state = ControllerState.READY;
                            resolve();
                        }, (error) => {
                            this.state = ControllerState.NO_PERMISSION;
                            logger.log('error', error);
                            reject(error);
                        });
                    } else if (platform === 'ios') {
                        bluetoothle.requestPermissions(() => {
                            this.state = ControllerState.READY;
                            resolve();
                        }, (error) => {
                            logger.log('error', error); 
                            this.state = ControllerState.NO_PERMISSION;
                            reject(error);
                        });
                    } else {
                        resolve();
                    }
                }, {
                    request: true,
                    statusReceiver: false,
                    restoreKey: "sembeacon"
                });
            });
        },
        startAdvertising(beacon: SimulatedBeacon): void {
            const bluetoothle = (window as any).bluetoothle;
            // Extract advertisement and scan response data
            let advertisementParams: any = {
                identifier: beacon.computeUID(),
                includeDeviceName: false,
                includeTxPowerLevel: false,
                connectable: false,
                discoverable: true,
                mode: 'lowLatency',
                txPowerLevel: 'high',
                timeout: 0,
            };
            let scanResponseParams: any = undefined;
            const manufacturerId: number = beacon.manufacturerData.size > 0 ?
                beacon.manufacturerData.keys().next().value : undefined;
            if (manufacturerId) {
                const manufacturerData = beacon.manufacturerData.get(manufacturerId);
                advertisementParams.manufacturerId = manufacturerId;
                advertisementParams.manufacturerSpecificData = bluetoothle.bytesToEncodedString(manufacturerData);
            }
            if (beacon.services.length > 0) {
                const service = beacon.services[0];
                const data = {
                    services: [service.uuid.toString()],     // iOS
                    service: service.uuid.toString(),        // Android
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
            bluetoothle.startAdvertising(() => {
                logger.log('info', `${beacon.constructor.name} advertising started!`);
                Toast.show({
                    text: `Advertising of ${beacon.constructor.name} started!`,
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
                beacon.advertising = true;
            }, (error: any) => {
                logger.log('error', error);
                Toast.show({
                    text: `Error while starting advertising! ${error.message}.`,
                });
                beacon.advertising = false;
            }, advertisementParams, scanResponseParams);
        },
        stopAdvertising(beacon?: SimulatedBeacon) {
            const bluetoothle = (window as any).bluetoothle;
            const logger = useLogger();
            bluetoothle.stopAdvertising(beacon ? {
                identifier: beacon.uid
            } : undefined, () => {
                beacon.advertising = false;
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
            }, (error: Error) => {
                logger.log('error', error);
                Toast.show({
                    text: `Error while stopping advertising! ${error.message}.`,
                });
            });
        },
        addSimulatedBeacon(beacon: BLEBeaconObject): void {
            beacon.uid = beacon.computeUID();
            (beacon as any).advertising = false;
            this.beacons.set(beacon.uid, beacon);
        }
    }
});
