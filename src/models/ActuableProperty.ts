import { SerializableObject } from '@openhps/core';
import { sosa } from '@openhps/rdf/vocab';
import { Property } from './Property';

@SerializableObject({
  rdf: {
    type: sosa.ActuatableProperty,
  },
})
export class ActuableProperty extends Property {}
