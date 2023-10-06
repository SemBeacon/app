import { BLEUUID } from "@openhps/rf";
import { BLESemBeacon } from "./BLESemBeacon";
import { IriString } from "@openhps/rdf";

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

    instanceId(instanceId: string): this {
        this.beacon.instanceId = instanceId;
        return this;
    }

    resourceUri(resourceUri: IriString): this {
        this.beacon.resourceUri = resourceUri;
        return this;
    }

    build(): Promise<BLESemBeacon> {
        return new Promise((resolve) => {
            // Compute raw advertisement data
            const view = new DataView(new ArrayBuffer(31), 0);
            //view.setUint8(0x02)
            resolve(this.beacon);
        });
    }
}
