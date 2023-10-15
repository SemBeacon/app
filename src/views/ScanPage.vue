<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>

        <ion-title>Beacon</ion-title>

        <ion-buttons slot="end">
          <ion-button icon-only color="danger" @click="clearCache">
            <ion-icon :disabled="beaconStore.cacheSize === 0" name="trash"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

      <ion-toolbar color="primary">
        <ion-segment value="scanning">
          <ion-segment-button @click="() => tab = 1" value="scanning">
            <ion-label>Scanning</ion-label>
          </ion-segment-button>
          <ion-segment-button @click="() => tab = 2" value="advertising">
            <ion-label>Advertising</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" v-if="tab === 1">
      <div id="container">
        <ion-list v-if="beacons.length > 0">
          <beacon-item-component 
            v-for="beacon in beacons" 
            :key="beacon.uid"
            :beacon="beacon"
          >
          </beacon-item-component>
        </ion-list>
        <!-- TODO: Add an image when no beacons -->
      </div>
      
      <ion-fab slot="fixed" horizontal="end" vertical="bottom">
        <ion-fab-button @click="toggleScan" :color="this.beaconStore.isScanning ? 'danger' : 'primary'">
          <ion-spinner name="circular" v-if="loading"></ion-spinner>
          <ion-icon :name="this.beaconStore.isScanning ? 'pause' : 'search'" v-if="!loading"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>

    <advertising-component v-if="tab === 2"></advertising-component>
  </ion-page>
</template>


<script lang="ts">
import { Vue, Options } from 'vue-property-decorator';
import { computed } from 'vue';
import AdvertisingComponent from '../components/AdvertisingComponent.vue';
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
  IonInput,
  IonLabel,
  IonFab,
  IonFabButton,
  IonSpinner,
  IonIcon,
  IonProgressBar,
  IonSegment,
  IonSegmentButton,
  IonButton
} from '@ionic/vue';
import BeaconItemComponent from '../components/beacons/BeaconItemComponent.vue';
import { useBeaconStore } from '../stores/beacon';
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
    IonInput,
    IonButton,
    AdvertisingComponent,
  },
  data: () => ({
    pause,
    search
  })
})
export default class ScanPage extends Vue {
  tab = 1;
  beaconStore = useBeaconStore();
  loading = false;
  beacons = computed(() => Array.from(this.beaconStore.beacons.values()).filter(beacon => beacon.lastSeen !== undefined));

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

  clearCache(): void {
    this.beaconStore.clear();
  }
}
</script>

<style scoped lang="scss">
ion-header ion-toolbar:first-child {
  margin-bottom: -1px;
}
</style>