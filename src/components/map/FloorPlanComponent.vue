<template>
  <l-image-overlay :url="url" :bounds="bounds" :v-if="space"> </l-image-overlay>
</template>

<script lang="ts">
import { Vue, Options, Prop } from 'vue-property-decorator';
import {
  LImageOverlay,
  // @ts-ignore
} from '@vue-leaflet/vue-leaflet';
import { SymbolicSpace } from '@openhps/geospatial';
import { GeographicalPosition } from '@openhps/core';

@Options({
  components: {
    LImageOverlay,
  },
})
export default class FloorPlanComponent extends Vue {
  @Prop() space: SymbolicSpace<GeographicalPosition>;
  url: string = 'http://leafletjs.com/examples/crs-simple/uqm_map_full.png';
  bounds = [
    [-26.5, -25],
    [1021.5, 1023],
  ];
}
</script>
