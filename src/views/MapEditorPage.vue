<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button></ion-menu-button>
                </ion-buttons>

                <ion-title>Map Editor</ion-title>

                <ion-progress-bar
                    v-if="beaconStore.isScanning"
                    color="light"
                    type="indeterminate"
                ></ion-progress-bar>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <div id="container">
                <add-map-fab-component></add-map-fab-component>
                <create-building-modal></create-building-modal>

                <!-- Map image screen -->
                <map-image-component ref="imageEditor"></map-image-component>
                <!-- Map screen -->
                <map-component ref="mapRef" :center="defaultCenter" @change="handleViewChange">
                    <location-target-component></location-target-component>
                    <!-- Context menu -->
                    <context-menu-component @action:upload="imageEditor.upload()">
                    </context-menu-component>

                    <!-- Buildings -->
                    <building-component
                        v-for="building in buildings"
                        ref="buildingRef"
                        :key="building.uid"
                        :building="building"
                    >
                    </building-component>

                    <!-- Your current location -->
                    <location-marker-component></location-marker-component>
                    <!-- Location center button -->
                    <location-center-component ref="locationCenterRef"></location-center-component>
                </map-component>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { Vue, Component, Ref, Provide, Watch } from 'vue-facing-decorator';
import {
    IonButtons,
    IonContent,
    IonHeader,
    IonMenuButton,
    IonPage,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonFab,
    IonFabButton,
    IonSpinner,
    IonIcon,
    IonProgressBar,
    IonSegment,
    IonSegmentButton,
    IonSearchbar,
} from '@ionic/vue';
import { useBeaconStore } from '@/stores/beacon.scanning';
import { computed } from 'vue';
import { stop, play } from 'ionicons/icons';
import MapComponent from '@/components/map/MapComponent.vue';
import { useRoute } from 'vue-router';
import { ControllerState } from '../stores/types';
import { useGeolocationStore } from '@/stores/geolocation';
import LocationMarkerComponent from '@/components/map/markers/LocationMarkerComponent.vue';
import MapImageComponent from '@/components/map/editor/MapImageComponent.vue';
import LocationCenterComponent from '@/components/map/controls/LocationCenterComponent.vue';
import CreateBuildingModal from '@/components/modals/CreateBuildingModal.vue';
import { useSettings } from '@/stores/settings';
import { Building } from '@openhps/geospatial';
import { Coordinate } from 'ol/coordinate';
import { useEnvironmentStore } from '@/stores/environment';
import { Map as OlMap } from 'ol';
import { fromLonLat } from 'ol/proj';
import BuildingComponent from '@/components/map/BuildingComponent.vue';
import { Absolute2DPosition, GCS, GeographicalPosition, Vector2 } from '@openhps/core';
import ContextMenuComponent from '@/components/map/controls/ContextMenuComponent.vue';
import AddMapFabComponent from '@/components/map/controls/AddMapFabComponent.vue';
import LocationTargetComponent from '@/components/map/controls/LocationTargetComponent.vue';

@Component({
    components: {
        LocationTargetComponent,
        LocationMarkerComponent,
        MapImageComponent,
        LocationCenterComponent,
        CreateBuildingModal,
        BuildingComponent,
        ContextMenuComponent,
        AddMapFabComponent,
        IonButtons,
        IonContent,
        IonHeader,
        IonMenuButton,
        IonPage,
        IonTitle,
        IonToolbar,
        IonList,
        IonItem,
        IonLabel,
        IonFab,
        IonFabButton,
        IonSpinner,
        IonProgressBar,
        IonIcon,
        IonSegment,
        IonSegmentButton,
        MapComponent,
        IonSearchbar,
    },
    provide: () => ({
        stop,
        play,
        ControllerState,
    }),
})
export default class MapEditorPage extends Vue {
    route = useRoute();
    geolocationStore = useGeolocationStore();
    beaconStore = useBeaconStore();
    environmentStore = useEnvironmentStore();
    settings = useSettings();

    beacons = computed(() => this.beaconStore.beacons);
    loading = false;
    @Ref('mapComponent') map: MapComponent;

    zoom = 18;

    location = computed(() => {
        const location: GeographicalPosition = this.geolocationStore.location;
        return location && location.latitude
            ? fromLonLat([location.longitude, location.latitude])
            : undefined;
    });
    buildings = computed(() => this.environmentStore.buildings) as unknown as Building[];
    defaultCenter: number[] = [0, 0];
    @Ref() mapRef?: { map: OlMap };
    @Ref() buildingRef: BuildingComponent[] = [];
    @Ref() locationCenterRef: LocationCenterComponent;
    @Provide()
    imageEditor: MapImageComponent;

    mounted() {
        this.imageEditor = this.$refs.imageEditor as MapImageComponent;

        this.geolocationStore
            .initialize()
            .then(() => {
                return this.geolocationStore.start();
            })
            .catch(console.error);
    }

    @Watch('geolocationStore.location')
    onLocationChange(): void {
        if (this.following) {
            this.defaultCenter = this.location as unknown as Coordinate;
        }
    }

    get following(): boolean {
        return this.locationCenterRef.following;
    }

    set following(following: boolean) {
        this.locationCenterRef.following = following;
    }

    unmounted() {
        this.geolocationStore.stop();
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
                    this.defaultCenter = fromLonLat([array[1], array[0]]);
                    this.mapRef.map.getView().setCenter(this.defaultCenter);
                    this.mapRef.map.getView().setZoom(18);
                }
            })
            .catch(console.error);
    }

    handleViewChange(event: any) {
        this.zoom = event.target.getZoom();
        const buildingDistances = this._buildingDistances();
        this.buildingRef.forEach((component) => {
            if (
                component.building === buildingDistances[0].building &&
                this.zoom > 16 &&
                buildingDistances[0].distance < 200
            ) {
                component.setFocus(true);
            } else {
                component.setFocus(false);
            }
        });
        this.following = false;
    }

    _buildingDistances(): { building: Building; distance: number }[] {
        const viewCenter = this.mapRef.map.getView().getCenter();
        const viewCenterVector = new Vector2(viewCenter[0], viewCenter[1]);
        const distances: { building: Building; distance: number }[] =
            this.environmentStore.buildings
                .map((building) => {
                    const position = building.centroid as GeographicalPosition;
                    if (!position) {
                        return { building, distance: Infinity };
                    }
                    const center: Coordinate = position.toVector3(GCS.EPSG3857).toArray();
                    const distance = new Vector2(center[0], center[1]).distanceTo(viewCenterVector);
                    return { building, distance };
                })
                .sort((a, b) => a.distance - b.distance);
        return distances;
    }

    ionViewDidEnter(): void {
        const beaconUID = this.route.params.beaconUID as string;
        if (beaconUID) {
            this.highlightBeacon(beaconUID);
        }
    }

    toggleScan(): void {
        if (!this.loading) {
            this.loading = true;
            if (this.beaconStore.isScanning) {
                this.beaconStore
                    .stopScan()
                    .then(() => {
                        //
                    })
                    .catch((err) => {
                        //
                        console.error(err);
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            } else {
                // Start scan
                this.beaconStore
                    .startScan()
                    .then(() => {
                        //
                    })
                    .catch((err) => {
                        //
                        console.error(err);
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            }
        }
    }
}
</script>
