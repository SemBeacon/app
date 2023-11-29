<template>
  <ol-image-layer>
    <ol-source-image-static
      :url="`https://proxy.linkeddatafragments.org/` + this.map.image"
      :imageExtent="this.coords"
    ></ol-source-image-static>
  </ol-image-layer>
</template>

<script lang="ts">
import { Vue, Options, Prop } from 'vue-property-decorator';
import { MapObject } from '../../models/MapObject';

@Options({
  components: {},
})
export default class MapImageComponent extends Vue {
  @Prop() map: MapObject;

  get coords(): [number, number][] {
    return this.map.coverage.geometry.coords.map((coord) => {
      return [coord.latitude, coord.longitude];
    });
  }

  get bounds(): [number, number][] {
    return this.map.coverage.geometry.coords.map((c) => {
      return [c.latitude, c.longitude];
    });
  }
}
</script>
