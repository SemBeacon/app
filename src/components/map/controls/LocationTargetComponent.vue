<template>
    <div>
        <slot></slot>
    </div>
</template>

<script lang="ts">
import { Vue, Options, Inject } from 'vue-property-decorator';
import type { Map } from 'ol';
import Target from 'ol-ext/control/Target';
import { Icon, Style } from 'ol/style';

@Options({
    components: {},
})
export default class LocationTargetComponent extends Vue {
    @Inject() map: Map;
    target: Target;

    mounted(): void {
        const style: Style | Style[] = new Style({
            image: new Icon({ src: '/assets/markers/location-marker.png', scale: 6 / 256 }),
        });

        this.target = new Target({
            style: style,
            composite: 'overlay',
        });
        console.log(this.target);

        this.map.addControl(this.target);
    }
}
</script>

<style scoped>
</style>