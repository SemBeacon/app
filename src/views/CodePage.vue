<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button></ion-back-button>
                </ion-buttons>

                <ion-title>{{
                    beacon && beacon.displayName ? beacon.displayName : `Beacon code`
                }}</ion-title>
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
import { Beacon, useBeaconStore } from '../stores/beacon.scanning';
import { BLESemBeacon } from '@sembeacon/openhps';
import EditorComponent from '../components/editor/EditorComponent.vue';
import { useRoute } from 'vue-router';
import { useBeaconAdvertisingStore } from '@/stores/beacon.advertising';
import { IriString, RDFSerializer } from '@openhps/rdf';

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
    beaconStore = useBeaconStore();
    code: string = '';
    @Ref('editor') editor: EditorComponent;

    async ionViewDidEnter() {
        const beaconUID = this.route.params.uid as string;
        console.log('Loading beacon code', beaconUID);

        if (this.route.path.startsWith('/beacon/edit')) {
            // Simulated beacon
            const simulatedBeacon = this.beaconSimulatorStore.findByUID(beaconUID);
            const scannedBeacon = await this.beaconStore.findByUID(beaconUID);
            if (!simulatedBeacon && !scannedBeacon) {
                // Can not find beacon...
                console.error(
                    `Tried to load simulated beacon (${beaconUID}) but it can not be found!`,
                );
                this.$router.replace('/beacon/simulator');
                return;
            }
            this.beacon = (
                (simulatedBeacon ?? scannedBeacon) as BLEBeaconObject
            ).clone() as BLEBeaconObject as any;
            const uri = this.beacon.rdf
                ? this.beacon.rdf.uri
                : this.beacon instanceof BLESemBeacon
                  ? this.beacon.resourceUri
                  : 'http://example.com#beacon';
            const serialized = RDFSerializer.serialize(this.beacon, {
                baseUri: uri as IriString,
            });
            RDFSerializer.stringify(serialized, {
                format: 'text/turtle',
                prettyPrint: true,
                prefixes: {
                    sembeacon: 'http://purl.org/sembeacon/',
                },
            }).then((code) => {
                this.code = code;
            });
        }
    }
}
</script>

<style scoped lang="scss">

</style>
