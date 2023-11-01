import { SerializableObject } from '@openhps/core';
import { FeatureOfInterest } from './FeatureOfInterest';
import { sosa, ssn } from '@openhps/rdf';

@SerializableObject({
  rdf: {
    type: [sosa.Platform, ssn.System],
  },
})
export class Device extends FeatureOfInterest {}
