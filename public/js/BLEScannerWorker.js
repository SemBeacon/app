import { 
    ModelBuilder,
    FrameFilterNode,
} from "./vendor/openhps/openhps-core.es.min.js";
import {
    RelativeRSSIProcessing,
    BLEBeaconClassifierNode,
    PropagationModel,
    BLEAltBeacon, BLEiBeacon, BLEEddystoneURL, BLEEddystoneUID, BLEEddystoneTLM,
    BLEBeaconObject
} from "/js/vendor/openhps/openhps-rf.es.min.js";
import {
    BLESemBeacon,
    SemBeaconService
} from "/js/vendor/openhps/sembeacon-openhps.es.min.js";
import {
    LocalStorageDriver
} from "/js/vendor/openhps/openhps-localstorage.es.min.js";

export default ModelBuilder.create()
    .addService(new SemBeaconService(
        new LocalStorageDriver(BLESemBeacon, {
          namespace: 'sembeacon',
        }),
        {
          accessToken: '2cd7bc12126759042bfb3ebe1160aafda0bc65df',
          cors: true,
        },
    ))
    .from()
    .via(
        new BLEBeaconClassifierNode({
            resetUID: true,
            types: [BLESemBeacon, BLEAltBeacon, BLEiBeacon, BLEEddystoneURL, BLEEddystoneUID, BLEEddystoneTLM],
        }),
    )
    .via(
        new RelativeRSSIProcessing({
            environmentFactor: 2.0,
            propagationModel: PropagationModel.LOG_DISTANCE,
        }),
    )
    .via(new FrameFilterNode((frame) => {
        return frame.getObjects().filter(b => b instanceof BLEBeaconObject).length > 0;
    }))
    .to();