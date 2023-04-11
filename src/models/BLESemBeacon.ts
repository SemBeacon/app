import { SerializableMember, SerializableObject } from "@openhps/core";
import { xsd } from "@openhps/rdf";
import { BLEBeaconObject } from "@openhps/rf";

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
}
