// Mock for @sembeacon/openhps
const BLESemBeacon = class BLESemBeacon {
    constructor() {}
    clone() { return this; }
    computeUID() { return 'test-uid'; }
    setFlag(flag) {}
};

module.exports = {
    BLESemBeacon,
    BLESemBeaconBuilder: {
        create: () => ({
            namespaceId: () => module.exports.BLESemBeaconBuilder.create(),
            instanceId: () => module.exports.BLESemBeaconBuilder.create(),
            resourceUri: () => module.exports.BLESemBeaconBuilder.create(),
            displayName: () => module.exports.BLESemBeaconBuilder.create(),
            flag: () => module.exports.BLESemBeaconBuilder.create(),
            calibratedRSSI: () => module.exports.BLESemBeaconBuilder.create(),
            shortResourceUri: () => module.exports.BLESemBeaconBuilder.create(),
            url: () => module.exports.BLESemBeaconBuilder.create(),
            build: () => Promise.resolve(new BLESemBeacon()),
            fromBeacon: () => module.exports.BLESemBeaconBuilder.create(),
        }),
    },
    SemBeaconService: class SemBeaconService {
        constructor(driver, opts) {}
        findAll() { return Promise.resolve([]); }
        deleteAll() {}
        resolve(beacon, options) { return Promise.resolve({ result: new BLESemBeacon(), beacons: [] }); }
    },
    SEMBEACON_FLAG_MOVING: 0x01,
    SEMBEACON_FLAG_HAS_POSITION: 0x02,
    SEMBEACON_FLAG_HAS_SYSTEM: 0x04,
    ResolveOptions: {},
};
