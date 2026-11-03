<template>
    <ion-content :fullscreen="true">
        <ion-list v-if="beacons.length > 0 || beaconStore.state !== ControllerState.READY">
            <permission-error-component v-if="beaconStore.state === ControllerState.NO_PERMISSION">
                No Precise Location permission to scan!
            </permission-error-component>
            <permission-error-component
                v-else-if="beaconStore.state === ControllerState.NOT_SUPPORTED"
                :settings="false"
            >
                Bluetooth scanning is not supported on this device.
            </permission-error-component>
            <beacon-item-component
                v-for="beacon in beacons"
                :key="beacon.uid"
                :beacon="beacon"
                @clickBeacon="() => $router.push(`/beacon/${beacon.uid}`)"
            >
            </beacon-item-component>
        </ion-list>

        <section
            v-else-if="!beaconStore.isScanning"
            class="help-text ion-padding-top ion-text-center"
        >
            <div>
                <h2 style="font-size: 1em">Click the search button to scan for nearby beacons.</h2>
            </div>
        </section>

        <ion-fab slot="fixed" horizontal="end" vertical="bottom">
            <ion-fab-button
                :color="beaconStore.isScanning ? 'danger' : undefined"
                :disabled="beaconStore.state !== ControllerState.READY"
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
</template>

<script lang="ts">
import { Vue, Component } from 'vue-facing-decorator';
import {
    IonButtons,
    IonContent,
    IonHeader,
    IonMenuButton,
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
    IonProgressBar,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCardTitle,
    IonCardSubtitle,
    IonToggle,
    alertController,
} from '@ionic/vue';
import BeaconItemComponent from '@/components/beacons/BeaconItemComponent.vue';
import { Beacon, useBeaconStore } from '@/stores/beacon.scanning';
import { Toast } from '@capacitor/toast';
import { ControllerState } from '@/stores/types';
import PermissionErrorComponent from '@/components/PermissionErrorComponent.vue';
import { BLEBeaconObject } from '@openhps/rf';
import { stop, search } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { SortKey, sortBeacons } from '@/utils/sortBeacons';

addIcons({
    stop,
    search,
});

@Component({
    components: {
        PermissionErrorComponent,
        IonButtons,
        IonContent,
        IonHeader,
        IonMenuButton,
        IonTitle,
        IonToolbar,
        IonList,
        IonItem,
        IonLabel,
        BeaconItemComponent,
        IonFab,
        IonFabButton,
        IonSpinner,
        IonProgressBar,
        IonIcon,
        IonCard,
        IonCardHeader,
        IonCardContent,
        IonCardTitle,
        IonCardSubtitle,
        IonInput,
        IonButton,
        IonToggle,
    },
})
export default class BLEScannerComponent extends Vue {
    ControllerState: any = ControllerState;

    sortKey: SortKey = SortKey.CREATED;
    beaconStore = useBeaconStore();
    loading = false;

    get beacons(): (BLEBeaconObject & Beacon)[] {
        const seen = this.beaconStore.beaconsWithInfo.filter(
            (beacon) => beacon.lastSeen !== undefined,
        );
        return sortBeacons(seen, this.sortKey);
    }

    toggleScan(): void {
        if (this.loading) {
            return;
        }
        this.loading = true;
        const scanning = this.beaconStore.isScanning;
        (scanning ? this.beaconStore.stopScan() : this.beaconStore.startScan())
            .catch((err) => {
                console.error(err);
                Toast.show({
                    text: `Error while ${scanning ? 'stopping' : 'starting'} scan! ${err}`,
                });
            })
            .finally(() => {
                this.loading = false;
            });
    }

    async sort(): Promise<void> {
        const alert = await alertController.create({
            header: 'Sort beacons',
            inputs: [
                {
                    label: 'First seen',
                    type: 'radio',
                    value: SortKey.CREATED,
                    checked: this.sortKey === SortKey.CREATED,
                },
                {
                    label: 'Last seen',
                    type: 'radio',
                    value: SortKey.MODIFIED,
                    checked: this.sortKey === SortKey.MODIFIED,
                },
                {
                    label: 'RSSI',
                    type: 'radio',
                    value: SortKey.RSSI,
                    checked: this.sortKey === SortKey.RSSI,
                },
                {
                    label: 'Distance',
                    type: 'radio',
                    value: SortKey.DISTANCE,
                    checked: this.sortKey === SortKey.DISTANCE,
                },
            ],
            buttons: [
                {
                    text: 'OK',
                    role: 'confirm',
                    handler: (value: SortKey) => {
                        this.sortKey = value;
                    },
                },
            ],
        });

        await alert.present();
    }

    async clearCache(): Promise<void> {
        const alert = await alertController.create({
            header: 'Clear cached beacons',
            message: 'Are you sure you want to clear all beacons and SemBeacon data?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                },
                {
                    text: 'OK',
                    role: 'confirm',
                    handler: () => {
                        // Also clears the environments resolved from SemBeacons
                        this.beaconStore.clear();
                    },
                },
            ],
        });

        await alert.present();
    }
}
</script>

<style scoped lang="scss">
.help-text {
    margin-top: 3em;
    padding-left: 1em;
    padding-right: 1em;
}
ion-list {
    margin-bottom: 50px;
}
</style>
