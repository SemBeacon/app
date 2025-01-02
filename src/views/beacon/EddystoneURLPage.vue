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
                <ion-input
                    type="url"
                    :disabled="!edit && !readonly"
                    :readonly="readonly && !edit"
                    label-placement="floating"
                    :fill="readonly && !edit ? undefined : 'solid'"
                    placeholder="http://www.example.com"
                    :value="beacon.url"
                >
                    <div slot="label">URL</div>
                </ion-input>
            </ion-col>
        </template>
    </generic-beacon-page>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-facing-decorator';
import { IonRow, IonCol, IonInput } from '@ionic/vue';
import { maskito } from '@maskito/vue';
import { BLEEddystoneURL } from '@openhps/rf';
import { BaseBeaconPage } from './BaseBeaconPage';
import { Beacon } from '@/stores/beacon.scanning';
import GenericBeaconPage from './GenericBeaconPage.vue';

@Component({
    components: {
        IonRow,
        IonCol,
        IonInput,
        GenericBeaconPage,
    },
    directives: {
        maskito,
    },
})
export default class EddystoneURLBeaconPage extends BaseBeaconPage {
    @Prop() beacon?: BLEEddystoneURL & Beacon = undefined;

    beaconType(): string {
        return 'Eddystone-URL';
    }
}
</script>