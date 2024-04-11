<template>
    <ion-item-sliding :class="deleted ? 'item-delete-animation' : ''">
        <ion-item ref="item" class="beacon-item" button :detail="false" :disabled="disabled">
            <ion-avatar
                v-if="beaconType === 'SemBeacon' && beacon.object && beacon.object instanceof User"
                slot="start"
            >
                <img
                    :src="beacon.object.picture"
                    :alt="`Profile picture of ${beacon.object.name}`"
                    @error="(e) => (e.target as HTMLImageElement).src = 'https://ionicframework.com/docs/img/demos/avatar.svg'"
                />
            </ion-avatar>
            <ion-thumbnail v-else-if="beaconIcon" slot="start" @click="onClick">
                <img :alt="beacon.displayName" :src="beaconIcon" />
            </ion-thumbnail>
            <ion-grid
                v-if="beaconType === 'SemBeacon' && beacon.object && beacon.object instanceof User"
                style="width: 100%"
                @click="onClick"
            >
                <ion-row v-if="beacon.object.name">
                    <ion-col size="12">
                        <ion-label color="primary-contrast" class="key">{{
                            beacon.object.name
                        }}</ion-label>
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col size="12" size-md="3">
                        <ion-label class="key" color="primary">WebID</ion-label>
                    </ion-col>
                    <ion-col size="12" size-md="8">
                        <ion-label class="ion-text-nowrap">{{ beacon.object.id }}</ion-label>
                    </ion-col>
                </ion-row>
            </ion-grid>
            <ion-grid v-else style="width: 100%" @click="onClick">
                <ion-row v-if="beacon.displayName">
                    <ion-col size="12">
                        <ion-label color="primary-contrast" class="key">{{
                            beacon.displayName
                        }}</ion-label>
                    </ion-col>
                </ion-row>
                <ion-row>
                    <template v-if="beacon instanceof BeaconType.BLESemBeacon">
                        <ion-col size="12" size-md="3">
                            <ion-label class="key" color="primary">Namespace</ion-label>
                        </ion-col>
                        <ion-col size="12" size-md="8">
                            <ion-label class="ion-text-nowrap">{{
                                beacon.namespaceId.toString()
                            }}</ion-label>
                        </ion-col>
                        <ion-col size="6" size-md="3">
                            <ion-label class="key" color="primary">Instance</ion-label>
                        </ion-col>
                        <ion-col size="6" size-md="8">
                            <ion-label class="ion-text-nowrap">{{
                                beacon.instanceId.toString(false)
                            }}</ion-label>
                        </ion-col>
                    </template>
                    <template
                        v-else-if="
                            beacon instanceof BeaconType.BLEiBeacon ||
                            beacon instanceof BeaconType.BLEAltBeacon
                        "
                    >
                        <ion-col size="12" size-md="4">
                            <ion-label class="key" color="primary">UUID</ion-label>
                        </ion-col>
                        <ion-col size="12" size-md="8">
                            <ion-label class="ion-text-nowrap">{{
                                beacon.proximityUUID.toString()
                            }}</ion-label>
                        </ion-col>
                        <ion-col size="7" size-md="2">
                            <ion-label class="key" color="primary">Major</ion-label>
                        </ion-col>
                        <ion-col size="5" size-md="4">
                            <ion-label>{{ beacon.major }}</ion-label>
                        </ion-col>
                        <ion-col size="7" size-md="2">
                            <ion-label class="key" color="primary">Minor</ion-label>
                        </ion-col>
                        <ion-col size="5" size-md="4">
                            <ion-label>{{ beacon.minor }}</ion-label>
                        </ion-col>
                    </template>
                    <template v-else-if="beacon instanceof BeaconType.BLEEddystoneURL">
                        <ion-col size="3">
                            <ion-label class="key" color="primary">URL</ion-label>
                        </ion-col>
                        <ion-col size="10" size-md="4">
                            <ion-label>{{ beacon.url }}</ion-label>
                        </ion-col>
                    </template>
                    <template v-else-if="beacon instanceof BeaconType.BLEEddystoneUID">
                        <ion-col size="12" size-md="4">
                            <ion-label class="key" color="primary">Namespace</ion-label>
                        </ion-col>
                        <ion-col size="12" size-md="8">
                            <ion-label class="ion-text-nowrap">{{
                                beacon.namespaceId.toString()
                            }}</ion-label>
                        </ion-col>
                        <ion-col size="12" size-md="4">
                            <ion-label class="key" color="primary">Instance</ion-label>
                        </ion-col>
                        <ion-col size="10" size-md="4">
                            <ion-label class="ion-text-nowrap">{{
                                beacon.instanceId.toString()
                            }}</ion-label>
                        </ion-col>
                    </template>
                    <template v-else-if="beacon instanceof BeaconType.BLEEddystoneTLM">
                        <ion-col size="7">
                            <ion-label class="key" color="primary">Voltage</ion-label>
                        </ion-col>
                        <ion-col size="5">
                            <ion-label>{{ beacon.voltage }} mV</ion-label>
                        </ion-col>
                        <template v-if="beacon.temperature">
                            <ion-col size="7">
                                <ion-label class="key" color="primary">Temperature</ion-label>
                            </ion-col>
                            <ion-col size="5">
                                <ion-label>{{ beacon.temperature.value }} &deg;C</ion-label>
                            </ion-col>
                        </template>
                    </template>
                    <template v-else>
                        <ion-label>
                            <h2>{{ beaconType }}</h2>
                            <p>{{ beacon.uid }}</p>
                        </ion-label>
                    </template>
                </ion-row>
            </ion-grid>
            <ion-toggle
                v-if="simulator"
                slot="end"
                :disabled="sliding"
                aria-label="Toggle advertising of the beacon"
                :checked="beacon.advertising"
                @ionChange="(e) => $emit('simulateToggle', beacon, e.target.checked)"
            ></ion-toggle>
            <ion-label v-else slot="end">
                <h2 class="rssi">{{ beacon.rssi }} <small>dBm</small></h2>
                <small :key="key.value">{{ lastSeen() }}</small>
            </ion-label>
        </ion-item>
        <ion-item-options v-if="simulator && deleteBeacon" @ionSwipe="deleteBeacon">
            <ion-item-option color="danger" expandable @click="deleteBeacon">
                <ion-icon slot="icon-only" name="trash"></ion-icon>
            </ion-item-option>
        </ion-item-options>
    </ion-item-sliding>
