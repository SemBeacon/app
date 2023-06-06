<template>
    <l-marker 
        :key="beacon.uid"
        :lat-lng="latLng"
        :v-if="latLng !== undefined"
    >
        <l-icon
            :icon-size="[40 * 0.88, 40]"
            :icon-anchor="[13, 39]"
            :icon-url="markerIcon" >
        </l-icon>
        <l-tooltip
            :options="{
                offset: [0, -10]   
            }"
        >
            Hello!
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
import { BLEBeaconObject } from '@openhps/rf';

@Options({
  components: {
    LMarker,
    LIcon,
    LTooltip
  }
})
export default class CustomMarkerComponent extends Vue {
    @Prop() beacon: BLEBeaconObject;

    get latLng(): number[] {
        if (!this.beacon.position) {
            return undefined;
        }
        const array = this.beacon.position.toVector3().toArray();
        return [array[1], array[0]];
    }

    get markerIcon(): string {
        return "";
    }
}
</script>

