<template>
    <ol-map id="img" ref="mapImageRef" class="hidden">
        <!-- Projection view -->
        <ol-view :projection="pixelProjection" zoom="7" center="[0, 0]"></ol-view>
    </ol-map>
</template>

<script lang="ts">
import { Projection } from 'ol/proj';
import { Vue, Options, Ref, Inject } from 'vue-property-decorator';
import type { Map as OlMap } from 'ol';
import Button from 'ol-ext/control/Button';
import Bar from 'ol-ext/control/Bar';
import MapImageSelectorModal from '../../modals/MapImageSelectorModal.vue';

@Options({
    components: {},
})
export default class MapImageComponent extends Vue {
    pixelProjection = new Projection({
        code: 'pixel',
        units: 'pixels',
        extent: [-100000, -100000, 100000, 100000],
    });
    @Ref('mapImageRef') mapRef?: { map: OlMap; mapRef: HTMLElement };
    @Inject() imageSelector: MapImageSelectorModal;

    mounted(): void {
        const mainBar = new Bar({ toggleOne: true });
        mainBar.setPosition('top-right');
        const btnExpand = new Button({
            title: 'Full screen',
            html: '\u2922',
            handleClick: this.onFullscreen.bind(this),
        });
        const btnUpload = new Button({
            title: 'Upload floor plan',
            html: `<ion-icon name="cloud-upload-outline"></ion-icon>`,
            handleClick: () => {
                this.imageSelector.show();
            },
        });
        mainBar.addControl(btnExpand);
        mainBar.addControl(btnUpload);
        this.mapRef.map.addControl(mainBar);
    }

    onFullscreen(): void {
        if (this.mapRef.mapRef.classList.contains('fullscreen')) {
            this.mapRef.mapRef.classList.remove('fullscreen');
        } else {
            this.mapRef.mapRef.classList.add('fullscreen');
        }
    }

    show(): void {
        this.mapRef.mapRef.classList.remove('hidden');
    }

    hide(): void {
        this.mapRef.mapRef.classList.add('hidden');
    }
}
</script>

<style scoped>
#img {
    position: absolute;
    cursor: crosshair;
    bottom: 0;
    width: 50%;
    height: 200px;
    z-index: 2;
    border-radius: 0 10px 0 0;
    background: #fff;
    padding: 5px;
    background-color: var(--ion-background-color);
}

#img.hidden {
    display: none;
}

#img.fullscreen {
    width: 100%;
    height: 100%;
}
</style>