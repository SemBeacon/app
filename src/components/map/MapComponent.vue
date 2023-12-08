<template>
  <ol-map
    id="map"
    ref="mapRef"
    :load-tiles-while-animating="true"
    :load-tiles-while-interacting="true"
  >
    <!-- Projection view -->
    <ol-view :center="center" @change="handleViewChange" zoom="18" projection="EPSG:3857"></ol-view>

    <!-- Floor map view -->
    <map-image-component :mapObject="mapObject"></map-image-component>

    <geo-json-component
      v-for="environment in environments.values()"
      :key="environment.uid"
      :space="environment"
    >
    </geo-json-component>
    
    <!-- Your current location -->
    <location-marker-component></location-marker-component>

    <beacon-marker-component 
      v-if="zoom > 10" 
      :beacons="beacons">
    </beacon-marker-component>
  </ol-map>
</template>

<script lang="ts">
import { Vue, Options, Ref } from 'vue-property-decorator';
import { Absolute2DPosition } from '@openhps/core';
import BeaconMarkerComponent from './BeaconMarkerComponent.vue';
import GeoJsonComponent from './GeoJsonComponent.vue';
import { computed } from 'vue';
import { useGeolocationStore } from '../../stores/geolocation';
import { useBeaconStore } from '../../stores/beacon.scanning';
import { useEnvironmentStore } from '../../stores/environment';
import MapImageComponent from './MapImageComponent.vue';
import { MapObject } from '../../models/MapObject';
import { PolygonGeometry } from '@openhps/rdf';
import { Place } from '../../models/Place';
import { MapboxVectorLayer } from 'ol-mapbox-style';
import type { Map } from 'ol';
import { fromLonLat } from 'ol/proj';
import LocationMarkerComponent from './LocationMarkerComponent.vue';

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

@Options({
  components: {
    BeaconMarkerComponent,
    GeoJsonComponent,
    MapImageComponent,
    LocationMarkerComponent
  },
})
export default class MapComponent extends Vue {
  geolocationStore = useGeolocationStore();
  beaconStore = useBeaconStore();
  environmentStore = useEnvironmentStore();
  zoom = 18;
  id = prefersDark.matches ? 'mapbox/dark-v11' : 'mapbox/streets-v12';
  accessToken =
    'pk.eyJ1IjoibWF4aW12ZHciLCJhIjoiY2xnbnJmc3Q3MGFyZzNtcGp0eGNuemp5eCJ9.yUAGNxEFSIxHIXqk0tGoxw';

  beacons = computed(() => {
    return this.beaconStore.beaconsWithInfo.filter((b) => {
      const position = b.position as unknown as Absolute2DPosition;
      return position !== undefined && position.x !== undefined && !Number.isNaN(position.x);
    });
  });
  location = computed(() => {
    // const location: GeographicalPosition = this.geolocationStore.location;
    // return location && location.latitude ? fromLonLat([location.longitude, location.latitude]) : undefined;
    return [15246068.74999734, 4184646.631400167]
  });
  environments = computed(() => this.environmentStore.environments);
  defaultCenter: number[] = undefined;
  center = computed(() => {
    return this.defaultCenter ? fromLonLat(this.defaultCenter) : this.location ? (this.location as any) : [0, 0];
  });
  @Ref('mapRef') mapRef?: { map: Map };
  mapObject = new MapObject();

  beforeMount(): void {
    this.mapObject.image = 'https://en.nagoya-u.ac.jp/upload_images/higashiyamaen.jpg';
    this.mapObject.coverage = new Place();
    this.mapObject.coverage.geometry = new PolygonGeometry();
    this.mapObject.coverage.geometry.coords = [
      { latitude: 35.16048583997066, longitude: 136.9623791719176 },
      { latitude: 35.15444220583675, longitude: 136.9770457893308 },
      { latitude: 35.14658217841792, longitude: 136.97261458554803 },
      { latitude: 35.1526614848967, longitude: 136.95776580859618 },
    ] as any;
  }

  mounted() {
    this.mapRef?.map.addLayer(
      new MapboxVectorLayer({
        styleUrl: `mapbox://styles/${this.id}`,
        accessToken: this.accessToken,
        zIndex: 0
      }),
    );

    this.geolocationStore.sourceNode.start();
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
          this.mapRef.map.getView().setCenter(fromLonLat(this.defaultCenter));
          this.mapRef.map.getView().setZoom(18);
        }
      })
      .catch(console.error);
  }

  handleViewChange(event: any) {
    this.zoom = event.target.getZoom();
  }
}
</script>

<style scoped lang="scss">
@import "ol-geocoder/dist/ol-geocoder.min.css";

#map {
  height: 100%;
  width: 100%;
  background-color: var(--ion-background-color);
}
</style>
