<template>
    <ion-card mode="ios" class="user">
        <div class="img-wrapper">
            <img
                :src="object.picture"
                :alt="`Profile picture of ${object.name}`"
                @error="(e) => (e.target as HTMLImageElement).src = '/assets/avatar.svg'"
            />
        </div>
        <ion-card-content>
            <ion-grid class="compact">
                <ion-row>
                    <ion-col size="12" class="ion-text-center">
                        <h1>{{ object.name }}</h1>
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col size="12">
                        <ion-input
                            v-model="object.id"
                            :readonly="true"
                            label-placement="floating"
                        >
                            <div slot="label">WebID</div>
                        </ion-input>
                    </ion-col>
                    <ion-col v-if="object.title" size="12">
                        <ion-input
                            v-model="object.title"
                            :readonly="true"
                            label-placement="floating"
                        >
                            <div slot="label">Title</div>
                        </ion-input>
                    </ion-col>
                    <ion-col v-if="object.jobTitle" size="12">
                        <ion-input
                            v-model="object.jobTitle"
                            :readonly="true"
                            label-placement="floating"
                        >
                            <div slot="label">Job title</div>
                        </ion-input>
                    </ion-col>
                    <ion-col v-if="object.email" size="12">
                        <ion-input
                            type="email"
                            :value="object.email.replace('mailto:', '')"
                            :readonly="true"
                            label-placement="floating"
                        >
                            <div slot="label">E-mail</div>
                        </ion-input>
                    </ion-col>
                    <ion-col v-if="object.nickname" size="12">
                        <ion-input
                            v-model="object.nickname"
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
                    <ion-col v-if="object.birthDate" size="12">
                        <ion-input
                            :value="object.birthDate.toDateString()"
                            :readonly="true"
                            label-placement="floating"
                        >
                            <div slot="label">Birth date</div>
                        </ion-input>
                    </ion-col>
                </ion-row>
                <ion-row v-if="!(!edit && !readonly) && beacon.displayName">
                    <ion-col size="12">
                        <ion-input
                            v-model="beacon.displayName"
                            :disabled="!edit && !readonly"
                            :readonly="readonly && !edit"
                            label-placement="floating"
                            :fill="readonly && !edit ? undefined : 'outline'"
                        >
                            <div slot="label">Name</div>
                        </ion-input>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-card-content>

        <ion-grid v-if="readonly" :key="key" class="card-footer compact">
            <ion-row>
                <ion-col size="6">
                    <h2>RSSI: {{ beacon.rssi }} <small>dBm</small></h2>
                </ion-col>
                <ion-col v-if="beacon.distance" size="6">
                    <h2>Distance: {{ beacon.distance }} <small>m</small></h2>
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
    IonGrid,
    IonCardHeader,
    IonCardTitle,
    IonAvatar,
    IonButton,
    IonFooter,
} from '@ionic/vue';
import { User } from '@openhps/rdf';
import { addCircleOutline, closeCircleOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { BaseBeaconPage } from '@/views/beacon/BaseBeaconPage';
import { BLESemBeacon } from '@sembeacon/openhps';
import { Beacon } from '@/stores/beacon.scanning';

addIcons({
    addCircleOutline,
    closeCircleOutline,
});

@Component({
    components: {
        IonRow,
        IonCol,
        IonGrid,
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
    },
})
export default class UserCardComponent extends BaseBeaconPage {
    @Prop() beacon?: BLESemBeacon & Beacon = undefined;
    
    get object(): User {
        return this.beacon.object as User;
    }
}
</script>

<style lang="scss" scoped>
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
        -webkit-transform: translateX(-50%); /* Safari and older Chrome versions */
        -ms-transform: translateX(-50%); /* IE 9 and older */
        -moz-transform: translateX(-50%); /* Firefox */
        -o-transform: translateX(-50%); /* Opera */

        img {
            position: relative;
            border-radius: 20px;
            -webkit-border-radius: 20px; /* Safari and older Chrome versions */
            -moz-border-radius: 20px; /* Firefox */
            box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.2);
            -webkit-box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.2); /* Safari and older Chrome versions */
            -moz-box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.2); /* Firefox */
            width: 100px;
            height: 100px;
        }
    }
}
</style>