import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import { IonicVue } from '@ionic/vue';
import {
    Map,
    Layers,
    Geometries,
    Styles,
    Interactions,
    MapControls,
    Sources,
} from 'vue3-openlayers';
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
    app.mount('#app');
});
