<template>
    <div>
        <slot></slot>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Inject, Watch } from 'vue-facing-decorator';
import { MapObject } from '@/models/MapObject';
import { fromLonLat } from 'ol/proj';
import type { Coordinate } from 'ol/coordinate';
import GeoImage from 'ol-ext/source/GeoImage';
import GeoImageLayer from 'ol-ext/layer/GeoImage';
import type { Map } from 'ol';
import { HelmertTransformation } from '@/utils/HelmertTransformation';
import { PolygonGeometry } from '@openhps/rdf/models';

@Component({
    components: {},
})
export default class ImageOverlayComponent extends Vue {
    @Prop() mapObject: MapObject;
    @Inject() map: Map;
    @Prop() edit: boolean = false;
    layer: GeoImageLayer;

    updateLayer(mapObject: MapObject): void {
        const image = new Image();
        image.onload = () => {
            console.log('Image loaded', mapObject);
            this.layer = new GeoImageLayer({
                zIndex: 1,
                opacity: 0.7,
                source: new GeoImage({
                    image,
                    imageMask: this.coordinates(mapObject),
                }),
            });
            this.layer.setZIndex(1);
            this.map.addLayer(this.layer);
            const source = this.layer.getSource();
            const xy = [
                [-image.width / 2, image.height / 2],
                [image.width / 2, image.height / 2],
                [image.width / 2, -image.height / 2],
                [-image.width / 2, -image.height / 2],
            ];
            const XY = this.coordinates(mapObject);
            const transformation = new HelmertTransformation();
            transformation.setControlPoints(xy, XY);

            const sc = transformation.getScale();
            const a = transformation.getRotation();
            const t = transformation.getTranslation();

            source.setScale(sc);
            source.setRotation(a);
            source.setCenter(t);
        };
        image.onerror = (error) => {
            console.error('Image error', error);
        };
        image.src = mapObject.image;
    }

    mounted(): void {
        if (this.mapObject) {
            this.updateLayer(this.mapObject);
        }
    }

    @Watch('mapObject')
    onImage(mapObject: MapObject): void {
        console.log('Image changed');
        if (this.layer) {
            this.map.removeLayer(this.layer);
        }
        if (mapObject) {
            this.updateLayer(mapObject);
        }
    }

    @Watch('edit')
    onEdit(edit: boolean): void {
        if (!this.layer) {
            return;
        }
        if (edit) {
            this.layer.setZIndex(10);
            this.layer.setOpacity(1);
        } else {
            this.layer.setZIndex(1);
            this.layer.setOpacity(0.7);
        }
    }

    coordinates(mapObject: MapObject): Coordinate[] {
        return (mapObject.coverage.geometry as PolygonGeometry).coords.map((coord) => {
            return fromLonLat([coord.longitude, coord.latitude]);
        });
    }
}
</script>
