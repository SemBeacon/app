<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Beacon</ion-title>
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
import { useRoute } from 'vue-router';
import { BLEBeaconObject } from '@openhps/rf';
import { useBeaconStore } from '../stores/beacon';

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
export default class BeaconPage extends Vue {
  route = useRoute();
  beaconStore = useBeaconStore();
  beacon: BLEBeaconObject;

  mounted(): void {
    const beaconUID = this.route.params.uid as string;
    this.beaconStore.findByUID(beaconUID).then(beacon => {
      this.beacon = beacon;
    });
  }
}
</script>

<style scoped lang="scss">

</style>