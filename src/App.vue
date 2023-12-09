<template>
    <ion-app>
        <ion-split-pane content-id="main-content">
            <ion-menu content-id="main-content" type="overlay">
                <ion-content>
                    <ion-list id="menu-list">
                        <ion-list-header>
                            <picture>
                                <source
                                    srcset="/assets/logo/logo_alpha.svg"
                                    media="(prefers-color-scheme: dark)"
                                />
                                <img alt="SemBeacon Logo" src="/assets/logo/logo.svg" />
                            </picture>
                        </ion-list-header>

                        <ion-menu-toggle v-for="(p, i) in appPages" :key="i" auto-hide="false">
                            <ion-item
                                router-direction="root"
                                :router-link="p.url"
                                lines="none"
                                detail="false"
                                class="hydrated"
                                :class="{ selected: $route.name === p.name }"
                            >
                                <ion-icon
                                    slot="start"
                                    aria-hidden="true"
                                    :ios="p.iosIcon"
                                    :md="p.mdIcon"
                                ></ion-icon>
                                <ion-label>{{ p.title }}</ion-label>
                            </ion-item>
                        </ion-menu-toggle>

                        <ion-menu-toggle auto-hide="false">
                            <ion-item
                                v-if="info.version"
                                :key="JSON.stringify(info)"
                                lines="none"
                                detail="false"
                                class="hydrated"
                                disabled="true"
                            >
                                <ion-label>v{{ info.version }} build: {{ info.build }}</ion-label>
                            </ion-item>
                        </ion-menu-toggle>
                    </ion-list>
                </ion-content>
            </ion-menu>

            <ion-router-outlet id="main-content"></ion-router-outlet>
        </ion-split-pane>
    </ion-app>
</template>

<script lang="ts">
import '@openhps/rf';
import '@openhps/geospatial';
import 'reflect-metadata';
import { Vue, Options } from 'vue-property-decorator';
import {
    IonApp,
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonMenu,
    IonMenuToggle,
    IonNote,
    IonRouterOutlet,
    IonSplitPane,
} from '@ionic/vue';
import {
    map,
    bluetooth,
    //  logIn,
    help,
    wifiOutline,
} from 'ionicons/icons';

import { useBeaconStore } from './stores/beacon.scanning';
import { useUserStore } from './stores/user';
import { useLogger } from './stores/logger';

import { Animation, StatusBar, Style } from '@capacitor/status-bar';
import { App as CapacitorApp, URLOpenListenerEvent, AppInfo } from '@capacitor/app';
import { RDFSerializer } from '@openhps/rdf';
import { Capacitor } from '@capacitor/core';
import { useBeaconAdvertisingStore } from './stores/beacon.advertising';
import { useGeolocationStore } from './stores/geolocation';
import moment from 'moment';
import { ControllerState } from './stores/types';
import { SplashScreen } from '@capacitor/splash-screen';

@Options({
    components: {
        IonApp,
        IonContent,
        IonIcon,
        IonItem,
        IonLabel,
        IonList,
        IonListHeader,
        IonMenu,
        IonMenuToggle,
        IonNote,
        IonRouterOutlet,
        IonSplitPane,
    },
})
export default class App extends Vue {
    beaconStore = useBeaconStore();
    beaconSimulatorStore = useBeaconAdvertisingStore();
    geolocationStore = useGeolocationStore();
    userStore = useUserStore();
    logger = useLogger();
    info: AppInfo = {} as any;
    isLoading: boolean = false;

    appPages = [
        {
            name: 'scanner',
            title: 'Scanner',
            url: '/beacon/scanner',
            iosIcon: bluetooth,
            mdIcon: bluetooth,
        },
        {
            name: 'simulator',
            title: 'Simulator',
            url: '/beacon/simulator',
            iosIcon: wifiOutline,
            mdIcon: wifiOutline,
        },
        {
            name: 'map',
            title: 'Beacon map',
            url: '/map',
            iosIcon: map,
            mdIcon: map,
        },
        // {
        //   title: 'Solid Login',
        //   url: '/Login',
        //   iosIcon: logIn,
        //   mdIcon: logIn,
        // },
        {
            name: 'about',
            title: 'About',
            url: '/about',
            iosIcon: help,
            mdIcon: help,
        },
    ];

    handlePermissions(): Promise<void> {
        return new Promise((resolve) => {
            if (
                !this.isLoading &&
                (this.beaconStore.state !== ControllerState.READY ||
                    this.beaconSimulatorStore.state !== ControllerState.READY) &&
                this.beaconStore.state !== ControllerState.INITIALIZING &&
                this.beaconSimulatorStore.state !== ControllerState.INITIALIZING
            ) {
                this.isLoading = true;
                Promise.all([
                    ...(this.beaconStore.state !== ControllerState.READY
                        ? [this.beaconStore.initialize()]
                        : []),
                ])
                    .then(() => {
                        return Promise.all([
                            ...(this.beaconSimulatorStore.state !== ControllerState.READY
                                ? [this.beaconSimulatorStore.initialize()]
                                : []),
                        ]);
                    })
                    .catch((err: Error) => {
                        console.error('Initialization error', err);
                    })
                    .finally(() => {
                        this.isLoading = false;
                        resolve();
                    });
            }
        });
    }

