<template>
    <l-geo-json 
      :geojson="space.toGeoJSON(true)" 
      :v-if="space"
      :options="options"
    >
    </l-geo-json>
</template>


<script lang="ts">
import { Vue, Options, Prop } from 'vue-property-decorator';
import {
    LGeoJson
    // @ts-ignore
} from "@vue-leaflet/vue-leaflet";
import { Building, Corridor, Floor, Room, SymbolicSpace, Zone } from '@openhps/geospatial';
import { GeographicalPosition } from '@openhps/core';
import { isProxy, toRaw } from 'vue';

@Options({
  components: {
    LGeoJson
  }
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
          fillOpacity: 0
        };
      } else if (rawSpace instanceof Floor) {
        return {
          fillColor: "#44b3fc",
          color: "#205273",
          fillOpacity: 0.2
        };
      } else if (rawSpace instanceof Room || rawSpace instanceof Zone) {
        return {
          fillColor: "#42f54e",
          color: "#1f7d26",
          fillOpacity: 0.3,
          opacity: 0.8
        };
      } else if (rawSpace instanceof Corridor) {
        return {
          fillColor: "#eb4444",
          color: "#732020",
          fillOpacity: 0.3,
          opacity: 0.8
        };
      }
      return {};
    }
}
</script>

