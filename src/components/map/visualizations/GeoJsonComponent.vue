<template>
    <ol-vector-layer
        ref="layerRef"
        class-name="geojson"
        :update-while-animating="true"
        :update-while-interacting="true"
        :z-index="2"
    >
        <ol-source-vector ref="sourceRef">
            <ol-feature>
                <ol-geom-polygon :coordinates="coordinates" />
            </ol-feature>
        </ol-source-vector>
        <ol-style>
            <ol-style-stroke :color="options.color" :width="2"></ol-style-stroke>
            <ol-style-fill :color="options.fillColor"></ol-style-fill>
        </ol-style>
    </ol-vector-layer>
</template>

<script lang="ts">
import { Vue, Options, Prop, Ref, Watch } from 'vue-property-decorator';
import { Building, Corridor, Floor, Room, SymbolicSpace, Zone } from '@openhps/geospatial';
import { GeographicalPosition } from '@openhps/core';
import { isProxy, toRaw } from 'vue';
import type { Coordinate } from 'ol/coordinate';
import { fromLonLat } from 'ol/proj';
import type { Vector } from 'ol/layer';

@Options({
    components: {
    },
})
export default class GeoJsonComponent extends Vue {
    @Prop() space: SymbolicSpace<GeographicalPosition>;
    @Prop() visible: boolean;
    @Ref('layerRef') layerRef: { vectorLayer: Vector<any> };

    @Watch('visible')
    onVisibilityChange(visible: boolean): void {
        this.layerRef.vectorLayer.setVisible(visible);
    }

    get coordinates(): Coordinate[][] {
        const bounds = this.space.getBounds();
        return [bounds.map((b) => fromLonLat([b.longitude, b.latitude]))];
    }

    get rawSpace() {
        let rawSpace = this.space;
        if (isProxy(rawSpace)) {
            rawSpace = toRaw(rawSpace);
        }
        return rawSpace;
    }

    get options() {
        const rawSpace = this.rawSpace;
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
