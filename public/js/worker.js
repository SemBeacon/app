import { ModelBuilder } from "./vendor/openhps/openhps-core.es.min.js";
import "./vendor/openhps/openhps-rf.es.min.js";
import { BLESemBeacon } from '../src/models/BLESemBeacon';
import {
    BLEBeaconClassifierNode, 
    BLEAltBeacon,
    BLEiBeacon,
    BLEEddystoneUID,
    BLEEddystoneURL,
} from "./vendor/openhps/openhps-rf.es.min.js";

export default ModelBuilder.create()
    .via(new BLEBeaconClassifierNode({
        resetUID: true,
        types: [
            BLESemBeacon,
            BLEAltBeacon,
            BLEiBeacon,
            BLEEddystoneURL,
            BLEEddystoneUID
        ]
    }))
    .to();
