import { defineStore } from 'pinia'
import { useRoute } from 'vue-router'
import { ref, computed } from 'vue'

export const useNavStore = defineStore('nav', () => {
  const route = useRoute()
  const navOptions = ref([
    { value: '/', label: 'Home' },
    { value: '/employees', label: 'Employees', permission: 'admin.super_admin' },
    { value: '/warehouses', label: 'Warehouses', permission: 'admin.super_admin' },
    { value: '/items', label: 'Items' },
    { value: '/transactions', label: 'Transactions', permission: 'admin.super_admin' },
  ])
  const navItem = ref(route.path)
  const navTitles = computed(() => {
    const breadcrumbs = route.path.split('/').map((p) => {
      return {
        name: p.length === 0 ? 'Home' : p[0]?.toUpperCase() + p.slice(1).toLowerCase(),
        location: `/${p}`,
      }
    })

    return breadcrumbs
  })

  const setNavItem = (value: string) => {
    navItem.value = value
  }

  return {
    navItem,
    navOptions,
    navTitles,
    setNavItem,
  }
})
