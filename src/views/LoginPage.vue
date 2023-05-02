<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Login to Solid Provider</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div id="container">
        <ion-list>
          <ion-item>
            <ion-label position="stacked" color="primary">Solid Issuer</ion-label>
            <ion-select 
              @ionChange="selectedIssuer = $event.detail.value"
              aria-label="provider" 
              interface="popover"
              placeholder="Select your Issuer"
            >
              <ion-select-option 
                v-for="issuer in knownIssuers" 
                :value="issuer"
                :key="issuer"
              >
              {{ issuer }}
              </ion-select-option>
            </ion-select>
          </ion-item>
        </ion-list>

        <ion-row responsive-sm>
          <ion-col>
            <ion-button 
              @click="login()" 
              color="primary" 
              expand="block"
            >
              Login
            </ion-button>
          </ion-col>
        </ion-row>
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
      IonLabel,
      IonSelect,
      IonSelectOption,
      IonButton,
      IonRow,
      IonCol
    }
  })
  export default class LoginPage extends Vue {
    userStore = useUserStore();
    selectedIssuer?: string;
    knownIssuers = [
      "https://solidweb.org/",
      "https://login.inrupt.com/",
      "https://solidcommunity.net/"
    ];

    mounted(): void {
      if (this.userStore.isLoggedIn) {
        // Redirect
        console.log("Logged in");
        this.$router.replace("/profile");
      }
    }

    login(): void {
      this.userStore.authenticate(this.selectedIssuer);
    }
  }
  </script>
  
  <style scoped lang="scss">
  
  </style>