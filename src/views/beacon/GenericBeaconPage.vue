<template>
    <div>
        <slot name="beacon-card">
            <ion-card>
                <ion-card-content>
                    <ion-grid class="compact">
                        <ion-row>
                            <ion-col size="2">
                                <ion-thumbnail v-if="beaconIcon">
                                    <img :alt="beaconType()" :src="beaconIcon" />
                                </ion-thumbnail>
                            </ion-col>
                            <ion-col size="10">
                                <ion-grid>
                                    <ion-row>
                                        <ion-col size="10">
                                            <h1>{{ beaconType() }}</h1>
                                        </ion-col>
                                    </ion-row>
                                    <ion-row v-if="edit || beacon.displayName">
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
                                    <ion-row v-if="readonly" :key="key">
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
                            </ion-col>
                        </ion-row>
                    </ion-grid>
                </ion-card-content>
            </ion-card>
        </slot>

        <ion-grid>
            <ion-row>
                <template v-if="beaconType().startsWith('Eddystone')">
                    <ion-col v-if="beacon.calibratedRSSI || edit" size="12">
                        <ion-input
                            :disabled="!edit && !readonly"
                            :readonly="readonly && !edit"
                            label-placement="floating"
                            :fill="readonly && !edit ? undefined : 'solid'"
                            placeholder="-12"
                            type="number"
                            :value="beacon.getCalibratedRSSI(0)"
                            @change="(e) => beacon.setCalibratedRSSI(parseInt(e.target.value), 0)"
                        >
                            <div slot="label">Calibrated RSSI at 0m</div>
                        </ion-input>
                    </ion-col>
                </template>
                <template v-else>
                    <ion-col v-if="beacon.calibratedRSSI || edit" size="12">
                        <ion-input
                            :value="beacon.calibratedRSSI"
                            type="number"
                            :disabled="!edit && !readonly"
                            :readonly="readonly && !edit"
                            label-placement="floating"
                            :fill="readonly && !edit ? undefined : 'solid'"
                            placeholder="-56"
                            @change="(e) => (beacon.calibratedRSSI = parseInt(e.target.value))"
                        >
                            <div slot="label">Calibrated RSSI at 1m</div>
                        </ion-input>
                    </ion-col>
                </template>
                <ion-col v-if="beacon.address" size="12">
                    <ion-input
                        :disabled="!edit && !readonly"
                        :readonly="readonly && !edit"
                        label-placement="stacked"
                        :value="beacon.address.toString()"
                    >
                        <div slot="label">MAC Address</div>
                    </ion-input>
                </ion-col>
                <ion-col v-if="beacon.manufacturerData.size > 0" size="12">
                    <ion-input
                        :disabled="!edit && !readonly"
                        :readonly="readonly && !edit"
                        label-placement="stacked"
                        :value="manufacturer"
                    >
                        <div slot="label">Manufacturer</div>
                    </ion-input>
                </ion-col>
                <slot name="beacon-data"> </slot>
                <ion-col v-if="beacon && position" size="12">
                    <ion-input
                        :disabled="!edit && !readonly"
                        :readonly="readonly && !edit"
                        label-placement="stacked"
                        :value="`${position.latitude}, ${position.longitude}`"
                    >
                        <div slot="label">Position</div>
                    </ion-input>
                </ion-col>
            </ion-row>
        </ion-grid>
    </div>
</template>

<script lang="ts">
import { Options, Prop } from 'vue-property-decorator';
import {
    IonRow,
    IonCol,
    IonInput,
    IonGrid,
    IonCard,
    IonCardContent,
    IonThumbnail,
} from '@ionic/vue';
import { maskito } from '@maskito/vue';
import { BaseBeaconPage } from './BaseBeaconPage';
import { Beacon } from '@/stores/beacon.scanning';
import { BLEBeaconObject } from '@openhps/rf';

@Options({
    components: {
        IonRow,
        IonCol,
        IonInput,
        IonGrid,
        IonCard,
        IonCardContent,
        IonThumbnail,
    },
    directives: {
        maskito,
    },
})
export default class GenericBeaconPage extends BaseBeaconPage {
    @Prop() beacon?: BLEBeaconObject & Beacon = undefined;

    beaconType(): string {
        return this.type ?? 'Bluetooth';
    }
}
</script>

<style lang="scss" scoped>
ion-card-content ion-grid {
    padding-top: 0;
    padding-bottom: 0;
}

ion-grid ion-grid {
    margin: 0;
    padding: 0;
    width: 100%;
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
</style>