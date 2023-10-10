<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Beacon</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div id="container">
        <div v-if="beaconType === 'SemBeacon'">
          <ion-list>
            <ion-item>
              <ion-label position="stacked" color="primary">Namespace ID</ion-label>
              <ion-label position="stacked">{{ beacon.namespaceId.toString() }}</ion-label>
            </ion-item>
            <ion-item>
              <ion-label position="stacked" color="primary">Instance ID</ion-label>
              <ion-label position="stacked">{{ beacon.instanceId }}</ion-label>
            </ion-item>
            <ion-item>
              <ion-label position="stacked" color="primary">Short resource URI</ion-label>
              <ion-label position="stacked">{{ beacon.shortResourceURI }}</ion-label>
            </ion-item>
          </ion-list>
        </div>
        <div v-if="beaconType === 'iBeacon'">
          
        </div>
        <div v-if="beaconType === 'AltBeacon'">
          
        </div>
        <div v-if="beaconType === 'Eddystone'">
          
        </div>
      </div>
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
} from '@ionic/vue';
import { useRoute } from 'vue-router';
import { BLEBeaconObject } from '@openhps/rf';
import { useBeaconStore } from '../stores/beacon';
import { BLESemBeacon } from '../models/BLESemBeacon';
import { BLEiBeacon, BLEEddystone, BLEAltBeacon } from '@openhps/rf';

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
    IonLabel
  }
})
export default class BeaconPage extends Vue {
  route = useRoute();
  beaconStore = useBeaconStore();
  beacon: BLEBeaconObject;

  mounted(): void {
    const beaconUID = this.route.params.uid as string;
    this.beaconStore.findByUID(beaconUID).then(beacon => {
      this.beacon = beacon;
    });
  }

  get beaconType(): string {
    if (this.beacon instanceof BLESemBeacon) {
      return "SemBeacon";
    } else if (this.beacon instanceof BLEiBeacon) {
      return "iBeacon";
    } else if (this.beacon instanceof BLEAltBeacon) {
      return "AltBeacon";
    } else if (this.beacon instanceof BLEEddystone) {
      return "Eddystone";
    } else {
      return "Unknown";
    }
  }
}
</script>

<style scoped lang="scss">

</style>