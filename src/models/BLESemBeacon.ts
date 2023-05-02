import { SerializableMember, SerializableObject } from "@openhps/core";
import { IriString, UrlString, xsd } from "@openhps/rdf";
import { BLEBeaconObject, BLEEddystoneURL, BLEService, BLEUUID, BufferUtils } from "@openhps/rf";

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

    isValid(): boolean {
        return this.resourceUri !== undefined && this.instanceId !== undefined && this.namespaceId !== undefined;
    }

    parseManufacturerData(_: number, manufacturerData: Uint8Array): this {
        const view = new DataView(manufacturerData.buffer, 0);
        if (
            !(
                manufacturerData.byteLength === 26 &&
                BufferUtils.arrayBuffersAreEqual(manufacturerData.buffer.slice(2, 4), Uint8Array.from([0xac, 0xbe]).buffer)
            )
        ) {
            return this;
        }
        this.namespaceId = BLEUUID.fromBuffer(manufacturerData.subarray(4, 20));
        this.instanceId = BLEUUID.fromBuffer(manufacturerData.subarray(20, 24));
        this.txPower = view.getInt8(24);
        //this.msb = view.getInt8(25);

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
        this.resourceUri = url as IriString;
        return this;
    }

    protected get legacyService(): BLEService {
        return this.getServiceByUUID(BLEUUID.fromString('AAFE'));
    }

    protected get service(): BLEService {
        return this.getServiceByUUID(BLEUUID.fromString('AAFE'));
    }
}

export enum BLESemBeaconFlags {
    
}
