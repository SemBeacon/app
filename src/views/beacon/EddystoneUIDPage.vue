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
                    v-maskito="uuid80Options"
                    :disabled="!edit && !readonly"
                    :readonly="readonly && !edit"
                    label-placement="floating"
                    :fill="readonly && !edit ? undefined : 'solid'"
                    placeholder="0000000000000000000"
                    :value="beacon.namespaceId.toString()"
                    @change="(e) => (beacon.namespaceId = BLEUUID.fromString(e.target.value))"
                >
                    <div slot="label">Namespace ID</div>
                </ion-input>
            </ion-col>
            <ion-col size="12">
                <ion-input
                    v-maskito="uuid48Options"
                    :disabled="!edit && !readonly"
                    :readonly="readonly && !edit"
                    label-placement="floating"
                    :fill="readonly && !edit ? undefined : 'solid'"
                    :value="beacon.instanceId.toString()"
                    @change="(e) => (beacon.instanceId = BLEUUID.fromString(e.target.value))"
                >
                    <div slot="label">Instance ID</div>
                </ion-input>
            </ion-col>
        </template>
    </generic-beacon-page>
</template>

<script lang="ts">
import { Options, Prop } from 'vue-property-decorator';
import { IonRow, IonCol, IonInput } from '@ionic/vue';
import { maskito } from '@maskito/vue';
import { BLEEddystoneUID } from '@openhps/rf';
import { BaseBeaconPage } from './BaseBeaconPage';
import { Beacon } from '@/stores/beacon.scanning';
import GenericBeaconPage from './GenericBeaconPage.vue';

@Options({
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
export default class EddystoneUIDBeaconPage extends BaseBeaconPage {
    @Prop() beacon?: BLEEddystoneUID & Beacon = undefined;

    beaconType(): string {
        return 'Eddystone-UID';
    }
}
</script>