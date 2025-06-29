/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router';
import Table from '@/pages/Table.vue';
import CreateNews from '@/pages/CreateNews.vue';
import LogIn from '@/pages/LogIn.vue';
import ContentType from '@/pages/ContentType.vue';
import TempDynamicForm from '@/pages/TempDynamicForm.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LogIn,
    meta: { public: true }, // Public route
  },
  {
    path: '/',
    name: 'Table',
    component: Table,
    meta: { requiresAuth: true },
  },
  {
    path: '/create-news',
    name: 'CreateNews',
    component: CreateNews,
    meta: { requiresAuth: true },
  },
  {
    path: '/content-type',
    name: 'contentType',
    component: ContentType,
    meta: { requiresAuth: true },
  },
  {
    path: '/temp-dynamic-form',
    name: 'TempDynamicForm',
    component: TempDynamicForm,
    meta: { requiresAuth: true },
  },
  // Optionally, add a catch-all 404 route
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token');
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' } as any);
  } else if (to.meta.public && isAuthenticated) {
    next({ path: '/' });
  } else {
    next();
  }
});

export default router;
