<template>
  <l-map id="map" ref="map" :zoom="zoom" :center="center" :options="{ attributionControl: false }" @ready="onMapReady">
    <l-tile-layer
      :url="url"
      :access-token="accessToken"
      layer-type="base"
      :options="{ maxNativeZoom: 18, maxZoom: 20, minZoom: 4 }"
    >
    </l-tile-layer>

    <custom-marker-component
      v-if="location"
      key="phone"
      :lat-lng="location"
      :options="{
        iconShape: 'doughnut',
        borderWidth: 5,
        borderColor: '#00ABDC',
      }"
    >
    </custom-marker-component>

    <beacon-marker-component v-for="beacon in beacons" :key="beacon.uid" :beacon="beacon"> </beacon-marker-component>

    <geo-json-component v-for="environment in environments.values()" :key="environment.uid" :space="environment">
    </geo-json-component>
  </l-map>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-property-decorator';
import {
  LMap,
  LMarker,
  LTileLayer,
  // @ts-ignore
} from '@vue-leaflet/vue-leaflet';
import { Absolute2DPosition, GeographicalPosition } from '@openhps/core';
import BeaconMarkerComponent from './map/BeaconMarkerComponent.vue';
import GeoJsonComponent from './map/GeoJsonComponent.vue';
import { computed } from 'vue';
import { useGeolocationStore } from '../stores/geolocation';
import { useBeaconStore } from '../stores/beacon.scanning';
import { useEnvironmentStore } from '../stores/environment';
import CustomMarkerComponent from './map/CustomMarkerComponent.vue';

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

@Options({
  components: {
    LMap,
    LMarker,
    LTileLayer,
    BeaconMarkerComponent,
    GeoJsonComponent,
    CustomMarkerComponent,
  },
})
export default class MapComponent extends Vue {
  geolocationStore = useGeolocationStore();
  beaconStore = useBeaconStore();
  environmentStore = useEnvironmentStore();
  id = prefersDark.matches ? 'mapbox/dark-v11' : 'mapbox/streets-v11';
  accessToken = 'pk.eyJ1IjoibWF4aW12ZHciLCJhIjoiY2xnbnJmc3Q3MGFyZzNtcGp0eGNuemp5eCJ9.yUAGNxEFSIxHIXqk0tGoxw';
  url = `https://api.mapbox.com/styles/v1/${this.id}/tiles/{z}/{x}/{y}?access_token=${this.accessToken}`;
  zoom?: number = 18;
  beacons = computed(() => {
    return this.beaconStore.beaconsWithInfo.filter((b) => {
      const position = b.position as unknown as Absolute2DPosition;
      return position !== undefined && position.x !== undefined && !Number.isNaN(position.x);
    });
  });
  location = computed(() => {
    const location: GeographicalPosition = this.geolocationStore.location;
    return location && location.latitude ? [location.latitude, location.longitude] : undefined;
  });
  environments = computed(() => this.environmentStore.environments);
  defaultCenter: number[] = undefined;
  center = computed(() => {
    return this.defaultCenter ? this.defaultCenter : this.location ? this.location : [0, 0];
  });

  mounted() {
    this.geolocationStore.sourceNode.start();
  }

  onMapReady(map: any) {
    (window as any)._leafletMap = map;
    if (this.defaultCenter) {
      map.setView(this.defaultCenter, 18);
    }
  }

  unmounted() {
    this.geolocationStore.sourceNode.stop();
  }

  highlightBeacon(uid: string): void {
    this.beaconStore
      .findByUID(uid)
      .then((beacon) => {
        const position = beacon.position as unknown as Absolute2DPosition;
        if (position !== undefined && position.x !== undefined && !Number.isNaN(position.x)) {
          const array = beacon.position.toVector3().toArray();
          this.defaultCenter = [array[1], array[0]];
          (window as any)._leafletMap.setView(this.defaultCenter, 18);
        }
      })
      .catch(console.error);
  }
}
</script>

<style scoped lang="scss">
@import 'leaflet/dist/leaflet.css';

#map {
  height: 100%;
  width: 100%;
  background-color: var(--ion-background-color);
}

img.leaflet-tile,
img.leaflet-marker-icon,
img.leaflet-marker-shadow {
  /* work-around from here: https://github.com/Leaflet/Leaflet/issues/161 */
  outline: 1px solid transparent;
  /* work-around from here: https://bugs.chromium.org/p/chromium/issues/detail?id=600120 */
  mix-blend-mode: plus-lighter;
}
</style>
