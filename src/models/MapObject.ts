import { SerializableObject, SerializableMember, DataObject } from '@openhps/core';
import { schema, xsd } from '@openhps/rdf';
import { Place } from './Place';

@SerializableObject({
  rdf: {
    type: schema.Map__workaround,
  },
})
export class MapObject extends DataObject {
  @SerializableMember({
    rdf: {
      predicate: schema.image,
      datatype: xsd.anyURI,
    },
  })
  image: string;

  @SerializableMember({
    rdf: {
      predicate: schema.spatialCoverage,
    },
  })
  coverage: Place;
}
