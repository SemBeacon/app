<template>
    <ion-page>
      <ion-header :translucent="true">
        <ion-toolbar color="primary">
          <ion-buttons slot="start">
            <ion-back-button></ion-back-button>
          </ion-buttons>
          <ion-title>test</ion-title>
        </ion-toolbar>
      </ion-header>
  
      <ion-content :fullscreen="true">
        <div id="container">
          
  
                
          <ion-fab slot="fixed" horizontal="end" vertical="bottom">
            <ion-fab-button @click="addBeacon" :color="this.beaconStore.isScanning ? 'danger' : 'primary'">
              <ion-icon name="plus"></ion-icon>
            </ion-fab-button>
          </ion-fab>
        </div>
      </ion-content>
    </ion-page>
  </template>
  
  
  <script lang="ts">
  import { Vue, Options } from 'vue-property-decorator';
  import { 
    IonChip,
    IonButtons, 
    IonContent, 
    IonHeader, 
    IonBackButton, 
    IonPage, 
    IonTitle, 
    IonToolbar, 
    IonList, 
    IonItem, 
    IonLabel,
    IonFab,
    IonFabButton,
    IonSpinner,
    IonButton,
    IonIcon
  } from '@ionic/vue';

  @Options({
    components: {
      IonButtons, 
      IonContent, 
      IonHeader, 
      IonBackButton, 
      IonPage, 
      IonTitle, 
      IonToolbar, 
      IonList, 
      IonItem, 
      IonLabel,
      IonFab,
      IonFabButton,
      IonSpinner,
      IonChip,
      IonButton,
      IonIcon
    },
    data: () => ({

    })
  })
  export default class BeaconBuilderPage extends Vue {
    
  }
  </script>
  
  <style scoped lang="scss">

  </style>