<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>

        <ion-title>Beacon</ion-title>

        <ion-buttons slot="end" v-if="!isLoading">
          <template v-if="$route.path === '/beacon/scanner'">
            <ion-button 
              icon-only 
              :style="{ color: '#ffffff' }"
              v-if="currentTab().beaconStore.cacheSize !== 0" 
              @click="currentTab().sort"
            >
              <ion-icon name="funnel"></ion-icon>
            </ion-button>
            <ion-button 
              icon-only 
              :style="{ color: '#ffffff' }"
              v-if="currentTab().beaconStore.cacheSize !== 0" 
              @click="currentTab().clearCache"
            >
              <ion-icon name="trash-bin"></ion-icon>
            </ion-button>
          </template>
          <template v-else-if="$route.path === '/beacon/simulator'">
            <ion-button 
              icon-only 
              :style="{ color: '#ffffff', fontSize: '1.2em' }"
              v-if="currentTab().beaconStore.advertisingBeacons.length > 0" 
              @click="currentTab().stopAdvertising"
            >
              <b-icon-wifi-off></b-icon-wifi-off>
            </ion-button>
          </template>
        </ion-buttons>
      </ion-toolbar>

      <ion-toolbar color="primary" class="tab-selector">
        <ion-segment :value="$route.path" @ionChange="e => $router.push(e.target.value)">
          <ion-segment-button value="/beacon/scanner">
            <ion-label>Scanner</ion-label>
          </ion-segment-button>
          <ion-segment-button value="/beacon/simulator">
            <ion-label>Simulator</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-tabs style="position: none">
        <ion-router-outlet ref="tab" animated="false"></ion-router-outlet>
        <ion-tab-bar class="tab-selector" slot="bottom">
          <ion-tab-button tab="scanner" href="/beacon/scanner">
            <ion-icon icon="search"/>
            <ion-label>Scanner</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="simulator" href="/beacon/simulator">
            <ion-icon icon="wifi"/>
            <ion-label>Simulator</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>
    </ion-content>
  </ion-page>
</template>


<script lang="ts">
import { Vue, Options } from 'vue-property-decorator';
import BLESimulatorComponent from '../components/BLESimulatorComponent.vue';
import BLEScannerComponent from '../components/BLEScannerComponent.vue';
import { 
  IonRouterOutlet,
  IonTabs,
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
import { useBeaconAdvertisingStore } from '../stores/beacon.advertising';
import { Capacitor } from '@capacitor/core';
import { Ref } from 'vue-property-decorator';

@Options({
  components: {
    IonRouterOutlet,
    IonTabs,
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
    BLESimulatorComponent,
  },
  data: () => ({

  })
})
export default class BeaconsPage extends Vue {
  isLoading: boolean = true;
  beaconStore = useBeaconStore();
  beaconAdvertisingStore = useBeaconAdvertisingStore();
  platform = Capacitor.getPlatform();
  @Ref("tab") tab: any;

  currentTab(): BLEScannerComponent | BLESimulatorComponent {
    return this.tab.components.find(c => c.id === this.tab.id).vueComponentRef.value;
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