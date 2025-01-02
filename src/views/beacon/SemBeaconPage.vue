<template>
    <div>
        <user-card-component
            v-if="beacon.object instanceof User"
            :beacon="beacon"
            :edit="edit"
            :readonly="readonly"
            :loading="loading"
        ></user-card-component>

        <generic-beacon-page
            :beacon="beacon"
            :type="beaconType()"
            :edit="edit"
            :readonly="readonly"
            :loading="loading"
        >
            <template v-if="beacon.object instanceof User" #beacon-card>
                <div></div>
            </template>
            <template #beacon-data>
                <ion-col size="12">
                    <ion-input
                        v-maskito="uuid128Options"
                        :fill="readonly && !edit ? undefined : 'solid'"
                        :disabled="!edit && !readonly"
                        :readonly="readonly && !edit"
                        label-placement="floating"
                        placeholder="00000000-0000-0000-0000-000000000000"
                        :value="beacon.namespaceId.toString()"
                        @change="(e) => (beacon.namespaceId = BLEUUID.fromString(e.target.value))"
                    >
                        <div slot="label">Namespace ID</div>
                    </ion-input>
                </ion-col>
                <ion-col size="12">
                    <ion-input
                        v-maskito="uuid32Options"
                        :fill="readonly && !edit ? undefined : 'solid'"
                        :disabled="!edit && !readonly"
                        :readonly="readonly && !edit"
                        label-placement="floating"
                        placeholder="00000000"
                        :value="beacon.instanceId.toString(4, false)"
                        @change="(e) => (beacon.instanceId = BLEUUID.fromString(e.target.value))"
                    >
                        <div slot="label">Instance ID</div>
                    </ion-input>
                </ion-col>
                <ion-col size="12">
                    <ion-input
                        v-model="beacon.shortResourceUri"
                        type="url"
                        :fill="readonly && !edit ? undefined : 'solid'"
                        :disabled="!edit && !readonly"
                        :readonly="readonly && !edit"
                        label-placement="floating"
                        placeholder="http://www.example.com"
                        @change="
                            () => {
                                beacon.resourceUri = undefined; // Invalidate
                                resolveSemBeacon();
                            }
                        "
                    >
                        <div slot="label">Short resource URI</div>
                    </ion-input>
                </ion-col>
                <ion-col v-if="beacon.resourceUri || edit" size="12">
                    <ion-input
                        v-model="beacon.resourceUri"
                        type="url"
                        :disabled="!edit && !readonly"
                        :readonly="readonly && !edit"
                        :fill="readonly && !edit ? undefined : 'solid'"
                        label-placement="floating"
                        @ionChange="() => resolveSemBeacon()"
                    >
                        <div slot="label">Resource URI</div>
                    </ion-input>
                </ion-col>
            </template>
        </generic-beacon-page>
        <ion-card v-if="beacon.flags !== undefined || edit">
            <ion-card-header>
                <ion-card-title>Beacon flags</ion-card-title>
            </ion-card-header>

            <ion-card-content>
                <div :key="key" class="chip-container">
                    <ion-chip
                        v-if="beacon.hasFlag(BLESemBeacon.FLAGS.SEMBEACON_FLAG_HAS_POSITION)"
                        color="primary"
                        @click="
                            () => {
                                if (!edit) return;
                                beacon.flags =
                                    beacon.flags ^ BLESemBeacon.FLAGS.SEMBEACON_FLAG_HAS_POSITION;
                            }
                        "
                    >
                        <ion-label>HAS_POSITION</ion-label>
                        <ion-icon v-if="edit" icon="close-circle-outline"></ion-icon>
                    </ion-chip>
                    <ion-chip
                        v-else-if="edit"
                        color="success"
                        @click="beacon.setFlag(BLESemBeacon.FLAGS.SEMBEACON_FLAG_HAS_POSITION)"
                    >
                        <ion-label>HAS_POSITION</ion-label>
                        <ion-icon icon="add-circle-outline"></ion-icon>
                    </ion-chip>

                    <ion-chip
                        v-if="beacon.hasFlag(BLESemBeacon.FLAGS.SEMBEACON_FLAG_PRIVATE)"
                        color="primary"
                        @click="
                            () => {
                                if (!edit) return;
                                beacon.flags =
                                    beacon.flags ^ BLESemBeacon.FLAGS.SEMBEACON_FLAG_PRIVATE;
                            }
                        "
                    >
                        <ion-label>IS_PRIVATE</ion-label>
                        <ion-icon v-if="edit" icon="close-circle-outline"></ion-icon>
                    </ion-chip>
                    <ion-chip
                        v-else-if="edit"
                        color="success"
                        @click="beacon.setFlag(BLESemBeacon.FLAGS.SEMBEACON_FLAG_PRIVATE)"
                    >
                        <ion-label>IS_PRIVATE</ion-label>
                        <ion-icon icon="add-circle-outline"></ion-icon>
                    </ion-chip>

                    <ion-chip
                        v-if="beacon.hasFlag(BLESemBeacon.FLAGS.SEMBEACON_FLAG_MOVING)"
                        color="primary"
                        @click="
                            () => {
                                if (!edit) return;
                                beacon.flags =
                                    beacon.flags ^ BLESemBeacon.FLAGS.SEMBEACON_FLAG_MOVING;
                            }
                        "
                    >
                        <ion-label>IS_MOVING</ion-label>
                        <ion-icon v-if="edit" icon="close-circle-outline"></ion-icon>
                    </ion-chip>
                    <ion-chip
                        v-else-if="edit"
                        color="success"
                        @click="beacon.setFlag(BLESemBeacon.FLAGS.SEMBEACON_FLAG_MOVING)"
                    >
                        <ion-label>IS_MOVING</ion-label>
                        <ion-icon icon="add-circle-outline"></ion-icon>
                    </ion-chip>

                    <ion-chip
                        v-if="beacon.hasFlag(BLESemBeacon.FLAGS.SEMBEACON_FLAG_HAS_SYSTEM)"
                        color="primary"
                        @click="
                            () => {
                                if (!edit) return;
                                beacon.flags =
                                    beacon.flags ^ BLESemBeacon.FLAGS.SEMBEACON_FLAG_HAS_SYSTEM;
                            }
                        "
                    >
                        <ion-label>HAS_SYSTEM</ion-label>
                        <ion-icon v-if="edit" icon="close-circle-outline"></ion-icon>
                    </ion-chip>
                    <ion-chip
                        v-else-if="edit"
                        color="success"
                        @click="beacon.setFlag(BLESemBeacon.FLAGS.SEMBEACON_FLAG_HAS_SYSTEM)"
                    >
                        <ion-label>HAS_SYSTEM</ion-label>
                        <ion-icon icon="add-circle-outline"></ion-icon>
                    </ion-chip>

                    <ion-chip
                        v-if="beacon.hasFlag(BLESemBeacon.FLAGS.SEMBEACON_FLAG_HAS_TELEMETRY)"
                        color="primary"
                        @click="
                            () => {
                                if (!edit) return;
                                beacon.flags =
                                    beacon.flags ^ BLESemBeacon.FLAGS.SEMBEACON_FLAG_HAS_TELEMETRY;
                            }
                        "
                    >
                        <ion-label>HAS_TELEMETRY</ion-label>
                        <ion-icon v-if="edit" icon="close-circle-outline"></ion-icon>
                    </ion-chip>
                    <ion-chip
                        v-else-if="edit"
                        color="success"
                        @click="beacon.setFlag(BLESemBeacon.FLAGS.SEMBEACON_FLAG_HAS_TELEMETRY)"
                    >
                        <ion-label>HAS_TELEMETRY</ion-label>
                        <ion-icon icon="add-circle-outline"></ion-icon>
                    </ion-chip>

                    <ion-chip v-if="beacon.flags === 0x00 && !edit" color="danger">
                        No flags
                    </ion-chip>
                </div>
            </ion-card-content>
        </ion-card>
    </div>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-facing-decorator';
