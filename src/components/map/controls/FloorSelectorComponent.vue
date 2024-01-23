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
import Button from 'ol-ext/control/Button';
import { Floor } from '@openhps/geospatial';

@Options({
    components: {},
})
export default class FloorSelectorComponent extends Vue {
    @Inject() map: Map;
    @Inject() mapEdit: boolean = false;
    mainBar: Bar;
    editBar: Bar;
    @Prop() floors: Floor[];

    @Watch('floors')
    onFloorsChange(floors: Floor[]): void {
        this.clear();
        if (floors.length > 1 || (floors.length === 1 && floors[0].floorLevel !== undefined)) {
            floors.forEach((floor) => {
                this.addFloor(floor);
            });
            const toggle = this.mainBar.getControls()[0] as Toggle;
            toggle.setActive(true);
        } else {
            this.hide();
        }
        this.$emit('change', floors[0], true);
    }

    @Watch('mapEdit')
    onEdit(edit: boolean): void {
        if (edit) {
            this.map.addControl(this.editBar);
        } else {
            this.map.removeControl(this.editBar);
        }
    }

    show(): void {
        if (this.mainBar.getControls().length === 0) {
            // Do not show when empty
            return;
        } 
        if (this.mapEdit) {
            this.map.addControl(this.editBar);
        }
        this.map.addControl(this.mainBar);
    }

    hide(): void {
        this.map.removeControl(this.editBar);
        this.map.removeControl(this.mainBar);
    }

    mounted(): void {
        this.editBar = new Bar();
        this.editBar.setPosition('top-left');
        this.editBar.addControl(
            new Button({
                html: `<ion-icon name="layers-outline"></ion-icon>`,
                title: 'Add a floor',
                className: 'add-btn',
                handleClick: () => {},
            }),
        );
        if (this.mapEdit) {
            this.map.addControl(this.editBar);
        }

        this.mainBar = new Bar({ toggleOne: true });
        this.mainBar.setPosition('top-left');
    }

    addFloor(floor: Floor): void {
        const toggle = new Toggle({
            html:
                floor.displayName.length > 4
                    ? (floor.floorLevel ?? '?').toString()
                    : floor.displayName,
            onToggle: (isSelected) => {
                this.$emit('change', floor, isSelected);
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

<style scoped>
</style>