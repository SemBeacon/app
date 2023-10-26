<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>

        <ion-title>Beacon</ion-title>

        <ion-buttons v-if="!isLoading" slot="end">
          <ion-button
            v-if="beaconStore.cacheSize !== 0"
            icon-only
            :style="{ color: '#ffffff' }"
            @click="scannerComponent.sort"
          >
            <ion-icon name="funnel"></ion-icon>
          </ion-button>
          <ion-button
            v-if="beaconStore.cacheSize !== 0"
            icon-only
            :style="{ color: '#ffffff' }"
            @click="scannerComponent.clearCache"
          >
            <ion-icon name="trash-bin"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

      <ion-toolbar class="tab-selector">
        <ion-segment :value="$route.path" @ionChange="(e) => $router.replace(e.target.value)">
          <ion-segment-button value="/beacon/scanner">
            <ion-label>Scanner</ion-label>
          </ion-segment-button>
          <ion-segment-button value="/beacon/simulator">
            <ion-label>Simulator</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <BLEScannerComponent ref="scannerComponent"></BLEScannerComponent>

    <ion-tab-bar slot="bottom" class="tab-selector">
      <ion-tab-button tab="scanner" href="/beacon/scanner">
        <ion-icon icon="search" />
        <ion-label>Scanner</ion-label>
      </ion-tab-button>

      <ion-tab-button tab="simulator" href="/beacon/simulator">
        <ion-icon icon="wifi" />
        <ion-label>Simulator</ion-label>
      </ion-tab-button>
    </ion-tab-bar>
  </ion-page>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-property-decorator';
import BLEScannerComponent from '../components/BLEScannerComponent.vue';
import {
  IonTabBar,
  IonTabButton,
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
  IonSegment,
  IonSegmentButton,
  IonButton,
} from '@ionic/vue';
import BeaconItemComponent from '../components/beacons/BeaconItemComponent.vue';
import { useBeaconStore } from '../stores/beacon.scanning';
import { Capacitor } from '@capacitor/core';
import { Ref } from 'vue-property-decorator';

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
    IonSegment,
    IonSegmentButton,
    IonInput,
    IonButton,
    IonTabBar,
    IonTabButton,
    BLEScannerComponent,
  },
  data: () => ({}),
})
export default class BeaconsPage extends Vue {
  isLoading: boolean = true;
  beaconStore = useBeaconStore();
  platform = Capacitor.getPlatform();
  @Ref() scannerComponent: BLEScannerComponent;

  beforeMount() {
    this.isLoading = true;
  }

  mounted() {
    this.isLoading = false;
  }
}
</script>

<style scoped lang="scss">
ion-header ion-toolbar:first-child {
  margin-bottom: -1px;
}
.help-text {
  margin-top: 3em;
  padding-left: 1em;
  padding-right: 1em;
}

ion-tab-bar.tab-selector.md {
  display: none;
}

ion-toolbar.tab-selector.ios {
  display: none;
}
</style>
