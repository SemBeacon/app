<template>
    <div>
        <slot></slot>
    </div>
</template>

<script lang="ts">
import { Vue, Options, Inject, Watch, Prop } from 'vue-property-decorator';
import type { Map } from 'ol';
import Bar from 'ol-ext/control/Bar';
import Toggle from 'ol-ext/control/Toggle';
import { Floor } from '@openhps/geospatial';

@Options({
    components: {},
})
export default class FloorSelectorComponent extends Vue {
    @Inject() map: Map;
    mainBar: Bar;
    @Prop() floors: Floor[];

    @Watch('floors')
    onFloorsChange(floors: Floor[]): void {
        this.clear();
        floors.forEach((floor) => {
            this.addFloor(floor);
        });
        const toggle = this.mainBar.getControls()[0] as Toggle;
        toggle.setActive(true);
        this.$emit("change", floors[0], true);
    }

    show(): void {
        this.map.addControl(this.mainBar);
    }

    hide(): void {
        this.map.removeControl(this.mainBar);
    }

    mounted(): void {
        this.mainBar = new Bar({ toggleOne: true });
        this.mainBar.setPosition('top-left');
    }

    addFloor(floor: Floor): void {
        const toggle = new Toggle({
            html: floor.displayName.length > 3 ? (floor.floorLevel ?? 0).toString() : floor.displayName,
            onToggle: (isSelected) => {
                this.$emit("change", floor, isSelected);
            },
        });
        this.mainBar.addControl(toggle);
    }

    clear(): void {
        this.mainBar.getControls().forEach((control) => {
            (this.mainBar as any).removeControl(control);
        });
    }
}
</script>
