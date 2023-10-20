<template>
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
import { useBeaconAdvertisingStore } from '../../stores/beacon.advertising';
import { stop, search } from 'ionicons/icons';

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
    stop,
    search
  })
})
export default class SemBeaconBuilderComponent extends Vue {
  beaconStore = useBeaconAdvertisingStore();
  beacon: any = {
      namespaceId: "77f340db-ac0d-20e8-aa3a-f656a29f236c",
      instanceId: "9c7ce6fc",
      shortResourceUri: "https://bit.ly/3JsEnF9"
  };
}
</script>

<style scoped lang="scss">
</style>