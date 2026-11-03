import { describe, expect, it } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { BLEiBeacon, BLEEddystoneURL } from '@openhps/rf';
import { useBeaconStore } from '@/stores/beacon.scanning';
import { altBeacon, eddystoneURL, iBeacon, DEMO_UUID } from '../fixtures/beacons';

describe('beacon.scanning store', () => {
    it('tracks the proximity UUID of detected iBeacons once', async () => {
        const store = useBeaconStore();
        await store.addBeacon(await iBeacon(1, 1));
        await store.addBeacon(await iBeacon(1, 2));
        expect(store.proximityUUIDs).toEqual([DEMO_UUID]);
    });

    it('persists beacons and their scan info across store instances', async () => {
        const store = useBeaconStore();
        const beacon = await altBeacon();
        store.beaconInfo.set(beacon.uid, { rssi: -70, distance: 2.5, lastSeen: 1000 });
        await store.addBeacon(beacon);

        setActivePinia(createPinia());
        const reloaded = useBeaconStore();
        await reloaded.load();
        expect(reloaded.findBeaconInfo(beacon.uid)).toMatchObject({ rssi: -70, distance: 2.5 });
        expect(reloaded.beacons.get(beacon.uid)?.uid).toBe(beacon.uid);
    });

    it('keeps beacon classes when loading from storage', async () => {
        const store = useBeaconStore();
        const ibeacon = await iBeacon();
        const url = await eddystoneURL();
        store.beaconInfo.set(ibeacon.uid, { rssi: -60, distance: 1, lastSeen: 1 });
        store.beaconInfo.set(url.uid, { rssi: -60, distance: 1, lastSeen: 1 });
        await store.addBeacon(ibeacon);
        await store.addBeacon(url);

        setActivePinia(createPinia());
        const reloaded = useBeaconStore();
        await reloaded.load();
        expect(reloaded.beacons.get(ibeacon.uid)).toBeInstanceOf(BLEiBeacon);
        expect(reloaded.beacons.get(url.uid)).toBeInstanceOf(BLEEddystoneURL);
    });

    it('loads nothing when storage is empty', async () => {
        const store = useBeaconStore();
        await store.load();
        expect(store.cacheSize).toBe(0);
    });

    it('beaconsWithInfo merges the latest scan info', async () => {
        const store = useBeaconStore();
        const beacon = await iBeacon();
        store.beacons.set(beacon.uid, beacon);
        store.beaconInfo.set(beacon.uid, { rssi: -80, distance: 4, lastSeen: 42 });
        const found = store.beaconsWithInfo.find((b) => b.uid === beacon.uid);
        expect(found).toMatchObject({ rssi: -80, distance: 4, lastSeen: 42 });
    });

    it('clear() removes beacons, info and stored data', async () => {
        const store = useBeaconStore();
        const beacon = await iBeacon();
        store.beaconInfo.set(beacon.uid, { rssi: -60, distance: 1, lastSeen: 1 });
        await store.addBeacon(beacon);
        store.clear();
        expect(store.cacheSize).toBe(0);
        expect(store.findBeaconInfo(beacon.uid)).toBeUndefined();
    });
});
