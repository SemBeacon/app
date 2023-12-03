<template>
    <ol-vector-layer v-if="location" key="phone">
      <ol-source-vector>
        <ol-feature>
          <ol-geom-point :coordinates="location"></ol-geom-point>
          <ol-style>
            <ol-style-circle radius="5">
              <ol-style-fill color="white"></ol-style-fill>
              <ol-style-stroke
                color="#0066ff"
                width="5"
              ></ol-style-stroke>
            </ol-style-circle>
          </ol-style>
        </ol-feature>
      </ol-source-vector>
    </ol-vector-layer>
</template>


<script lang="ts">
import { Vue, Options } from 'vue-property-decorator';
import { GeographicalPosition } from '@openhps/core';
import BeaconMarkerComponent from './BeaconMarkerComponent.vue';
import GeoJsonComponent from './GeoJsonComponent.vue';
import { computed } from 'vue';
import { useGeolocationStore } from '../../stores/geolocation';
import MapImageComponent from './MapImageComponent.vue';
import { fromLonLat } from 'ol/proj';

@Options({
  components: {
    BeaconMarkerComponent,
    GeoJsonComponent,
    MapImageComponent,
  },
})
export default class LocationMarkerComponent extends Vue {
  geolocationStore = useGeolocationStore();

  location = computed(() => {
    const location: GeographicalPosition = this.geolocationStore.location;
    return location && location.latitude ? fromLonLat([location.longitude, location.latitude]) : undefined;
  });
}
</script>
