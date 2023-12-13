<template>
    <ol-vector-layer
        v-if="location"
        class-name="location-marker"
        :update-while-animating="true"
        :update-while-interacting="true"
        :z-index="3"
    >
        <ol-source-vector>
            <!-- Location accuracy -->
            <ol-feature v-if="accuracy > 0 && accuracy < 100">
                <ol-geom-polygon :coordinates="accuracyCoordinates"></ol-geom-polygon>
                <ol-style>
                    <ol-style-stroke color="rgba(0, 66, 200, 0.35)" width="1"></ol-style-stroke>
                    <ol-style-fill color="rgba(0, 66, 256, 0.15)"></ol-style-fill>
                </ol-style>
            </ol-feature>
            <!-- Location -->
            <ol-feature>
                <ol-geom-point :coordinates="location"></ol-geom-point>
                <ol-style>
                    <ol-style-icon
                        v-if="rotation"
                        src="/assets/markers/location-marker.png"
                        :scale="6 / 256"
                        :anchor="[0.5, 0.5]"
                        :rotation="rotation"
                    >
                    </ol-style-icon>
                    <ol-style-icon
                        v-else
                        src="/assets/markers/location-marker-noarrow.png"
                        :scale="6 / 256"
                        :anchor="[0.5, 0.5]"
                        :rotation="rotation"
                    >
                    </ol-style-icon>
                </ol-style>
            </ol-feature>
        </ol-source-vector>
    </ol-vector-layer>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-property-decorator';
import { GeographicalPosition } from '@openhps/core';
import BeaconMarkerComponent from './BeaconMarkerComponent.vue';
import { computed } from 'vue';
import { useGeolocationStore } from '../../../stores/geolocation';
import { fromLonLat, transform } from 'ol/proj';
import { circular } from 'ol/geom/Polygon.js';
import { Coordinate } from 'ol/coordinate';

@Options({
    components: {
        BeaconMarkerComponent,
    },
})
export default class LocationMarkerComponent extends Vue {
    geolocationStore = useGeolocationStore();

    location = computed(() => {
        const location: GeographicalPosition = this.geolocationStore.location;
        return location && location.latitude
            ? fromLonLat([location.longitude, location.latitude])
            : undefined;
    });

    rotation = computed(() => {
        const location: GeographicalPosition = this.geolocationStore.location;
        return location && location.orientation ? -location.orientation.toEuler().z : undefined;
    });

    get accuracy(): number {
        if (!this.geolocationStore.location) {
            return 0;
        }
        return this.geolocationStore.location.accuracy.value.x;
    }

    accuracyCoordinates = computed(() => {
        if (!this.geolocationStore.location) {
            return [];
        }
        const radius = this.geolocationStore.location.accuracy.value.x;
        const center = transform(this.location as unknown as Coordinate, 'EPSG:3857', 'EPSG:4326');
        const circle = circular(center, radius, 128);
        circle.transform('EPSG:4326', 'EPSG:3857');
        return circle.getCoordinates();
    });
}
</script>
