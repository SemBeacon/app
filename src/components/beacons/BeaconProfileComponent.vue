<template>
    <ion-item ref="item" class="beacon-item" button :detail="false" :disabled="disabled">
        <ion-avatar slot="start">
            <img 
                :src="userStore.user.picture"
                @error="(e) => (e.target as HTMLImageElement).src = 'https://ionicframework.com/docs/img/demos/avatar.svg'"
                :alt="`Profile picture of ${userStore.user.name}`"/>
        </ion-avatar>
        <ion-grid style="width: 100%" @click="onClick">
            <ion-row v-if="beacon.displayName">
                <ion-col size="12">
                    <ion-label color="primary-contrast" class="key">{{
                        beacon.displayName
                    }}</ion-label>
                </ion-col>
            </ion-row>
            <ion-row>
                <ion-col size="12" size-md="12">
                    <ion-label>{{ userStore.user.name }}</ion-label>
                </ion-col>
                <ion-col size="12" size-md="12">
                    <ion-label>{{ userStore.webId }}</ion-label>
                </ion-col>
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
    IonAvatar
} from '@ionic/vue';
import { BLESemBeacon } from '@sembeacon/openhps';
import moment from 'moment';
import { Beacon } from '../../stores/beacon.scanning';
import { TimeService } from '@openhps/core';
import { ref } from 'vue';
import { Ref } from 'vue-property-decorator';
import { SimulatedBeacon } from '@/stores/beacon.advertising';
import { useUserStore } from '@/stores/user';
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
        IonAvatar
    },
})
export default class BeaconProfileComponent extends Vue {
    userStore = useUserStore();
    @Prop() beacon: BLESemBeacon & Beacon & Partial<SimulatedBeacon> & any;
    key = ref(TimeService.now().toString() + Math.random());
    @Prop() simulator: boolean;
    @Prop() disabled: boolean;
    @Ref() item: any;
    sliding: boolean = false;

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
