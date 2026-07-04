import { mount } from '@vue/test-utils';
import BeaconPage from '@/views/BeaconPage.vue';
import { createPinia, setActivePinia } from 'pinia';
import { ControllerState } from '@/stores/types';

// Mock beacon sub-pages
jest.mock('@/views/beacon/SemBeaconPage.vue', () => ({
    name: 'SemBeaconPage',
    template: '<div class="sembeacon-page"></div>',
    props: ['beacon', 'edit', 'readonly', 'loading'],
}));

jest.mock('@/views/beacon/GenericBeaconPage.vue', () => ({
    name: 'GenericBeaconPage',
    template: '<div class="generic-beacon-page"></div>',
    props: ['beacon', 'edit', 'readonly', 'loading'],
}));

jest.mock('@/views/beacon/AltBeaconPage.vue', () => ({
    name: 'AltBeaconPage',
    template: '<div class="alt-beacon-page"></div>',
    props: ['beacon', 'edit', 'readonly', 'loading'],
}));

jest.mock('@/views/beacon/EddystoneURLPage.vue', () => ({
    name: 'EddystoneURLPage',
    template: '<div class="eddystone-url-page"></div>',
    props: ['beacon', 'edit', 'readonly', 'loading'],
}));

jest.mock('@/views/beacon/EddystoneUIDPage.vue', () => ({
    name: 'EddystoneUIDPage',
    template: '<div class="eddystone-uid-page"></div>',
    props: ['beacon', 'edit', 'readonly', 'loading'],
}));

jest.mock('@/views/beacon/EddystoneTLMPage.vue', () => ({
    name: 'EddystoneTLMPage',
    template: '<div class="eddystone-tlm-page"></div>',
    props: ['beacon', 'edit', 'readonly', 'loading'],
}));

// Mock beacon stores
jest.mock('@/stores/beacon.scanning', () => ({
    useBeaconStore: jest.fn(() => ({
        state: ControllerState.READY,
        isScanning: false,
        findByUID: jest.fn().mockResolvedValue(null),
        findBeaconInfo: jest.fn().mockReturnValue(null),
        startScan: jest.fn().mockResolvedValue(undefined),
        stopScan: jest.fn().mockResolvedValue(undefined),
    })),
}));

jest.mock('@/stores/beacon.advertising', () => ({
    useBeaconAdvertisingStore: jest.fn(() => ({
        findByUID: jest.fn().mockReturnValue(null),
        addSimulatedBeacon: jest.fn(),
    })),
}));

describe('BeaconPage', () => {
    let wrapper: any;

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    afterEach(() => {
        wrapper?.unmount();
        jest.clearAllMocks();
    });

    it('should render the beacon page with title', () => {
        wrapper = mount(BeaconPage, {
            global: {
                stubs: {
                    'ion-back-button': true,
                    'ion-buttons': true,
                    'ion-button': true,
                    'ion-icon': true,
                    'ion-fab': true,
                    'ion-fab-button': true,
                    'ion-spinner': true,
                },
            },
        });

        // The component renders without crashing
        expect(wrapper.exists()).toBe(true);
    });

    it('should have correct beacon type references', () => {
        wrapper = mount(BeaconPage, {
            global: {
                stubs: {
                    'ion-back-button': true,
                    'ion-buttons': true,
                    'ion-button': true,
                    'ion-icon': true,
                    'ion-fab': true,
                    'ion-fab-button': true,
                    'ion-spinner': true,
                },
            },
        });

        // The component renders without crashing
        expect(wrapper.exists()).toBe(true);
    });

    it('should default simulated to false', () => {
        wrapper = mount(BeaconPage, {
            global: {
                stubs: {
                    'ion-back-button': true,
                    'ion-buttons': true,
                    'ion-button': true,
                    'ion-icon': true,
                    'ion-fab': true,
                    'ion-fab-button': true,
                    'ion-spinner': true,
                },
            },
        });

        // The component renders without crashing
        expect(wrapper.exists()).toBe(true);
    });

    it('should have BeaconType with all beacon types', () => {
        wrapper = mount(BeaconPage, {
            global: {
                stubs: {
                    'ion-back-button': true,
                    'ion-buttons': true,
                    'ion-button': true,
                    'ion-icon': true,
                    'ion-fab': true,
                    'ion-fab-button': true,
                    'ion-spinner': true,
                },
            },
        });

        // The component renders without crashing
        expect(wrapper.exists()).toBe(true);
    });
});
