<template>
  <ol-image-layer>
    <ol-source-image-static
      :url="`https://proxy.linkeddatafragments.org/` + map.image"
      :imageExtent="coordinates"
    ></ol-source-image-static>
  </ol-image-layer>
</template>

<script lang="ts">
import { Vue, Options, Prop } from 'vue-property-decorator';
import { MapObject } from '../../models/MapObject';
import { fromLonLat } from 'ol/proj';
import { Coordinate } from 'ol/coordinate';

@Options({
  components: {},
})
export default class MapImageComponent extends Vue {
  @Prop() map: MapObject;

  mounted(): void {
    console.log(this.coordinates.reduce((a, b) => ([ ...a, ...b ])));

  }
  
  get coordinates(): Coordinate[] {
    return this.map.coverage.geometry.coords.map((coord) => {
      return fromLonLat([coord.longitude, coord.latitude]);
    });
  }
}
</script>
