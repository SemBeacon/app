<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button></ion-menu-button>
                </ion-buttons>

                <ion-title>Beacon</ion-title>

                <ion-buttons v-if="!isLoading" slot="end">
                    <ion-button
                        icon-only
                        class="filter-button"
                        :class="{ 'filter-active': beaconStore.filterActive }"
                        title="Filter beacons"
                        aria-label="Filter beacons"
                        :style="{ color: '#ffffff' }"
                        @click="scannerComponent.filter"
                    >
                        <ion-icon name="funnel"></ion-icon>
                    </ion-button>
                    <ion-button
                        v-if="beaconStore.cacheSize !== 0"
                        icon-only
                        title="Sort beacons"
                        aria-label="Sort beacons"
                        :style="{ color: '#ffffff' }"
                        @click="scannerComponent.sort"
                    >
                        <ion-icon name="swap-vertical"></ion-icon>
                    </ion-button>
                    <ion-button
                        v-if="beaconStore.cacheSize !== 0"
                        icon-only
                        title="Clear cached beacons"
                        aria-label="Clear cached beacons"
                        :style="{ color: '#ffffff' }"
                        @click="scannerComponent.clearCache"
                    >
                        <ion-icon name="trash-bin"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>

            <ion-toolbar v-if="platform !== 'ios'" class="tab-selector">
                <ion-segment
                    :value="$route.path"
                    @ionChange="(e) => $router.replace(e.target.value)"
                >
                    <ion-segment-button value="/beacon/scanner">
                        <ion-label>Scanner</ion-label>
                    </ion-segment-button>
                    <ion-segment-button value="/beacon/simulator">
                        <ion-label>Simulator</ion-label>
                    </ion-segment-button>
                </ion-segment>
            </ion-toolbar>
        </ion-header>

        <BLEScannerComponent ref="scannerComponent"></BLEScannerComponent>
    </ion-page>
</template>

<script lang="ts">
import { Vue, Component, Ref } from 'vue-facing-decorator';
import BLEScannerComponent from '@/components/BLEScannerComponent.vue';
import {
    IonButtons,
    IonContent,
    IonHeader,
    IonMenuButton,
    IonPage,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonInput,
    IonLabel,
    IonFab,
    IonFabButton,
    IonSpinner,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    IonButton,
} from '@ionic/vue';
import BeaconItemComponent from '@/components/beacons/BeaconItemComponent.vue';
import { useBeaconStore } from '@/stores/beacon.scanning';
import { Capacitor } from '@capacitor/core';
import { addIcons } from 'ionicons';
import { trashBin, funnel, wifi, search, swapVertical } from 'ionicons/icons';

addIcons({
    trashBin,
    funnel,
    wifi,
    search,
    swapVertical,
});

@Component({
    components: {
        IonButtons,
        IonContent,
        IonHeader,
        IonMenuButton,
        IonPage,
        IonTitle,
        IonToolbar,
        IonList,
        IonItem,
        IonLabel,
        BeaconItemComponent,
        IonFab,
        IonFabButton,
        IonSpinner,
        IonIcon,
        IonSegment,
        IonSegmentButton,
        IonInput,
        IonButton,
        BLEScannerComponent,
    },
})
export default class BeaconsPage extends Vue {
    isLoading: boolean = true;
    beaconStore = useBeaconStore();
    platform = Capacitor.getPlatform();
    @Ref() scannerComponent: BLEScannerComponent;

    beforeMount() {
        this.isLoading = true;
    }

    mounted() {
        this.isLoading = false;
    }
}
</script>

<style scoped lang="scss">
ion-header ion-toolbar:first-child {
    margin-bottom: -1px;
}
.help-text {
    margin-top: 3em;
    padding-left: 1em;
    padding-right: 1em;
}

.filter-button {
    position: relative;
}

.filter-button.filter-active::after {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--ion-color-warning);
    content: '';
}
</style>
