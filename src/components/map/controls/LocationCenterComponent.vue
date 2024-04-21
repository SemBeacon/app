<template>
    <ion-fab id="location-center" slot="fixed" horizontal="end" vertical="bottom">
        <ion-fab-button
            size="small"
            color="light"
            :disabled="location === undefined"
            @click="toggleFollow"
        >
            <ion-icon v-if="following" class="active" size="small" name="ellipse-sharp"></ion-icon>
            <ion-icon name="locate-outline"></ion-icon>
        </ion-fab-button>
    </ion-fab>
</template>

<script lang="ts">
import { IonFab, IonFabButton, IonIcon } from '@ionic/vue';
import { Vue, Options, Inject } from 'vue-property-decorator';
import { GeographicalPosition } from '@openhps/core';
import { computed } from 'vue';
import { useGeolocationStore } from '../../../stores/geolocation';
import { fromLonLat } from 'ol/proj';
import type { Map } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { locateOutline, ellipseSharp } from 'ionicons/icons';
import { addIcons } from 'ionicons';

addIcons({
    locateOutline,
    ellipseSharp,
});

@Options({
    components: {
        IonFab,
        IonFabButton,
        IonIcon,
    },
})
export default class LocationCenterComponent extends Vue {
    @Inject() map: Map;
    geolocationStore = useGeolocationStore();
    following: boolean = true;

    location = computed(() => {
        const location: GeographicalPosition = this.geolocationStore.location;
        return location && location.latitude
            ? fromLonLat([location.longitude, location.latitude])
            : undefined;
    });

    mounted(): void {}

    toggleFollow(): void {
        if (!this.following) {
            this.flyTo(this.location as unknown as Coordinate, () => {
                this.following = true;
            });
        }
    }

    flyTo(location: Coordinate, done: () => void = () => {}) {
        const view = this.map.getView();
        const duration = 2000;
        const zoom = view.getZoom();
        view.animate(
            {
                center: location,
                duration: duration,
            },
            {
                zoom: Math.max(18, zoom),
                duration: duration / 2,
            },
            done,
        );
    }
}
</script>

<style scoped>
#location-center {
    margin-bottom: 4em;
}
#location-center ion-icon {
    position: absolute;
}
#location-center ion-icon.active.icon-small {
    width: 20%;
    height: 20%;
    margin-left: auto;
    margin-right: auto;
}
</style>
