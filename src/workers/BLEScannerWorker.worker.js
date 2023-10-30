import { ModelBuilder, FrameFilterNode } from '/js/vendor/openhps/openhps-core.es.min.js';
import {
  RelativeRSSIProcessing,
  BLEBeaconClassifierNode,
  PropagationModel,
  BLEAltBeacon,
  BLEiBeacon,
  BLEEddystoneURL,
  BLEEddystoneUID,
  BLEEddystoneTLM,
  BLEBeaconObject,
} from '/js/vendor/openhps/openhps-rf.es.min.js';
import { BLESemBeacon, SemBeaconService } from '/js/vendor/openhps/sembeacon-openhps.es.min.js';
import { RDFSerializer } from '/js/vendor/openhps/openhps-rdf.all.es.min.js';

export default ModelBuilder.create()
  .on('ready', () => {
    // Initialize RDF serializer
    RDFSerializer.initialize('rf');
    RDFSerializer.initialize('geospatial');
  })
  .addService(
    new SemBeaconService(null, {
      accessToken: '2cd7bc12126759042bfb3ebe1160aafda0bc65df',
      cors: true,
      uid: 'sembeacon-worker-service',
    }),
  )
  .from()
  .via(
    new BLEBeaconClassifierNode({
      resetUID: true,
      types: [
        BLESemBeacon,
        BLEAltBeacon,
        BLEiBeacon,
        BLEEddystoneURL,
        BLEEddystoneUID,
        BLEEddystoneTLM,
      ],
    }),
  )
  .via(
    new RelativeRSSIProcessing({
      environmentFactor: 2.0,
      propagationModel: PropagationModel.LOG_DISTANCE,
    }),
  )
  .via(
    new FrameFilterNode((frame) => {
      return frame.getObjects().filter((b) => b instanceof BLEBeaconObject).length > 0;
    }),
  )
  .to();
