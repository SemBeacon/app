<template>
    <ion-modal ref="modal" trigger="open-modal" @willDismiss="onWillDismiss">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button @click="cancel()">Cancel</ion-button>
          </ion-buttons>
          <ion-title>Welcome</ion-title>
          <ion-buttons slot="end">
            <ion-button :strong="true" @click="confirm()">Confirm</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-input
            label="Enter your name"
            label-placement="stacked"
            ref="input"
            type="text"
            placeholder="Your name"
          ></ion-input>
        </ion-item>
      </ion-content>
    </ion-modal>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-property-decorator';
import {
    IonModal,
    IonContent,
    IonButton,
    IonButtons,
    IonTitle,
    IonToolbar,
    IonInput,
    IonHeader,
} from '@ionic/vue';

@Options({
    components: {
        IonModal,
        IonContent,
        IonButton,
        IonButtons,
        IonTitle,
        IonToolbar,
        IonInput,
        IonHeader,
    },
})
export default class MapImageSelectorModal extends Vue {

}
</script>