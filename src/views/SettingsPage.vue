<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button></ion-menu-button>
                </ion-buttons>
                <ion-title>Settings</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">

        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-property-decorator';
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
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonRow,
    IonCol,
} from '@ionic/vue';

@Options({
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
        IonSelect,
        IonSelectOption,
        IonButton,
        IonRow,
        IonCol,
    },
})
export default class SettingsPage extends Vue {}
</script>

<style scoped lang="scss">

</style>
