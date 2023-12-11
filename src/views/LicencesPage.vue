<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button></ion-menu-button>
                </ion-buttons>
                <ion-title>Licenses</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <ion-list>
                <ion-item-group>
                    <ion-item-divider>
                        <ion-label>Map Licenses</ion-label>
                    </ion-item-divider>
                    <ion-item>
                        <ion-label></ion-label>
                    </ion-item>
                </ion-item-group>
                <ion-item-group>
                    <ion-item-divider>
                        <ion-label>Open Source Licenses</ion-label>
                    </ion-item-divider>
                    <ion-item>
                        <ion-label>OpenHPS</ion-label>
                    </ion-item>
                </ion-item-group>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-property-decorator';
import {
    IonButtons,
    IonItemGroup,
    IonItemDivider,
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
        IonItemGroup,
        IonItemDivider,
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
export default class AttributionsPage extends Vue {}
</script>

<style scoped lang="scss">

</style>
