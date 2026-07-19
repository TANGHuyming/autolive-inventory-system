import { defineStore } from 'pinia'
import { useRoute } from 'vue-router'
import { ref, computed } from 'vue'

export const useNavStore = defineStore('nav', () => {
  const route = useRoute()
  const navOptions = ref([
    { value: '/', label: 'Home' },
    { value: '/employees', label: 'Employees', permission: 'admin.super_admin' },
    { value: '/items', label: 'Items' },
    { value: '/transactions', label: 'Transactions', permission: 'admin.super_admin' },
  ])
  const navItem = ref(navOptions.value.find((opt) => opt.label === route.name)?.value)
  const navTitle = computed(() => route.name)

  const setNavItem = (value: string) => {
    navItem.value = value
  }

  return {
    navItem,
    navOptions,
    navTitle,
    setNavItem,
  }
})
