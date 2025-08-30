import 'reflect-metadata';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import { IonicVue } from '@ionic/vue';
import { BIconWifiOff } from 'bootstrap-icons-vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.css';

/* Sentry */
// import * as Sentry from '@sentry/capacitor';
// import * as SentryVue from '@sentry/vue';

import { SplashScreen } from '@capacitor/splash-screen';

// Import OpenLayers components directly
import { Map, Sources, Layers, Styles, Geometries, Interactions, MapControls } from 'vue3-openlayers';
import { setActivePinia, getActivePinia } from 'pinia';

const app = createApp(App).use(IonicVue).use(createPinia()).use(router);

// Sentry.init({
//     app,
//     dsn: "https://cbbf5555be20152690d361fda1645a7f@sentry.mvdw-software.com/5",
//     integrations: [
//         SentryVue.browserTracingIntegration({
//             // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
//             tracePropagationTargets: ["localhost", /^https:\/\/sentry\.mvdw-software\.com\/api/],
//             router,
//         }),
//         SentryVue.replayIntegration() as any,
//     ],

//     // Tracing
//     tracesSampleRate: 1.0, //  Capture 100% of the transactions
//     // Session Replay
//     replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
//     replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
//   },
//   // Forward the init method from @sentry/vue
//   SentryVue.init
// );

// Bootstrap icons
app.component('BIconWifiOff', BIconWifiOff);

// Register OpenLayers components
app.component('OlMap', Map.OlMap);
app.component('OlView', Map.OlView);
app.component('OlSourceVector', Sources.OlSourceVector);
app.component('OlVectorLayer', Layers.OlVectorLayer);
app.component('OlFeature', Map.OlFeature);
app.component('OlStyle', Styles.OlStyle);
app.component('OlStyleIcon', Styles.OlStyleIcon);
app.component('OlStyleFill', Styles.OlStyleFill);
app.component('OlStyleStroke', Styles.OlStyleStroke);
app.component('OlGeomPolygon', Geometries.OlGeomPolygon);
app.component('OlGeomPoint', Geometries.OlGeomPoint);
app.component('OlContextMenuControl', MapControls.OlContextMenuControl);
app.component('OlDrawInteraction', Interactions.OlInteractionDraw);
app.component('OlModifyInteraction', Interactions.OlInteractionModify);
app.component('OlOverlay', Map.OlOverlay);

SplashScreen.hide().then(() => {
    SplashScreen.show();
});
router.isReady().then(() => {
    globalThis.__dirname = import.meta.url;
    app.mount('#app');
});

declare global {
    interface Window {
        SemBeacon?: any;
    }
}

window.SemBeacon = window.SemBeacon || {};
window.SemBeacon.stores = {};
