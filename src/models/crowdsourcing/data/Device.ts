import { DataObject, SerializableObject } from '@openhps/core';
import { ssn } from '@openhps/rdf';

@SerializableObject({
    rdf: {
        type: [ssn.System]
    },
})
export class Device extends DataObject {}
