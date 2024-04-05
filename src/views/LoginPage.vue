<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button></ion-back-button>
                </ion-buttons>
                <ion-title>Log in to your Solid Pod</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <div id="container">
                <ion-row responsive-sm>
                    <ion-col size="12">
                        <img alt="Solid Project logo" class="logo" src="/assets/logo/solid-logo.svg" />
                    </ion-col>
                </ion-row>
                <ion-row responsive-sm>
                    <ion-col>
                        <ion-input 
                            label="Your ID provider" label-placement="stacked"
                            placeholder="Select your ID provider"
                            fill="outline"
                            helper-text="A Solid issuer is a service that provides you with a Solid Pod."
                            @ionChange="selectedIssuer = $event.detail.value"
                            v-AddListAttributeDirective="'issuers'"
                            v-on:enter="login()"
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
                        <ion-checkbox v-model="remember" label-placement="end">Remember me</ion-checkbox>
                    </ion-col>
                </ion-row>

                <ion-row responsive-sm>
                    <ion-col>
                        <ion-card color="secondary" class="info-card">
                            <ion-card-content>
                                <ion-row>
                                    <ion-col size="auto">
                                        <ion-icon name="information-circle-outline"></ion-icon>
                                    </ion-col>
                                    <ion-col>
                                        If this box is checked, SemBeacon will request a refresh token and use it to automatically refresh your 
                                        access token when it expires.
                                    </ion-col>
                                </ion-row>
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                </ion-row>

                <ion-row responsive-sm>
                    <ion-col>
                        <ion-button 
                            href="https://solidweb.org/register" 
                            target="_blank"
                            shape="round" color="primary" fill="outline" expand="block">
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
                        <a 
                            href="https://solidproject.org/users/get-a-pod"
                            target="_blank"
                        ><ion-icon name="information-circle-outline"></ion-icon> Click here for more info about Solid</a>
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
    IonAvatar,
    IonPage,
    IonTitle,
    IonToolbar,
    IonLabel,
    IonSelect,
    IonCheckbox,
    IonSelectOption,
    IonButton,
    IonRow,
    IonBackButton,
    IonCol,
} from '@ionic/vue';
import { useUserStore } from '../stores/user';
import AddListAttributeDirective from '../directives/AddListAttributeDirective';

@Options({
    components: {
        IonAvatar,
        IonButtons,
        IonContent,
        IonHeader,
        IonBackButton,
        IonPage,
        IonTitle,
        IonToolbar,
        IonCheckbox,
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
    remember: boolean;

    mounted(): void {
        this.userStore.once('login', () => {
            if (this.userStore.isLoggedIn) {
                // Redirect
                console.log('Logged in');
                this.$router.replace("/");
            } else {
                console.log('Not logged in');
            }
        });
    }

    login(): void {
        this.userStore.authenticate(this.selectedIssuer, this.remember);
    }
}
</script>

<style scoped lang="scss">
ion-toolbar {
    --background: transparent;
}

ion-toolbar {
  --background: transparent no-repeat fixed center;
  --color: black;
  position: absolute;
  top: 0;
}

#container {
    padding: 1em;
    padding-top: 3em;
}

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

.info-card {
    color: #04004d;
    margin: 0;

    ion-col[size="auto"] {
        width: 30px;
    }
}

.info-card ion-icon[name='information-circle-outline'] {
    zoom: 1.5;
}
</style>
