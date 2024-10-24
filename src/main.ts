import 'reflect-metadata';
import { createApp, defineAsyncComponent } from 'vue';
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

import { SplashScreen } from '@capacitor/splash-screen';

const app = createApp(App).use(IonicVue).use(createPinia()).use(router);

// Bootstrap icons
app.component('BIconWifiOff', BIconWifiOff);

// OpenLayers components
app.component('OlMap', defineAsyncComponent(() => import('vue3-openlayers').then(m => m.Map.OlMap)));
app.component('OlView', defineAsyncComponent(() => import('vue3-openlayers').then(m => m.Map.OlView)));
app.component('OlSourceVector', defineAsyncComponent(() => import('vue3-openlayers').then(m => m.Sources.OlSourceVector)));
app.component('OlVectorLayer', defineAsyncComponent(() => import('vue3-openlayers').then(m => m.Layers.OlVectorLayer)));
app.component('OlFeature', defineAsyncComponent(() => import('vue3-openlayers').then(m => m.Map.OlFeature)));
app.component('OlStyle', defineAsyncComponent(() => import('vue3-openlayers').then(m => m.Styles.OlStyle)));
app.component('OlStyleIcon', defineAsyncComponent(() => import('vue3-openlayers').then(m => m.Styles.OlStyleIcon)));
app.component('OlStyleFill', defineAsyncComponent(() => import('vue3-openlayers').then(m => m.Styles.OlStyleFill)));
app.component('OlStyleStroke', defineAsyncComponent(() => import('vue3-openlayers').then(m => m.Styles.OlStyleStroke)));
app.component('OlGeomPolygon', defineAsyncComponent(() => import('vue3-openlayers').then(m => m.Geometries.OlGeomPolygon)));
app.component('OlGeomPoint', defineAsyncComponent(() => import('vue3-openlayers').then(m => m.Geometries.OlGeomPoint)));
app.component('OlContextMenuControl', defineAsyncComponent(() => import('vue3-openlayers').then(m => m.MapControls.OlContextMenuControl)));
app.component('OlDrawInteraction', defineAsyncComponent(() => import('vue3-openlayers').then(m => m.Interactions.OlInteractionDraw)));
app.component('OlModifyInteraction', defineAsyncComponent(() => import('vue3-openlayers').then(m => m.Interactions.OlInteractionModify)));
app.component('OlOverlay', defineAsyncComponent(() => import('vue3-openlayers').then(m => m.Map.OlOverlay)));

SplashScreen.hide().then(() => {
    SplashScreen.show();
});
router.isReady().then(() => {
    app.mount('#app');
});
