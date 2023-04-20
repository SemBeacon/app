<template>
  <l-map 
    ref="map"
    id="map" 
    :zoom="zoom" 
    :center="isReady && phone.position ? [phone.position.latitude, phone.position.longitude] : [50.85, 4.3]"
    :options="{ attributionControl: false }"
    maxZoom="20"
  >
    <l-tile-layer
        :url="`https://api.mapbox.com/styles/v1/${id}/tiles/{z}/{x}/{y}?access_token=${accessToken}`"
        :accessToken="accessToken"
        layer-type="base"
    ></l-tile-layer>
    <!-- <l-marker 
      key="phone"
      :lat-lng="isReady && phone.position ? [phone.position.latitude, phone.position.longitude] : [50.85, 4.3]">
    </l-marker> -->
    <beacon-marker-component
      v-for="beacon in beacons"
      :beacon="beacon"
      :key="beacon.uid"
    >
    </beacon-marker-component>
  </l-map>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-property-decorator';
//import L from 'leaflet';
import {
    LMap, LTileLayer, LMarker
    // @ts-ignore
} from "@vue-leaflet/vue-leaflet";
import { BLEAltBeacon, BLEBeaconObject } from '@openhps/rf';
import { GeographicalPosition } from '@openhps/core';
import BeaconMarkerComponent from './map/BeaconMarkerComponent.vue';
// @ts-ignore
import vectorTileLayer from 'leaflet-vector-tile-layer';

@Options({
  components: {
    LMap,
    LTileLayer,
    LMarker,
    BeaconMarkerComponent
  }
})
export default class MapComponent extends Vue {
  id = "mapbox/streets-v11";
  accessToken = "pk.eyJ1IjoibWF4aW12ZHciLCJhIjoiY2xnbnJmc3Q3MGFyZzNtcGp0eGNuemp5eCJ9.yUAGNxEFSIxHIXqk0tGoxw";

  zoom?: number = 20;
  beacons: BLEBeaconObject[] = [
    new BLEAltBeacon().setPosition(new GeographicalPosition(
     4.3, 50.85
    ))
  ];

  mounted() {
    const url = `http://a.tiles.mapbox.com/v4/mapbox.${this.id}/{x}/{y}/{z}.mvt?access_token=${this.accessToken}`;
    const tileLayer = vectorTileLayer(url, {});
    console.log((this.$refs as any))
    tileLayer.addTo((this.$refs.map as any).leafletObject)
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