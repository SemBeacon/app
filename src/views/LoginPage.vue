<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button></ion-menu-button>
                </ion-buttons>
                <ion-title>Sign in</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <div id="container">
                <ion-row responsive-sm>
                    <ion-col md="12">
                        <img alt="Solid Project logo" class="logo" src="/assets/logo/solid-logo.svg" />
                    </ion-col>
                </ion-row>
                <ion-row responsive-sm>
                    <ion-col>
                        <ion-input 
                            label="Solid Issuer" label-placement="stacked"
                            placeholder="Select your issuer"
                            fill="outline"
                            helper-text="A Solid issuer is a service that provides you with a Solid Pod."
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
                    </ion-col>
                </ion-row>

                <ion-row responsive-sm>
                    <ion-col>
                        <ion-button href="https://solidweb.org/register" shape="round" color="primary" fill="outline" expand="block">
                            Sign up
                        </ion-button>
                    </ion-col>
                    <ion-col>
                        <ion-button shape="round" color="primary" expand="block" @click="login()">
                            <ion-icon name="log-in-outline"></ion-icon>&nbsp;Sign in
                        </ion-button>
                    </ion-col>
                </ion-row>
                <ion-row responsive-sm>
                    <ion-col class="ion-text-center">
                        <a href="https://solidproject.org/users/get-a-pod"><ion-icon name="information-circle-outline"></ion-icon> Click here for more info about Solid</a>
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

<style scoped lang="scss">
img.logo {
    margin-top: 2em;
    margin-left: auto;
    margin-right: auto;
    display: block;
    height: 100px;
    width: 100px;
    margin-bottom: 2em;
    object-fit: contain;
}
</style>
