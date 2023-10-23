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
    component: () => import ('../views/MapPage.vue')
  },
  {
    path: '/beacon',
    component: () => import ('../views/BeaconsPage.vue'),
    children: [
      {
        name: 'scanner',
        path: 'scanner', 
        component: () => import('../components/BLEScannerComponent.vue')
      },
      {
        name: 'simulator',
        path: 'simulator', 
        component: () => import('../components/BLESimulatorComponent.vue')
      },
    ]
  },
  {
    path: '/login',
    component: () => import ('../views/LoginPage.vue')
  },  
  {
    path: '/profile',
    component: () => import ('../views/ProfilePage.vue')
  },
  {
    path: '/beacon/create',
    component: () => import ('../views/BeaconPage.vue')
  },
  {
    path: '/beacon/edit/:uid',
    component: () => import ('../views/BeaconPage.vue')
  },
  {
    name: 'beacon',
    path: '/beacon/:uid',
    component: () => import ('../views/BeaconPage.vue')
  },
  {
    name: 'about',
    path: '/about',
    component: () => import ('../views/AboutPage.vue')
  },  
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
