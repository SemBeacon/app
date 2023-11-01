<script lang="ts">
import { Vue, Options, Prop } from 'vue-property-decorator';
import type L from 'leaflet';
import { MapObject } from '../../models/MapObject';
import { ref } from 'vue';
import { InjectionKeys, Utilities } from '@vue-leaflet/vue-leaflet';

(Utilities.WINDOW_OR_GLOBAL.L.Marker.prototype as any)._animateZoom = function (e) {
  if (!this._map) {
    return;
  }
  const pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center).round();
  this._setPos(pos);
};

@Options({
  components: {},
})
export default class MapImageComponent extends Vue {
  @Prop() map: MapObject;
  leafletObject = ref<L.ImageOverlay>({} as any);

  addLayer = Utilities.assertInject(InjectionKeys.AddLayerInjection);
  removeLayer = Utilities.assertInject(InjectionKeys.RemoveLayerInjection);

  get coords(): [number, number][] {
    return this.map.coverage.geometry.coords.map((coord) => {
      return [coord.latitude, coord.longitude];
    });
  }

  async mounted() {
    const { distortableImageOverlay }: any = Utilities.WINDOW_OR_GLOBAL.L;
    this.leafletObject.value = distortableImageOverlay(
      `https://proxy.linkeddatafragments.org/` + this.map.image,
      {
        corners: this.coords,
        editable: false,
      },
    );
    Utilities.WINDOW_OR_GLOBAL.X = this.leafletObject.value;
    this.addLayer({
      leafletObject: this.leafletObject.value as any,
    });
    this.leafletObject.value.setOpacity(0.5);
    this.$nextTick(() => this.$emit('ready', this.leafletObject.value));
  }

  unmounted() {
    this.removeLayer({
      leafletObject: this.leafletObject.value as any,
    });
  }

  get bounds(): [number, number][] {
    return this.map.coverage.geometry.coords.map((c) => {
      return [c.latitude, c.longitude];
    });
  }
}
</script>

<style scoped>
@import 'leaflet-toolbar/dist/leaflet.toolbar.css';
@import 'leaflet-distortableimage/dist/leaflet.distortableimage.css';
</style>