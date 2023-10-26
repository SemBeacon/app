<template>
  <l-marker ref="marker" :lat-lng="latLng" :options="{ icon: icon() }"> </l-marker>
</template>

<script lang="ts">
import { Vue, Options, Prop, Watch } from 'vue-property-decorator';
import 'leaflet';
import {
  LMarker,
  // @ts-ignore
} from '@vue-leaflet/vue-leaflet';

@Options({
  components: {
    LMarker,
  },
})
export default class CustomMarkerComponent extends Vue {
  @Prop() options: any;
  latLng: number[] = [];

  @Watch('latLng', { immediate: true })
  protected onLocationUpdate(location: number[]) {
    this.latLng = location;
  }

  async beforeMount() {
    await require('beautifymarker/leaflet-beautify-marker-icon'); // esline-disable-line
    this.latLng = this.$props['latLng'];
  }

  icon(): any {
    return (window.L as any).BeautifyIcon.icon(this.options);
  }
}
</script>

<style>
@import 'beautifymarker/leaflet-beautify-marker-icon.css';
</style>
