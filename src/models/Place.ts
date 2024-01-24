import { SerializableMember, SerializableObject } from '@openhps/core';
import { ogc, schema } from '@openhps/rdf';
import { Geometry } from '@openhps/rdf/models';

@SerializableObject({
    rdf: {
        type: [schema.Place, ogc.Feature],
    },
})
export class Place {
    @SerializableMember({
        rdf: {
            predicate: ogc.hasGeometry,
        },
    })
    geometry: Geometry;
}
