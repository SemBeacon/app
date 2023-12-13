<template>
    <ol-map id="img" ref="mapImageRef" class="hidden" :style="{
        width: `${width}px`,
        height: `${height}px`
    }" :controls="[]">
        <!-- Resizer -->
        <div 
            class="resize" @mousedown="resizeStart" @dblclick="onFullscreen">
            <ion-icon icon="resize-outline"></ion-icon>
        </div>

        <!-- File selector -->
        <input id="file-upload" type="file" :style="{ display: 'none' }" @change="onImage" />

        <!-- Projection view -->
        <ol-view :enableRotation="false" :projection="pixelProjection" :zoom="7" :center="[0, 0]"></ol-view>

        <!-- Image crop -->
        <ol-vector-layer :zIndex="1" ref="editor">
            <ol-source-vector :projection="pixelProjection">
                <ol-interaction-modify
                    @modifyend="onCrop"
                    v-if="state === 1">
                    <ol-style>
                        <ol-style-stroke color="blue" :width="2"></ol-style-stroke>
                        <ol-style-fill color="rgba(255, 255, 0, 0.4)"></ol-style-fill>
                    </ol-style>
                </ol-interaction-modify>
                <ol-interaction-draw
                    :stopClick="true"
                    @drawstart="onCropStart"
                    @drawend="onCrop"
                    v-if="state === 1"
                    type="Polygon"
                >
                    <ol-style>
                        <ol-style-stroke color="blue" :width="2"></ol-style-stroke>
                        <ol-style-fill color="rgba(255, 255, 0, 0.4)"></ol-style-fill>
                    </ol-style>
                </ol-interaction-draw>
            </ol-source-vector>

            <ol-style>
                <ol-style-stroke color="red" :width="2"></ol-style-stroke>
                <ol-style-fill color="rgba(255, 255, 255, 0.3)"></ol-style-fill>
            </ol-style>
        </ol-vector-layer>
    </ol-map>
</template>

<script lang="ts">
import { Projection } from 'ol/proj';
import { Vue, Options, Ref } from 'vue-property-decorator';
import type { Map as OlMap } from 'ol';
import Button from 'ol-ext/control/Button';
import Toggle from 'ol-ext/control/Toggle';
import Bar from 'ol-ext/control/Bar';
import { Image } from 'ol/layer';
import GeoImage from 'ol-ext/source/GeoImage';
import type { Coordinate } from 'ol/coordinate';
import type VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Polygon } from 'ol/geom';

