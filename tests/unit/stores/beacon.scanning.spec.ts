import { describe, expect, it } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { BLEiBeacon, BLEEddystoneURL } from '@openhps/rf';
import { useBeaconStore } from '@/stores/beacon.scanning';
import { useSettings } from '@/stores/settings';
import { altBeacon, eddystoneURL, iBeacon, DEMO_UUID } from '../fixtures/beacons';

describe('beacon.scanning store', () => {
    it('registers SemBeacon namespaces as known UUIDs without renaming existing ones', async () => {
        const settings = useSettings();
        settings.data.uuids = { [DEMO_UUID]: { name: 'My building' } };
        const store = useBeaconStore();
        await store.addUUID(DEMO_UUID);
        await store.addUUID('B9407F30-F5F8-466E-AFF9-25556B57FE6D ');
        expect(settings.data.uuids[DEMO_UUID].name).toBe('My building');
        expect(settings.data.uuids['b9407f30-f5f8-466e-aff9-25556b57fe6d']).toMatchObject({
            automatic: true,
        });
    });

    it('persists beacons and their scan info across store instances', async () => {
        const store = useBeaconStore();
        const beacon = await altBeacon();
        store.beaconInfo.set(beacon.uid, { rssi: -70, distance: 2.5, lastSeen: 1000 });
        await store.addBeacon(beacon);
        await store.save();

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
        await store.save();

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

describe('beacon.scanning findByUID', () => {
    it('finds detected beacons without a scanner model', async () => {
        const store = useBeaconStore();
        const beacon = await iBeacon();
        store.beacons.set(beacon.uid, beacon);
        const found = await store.findByUID(beacon.uid);
        expect(found).toBeInstanceOf(BLEiBeacon);
        expect(found?.uid).toBe(beacon.uid);
    });

    it('falls back to persisted beacons', async () => {
        const store = useBeaconStore();
        const beacon = await altBeacon();
        store.beaconInfo.set(beacon.uid, { rssi: -60, distance: 1, lastSeen: 1 });
        await store.addBeacon(beacon);
        await store.save();

        setActivePinia(createPinia());
        const found = await useBeaconStore().findByUID(beacon.uid);
        expect(found?.uid).toBe(beacon.uid);
    });

    it('resolves undefined for unknown beacons', async () => {
        await expect(useBeaconStore().findByUID('unknown')).resolves.toBeUndefined();
    });
});
