import { useEmployeeStore } from '@/stores/EmployeeStore'
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
        {
          path: '/employees',
          name: 'Employees',
          component: () => import('@/views/EmployeeView.vue'),
          meta: {
            permission: 'admin.super_admin',
          },
        },
        {
          path: '/employees/:employeeId',
          name: 'Employee Detail',
          component: () => import('@/views/EmployeeDetailView.vue'),
          meta: {
            permission: 'admin.super_admin',
          },
        },
        {
          path: '/items',
          name: 'Items',
          component: () => import('@/views/ItemView.vue'),
          meta: {
            breadcrumb: 'Items',
          },
        },
        {
          path: '/items/:itemId',
          name: 'Item Detail',
          component: () => import('@/views/ItemDetailView.vue'),
        },
        {
          path: '/transactions',
          name: 'Transactions',
          component: () => import('@/views/TransactionView.vue'),
        },
        {
          path: '/transactions/:transactionId',
          name: 'Transaction Detail',
          component: () => import('@/views/TransactionDetailView.vue'),
          meta: {
            permission: 'admin.super_admin',
          },
        },
        {
          path: '/warehouses',
          name: 'Warehouses',
          component: () => import('@/views/WarehouseView.vue'),
        },
        {
          path: '/warehouses/:warehouseId',
          name: 'Warehouse Detail',
          component: () => import('@/views/WarehouseDetailView.vue'),
        },
        {
          path: '/access-denied',
          name: 'Access Denied',
          component: () => import('@/views/AccessDeniedView.vue'),
        },
      ],
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/',
      children: [
        {
          path: '/login',
          component: () => import('@/views/LoginView.vue'),
        },
      ],
      meta: {
        public: true,
      },
    },
  ],
})

router.beforeEach(async (to) => {
  const authToken = sessionStorage.getItem('authToken') || null
  const employeeStore = useEmployeeStore()

  if (to.meta.public) {
    return
  }

  // Me acts as a check auth too
  await employeeStore.me()

  if (to.meta.requiresAuth && !authToken) {
    return '/login'
  }

  if (to.meta.permission) {
    const permissions = to.meta.permission.split('.')
    if (!employeeStore.profile || !permissions.includes(employeeStore.profile.role.role_name)) {
      return '/access-denied'
    }
  }
  return
})

export default router
