<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>

        <ion-title>Beacon</ion-title>

        <ion-buttons slot="end">
          <ion-button 
            icon-only 
            color="danger" 
            :disabled="beaconStore.cacheSize === 0" 
            @click="clearCache"
          >
            <ion-icon name="trash"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

      <ion-toolbar color="primary" v-if="platform !== 'ios'">
        <ion-segment value="scanning">
          <ion-segment-button @click="() => tab = 1" value="scanning">
            <ion-label>Scanner</ion-label>
          </ion-segment-button>
          <ion-segment-button @click="() => tab = 2" value="advertising">
            <ion-label>Simulator</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <BLEScannerComponent v-if="tab === 1"></BLEScannerComponent>
    <BLESimulatorComponent v-if="tab === 2"></BLESimulatorComponent>
    
    <ion-tab-bar slot="bottom" v-if="platform === 'ios'">
      <ion-tab-button tab="home" @click="() => tab = 1">
        <ion-icon icon="search"/>
        <ion-label>Scanner</ion-label>
      </ion-tab-button>

      <ion-tab-button tab="radio" @click="() => tab = 2">
        <ion-icon icon="wifi" />
        <ion-label>Simulator</ion-label>
      </ion-tab-button>
    </ion-tab-bar>
  </ion-page>
</template>


<script lang="ts">
import { Vue, Options } from 'vue-property-decorator';
import BLESimulatorComponent from '../components/BLESimulatorComponent.vue';
import BLEScannerComponent from '../components/BLEScannerComponent.vue';
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
  IonButton
} from '@ionic/vue';
import BeaconItemComponent from '../components/beacons/BeaconItemComponent.vue';
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
    IonSegment,
    IonSegmentButton,
    IonInput,
    IonButton,
    IonTabBar,
    IonTabButton,
    BLEScannerComponent,
    BLESimulatorComponent
  },
  data: () => ({

  })
})
export default class BeaconsPage extends Vue {
  tab = 1;
  beaconStore = useBeaconStore();
  environmentStore = useEnvironmentStore();
  platform = Capacitor.getPlatform();

  clearCache(): void {
    this.beaconStore.clear();
    this.environmentStore.clear();
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
</style>