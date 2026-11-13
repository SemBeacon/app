import { describe, expect, it, vi, type Mock } from 'vitest';
import { toRaw } from 'vue';
import { BLEUUID } from '@openhps/rf';
import { BLESemBeaconBuilder } from '@sembeacon/openhps';
import { useBeaconStore } from '@/stores/beacon.scanning';
import { useSettings } from '@/stores/settings';
import { storeBeacon } from '@/services/semBeacon';
import { DEMO_UUID } from '../fixtures/beacons';

vi.mock('@/services/semBeacon', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/services/semBeacon')>();
    return { ...actual, storeBeacon: vi.fn() };
});

/** A SemBeacon as reported by the scanner, before its resource is resolved. */
async function semBeacon() {
    const beacon = await BLESemBeaconBuilder.create()
        .namespaceId(BLEUUID.fromString(DEMO_UUID))
        .instanceId('c187d748')
        .calibratedRSSI(-56)
        .resourceUri('https://example.org/beacon')
        .build();
    beacon.uid = beacon.computeUID();
    return beacon;
}

describe('beacon.scanning SemBeacon resolution', () => {
    it('does not replace a resolved beacon with a raw advertisement', async () => {
        useSettings().data.uuids[DEMO_UUID] = { name: 'Test' };
        const store = useBeaconStore();
        const resolved = await semBeacon();
        const raw = await semBeacon();
        expect(raw.uid).toBe(resolved.uid);
        store.beacons.set(resolved.uid, resolved);
        (storeBeacon as Mock).mockResolvedValue(resolved);

        // Every scan frame reports the raw advertisement again; replacing the resolved
        // beacon would drop its resource data and make the list item flicker.
        const pending = store.addSemBeacon(raw);
        expect(toRaw(store.beacons.get(resolved.uid))).toBe(resolved);
        await pending;
        expect(toRaw(store.beacons.get(resolved.uid))).toBe(resolved);
    });
});
