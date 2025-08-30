<template>
    <ion-page>
        <ion-header>
            <ion-toolbar id="login-toolbar">
                <ion-buttons slot="start">
                    <ion-back-button></ion-back-button>
                </ion-buttons>
                <ion-title>Sign in to your Solid Pod</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <div id="container">
                <ion-row responsive-sm>
                    <ion-col size="12">
                        <picture>
                            <source
                                srcset="/assets/logo/login_alpha.svg"
                                media="(prefers-color-scheme: dark)"
                            />
                            <img
                                alt="Solid Project logo"
                                class="logo"
                                src="/assets/logo/login.svg"
                            />
                        </picture>
                    </ion-col>
                </ion-row>
                <ion-row responsive-sm>
                    <ion-col>
                        <ion-input
                            v-AddListAttributeDirective="'issuers'"
                            :disabled="loading"
                            type="url"
                            label="Your ID provider"
                            label-placement="stacked"
                            placeholder="Select your ID provider"
                            fill="outline"
                            helper-text="A Solid ID provider is a service that provides you with a Solid Pod."
                            @keyup.enter="login()"
                            @change="onIssuerChange"
                        >
                        </ion-input>

                        <datalist id="issuers">
                            <option v-for="issuer in knownIssuers" :key="issuer" :value="issuer">
                                {{ issuer }}
                            </option>
                        </datalist>
                    </ion-col>
                </ion-row>

                <ion-row responsive-sm>
                    <ion-col>
                        <ion-button
                            :disabled="loading"
                            href="https://solidweb.org/register"
                            target="_blank"
                            shape="round"
                            color="primary"
                            fill="outline"
                            expand="block"
                        >
                            Sign up
                        </ion-button>
                    </ion-col>
                    <ion-col>
                        <ion-button
                            :disabled="loading"
                            shape="round"
                            color="primary"
                            expand="block"
                            @click="login()"
                        >
                            <ion-icon name="log-in-outline"></ion-icon>&nbsp;Sign in
                        </ion-button>
                    </ion-col>
                </ion-row>
                <ion-row responsive-sm>
                    <ion-col class="ion-text-center">
                        <a href="https://solidproject.org/users/get-a-pod" target="_blank"
                            ><ion-icon name="information-circle-outline"></ion-icon> Click here for
                            more info about Solid</a
                        >
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
                                        SemBeacon will retrieve your Solid Pod's WebID and use it to
                                        fetch your profile data. The application will not store data
                                        in your Pod unless you explicitly allow it.
                                    </ion-col>
                                </ion-row>
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                </ion-row>
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
    toastController,
} from '@ionic/vue';
import { useUserStore } from '@/stores/user';
import AddListAttributeDirective from '@/directives/AddListAttributeDirective';
import { StatusBar, Animation } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { logInOutline, informationCircleOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

addIcons({
    logInOutline,
    informationCircleOutline,
});

@Component({
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
        AddListAttributeDirective,
    },
})
export default class LoginPage extends Vue {
    userStore = useUserStore();
    selectedIssuer?: string;
    knownIssuers = [
        'https://solidweb.org/',
        'https://login.inrupt.com/',
        'https://solidcommunity.net/',
        'https://datapod.igrant.io/',
        'https://solid.redpencil.io/'
    ];
    remember: boolean = true;
    loading: boolean = false;

    onIssuerChange(event: CustomEvent) {
        this.selectedIssuer = (event.target as HTMLInputElement).value;
    }

    async created() {
        this.userStore.on('error', (error) => {
            toastController
                .create({
                    message: error,
                    duration: 5000,
                    color: 'danger',
                })
                .then((toast) => {
                    toast.present();
                });
        });
        this.userStore.on('login', () => {
            if (this.userStore.isLoggedIn) {
                // Redirect
                console.log('Logged in');
                this.$router.replace('/');
            } else {
                console.log('Not logged in');
            }
        });
        this.userStore.handleLogin();
    }

    async mounted() {
        if (Capacitor.getPlatform() !== 'web') {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            await StatusBar.setBackgroundColor({
                color: isDark ? '#222428' : '#ffffff', // Use dark or light background color
            });
        }
    }

    async unmounted() {
        if (Capacitor.getPlatform() !== 'web') {
            await StatusBar.setBackgroundColor({
                color: '#363795',
            });
        }
    }

    login(): void {
        this.loading = true;
        console.log(`Logging in with ${this.selectedIssuer ?? 'default provider'}`);
        toastController
            .create({
                message: `Logging in with ${this.selectedIssuer ?? 'default provider'}`,
                duration: 5000,
                color: 'light',
            })
            .then((toast) => {
                toast.present();
            });
        this.userStore.authenticate(this.selectedIssuer, this.remember).finally(() => {
            this.loading = false;
        });
    }
}
</script>

<style scoped lang="scss">
ion-toolbar {
    --background: transparent;
}

body.dark ion-toolbar {
    --background: transparent no-repeat fixed center;
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
    height: 80px;
    max-width: 100%;
    margin-bottom: 2em;
    object-fit: contain;
}

.info-card {
    color: #04004d;
    margin: 0;

    ion-col[size='auto'] {
        width: 30px;
    }
}

.info-card ion-icon[name='information-circle-outline'] {
    zoom: 1.5;
}

#login-toolbar ion-back-button {
    --color: black;
}

.dark #login-toolbar ion-back-button {
    --color: white;
}
</style>
