<template>
  <ion-content :fullscreen="true">
    <ion-list>
      <ion-item v-if="beaconStore.state === ControllerState.NO_PERMISSION" button="false" color="danger">
        <ion-label class="ion-text-center">
          <h2>No Bluetooth permission to initiate advertising!</h2>
        </ion-label>
      </ion-item>
      <ion-item v-else-if="beaconStore.state === ControllerState.DISABLED" button="false" color="danger">
        <ion-label class="ion-text-center">
          <h2>Bluetooth advertising is not supported!</h2>
        </ion-label>
      </ion-item>
      <beacon-item-component
        v-for="beacon in beacons"
        :key="beacon.uid"
        :beacon="beacon"
        simulator="true"
        :disabled="beaconStore.state !== ControllerState.READY"
        @simulateToggle="toggleAdvertising"
        @clickBeacon="() => $router.push(`/beacon/edit/${beacon.uid}`)"
        @deleteBeacon="deleteBeacon"
      >
      </beacon-item-component>
    </ion-list>

    <ion-fab slot="fixed" horizontal="end" vertical="bottom">
      <ion-fab-button :disabled="beaconStore.state !== ControllerState.READY" @click="addBeacon">
        <ion-icon name="add-outline"></ion-icon>
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
  IonActionSheet,
  actionSheetController,
} from '@ionic/vue';
import BeaconItemComponent from '../components/beacons/BeaconItemComponent.vue';
import { SimulatedBeacon, useBeaconAdvertisingStore } from '../stores/beacon.advertising';
import { computed } from 'vue';
import { ControllerState } from '../stores/types';
import { BLEAltBeacon, BLEAltBeaconBuilder, BLEBeaconObject, BLEiBeacon, BLEiBeaconBuilder } from '@openhps/rf';
import { BLESemBeacon } from '../models/BLESemBeacon';
import { BLESemBeaconBuilder } from '../models/BLESemBeaconBuilder';
import { useBeaconStore } from '../stores/beacon.scanning';

@Options({
  components: {
    IonActionSheet,
    IonButtons,
    IonContent,
    IonHeader,
    IonMenuButton,
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
    ControllerState,
  }),
})
export default class BLESimulatorComponent extends Vue {
  beaconStore = useBeaconAdvertisingStore();
  beaconScannerStore = useBeaconStore();
  beacons = computed(() => Array.from(this.beaconStore.beacons.values()));

  async addBeacon(): Promise<void> {
    const action = await actionSheetController.create({
      header: 'Simulate a beacon',
      buttons: [
        {
          text: 'Create SemBeacon',
          handler: () => {
            this.createBeacon(BLESemBeacon);
          },
        },
        {
          text: 'Create iBeacon',
          handler: () => {
            this.createBeacon(BLEiBeacon);
          },
        },
        {
          text: 'Create AltBeacon',
          handler: () => {
            this.createBeacon(BLEAltBeacon);
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ],
    });

    await action.present();
  }

  createBeacon(type: new () => BLEBeaconObject): void {
    switch (type) {
      case BLEiBeacon:
        BLEiBeaconBuilder.create()
          .build()
          .then((beacon) => {
            this.beaconStore.addSimulatedBeacon(beacon.uid, beacon);
            this.$router.push(`/beacon/edit/${beacon.uid}`);
          });
        return;
      case BLEAltBeacon:
        BLEAltBeaconBuilder.create()
          .build()
          .then((beacon) => {
            this.beaconStore.addSimulatedBeacon(beacon.uid, beacon);
            this.$router.push(`/beacon/edit/${beacon.uid}`);
          });
        return;
      case BLESemBeacon:
        BLESemBeaconBuilder.create()
          .build()
          .then((beacon) => {
            this.beaconStore.addSimulatedBeacon(beacon.uid, beacon);
            this.$router.push(`/beacon/edit/${beacon.uid}`);
          });
        return;
    }
  }

  toggleAdvertising(beacon: SimulatedBeacon, advertising: boolean): void {
    if (advertising) {
      this.beaconStore.startAdvertising(beacon);
    } else {
      this.beaconStore.stopAdvertising(beacon);
    }
  }

  deleteBeacon(beacon: SimulatedBeacon): void {
    this.beaconStore.delete(beacon);
  }

  stopAdvertising(): void {
    this.beaconStore.stopAdvertising();
  }
}
</script>

<style scoped lang="scss">
.help-text {
  margin-top: 3em;
  padding-left: 1em;
  padding-right: 1em;
}
ion-list {
  margin-bottom: 50px;
}
</style>
