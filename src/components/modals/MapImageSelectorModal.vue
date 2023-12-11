<template>
    <ion-modal ref="modal" :isOpen="open" @willDismiss="onWillDismiss">
      <ion-header>
        <ion-toolbar>
          <ion-title>Upload floor plan</ion-title>
          <ion-buttons slot="end">
            <ion-button :strong="true" @click="confirm()">Upload</ion-button>
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
    IonItem,
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
        IonItem,
    },
})
export default class MapImageSelectorModal extends Vue {
  open = false;

  cancel(): void {

  }

  show(): void {
    this.open = true;
  }
  
  confirm(): void {

  }

  onWillDismiss(): void {

  }
}
</script>

<style scoped>
ion-modal {
  --max-height: 50%;
  --border-radius: 16px;
  --box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

ion-modal::part(backdrop) {
  background: rgba(209, 213, 219);
  opacity: 1;
}

ion-modal ion-toolbar {
  --background: var(--ion-color-primary);
  --color: white;
}
</style>