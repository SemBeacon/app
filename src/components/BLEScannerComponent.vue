<template>
    <ion-content :fullscreen="true">
        <ion-list v-if="beacons.length > 0 || beaconStore.state !== ControllerState.READY">
            <permission-error-component v-if="beaconStore.state === ControllerState.NO_PERMISSION">
                No Precise Location permission to scan!
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
import { Vue, Options } from 'vue-property-decorator';
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
import BeaconItemComponent from '../components/beacons/BeaconItemComponent.vue';
import { stop, search } from 'ionicons/icons';
import { Beacon, useBeaconStore } from '../stores/beacon.scanning';
import { useEnvironmentStore } from '../stores/environment';
import { Capacitor } from '@capacitor/core';
import { Toast } from '@capacitor/toast';
import { ControllerState } from '../stores/types';
import PermissionErrorComponent from '../components/PermissionErrorComponent.vue';
import { BLEBeaconObject } from '@openhps/rf';

enum SortKey {
    RSSI,
    CREATED,
    MODIFIED,
    DISTANCE,
}

@Options({
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
    data: () => ({
        stop,
        search,
    }),
})
export default class BLESimulatorComponent extends Vue {
    ControllerState: any = ControllerState;

    sortKey: SortKey = SortKey.CREATED;
    beaconStore = useBeaconStore();
    environmentStore = useEnvironmentStore();
    loading = false;
    platform = Capacitor.getPlatform();

    get beacons(): (BLEBeaconObject & Beacon)[] {
        return this.beaconStore.beaconsWithInfo
            .filter((beacon) => beacon.lastSeen !== undefined)
            .sort((a, b) => {
                switch (this.sortKey) {
                    case SortKey.CREATED:
                        return a.createdTimestamp - b.createdTimestamp;
                    case SortKey.MODIFIED:
                        return b.lastSeen - a.lastSeen;
                    case SortKey.DISTANCE:
                        return (
                            (b.distance ?? Number.MAX_SAFE_INTEGER) -
                            (a.distance ?? Number.MAX_SAFE_INTEGER)
                        );
                    case SortKey.RSSI:
                    default:
                        return b.rssi - a.rssi;
                }
            });
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
                        Toast.show({
                            text: `Error while stopping scan! ${err}`,
                        });
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
                        Toast.show({
                            text: `Error while starting scan! ${err}`,
                        });
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            }
        }
    }

    async sort(): Promise<void> {
        const alert = await alertController.create({
            header: 'Sort beacons',
            inputs: [
                {
                    label: 'First seen',
                    type: 'radio',
                    value: 'created',
                    checked: this.sortKey === SortKey.CREATED,
                },
                {
                    label: 'Last seen',
                    type: 'radio',
                    value: 'modified',
                    checked: this.sortKey === SortKey.MODIFIED,
                },
                {
                    label: 'RSSI',
                    type: 'radio',
                    value: 'rssi',
                    checked: this.sortKey === SortKey.RSSI,
                },
                {
                    label: 'Distance',
                    type: 'radio',
                    value: 'distance',
                    checked: this.sortKey === SortKey.DISTANCE,
                },
            ],
            buttons: [
                {
                    text: 'OK',
                    role: 'confirm',
                    handler: (value) => {
                        switch (value) {
                            case 'rssi':
                                this.sortKey = SortKey.RSSI;
                                break;
                            case 'created':
                                this.sortKey = SortKey.CREATED;
                                break;
                            case 'modified':
                                this.sortKey = SortKey.MODIFIED;
                                break;
                        }
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
                        this.beaconStore.clear();
                        this.environmentStore.clear();
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
