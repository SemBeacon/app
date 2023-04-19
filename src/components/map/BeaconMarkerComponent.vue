<template>
    <l-marker 
        :key="beacon.uid"
        :lat-lng="latLng"
    >
        <l-icon
            :icon-size="[40 * 0.88, 40]"
            :icon-anchor="[13, 39]"
            :icon-url="markerIcon" >
        </l-icon>
        <l-tooltip>Hello!</l-tooltip>
    </l-marker>
</template>


<script lang="ts">
import { Vue, Options, Prop } from 'vue-property-decorator';
import {
    LMarker,
    LIcon,
    LTooltip,
    // @ts-ignore
} from "@vue-leaflet/vue-leaflet";
import { BLEAltBeacon, BLEBeaconObject, BLEEddystone, BLEiBeacon } from '@openhps/rf';
import { BLESemBeacon } from '../../models/BLESemBeacon';

@Options({
  components: {
    LMarker,
    LIcon,
    LTooltip
  }
})
export default class BeaconMarkerComponent extends Vue {
    @Prop() beacon: BLEBeaconObject;

    get latLng(): number[] {
        return this.beacon.position.toVector3().toArray();
    }

    get markerIcon(): string {
        if (this.beacon instanceof BLESemBeacon) {
            return "/assets/beacons/sembeacon_marker.svg";
        } else if (this.beacon instanceof BLEiBeacon) {
            return "/assets/beacons/ibeacon_marker.svg";
        } else if (this.beacon instanceof BLEEddystone) {
            return "/assets/beacons/eddystone_marker.svg";
        } else if (this.beacon instanceof BLEAltBeacon) {
            return "/assets/beacons/altbeacon_marker.svg";
        } else {
            return "/assets/beacons/bluetooth_marker.svg";
        }
    }
}
</script>