import {
    IonRow,
    IonCol,
    IonInput,
    IonCard,
    IonCardContent,
    IonChip,
    IonIcon,
    IonCardHeader,
    IonCardTitle,
    alertController,
    toastController,
    IonAvatar,
    IonButton,
    IonFooter,
} from '@ionic/vue';
import { maskito } from '@maskito/vue';
import { BLESemBeacon } from '@sembeacon/openhps';
import { BaseBeaconPage } from './BaseBeaconPage';
import { Beacon } from '@/stores/beacon.scanning';
import GenericBeaconPage from './GenericBeaconPage.vue';
import { User } from '@openhps/rdf';
import { addCircleOutline, closeCircleOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import UserCardComponent from '@/components/beacons/UserCardComponent.vue';

addIcons({
    addCircleOutline,
    closeCircleOutline,
});

@Component({
    components: {
        UserCardComponent,
        IonRow,
        IonCol,
        IonInput,
        IonCard,
        IonCardContent,
        IonChip,
        IonIcon,
        IonCardHeader,
        IonCardTitle,
        IonFooter,
        IonAvatar,
        IonButton,
        GenericBeaconPage,
    },
    directives: {
        maskito,
    },
})
export default class SemBeaconPage extends BaseBeaconPage {
    readonly BLESemBeacon: typeof BLESemBeacon = BLESemBeacon;
    readonly User: typeof User = User;
    @Prop() beacon?: BLESemBeacon & Beacon = undefined;

    async resolveSemBeacon(): Promise<void> {
        const alert = await alertController.create({
            header: 'Fetch SemBeacon information',
            message: 'Do you want to fetch the online SemBeacon information?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                },
                {
                    text: 'OK',
                    role: 'confirm',
                    handler: () => {
                        // Create a toast message saying that the SemBeacon is being resolved
                        toastController
                            .create({
                                message: 'Fetching SemBeacon information ...',
                                color: 'light',
                                duration: 2000,
                            })
                            .then((toast) => toast.present());
                        this.beaconStore.service
                            .resolve(this.beacon, {
                                resolveAll: false,
                                persistence: false,
                            })
                            .then((beacon) => {
                                if (!beacon.result) {
                                    // Create a toast message saying that the SemBeacon could not be resolved
                                    toastController
                                        .create({
                                            message: 'Unable to fetch SemBeacon information!',
                                            color: 'danger',
                                            duration: 2000,
                                        })
                                        .then((toast) => toast.present());
                                    return;
                                }
                                this.$emit('update', beacon.result);
                                // Create a toast message saying that the SemBeacon has been resolved
                                toastController
                                    .create({
                                        message: 'Successfully fetched SemBeacon information!',
                                        color: 'success',
                                        duration: 2000,
                                    })
                                    .then((toast) => toast.present());
                            })
                            .catch((error) => {
                                // Create a toast message saying that the SemBeacon could not be resolved
                                toastController
                                    .create({
                                        message: 'Unable to fetch SemBeacon information!',
                                        color: 'danger',
                                        duration: 2000,
                                    })
                                    .then((toast) => toast.present());
                                console.error(error);
                            });
                    },
                },
            ],
        });
        await alert.present();
    }

    beaconType(): string {
        return 'SemBeacon';
    }
}
</script>

<style lang="scss" scoped>
.chip-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    flex-wrap: wrap;

    ion-chip {
        flex-basis: auto;
    }
}

ion-card-content ion-grid {
    padding-top: 0;
    padding-bottom: 0;
}

ion-thumbnail {
    --size: 32px;
}

ion-grid.compact {
    margin: 0;
    padding: 0;
    width: 100%;

    ion-col {
        margin: 0;
        padding: 0;
    }
}

ion-grid.card-footer {
    background-color: #f5f5f5; /* very light gray */
    border-top: 1px solid #e0e0e0; /* a bit darker gray */
    padding-inline-start: 20px;
    padding-inline-end: 20px;
    padding-top: 20px;
    padding-bottom: 20px;

    & h2,
    h3 {
        font-size: 0.8rem;
        font-weight: bold;
    }
}
</style>