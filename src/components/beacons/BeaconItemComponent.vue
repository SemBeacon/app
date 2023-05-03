<template>
  <ion-item>
    <ion-thumbnail v-if="beaconIcon" slot="start">
      <img :alt="beacon.displayName" :src="beaconIcon" />
    </ion-thumbnail>
    <ion-label>
        <h2>{{ beaconType }}</h2>
        <p>{{ beacon.uid }}</p>
    </ion-label>
    <ion-label slot="end">
        <small>{{ beacon.rssi }}</small>
    </ion-label>
  </ion-item>
</template>


<script lang="ts">
import { Vue, Options, Prop } from 'vue-property-decorator';
import { IonItem, IonLabel, IonThumbnail } from '@ionic/vue';
import { BLEBeaconObject, BLEiBeacon, BLEAltBeacon, BLEEddystone } from '@openhps/rf';
import { BLESemBeacon } from '../../models/BLESemBeacon';

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

@Options({
  components: {
    IonItem, IonLabel, IonThumbnail
  }
})
export default class BeaconItemComponent extends Vue {
  @Prop() beacon: BLEBeaconObject;

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

  get beaconIcon(): string {
    const beaconType = this.beaconType;
    return `/assets/beacons/${beaconType.toLowerCase()}${prefersDark.matches ? "_alpha" : ""}.svg`;
  }
}
</script>

<style scoped lang="scss">

</style>