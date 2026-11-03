import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { ControllerState } from '@/stores/types';

vi.mock('@capacitor/core', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@capacitor/core')>();
    return { ...actual, Capacitor: { ...actual.Capacitor, getPlatform: () => 'android' } };
});

const bluetoothle = {
    requestPermissionBtAdvertise: vi.fn(),
    initialize: vi.fn(),
    isAdvertising: vi.fn((success: (r: { isAdvertising: boolean }) => void) =>
        success({ isAdvertising: false }),
    ),
};

let useBeaconAdvertisingStore: typeof import('@/stores/beacon.advertising').useBeaconAdvertisingStore;

beforeAll(async () => {
    // The store captures window.bluetoothle when the module is evaluated
    (window as any).bluetoothle = bluetoothle;
    ({ useBeaconAdvertisingStore } = await import('@/stores/beacon.advertising'));
});

beforeEach(() => {
    bluetoothle.requestPermissionBtAdvertise.mockImplementation((success) =>
        success({ requestPermission: true }),
    );
});

describe('beacon.advertising on Android', () => {
    it('settles and becomes READY when Bluetooth is enabled', async () => {
        bluetoothle.initialize.mockImplementation((callback) => callback({ status: 'enabled' }));
        const store = useBeaconAdvertisingStore();
        await store.initialize();
        expect(store.state).toBe(ControllerState.READY);
    });

    it('rejects and becomes DISABLED when Bluetooth is off', async () => {
        bluetoothle.initialize.mockImplementation((callback) => callback({ status: 'disabled' }));
        const store = useBeaconAdvertisingStore();
        await expect(store.initialize()).rejects.toThrow(/disabled/);
        expect(store.state).toBe(ControllerState.DISABLED);
    });

    it('rejects and becomes NO_PERMISSION without advertise permission', async () => {
        bluetoothle.requestPermissionBtAdvertise.mockImplementation((success) =>
            success({ requestPermission: false }),
        );
        const store = useBeaconAdvertisingStore();
        await expect(store.initialize()).rejects.toThrow(/permission/i);
        expect(store.state).toBe(ControllerState.NO_PERMISSION);
    });
});
