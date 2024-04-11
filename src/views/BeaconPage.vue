<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button></ion-back-button>
                </ion-buttons>

                <ion-title v-if="!simulated">Beacon details</ion-title>
                <ion-title v-else-if="simulated">Edit beacon</ion-title>

                <ion-buttons slot="end">
                    <ion-button
                        v-if="beacon && simulated && enabled"
                        icon-only
                        :style="{ color: '#ffffff' }"
                        @click="enabled = !enabled"
                    >
                        <ion-icon name="close"></ion-icon>
                    </ion-button>

                    <ion-button
                        v-if="beacon"
                        icon-only
                        :style="{ color: '#ffffff' }"
                        @click="
                            () => {
                                $router.push(`/beacon/edit/${beacon.uid}/code`);
                            }
                        "
                    >
                        <ion-icon :name="'code-slash-outline'"></ion-icon>
                    </ion-button>

                    <ion-button
                        v-if="beacon && simulated"
                        icon-only
                        :style="{ color: '#ffffff' }"
                        @click="
                            () => {
                                enabled ? saveBeacon() : (enabled = !enabled);
                            }
                        "
                    >
                        <ion-icon :name="enabled ? 'save-sharp' : 'create-sharp'"></ion-icon>
                    </ion-button>

                    <ion-button
                        v-if="!loading && beacon.position && !simulated"
                        icon-only
                        :style="{ color: '#ffffff' }"
                        @click="showOnMap"
                    >
                        <ion-icon name="locate-outline"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <div :key="lastUpdate" v-if="beacon">
                <!-- Beacon pages -->
                <SemBeaconPage
                    v-if="(beacon instanceof BeaconType.BLESemBeacon)"
                    :beacon="beacon"
                    :edit="enabled"
                    :readonly="!simulated"
                    :loading="loading"
                    @update="onUpdate"
                >
                </SemBeaconPage>
                <AltBeaconPage
                    v-else-if="(beacon instanceof BeaconType.BLEAltBeacon) ||
                            (beacon instanceof BeaconType.BLEiBeacon)
                    "
                    :beacon="beacon"
                    :edit="enabled"
                    :readonly="!simulated"
                    :loading="loading"
                >
                </AltBeaconPage>
                <EddystoneURLPage
                    v-else-if="(beacon instanceof BeaconType.BLEEddystoneURL)"
                    :beacon="beacon"
                    :edit="enabled"
                    :readonly="!simulated"
                    :loading="loading"
                >
                </EddystoneURLPage>
                <EddystoneUIDPage
                    v-else-if="(beacon instanceof BeaconType.BLEEddystoneUID)"
                    :beacon="beacon"
                    :edit="enabled"
                    :readonly="!simulated"
                    :loading="loading"
                >
                </EddystoneUIDPage>
                <EddystoneTLMPage
                    v-else-if="(beacon instanceof BeaconType.BLEEddystoneTLM)"
                    :beacon="beacon"
                    :edit="enabled"
                    :readonly="!simulated"
                    :loading="loading"
                >
                </EddystoneTLMPage>
                <GenericBeaconPage
                    v-else
                    :beacon="beacon"
                    :edit="enabled"
                    :readonly="!simulated"
                    :loading="loading"
                >
                </GenericBeaconPage>
            </div>

            <ion-fab v-if="!simulated" slot="fixed" horizontal="end" vertical="bottom">
                <ion-fab-button
                    :color="beaconStore.isScanning ? 'danger' : 'primary'"
                    @click="toggleScan"
                >
                    <ion-spinner v-if="loading" name="circular"></ion-spinner>
                    <ion-icon
                        v-if="!loading"
                        :name="beaconStore.isScanning ? 'stop' : 'search'"
                    ></ion-icon>
                </ion-fab-button>
            </ion-fab>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-property-decorator';
import {
    IonButtons,
    IonContent,
    IonHeader,
    IonBackButton,
    IonPage,
    IonTitle,
    IonToolbar,
    IonFab,
    IonFabButton,
    IonSpinner,
    IonButton,
    IonIcon,
} from '@ionic/vue';
import { useRoute } from 'vue-router';
import {
    BLEAltBeacon,
    BLEBeaconObject,
    BLEEddystone,
    BLEEddystoneTLM,
    BLEEddystoneUID,
    BLEEddystoneURL,
    BLEiBeacon,
} from '@openhps/rf';
import { Beacon, useBeaconStore } from '../stores/beacon.scanning';
import { BLESemBeacon } from '@sembeacon/openhps';
import { BLEUUID } from '@openhps/rf';
import { maskito } from '@maskito/vue';
import { SimulatedBeacon, useBeaconAdvertisingStore } from '../stores/beacon.advertising';
import SemBeaconPage from './beacon/SemBeaconPage.vue';
import GenericBeaconPage from './beacon/GenericBeaconPage.vue';
import AltBeaconPage from './beacon/AltBeaconPage.vue';
import EddystoneTLMPage from './beacon/EddystoneTLMPage.vue';
import EddystoneUIDPage from './beacon/EddystoneUIDPage.vue';
import EddystoneURLPage from './beacon/EddystoneURLPage.vue';
import { ref } from 'vue';
import { addIcons } from 'ionicons';
import { 
    codeSlashOutline,
    close,
    saveSharp,
    createSharp,
    locateOutline,
    stop,
    search
} from 'ionicons/icons';

