<template>
    <ion-content :fullscreen="true">
        <ion-list v-if="showOfflineBanner" class="offline-banner-list">
            <ion-item color="warning">
                <ion-icon slot="start" :icon="cloudOfflineOutline"></ion-icon>
                <ion-label class="ion-text-wrap">
                    <h2>
                        {{ beaconStore.online ? 'Beacon details unavailable' : 'You are offline' }}
                    </h2>
                    <p>
                        {{
                            beaconStore.online
                                ? 'Some detected SemBeacons could not load their online information.'
                                : 'Detected beacons are shown, but their online information cannot be loaded.'
                        }}
                    </p>
                </ion-label>
                <ion-button
                    v-if="unresolved.length > 0"
                    slot="end"
                    fill="clear"
                    :disabled="retrying || !beaconStore.online"
                    @click="retryUnresolved"
                >
                    <ion-spinner v-if="retrying" name="circular"></ion-spinner>
                    <span v-else>Retry</span>
                </ion-button>
            </ion-item>
        </ion-list>

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
            v-else-if="beaconStore.filterActive || !beaconStore.isScanning"
            class="help-text ion-padding-top ion-text-center"
        >
            <div v-if="beaconStore.filterActive">
                <h2 style="font-size: 1em">No beacons match the current filter.</h2>
                <ion-button fill="clear" @click="beaconStore.clearFilter()"
                    >Clear filter</ion-button
                >
            </div>
            <div v-else>
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
import { BLESemBeacon } from '@sembeacon/openhps';
import { stop, search, cloudOfflineOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { SortKey, sortBeacons } from '@/utils/sortBeacons';
import { filterBeacons } from '@/utils/FilterBeacons';

addIcons({
    stop,
    search,
    cloudOfflineOutline,
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
    retrying = false;

    get beacons(): (BLEBeaconObject & Beacon)[] {
        const seen = this.beaconStore.beaconsWithInfo.filter(
            (beacon) => beacon.lastSeen !== undefined,
        );
        return sortBeacons(filterBeacons(seen, this.beaconStore.filter), this.sortKey);
    }

    get unresolved(): (BLEBeaconObject & Beacon)[] {
        return this.beaconStore.unresolvedBeacons;
    }

    get showOfflineBanner(): boolean {
        return !this.beaconStore.online || this.unresolved.length > 0;
    }

    async retryUnresolved(): Promise<void> {
        if (this.retrying) {
            return;
        }
        this.retrying = true;
        try {
            await this.beaconStore.retryUnresolved();
        } finally {
            this.retrying = false;
        }
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

    async filter(): Promise<void> {
        const selected = this.beaconStore.filter.flags;
        const flags: [number, string][] = [
            [BLESemBeacon.FLAGS.SEMBEACON_FLAG_MOVING, 'Moving'],
            [BLESemBeacon.FLAGS.SEMBEACON_FLAG_HAS_POSITION, 'Has position'],
            [BLESemBeacon.FLAGS.SEMBEACON_FLAG_HAS_SYSTEM, 'Has system'],
            [BLESemBeacon.FLAGS.SEMBEACON_FLAG_HAS_OBSERVABLE, 'Observable data'],
            [BLESemBeacon.FLAGS.SEMBEACON_FLAG_HAS_ACTUATOR, 'Has actuator'],
            [BLESemBeacon.FLAGS.SEMBEACON_FLAG_PRIVATE, 'Private'],
        ];
        const alert = await alertController.create({
            header: 'Filter SemBeacons',
            subHeader:
                'Only SemBeacons with all selected flags are shown. Other beacon types are hidden while a flag is selected.',
            inputs: flags.map(([flag, label]) => ({
                label,
                type: 'checkbox',
                value: flag.toString(),
                checked: selected.includes(flag),
            })),
            buttons: [
                {
                    text: 'Reset',
                    handler: () => {
                        this.beaconStore.clearFilter();
                    },
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                },
                {
                    text: 'Apply',
                    role: 'confirm',
                    handler: (values: string[] | undefined) => {
                        const selectedFlags = (values ?? [])
                            .map((value) => Number(value))
                            .filter((value) => !Number.isNaN(value));
                        this.beaconStore.setFilter({ flags: selectedFlags });
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
