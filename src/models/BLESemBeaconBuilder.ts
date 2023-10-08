import { BLEService, BLEUUID } from "@openhps/rf";
import { BLESemBeacon } from "./BLESemBeacon";
import { IriString } from "@openhps/rdf";
import { BufferUtils } from "@openhps/core";

/**
 * BLE SemBeacon builder
 */
export class BLESemBeaconBuilder {
    protected beacon: BLESemBeacon;

    protected constructor() {
        this.beacon = new BLESemBeacon();
    }

    static create(): BLESemBeaconBuilder {      
        return new BLESemBeaconBuilder();
    }

    namespaceId(namespaceId: BLEUUID): this {
        this.beacon.namespaceId = namespaceId;
        return this;
    }

    instanceId(instanceId: number): this {
        const arr = new Uint8Array(8);
        for (let i = 0; i < 8; i++) {
            arr[i] = instanceId % 256;
            instanceId = Math.floor(instanceId / 256);
        }
        this.beacon.instanceId = BufferUtils.toHexString(arr);
        return this;
    }

    resourceUri(resourceUri: IriString): this {
        this.beacon.resourceUri = resourceUri;
        return this;
    }

    flag(flag: number): this {
        this.beacon.setFlag(flag);
        return this;
    }

    build(): Promise<BLESemBeacon> {
        return new Promise((resolve) => {
            // Compute manufacturer data
            const manufacturerData = new DataView(new ArrayBuffer(24), 0);
            // Advertisement data
            manufacturerData.setUint8(0, 0xAC);                         // Beacon code
            manufacturerData.setUint8(1, 0xBE);
            // Namespace ID
            const namespaceId = new DataView(this.beacon.namespaceId.toBuffer().buffer, 0);
            for (let i = 2 ; i < 2 + 16 ; i++) {
                manufacturerData.setUint8(i, namespaceId.getUint8(i - 2));
            }
            // Instance ID
            const instanceId = new DataView(BufferUtils.fromHexString(this.beacon.instanceId).buffer, 0);
            for (let i = 18 ; i < 18 + 4 ; i++) {
                manufacturerData.setUint8(i, instanceId.getUint8(i - 18));
            }
            manufacturerData.setInt8(22, this.beacon.calibratedRSSI);   // Calibrated RSSI
            manufacturerData.setUint8(23, this.beacon.flags);           // SemBeacon flags

            // Eddystone Service
            const serviceData = new DataView(new ArrayBuffer(24), 0);
            serviceData.setUint8(0, 0); // TODO
            serviceData.setUint8(1, 0x16);                     // 16-bit UUID
            serviceData.setUint8(2, 0xAA);                     // Eddystone Service
            serviceData.setUint8(3, 0xFE);
            serviceData.setUint8(4, 0x10);                     // Eddystone-URL frame
            serviceData.setInt8(5, this.beacon.calibratedRSSI);
            // Encoded URL

            this.beacon.manufacturerData.set(0x004C, new Uint8Array(manufacturerData.buffer));
            this.beacon.addService(new BLEService(BLEUUID.fromString('AAFE'), new Uint8Array(serviceData.buffer)));
            resolve(this.beacon);
        });
    }
}
