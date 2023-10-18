import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/beacons',
  },
  {
    name: 'map',
    path: '/map/:beaconUID?',
    component: () => import ('../views/MapPage.vue')
  },
  {
    name: 'beacons',
    path: '/beacons',
    component: () => import ('../views/BeaconsPage.vue')
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
