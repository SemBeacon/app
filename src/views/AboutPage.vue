<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button></ion-menu-button>
                </ion-buttons>
                <ion-title>About SemBeacon</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <div id="container">
                <ion-content class="ion-padding">
                    <img alt="SemBeacon Logo" class="logo" :src="logoSrc" />

                    <ion-label class="ion-text-wrap">
                        This application was developed for the
                        <a href="https://iot-conference.org/iot2023/">IoT 2023</a> conference to
                        demonstrate the capabilities of SemBeacon. This application will scan for
                        SemBeacon, iBeacon, AltBeacon, Eddystone beacons using the OpenHPS
                        framework.
                    </ion-label>
                    <ion-label class="ion-text-wrap">
                        <picture>
                            <source
                                srcset="/assets/about/sembeacon_specification_v4_2_alpha.svg"
                                media="(prefers-color-scheme: dark)"
                            />
                            <img
                                alt="SemBeacon specification"
                                src="/assets/about/sembeacon_specification_v4_2.svg"
                            />
                        </picture>
                    </ion-label>
                    <ion-label class="ion-text-wrap">
                        The application was developed by Dr. Maxim Van de Wynckel of the
                        Web & Information Systems Engineering lab at the Vrije Universiteit Brussel
                        under the supervision of Prof. Dr. Beat Signer.

                        It is currently being maintained by MVdW-Software.
                    </ion-label>
                </ion-content>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-facing-decorator';
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
    IonSelect,
    IonSelectOption,
    IonButton,
    IonRow,
    IonCol,
} from '@ionic/vue';
import { useSettings } from '@/stores/settings';

@Component({
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
        IonSelect,
        IonSelectOption,
        IonButton,
        IonRow,
        IonCol,
    },
})
export default class AboutPage extends Vue {
    settings = useSettings();

    get logoSrc(): string {
        return this.settings.darkMode ? '/assets/logo/logo_alpha.svg' : '/assets/logo/logo.svg';
    }
}
</script>

<style scoped lang="scss">
.container picture.logo img {
    width: 50%;
}
</style>
