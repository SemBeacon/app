<template>
  <div v-if="coordinates">
    <ol-vector-layer 
      ref="marker" :zIndex="100">
      <ol-source-vector>
        <ol-feature>
          <ol-geom-point :coordinates="coordinates" />
          <ol-style>
            <ol-style-icon 
              :src="markerIcon" :size="[40 * 0.88, 40]" :scale="40 / 350" :anchor="[13, 39]"
              anchorXUnits="pixels" anchorYUnits="pixels">
            </ol-style-icon>
          </ol-style>
        </ol-feature>
      </ol-source-vector>
    </ol-vector-layer>
    <ol-overlay
      ref="overlayRef"
      :position="[coordinates[0], coordinates[1] - 10]"
    >
      <div class="ol-popup">
        <span class="key">{{ beacon.displayName }}</span ><br />
          <div v-if="beacon.lastSeen" :key="key.value">
          <span class="key">Last seen: </span><span class="value">{{ lastSeen() }}</span><br />
          <span class="key">RSSI: </span><span class="value">{{ beacon.rssi }} dBm</span><br />
          <span class="key">Distance: </span><span class="value">{{ beacon.distance }} m</span>
        </div>
      </div>
    </ol-overlay>
  </div>
</template>

<script lang="ts">
import { Vue, Options, Prop, Ref } from 'vue-property-decorator';
import { BLEAltBeacon, BLEBeaconObject, BLEEddystone, BLEiBeacon } from '@openhps/rf';
import { BLESemBeacon } from '@sembeacon/openhps';
import { isProxy, toRaw } from 'vue';
import { Beacon, useBeaconStore } from '../../stores/beacon.scanning';
import moment from 'moment';
import { TimeService } from '@openhps/core';
import { Coordinate } from 'ol/coordinate';
import { fromLonLat } from 'ol/proj';
import type { Vector } from 'ol/layer';
import type Overlay from "ol/Overlay";

@Options({
  components: {},
})
export default class BeaconMarkerComponent extends Vue {
  @Prop() beacon: BLEBeaconObject & Beacon;
  beaconStore = useBeaconStore();
  @Ref("key") key = TimeService.now().toString() + Math.random();
  @Ref("marker") marker: { vectorLayer: Vector<any> };
  @Ref("overlayRef") overlayRef: { overlay: Overlay };

  get coordinates(): Coordinate {
    if (!this.beacon.position) {
      return undefined;
    }
    const array = this.beacon.position.toVector3().toArray();
    if (array && array[1]) {
      return fromLonLat([array[0], array[1]]);
    } else {
      return undefined;
    }
  }

  mounted() {
    this.$nextTick(() => {
      this.marker.vectorLayer.setOpacity(this.opacity());
    });
    setInterval(async () => {
      (this.key as any) = (this.beacon ? this.beacon.uid : '') + TimeService.now();
      if (this.marker) {
        this.marker.vectorLayer.setOpacity(this.opacity());
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
      return '';
    }
    return moment(this.beacon.lastSeen).fromNow();
  }

  get markerIcon(): string {
    let rawBeacon = this.beacon;
    if (isProxy(rawBeacon)) {
      rawBeacon = toRaw(rawBeacon);
    }

    if (rawBeacon instanceof BLESemBeacon) {
      return '/assets/beacons/sembeacon_marker.svg';
    } else if (rawBeacon instanceof BLEiBeacon) {
      return '/assets/beacons/ibeacon_marker.svg';
    } else if (rawBeacon instanceof BLEEddystone) {
      return '/assets/beacons/eddystone_marker.svg';
    } else if (rawBeacon instanceof BLEAltBeacon) {
      return '/assets/beacons/altbeacon_marker.svg';
    } else {
      return '/assets/beacons/bluetooth_marker.svg';
    }
  }
}
</script>

<style scoped>
span.key {
  font-weight: bold;
}
.ol-popup {
  position: absolute;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #cccccc;
  bottom: 12px;
  left: -50px;
  min-width: 170px;
  color: black;
  visibility: hidden;
}
.ol-popup:after, .ol-popup:before {
  top: 100%;
  border: solid transparent;
  content: " ";
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}
.ol-popup:after {
  border-top-color: white;
  border-width: 10px;
  left: 48px;
  margin-left: -10px;
}
.ol-popup:before {
  border-top-color: #cccccc;
  border-width: 11px;
  left: 48px;
  margin-left: -11px;
}
.ol-popup-closer {
  text-decoration: none;
  position: absolute;
  top: 2px;
  right: 8px;
}
.ol-popup-closer:after {
  content: "✖";
}
</style>
