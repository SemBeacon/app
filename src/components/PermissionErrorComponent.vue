<template>
    <ion-item button="false" color="danger">
        <ion-label class="ion-text-center ion-text-wrap">
          <h2><slot></slot></h2>
        </ion-label>

        <ion-button 
            @click="onClick" 
            fill="clear"
            size="default" 
            slot="end" 
            :style="{
                marginLeft: '0.5em',
                marginRight: '0.5em',
                color: '#ffffff',
                fontWeight: 'bold'
            }"
            class="ion-text-uppercase">
          Edit
        </ion-button>
    </ion-item>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-property-decorator';
import {
  IonItem, IonLabel,
} from '@ionic/vue';
import { NativeSettings, AndroidSettings, IOSSettings } from 'capacitor-native-settings';

@Options({
  components: {
    IonItem, IonLabel
  },
})
export default class PermissionErrorComponent extends Vue {
    onClick(): void {
        NativeSettings.open({
            optionAndroid: AndroidSettings.ApplicationDetails,
            optionIOS: IOSSettings.App,
        });
    }
}
</script>