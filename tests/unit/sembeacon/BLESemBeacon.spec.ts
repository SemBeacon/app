import { BLESemBeacon } from '@/models/BLESemBeacon';
import { RDFSerializer } from '@openhps/rdf';
import { BLEUUID } from '@openhps/rf';

describe('BLESemBeacon', () => {
    it('should serialize to RDF', () => {
        const object = new BLESemBeacon(undefined);
        object.namespaceId = BLEUUID.fromString("AAFE");
        object.instanceId = BLEUUID.fromString("AAFE");
        object.resourceUri = "http://test.com";
        const serialized = RDFSerializer.serialize(object);
        console.log(serialized)
    })
})
