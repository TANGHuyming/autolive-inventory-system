import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient } from '@/api'

export const useWarehouseStore = defineStore('warehouse', () => {
  const warehouses = ref([])
  const warehouse = ref()
  const loading = ref(false)
  const error = ref()
  const success = ref()

  const fetchWarehouses = async (params: any) => {
    loading.value = true
    warehouses.value = []
    error.value = null
    success.value = null

    try {
      const response = await apiClient.get('/warehouses', {
        params: params,
      })

      const data = response.data

      if (data.success) {
        success.value = {
          success: true,
          message: data.message,
        }

        warehouses.value = data.data
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

  const fetchWarehouseDetails = async (warehouseId: any, params: any) => {
    loading.value = true
    warehouse.value = null
    error.value = null
    success.value = null

    try {
      const response = await apiClient.get(`/warehouses/${warehouseId}`, {
        params: params,
      })

      const data = response.data

      if (data.success) {
        success.value = {
          success: true,
          message: data.message,
        }

        warehouse.value = data.data
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
    warehouses,
    warehouse,
    loading,
    success,
    error,
    fetchWarehouses,
    fetchWarehouseDetails,
  }
})
