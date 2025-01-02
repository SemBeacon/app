<template>
    <ion-content :fullscreen="true">
        <ion-list
            v-if="
                beaconStore.state !== ControllerState.READY ||
                beaconScannerStore.state !== ControllerState.READY ||
                beacons.length !== 0
            "
        >
            <permission-error-component
                v-if="
                    beaconStore.state === ControllerState.NO_PERMISSION ||
                    beaconScannerStore.state === ControllerState.NO_PERMISSION
                "
            >
                No Bluetooth advertising permission to broadcast!
            </permission-error-component>
            <permission-error-component
                v-else-if="
                    beaconStore.state === ControllerState.DISABLED ||
                    beaconScannerStore.state === ControllerState.DISABLED
                "
            >
                Bluetooth advertising is not supported!
            </permission-error-component>
            <beacon-item-component
                v-for="beacon in beacons"
                :key="beacon.uid"
                :beacon="beacon"
                simulator="true"
                :disabled="beaconStore.state !== ControllerState.READY"
                @simulateToggle="toggleAdvertising"
                @clickBeacon="() => $router.push(`/beacon/edit/${beacon.uid}`)"
                @deleteBeacon="deleteBeacon"
            >
            </beacon-item-component>
        </ion-list>

        <ion-card v-if="beacons.length === 0">
            <img alt="Solid Pod advertising" src="/assets/solid.png" />
            <ion-card-header>
                <ion-card-title>Sign in to Solid</ion-card-title>
                <ion-card-subtitle>Advertise your WebID</ion-card-subtitle>
            </ion-card-header>

            <ion-card-content>
                Sign in to your Solid Pod to advertise your WebID to nearby users.
            </ion-card-content>

            <ion-button fill="clear" @click="$router.push('/login')">Sign in</ion-button>
        </ion-card>

        <ion-card v-if="beacons.length === 0" :disabled="downloading">
            <img alt="IoT 2023 demo" src="/assets/iot2023.png" />
            <ion-card-header>
                <ion-card-title>Load example beacons</ion-card-title>
                <ion-card-subtitle>Download IoT 2023 beacons</ion-card-subtitle>
            </ion-card-header>

            <ion-card-content>
                You currently do not have any beacons to simulate. Do you want to load the IoT 2023
                demo beacons? An additional device is required to detect the beacons.
            </ion-card-content>

            <ion-button fill="clear" @click="downloadDemo">Load beacons</ion-button>
        </ion-card>

        <ion-fab slot="fixed" horizontal="end" vertical="bottom">
            <ion-fab-button
                :disabled="beaconStore.state !== ControllerState.READY"
                @click="addBeacon"
            >
                <ion-icon name="add-outline"></ion-icon>
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
    IonActionSheet,
    actionSheetController,
    IonNote,
} from '@ionic/vue';
import BeaconItemComponent from '@/components/beacons/BeaconItemComponent.vue';
import { SimulatedBeacon, useBeaconAdvertisingStore } from '@/stores/beacon.advertising';
import {
    BLEAltBeacon,
    BLEAltBeaconBuilder,
    BLEBeaconObject,
    BLEEddystoneUID,
    BLEEddystoneUIDBuilder,
    BLEEddystoneURL,
    BLEEddystoneURLBuilder,
    BLEiBeacon,
    BLEiBeaconBuilder,
    BLEUUID,
} from '@openhps/rf';
import {
    BLESemBeacon,
    BLESemBeaconBuilder,
    SEMBEACON_FLAG_HAS_POSITION,
    SEMBEACON_FLAG_HAS_SYSTEM,
} from '@sembeacon/openhps';
import { useBeaconStore } from '@/stores/beacon.scanning';
import PermissionErrorComponent from '@/components/PermissionErrorComponent.vue';
import { ControllerState } from '@/stores/types';
import { addOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

addIcons({
    addOutline,
});

@Component({
    components: {
        IonNote,
        PermissionErrorComponent,
        IonActionSheet,
        IonButtons,
        IonContent,
        IonHeader,
        IonMenuButton,
        IonTitle,
        IonToolbar,
        IonList,
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
export default class BLESimulatorComponent extends Vue {
    ControllerState: any = ControllerState;

    beaconStore = useBeaconAdvertisingStore();
    beaconScannerStore = useBeaconStore();
    downloading: boolean = false;

    get beacons(): SimulatedBeacon[] {
        return Array.from(this.beaconStore.beacons.values() as any);
    }

    async addBeacon(): Promise<void> {
        const action = await actionSheetController.create({
            header: 'Simulate a beacon',
            buttons: [
                {
                    text: 'Create SemBeacon',
                    handler: () => {
                        this.createBeacon(BLESemBeacon);
                    },
                },
                {
                    text: 'Create iBeacon',
                    handler: () => {
                        this.createBeacon(BLEiBeacon);
                    },
                },
                {
                    text: 'Create AltBeacon',
                    handler: () => {
                        this.createBeacon(BLEAltBeacon);
                    },
                },
                {
                    text: 'Create Eddystone-URL',
                    handler: () => {
                        this.createBeacon(BLEEddystoneURL);
                    },
                },
                {
                    text: 'Create Eddystone-UID',
                    handler: () => {
                        this.createBeacon(BLEEddystoneUID);
                    },
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                    data: {
                        action: 'cancel',
                    },
                },
            ],
        });

        await action.present();
    }

    createBeacon(type: new () => BLEBeaconObject): void {
        switch (type) {
            case BLEiBeacon:
                BLEiBeaconBuilder.create()
                    .build()
                    .then((beacon) => {
                        this.beaconStore.addSimulatedBeacon(beacon.uid, beacon);
                        this.$router.push(`/beacon/edit/${beacon.uid}`);
                    });
                return;
            case BLEAltBeacon:
                BLEAltBeaconBuilder.create()
                    .build()
                    .then((beacon) => {
                        this.beaconStore.addSimulatedBeacon(beacon.uid, beacon);
                        this.$router.push(`/beacon/edit/${beacon.uid}`);
                    });
                return;
            case BLESemBeacon:
                BLESemBeaconBuilder.create()
                    .build()
                    .then((beacon) => {
                        this.beaconStore.addSimulatedBeacon(beacon.uid, beacon);
                        this.$router.push(`/beacon/edit/${beacon.uid}`);
                    });
                return;
            case BLEEddystoneURL:
                BLEEddystoneURLBuilder.create()
                    .url('https://sembeacon.org')
                    .build()
                    .then((beacon) => {
                        this.beaconStore.addSimulatedBeacon(beacon.uid, beacon);
                        this.$router.push(`/beacon/edit/${beacon.uid}`);
                    });
                return;
            case BLEEddystoneUID:
                BLEEddystoneUIDBuilder.create()
                    .build()
                    .then((beacon) => {
                        this.beaconStore.addSimulatedBeacon(beacon.uid, beacon);
                        this.$router.push(`/beacon/edit/${beacon.uid}`);
                    });
                return;
        }
    }

    toggleAdvertising(beacon: SimulatedBeacon, advertising: boolean): void {
        if (advertising) {
            this.beaconStore.startAdvertising(beacon);
        } else {
            this.beaconStore.stopAdvertising(beacon);
        }
    }

    mounted(): void {
        this.beaconStore.initializeNotifications().catch(console.error);
    }
    deleteBeacon(beacon: SimulatedBeacon): void {
        this.beaconStore.delete(beacon);
    }

    stopAdvertising(): void {
        this.beaconStore.stopAdvertising();
    }

    downloadDemo(): void {
        this.downloading = true;
        BLESemBeaconBuilder.create()
            .namespaceId(BLEUUID.fromString('77f340db-ac0d-20e8-aa3a-f656a29f236c'))
            .instanceId('c187d748')
            .shortResourceUri('https://bit.ly/3JsEnF9')
            .flag(SEMBEACON_FLAG_HAS_POSITION)
            .flag(SEMBEACON_FLAG_HAS_SYSTEM)
            .build()
            .then((dummy) => {
                return this.beaconScannerStore.service.resolve(dummy, {
                    resolveAll: true,
                });
            })
            .then((beacons) => {
                this.beaconStore.addSimulatedBeacon(beacons.result.uid, beacons.result);
                beacons.beacons.forEach((beacon) => {
                    if (beacon instanceof BLESemBeacon) {
                        beacon.setFlag(SEMBEACON_FLAG_HAS_POSITION);
                        beacon.setFlag(SEMBEACON_FLAG_HAS_SYSTEM);
                    }
                    this.beaconStore.addSimulatedBeacon(beacon.uid, beacon);
                });
            })
            .catch(console.error)
            .finally(() => {
                this.downloading = false;
            });
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