enum ImageEditorState {
    MOVE,
    CROP,
    POINT,
}

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
    imageLayer: Image<GeoImage>;
    state: ImageEditorState = ImageEditorState.MOVE;
    @Ref() editor: { vectorLayer: VectorLayer<VectorSource> }
    width = 200;
    height = 200;
    x: number;
    y: number;
    isResizing = false;

    // Image information
    crop: Coordinate[][];
    controlPoints: Coordinate[];

    mounted(): void {
        const btnUpload = new Button({
            title: 'Upload floor plan',
            html: `<ion-icon name="cloud-upload-outline"></ion-icon>`,
            handleClick: () => {
                document.getElementById('file-upload').click();
            },
        });

        const editBar = new Bar({ toggleOne: true });
        editBar.setPosition('top-left');
        const toggleMove = new Toggle({
            title: 'Move image',
            html: `<ion-icon name="move-outline"></ion-icon>`,
            active: true,
            onToggle: () => {
                this.state = ImageEditorState.MOVE;
            },
        });
        const togglePoint = new Toggle({
            title: 'Create a control point',
            html: `<b-icon icon="icon-crosshair"></b-icon>`,
            onToggle: () => {
                this.state = ImageEditorState.POINT;
            },
        });
        const toggleCrop = new Toggle({
            title: 'Crop the image',
            html: `<ion-icon name="crop-outline"></ion-icon>`,
            onToggle: () => {
                this.state = ImageEditorState.CROP;
            },
        });
        editBar.addControl(btnUpload);
        editBar.addControl(toggleMove);
        editBar.addControl(togglePoint);
        editBar.addControl(toggleCrop);
        this.mapRef.map.addControl(editBar);
    }

    onImage(event: any): void {
        const file = event.target.files![0];
        const reader = new FileReader();
        reader.onload = (e) => {
            this.setSource(e.target.result as string);
        };
        reader.readAsDataURL(file);
    }

    setSource(dataURL: string): void {
        this.imageLayer = new Image({
            zIndex: 0,
            opacity: 1,
            source: new GeoImage({
                url: dataURL,
                imageCenter: [0, 0],
                imageScale: [1, 1],
                projection: this.pixelProjection,
            } as any),
        });
        // Add Layer
        this.mapRef.map.getLayers().insertAt(0, this.imageLayer);
    }

    onCropStart(): void {
        const layer = this.editor.vectorLayer;
        const source = layer.getSource();
        const features = source.getFeatures();
        if (features.length > 0) {
            source.clear(true);
        }
    }

    onCrop(): void {
        this.$nextTick(() => {
            const layer = this.editor.vectorLayer;
            const source = layer.getSource();
            const features = source.getFeatures();
            if (features.length > 0) {
                const cropFeature = features[0];
                this.crop = (cropFeature.getGeometry() as Polygon).getCoordinates();
            }
        });
    }

    show(): void {
        this.mapRef.mapRef.classList.remove('hidden');
    }

    hide(): void {
        this.mapRef.mapRef.classList.add('hidden');
    }

    onFullscreen(): void {
        this.mapRef.mapRef.classList.add("snap-width");
        this.mapRef.mapRef.classList.add("snap-height");
        this.mapRef.mapRef.classList.remove("resizing");
    }

    resize(event: MouseEvent): void {
        if (this.isResizing) {
            const dx = event.screenX - this.x;
            const dy = event.screenY - this.y;
            this.x = event.screenX;
            this.y = event.screenY;
            this.width += dx;
            this.height -= dy;
        }
    }

    resizeStart(event: MouseEvent): void {
        this.isResizing = true;
        const bounds = this.mapRef.mapRef.getBoundingClientRect();
        // Set accuracy width and height to avoid 'snapping' when resizing again
        this.width = bounds.width;
        this.height = bounds.height;
        
        this.x = event.screenX;
        this.y = event.screenY;
        this.mapRef.mapRef.classList.add("resizing");
        document.body.addEventListener("mousemove", this.resize.bind(this));
        const mouseUp = () => {
            document.body.removeEventListener("mousemove", this.resize.bind(this));
            document.body.removeEventListener("mouseup", mouseUp);
            this.resizeStop();
        };
        document.body.addEventListener("mouseup", mouseUp);
        const mouseLeave = () => {
            document.body.removeEventListener("mousemove", this.resize.bind(this));
            document.body.removeEventListener("mouseleave", mouseLeave);
            document.body.removeEventListener("mouseup", mouseUp);
            this.resizeStop();
        };
        document.body.addEventListener("mouseleave", mouseLeave);
    }

    resizeStop(): void {
        this.isResizing = false;
        const bounds = this.mapRef.mapRef.getBoundingClientRect();
        if (this.width > bounds.width) {
            this.mapRef.mapRef.classList.add("snap-width");
        } else {
            this.mapRef.mapRef.classList.remove("snap-width");
        }
        if (this.height > bounds.height) {
            this.mapRef.mapRef.classList.add("snap-height");
        } else {
            this.mapRef.mapRef.classList.remove("snap-height");
        }
        this.mapRef.mapRef.classList.remove("resizing");
    }
}
</script>

<style scoped>
#img {
    position: absolute;
    bottom: 0;
    z-index: 2;
    border-radius: 0 10px 0 0;
    background: #fff;
    padding: 5px;
    min-width: 200px;
    min-height: 200px;
    max-height: 80%;
    max-width: 80%;
    box-shadow: rgba(100, 100, 111, 0.4) 0px 7px 29px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
}

#img.snap-width.resizing {
    min-width: 200px;
    max-width: 100%;
    transition: none;
}

#img.snap-height.resizing {
    min-height: 200px;
    max-height: 100%;
    transition: none;
}

#img.snap-width {
    min-width: 100%;
    max-width: 100%;
    transition: 50ms ease-in-out;
    border-radius: 0 0 0 10px;
}

#img.snap-height {
    min-height: 100%;
    max-height: 100%;
    transition: 50ms ease-in-out;
    border-radius: 0 0 0 10px;
}

#img.hidden {
    display: none;
}

#img.snap-height .resize {
    border-radius: 0 10px 0 10px;
}

#img.snap-width .resize {
    border-radius: 0 10px 0 10px;
}

#img .resize {
    width: 25px;
    height: 25px;
    background: #fff;
    position: absolute;
    right: 0;
    top: 0;
    z-index: 1;
    cursor: ne-resize;
    border-radius: 0 10px 0 10px;
    color: rgb(102, 102, 102);
}

#img .resize ion-icon {
    padding: 10%;
    height: 80%;
    width: 80%;
}
</style>