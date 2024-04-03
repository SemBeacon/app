<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button color="light"></ion-menu-button>
                </ion-buttons>
                <ion-title>Profile</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true" v-if="userStore.user">
            <div id="container">
                <ion-row>
                    <ion-col>
                        <ion-avatar>
                            <img 
                                :src="userStore.user.picture"
                                alt="Silhouette of a person's head" 
                                on-error="https://ionicframework.com/docs/img/demos/avatar.svg" />
                        </ion-avatar>
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <ion-input 
                            label="Name" label-placement="stacked"
                            fill="outline"
                            :value="userStore.user.name"
                        >
                        </ion-input> 
                    </ion-col>
                </ion-row>
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
    IonInput,
    IonItem,
    IonLabel,
    IonRow,
    IonCol,
} from '@ionic/vue';
import { useUserStore } from '../stores/user';

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
        IonRow,
        IonCol,
        IonInput
    },
})
export default class ProfilePage extends Vue {
    userStore = useUserStore();

    mounted(): void {
    }
}
</script>

<style scoped lang="scss"></style>
