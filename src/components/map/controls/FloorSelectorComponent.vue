<template>
    <div>
        <slot></slot>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Inject, Watch, Prop } from 'vue-facing-decorator';
import type { Map } from 'ol';
import Bar from 'ol-ext/control/Bar';
import Button from 'ol-ext/control/Button';
import { Floor } from '@openhps/geospatial';

/**
 * Floor selector component
 *
 * The floor buttons are OpenLayers controls (so they live with the other map controls), but the
 * selected state is managed here: ol-ext's toggleOne left the previous floor highlighted when
 * another floor was selected.
 */
@Component({
    components: {},
})
export default class FloorSelectorComponent extends Vue {
    @Inject() map: Map;
    @Inject() mapEdit: boolean = false;
    mainBar: Bar;
    editBar: Bar;
    @Prop() floors: Floor[];
    @Prop() selected?: Floor;
    /** Whether the selector should be attached to the map (a building is focused). */
    visible: boolean = false;
    /** The button of every floor, by floor UID. */
    buttons: Map<string, Button> = new Map();

    @Watch('floors')
    onFloorsChange(): void {
        this.rebuild();
    }

    @Watch('selected')
    onSelectedChange(floor?: Floor): void {
        this.setSelected(floor);
    }

    @Watch('mapEdit')
    onEdit(edit: boolean): void {
        if (edit) {
            if (this.visible && !this.editBar.getMap()) {
                this.map.addControl(this.editBar);
            }
        } else if (this.editBar.getMap()) {
            this.map.removeControl(this.editBar);
        }
    }

    show(): void {
        this.visible = true;
        if (this.mainBar.getControls().length === 0) {
            // Do not show an empty selector; floors are added later by onFloorsChange
            return;
        }
        if (this.mapEdit && !this.editBar.getMap()) {
            this.map.addControl(this.editBar);
        }
        if (!this.mainBar.getMap()) {
            this.map.addControl(this.mainBar);
        }
    }

    hide(): void {
        this.visible = false;
        if (this.mainBar.getMap()) {
            this.map.removeControl(this.mainBar);
        }
        if (this.editBar.getMap()) {
            this.map.removeControl(this.editBar);
        }
    }

    mounted(): void {
        this.editBar = new Bar();
        this.editBar.setPosition('top-left');
        this.editBar.addControl(
            new Button({
                html: `<ion-icon name="layers-outline"></ion-icon>`,
                title: 'Add a floor',
                className: 'add-btn',
                handleClick: () => this.$emit('addFloor'),
            }),
        );
        if (this.mapEdit) {
            this.map.addControl(this.editBar);
        }

        this.mainBar = new Bar();
        this.mainBar.setPosition('top-left');
        this.rebuild();
    }

    /** Rebuild the floor buttons, e.g. when the building's floors finished loading. */
    rebuild(): void {
        // Removal mutates the controls array: iterate over a copy
        [...this.mainBar.getControls()].forEach((control) => {
            this.mainBar.removeControl(control);
            control.element?.remove();
        });
        this.buttons.clear();

        this.floors?.forEach((floor) => this.addFloor(floor));
        this.setSelected(this.selected);
        if (this.visible) {
            this.show();
        }
    }

    addFloor(floor: Floor): void {
        const span = document.createElement('span');
        span.textContent = this.label(floor);
        const title = this.title(floor);
        const button = new Button({
            html: span,
            title,
            className: 'floor-toggle',
            attributes: {
                'aria-label': title,
                'aria-pressed': 'false',
            },
            handleClick: () => {
                this.$emit('change', floor, true);
            },
        });
        this.buttons.set(floor.uid, button);
        this.mainBar.addControl(button);
    }

    /** Highlight only the selected floor. */
    setSelected(floor?: Floor): void {
        this.buttons.forEach((button, uid) => {
            const active = floor?.uid === uid;
            button.element.classList.toggle('ol-active', active);
            button.element.querySelector('button')?.setAttribute('aria-pressed', String(active));
        });
    }

    /**
     * Short label for the button: the floor level when the name is long, the name otherwise.
     * Floors that would get the same label are disambiguated with their display name.
     */
    private label(floor: Floor): string {
        const base = this.baseLabel(floor);
        const ambiguous = this.floors.some(
            (other) => other.uid !== floor.uid && this.baseLabel(other) === base,
        );
        return ambiguous ? floor.displayName || base : base;
    }

    private baseLabel(floor: Floor): string {
        const name = floor.displayName ?? '';
        if (name.length > 4) {
            return (floor.floorLevel ?? '?').toString();
        }
        return name || (floor.floorLevel ?? '?').toString();
    }

    private title(floor: Floor): string {
        const level = floor.floorLevel !== undefined ? ` (level ${floor.floorLevel})` : '';
        return `${floor.displayName || 'Floor'}${level}`;
    }
}
</script>

<style scoped></style>
