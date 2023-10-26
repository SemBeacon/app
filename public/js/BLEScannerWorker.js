/**
 * Required for Capacitor plugins in web workers
 */
self.window = self;
self.document = self;

import { 
    ModelBuilder,
    FrameMergeNode,
    FrameFilterNode,
    TimeUnit
} from "./vendor/openhps/openhps-core.es.min.js";
import {
    RelativeRSSIProcessing,
    BLEBeaconClassifierNode,
    PropagationModel,
    BLEAltBeacon, BLEiBeacon, BLEEddystoneURL, BLEEddystoneUID, BLEEddystoneTLM
} from "/js/vendor/openhps/openhps-rf.es.min.js";
import {
    BLESemBeacon
} from "/js/vendor/openhps/sembeacon-openhps.es.min.js";

export default ModelBuilder.create()
    .from()
    .via(new FrameMergeNode((frame) => frame.source.uid, (frame) => frame.uid, {
        timeout: 500,                      // After 500ms, push the frame
        timeoutUnit: TimeUnit.MILLISECOND,
        minCount: 1,                        // Minimum amount of frames to receive
        maxCount: 10                        // Max count can be as big as you want
    }))
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
        return frame.getObjects(BLEBeaconObject).length > 0;
    }))
    .to();