</template>

<script lang="ts">
import { Vue, Options, Prop } from 'vue-property-decorator';
import {
    IonItem,
    IonLabel,
    IonThumbnail,
    IonToggle,
    IonGrid,
    IonCol,
    IonRow,
    IonItemSliding,
    IonItemOption,
    IonItemOptions,
    IonIcon,
} from '@ionic/vue';
import {
    BLEBeaconObject,
    BLEiBeacon,
    BLEAltBeacon,
    BLEEddystone,
    BLEEddystoneURL,
    BLEEddystoneUID,
    BLEEddystoneTLM,
} from '@openhps/rf';
import { BLESemBeacon } from '@sembeacon/openhps';
import moment from 'moment';
import { Beacon } from '../../stores/beacon.scanning';
import { Serializable, TimeService } from '@openhps/core';
import { ref } from 'vue';
import { Ref } from 'vue-property-decorator';
import { SimulatedBeacon } from '@/stores/beacon.advertising';
import { User } from '@openhps/rdf';
import { 
    trash
} from 'ionicons/icons';
import { addIcons } from 'ionicons';

addIcons({
    trash
});

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

@Options({
    components: {
        IonItem,
        IonLabel,
        IonThumbnail,
        IonToggle,
        IonGrid,
        IonCol,
        IonRow,
        IonItemSliding,
        IonItemOption,
        IonItemOptions,
        IonIcon,
    },
})
export default class BeaconItemComponent extends Vue {
    readonly User: Serializable<User> = User;
    readonly BeaconType: Record<any, any> = {
        BLESemBeacon,
        BLEEddystoneTLM,
        BLEEddystoneUID,
        BLEEddystone,
        BLEEddystoneURL,
        BLEAltBeacon,
        BLEiBeacon,
    };

    @Prop() beacon: BLEBeaconObject & Beacon & Partial<SimulatedBeacon> & any;
    key = ref(TimeService.now().toString() + Math.random());
    @Prop() simulator: boolean;
    @Prop() disabled: boolean;
    @Ref() item: any;
    sliding: boolean = false;
    deleted: boolean = false;

    get beaconType(): string {
        if (this.beacon instanceof BLESemBeacon) {
            return 'SemBeacon';
        } else if (this.beacon instanceof BLEiBeacon) {
            return 'iBeacon';
        } else if (this.beacon instanceof BLEAltBeacon) {
            return 'AltBeacon';
        } else if (this.beacon instanceof BLEEddystoneURL) {
            return 'Eddystone-URL';
        } else if (this.beacon instanceof BLEEddystoneUID) {
            return 'Eddystone-UID';
        } else if (this.beacon instanceof BLEEddystoneTLM) {
            return 'Eddystone-TLM';
        } else if (this.beacon instanceof BLEEddystone) {
            return 'Eddystone';
        } else {
            return 'Bluetooth';
        }
    }

    get beaconIcon(): string {
        const beaconType = this.beaconType;
        return `/assets/beacons/${beaconType.toLowerCase()}${
            prefersDark.matches ? '_alpha' : ''
        }.svg`;
    }

    lastSeen(): string {
        if (this.beacon.lastSeen === undefined) {
            return '';
        }
        return moment(this.beacon.lastSeen).fromNow();
    }

    mounted() {
        setInterval(() => {
            (this.key as any) = (this.beacon ? this.beacon.uid : '') + TimeService.now();
        }, 500);
    }

    onClick(): void {
        this.$emit('clickBeacon', this.beacon);
    }

    deleteBeacon(): void {
        this.deleted = true;
        setTimeout(() => {
            this.$emit('deleteBeacon', this.beacon);
        }, 600);
    }
}
</script>

<style scoped lang="scss">
span.rssi {
    font-weight: bold;
}

ion-label.key {
    font-weight: bold;
}

ion-thumbnail {
    --size: 36px;
    margin-right: 0.5em;
}

ion-avatar {
    width: 36px;
    height: 36px;
    margin-right: 0.5em;
}

ion-col {
    margin: 0;
    padding: 0;
}

ion-item-sliding {
    height: 100%;
}

ion-item-sliding.item-delete-animation {
    transition:
        opacity 0.2s linear,
        height 0.15s linear 0.15s;
    opacity: 0.001;
    height: 0;
}
ion-label[slot='end'] {
    text-align: right;
}
</style>
