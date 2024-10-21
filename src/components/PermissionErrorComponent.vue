<template>
    <ion-item button="false" color="danger">
        <ion-label class="ion-text-center ion-text-wrap">
            <h2><slot></slot></h2>
        </ion-label>

        <ion-button
            slot="end"
            fill="clear"
            size="default"
            :style="{
                marginLeft: '0.5em',
                marginRight: '0.5em',
                color: '#ffffff',
                fontWeight: 'bold',
            }"
            class="ion-text-uppercase"
            @click="onClick"
        >
            Edit
        </ion-button>
    </ion-item>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-facing-decorator';
import { IonItem, IonLabel, IonButton } from '@ionic/vue';
import { NativeSettings, AndroidSettings, IOSSettings } from 'capacitor-native-settings';

@Component({
    components: {
        IonItem,
        IonLabel,
        IonButton,
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