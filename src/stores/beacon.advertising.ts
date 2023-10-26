import { defineStore } from 'pinia';
import { BLESemBeacon } from '@/models/BLESemBeacon';
import { BLEBeaconObject, BLEAltBeaconBuilder, BLEAltBeacon, BLEiBeacon, BLEiBeaconBuilder } from '@openhps/rf';
import { Toast } from '@capacitor/toast';
import { useLogger } from './logger';
import { BLESemBeaconBuilder } from '@/models/BLESemBeaconBuilder';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { ControllerState } from './types';
import { Preferences } from '@capacitor/preferences';
import type { BluetoothlePlugin } from 'cordova-plugin-bluetoothle';
import { DataSerializer } from '@openhps/core';
import { toRaw } from 'vue';
const bluetoothle = (window as any).bluetoothle as BluetoothlePlugin.Bluetoothle;

export type SimulatedBeacon = BLEBeaconObject & {
  advertising: boolean;
};

export interface BeaconAdvertisingState {
  beacons: Map<string, SimulatedBeacon>;
  state: ControllerState;
}

export const useBeaconAdvertisingStore = defineStore('beacon.advertising', {
  state: (): BeaconAdvertisingState => ({
    beacons: new Map(),
    state: ControllerState.PENDING,
  }),
  getters: {
    advertisingBeacons(): SimulatedBeacon[] {
      return Array.from(this.beacons.values()).filter((b: SimulatedBeacon) => b.advertising) as SimulatedBeacon[];
    },
  },
  actions: {
    findByUID(uid: string): SimulatedBeacon {
      return this.beacons.get(uid);
    },
    initialize(): Promise<void> {
      this.state = ControllerState.INITIALIZING;
      return new Promise((resolve, reject) => {
        if (Capacitor.getPlatform() !== 'web') {
          LocalNotifications.requestPermissions().then(() => {
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
          });
        }
        const logger = useLogger();
        const platform = Capacitor.getPlatform();
        this.load()
          .then(() => {
            if (!bluetoothle) {
              this.state = ControllerState.DISABLED;
              return resolve();
            }

            bluetoothle.initialize(
              (result) => {
                if (result.status !== 'enabled') {
                  return reject(new Error(`Bluetooth is disabled!`));
                }
                if (platform === 'android') {
                  bluetoothle.requestPermissionBtAdvertise(
                    () => {
                      this.state = ControllerState.READY;
                      resolve();
                    },
                    (error: BluetoothlePlugin.Error) => {
                      this.state = ControllerState.NO_PERMISSION;
                      logger.log('error', error);
                      reject(error);
                    },
                  );
                } else if (platform === 'ios') {
                  bluetoothle.requestPermission(
                    () => {
                      this.state = ControllerState.READY;
                      resolve();
                    },
                    (error) => {
                      logger.log('error', error);
                      this.state = ControllerState.NO_PERMISSION;
                      reject(error);
                    },
                  );
                } else {
                  resolve();
                }
              },
              {
                request: true,
                statusReceiver: false,
                restoreKey: 'sembeacon',
              },
            );
          })
          .catch(reject);
      });
    },
    startAdvertising(beacon: SimulatedBeacon): void {
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
      const manufacturerId: number =
        beacon.manufacturerData.size > 0 ? beacon.manufacturerData.keys().next().value : undefined;
      if (manufacturerId) {
        const manufacturerData = beacon.manufacturerData.get(manufacturerId);
        advertisementParams.manufacturerId = manufacturerId;
        advertisementParams.manufacturerSpecificData = bluetoothle.bytesToEncodedString(manufacturerData);
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
          this.updateNotification();
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
          this.updateNotification();
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
        }
      });
    },
    addSimulatedBeacon(uid: string, beacon: BLEBeaconObject): void {
      this.buildBeacon(beacon).then((beacon) => {
        if (!this.beacons.has(uid)) {
          (beacon as any).advertising = false;
        }
        this.beacons.set(uid, beacon);
        this.save();
      });
    },
    load(): Promise<void> {
      return new Promise((resolve, reject) => {
        Preferences.get({
          key: 'beacon.advertising',
        })
          .then((result) => {
            if (result.value && result.value !== 'undefined') {
              const data = JSON.parse(result.value);
              if (data) {
                const beacons: { [k: string]: any } = DataSerializer.deserialize(data);
                this.beacons = new Map(Object.entries(beacons));
              }
            }
            resolve();
          })
          .catch(reject);
      });
    },
    save(): Promise<void> {
      return new Promise((resolve, reject) => {
        const serialized = DataSerializer.serialize(Object.fromEntries(toRaw(this.beacons).entries()));
        Preferences.set({
          key: 'beacon.advertising',
          value: JSON.stringify(serialized),
        })
          .then(resolve)
          .catch(reject);
      });
    },
    async updateNotification(): Promise<void> {
      LocalNotifications.removeAllListeners();
      await LocalNotifications.cancel({
        notifications: [
          {
            id: 1,
          },
        ],
      });
      if (this.advertisingBeacons.length !== 0) {
        LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
          if (action.actionId == 'stop') {
            this.stopAdvertising();
          }
        });
        await LocalNotifications.schedule({
          notifications: [
            {
              title: 'SemBeacon Advertising',
              body: `Broadcasting ${this.advertisingBeacons.length} beacons ...`,
              id: 1,
              channelId: 'sembeacon-advertising',
              actionTypeId: 'sembeacon-1',
              ongoing: true,
            },
          ],
        });
      }
    },
  },
});
