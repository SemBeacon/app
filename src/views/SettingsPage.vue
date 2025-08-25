<template>
    <ion-page>
        <ion-header>
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
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonRow,
    IonCol,
} from '@ionic/vue';

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
