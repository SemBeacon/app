<template>
    <ion-page>
      <ion-header :translucent="true">
        <ion-toolbar color="primary">
          <ion-buttons slot="start">
            <ion-menu-button></ion-menu-button>
          </ion-buttons>
          <ion-title>About SemBeacon</ion-title>
        </ion-toolbar>
      </ion-header>
  
      <ion-content :fullscreen="true">
        <div id="container">
            <ion-content class="ion-padding">
                <picture>
                    <source 
                    srcset="/assets/logo/logo_alpha.svg" 
                    media="(prefers-color-scheme: dark)">
                    <img alt="SemBeacon Logo" src="/assets/logo/logo.svg">
                </picture>
                <ion-label class="ion-text-wrap">
                    This application was developed for the IoT 2023 conference to demonstrate the capabilities for SemBeacon. This application
                    will scan for SemBeacon, iBeacon, AltBeacon, Eddystone beacons using the OpenHPS framework.
                </ion-label>
                <ion-label class="ion-text-wrap">
                    
                </ion-label>
            </ion-content>
        </div>
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
    IonCol
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
        IonCol
    }
})
export default class AboutPage extends Vue {
    
}
</script>

<style scoped lang="scss">
.container picture img {
    width: 50%;
}
</style>