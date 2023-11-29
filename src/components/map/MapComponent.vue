<template>
  <ol-map
    id="map"
    ref="mapRef"
    :loadTilesWhileAnimating="true"
    :loadTilesWhileInteracting="true"
  >
    <ol-view ref="viewRef" :center="center" :zoom="zoom">
    </ol-view>

    <map-image-component :map="mapObject"></map-image-component>
<!-- 
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
    </custom-marker-component> -->

    <beacon-marker-component v-for="beacon in beacons" :key="beacon.uid" :beacon="beacon">
    </beacon-marker-component>

    <geo-json-component
      v-for="environment in environments.values()"
      :key="environment.uid"
      :space="environment"
    >
    </geo-json-component>
  </ol-map>
</template>

<script lang="ts">
import { Vue, Options, Ref } from 'vue-property-decorator';
import { Absolute2DPosition, GeographicalPosition } from '@openhps/core';
import BeaconMarkerComponent from './BeaconMarkerComponent.vue';
import GeoJsonComponent from './GeoJsonComponent.vue';
import { computed } from 'vue';
import { useGeolocationStore } from '../../stores/geolocation';
import { useBeaconStore } from '../../stores/beacon.scanning';
import { useEnvironmentStore } from '../../stores/environment';
import MapImageComponent from './MapImageComponent.vue';
import { MapObject } from '../../models/MapObject';
import { PolygonGeometry, RDFSerializer } from '@openhps/rdf';
import { Place } from '../../models/Place';
import { MapboxVectorLayer } from 'ol-mapbox-style';
import type { Map, View } from 'ol';

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

@Options({
  components: {
    BeaconMarkerComponent,
    GeoJsonComponent,
    MapImageComponent,
  },
})
export default class MapComponent extends Vue {
  geolocationStore = useGeolocationStore();
  beaconStore = useBeaconStore();
  environmentStore = useEnvironmentStore();
  id = prefersDark.matches ? 'mapbox/dark-v11' : 'mapbox/streets-v11';
  accessToken =
    'pk.eyJ1IjoibWF4aW12ZHciLCJhIjoiY2xnbnJmc3Q3MGFyZzNtcGp0eGNuemp5eCJ9.yUAGNxEFSIxHIXqk0tGoxw';
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
  @Ref("mapRef") mapRef?: { map: Map };
  @Ref("viewRef") viewRef?: { view: View };
  mapObject = new MapObject();
  
  mounted() {
    this.mapRef?.map.addLayer(new MapboxVectorLayer({
      styleUrl: `mapbox://styles/${this.id}`,
      accessToken: this.accessToken
    }));

    this.geolocationStore.sourceNode.start();
    this.mapObject.image = 'https://en.nagoya-u.ac.jp/upload_images/higashiyamaen.jpg';
    this.mapObject.coverage = new Place();
    this.mapObject.coverage.geometry = new PolygonGeometry();
    this.mapObject.coverage.geometry.coords = [
      { latitude: 35.16048583997066, longitude: 136.9623791719176 },
      { latitude: 35.15444220583675, longitude: 136.9770457893308 },
      { latitude: 35.1526614848967, longitude: 136.95776580859618 },
      { latitude: 35.14658217841792, longitude: 136.97261458554803 }
    ] as any;
    console.log(RDFSerializer.serialize(this.mapObject, {
      baseUri: "https://sembeacon.org/examples/iot2023.ttl#",
    }));

    if (this.defaultCenter) {
      this.viewRef.view.setCenter(this.defaultCenter);
      this.viewRef.view.setZoom(18);
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
          this.viewRef.view.setCenter(this.defaultCenter);
          this.viewRef.view.setZoom(18);
        }
      })
      .catch(console.error);
  }
}
</script>

<style scoped lang="scss">
#map {
  height: 100%;
  width: 100%;
  background-color: var(--ion-background-color);
}
</style>