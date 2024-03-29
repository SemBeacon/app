<template>
    <div>
        <slot></slot>

        <!-- Floor -->
        <floor-component
            v-for="floor in floors"
            ref="floorRef"
            :key="floor.uid"
            :floor="floor"
            :selected="floor.uid === selectedFloor.uid"
        >
        </floor-component>

        <!-- Building Controls -->
        <floor-selector-component ref="floorSelector" :floors="floors" @change="onFloorChange">
        </floor-selector-component>
    </div>
</template>

<script lang="ts">
import { Vue, Options, Inject, Prop, Ref } from 'vue-property-decorator';
import type { Map } from 'ol';
import { Building, Floor } from '@openhps/geospatial';
import FloorSelectorComponent from './controls/FloorSelectorComponent.vue';
import { useEnvironmentStore } from '../../stores/environment';
import FloorComponent from './FloorComponent.vue';
import { Coordinate } from 'ol/coordinate';
import { GeographicalPosition } from '@openhps/core';
import { toRaw } from 'vue';

@Options({
    components: {
        FloorSelectorComponent,
        FloorComponent,
    },
})
export default class BuildingComponent extends Vue {
    @Inject() map: Map;
    @Prop() building: Building;
    focus: boolean = false;
    @Ref('floorRef') floorRef: FloorComponent;
    @Ref('floorSelector') floorSelector: FloorSelectorComponent;
    environmentStore = useEnvironmentStore();
    floors: Floor[] = [];
    selectedFloor: Floor = { uid: undefined } as Floor;

    mounted(): void {
        // Find all floors in the building
        this.environmentStore
            .fetchChildren(this.building)
            .then((floors) => {
                this.floors = floors
                    .filter((f) => f instanceof Floor)
                    .map((s) => toRaw(s)) as Floor[];
                if (this.floors.length > 0) {
                    // Select the first floor
                    this.selectedFloor = this.floors[0];
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }

    /**
     * Triggers when a floor is selected or deselected
     * @param floor Floor that was selected
     * @param selected Whether the floor was selected or deselected
     */
    onFloorChange(floor: Floor, selected: boolean): void {
        if (selected && this.selectedFloor.uid !== floor.uid) {
            this.selectedFloor = floor;
        }
    }

    /**
     * Focus on a building when in view
     * @param focus
     */
    setFocus(focus: boolean) {
        if (this.focus !== focus) {
            this.focus = focus;

            if (this.focus) {
                this.floorSelector.show();
                this.$emit('focus', this.building);
            } else {
                this.floorSelector.hide();
                this.$emit('lostfocus', this.building);
            }
        }
    }

    get center(): Coordinate {
        return (this.building.getPosition() as GeographicalPosition).toVector3().toArray();
    }
}
</script>

<style scoped>

</style>