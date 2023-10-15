<template>
  <ion-item 
    button 
    @click="$router.push(`/beacon/${beacon.uid}`)" detail="true"
  >
    <ion-thumbnail v-if="beaconIcon" slot="start">
      <img :alt="beacon.displayName" :src="beaconIcon" />
    </ion-thumbnail>
    <ion-label>
      <div v-if="beaconType === 'SemBeacon'">
        <ion-grid>
          <ion-row>
            <ion-col>
              <ion-label position="stacked" color="primary">Namespace ID</ion-label>
              <ion-label position="stacked">{{ beacon.namespaceId.toString() }}</ion-label>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <ion-label position="stacked" color="primary">Instance ID</ion-label>
              <ion-label position="stacked">{{ beacon.instanceId }}</ion-label>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>
      <div v-else-if="beaconType === 'iBeacon'">
        <ion-grid>
          <ion-row>
            <ion-col>
              <ion-label position="stacked" color="primary">Proximity UUID</ion-label>
              <ion-label position="stacked">{{ beacon.proximityUUID.toString() }}</ion-label>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <ion-label color="primary">Major</ion-label>
              <ion-label>{{ beacon.major }}</ion-label>
            </ion-col>
            <ion-col>
              <ion-label color="primary">Minor</ion-label>
              <ion-label>{{ beacon.minor }}</ion-label>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>
      <div v-else-if="beaconType === 'AltBeacon'">
        <ion-grid>
          <ion-row>
            <ion-col>
              <ion-label position="stacked" color="primary">Beacon ID</ion-label>
              <ion-label position="stacked">{{ beacon.beaconId.toString() }}</ion-label>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>
      <div v-else>
        <h2>{{ beaconType }}</h2>
        <p>{{ beacon.uid }}</p>
      </div>
    </ion-label>
    <ion-label slot="end">
        <h2 class="rssi">{{ beacon.rssi }} <small>dBm</small></h2>
        <small :key="key">{{ lastSeen() }}</small>
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
import { ref, Ref } from 'vue';

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

@Options({
  components: {
    IonItem, IonLabel, IonThumbnail
  }
})
export default class BeaconItemComponent extends Vue {
  @Prop() beacon: (BLEBeaconObject | BLESemBeacon | BLEiBeacon | BLEAltBeacon | BLEEddystoneURL) & Beacon;
  key: Ref<string> = ref(TimeService.now().toString() + Math.random());

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

  lastSeen(): string {
    if (this.beacon.lastSeen === undefined) {
        return "";
    }
    return moment(this.beacon.lastSeen).fromNow();
  }

  mounted() {
    setInterval(() => {
      (this.key as any) = (this.beacon ? this.beacon.uid : "") + TimeService.now();
    }, 2000);
  }
}
</script>

<style scoped lang="scss">
span.rssi {
  font-weight: bold;
}
ion-thumbnail {
  --size: 36px;
}
</style>