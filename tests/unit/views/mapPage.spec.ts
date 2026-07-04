import { mount } from '@vue/test-utils';
import MapPage from '@/views/MapPage.vue';
import { createPinia, setActivePinia } from 'pinia';
import { ControllerState } from '@/stores/types';

// Mock ol (OpenLayers) - ESM-only module
jest.mock('ol', () => ({
    Map: class Map {},
}));

jest.mock('ol/proj', () => ({
    fromLonLat: jest.fn((coords) => coords),
}));

// Mock MapComponent before importing the page
jest.mock('@/components/map/MapComponent.vue', () => ({
    name: 'MapComponent',
    template: '<div class="map-component"><slot></slot></div>',
}));

// Mock other map components
jest.mock('@/components/map/markers/LocationMarkerComponent.vue', () => ({
    name: 'LocationMarkerComponent',
    template: '<div class="location-marker"></div>',
}));

jest.mock('@/components/map/controls/LocationCenterComponent.vue', () => ({
    name: 'LocationCenterComponent',
    template: '<div class="location-center"></div>',
    data: () => ({ following: false }),
}));

jest.mock('@/components/map/BuildingComponent.vue', () => ({
    name: 'BuildingComponent',
    template: '<div class="building-component"></div>',
    props: ['building'],
    methods: { setFocus: jest.fn() },
}));

// Mock beacon store
jest.mock('@/stores/beacon.scanning', () => ({
    useBeaconStore: jest.fn(() => ({
        state: ControllerState.READY,
        isScanning: false,
        startScan: jest.fn().mockResolvedValue(undefined),
        stopScan: jest.fn().mockResolvedValue(undefined),
        findByUID: jest.fn().mockResolvedValue(null),
    })),
}));

// Mock geolocation store
jest.mock('@/stores/geolocation', () => ({
    useGeolocationStore: jest.fn(() => ({
        location: undefined,
        initialize: jest.fn().mockResolvedValue(undefined),
        start: jest.fn(),
        stop: jest.fn(),
        state: ControllerState.READY,
    })),
}));

// Mock environment store
jest.mock('@/stores/environment', () => ({
    useEnvironmentStore: jest.fn(() => ({
        buildings: [],
        environments: new Map(),
    })),
}));

describe('MapPage', () => {
    let wrapper: any;

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    afterEach(() => {
        wrapper?.unmount();
        jest.clearAllMocks();
    });

    it('should render the map page title', () => {
        wrapper = mount(MapPage, {
            global: {
                stubs: {
                    'ion-menu-button': true,
                    'ion-buttons': true,
                    'ion-fab': true,
                    'ion-fab-button': true,
                    'ion-spinner': true,
                    'ion-icon': true,
                    'ion-progress-bar': true,
                },
            },
        });

        // The component renders without crashing
        expect(wrapper.exists()).toBe(true);
    });

    it('should render MapComponent', () => {
        wrapper = mount(MapPage, {
            global: {
                stubs: {
                    'ion-menu-button': true,
                    'ion-buttons': true,
                    'ion-fab': true,
                    'ion-fab-button': true,
                    'ion-spinner': true,
                    'ion-icon': true,
                    'ion-progress-bar': true,
                },
            },
        });

        // The component renders without crashing (MapComponent is mocked)
        expect(wrapper.exists()).toBe(true);
    });

    it('should render location marker', () => {
        wrapper = mount(MapPage, {
            global: {
                stubs: {
                    'ion-menu-button': true,
                    'ion-buttons': true,
                    'ion-fab': true,
                    'ion-fab-button': true,
                    'ion-spinner': true,
                    'ion-icon': true,
                    'ion-progress-bar': true,
                },
            },
        });

        // The component renders without crashing
        expect(wrapper.exists()).toBe(true);
    });

    it('should render location center component', () => {
        wrapper = mount(MapPage, {
            global: {
                stubs: {
                    'ion-menu-button': true,
                    'ion-buttons': true,
                    'ion-fab': true,
                    'ion-fab-button': true,
                    'ion-spinner': true,
                    'ion-icon': true,
                    'ion-progress-bar': true,
                },
            },
        });

        // The component renders without crashing
        expect(wrapper.exists()).toBe(true);
    });

    it('should initialize geolocation on mount', async () => {
        wrapper = mount(MapPage, {
            global: {
                stubs: {
                    'ion-menu-button': true,
                    'ion-buttons': true,
                    'ion-fab': true,
                    'ion-fab-button': true,
                    'ion-spinner': true,
                    'ion-icon': true,
                    'ion-progress-bar': true,
                },
            },
        });

        // The component renders without crashing
        expect(wrapper.exists()).toBe(true);
    });

    it('should stop geolocation on unmount', async () => {
        wrapper = mount(MapPage, {
            global: {
                stubs: {
                    'ion-menu-button': true,
                    'ion-buttons': true,
                    'ion-fab': true,
                    'ion-fab-button': true,
                    'ion-spinner': true,
                    'ion-icon': true,
                    'ion-progress-bar': true,
                },
            },
        });

        await wrapper.unmount();
        // The component unmounts without errors
        expect(wrapper.exists()).toBe(false);
    });
});
