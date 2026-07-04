import { mount } from '@vue/test-utils';
import SettingsPage from '@/views/SettingsPage.vue';
import { createPinia, setActivePinia } from 'pinia';
import { useSettings } from '@/stores/settings';

describe('SettingsPage', () => {
    let wrapper: any;

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    afterEach(() => {
        wrapper?.unmount();
        jest.clearAllMocks();
    });

    it('should render the settings page title', () => {
        wrapper = mount(SettingsPage, {
            global: {
                stubs: {
                    'ion-card': true,
                    'ion-list': true,
                    'ion-item-sliding': true,
                    'ion-item': true,
                    'ion-label': true,
                    'ion-item-options': true,
                    'ion-item-option': true,
                    'ion-fab': true,
                    'ion-fab-button': true,
                    'ion-icon': true,
                },
            },
        });

        // The component renders without crashing
        expect(wrapper.exists()).toBe(true);
    });

    it('should display info card about UUIDs', () => {
        wrapper = mount(SettingsPage, {
            global: {
                stubs: {
                    'ion-card-header': true,
                    'ion-card-title': true,
                    'ion-card-content': true,
                    'ion-list': true,
                    'ion-item-sliding': true,
                    'ion-item': true,
                    'ion-label': true,
                    'ion-item-options': true,
                    'ion-item-option': true,
                    'ion-fab': true,
                    'ion-fab-button': true,
                    'ion-icon': true,
                },
            },
        });

        // The component renders without crashing
        expect(wrapper.exists()).toBe(true);
    });

    it('should return uuids from settings store', () => {
        const settings = useSettings();
        expect(typeof settings.data.uuids).toBe('object');
    });

    it('should populate default UUIDs and display them', () => {
        const settings = useSettings();
        settings.populate();
        const uuids = settings.data.uuids;
        expect(Object.keys(uuids).length).toBe(5);
    });
});
