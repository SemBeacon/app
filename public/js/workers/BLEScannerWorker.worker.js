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
            urlShortener: (url) => {
                return new Promise((resolve, reject) => {
                    fetch(
                        `https://s.sembeacon.org/shorten?api=Y5Y2SRZ2zo&uri=${encodeURIComponent(url)}`,
                    )
                        .then((response) => {
                            resolve(response.text());
                        })
                        .catch(reject);
                });
            },
            cors: 'https://proxy.sembeacon.org/?api=xWzD9b4eRBdWz&uri=',
            uid: 'sembeacon-worker-service',
            timeout: 15000,
            minTimeout: 60000,
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
