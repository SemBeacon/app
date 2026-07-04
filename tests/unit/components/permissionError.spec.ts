import { mount } from '@vue/test-utils';

// Mock capacitor-native-settings before importing the component
jest.mock('capacitor-native-settings', () => ({
    NativeSettings: {},
    AndroidSettings: {},
    IOSSettings: {},
}));

import PermissionErrorComponent from '@/components/PermissionErrorComponent.vue';

describe('PermissionErrorComponent', () => {
    it('should render the component without crashing', () => {
        const wrapper = mount(PermissionErrorComponent, {
            slots: {
                default: 'No permission granted!',
            },
        });

        // The component renders without crashing
        expect(wrapper.exists()).toBe(true);
    });

    it('should have danger color styling', () => {
        const wrapper = mount(PermissionErrorComponent, {
            slots: {
                default: 'Error message',
            },
        });

        expect(wrapper.attributes('color')).toBe('danger');
    });
});
