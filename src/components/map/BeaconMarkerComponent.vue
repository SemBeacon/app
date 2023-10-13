<template>
    <l-marker 
        :key="key"
        :lat-lng="latLng"
        ref="marker"
    >
        <l-icon
            :icon-size="[40 * 0.88, 40]"
            :icon-anchor="[13, 39]"
            :icon-url="markerIcon" 
        >
        </l-icon>
        <l-tooltip
            :options="{
                offset: [0, -10]   
            }"
        >
            <span class="key">{{ beacon.displayName }}</span><br>
            <div v-if="beacon.lastSeen" :key="lastSeen()">
                <span class="key">Last seen: </span><span class="value">{{ lastSeen() }}</span><br>
                <span class="key">RSSI: </span><span class="value">{{ beacon.rssi }} dBm</span><br>
                <span class="key">Distance: </span><span class="value">{{ beacon.distance }} m</span>
            </div>
        </l-tooltip>
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
import { ComputedRef, computed, isProxy, toRaw } from 'vue';
import { Beacon, useBeaconStore } from '../../stores/beacon';
import moment from 'moment';
import { ref } from 'vue';
import { TimeService } from '@openhps/core';

@Options({
  components: {
    LMarker,
    LIcon,
    LTooltip
  }
})
export default class BeaconMarkerComponent extends Vue {
    @Prop() beacon: BLEBeaconObject & Beacon;
    marker: any = ref("marker");
    beaconStore = useBeaconStore();
    key: ComputedRef<string> = computed(() => (this.beacon ? this.beacon.uid : "") + TimeService.now());

    get latLng(): number[] {
        if (!this.beacon.position) {
            return undefined;
        }
        const array = this.beacon.position.toVector3().toArray();
        if (array && array[1]) {
            return [array[1], array[0]];
        } else {
            return undefined;
        }
    }

    mounted() {
        this.$nextTick(() => {
            this.marker.leafletObject.setOpacity(this.opacity());
        });
        setInterval(async () => {
            if (this.marker) {
                this.marker.leafletObject.setOpacity(this.opacity());
            }
        }, 5000);
    }

    opacity(): number {
        if (this.beacon.lastSeen === undefined) {
            return 0.5;
        } else if (Date.now() - this.beacon.lastSeen > 30000) {
            return 0.5;
        } else if (Date.now() - this.beacon.lastSeen > 15000) {
            return 0.75;
        } else if (Date.now() - this.beacon.lastSeen > 5000) {
            return 0.85;
        } else {
            return 1;
        }
    }

    lastSeen(): string {
        if (this.beacon.lastSeen === undefined) {
            return "";
        }
        return moment(this.beacon.lastSeen).fromNow();
    }

    get markerIcon(): string {
        let rawBeacon = this.beacon;
        if (isProxy(rawBeacon)) {
            rawBeacon = toRaw(rawBeacon);
        }
        
        if (rawBeacon instanceof BLESemBeacon) {
            return "/assets/beacons/sembeacon_marker.svg";
        } else if (rawBeacon instanceof BLEiBeacon) {
            return "/assets/beacons/ibeacon_marker.svg";
        } else if (rawBeacon instanceof BLEEddystone) {
            return "/assets/beacons/eddystone_marker.svg";
        } else if (rawBeacon instanceof BLEAltBeacon) {
            return "/assets/beacons/altbeacon_marker.svg";
        } else {
            return "/assets/beacons/bluetooth_marker.svg";
        }
    }
}
</script>

<style scoped>
span.key {
    font-weight: bold;
}
</style>