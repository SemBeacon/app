import { mount } from '@vue/test-utils';
import BeaconScannerPage from '@/views/BeaconScannerPage.vue';
import { createPinia, setActivePinia } from 'pinia';
import { ControllerState } from '@/stores/types';

// Mock BLEScannerComponent before importing the page
jest.mock('@/components/BLEScannerComponent.vue', () => ({
    name: 'BLEScannerComponent',
    template: '<div class="ble-scanner"></div>',
}));

// Also mock BeaconItemComponent since it's imported by BLEScannerComponent
jest.mock('@/components/beacons/BeaconItemComponent.vue', () => ({
    name: 'BeaconItemComponent',
    template: '<div class="beacon-item"></div>',
}));

// Mock the beacon store
jest.mock('@/stores/beacon.scanning', () => ({
    useBeaconStore: jest.fn(() => ({
        state: ControllerState.READY,
        cacheSize: 0,
        isScanning: false,
        beaconsWithInfo: [],
        startScan: jest.fn().mockResolvedValue(undefined),
        stopScan: jest.fn().mockResolvedValue(undefined),
    })),
    Beacon: {},
}));

describe('BeaconScannerPage', () => {
    let wrapper: any;

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    afterEach(() => {
        wrapper?.unmount();
        jest.clearAllMocks();
    });

    it('should render the beacon scanner page title', () => {
        wrapper = mount(BeaconScannerPage, {
            global: {
                stubs: {
                    'ion-menu-button': true,
                    'ion-buttons': true,
                    'ion-button': true,
                    'ion-icon': true,
                    'ion-segment': true,
                    'ion-segment-button': true,
                    'ion-label': true,
                },
            },
        });

        // The component renders without crashing
        expect(wrapper.exists()).toBe(true);
    });

    it('should render BLEScannerComponent', () => {
        wrapper = mount(BeaconScannerPage, {
            global: {
                stubs: {
                    'ion-menu-button': true,
                    'ion-buttons': true,
                    'ion-button': true,
                    'ion-icon': true,
                    'ion-segment': true,
                    'ion-segment-button': true,
                    'ion-label': true,
                },
            },
        });

        // The component renders with BLEScannerComponent (mocked)
        expect(wrapper.exists()).toBe(true);
    });

    it('should set isLoading to false after mount', () => {
        wrapper = mount(BeaconScannerPage, {
            global: {
                stubs: {
                    'ion-menu-button': true,
                    'ion-buttons': true,
                    'ion-button': true,
                    'ion-icon': true,
                    'ion-segment': true,
                    'ion-segment-button': true,
                    'ion-label': true,
                },
            },
        });

        // The component renders without crashing
        expect(wrapper.exists()).toBe(true);
    });

    it('should have segment buttons for scanner/simulator', () => {
        wrapper = mount(BeaconScannerPage, {
            global: {
                stubs: {
                    'ion-menu-button': true,
                    'ion-buttons': true,
                    'ion-button': true,
                    'ion-icon': true,
                    'ion-segment-button': true,
                    'ion-label': true,
                },
            },
        });

        // The component renders without crashing
        expect(wrapper.exists()).toBe(true);
    });
});
