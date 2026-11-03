import {
    BLEUUID,
    BLEiBeaconBuilder,
    BLEAltBeaconBuilder,
    BLEEddystoneURLBuilder,
    BLEEddystoneTLMBuilder,
    BLEBeaconObject,
} from '@openhps/rf';

export const DEMO_UUID = '77f340db-ac0d-20e8-aa3a-f656a29f236c';

async function withUID<T extends BLEBeaconObject>(beacon: Promise<T>): Promise<T> {
    const b = await beacon;
    b.uid = b.computeUID();
    return b;
}

export function iBeacon(major = 1, minor = 2, uuid = DEMO_UUID) {
    return withUID(
        BLEiBeaconBuilder.create()
            .proximityUUID(BLEUUID.fromString(uuid))
            .major(major)
            .minor(minor)
            .calibratedRSSI(-56)
            .build(),
    );
}

export function altBeacon(major = 3, minor = 4) {
    return withUID(
        BLEAltBeaconBuilder.create()
            .proximityUUID(BLEUUID.fromString(DEMO_UUID))
            .manufacturerId(0x0118)
            .major(major)
            .minor(minor)
            .calibratedRSSI(-56)
            .build(),
    );
}

export function eddystoneURL(url = 'https://example.org') {
    return withUID(BLEEddystoneURLBuilder.create().calibratedRSSI(-56).url(url).build());
}

export function eddystoneTLM() {
    return withUID(BLEEddystoneTLMBuilder.create().calibratedRSSI(-56).voltage(3000).build());
}
