<template>
    <ion-content :fullscreen="true">
      <div id="container">
        <ion-list v-if="beacons.length > 0">
          <beacon-item-component 
            v-for="beacon in beacons" 
            :key="beacon.uid"
            :beacon="beacon"
          >
          </beacon-item-component>
        </ion-list>
        <section class="help-text ion-padding-top ion-text-center" v-else-if="!beaconStore.isScanning">
          <div>
            <h2 style="font-size: 1em">Click the search button to scan for nearby beacons.</h2>
          </div>
        </section>
      </div>
      
      <ion-fab slot="fixed" horizontal="end" vertical="bottom">
        <ion-fab-button @click="toggleScan" :color="this.beaconStore.isScanning ? 'danger' : 'primary'">
          <ion-spinner name="circular" v-if="loading"></ion-spinner>
          <ion-icon :name="this.beaconStore.isScanning ? 'stop' : 'search'" v-if="!loading"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
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
  IonInput,
  IonLabel,
  IonFab,
  IonFabButton,
  IonSpinner,
  IonIcon,
  IonProgressBar,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonCardSubtitle,
  IonToggle,
} from '@ionic/vue';
import { computed } from 'vue';
import BeaconItemComponent from '../components/beacons/BeaconItemComponent.vue';
import { stop, search } from 'ionicons/icons';
import { useBeaconStore } from '../stores/beacon.scanning';
import { useEnvironmentStore } from '../stores/environment';
import { Capacitor } from '@capacitor/core';

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
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCardTitle,
    IonCardSubtitle,
    IonInput,
    IonButton,
    IonToggle,
  },
  data: () => ({
    stop,
    search
  })
})
export default class BLESimulatorComponent extends Vue {
    beaconStore = useBeaconStore();
  environmentStore = useEnvironmentStore();
  loading = false;
  beacons = computed(() => Array.from(this.beaconStore.beacons.values()).filter(beacon => beacon.lastSeen !== undefined));
  platform = Capacitor.getPlatform();

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
.help-text {
  margin-top: 3em;
  padding-left: 1em;
  padding-right: 1em;
}
</style>