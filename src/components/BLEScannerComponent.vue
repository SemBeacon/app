<template>
  <ion-page>
    <div id="container">
      <ion-list v-if="beacons.length > 0 || this.beaconStore.state === ControllerState.NO_PERMISSION">
        <ion-item 
          button="false" 
          v-if="this.beaconStore.state === ControllerState.NO_PERMISSION"
          color="danger">
          <ion-label class="ion-text-center">
            <h2>No Bluetooth permission to initiate scanning!</h2>
          </ion-label>
        </ion-item>
        <beacon-item-component 
          v-for="beacon in beacons" 
          :key="beacon.uid"
          :beacon="beacon"
          @clickBeacon="() => $router.push(`/beacon/${beacon.uid}`)">
        </beacon-item-component>
      </ion-list>

      <section class="help-text ion-padding-top ion-text-center" v-else-if="!beaconStore.isScanning">
        <div>
          <h2 style="font-size: 1em">Click the search button to scan for nearby beacons.</h2>
        </div>
      </section>
    </div>
    
    <ion-fab slot="fixed" horizontal="end" vertical="bottom">
      <ion-fab-button 
        @click="toggleScan" 
        :color="this.beaconStore.isScanning ? 'danger' : 'primary'"
        :disabled="this.beaconStore.state !== ControllerState.READY"
      >
        <ion-spinner name="circular" v-if="loading"></ion-spinner>
        <ion-icon :name="this.beaconStore.isScanning ? 'stop' : 'search'" v-if="!loading"></ion-icon>
      </ion-fab-button>
    </ion-fab>
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
import { Toast } from '@capacitor/toast';
import { ControllerState } from '../stores/types';

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
    search,
    ControllerState
  })
})
export default class BLESimulatorComponent extends Vue {
  beaconStore = useBeaconStore();
  environmentStore = useEnvironmentStore();
  loading = false;
  beacons = computed(() => 
    Array.from(this.beaconStore.beacons.values())
      .filter(beacon => beacon.lastSeen !== undefined)
      .sort((a, b) => b.lastSeen - a.lastSeen)
  );
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
          Toast.show({
            text: `Error while stopping scan! ${err}`,
          });
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
          Toast.show({
            text: `Error while starting scan! ${err}`,
          });
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