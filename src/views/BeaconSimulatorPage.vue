<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>

        <ion-title>Beacon</ion-title>

        <ion-buttons v-if="!isLoading" slot="end">
          <ion-button
            v-if="beaconAdvertisingStore.advertisingBeacons.length > 0"
            icon-only
            :style="{ color: '#ffffff', fontSize: '1.2em' }"
            @click="simulatorComponent.stopAdvertising"
          >
            <b-icon-wifi-off></b-icon-wifi-off>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

      <ion-toolbar class="tab-selector">
        <ion-segment :value="$route.path" @ionChange="(e) => $router.replace(e.target.value)">
          <ion-segment-button value="/beacon/scanner">
            <ion-label>Scanner</ion-label>
          </ion-segment-button>
          <ion-segment-button value="/beacon/simulator">
            <ion-label>Simulator</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <BLESimulatorComponent ref="simulatorComponent"></BLESimulatorComponent>

    <ion-tab-bar slot="bottom" class="tab-selector">
      <ion-tab-button tab="scanner" href="/beacon/scanner">
        <ion-icon icon="search" />
        <ion-label>Scanner</ion-label>
      </ion-tab-button>

      <ion-tab-button tab="simulator" href="/beacon/simulator">
        <ion-icon icon="wifi" />
        <ion-label>Simulator</ion-label>
      </ion-tab-button>
    </ion-tab-bar>
  </ion-page>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-property-decorator';
import {
  IonTabBar,
  IonTabButton,
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
  IonButton,
  alertController,
} from '@ionic/vue';
import BeaconItemComponent from '../components/beacons/BeaconItemComponent.vue';
import { useBeaconAdvertisingStore } from '../stores/beacon.advertising';
import { Capacitor } from '@capacitor/core';
import BLESimulatorComponent from '../components/BLESimulatorComponent.vue';
import { Ref } from 'vue-property-decorator';
import { BLESemBeaconBuilder } from '../models/BLESemBeaconBuilder';
import { BLEUUID } from '@openhps/rf';

@Options({
  components: {
    BLESimulatorComponent,
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
    IonTabBar,
    IonTabButton,
  },
  data: () => ({}),
})
export default class BeaconSimulatorPage extends Vue {
  isLoading: boolean = true;
  beaconAdvertisingStore = useBeaconAdvertisingStore();
  platform = Capacitor.getPlatform();
  @Ref() simulatorComponent: BLESimulatorComponent;

  beforeMount() {
    this.isLoading = true;
  }

  ionViewDidEnter(): void {
    setTimeout(async () => {
      if (this.simulatorComponent.beaconStore.beacons.size === 0) {
        const alert = await alertController.create({
          header: 'Load default beacons',
          subHeader: 'Download IoT 2023 beacons',
          message:
            'You currently do not have any beacons to simulate. Do you want to download the IoT 2023 demo beacons?',
          buttons: [
            {
              text: 'No',
              role: 'cancel',
            },
            {
              text: 'Yes',
              role: 'confirm',
              handler: () => {
                BLESemBeaconBuilder.create()
                  .namespaceId(BLEUUID.fromString('77f340db-ac0d-20e8-aa3a-f656a29f236c'))
                  .instanceId('9c7ce6fc')
                  .shortResourceUri('https://bit.ly/3JsEnF9')
                  .build()
                  .then((dummy) => {
                    return this.simulatorComponent.beaconScannerStore.beaconService.resolve(dummy, {
                      resolveAll: true,
                    });
                  })
                  .then((beacons) => {
                    this.simulatorComponent.beaconStore.addSimulatedBeacon(beacons.result.uid, beacons.result);
                    beacons.beacons.forEach((beacon) => {
                      this.simulatorComponent.beaconStore.addSimulatedBeacon(beacon.uid, beacon);
                    });
                  });
              },
            },
          ],
        });

        await alert.present();
      }
    }, 1000);
  }

  mounted() {
    this.isLoading = false;
  }
}
</script>

<style scoped lang="scss">
ion-header ion-toolbar:first-child {
  margin-bottom: -1px;
}
.help-text {
  margin-top: 3em;
  padding-left: 1em;
  padding-right: 1em;
}

ion-tab-bar.tab-selector.md {
  display: none;
}

ion-toolbar.tab-selector.ios {
  display: none;
}
</style>
