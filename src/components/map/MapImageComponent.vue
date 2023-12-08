<template>
  <div>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Vue, Options, Prop, Inject } from 'vue-property-decorator';
import { MapObject } from '../../models/MapObject';
import { fromLonLat } from 'ol/proj';
import { Coordinate } from 'ol/coordinate';
import GeoImage from 'ol-ext/source/GeoImage'
import GeoImageLayer from 'ol-ext/layer/GeoImage'
import type { Map } from 'ol';
//import aff from 'affineplane';
import '../../utils/helmert.js';

@Options({
  components: {},
})
export default class MapImageComponent extends Vue {
  @Prop() mapObject: MapObject;
  @Inject() map: Map;
  layer: GeoImageLayer;

  mounted(): void {
    this.layer = new GeoImageLayer({
      opacity: .7,
      source: new GeoImage({
        url: this.mapObject.image,
        imageMask: this.coordinates
      })
    });
    this.layer.setZIndex(1);
    this.calculate();
    this.map.addLayer(this.layer);
  }
  
  calculate(): void {
    const source = this.layer.getSource();
    const image = this.layer.getSource().getGeoImage() as HTMLImageElement;
    image.onload = () => {
      const transformation = new (window as any).ol.transform.Helmert();
      transformation.setControlPoints([
        [-image.width / 2, image.height / 2],
        [image.width / 2, image.height / 2],
        [image.width / 2, -image.height / 2],
        [-image.width / 2, -image.height / 2],
      ], this.coordinates);

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
