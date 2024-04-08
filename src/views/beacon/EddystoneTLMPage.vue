<template>
    <generic-beacon-page
        :beacon="beacon"
        :type="beaconType()"
        :edit="edit"
        :readonly="readonly"
        :loading="loading"
    >
        <template #beacon-data>
            <ion-col size="12">
                <ion-grid>
                    <ion-row>
                        <ion-col size="6">
                            <ion-input
                                :disabled="!edit && !readonly"
                                :readonly="readonly && !edit"
                                label-placement="floating"
                                :fill="readonly && !edit ? undefined : 'solid'"
                                :value="beacon.voltage + ' mV'"
                            >
                                <div slot="label">Voltage</div>
                            </ion-input>
                        </ion-col>
                        <ion-col v-if="beacon.temperature" size="6">
                            <ion-input
                                :disabled="!edit && !readonly"
                                :readonly="readonly && !edit"
                                label-placement="floating"
                                :fill="readonly && !edit ? undefined : 'solid'"
                                :value="beacon.temperature.value + ' &deg;C'"
                            >
                                <div slot="label">Temperature</div>
                            </ion-input>
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </ion-col>
        </template>
    </generic-beacon-page>
</template>

<script lang="ts">
import { Options, Prop } from 'vue-property-decorator';
import {
    IonRow,
    IonCol,
    IonInput,
    IonGrid
} from '@ionic/vue';
import { maskito } from '@maskito/vue';
import { BLEEddystoneTLM } from '@openhps/rf';
import { BaseBeaconPage } from './BaseBeaconPage';
import { Beacon } from '@/stores/beacon.scanning';
import GenericBeaconPage from './GenericBeaconPage.vue';

@Options({
    components: {
        IonRow,
        IonCol,
        IonInput,
        IonGrid,
        GenericBeaconPage
    },
    directives: {
        maskito,
    },
})
export default class EddystoneTLMBeaconPage extends BaseBeaconPage {
    @Prop() beacon?: BLEEddystoneTLM & Beacon = undefined;

    beaconType(): string {
        return "Eddystone-TLM";
    }
}
</script>