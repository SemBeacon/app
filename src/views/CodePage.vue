<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button></ion-back-button>
                </ion-buttons>

                <ion-title>{{ beacon.displayName ?? `Beacon code` }}</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <editor-component ref="editor" :code="code" />
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { Vue, Options, Ref } from 'vue-property-decorator';
import {
    IonContent,
    IonHeader,
    IonBackButton,
    IonPage,
    IonTitle,
    IonButtons,
    IonButton,
    IonToolbar,
} from '@ionic/vue';
import { BLEBeaconObject } from '@openhps/rf';
import { Beacon } from '../stores/beacon.scanning';
import { BLESemBeacon } from '@sembeacon/openhps';
import EditorComponent from '../components/editor/EditorComponent.vue';
import { useRoute } from 'vue-router';
import { useBeaconAdvertisingStore } from '@/stores/beacon.advertising';
import { RDFSerializer } from '@openhps/rdf';

@Options({
    components: {
        IonContent,
        IonHeader,
        IonBackButton,
        IonPage,
        IonTitle,
        IonButtons,
        IonButton,
        IonToolbar,
        EditorComponent,
    },
})
export default class CodePage extends Vue {
    beacon: (BLEBeaconObject | BLESemBeacon) & Beacon = undefined;
    route = useRoute();
    beaconSimulatorStore = useBeaconAdvertisingStore();
    code: string = '';
    @Ref('editor') editor: EditorComponent;

    ionViewDidEnter(): void {
        const beaconUID = this.route.params.uid as string;
        console.log('Loading beacon code', beaconUID);

        if (this.route.path.startsWith('/beacon/edit')) {
            // Simulated beacon
            const beacon = this.beaconSimulatorStore.findByUID(beaconUID);
            if (!beacon) {
                // Can not find beacon...
                console.error(
                    `Tried to load simulated beacon (${beaconUID}) but it can not be found!`,
                );
                this.$router.replace('/beacon/simulator');
                return;
            }
            this.beacon = beacon.clone() as BLEBeaconObject as any;
            RDFSerializer.stringify(this.beacon, {
                format: 'turtle',
                prettyPrint: true,
                prefixes: {
                    sembeacon: 'http://purl.org/sembeacon/',
                },
            }).then((code) => {
                console.log('Updating code');
                this.code = code;
            });
        }
    }
}
</script>

<style scoped lang="scss">

</style>