addIcons({
    codeSlashOutline,
    close,
    saveSharp,
    createSharp,
    locateOutline,
    stop,
    search
});

@Options({
    components: {
        SemBeaconPage,
        GenericBeaconPage,
        AltBeaconPage,
        EddystoneTLMPage,
        EddystoneUIDPage,
        EddystoneURLPage,
        IonButtons,
        IonContent,
        IonHeader,
        IonBackButton,
        IonPage,
        IonTitle,
        IonToolbar,
        IonFab,
        IonFabButton,
        IonSpinner,
        IonButton,
        IonIcon,
    },
    directives: {
        maskito,
    },
})
export default class BeaconPage extends Vue {
    readonly BLEUUID: typeof BLEUUID = BLEUUID;
    readonly BeaconType: Record<any, any> = {
        BLESemBeacon,
        BLEEddystoneTLM,
        BLEEddystoneUID,
        BLEEddystone,
        BLEEddystoneURL,
        BLEAltBeacon,
        BLEiBeacon,
    };

    simulated: boolean = false;
    loading = true;
    route = useRoute();
    beaconStore = useBeaconStore();
    beaconSimulatorStore = useBeaconAdvertisingStore();
    beacon?: BLEBeaconObject & Partial<Beacon> = ref({}) as any;
    enabled: boolean = false;
    uid: string;
    lastUpdate: number;

    onUpdate(beacon: BLEBeaconObject & Partial<Beacon>): void {
        this.beacon = beacon;
        this.lastUpdate = Date.now();
    }

    beforeMount(): void {
        this.lastUpdate = Date.now();

        const beaconUID = this.route.params.uid as string;
        this.uid = new String(beaconUID).toString();
        console.log('Loading beacon details', beaconUID);

        if (this.route.path.startsWith('/beacon/edit')) {
            // Simulated beacon
            this.simulated = true;
            const beacon = this.beaconSimulatorStore.findByUID(beaconUID);
            if (!beacon) {
                // Can not find beacon...
                console.error(
                    `Tried to load simulated beacon (${beaconUID}) but it can not be found!`,
                );
                this.$router.replace('/beacon/simulator');
                return;
            }
            this.beacon = beacon.clone() as BLEBeaconObject as any;
            this.loading = false;
        } else {
            // Scanned beacon
            this.beaconStore
                .findByUID(beaconUID)
                .then((beacon) => {
                    if (!beacon) {
                        // Can not find beacon...
                        this.$router.replace('/beacon/scanner');
                        return;
                    }
                    const beaconInfo = this.beaconStore.findBeaconInfo(beaconUID);
                    this.beacon = beacon;
                    if (beaconInfo) {
                        this.beacon.rssi = beaconInfo.rssi;
                        this.beacon.lastSeen = beaconInfo.lastSeen;
                        this.beacon.distance = beaconInfo.distance;
                    }
                    this.loading = false;
                    console.log('Beacon details loaded', this.beacon);
                })
                .catch(console.error);

            setInterval(() => {
                if (this.beaconStore.isScanning && !this.simulated) {
                    const beaconInfo = this.beaconStore.findBeaconInfo(beaconUID);
                    if (beaconInfo) {
                        this.beacon.rssi = beaconInfo.rssi;
                        this.beacon.lastSeen = beaconInfo.lastSeen;
                        this.beacon.distance = beaconInfo.distance;
                    }
                }
            }, 500);
        }
    }

    toggleScan(): void {
        if (!this.loading) {
            this.loading = true;
            if (this.beaconStore.isScanning) {
                this.beaconStore
                    .stopScan()
                    .then(() => {
                        //
                    })
                    .catch((err) => {
                        //
                        console.error(err);
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            } else {
                // Start scan
                this.beaconStore
                    .startScan()
                    .then(() => {
                        //
                    })
                    .catch((err) => {
                        //
                        console.error(err);
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            }
        }
    }

    showOnMap(): void {
        this.$router.push(`/map/${this.beacon.uid}`);
    }

    saveBeacon(): void {
        this.beaconSimulatorStore.addSimulatedBeacon(
            this.uid as string,
            this.beacon as unknown as SimulatedBeacon,
        );
        this.enabled = false;
        this.$router.replace({ path: '/beacon/simulator' });
    }
}
</script>

<style lang="scss">
ion-item.info h1,
h2,
h3,
h4,
h5 {
    margin-bottom: 0;
    padding-bottom: 0;
    margin-top: 0;
    padding-top: 0;
}

ion-input.label-floating.input-label-placement-stacked {
    min-height: 50px;
}

ion-grid ion-col {
    padding-top: 0;
    padding-bottom: 0;
}

ion-col h1,
h2,
h3,
h4 {
    margin: 0;
    padding: 0;
}
</style>