    async created() {
        RDFSerializer.initialize('rf');
        RDFSerializer.initialize('geospatial');
        this.logger.initialize();
        moment.updateLocale('en', {
            relativeTime: {
                future: 'in %s',
                past: '%s',
                s: (number) => number + 's ago',
                ss: '%ds ago',
                m: '1m ago',
                mm: '%dm ago',
                h: '1h ago',
                hh: '%dh ago',
                d: '1d ago',
                dd: '%dd ago',
                M: 'a month ago',
                MM: '%d months ago',
                y: 'a year ago',
                yy: '%d years ago',
            },
        });

        CapacitorApp.addListener('appUrlOpen', function (event: URLOpenListenerEvent) {
            this.zone.run(() => {
                const domain = 'sembeacon.org/app';
                const pathArray = event.url.split(domain);
                const appPath = pathArray.pop();
                if (appPath) {
                    this.router.navigateByUrl(appPath);
                }
            });
        });

        if (Capacitor.getPlatform() !== 'web') {
            CapacitorApp.getInfo().then((info) => {
                console.log('Application information', info);
                this.info = info;
            });
        }

        await SplashScreen.hide({
            fadeOutDuration: 150,
        });

        if (Capacitor.getPlatform() !== 'web') {
            await StatusBar.setStyle({ style: Style.Dark });
            await StatusBar.setBackgroundColor({
                color: '#363795',
            });
            await StatusBar.show({
                animation: Animation.None,
            });
        }

        this.handlePermissions().finally(() => {
            CapacitorApp.addListener('resume', () => {
                this.handlePermissions();
            });
        });
    }
}
</script>

<style lang="scss">
#container {
    position: relative;
    height: 100%;
}
</style>

<style scoped>
#container {
    text-align: center;
    left: 0;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
}

#container strong {
    font-size: 20px;
    line-height: 26px;
}

#container p {
    font-size: 16px;
    line-height: 22px;
    color: #d4d4d4;
    margin: 0;
}

#container a {
    text-decoration: none;
}

ion-menu.md ion-content {
    --padding-start: 8px;
    --padding-end: 8px;
    --padding-top: 20px;
    --padding-bottom: 20px;
}

ion-menu.md ion-list {
    padding: 20px 0;
}

ion-menu.md ion-note {
    margin-bottom: 30px;
}

ion-menu.md ion-list-header,
ion-menu.md ion-note {
    padding-left: 10px;
}

ion-menu.md ion-list#menu-list {
    border-bottom: 1px solid var(--ion-color-step-150, #d7d8da);
}

ion-menu.md ion-list#menu-list ion-list-header {
    font-size: 22px;
    font-weight: 600;

    min-height: 20px;
}

ion-menu.md ion-list#labels-list ion-list-header {
    font-size: 16px;

    margin-bottom: 18px;

    color: #757575;

    min-height: 26px;
}

ion-menu.md ion-item {
    --padding-start: 10px;
    --padding-end: 10px;
    border-radius: 4px;
}

ion-menu.md ion-item.selected {
    --background: rgba(var(--ion-color-primary-rgb), 0.14);
}

ion-menu.md ion-item.selected ion-icon {
    color: var(--ion-color-primary);
}

ion-menu.md ion-item ion-icon {
    color: #616e7e;
}

ion-menu.md ion-item ion-label {
    font-weight: 500;
}

ion-menu ion-list {
    background: none;
}

ion-menu.ios ion-content {
    --padding-bottom: 20px;
}

ion-menu.ios ion-list {
    padding: 20px 0 0 0;
}

ion-menu.ios ion-note {
    line-height: 24px;
    margin-bottom: 20px;
}

ion-menu.ios ion-item {
    --padding-start: 16px;
    --padding-end: 16px;
    --min-height: 50px;
}

ion-menu.ios ion-item.selected ion-icon {
    color: var(--ion-color-primary);
}

ion-menu.ios ion-item ion-icon {
    font-size: 24px;
    color: #73849a;
}

ion-menu.ios ion-list#labels-list ion-list-header {
    margin-bottom: 8px;
}

ion-menu.ios ion-list-header,
ion-menu.ios ion-note {
    padding-left: 16px;
    padding-right: 16px;
}

ion-menu.ios ion-note {
    margin-bottom: 8px;
}

ion-note {
    display: inline-block;
    font-size: 16px;

    color: var(--ion-color-medium-shade);
}

ion-item.selected {
    --color: var(--ion-color-primary);
}

ion-menu ion-list-header img {
    width: 80%;
    margin-bottom: 2em;
}

ion-menu.ios ion-list-header img {
    margin-top: 2em;
    margin-left: 1em;
}
</style>
