<template>
  <ion-page>
    <div id="container">
      <ion-list :disabled="this.beaconStore.state === ControllerState.NO_PERMISSION">
        <ion-item 
          button="false" 
          v-if="this.beaconStore.state === ControllerState.NO_PERMISSION"
          color="danger">
          <ion-label class="ion-text-center">
            <h2>No Bluetooth permission to initiate advertising!</h2>
          </ion-label>
        </ion-item>
        <beacon-item-component 
          v-for="beacon in beacons" 
          :key="beacon.uid"
          :beacon="beacon"
          simulator="true"
          @simulateToggle="toggleAdvertising"
          :disabled="this.beaconStore.state === ControllerState.NO_PERMISSION"
          @clickBeacon="() => $router.push(`/beacon/edit/${beacon.uid}`)">
        </beacon-item-component>
      </ion-list>
    </div>

    <ion-action-sheet
      :is-open="isOpen"
      header="Simulate a beacon"
      :buttons="actionSheetButtons"
      @didDismiss="this.isOpen = false"
    ></ion-action-sheet>

    <ion-fab slot="fixed" horizontal="end" vertical="bottom">
      <ion-fab-button 
        @click="addBeacon" 
        color="primary"
        :disabled="this.beaconStore.state !== ControllerState.READY"
      >
        <ion-icon name="add-outline"></ion-icon>
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
  IonActionSheet
} from '@ionic/vue';
import BeaconItemComponent from '../components/beacons/BeaconItemComponent.vue';
import { SimulatedBeacon, useBeaconAdvertisingStore } from '../stores/beacon.advertising';
import { computed } from 'vue';
import { ControllerState } from '../stores/types';

@Options({
  components: {
    IonActionSheet,
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
    ControllerState
  })
})
export default class BLESimulatorComponent extends Vue {
  beaconStore = useBeaconAdvertisingStore();
  beacons = computed(() => Array.from(this.beaconStore.beacons.values()));
  isOpen: boolean = false;
  actionSheetButtons = [
    {
      text: 'Create SemBeacon',
      data: {
        action: 'add-sembeacon',
      },
    },
    {
      text: 'Create iBeacon',
      data: {
        action: 'add-ibeacon',
      },
    },
    {
      text: 'Create Eddystone',
      data: {
        action: 'add-eddystone',
      },
    },
    {
      text: 'Create AltBeacon',
      data: {
        action: 'add-altbeacon',
      },
    },
    {
      text: 'Cancel',
      role: 'cancel',
      data: {
        action: 'cancel',
      },
    },
  ];

  addBeacon(): void {
    this.isOpen = true;
  }

  toggleAdvertising(beacon: SimulatedBeacon, advertising: boolean): void {
    if (advertising) {
      this.beaconStore.startAdvertising(beacon);
    } else {
      this.beaconStore.stopAdvertising(beacon);
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