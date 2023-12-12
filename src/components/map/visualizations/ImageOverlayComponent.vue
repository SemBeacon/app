<template>
    <div>
        <slot></slot>
    </div>
</template>

<script lang="ts">
import { Vue, Options, Prop, Inject, Watch } from 'vue-property-decorator';
import { MapObject } from '../../../models/MapObject';
import { fromLonLat } from 'ol/proj';
import type { Coordinate } from 'ol/coordinate';
import GeoImage from 'ol-ext/source/GeoImage';
import GeoImageLayer from 'ol-ext/layer/GeoImage';
import type { Map } from 'ol';
import { HelmertTransformation } from '../../../utils/HelmertTransformation';

@Options({
    components: {},
})
export default class ImageOverlayComponent extends Vue {
    @Prop() mapObject: MapObject;
    @Inject() map: Map;
    @Prop() edit: boolean = false;
    layer: GeoImageLayer;

    mounted(): void {
        this.layer = new GeoImageLayer({
            opacity: 0.7,
            source: new GeoImage({
                url: this.mapObject.image,
                imageMask: this.coordinates,
            }),
            onclick: console.log,
        });
        this.layer.setZIndex(1);
        this.calculate();
        this.map.addLayer(this.layer);
    }

    @Watch('edit')
    onEdit(edit: boolean): void {
        if (edit) {
            this.layer.setZIndex(10);
            this.layer.setOpacity(1);
        } else {
            this.layer.setZIndex(1);
            this.layer.setOpacity(0.7);
        }
    }

    calculate(): void {
        const source = this.layer.getSource();
        const image = this.layer.getSource().getGeoImage() as HTMLImageElement;
        image.onload = () => {
            const xy = [
                [-image.width / 2, image.height / 2],
                [image.width / 2, image.height / 2],
                [image.width / 2, -image.height / 2],
                [-image.width / 2, -image.height / 2],
            ];
            const XY = this.coordinates;
            const transformation = new HelmertTransformation();
            transformation.setControlPoints(xy, XY);

            const sc = transformation.getScale();
            const a = transformation.getRotation();
            const t = transformation.getTranslation();

            source.setScale(sc);
            source.setRotation(a);
            source.setCenter(t);
        };
    }

    get coordinates(): Coordinate[] {
        return this.mapObject.coverage.geometry.coords.map((coord) => {
            return fromLonLat([coord.longitude, coord.latitude]);
        });
    }
}
</script>
