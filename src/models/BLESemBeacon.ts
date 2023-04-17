import { SerializableMember, SerializableObject } from "@openhps/core";
import { UrlString, xsd } from "@openhps/rdf";
import { BLEBeaconObject } from "@openhps/rf";
import axios from 'axios';

@SerializableObject({
    rdf: {
        type: "http://purl.org/sembeacon/SemBeacon"
    }
})
export class BLESemBeacon extends BLEBeaconObject {
    @SerializableMember()
    flags: number;

    @SerializableMember({
        rdf: {
            predicate: "http://purl.org/sembeacon/namespaceId",
            datatype: xsd.hexBinary
        }
    })
    namespaceId: string;

    @SerializableMember({
        rdf: {
            predicate: "http://purl.org/sembeacon/instanceId",
            datatype: xsd.hexBinary
        }
    })
    instanceId: number;

    @SerializableMember()
    resourceUri: UrlString;

    isValid(): boolean {
        return false;
    }

    protected fetchData(): Promise<any> {
        return new Promise((resolve, reject) => {
            axios.get(this.resourceUri, {
                headers: {
                    Accept: "text/turtle"
                }
            }).then(() => {
                resolve(undefined);
            }).catch(reject);
        });
    }
}
