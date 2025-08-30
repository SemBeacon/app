import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/beacon/scanner',
    },
    {
        name: 'editor',
        path: '/map/editor',
        component: () => import('../views/MapEditorPage.vue'),
    },
    {
        name: 'map',
        path: '/map/:beaconUID?',
        component: () => import('../views/MapPage.vue'),
    },
    {
        name: 'scanner',
        path: '/beacon/scanner',
        component: () => import('../views/BeaconScannerPage.vue'),
    },
    {
        name: 'simulator',
        path: '/beacon/simulator',
        component: () => import('../views/BeaconSimulatorPage.vue'),
    },
    {
        path: '/login',
        component: () => import('../views/LoginPage.vue'),
    },
    {
        path: '/beacon/create',
        component: () => import('../views/BeaconPage.vue'),
    },
    {
        path: '/beacon/edit/:uid/code',
        component: () => import('../views/CodePage.vue'),
    },
    {
        path: '/beacon/edit/:uid',
        component: () => import('../views/BeaconPage.vue'),
    },
    {
        name: 'beacon',
        path: '/beacon/:uid',
        component: () => import('../views/BeaconPage.vue'),
    },
    {
        name: 'settings',
        path: '/settings',
        component: () => import('../views/SettingsPage.vue'),
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

export default router;
