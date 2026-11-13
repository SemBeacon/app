import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import type { Floor } from '@openhps/geospatial';
import FloorSelectorComponent from '@/components/map/controls/FloorSelectorComponent.vue';

function floor(uid: string, displayName: string, floorLevel: number): Floor {
    return { uid, displayName, floorLevel } as unknown as Floor;
}

function fakeMap() {
    return {
        added: [] as unknown[],
        addControl(control: { getMap: () => unknown }) {
            control.getMap = () => this;
            this.added.push(control);
        },
        removeControl() {
            // no-op
        },
    };
}

function mountSelector(floors: Floor[], selected?: Floor) {
    return mount(FloorSelectorComponent, {
        props: { floors, selected },
        global: {
            provide: { map: fakeMap(), mapEdit: false },
        },
    });
}

type Selector = InstanceType<typeof FloorSelectorComponent>;

describe('FloorSelectorComponent', () => {
    it('creates one button per floor and highlights the selected floor', () => {
        const floors = [floor('a', 'Ground', 0), floor('b', 'First', 1)];
        const wrapper = mountSelector(floors, floors[0]);
        const vm = wrapper.vm as unknown as Selector;

        expect(vm.buttons.size).toBe(2);
        expect(vm.buttons.get('a').element.classList.contains('ol-active')).toBe(true);
        expect(vm.buttons.get('b').element.classList.contains('ol-active')).toBe(false);
        expect(
            vm.buttons.get('a').element.querySelector('button')?.getAttribute('aria-pressed'),
        ).toBe('true');
        expect(
            vm.buttons.get('b').element.querySelector('button')?.getAttribute('aria-pressed'),
        ).toBe('false');
        wrapper.unmount();
    });

    it('keeps exactly one floor active when another floor is selected', () => {
        const floors = [floor('a', 'Ground', 0), floor('b', 'First', 1)];
        const wrapper = mountSelector(floors, floors[0]);
        const vm = wrapper.vm as unknown as Selector;

        vm.setSelected(floors[1]);
        expect(vm.buttons.get('a').element.classList.contains('ol-active')).toBe(false);
        expect(vm.buttons.get('b').element.classList.contains('ol-active')).toBe(true);
        expect(
            vm.buttons.get('a').element.querySelector('button')?.getAttribute('aria-pressed'),
        ).toBe('false');
        wrapper.unmount();
    });

    it('emits the selected floor when a button is clicked', () => {
        const floors = [floor('a', 'Ground', 0), floor('b', 'First', 1)];
        const wrapper = mountSelector(floors, floors[0]);
        const vm = wrapper.vm as unknown as Selector;

        vm.buttons.get('b').element.querySelector('button')?.click();
        expect(wrapper.emitted('change')?.[0]).toEqual([floors[1], true]);
        wrapper.unmount();
    });

    it('rebuilds the buttons when the floors change and keeps the selection', async () => {
        const floors = [floor('a', 'Ground', 0), floor('b', 'First', 1)];
        const wrapper = mountSelector(floors, floors[1]);
        const vm = wrapper.vm as unknown as Selector;

        await wrapper.setProps({ floors: [...floors, floor('c', 'Second', 2)] });
        expect(vm.buttons.size).toBe(3);
        expect(vm.buttons.get('b').element.classList.contains('ol-active')).toBe(true);
        wrapper.unmount();
    });

    it('disambiguates floors with the same level label', () => {
        const floors = [floor('a', 'Level 3 East', 3), floor('b', 'Level 3 West', 3)];
        const wrapper = mountSelector(floors, floors[0]);
        const vm = wrapper.vm as unknown as Selector;

        expect(vm.buttons.get('a').element.textContent).toBe('Level 3 East');
        expect(vm.buttons.get('b').element.textContent).toBe('Level 3 West');
        wrapper.unmount();
    });

    it('shows the selector when floors finish loading after it is focused', async () => {
        const map = fakeMap();
        const wrapper = mount(FloorSelectorComponent, {
            props: { floors: [] },
            global: { provide: { map, mapEdit: false } },
        });
        const vm = wrapper.vm as unknown as Selector;

        vm.show();
        expect(map.added).toHaveLength(0);

        const floors = [floor('a', 'Ground', 0)];
        await wrapper.setProps({ floors });
        expect(map.added).toContain(vm.mainBar);
        wrapper.unmount();
    });
});
