<template>
    <div>
        <slot></slot>

        <!-- Floor -->
        <floor-component 
            ref="floorRef"
            :floor="selectedFloor">
        </floor-component>

        <!-- Building Controls -->
        <floor-selector-component 
            ref="floorSelector"
            @change="onFloorChange"
            :floors="floors">
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
import MapImageComponent from './editor/MapImageComponent.vue';

@Options({
    components: {
        FloorSelectorComponent,
        FloorComponent
    },
})
export default class BuildingComponent extends Vue {
    @Inject() map: Map;
    @Prop() building: Building;
    focus: boolean = false;
    @Ref("floorRef") floorRef: FloorComponent;
    @Ref("floorSelector") floorSelector: FloorSelectorComponent;
    environmentStore = useEnvironmentStore();
    floors: Floor[] = [];
    selectedFloor: Floor;
    @Inject() imageEditor: MapImageComponent;

    mounted(): void {
        // Find all floors in the building
        this.environmentStore.service
            .findAll({
                where: {
                    parentUID: this.building.uid,
                },
            })
            .then((floors) => {
                this.floors = floors.filter(f => f instanceof Floor);
                if (this.floorSelector !== undefined) {
                    this.floorSelector.onFloorsChange(this.floors);
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }

    onFloorChange(floor: Floor, selected: boolean): void {
        if (selected) {
            this.selectedFloor = floor;
            this.floorRef.onFloorChange(floor);
        }
    }

    setFocus(focus: boolean) {
        if (this.focus !== focus) {
            this.focus = focus;
            
            if (this.focus) {
                this.floorSelector.show();
                this.imageEditor.show();
            } else {
                this.floorSelector.hide();
                this.imageEditor.hide();
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