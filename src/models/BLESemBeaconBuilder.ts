import { BLEService, BLEUUID } from "@openhps/rf";
import { BLESemBeacon } from "./BLESemBeacon";
import { IriString } from "@openhps/rdf";
import { BufferUtils, LengthUnit } from "@openhps/core";

/**
 * BLE SemBeacon builder
 */
export class BLESemBeaconBuilder {
    protected beacon: BLESemBeacon;
    protected options: SemBeaconBuilderOptions;

    protected constructor(options?: SemBeaconBuilderOptions) {
        this.options = options ?? {};
        this.beacon = new BLESemBeacon();
    }

    static create(options?: SemBeaconBuilderOptions): BLESemBeaconBuilder {      
        return new BLESemBeaconBuilder(options);
    }

    namespaceId(namespaceId: BLEUUID): this {
        this.beacon.namespaceId = namespaceId;
        return this;
    }

    instanceId(instanceId: string): this;
    instanceId(instanceId: number): this;
    instanceId(instanceId: number | string): this {
        if (typeof instanceId === 'number') {
            const arr = new Uint8Array(8);
            for (let i = 0; i < 8; i++) {
                arr[i] = instanceId % 256;
                instanceId = Math.floor(instanceId / 256);
            }
            this.beacon.instanceId = BufferUtils.toHexString(arr);
        } else {
            this.beacon.instanceId = instanceId;
        }
        return this;
    }

    calibratedRSSI(rssi: number): this {
        this.beacon.calibratedRSSI = rssi;
        return this;
    }

    resourceUri(resourceUri: IriString): this {
        this.beacon.resourceUri = resourceUri;
        return this;
    }
    
    shortResourceUri(resourceUri: IriString): this {
        this.beacon.shortResourceUri = resourceUri;
        return this;
    }

    flag(flag: number): this {
        this.beacon.setFlag(flag);
        return this;
    }

    protected getEncodedURL(): { url: DataView, length: number } {
        const view = new DataView(new ArrayBuffer(17), 0)
        let index = 0;
        let url_index = 0;
        const url = this.beacon.shortResourceUri;
        BLESemBeacon.PREFIXES.forEach(prefix => {
            if (url.toLowerCase().startsWith(prefix)) {
                // Encode using this prefix
                view.setUint8(index, BLESemBeacon.PREFIXES.indexOf(prefix));
                url_index += prefix.length;
            }
        });
        index += 1;
        for (let i = url_index; i < url.length ; i++) {
            if (index > 17) {
                break;
            }
            view.setUint8(index, url.charCodeAt(i));
            BLESemBeacon.SUFFIXES.forEach(suffix => {
                if (url.slice(i).toLowerCase().startsWith(suffix)) {
                    view.setUint8(index, BLESemBeacon.SUFFIXES.indexOf(suffix));
                    i += suffix.length - 1;
                }
            });
            index++;
        }       
        return { url: view, length: index };
    }

    build(): Promise<BLESemBeacon> {
        return new Promise((resolve) => {
            // Compute manufacturer data
            const manufacturerData = new DataView(new ArrayBuffer(24), 0);
            // Advertisement data
            manufacturerData.setUint8(0, 0xBE);                         // Beacon code
            manufacturerData.setUint8(1, 0xAC);
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
            const { url, length } = this.getEncodedURL();
            const serviceData = new DataView(new ArrayBuffer(19 - (17 - length)), 0);
            serviceData.setUint8(0, 0x10);                     // Eddystone-URL frame
            serviceData.setInt8(1, this.beacon.getCalibratedRSSI(0, LengthUnit.METER));
            // Encoded URL
            for (let i = 0 ; i < length ; i++) {
                serviceData.setUint8(2 + i, url.getUint8(i));
            }

            this.beacon.manufacturerData.set(0xFFFF, new Uint8Array(manufacturerData.buffer));
            this.beacon.addService(new BLEService(BLEUUID.fromString('FEAA'), new Uint8Array(serviceData.buffer)));
            resolve(this.beacon);
        });
    }

}

export interface SemBeaconBuilderOptions {
    bitly?: {
        accessToken: string;
    }
}
