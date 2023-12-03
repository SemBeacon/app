<template>
  <div>
    <ol-vector-layer 
      ref="markerLayer" :zIndex="1000">
      <ol-source-vector ref="sourceRef">
        <ol-feature v-for="beacon in beacons" :key="beacon.uid">
          <ol-geom-point :coordinates="coordinates(beacon)" />
          <ol-style>
            <ol-style-icon 
              :src="markerIcon(beacon)" :scale="[40 / 639.13, 40 / 695.49]" :anchor="[13 / 40, 39 / 40]">
            </ol-style-icon>
          </ol-style>
        </ol-feature>
      </ol-source-vector>
    </ol-vector-layer>
    <ol-overlay
      v-if="selectedBeacon"
      ref="overlayRef"
      :position="coordinates(selectedBeacon)"
    >
      <div class="ol-popup">
        <span class="key">{{ selectedBeacon.displayName }}</span ><br />
          <div v-if="selectedBeacon.lastSeen" :key="key.value">
          <span class="key">Last seen: </span><span class="value">{{ lastSeen(selectedBeacon) }}</span><br />
          <span class="key">RSSI: </span><span class="value">{{ selectedBeacon.rssi }} dBm</span><br />
          <span class="key">Distance: </span><span class="value">{{ selectedBeacon.distance }} m</span>
        </div>
      </div>
    </ol-overlay>
    <ol-interaction-select
      @select="onClick"
      :condition="click"
      :filter="selectInteractionFilter"
    >
    </ol-interaction-select>
  </div>
</template>

<script lang="ts">
import { Vue, Options, Prop, Ref } from 'vue-property-decorator';
import { BLEAltBeacon, BLEBeaconObject, BLEEddystone, BLEiBeacon } from '@openhps/rf';
import { BLESemBeacon } from '@sembeacon/openhps';
import { isProxy, toRaw } from 'vue';
import { Beacon, useBeaconStore } from '../../stores/beacon.scanning';
import moment from 'moment';
import { Coordinate } from 'ol/coordinate';
import { fromLonLat } from 'ol/proj';
import type { Vector } from 'ol/layer';
import type Overlay from "ol/Overlay";
import { click } from 'ol/events/condition.js';
import type { Style } from 'ol/style';
import type { SelectEvent } from 'ol/interaction/Select';
import VectorSource from 'ol/source/Vector';

@Options({
  components: {},
  data: () => ({
    click
  })
})
export default class BeaconMarkerComponent extends Vue {
  @Prop() beacons: Array<BLEBeaconObject & Beacon>;
  beaconStore = useBeaconStore();
  @Ref("markerLayer") markerLayer: { vectorLayer: Vector<any> };
  @Ref("overlayRef") overlayRef: { overlay: Overlay };
  @Ref("sourceRef") sourceRef: { source: VectorSource };
  selectedBeacon: BLEBeaconObject & Beacon = undefined;

  selectInteractionFilter(e: any) {
    return this.sourceRef.source.getFeatures().filter(m => {
      return (m as any).ol_uid === e.ol_uid;
    }).length > 0;
  }
  
  coordinates(beacon: BLEBeaconObject): Coordinate {
    if (!beacon.position) {
      return undefined;
    }
    const array = beacon.position.toVector3().toArray();
    if (array && array[1]) {
      return fromLonLat([array[0], array[1]]);
    } else {
      return undefined;
    }
  }

  mounted() {
    setInterval(() => {
      this.sourceRef.source.getFeatures().forEach((marker, i) => {
        const image = (marker.getStyle() as Style).getImage();
        if (image) {  // When hidden
          image.setOpacity(this.opacity(this.beacons[i]));
        }
      });
    }, 1000);
  }

  opacity(beacon: BLEBeaconObject & Beacon): number {
    if (beacon.lastSeen === undefined) {
      return 0.5;
    } else if (Date.now() - beacon.lastSeen > 30000) {
      return 0.5;
    } else if (Date.now() - beacon.lastSeen > 15000) {
      return 0.75;
    } else if (Date.now() - beacon.lastSeen > 5000) {
      return 0.85;
    } else {
      return 1;
    }
  }

  onClick(event: SelectEvent) {
    event.preventDefault();
    const selectedBeacon = this.sourceRef.source.getFeatures()
    .map((m, i) => {
      return {
        marker: m as any,
        beacon: this.beacons[i]
      }
    }).filter(m => {
      return m.marker.ol_uid === (event.selected[0] as any).ol_uid;
    })[0];
    if (selectedBeacon) {
      this.selectedBeacon = selectedBeacon.beacon;
    }
  }

  lastSeen(beacon: Beacon): string {
    if (beacon.lastSeen === undefined) {
      return '';
    }
    return moment(beacon.lastSeen).fromNow();
  }

  markerIcon(beacon: BLEBeaconObject): string {
    let rawBeacon = beacon;
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
