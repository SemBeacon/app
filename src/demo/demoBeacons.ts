import {
    BLEAltBeaconBuilder,
    BLEBeaconObject,
    BLEEddystoneTLM,
    BLEEddystoneTLMBuilder,
    BLEEddystoneURLBuilder,
    BLEiBeaconBuilder,
    BLEUUID,
} from '@openhps/rf';
import {
    BLESemBeaconBuilder,
    SEMBEACON_FLAG_HAS_POSITION,
    SEMBEACON_FLAG_HAS_SYSTEM,
} from '@sembeacon/openhps';

/** Namespace / proximity UUID of the SemBeacon demo building. */
export const DEMO_NAMESPACE = '77f340db-ac0d-20e8-aa3a-f656a29f236c';

/** Scan info reported for every demo beacon. */
export const DEMO_SCAN_INFO = { rssi: -64, distance: 1.5 };

function withUID<T extends BLEBeaconObject>(beacon: T): T {
    // Eddystone-TLM frames carry no identifier, so computeUID() is random;
    // a fixed UID keeps the demo data identical between runs.
    beacon.uid = beacon instanceof BLEEddystoneTLM ? 'demo-eddystone-tlm' : beacon.computeUID();
    return beacon;
}

/**
 * One beacon of every supported type. The SemBeacons resolve to the demo building
 * (https://bit.ly/3JsEnF9) and the author's Solid profile.
 */
export async function createDemoBeacons(): Promise<BLEBeaconObject[]> {
    const namespace = BLEUUID.fromString(DEMO_NAMESPACE);
    const beacons = await Promise.all<BLEBeaconObject>([
        BLESemBeaconBuilder.create()
            .namespaceId(namespace)
            .instanceId('c187d748')
            .calibratedRSSI(-56)
            .shortResourceUri('https://bit.ly/3JsEnF9')
            .flag(SEMBEACON_FLAG_HAS_POSITION)
            .flag(SEMBEACON_FLAG_HAS_SYSTEM)
            .build(),
        BLESemBeaconBuilder.create()
            .resourceUri('https://solid.maximvdw.be/profile/card#me')
            .instanceId(0x01)
            .calibratedRSSI(-56)
            .build(),
        BLEiBeaconBuilder.create()
            .proximityUUID(namespace)
            .calibratedRSSI(-56)
            .major(51243)
            .minor(14124)
            .build(),
        BLEAltBeaconBuilder.create()
            .proximityUUID(namespace)
            .major(51243)
            .manufacturerId(0x0118)
            .minor(14124)
            .calibratedRSSI(-56)
            .build(),
        BLEEddystoneURLBuilder.create().calibratedRSSI(-56).url('https://maximvdw.be').build(),
        BLEEddystoneTLMBuilder.create()
            .calibratedRSSI(-56)
            .voltage(3215)
            .temperature(25.91)
            .uptime(5)
            .advertiseCount(100)
            .build(),
    ]);
    return beacons.map(withUID);
}

/** Beacons shown in the simulator in demo mode (types that can be advertised). */
export async function createDemoSimulatedBeacons(): Promise<BLEBeaconObject[]> {
    const namespace = BLEUUID.fromString(DEMO_NAMESPACE);
    const beacons = await Promise.all<BLEBeaconObject>([
        BLESemBeaconBuilder.create()
            .namespaceId(namespace)
            .instanceId('c187d748')
            .calibratedRSSI(-56)
            .shortResourceUri('https://bit.ly/3JsEnF9')
            .flag(SEMBEACON_FLAG_HAS_POSITION)
            .flag(SEMBEACON_FLAG_HAS_SYSTEM)
            .build(),
        BLEiBeaconBuilder.create()
            .proximityUUID(namespace)
            .calibratedRSSI(-56)
            .major(1)
            .minor(42)
            .build(),
        BLEEddystoneURLBuilder.create().calibratedRSSI(-56).url('https://sembeacon.org').build(),
    ]);
    return beacons.map(withUID);
}
