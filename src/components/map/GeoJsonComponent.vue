<template>
    <l-geo-json :geojson="geojson" :v-if="geojson">
        
    </l-geo-json>
</template>


<script lang="ts">
import { Vue, Options, Prop } from 'vue-property-decorator';
import {
    LGeoJson
    // @ts-ignore
} from "@vue-leaflet/vue-leaflet";

@Options({
  components: {
    LGeoJson
  }
})
export default class GeoJsonComponent extends Vue {
    @Prop() geojson: any;

    mounted() {
      console.log("geojson", this.geojson);
    }
}
</script>

