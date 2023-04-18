<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>

        <ion-title>Beacon Scanner</ion-title>
      </ion-toolbar>

      <ion-toolbar color="primary">
        <ion-segment value="scanning">
          <ion-segment-button value="scanning">
            <ion-label>Scanning</ion-label>
          </ion-segment-button>
          <ion-segment-button value="advertising">
            <ion-label>Advertising</ion-label>
          </ion-segment-button>
        </ion-segment>

        <ion-progress-bar v-if="this.beaconStore.isScanning" type="indeterminate"></ion-progress-bar>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div id="container">
        <ion-list v-if="beacons.size > 0">
          <beacon-item-component 
            v-for="beacon in beacons.values()" 
            :key="beacon.uid"
            :beacon="beacon"
          >
          </beacon-item-component>
        </ion-list>
      </div>
      
      <ion-fab slot="fixed" horizontal="end" vertical="bottom">
        <ion-fab-button @click="toggleScan" :color="this.beaconStore.isScanning ? 'danger' : 'primary'">
          <ion-spinner name="circular" v-if="loading"></ion-spinner>
          <ion-icon :name="this.beaconStore.isScanning ? 'pause' : 'search'" v-if="!loading"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>


<script lang="ts">
import { Vue, Options } from 'vue-property-decorator';
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
} from '@ionic/vue';
import BeaconItemComponent from '../components/beacons/BeaconItemComponent.vue';
import { useBeaconStore } from '../stores/beacon';
import { computed } from 'vue';
import { pause, search } from 'ionicons/icons';

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
    BeaconItemComponent,
    IonFab,
    IonFabButton,
    IonSpinner,
    IonProgressBar,
    IonIcon,
    IonSegment,
    IonSegmentButton,
  },
  data: () => ({
    pause,
    search
  })
})
export default class ScanPage extends Vue {
  beaconStore = useBeaconStore();
  beacons = computed(() => this.beaconStore.beacons);
  loading = false;

  toggleScan(): void {
    if (!this.loading) {
      this.loading = true;
      if (this.beaconStore.isScanning) {
        this.beaconStore.stopScan().then(() => {
          //
        }).catch(err => {
          //
          console.error(err);
        }).finally(() => {
          this.loading = false;
        });
      } else {
        // Start scan
        this.beaconStore.startScan().then(() => {
          //
        }).catch(err => {
          //
          console.error(err);
        }).finally(() => {
          this.loading = false;
        });
      }
    }
  }
}
</script>

<style scoped lang="scss">
ion-header ion-toolbar:first-child {
  margin-bottom: -1px;
}
</style>