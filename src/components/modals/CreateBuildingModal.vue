<template>
    <ion-modal ref="modal" :is-open="open" @willDismiss="onWillDismiss">
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button :strong="true" @click="cancel()">Cancel</ion-button>
                </ion-buttons>
                <ion-title>Create building</ion-title>
                <ion-buttons slot="end">
                    <ion-button :strong="true" @click="confirm()">Create</ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <ion-item>
                <ion-input
                    label="Enter the building name"
                    label-placement="stacked"
                    type="text"
                    placeholder="Building name"
                ></ion-input>
            </ion-item>
            <ion-item>
                <map-component class="map" ref="mapRef">
                </map-component>
            </ion-item>
        </ion-content>
    </ion-modal>
</template>

<script lang="ts">
import { Vue, Options, Ref } from 'vue-property-decorator';
import {
    IonModal,
    IonContent,
    IonButton,
    IonButtons,
    IonTitle,
    IonToolbar,
    IonInput,
    IonHeader,
    IonItem,
} from '@ionic/vue';
import { Map as OlMap } from 'ol';
import { useSettings } from '../../stores/settings';
import MapComponent from '../map/MapComponent.vue';

@Options({
    components: {
        IonModal,
        IonContent,
        IonButton,
        IonButtons,
        IonTitle,
        IonToolbar,
        IonInput,
        IonHeader,
        IonItem,
        MapComponent
    },
})
export default class CreateBuildingModal extends Vue {
    settings = useSettings();
    @Ref() mapRef?: { map: OlMap };
    open = false;

    cancel(): void {
        this.open = false;
    }

    show(): void {
        this.open = true;
    }

    confirm(): void {}

    onWillDismiss(): void {}
}
</script>

<style scoped>
ion-modal {
    --max-height: 80%;
    --border-radius: 16px;
    --box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

ion-modal::part(backdrop) {
    background: rgba(209, 213, 219);
    opacity: 1;
}

ion-modal ion-toolbar {
    --background: var(--ion-color-primary);
    --color: white;
}

ion-modal .map {
    min-height: 300px;
}
</style>