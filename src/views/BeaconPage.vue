<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>{{ beaconType() }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div id="container">
        <ion-list v-if="beacon" :key="key">
          <ion-item class="info" lines="none">
            <ion-thumbnail v-if="beaconIcon" slot="start">
              <img :alt="beacon.displayName" :src="beaconIcon" />
            </ion-thumbnail>
            <ion-grid>
              <ion-row>
                <ion-col>
                  <h1>RSSI: {{ beacon.rssi }} <small>dBm</small></h1>
                </ion-col>
              </ion-row>
              <ion-row>
                <ion-col>
                  <h3>Distance: {{ beacon.distance }} <small>m</small></h3>
                </ion-col>
              </ion-row>
              <ion-row>
                <ion-col>
                  <ion-label position="stacked">Last seen: {{ lastSeen() }}</ion-label>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-item>
          <ion-item lines="none">
            <ion-label position="stacked" color="primary">MAC Address</ion-label>
            <ion-label position="stacked">{{ beacon.address.toString() }}</ion-label>
          </ion-item>
          <div v-if="beaconType() === 'SemBeacon'">
              <ion-item lines="none">
                <ion-label position="stacked" color="primary">Namespace ID</ion-label>
                <ion-label position="stacked">{{ beacon.namespaceId.toString() }}</ion-label>
              </ion-item>
              <ion-item lines="none">
                <ion-label position="stacked" color="primary">Instance ID</ion-label>
                <ion-label position="stacked">{{ beacon.instanceId }}</ion-label>
              </ion-item>
              <ion-item lines="none">
                <ion-label position="stacked" color="primary">Short resource URI</ion-label>
                <ion-label position="stacked">{{ beacon.shortResourceUri }}</ion-label>
              </ion-item>
              <ion-item lines="none">
                <ion-label position="stacked" color="primary">Resource URI</ion-label>
                <ion-label position="stacked">{{ beacon.resourceUri }}</ion-label>
              </ion-item>
              <ion-item lines="none">
                <ion-label position="stacked" color="primary">SemBeacon Flags</ion-label>
                <div class="chip-container">
                  <ion-chip color="primary" v-if="beacon.hasFlag(BLESemBeacon.FLAGS.SEMBEACON_FLAG_HAS_POSITION)">HAS_POSITION</ion-chip>
                  <ion-chip color="primary" v-if="beacon.hasFlag(BLESemBeacon.FLAGS.SEMBEACON_FLAG_PRIVATE)">IS_PRIVATE</ion-chip>
                  <ion-chip color="primary" v-if="beacon.hasFlag(BLESemBeacon.FLAGS.SEMBEACON_FLAG_MOVING)">IS_MOVING</ion-chip>
                  <ion-chip color="primary" v-if="beacon.hasFlag(BLESemBeacon.FLAGS.SEMBEACON_FLAG_HAS_SYSTEM)">HAS_SYSTEM</ion-chip>
                  <ion-chip color="primary" v-if="beacon.hasFlag(BLESemBeacon.FLAGS.SEMBEACON_FLAG_HAS_TELEMETRY)">HAS_TELEMETRY</ion-chip>
                  <ion-chip color="danger" v-if="beacon.flags === 0">No SemBeaocn flags</ion-chip>
                </div>
              </ion-item>
          </div>
          <div v-else-if="beaconType() === 'iBeacon'">
            <ion-item lines="none">
              <ion-label position="stacked" color="primary">Proximity UUID</ion-label>
              <ion-label position="stacked">{{ beacon.proximityUUID.toString() }}</ion-label>
            </ion-item>
            <ion-item lines="none">
              <ion-label position="stacked" color="primary">Major</ion-label>
              <ion-label position="stacked">{{ beacon.major }}</ion-label>
            </ion-item>
            <ion-item lines="none">
              <ion-label position="stacked" color="primary">Minor</ion-label>
              <ion-label position="stacked">{{ beacon.minor }}</ion-label>
            </ion-item>
          </div>
          <div v-else-if="beaconType() === 'AltBeacon'">
            <ion-item lines="none">
              <ion-label position="stacked" color="primary">Beacon UID</ion-label>
              <ion-label position="stacked">{{ beacon.beaconType.toString() }}</ion-label>
            </ion-item>
          </div>
          <div v-else-if="beaconType() === 'Eddystone'">
            
          </div>
          <div v-else>
            
          </div>
          <ion-item lines="none" v-if="beacon.position">
            <ion-label position="stacked" color="primary">Position</ion-label>
            <ion-label position="stacked">{{ beacon.position.latitude }}, {{ beacon.position.longitude }}</ion-label>
          </ion-item>
        </ion-list>

              
        <ion-fab slot="fixed" horizontal="end" vertical="bottom">
          <ion-fab-button @click="toggleScan" :color="this.beaconStore.isScanning ? 'danger' : 'primary'">
            <ion-spinner name="circular" v-if="loading"></ion-spinner>
            <ion-icon :name="this.beaconStore.isScanning ? 'pause' : 'search'" v-if="!loading"></ion-icon>
          </ion-fab-button>
        </ion-fab>
      </div>
    </ion-content>
  </ion-page>
</template>


<script lang="ts">
import { Vue, Options } from 'vue-property-decorator';
import { 
  IonChip,
  IonButtons, 
  IonContent, 
  IonHeader, 
  IonBackButton, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonList, 
  IonItem, 
  IonLabel,
  IonFab,
  IonFabButton,
  IonSpinner,
} from '@ionic/vue';
import { useRoute } from 'vue-router';
import { BLEBeaconObject } from '@openhps/rf';
import { Beacon, useBeaconStore } from '../stores/beacon';
import { BLESemBeacon } from '../models/BLESemBeacon';
import { BLEiBeacon, BLEEddystone, BLEAltBeacon } from '@openhps/rf';
import moment from 'moment';
import { Ref, ref } from 'vue';
import { TimeService } from '@openhps/core';

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

@Options({
  components: {
    IonButtons, 
    IonContent, 
    IonHeader, 
    IonBackButton, 
    IonPage, 
    IonTitle, 
    IonToolbar, 
    IonList, 
    IonItem, 
    IonLabel,
    IonFab,
    IonFabButton,
    IonSpinner,
    IonChip,
  },
  data: () => ({
    BLESemBeacon
  })
})
export default class BeaconPage extends Vue {
  loading = false;
  route = useRoute();
  beaconStore = useBeaconStore();
  beacon: (BLEBeaconObject | BLESemBeacon) & Beacon;
  key: Ref<string> = ref(TimeService.now().toString() + Math.random());

  mounted(): void {
    const beaconUID = this.route.params.uid as string;
    console.log("Loading beacon details", beaconUID);
    this.beaconStore.findByUID(beaconUID).then(beacon => {
      const beaconInfo = this.beaconStore.findBeaconInfo(beaconUID);
      this.beacon = beacon;
      this.beacon.rssi = beaconInfo.rssi;
      this.beacon.lastSeen = beaconInfo.lastSeen;
      this.beacon.distance = beaconInfo.distance;
      
    (window as any).beacon = this.beacon;
    }).catch(console.error);

    setInterval(() => {
      const beaconInfo = this.beaconStore.findBeaconInfo(beaconUID);
      this.beacon.rssi = beaconInfo.rssi;
      this.beacon.lastSeen = beaconInfo.lastSeen;
      this.beacon.distance = beaconInfo.distance;
      (this.key as any) = (this.beacon ? this.beacon.uid : "") + TimeService.now();
    }, 2000);
  }

   beaconType(): string {
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

  get beaconIcon(): string {
    const beaconType = this.beaconType();
    return `/assets/beacons/${beaconType.toLowerCase()}${prefersDark.matches ? "_alpha" : ""}.svg`;
  }
}
</script>

<style scoped lang="scss">
ion-item.info h1,h2,h3 {
  margin-bottom: 0;
  padding-bottom: 0;
  margin-top: 0;
  padding-top: 0;
}
.chip-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>