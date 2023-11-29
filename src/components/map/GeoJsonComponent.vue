<template>
  <ol-vector-layer :v-if="space">
    <ol-source-vector
      :features="space.toGeoJSON(true)"
      :format="GeoJSON"
    >
    </ol-source-vector>
    <ol-style>
      <ol-style-stroke color="red" :width="2"></ol-style-stroke>
      <ol-style-fill color="rgba(255,255,255,0.1)"></ol-style-fill>
      <ol-style-icon :src="markerIcon" :scale="0.1"></ol-style-icon>
    </ol-style>
  </ol-vector-layer>
</template>

<script lang="ts">
import { Vue, Options, Prop } from 'vue-property-decorator';
import { Building, Corridor, Floor, Room, SymbolicSpace, Zone } from '@openhps/geospatial';
import { GeographicalPosition } from '@openhps/core';
import { isProxy, toRaw } from 'vue';
import GeoJSON from 'ol/format/GeoJSON';

@Options({
  components: {

  },
  data: () => ({
    GeoJSON
  })
})
export default class GeoJsonComponent extends Vue {
  @Prop() space: SymbolicSpace<GeographicalPosition>;

  get options() {
    let rawSpace = this.space;
    if (isProxy(rawSpace)) {
      rawSpace = toRaw(rawSpace);
    }

    if (rawSpace instanceof Building) {
      return {
        opacity: 0,
        fillOpacity: 0,
      };
    } else if (rawSpace instanceof Floor) {
      return {
        fillColor: '#44b3fc',
        color: '#205273',
        fillOpacity: 0.2,
      };
    } else if (rawSpace instanceof Room || rawSpace instanceof Zone) {
      return {
        fillColor: '#42f54e',
        color: '#1f7d26',
        fillOpacity: 0.3,
        opacity: 0.8,
      };
    } else if (rawSpace instanceof Corridor) {
      return {
        fillColor: '#eb4444',
        color: '#732020',
        fillOpacity: 0.3,
        opacity: 0.8,
      };
    }
    return {};
  }
}
</script>
