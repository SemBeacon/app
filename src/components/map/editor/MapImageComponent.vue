<template>
    <ol-map
        id="img"
        ref="mapImageRef"
    >
        <!-- Projection view -->
        <ol-view
            :projection="pixelProjection"
            zoom="7"
            center="[0, 0]"
        ></ol-view>
    </ol-map>
</template>

<script lang="ts">
import { Projection } from 'ol/proj';
import { Vue, Options } from 'vue-property-decorator';

@Options({
    components: {},
})
export default class MapImageComponent extends Vue {
    pixelProjection = new Projection({
        code: 'pixel',
        units: 'pixels',
        extent: [-100000, -100000, 100000, 100000]
    });
}
</script>

<style scoped>
#img {
    position: absolute;
    cursor: crosshair;
    bottom: 0;
    width: 200px;
    height: 200px;
    z-index: 2;
    border-radius: 0 10px 0 0;
    background: #fff;
    padding: 5px;
}
</style>