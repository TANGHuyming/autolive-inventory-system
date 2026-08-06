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
    const paths = route.path.split('/')
    const breadcrumbs = paths.map((p, index) => {
      let breadcrumbLocation = ''
      for (let i = 0; i <= index; i++) {
        breadcrumbLocation += paths[i] + '/'
      }
      return {
        name: p.length === 0 ? 'Home' : p[0]?.toUpperCase() + p.slice(1).toLowerCase(),
        location: breadcrumbLocation.slice(0, -1),
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
