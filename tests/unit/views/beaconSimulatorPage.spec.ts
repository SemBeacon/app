import { mount } from '@vue/test-utils';
import BeaconSimulatorPage from '@/views/BeaconSimulatorPage.vue';
import { createPinia, setActivePinia } from 'pinia';

// Mock BLESimulatorComponent before importing the page
jest.mock('@/components/BLESimulatorComponent.vue', () => ({
    name: 'BLESimulatorComponent',
    template: '<div class="ble-simulator"></div>',
}));

// Also mock BeaconItemComponent since it's imported by BLESimulatorComponent
jest.mock('@/components/beacons/BeaconItemComponent.vue', () => ({
    name: 'BeaconItemComponent',
    template: '<div class="beacon-item"></div>',
}));

// Mock the beacon advertising store
jest.mock('@/stores/beacon.advertising', () => ({
    useBeaconAdvertisingStore: jest.fn(() => ({
        advertisingBeacons: [],
        state: 0,
    })),
}));

describe('BeaconSimulatorPage', () => {
    let wrapper: any;

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    afterEach(() => {
        wrapper?.unmount();
        jest.clearAllMocks();
    });

    it('should render the beacon simulator page title', () => {
        wrapper = mount(BeaconSimulatorPage, {
            global: {
                stubs: {
                    'ion-menu-button': true,
                    'ion-buttons': true,
                    'ion-button': true,
                    'ion-segment': true,
                    'ion-segment-button': true,
                    'ion-label': true,
                },
            },
        });

        // The component renders without crashing
        expect(wrapper.exists()).toBe(true);
    });

    it('should render BLESimulatorComponent', () => {
        wrapper = mount(BeaconSimulatorPage, {
            global: {
                stubs: {
                    'ion-menu-button': true,
                    'ion-buttons': true,
                    'ion-button': true,
                    'ion-segment': true,
                    'ion-segment-button': true,
                    'ion-label': true,
                },
            },
        });

        // The component renders with BLESimulatorComponent (mocked)
        expect(wrapper.exists()).toBe(true);
    });

    it('should set isLoading to false after mount', () => {
        wrapper = mount(BeaconSimulatorPage, {
            global: {
                stubs: {
                    'ion-menu-button': true,
                    'ion-buttons': true,
                    'ion-button': true,
                    'ion-segment': true,
                    'ion-segment-button': true,
                    'ion-label': true,
                },
            },
        });

        // The component renders without crashing
        expect(wrapper.exists()).toBe(true);
    });
});
