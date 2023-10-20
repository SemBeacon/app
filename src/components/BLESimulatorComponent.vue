<template>
    <ion-content :fullscreen="true">
      <div id="container">
        <ion-list>
          <beacon-item-component 
            v-for="beacon in beacons" 
            :key="beacon.uid"
            :beacon="beacon"
            simulator="true"
          >
          </beacon-item-component>
        </ion-list>
      </div>

      <ion-fab slot="fixed" horizontal="end" vertical="bottom">
        <ion-fab-button @click="addBeacon" color="primary">
          <ion-icon name="add-outline"></ion-icon>
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
import { useBeaconAdvertisingStore } from '../stores/beacon.advertising';
import { computed } from 'vue';

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
  })
})
export default class BLESimulatorComponent extends Vue {
  beaconStore = useBeaconAdvertisingStore();
  beacons = computed(() => Array.from(this.beaconStore.beacons).map(beacon => beacon.object));
  
  addBeacon(): void {

  }
}
</script>

<style scoped lang="scss">
.help-text {
  margin-top: 3em;
  padding-left: 1em;
  padding-right: 1em;
}
</style>