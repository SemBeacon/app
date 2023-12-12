<template>
    <ol-vector-layer
        class-name="geojson"
        :update-while-animating="true"
        :update-while-interacting="true"
        :z-index="2"
    >
        <ol-source-vector :features="features" @featuresloaderror="console.error">
        </ol-source-vector>
        <ol-style>
            <ol-style-stroke :color="options.color" :width="2"></ol-style-stroke>
            <ol-style-fill :color="options.fillColor"></ol-style-fill>
        </ol-style>
    </ol-vector-layer>
</template>

<script lang="ts">
import { Vue, Options, Prop } from 'vue-property-decorator';
import { Building, Corridor, Floor, Room, SymbolicSpace, Zone } from '@openhps/geospatial';
import { GeographicalPosition } from '@openhps/core';
import { isProxy, toRaw } from 'vue';
import GeoJSON from 'ol/format/GeoJSON';
import { FeatureLike } from 'ol/Feature';

@Options({
    components: {},
    data: () => ({
        GeoJSON,
    }),
})
export default class GeoJsonComponent extends Vue {
    @Prop() space: SymbolicSpace<GeographicalPosition>;

    get features(): FeatureLike[] {
        return new GeoJSON({ featureProjection: 'EPSG:3857' }).readFeatures(
            this.space.toGeoJSON(true),
        );
    }

    get options() {
        let rawSpace = this.space;
        if (isProxy(rawSpace)) {
            rawSpace = toRaw(rawSpace);
        }

        if (rawSpace instanceof Building) {
            return {
                fillColor: [0, 0, 0, 0],
                color: [0, 0, 0, 0],
            };
        } else if (rawSpace instanceof Floor) {
            return {
                fillColor: [68, 179, 252, 0.2],
                color: [32, 82, 115, 1],
            };
        } else if (rawSpace instanceof Room || rawSpace instanceof Zone) {
            return {
                fillColor: [66, 245, 78, 0.3],
                color: [31, 125, 38, 0.8],
            };
        } else if (rawSpace instanceof Corridor) {
            return {
                fillColor: [235, 68, 68, 0.3],
                color: [115, 32, 32, 0.8],
            };
        }
        return {
            fillColor: [66, 245, 78, 0.3],
            color: [31, 125, 38, 0.8],
        };
    }
}
</script>
