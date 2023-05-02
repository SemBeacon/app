<template>
    <ion-page>
      <ion-header :translucent="true">
        <ion-toolbar color="primary">
          <ion-buttons slot="start">
            <ion-menu-button color="light"></ion-menu-button>
          </ion-buttons>
          <ion-title>Profile</ion-title>
        </ion-toolbar>
      </ion-header>
  
      <ion-content :fullscreen="true">
        <div id="container">
  
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
  } from '@ionic/vue';
  import { useUserStore } from '@/stores/user';

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
      IonLabel
    }
  })
  export default class ProfilePage extends Vue {
    userStore = useUserStore();
    
    mounted(): void {
        
    }
  }
  </script>
  
  <style scoped lang="scss">
  
  </style>