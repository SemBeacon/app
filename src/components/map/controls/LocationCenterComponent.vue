<template>
    <ion-fab id="location-center" slot="fixed" horizontal="end" vertical="bottom">
        <ion-fab-button
            size="small"
            color="light"
            :disabled="location === undefined"
            @click="toggleFollow"
        >
            <ion-icon 
                v-if="following" 
                class="active"
                size="small" 
                name="ellipse-sharp"></ion-icon>
            <ion-icon
                name="locate-outline"></ion-icon>
        </ion-fab-button>
    </ion-fab>
</template>

<script lang="ts">
import {
    IonFab,
    IonFabButton,
    IonIcon
} from '@ionic/vue';
import { Vue, Options, Inject } from 'vue-property-decorator';
import { GeographicalPosition } from '@openhps/core';
import { computed } from 'vue';
import { useGeolocationStore } from '../../../stores/geolocation';
import { fromLonLat } from 'ol/proj';
import type { Map } from 'ol';
import { Coordinate } from 'ol/coordinate';

@Options({
    components: {
        IonFab,
        IonFabButton,
        IonIcon
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

    mounted(): void {

    }

    toggleFollow(): void {
        if (!this.following) {
            this.flyTo(this.location as unknown as Coordinate, () => {
                this.following = true;
            });
        }
    }

    flyTo(location: Coordinate, done: (success: boolean) => void = () => {}) {
        const view =  this.map.getView();
        const duration = 2000;
        const zoom = view.getZoom();
        let parts = 2;
        let called = false;
        function callback(complete: boolean) {
            --parts;
            if (called) {
                return;
            }
            if (parts === 0 || !complete) {
                called = true;
                done(complete);
            }
        }
        view.animate({
                center: location,
                duration: duration,
            },
            callback);
        view.animate({
                zoom: zoom - 1,
                duration: duration / 2,
            }, {
                zoom: zoom,
                duration: duration / 2,
            },
            callback);
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
    font-size: 10%;
}
</style>
