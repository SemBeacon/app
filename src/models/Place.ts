import { SerializableMember, SerializableObject } from '@openhps/core';
import { ogc, PolygonGeometry, schema } from '@openhps/rdf';

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
  geometry: PolygonGeometry;
}
