<template>
    <div>
        <ion-card mode="ios" class="user" v-if="(beacon.object instanceof User)">
            <div class="img-wrapper">
                <img
                    :src="beacon.object.picture"
                    :alt="`Profile picture of ${beacon.object.name}`"
                    @error="(e) => (e.target as HTMLImageElement).src = 'https://ionicframework.com/docs/img/demos/avatar.svg'"
                />
            </div>
            <ion-card-content>
                <ion-grid class="compact">
                    <ion-row>
                        <ion-col size="12" class="ion-text-center">
                            <h1>{{ beacon.object.name }}</h1>
                        </ion-col>
                    </ion-row>
                    <ion-row>
                        <ion-col size="12">
                            <ion-input
                                v-model="beacon.object.id"
                                :readonly="true"
                                label-placement="floating"
                            >
                                <div slot="label">WebID</div>
                            </ion-input>
                        </ion-col>
                        <ion-col size="12" v-if="beacon.object.jobTitle">
                            <ion-input
                                v-model="beacon.object.jobTitle"
                                :readonly="true"
                                label-placement="floating"
                            >
                                <div slot="label">Job title</div>
                            </ion-input>
                        </ion-col>
                        <ion-col size="12" v-if="beacon.object.email">
                            <ion-input
                                type="email"
                                :value="beacon.object.email.replace('mailto:', '')"
                                :readonly="true"
                                label-placement="floating"
                            >
                                <div slot="label">E-mail</div>
                            </ion-input>
                        </ion-col>
                        <ion-col size="12" v-if="beacon.object.nickname">
                            <ion-input
                                v-model="beacon.object.nickname"
                                :readonly="true"
                                label-placement="floating"
                            >
                                <div slot="label">Nickname</div>
                            </ion-input>
                        </ion-col>
                        <!--<ion-col size="12" v-if="beacon.object.account">
                            <a :href="account" v-for="account in beacon.object.account" :key="account">
                                {{ account }}
                            </a>
                        </ion-col>-->
                        <ion-col size="12" v-if="beacon.object.birthDate">
                            <ion-input
                                :value="beacon.object.birthDate.toDateString()"
                                :readonly="true"
                                label-placement="floating"
                            >
                                <div slot="label">Birth date</div>
                            </ion-input>
                        </ion-col>
                    </ion-row>
                    <ion-row
                        v-if="!(!edit && !readonly) && beacon.displayName">
                        <ion-col size="12">
                            <ion-input
                                v-model="beacon.displayName"
                                :disabled="!edit && !readonly"
                                :readonly="readonly && !edit"
                                label-placement="floating"
                                :fill="
                                    readonly && !edit
                                        ? undefined
                                        : 'outline'
                                "
                            >
                                <div slot="label">Name</div>
                            </ion-input>
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </ion-card-content>

            <ion-grid class="card-footer compact" 
                v-if="readonly"
                :key="key">
                <ion-row>
                    <ion-col size="6">
                        <h2>RSSI: {{ beacon.rssi }} <small>dBm</small></h2>
                    </ion-col>
                    <ion-col v-if="beacon.distance" size="6">
                        <h2>
                            Distance: {{ beacon.distance }} <small>m</small>
                        </h2>
                    </ion-col>
                    <ion-col v-else size="6">
                        <h2>Distance: -</h2>
                    </ion-col>
                    <ion-col size="6">
                        <h3>Created: {{ firstSeen() }}</h3>
                    </ion-col>
                    <ion-col size="6">
                        <h3>Last seen: {{ lastSeen() }}</h3>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-card>

        <generic-beacon-page
            :beacon="beacon"
            :type="beaconType()"
            :edit="edit"
            :readonly="readonly"
            :loading="loading"
        >
            <template #beacon-card v-if="(beacon.object instanceof User)">
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
                        @change="
                            (e) =>
                                (beacon.namespaceId = BLEUUID.fromString(
                                    e.target.value,
                                ))
                        "
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
                        @change="
                            (e) =>
                                (beacon.instanceId = BLEUUID.fromString(e.target.value))
                        "
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
        <ion-card v-if="beacon.flags !== 0x00 || edit">
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
                                    beacon.flags ^
                                    BLESemBeacon.FLAGS.SEMBEACON_FLAG_HAS_POSITION;
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
                                    beacon.flags ^
                                    BLESemBeacon.FLAGS.SEMBEACON_FLAG_HAS_TELEMETRY;
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
import { Options, Prop } from 'vue-property-decorator';
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

@Options({
    components: {
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
        GenericBeaconPage
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
                        toastController.create({
                            message: 'Fetching SemBeacon information ...',
                            color: 'light',
                            duration: 2000,
                        }).then(toast => toast.present());
                        this.beaconStore.beaconService
                            .resolve(this.beacon as BLESemBeacon, {
                                resolveAll: false,
                                persistance: false,
                            })
                            .then((beacon) => {
                                this.$emit('update', beacon.result);
                                // Create a toast message saying that the SemBeacon has been resolved
                                toastController.create({
                                    message: 'Successfully fetched SemBeacon information!',
                                    color: 'success',
                                    duration: 2000,
                                }).then(toast => toast.present());
                            })
                            .catch(error => {
                                // Create a toast message saying that the SemBeacon could not be resolved
                                toastController.create({
                                    message: 'Unable to fetch SemBeacon information!',
                                    color: 'danger',
                                    duration: 2000,
                                }).then(toast => toast.present());
                                console.error(error);
                            });
                    },
                },
            ],
        });
        await alert.present();
    }

    beaconType(): string {
        return "SemBeacon";
    }
}
</script>

<style scss scoped>
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

ion-card.user {
  overflow: visible;
  margin: 16px 1em 24px;
  position: relative;
  padding-top: 40px;
  contain: none;
  margin-top: 70px;

  .img-wrapper {
    position: absolute;
    left: 50%;
    top: -50px;
    transform: translateX(-50%);
    img {
        position: relative;
        border-radius: 20px;
        box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.2);
        width: 100px;
        height: 100px;
    }
  }
}

ion-grid.card-footer {
    background-color: #f5f5f5; /* very light gray */
    border-top: 1px solid #e0e0e0; /* a bit darker gray */
    padding-inline-start: 20px;
    padding-inline-end: 20px;
    padding-top: 20px;
    padding-bottom: 20px;
    
    & h2, h3 {
        font-size: 0.8rem;
        font-weight: bold;
    }
}
</style>