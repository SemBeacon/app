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
            :zoom="1"
            projection="EPSG:3857"
            :enable-rotation="false"
            @change="handleViewChange"
        ></ol-view>
        <!-- Map components -->
        <slot></slot>
    </ol-map>
</template>

<script lang="ts">
import { Vue, Component, Ref, Prop, Provide } from 'vue-facing-decorator';
import { MapboxVectorLayer } from 'ol-mapbox-style';
import type { Map as OlMap } from 'ol';
import type { Coordinate } from 'ol/coordinate';
import { useSettings } from '@/stores/settings';

@Component({
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
                layers: {
                    accessToken: this.settings.accessToken,
                    webfonts:
                        'https://cdn.jsdelivr.net/npm/@fontsource/{font-family}/{fontweight}{-fontstyle}.css',
                } as any,
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
