<template>
    <ol-map
        ref="mapRef"
        class="map"
        :load-tiles-while-animating="true"
        :load-tiles-while-interacting="true"
    >
        <!-- Projection view -->
        <ol-view
            :center="center"
            zoom="18"
            projection="EPSG:3857"
            @change="handleViewChange"
        ></ol-view>
        <slot></slot>
    </ol-map>
</template>

<script lang="ts">
import { Vue, Options, Ref, Prop, Provide } from 'vue-property-decorator';
import { MapboxVectorLayer } from 'ol-mapbox-style';
import { Map as OlMap } from 'ol';
import type { Coordinate } from 'ol/coordinate';
import { useSettings } from '../../stores/settings';

@Options({
    components: {},
})
export default class MapComponent extends Vue {
    settings = useSettings();
    zoom = 18;

    @Prop() center: Coordinate;
    @Ref() mapRef?: { map: OlMap };
    @Provide() map: OlMap;

    mounted(): void {
        this.map = this.mapRef.map;
        this.map.addLayer(
            new MapboxVectorLayer({
                styleUrl: this.settings.mapStyle,
                accessToken: this.settings.accessToken,
                zIndex: 0,
                declutter: true,
            }),
        );
        this.$emit('load', this.map);
    }

    handleViewChange(event: any) {
        this.$emit('change', event);
    }
}
</script>

<style scoped lang="scss">
.map {
    height: 100%;
    width: 100%;
    background-color: var(--ion-background-color);
    z-index: 1;
}
</style>
