import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { toRaw } from 'vue';
import { IonicVue } from '@ionic/vue';
import BeaconItemComponent from '@/components/beacons/BeaconItemComponent.vue';
import { altBeacon, eddystoneURL, iBeacon } from '../fixtures/beacons';

function mountItem(beacon: unknown) {
    return mount(BeaconItemComponent, {
        props: { beacon },
        global: { plugins: [IonicVue] },
    });
}

describe('BeaconItemComponent', () => {
    it.each([
        ['iBeacon', iBeacon],
        ['AltBeacon', altBeacon],
        ['Eddystone-URL', eddystoneURL],
    ])('shows the %s icon', async (type, create) => {
        const wrapper = mountItem(await create());
        const icon = wrapper.find('ion-thumbnail img');
        expect(icon.attributes('src')).toMatch(new RegExp(`/assets/beacons/${type.toLowerCase()}`));
        wrapper.unmount();
    });

    it('emits clickBeacon with the beacon', async () => {
        const beacon = await iBeacon();
        const wrapper = mountItem(beacon);
        await wrapper.find('ion-grid').trigger('click');
        // The prop arrives as a reactive proxy of the same beacon
        expect(toRaw(wrapper.emitted('clickBeacon')?.[0][0])).toBe(beacon);
        wrapper.unmount();
    });

    it('shows the RSSI when known', async () => {
        const beacon = Object.assign(await iBeacon(), { rssi: -67 });
        const wrapper = mountItem(beacon);
        expect(wrapper.find('.rssi').text()).toContain('-67');
        wrapper.unmount();
    });
});

describe('BeaconItemComponent theming and lifecycle', () => {
    it('uses the light icons on a dark theme setting', async () => {
        const { useSettings } = await import('@/stores/settings');
        useSettings().data.theme = 'DARK';
        const wrapper = mountItem(await iBeacon());
        expect(wrapper.find('ion-thumbnail img').attributes('src')).toBe('/assets/beacons/ibeacon_alpha.svg');
        wrapper.unmount();
    });

    it('stops its refresh timer when unmounted', async () => {
        vi.useFakeTimers();
        const wrapper = mountItem(await iBeacon());
        expect(vi.getTimerCount()).toBeGreaterThan(0);
        wrapper.unmount();
        expect(vi.getTimerCount()).toBe(0);
        vi.useRealTimers();
    });
});
