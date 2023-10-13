<template>
  <ion-item 
    button 
    @click="$router.push(`/beacon/${beacon.uid}`)" detail="true"
    :key="key"
  >
    <ion-thumbnail v-if="beaconIcon" slot="start">
      <img :alt="beacon.displayName" :src="beaconIcon" />
    </ion-thumbnail>
    <ion-label>
        <div v-if="beaconType === 'SemBeacon'">
          <ion-grid>
            <ion-row>
              <ion-label position="stacked" color="primary">Namespace ID</ion-label>
              <ion-label position="stacked">{{ beacon.namespaceId.toString() }}</ion-label>
            </ion-row>
            <ion-row>
              <ion-label position="stacked" color="primary">Instance ID</ion-label>
              <ion-label position="stacked">{{ beacon.instanceId }}</ion-label>
            </ion-row>
          </ion-grid>
        </div>
        <div v-else-if="beaconType === 'iBeacon'">
          <ion-list>
            <ion-item>
              <ion-label position="stacked" color="primary">Proximity UUID</ion-label>
              <ion-label position="stacked">{{ beacon.proximityUUID.toString() }}</ion-label>
            </ion-item>
            <ion-item>
              <ion-label color="primary">Major</ion-label>
              <ion-label>{{ beacon.major }}</ion-label>
              <ion-label color="primary">Minor</ion-label>
              <ion-label>{{ beacon.minor }}</ion-label>
            </ion-item>
          </ion-list>
        </div>
        <div v-else>
          <h2>{{ beaconType }}</h2>
          <p>{{ beacon.uid }}</p>
        </div>
    </ion-label>
    <ion-label slot="end">
        <h1 class="rssi">{{ beacon.rssi }} <small>dBm</small></h1>
        <small>{{ lastSeen }}</small>
    </ion-label>
  </ion-item>
</template>

<script lang="ts">
import { Vue, Options, Prop } from 'vue-property-decorator';
import { IonItem, IonLabel, IonThumbnail } from '@ionic/vue';
import { BLEBeaconObject, BLEiBeacon, BLEAltBeacon, BLEEddystone, BLEEddystoneURL } from '@openhps/rf';
import { BLESemBeacon } from '../../models/BLESemBeacon';
import moment from 'moment';
import { Beacon } from '../../stores/beacon';
import { TimeService } from '@openhps/core';
import { computed, ComputedRef } from 'vue';

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

@Options({
  components: {
    IonItem, IonLabel, IonThumbnail
  }
})
export default class BeaconItemComponent extends Vue {
  @Prop() beacon: (BLEBeaconObject | BLESemBeacon | BLEiBeacon | BLEAltBeacon | BLEEddystoneURL) & Beacon;
  key: ComputedRef<string> = computed(() => this.beacon.uid + TimeService.now());
  
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

  get beaconIcon(): string {
    const beaconType = this.beaconType;
    return `/assets/beacons/${beaconType.toLowerCase()}${prefersDark.matches ? "_alpha" : ""}.svg`;
  }

  lastSeen: ComputedRef<string> = computed(() => {
    if (this.beacon.lastSeen === undefined) {
        return "";
    }
    return moment(this.beacon.lastSeen).fromNow();
  });
}
</script>

<style scoped lang="scss">
span.rssi {
  font-weight: bold;
}
ion-thumbnail {
  --size: 46px;
}
</style>