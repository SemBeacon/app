// Mock for @openhps/rf
function createClass() {
    return class MockClass {
        constructor() {}
        clone() { return this; }
    };
}

module.exports = {
    BLEAltBeacon: createClass(),
    BLEBeaconObject: createClass(),
    BLEEddystone: createClass(),
    BLEEddystoneTLM: createClass(),
    BLEEddystoneUID: createClass(),
    BLEEddystoneURL: createClass(),
    BLEiBeacon: createClass(),
    BLEUUID: { fromString: function(s) { return s; } },
    RelativeRSSI: createClass(),
};
