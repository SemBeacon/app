<template>
    <div>
        <slot></slot>

        <!-- Floorplan -->
        <map-image-component v-if="false" :map-object="undefined"> </map-image-component>

        <!-- GeoJSON Spaces -->
        <geo-json-component
            v-for="environment in spaces"
            :key="environment.uid"
            :space="environment"
        >
        </geo-json-component>

        <!-- Beacons on the floor -->
        <beacon-marker-component :beacons="beacons"> </beacon-marker-component>
    </div>
</template>

<script lang="ts">
import { Vue, Options, Inject, Prop, Watch } from 'vue-property-decorator';
import type { Map } from 'ol';
import { Floor, SymbolicSpace } from '@openhps/geospatial';
import { useEnvironmentStore } from '../../stores/environment';
import GeoJsonComponent from './visualizations/GeoJsonComponent.vue';
import MapImageComponent from './visualizations/ImageOverlayComponent.vue';
import BeaconMarkerComponent from './markers/BeaconMarkerComponent.vue';
import { useBeaconStore } from '../../stores/beacon.scanning';
import { Absolute2DPosition } from '@openhps/core';

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
    environmentStore = useEnvironmentStore();
    beaconStore = useBeaconStore();

    spaces: SymbolicSpace<any>[] = [];

    @Watch('floor')
    onFloorChange(floor: Floor): void {
        this.update(floor);
    }

    mounted(): void {
        if (this.floor) {
            this.update(this.floor);
        }
    }

    update(floor: Floor): void {
        // Find all spaces in the building
        this.environmentStore.service
            .findAll({
                where: {
                    parentUID: floor.uid,
                },
            })
            .then((spaces) => {
                this.spaces = spaces;
            })
            .catch((err) => {
                console.error(err);
            });
    }

    get beacons() {
        return this.beaconStore.beaconsWithInfo.filter((b) => {
            const position = b.position as unknown as Absolute2DPosition;
            return position !== undefined && position.x !== undefined && !Number.isNaN(position.x);
        });
    }
}
</script>

<style scoped>

</style>