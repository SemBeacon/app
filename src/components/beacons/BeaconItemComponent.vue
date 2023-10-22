<template>
  <ion-item 
    class="beacon-item"
    button 
    @click="onClick" :detail="false"
  >
    <ion-thumbnail v-if="beaconIcon" slot="start">
      <img :alt="beacon.displayName" :src="beaconIcon" />
    </ion-thumbnail>
    <ion-grid style="width: 100%">
      <ion-row v-if="beacon.displayName">
        <ion-col size="12">
          <ion-label class="key">{{ beacon.displayName }}</ion-label>
        </ion-col>
      </ion-row>
      <ion-row>
        <template v-if="beaconType === 'SemBeacon'">
          <ion-col size="12" size-md="3">
            <ion-label class="key" color="primary">Namespace</ion-label>
          </ion-col>
          <ion-col size="12" size-md="8">
            <ion-label>{{ beacon.namespaceId.toString() }}</ion-label>
          </ion-col>
          <ion-col size="6" size-md="3">
            <ion-label class="key" color="primary">Instance</ion-label>
          </ion-col>
          <ion-col size="6" size-md="8">
            <ion-label>{{ beacon.instanceId }}</ion-label>
          </ion-col>
        </template>
        <template v-else-if="beaconType === 'iBeacon' || beaconType === 'AltBeacon'">
          <ion-col size="12" size-md="4">
            <ion-label class="key" color="primary">UUID</ion-label>
          </ion-col>
          <ion-col size="12" size-md="8">
            <ion-label>{{ beacon.proximityUUID.toString() }}</ion-label>
          </ion-col>
          <ion-col size="7" size-md="2">
            <ion-label class="key" color="primary">Major</ion-label>
          </ion-col>
          <ion-col size="5" size-md="4">
            <ion-label>{{ beacon.major }}</ion-label>
          </ion-col>
          <ion-col size="7" size-md="2">
            <ion-label class="key" color="primary">Minor</ion-label>
          </ion-col>
          <ion-col size="5" size-md="4">
            <ion-label>{{ beacon.minor }}</ion-label>
          </ion-col>
        </template>
        <!-- <template v-else-if="beaconType === 'AltBeacon'">
          <ion-col size="12" size-md="2">
            <ion-label class="key" color="primary">ID</ion-label>
          </ion-col>
          <ion-col size="12" size-md="10">
            <ion-label>{{ beacon.beaconId.toString() }}</ion-label>
          </ion-col>
        </template> -->
        <template v-else-if="beaconType === 'Eddystone-URL'">
          <ion-col size="3">
            <ion-label class="key" color="primary">URL</ion-label>
          </ion-col>
          <ion-col size="10" size-md="4">
            <ion-label>{{ beacon.url }}</ion-label>
          </ion-col>
        </template>
        <template v-else-if="beaconType === 'Eddystone-UID'">
          <ion-col size="12" size-md="4">
            <ion-label class="key" color="primary">Namespace</ion-label>
          </ion-col>
          <ion-col size="12" size-md="8">
            <ion-label>{{ beacon.namespaceId.toString() }}</ion-label>
          </ion-col>
          <ion-col size="12" size-md="4">
            <ion-label class="key" color="primary">Instance</ion-label>
          </ion-col>
          <ion-col size="10" size-md="4">
            <ion-label>{{ beacon.instanceId.toString() }}</ion-label>
          </ion-col>
        </template>
        <template v-else-if="beaconType === 'Eddystone-TLM'">
          <ion-col size="7">
            <ion-label class="key" color="primary">Voltage</ion-label>
          </ion-col>
          <ion-col size="5">
            <ion-label>{{ beacon.voltage }} mV</ion-label>
          </ion-col>
          <template v-if="beacon.temperature">
            <ion-col size="7">
              <ion-label class="key" color="primary">Temperature</ion-label>
            </ion-col>
            <ion-col size="5">
              <ion-label>{{ beacon.temperature.value }} &deg;C</ion-label>
            </ion-col>
          </template>
        </template>
        <template v-else>
          <ion-label>
            <h2>{{ beaconType }}</h2>
            <p>{{ beacon.uid }}</p>
          </ion-label>
        </template>
      </ion-row>
    </ion-grid>
    <ion-label slot="end" v-if="simulator">
      <ion-toggle 
        :checked="beacon.advertising"
        @ionChange="(e) => $emit('simulateToggle', beacon, e.target.checked)"
      ></ion-toggle>
    </ion-label>
    <ion-label slot="end" v-else>
        <h2 class="rssi">{{ beacon.rssi }} <small>dBm</small></h2>
        <small :key="key">{{ lastSeen() }}</small>
    </ion-label>
  </ion-item>
</template>

<script lang="ts">
import { Vue, Options, Prop } from 'vue-property-decorator';
import { IonItem, IonLabel, IonThumbnail, IonToggle } from '@ionic/vue';
import { BLEBeaconObject, BLEiBeacon, BLEAltBeacon, BLEEddystone, BLEEddystoneURL, BLEEddystoneUID, BLEEddystoneTLM } from '@openhps/rf';
import { BLESemBeacon } from '../../models/BLESemBeacon';
import moment from 'moment';
import { Beacon } from '../../stores/beacon.scanning';
import { TimeService } from '@openhps/core';
import { ref, Ref } from 'vue';

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

@Options({
  components: {
    IonItem, IonLabel, IonThumbnail, IonToggle
  }
})
export default class BeaconItemComponent extends Vue {
  @Prop() beacon: (BLEBeaconObject | BLESemBeacon | BLEiBeacon | BLEAltBeacon | BLEEddystoneURL | BLEEddystoneUID) & Beacon;
  key: Ref<string> = ref(TimeService.now().toString() + Math.random());
  @Prop() simulator: boolean;

  get beaconType(): string {
    if (this.beacon instanceof BLESemBeacon) {
      return "SemBeacon";
    } else if (this.beacon instanceof BLEiBeacon) {
      return "iBeacon";
    } else if (this.beacon instanceof BLEAltBeacon) {
      return "AltBeacon";
    } else if (this.beacon instanceof BLEEddystoneURL) {
      return "Eddystone-URL";
    } else if (this.beacon instanceof BLEEddystoneUID) {
      return "Eddystone-UID";
    } else if (this.beacon instanceof BLEEddystoneTLM) {
      return "Eddystone-TLM";
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
    }, 500);
  }

  onClick(): void {
    this.$emit('clickBeacon', this.beacon);
  }
}
</script>

<style scoped lang="scss">
span.rssi {
  font-weight: bold;
}
ion-label.key {
  font-weight: bold;
}
ion-thumbnail {
  --size: 36px;
  margin-right: 0.5em;
}
ion-col {
  margin: 0;
  padding: 0;
}

@media (prefers-color-scheme: dark) {
  ion-item.beacon-item ion-label {
    color: white;
  }
}
</style>