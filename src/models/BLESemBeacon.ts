import 'reflect-metadata';
import { SerializableMember, SerializableObject } from "@openhps/core";
import { IriString, UrlString, xsd } from "@openhps/rdf";
import { BLEBeaconObject, BLEEddystoneURL, BLEService, BLEUUID, BufferUtils } from "@openhps/rf";

export const SEMBEACON_FLAG_HAS_POSITION		= (0x01 << 0);
export const SEMBEACON_FLAG_PRIVATE			    = (0x01 << 1);
export const SEMBEACON_FLAG_MOVING 			    = (0x01 << 2);
export const SEMBEACON_FLAG_HAS_SYSTEM		    = (0x01 << 3);
export const SEMBEACON_FLAG_HAS_TELEMETRY	    = (0x01 << 4);
export const SEMBEACON_FLAG_RESERVED_1		    = (0x01 << 5);
export const SEMBEACON_FLAG_RESERVED_2		    = (0x01 << 6);
export const SEMBEACON_FLAG_RESERVED_3		    = (0x01 << 7);
export const SEMBEACON_FLAG_UNDEFINED		    = (0x00);

@SerializableObject({
    rdf: {
        type: "http://purl.org/sembeacon/SemBeacon"
    }
})
export class BLESemBeacon extends BLEBeaconObject {
    static readonly PREFIXES = [
        ...BLEEddystoneURL.PREFIXES
    ];
    static readonly SUFFIXES = [
        ...BLEEddystoneURL.SUFFIXES
    ];
    @SerializableMember()
    flags: number;

    @SerializableMember({
        rdf: {
            predicate: "http://purl.org/sembeacon/namespaceId",
            datatype: xsd.hexBinary
        }
    })
    namespaceId: BLEUUID;

    @SerializableMember({
        rdf: {
            predicate: "http://purl.org/sembeacon/instanceId",
            datatype: xsd.hexBinary
        }
    })
    instanceId: BLEUUID;

    @SerializableMember()
    resourceUri: UrlString;

    @SerializableMember({
        rdf: {
            predicate: "http://purl.org/sembeacon/shortResourceURI"
        }
    })
    shortResourceURI: UrlString;

    isValid(): boolean {
        return this.resourceUri !== undefined && this.instanceId !== undefined && this.namespaceId !== undefined;
    }

    parseManufacturerData(_: number, manufacturerData: Uint8Array): this {
        super.parseManufacturerData(_, manufacturerData);
        const view = new DataView(manufacturerData.buffer, 0);
        if (
            !(
                manufacturerData.byteLength === 26 &&
                BufferUtils.arrayBuffersAreEqual(manufacturerData.buffer.slice(0, 2), Uint8Array.from([0xbe, 0xac]).buffer)
            )
        ) {
            return this;
        }
        this.namespaceId = BLEUUID.fromBuffer(manufacturerData.subarray(2, 18));
        this.instanceId = BLEUUID.fromBuffer(manufacturerData.subarray(18, 22));
        this.txPower = view.getInt8(22);
        this.flags = view.getInt8(23);

        if (this.uid === undefined) {
            this.uid = BufferUtils.toHexString(
                BufferUtils.concatBuffer(
                    this.namespaceId.toBuffer(),
                    this.instanceId.toBuffer()
                ),
            );
        }
        return this;
    }

    parseServiceData(uuid: BLEUUID, serviceData: Uint8Array): this {
        super.parseServiceData(uuid, serviceData);
        if (uuid === undefined && serviceData === undefined) {
            return this;
        }

        if (!BufferUtils.arrayBuffersAreEqual(uuid.toBuffer().buffer, uuid.toBuffer().buffer)) {
            return this;
        }

        const urlData = new Uint8Array(serviceData.slice(2, serviceData.byteLength));
        const view = new DataView(urlData.buffer, 0);

        const prefix = view.getUint8(0);
        if (prefix > BLESemBeacon.PREFIXES.length) {
            return this;
        }

        let url = BLESemBeacon.PREFIXES[prefix];
        for (let i = 1; i < view.byteLength; i++) {
            url +=
                view.getUint8(i) < BLESemBeacon.SUFFIXES.length
                    ? BLESemBeacon.SUFFIXES[view.getUint8(i)]
                    : String.fromCharCode(view.getUint8(i));
        }
        this.shortResourceURI = url as IriString;
        return this;
    }

    protected get legacyService(): BLEService {
        return this.getServiceByUUID(BLEUUID.fromString('AAFE'));
    }

    protected get service(): BLEService {
        return this.getServiceByUUID(BLEUUID.fromString('AAFE'));
    }
}
