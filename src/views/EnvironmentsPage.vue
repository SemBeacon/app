<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button></ion-menu-button>
                </ion-buttons>

                <ion-title>Environments</ion-title>
            </ion-toolbar>
        </ion-header>
    </ion-page>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-facing-decorator';
import {
    IonButtons,
    IonContent,
    IonHeader,
    IonMenuButton,
    IonPage,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonInput,
    IonLabel,
    IonSpinner,
    IonIcon,
    IonButton,
} from '@ionic/vue';
import BeaconItemComponent from '@/components/beacons/BeaconItemComponent.vue';
import { useEnvironmentStore } from '@/stores/environment';

@Component({
    components: {
        IonButtons,
        IonContent,
        IonHeader,
        IonMenuButton,
        IonPage,
        IonTitle,
        IonToolbar,
        IonList,
        IonItem,
        IonLabel,
        BeaconItemComponent,
        IonSpinner,
        IonIcon,
        IonInput,
        IonButton,
    }
})
export default class EnvironmentsPage extends Vue {
    isLoading: boolean = true;
    environmentsStore = useEnvironmentStore();

    beforeMount() {
        this.isLoading = true;
    }

    mounted() {
        this.isLoading = false;
    }
}
</script>

<style scoped lang="scss">
.help-text {
    margin-top: 3em;
    padding-left: 1em;
    padding-right: 1em;
}
</style>
