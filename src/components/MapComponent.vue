<template>
  <l-map 
    ref="map"
    id="map" 
    :zoom="zoom" 
    :center="location ? location : [0, 0]"
    :options="{ attributionControl: false }"
    :maxZoom="20"
  >
    <l-tile-layer
        :url="`https://api.mapbox.com/styles/v1/${id}/tiles/{z}/{x}/{y}?access_token=${accessToken}`"
        :accessToken="accessToken"
        layer-type="base"
        :options="{ maxNativeZoom: 18 }"
    >
    </l-tile-layer>
    
    <l-marker 
      key="phone"
      v-if="location"
      :lat-lng="location"
    >
    </l-marker>

    <beacon-marker-component
      v-for="beacon in beacons"
      :beacon="beacon"
      :key="beacon.uid"
    >
    </beacon-marker-component>

    <geo-json-component
      v-for="environment in environments.values()"
      :geojson="environment.toGeoJSON()"
      :key="environment.uid"
    >
    </geo-json-component>
  </l-map>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-property-decorator';
//import L from 'leaflet';
import {
    LMap, LMarker, LTileLayer
    // @ts-ignore
} from "@vue-leaflet/vue-leaflet";
import { GeographicalPosition } from '@openhps/core';
import BeaconMarkerComponent from './map/BeaconMarkerComponent.vue';
import GeoJsonComponent from './map/GeoJsonComponent.vue';
import { ref, computed } from 'vue';
import { useGeolocationStore } from '../stores/geolocation';
import { useBeaconStore } from '../stores/beacon';
import { useEnvironmentStore } from '../stores/environment';

@Options({
  components: {
    LMap,
    LMarker,
    LTileLayer,
    BeaconMarkerComponent,
    GeoJsonComponent
  }
})
export default class MapComponent extends Vue {
  geolocationStore = useGeolocationStore();
  beaconStore = useBeaconStore();
  environmentStore = useEnvironmentStore();

  id = "mapbox/streets-v11";
  accessToken = "pk.eyJ1IjoibWF4aW12ZHciLCJhIjoiY2xnbnJmc3Q3MGFyZzNtcGp0eGNuemp5eCJ9.yUAGNxEFSIxHIXqk0tGoxw";
  map: any = ref("map");
  zoom?: number = 18;
  beacons = computed(() => this.beaconStore.beacons);
  location = computed(() => {
    const location: GeographicalPosition = this.geolocationStore.location;
    return location && location.latitude ? [location.latitude, location.longitude] : undefined;
  });
  environments = computed(() => this.environmentStore.environments);

  mounted() {
    this.geolocationStore.initialize().then(() => {
      return this.geolocationStore.sourceNode.start();
    });
  }

  unmounted() {
    this.geolocationStore.sourceNode.stop();
  }
}
</script>

<style scoped lang="scss">
@import 'leaflet/dist/leaflet.css';

#map {
  height: 100%;
  width: 100%;
}
</style>