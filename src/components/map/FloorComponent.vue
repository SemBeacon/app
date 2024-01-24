<template>
    <div>
        <slot></slot>

        <!-- Floorplan -->
        <map-image-component 
            v-if="floorPlan !== undefined" 
            :map-object="floorPlan"
            :visible="selected">
        </map-image-component>

        <!-- GeoJSON Spaces -->
        <geo-json-component
            v-for="environment in spaces"
            :key="environment.uid"
            :space="environment"
            :visible="selected"
        >
        </geo-json-component>

        <!-- Beacons on the floor -->
        <beacon-marker-component 
            :beacons="beacons"
            :visible="selected">
        </beacon-marker-component>
    </div>
</template>

<script lang="ts">
import { Vue, Options, Inject, Prop } from 'vue-property-decorator';
import type { Map } from 'ol';
import { Floor, SymbolicSpace } from '@openhps/geospatial';
import { useEnvironmentStore } from '../../stores/environment';
import GeoJsonComponent from './visualizations/GeoJsonComponent.vue';
import MapImageComponent from './visualizations/ImageOverlayComponent.vue';
import BeaconMarkerComponent from './markers/BeaconMarkerComponent.vue';
import { useBeaconStore } from '../../stores/beacon.scanning';
import { Absolute2DPosition } from '@openhps/core';
import { MapObject } from '../../models/MapObject';

@Options({
    components: {
        GeoJsonComponent,
        MapImageComponent,
        BeaconMarkerComponent,
    },
})
export default class FloorComponent extends Vue {
    @Inject() map: Map;
    @Prop() floor: Floor;
    @Prop() selected: boolean;
    environmentStore = useEnvironmentStore();
    beaconStore = useBeaconStore();
    spaces: SymbolicSpace<any>[] = [];

    mounted(): Promise<void> {
        return new Promise((resolve) => {
            // Find all spaces in the building
            this.environmentStore.fetchChildren(this.floor).then((spaces) => {
                // Spaces within the floor
                this.spaces = [...spaces, this.floor];
                resolve();
            })
            .catch(console.error);
        });
    }

    get floorPlan(): MapObject {
        return this.environmentStore.getFloorplan(this.floor.uid);
    }

    get beacons() {
        return this.beaconStore.beaconsWithInfo.filter((b) => {
            // Beacon has a position
            const position = b.position as unknown as Absolute2DPosition;
            return position !== undefined && position.x !== undefined && !Number.isNaN(position.x);
        }).filter(() => {
            // Beacon is within the floor
            return true;
        });
    }
}
</script>

<style scoped>

</style>