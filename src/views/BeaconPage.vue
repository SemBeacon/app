<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>{{ beaconType }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div id="container">
        <ion-list v-if="beacon">
          <ion-item>
            <ion-thumbnail v-if="beaconIcon" slot="start">
              <img :alt="beacon.displayName" :src="beaconIcon" />
            </ion-thumbnail>

            <h1>{{ beacon.rssi }} <small>dBm</small></h1>
            <h3>{{ beacon.distance }} <small>m</small></h3>
            <ion-label position="stacked">{{ lastSeen() }}</ion-label>
            
          </ion-item>
          <ion-item>
            <ion-label position="stacked" color="primary">MAC Address</ion-label>
            <ion-label position="stacked">{{ beacon.address.toString() }}</ion-label>
          </ion-item>
          <div v-if="beaconType === 'SemBeacon'">
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
          </div>
          <div v-else-if="beaconType === 'iBeacon'">
            
          </div>
          <div v-else-if="beaconType === 'AltBeacon'">
            
          </div>
          <div v-else-if="beaconType === 'Eddystone'">
            
          </div>
          <div v-else>
            
          </div>
        </ion-list>
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
import { Beacon, useBeaconStore } from '../stores/beacon';
import { BLESemBeacon } from '../models/BLESemBeacon';
import { BLEiBeacon, BLEEddystone, BLEAltBeacon } from '@openhps/rf';
import moment from 'moment';

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

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
  beacon: (BLEBeaconObject | BLESemBeacon) & Beacon;

  mounted(): void {
    const beaconUID = this.route.params.uid as string;
    console.log("Loading beacon details", beaconUID);
    this.beaconStore.findByUID(beaconUID).then(beacon => {
      const beaconInfo = this.beaconStore.findBeaconInfo(beaconUID);
      this.beacon = beacon;
      this.beacon.rssi = beaconInfo.rssi;
      this.beacon.lastSeen = beaconInfo.lastSeen;
      this.beacon.distance = beaconInfo.distance;
    }).catch(console.error);
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
      return "Bluetooth";
    }
  }

  lastSeen(): string {
    if (this.beacon.lastSeen === undefined) {
        return "";
    }
    return moment(this.beacon.lastSeen).fromNow();
  }

  get beaconIcon(): string {
    const beaconType = this.beaconType;
    return `/assets/beacons/${beaconType.toLowerCase()}${prefersDark.matches ? "_alpha" : ""}.svg`;
  }
}
</script>

<style scoped lang="scss">

</style>