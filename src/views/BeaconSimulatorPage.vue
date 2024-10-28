<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button></ion-menu-button>
                </ion-buttons>

                <ion-title>Beacon</ion-title>

                <ion-buttons v-if="!isLoading" slot="end">
                    <ion-button
                        v-if="beaconAdvertisingStore.advertisingBeacons.length > 0"
                        icon-only
                        :style="{ color: '#ffffff', fontSize: '1.2em' }"
                        @click="simulatorComponent.stopAdvertising"
                    >
                        <b-icon-wifi-off></b-icon-wifi-off>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>

            <ion-toolbar class="tab-selector">
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

        <BLESimulatorComponent ref="simulatorComponent"></BLESimulatorComponent>
    </ion-page>
</template>

<script lang="ts">
import { Vue, Component, Ref } from 'vue-facing-decorator';
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
import { useBeaconAdvertisingStore } from '@/stores/beacon.advertising';
import { Capacitor } from '@capacitor/core';
import BLESimulatorComponent from '@/components/BLESimulatorComponent.vue';
import { addIcons } from 'ionicons';
import { wifi, search } from 'ionicons/icons';

addIcons({
    wifi,
    search,
});

@Component({
    components: {
        BLESimulatorComponent,
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
    }
})
export default class BeaconSimulatorPage extends Vue {
    isLoading: boolean = true;
    beaconAdvertisingStore = useBeaconAdvertisingStore();
    platform = Capacitor.getPlatform();
    @Ref() simulatorComponent: BLESimulatorComponent;

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
</style>
