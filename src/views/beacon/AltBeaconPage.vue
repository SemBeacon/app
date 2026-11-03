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
                    v-maskito="uuid128Options"
                    :disabled="!edit && !readonly"
                    :readonly="readonly && !edit"
                    label-placement="floating"
                    :fill="readonly && !edit ? undefined : 'solid'"
                    placeholder="00000000-0000-0000-0000-000000000000"
                    :value="beacon.proximityUUID.toString()"
                    @change="(e) => (beacon.proximityUUID = BLEUUID.fromString(e.target.value))"
                >
                    <div slot="label">Proximity UUID</div>
                </ion-input>
            </ion-col>
            <ion-col size="12">
                <ion-grid>
                    <ion-row>
                        <ion-col size="6">
                            <ion-input
                                :value="beacon.major"
                                type="number"
                                :disabled="!edit && !readonly"
                                :readonly="readonly && !edit"
                                label-placement="floating"
                                :fill="readonly && !edit ? undefined : 'solid'"
                                @change="(e) => (beacon.major = parseInt(e.target.value))"
                            >
                                <div slot="label">Major</div>
                            </ion-input>
                        </ion-col>
                        <ion-col size="6">
                            <ion-input
                                :value="beacon.minor"
                                type="number"
                                :disabled="!edit && !readonly"
                                :readonly="!readonly && !edit"
                                label-placement="floating"
                                :fill="readonly && !edit ? undefined : 'solid'"
                                @change="(e) => (beacon.minor = parseInt(e.target.value))"
                            >
                                <div slot="label">Minor</div>
                            </ion-input>
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </ion-col>
        </template>
    </generic-beacon-page>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-facing-decorator';
import { IonRow, IonCol, IonInput } from '@ionic/vue';
import { maskito } from '@maskito/vue';
import { BLEAltBeacon, BLEiBeacon } from '@openhps/rf';
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
export default class AltBeaconBeaconPage extends BaseBeaconPage {
    @Prop() beacon?: (BLEAltBeacon | BLEiBeacon) & Beacon = undefined;

    beaconType(): string {
        if (this.beacon instanceof BLEiBeacon) {
            return 'iBeacon';
        } else if (this.beacon instanceof BLEAltBeacon) {
            return 'AltBeacon';
        }
    }
}
</script>