import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient } from '@/api'

export const useInventoryStore = defineStore('inventory', () => {
  const items = ref([])
  const item = ref()
  const error = ref()
  const loading = ref(false)
  const success = ref()

  const fetchItems = async (params: any) => {
    loading.value = true
    error.value = null
    success.value = null

    try {
      const response = await apiClient.get('/inventories', {
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

  const fetchItemDetails = async (itemId: any, params: any) => {
    loading.value = true
    error.value = null
    success.value = null

    try {
      const response = await apiClient.get(`/inventories/${itemId}`, {
        params: params,
      })

      const data = response.data

      if (data.success) {
        success.value = {
          success: true,
          message: data.message,
        }

        item.value = data.data
      } else {
        throw new Error(data.data || data.message)
      }

      return
    } catch (err) {
      console.error(err)
      error.value = {
        success: false,
        message: err.message,
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
    item,
    error,
    success,
    loading,
    fetchItems,
    fetchItemDetails,
  }
})
