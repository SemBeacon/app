<template>
  <l-map 
    id="map" 
    :zoom="zoom" 
    :center="isReady && phone.position ? [phone.position.latitude, phone.position.longitude] : [50.85, 4.3]"
    :options="{ attributionControl: false }"
  >
    <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
    ></l-tile-layer>
    <l-marker 
      key="phone"
      :lat-lng="isReady && phone.position ? [phone.position.latitude, phone.position.longitude] : [50.85, 4.3]">
    </l-marker>
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
import { BLEBeaconObject } from '@openhps/rf';
import { BLESemBeacon } from '../models/BLESemBeacon';
import { GeographicalPosition } from '@openhps/core';
import BeaconMarkerComponent from './map/BeaconMarkerComponent.vue';

@Options({
  components: {
    LMap,
    LTileLayer,
    LMarker,
    BeaconMarkerComponent
  }
})
export default class MapComponent extends Vue {
  zoom?: number = 20;
  beacons: BLEBeaconObject[] = [
    new BLESemBeacon().setPosition(new GeographicalPosition(
     4.3, 50.85
    ))
  ];

}
</script>

<style scoped lang="scss">
@import 'leaflet/dist/leaflet.css';

#map {
  height: 100%;
  width: 100%;
}
</style>