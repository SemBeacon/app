<template>
    <ion-content :fullscreen="true">
      <div id="container">
        <ion-list>
          <ion-item lines="none">
            <ion-label position="stacked" color="primary">Namespace ID</ion-label>
            <ion-input position="stacked" v-model="beacon.namespaceId" :disabled="beaconStore.isAdvertising"></ion-input>
          </ion-item>
          <ion-item lines="none">
            <ion-label position="stacked" color="primary">Instance ID</ion-label>
            <ion-input position="stacked" v-model="beacon.instanceId" :disabled="beaconStore.isAdvertising"></ion-input>
          </ion-item>
          <ion-item lines="none">
            <ion-label position="stacked" color="primary">Short resource URI</ion-label>
            <ion-input position="stacked" v-model="beacon.shortResourceUri" :disabled="beaconStore.isAdvertising"></ion-input>
          </ion-item>
          <!-- <ion-item lines="none">
            <ion-label color="primary">SemBeacon Flags</ion-label>
            <ion-toggle>HAS_POSITION</ion-toggle>
            <ion-toggle>IS_PRIVATE</ion-toggle>
            <ion-toggle>IS_MOVING</ion-toggle>
            <ion-toggle>HAS_SYSTEM</ion-toggle>
            <ion-toggle>HAS_TELEMETRY</ion-toggle>
          </ion-item> -->
        </ion-list>

        <!-- <ion-card>
          <ion-card-header>
            <ion-card-title><ion-icon :icon="logoIonic"></ion-icon> Card Title</ion-card-title>
            <ion-card-subtitle>Card Subtitle</ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            Here's a small text description for the card content. Nothing more, nothing less.
          </ion-card-content>
        </ion-card> -->
      </div>

      <ion-fab slot="fixed" horizontal="end" vertical="bottom">
        <ion-fab-button @click="toggleAdvertising" :color="this.beaconStore.isAdvertising ? 'danger' : 'primary'">
          <ion-icon :name="this.beaconStore.isAdvertising ? 'pause' : 'wifi-outline'"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
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
  IonInput,
  IonLabel,
  IonFab,
  IonFabButton,
  IonSpinner,
  IonIcon,
  IonProgressBar,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonCardSubtitle,
  IonToggle,
} from '@ionic/vue';
import BeaconItemComponent from '../components/beacons/BeaconItemComponent.vue';
import { useBeaconStore } from '../stores/beacon';
import { pause, search } from 'ionicons/icons';

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
    BeaconItemComponent,
    IonFab,
    IonFabButton,
    IonSpinner,
    IonProgressBar,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCardTitle,
    IonCardSubtitle,
    IonInput,
    IonButton,
    IonToggle,
  },
  data: () => ({
    pause,
    search
  })
})
export default class AdvertisingComponent extends Vue {
  beaconStore = useBeaconStore();
  loading = false;
  status: AdvertisingStatus;
  beacon: any = {
      namespaceId: "77f340db-ac0d-20e8-aa3a-f656a29f236c",
      instanceId: "9c7ce6fc",
      shortResourceUri: "https://bit.ly/3JsEnF9"
  };

  toggleAdvertising(): void {
    if (this.beaconStore.isAdvertising) {
      this.beaconStore.stopAdvertising();
    } else {
      this.beaconStore.startAdvertising(this.beacon);
    }
  }
}

enum AdvertisingStatus {

}
</script>

<style scoped lang="scss">

</style>