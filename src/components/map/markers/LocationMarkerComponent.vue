<template>
    <ol-vector-layer v-if="location" className="location-marker">
        <ol-source-vector>
            <!-- Location accuracy -->
            <ol-feature>
                <ol-geom-polygon
                    :coordinates="accuracyCoordinates"
                ></ol-geom-polygon>
                <ol-style>
                    <ol-style-stroke color="rgba(0, 0, 0, 0)" width="0"></ol-style-stroke>
                    <ol-style-fill color="rgba(0, 66, 256, 0.2)"></ol-style-fill>
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
import MapImageComponent from '../visualizations/MapImageComponent.vue';
import { fromLonLat, transform } from 'ol/proj';
import { circular } from 'ol/geom/Polygon.js';
import { Coordinate } from 'ol/coordinate';

@Options({
    components: {
        BeaconMarkerComponent,
        MapImageComponent,
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
