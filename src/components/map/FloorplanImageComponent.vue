<template>
    <l-image-overlay
        :url="image"
    >
    </l-image-overlay>
</template>


<script lang="ts">
import { Vue, Options, Prop } from 'vue-property-decorator';
import {
    LImageOverlay
    // @ts-ignore
} from "@vue-leaflet/vue-leaflet";

@Options({
  components: {
    LImageOverlay
  }
})
export default class FloorplanImageComponent extends Vue {
    @Prop() image: string;
}
</script>

