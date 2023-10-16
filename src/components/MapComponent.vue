<template>
  <l-map 
    ref="map"
    id="map" 
    :zoom="zoom" 
    :center="location ? location : [0, 0]"
    :options="{ attributionControl: false }"
    @ready="onMapReady"
  >
    <l-tile-layer
        :url="`https://api.mapbox.com/styles/v1/${id}/tiles/{z}/{x}/{y}?access_token=${accessToken}`"
        :accessToken="accessToken"
        layer-type="base"
        :options="{ maxNativeZoom: 18, maxZoom: 20, minZoom: 4 }"
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
      v-bind:beacon="beacon"
      :key="beacon.uid"
    >
    </beacon-marker-component>

    <geo-json-component
      v-for="environment in environments.values()"
      v-bind:space="environment"
      :key="environment.uid"
    >
    </geo-json-component>
  </l-map>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-property-decorator';
// import L from 'leaflet';
// import 'leaflet.vectorgrid';
import {
    LMap, LMarker, LTileLayer
    // @ts-ignore
} from "@vue-leaflet/vue-leaflet";
import { Absolute2DPosition, GeographicalPosition } from '@openhps/core';
import BeaconMarkerComponent from './map/BeaconMarkerComponent.vue';
import GeoJsonComponent from './map/GeoJsonComponent.vue';
import { computed } from 'vue';
import { Ref } from 'vue-property-decorator';
import { useGeolocationStore } from '../stores/geolocation';
import { useBeaconStore } from '../stores/beacon';
import { useEnvironmentStore } from '../stores/environment';

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

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
  id = prefersDark ? "mapbox/dark-v11" : "mapbox/streets-v11";
  accessToken = "pk.eyJ1IjoibWF4aW12ZHciLCJhIjoiY2xnbnJmc3Q3MGFyZzNtcGp0eGNuemp5eCJ9.yUAGNxEFSIxHIXqk0tGoxw";
  @Ref("map") map: any;
  zoom?: number = 18;
  beacons = computed(() => {
    return Array.from(this.beaconStore.beacons.values())
      .filter((b) => {
        const position = (b.position as unknown as Absolute2DPosition);
        return position !== undefined && 
          position.x !== undefined && 
          !Number.isNaN(position.x);
      });
  });
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

  onMapReady(map: any) {
    (window as any)._leafletMap = map;

    // Vector tile layer
    // const url = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.vector.pbf?access_token={accessToken}';
    // (L as any).vectorGrid.protobuf(url, {
    //   id: 'mapbox.mapbox-streets-v8', 
    //   attribution: '', 
    //   maxZoom: 20, 
    //   accessToken: accessToken
    // }).addTo(map);
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