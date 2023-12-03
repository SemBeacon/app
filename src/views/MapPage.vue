<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>

        <ion-title>Beacon Map</ion-title>
        <ion-progress-bar
          v-if="beaconStore.isScanning"
          color="light"
          type="indeterminate"
        ></ion-progress-bar>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div id="container">
        <map-component ref="mapComponent"> </map-component>
      </div>

      <ion-fab slot="fixed" horizontal="end" vertical="bottom">
        <ion-fab-button
          :color="beaconStore.isScanning ? 'danger' : undefined"
          :disabled="beaconStore.state !== ControllerState.READY"
          @click="toggleScan"
        >
          <ion-spinner v-if="loading" name="circular"></ion-spinner>
          <ion-icon v-if="!loading" :name="beaconStore.isScanning ? 'stop' : 'play'"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { Vue, Options, Ref } from 'vue-property-decorator';
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
import { useBeaconStore } from '../stores/beacon.scanning';
import { computed } from 'vue';
import { stop, play } from 'ionicons/icons';
import MapComponent from '../components/map/MapComponent.vue';
import { useRoute } from 'vue-router';
import { ControllerState } from '../stores/types';
import { useGeolocationStore } from '../stores/geolocation';

@Options({
  components: {
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
  data: () => ({
    stop,
    play,
    ControllerState,
  }),
})
export default class MapPage extends Vue {
  route = useRoute();
  geolocationStore = useGeolocationStore();
  beaconStore = useBeaconStore();
  beacons = computed(() => this.beaconStore.beacons);
  loading = false;
  @Ref('mapComponent') map: MapComponent;

  ionViewDidEnter(): void {
    const beaconUID = this.route.params.beaconUID as string;
    if (beaconUID) {
      this.map.highlightBeacon(beaconUID);
    }
  }

  mounted(): void {
    this.geolocationStore.initialize().catch(console.error);
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
