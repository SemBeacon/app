<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button></ion-menu-button>
                </ion-buttons>
                <ion-title>Login to Solid Provider</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <div id="container">
                <ion-list>
                    <ion-item>
                        <ion-label position="stacked" color="primary">Solid Issuer</ion-label>
                        <ion-input 
                            placeholder="Select your issuer"
                            @ionChange="selectedIssuer = $event.detail.value"
                            v-AddListAttributeDirective="'issuers'"
                        >
                        </ion-input>    

                        <datalist id="issuers">
                            <option 
                                v-for="issuer in knownIssuers"
                                :key="issuer"
                                :value="issuer"
                            >
                                {{ issuer }}
                            </option>
                        </datalist>
                    </ion-item>
                </ion-list>

                <ion-row responsive-sm>
                    <ion-col>
                        <ion-button color="primary" expand="block" @click="login()">
                            Login
                        </ion-button>
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
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonRow,
    IonCol,
} from '@ionic/vue';
import { useUserStore } from '../stores/user';
import AddListAttributeDirective from '../directives/AddListAttributeDirective';

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
        IonSelect,
        IonSelectOption,
        IonButton,
        IonRow,
        IonCol,
    },
    directives: {
        AddListAttributeDirective
    }
})
export default class LoginPage extends Vue {
    userStore = useUserStore();
    selectedIssuer?: string;
    knownIssuers = [
        'https://solidweb.org/',
        'https://login.inrupt.com/',
        'https://solidcommunity.net/',
    ];

    mounted(): void {
        if (this.userStore.isLoggedIn) {
            // Redirect
            console.log('Logged in');
            this.$router.replace('/profile');
        }
    }

    login(): void {
        this.userStore.authenticate(this.selectedIssuer);
    }
}
</script>

<style scoped lang="scss"></style>
