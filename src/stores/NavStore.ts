import { defineStore } from 'pinia'
import { useRoute } from 'vue-router'
import { ref, computed } from 'vue'

export const useNavStore = defineStore('nav', () => {
  const route = useRoute()
  const navItem = ref(`/`)
  const navOptions = ref([
    { value: '/', label: 'Home' },
    { value: '/employees', label: 'Employees' },
    { value: '/items', label: 'Items' },
    { value: '/transactions', label: 'Transactions' },
  ])
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
