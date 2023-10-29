import { SerializableObject, SerializableMember } from '@openhps/core';
import { schema } from '@openhps/rdf';

@SerializableObject({
    rdf: {
        type: schema.FloorPlan
    }
})
export class FloorPlan {
    @SerializableMember({
        rdf: {
            predicate: schema.layoutImage
        }
    })
    layoutImage: string;
}
