<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>Beacon Scanner</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div id="container">
        <ion-list>
            <ion-item v-for="item in items.values()" :key="item.uid">
                <ion-label>
                  <h2>{{ item.displayName }}</h2>
                  <p>{{ item.uid }}</p>
                </ion-label>
                <ion-label slot="end">
                  <small>{{ item.rssi }}</small>
                </ion-label>
            </ion-item>
        </ion-list>
      </div>
    </ion-content>
  </ion-page>
</template>


<script lang="ts">
import { Vue, Options } from 'vue-property-decorator';
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonList, IonItem, IonLabel } from '@ionic/vue';

@Options({
  components: {
    IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonList, IonItem, IonLabel
  }
})
export default class BluetoothPage extends Vue {
  items: Map<string, any> = new Map();
}
</script>

<style scoped lang="scss">

</style>