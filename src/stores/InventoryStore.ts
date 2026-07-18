import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useEmployeeStore } from '@/stores/EmployeeStore'
import { apiClient } from '@/api'

export const useInventoryStore = defineStore('inventory', () => {
  const { me } = useEmployeeStore()
  const items = ref([])
  const error = ref()
  const loading = ref(false)
  const success = ref()

  const fetchItems = async (params: any) => {
    loading.value = true
    error.value = null
    success.value = null

    try {
      const response = await apiClient('/inventories', {
        params: params,
      })
      const data = response.data
      if (data.success) {
        success.value = {
          success: true,
          message: 'Items fetched successfully',
        }

        items.value = data.data
      }

      return
    } catch (err) {
      console.error(err)
      error.value = {
        success: false,
        message: err,
      }
    } finally {
      loading.value = false
      setTimeout(() => {
        error.value = null
        success.value = null
      }, 3000)
    }
  }

  return {
    items,
    error,
    success,
    loading,
    fetchItems,
  }
})
