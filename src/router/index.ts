import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/components/layouts/MainLayout.vue'),
      children: [
        {
          path: '/dashboard',
          name: 'Dashboard',
          component: () => import('@/views/HomeView.vue'),
        },
        {
          path: '/',
          name: 'Home',
          component: () => import('@/views/HomeView.vue'),
        },
      ],
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
      meta: {
        layout: false,
      },
    },
  ],
})

router.beforeEach((to) => {
  const authToken = sessionStorage.getItem('authToken') || null

  if (to.meta.requiresAuth && !authToken) {
    return '/login'
  } else {
    return
  }
})

export default router
