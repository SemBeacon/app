import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/beacon/scanner',
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
        path: '/profile',
        component: () => import('../views/ProfilePage.vue'),
    },
    {
        path: '/beacon/create',
        component: () => import('../views/BeaconPage.vue'),
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
        name: 'about',
        path: '/about',
        component: () => import('../views/AboutPage.vue'),
    },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

export default router;
