import { beforeAll, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { BLEiBeacon, BLEBeaconObject } from '@openhps/rf';
import { ControllerState } from '@/stores/types';
import { iBeacon, altBeacon } from '../fixtures/beacons';

const bluetoothle = {
    isAdvertising: vi.fn((success: (r: { isAdvertising: boolean }) => void) =>
        success({ isAdvertising: false }),
    ),
    bytesToEncodedString: vi.fn(() => 'AAAA'),
    startAdvertising: vi.fn(),
    stopAdvertising: vi.fn(),
};

let useBeaconAdvertisingStore: typeof import('@/stores/beacon.advertising').useBeaconAdvertisingStore;

beforeAll(async () => {
    // The store captures window.bluetoothle when the module is evaluated
    (window as any).bluetoothle = bluetoothle;
    ({ useBeaconAdvertisingStore } = await import('@/stores/beacon.advertising'));
});

describe('beacon.advertising store', () => {
    it('adds a simulated beacon with default advertising settings', async () => {
        const store = useBeaconAdvertisingStore();
        store.state = ControllerState.READY;
        const beacon = await iBeacon();
        store.addSimulatedBeacon('sim-1', beacon);

        await vi.waitFor(() => expect(store.findByUID('sim-1')).toBeDefined());
        const simulated = store.findByUID('sim-1');
        expect(simulated).toBeInstanceOf(BLEiBeacon);
        expect(simulated).toMatchObject({ advertising: false, latency: 'lowLatency', power: 'high' });
    });

    it('persists simulated beacons', async () => {
        const store = useBeaconAdvertisingStore();
        store.state = ControllerState.READY;
        store.addSimulatedBeacon('sim-2', await altBeacon());
        await vi.waitFor(() => expect(store.findByUID('sim-2')).toBeDefined());
        await store.save();

        setActivePinia(createPinia());
        const reloaded = useBeaconAdvertisingStore();
        await reloaded.load();
        expect(reloaded.findByUID('sim-2')?.uid).toBe('sim-2');
    });

    it('lists only beacons that are advertising', async () => {
        const store = useBeaconAdvertisingStore();
        const a = Object.assign(await iBeacon(1, 1), { advertising: true });
        const b = Object.assign(await iBeacon(1, 2), { advertising: false });
        store.beacons.set('a', a as any);
        store.beacons.set('b', b as any);
        expect(store.advertisingBeacons.map((x) => x.uid)).toEqual([a.uid]);
    });

    it('delete() removes the beacon', async () => {
        const store = useBeaconAdvertisingStore();
        store.state = ControllerState.READY;
        store.beacons.set('x', (await iBeacon()) as any);
        store.delete({ uid: 'x' } as BLEBeaconObject);
        expect(store.findByUID('x')).toBeUndefined();
    });
});
