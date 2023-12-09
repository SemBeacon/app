<template>
    <ol-map
        id="map"
        ref="mapRef"
        :load-tiles-while-animating="true"
        :load-tiles-while-interacting="true"
    >
        <!-- Projection view -->
        <ol-view
            :center="center"
            zoom="18"
            projection="EPSG:3857"
            @change="handleViewChange"
        ></ol-view>

        <!-- Buildings -->
        <building-component 
          ref="buildingRef"
          v-for="building in buildings" 
          :building="building" 
          :key="building.uid">
        </building-component>

        <!-- Your current location -->
        <location-marker-component></location-marker-component>
    </ol-map>
</template>

<script lang="ts">
import { Vue, Options, Ref } from 'vue-property-decorator';
import { Absolute2DPosition, GCS, GeographicalPosition } from '@openhps/core';
import { computed } from 'vue';
import { useGeolocationStore } from '../../stores/geolocation';
import { useBeaconStore } from '../../stores/beacon.scanning';
import { useEnvironmentStore } from '../../stores/environment';
import { MapboxVectorLayer } from 'ol-mapbox-style';
import type { Map as OlMap } from 'ol';
import { fromLonLat } from 'ol/proj';
import BuildingComponent from './BuildingComponent.vue';
import { Building } from '@openhps/geospatial';
import { Coordinate } from 'ol/coordinate';
import { Vector2 } from '@openhps/core';
import LocationMarkerComponent from './markers/LocationMarkerComponent.vue';

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

@Options({
    components: {
        BuildingComponent,
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

    location = computed(() => {
        const location: GeographicalPosition = this.geolocationStore.location;
        return location && location.latitude
            ? fromLonLat([location.longitude, location.latitude])
            : undefined;
    });
    buildings = computed(() => this.environmentStore.buildings);
    defaultCenter: number[] = undefined;
    center = computed(() => {
        return this.defaultCenter
            ? fromLonLat(this.defaultCenter)
            : this.location
            ? (this.location as any)
            : [0, 0];
    });
    @Ref() mapRef?: { map: OlMap };
    @Ref() buildingRef: BuildingComponent[] = [];

    mounted() {
        this.mapRef.map.addLayer(
            new MapboxVectorLayer({
                styleUrl: `mapbox://styles/${this.id}`,
                accessToken: this.accessToken,
                zIndex: 0,
                declutter: true
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
                if (
                    position !== undefined &&
                    position.x !== undefined &&
                    !Number.isNaN(position.x)
                ) {
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
        const buildingDistances = this._buildingDistances();
        this.buildingRef.forEach(component => {
          if (component.building === buildingDistances[0].building 
            && this.zoom > 16
            && buildingDistances[0].distance < 200) {
            component.setFocus(true);
          } else {
            component.setFocus(false);
          }
        });
    }

    _buildingDistances(): { building: Building, distance: number }[] {
      const viewCenter = this.mapRef.map.getView().getCenter();
      const viewCenterVector = new Vector2(viewCenter[0], viewCenter[1]);
      const distances: { building: Building, distance: number }[] = this.environmentStore.buildings
        .map(building => {
          const position = building.centroid as GeographicalPosition;
          const center: Coordinate = position.toVector3(GCS.EPSG3857).toArray();
          const distance = new Vector2(center[0], center[1])
            .distanceTo(viewCenterVector);
          return { building, distance };
        }).sort((a, b) => a.distance - b.distance);
      return distances;
    }
}
</script>

<style scoped lang="scss">
@import 'ol-geocoder/dist/ol-geocoder.min.css';

#map {
    height: 100%;
    width: 100%;
    background-color: var(--ion-background-color);
}
</style>
