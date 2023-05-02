import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    component: () => import ('../views/MapPage.vue')
  },
  {
    path: '/scan',
    component: () => import ('../views/ScanPage.vue')
  },
  {
    path: '/login',
    component: () => import ('../views/LoginPage.vue')
  },  
  {
    path: '/profile',
    component: () => import ('../views/ProfilePage.vue')
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
