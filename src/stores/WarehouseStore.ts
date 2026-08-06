import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient } from '@/api'
import { toast } from 'vue-sonner'

export const useWarehouseStore = defineStore('warehouse', () => {
  const warehouses = ref([])
  const warehouse = ref()
  const bay = ref()
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

  const fetchBayDetails = async (bayId: any) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get(`/bays/${bayId}`)

      const data = response.data

      if (data.success) {
        bay.value = data.data
      } else {
        throw new Error(data.data.length > 0 ? data.data : data.message)
      }

      return
    } catch (err) {
      console.error(err)
      error.value = {
        message: err.message,
      }
      toast.error('Error!', {
        description: err.message,
        position: 'top-center',
      })
    } finally {
      loading.value = false
    }
  }

  const createWarehouse = async (payload: any) => {
    loading.value = true
    error.value = null
    try {
      const respons = await apiClient.post('/warehouses', payload)

      const data = respons.data

      if (data.success) {
        toast.success('Success!', {
          description: data.message || 'Warehouse created successfully.',
          position: 'top-center',
        })
      } else {
        throw new Error(data.data.length > 0 ? data.data : data.message)
      }
      return
    } catch (err) {
      console.error(err)
      error.value = {
        message: err.message,
      }
      toast.error('Error!', {
        description: err.message,
        position: 'top-center',
      })
    } finally {
      loading.value = false
    }
  }

  const updateWarehouse = async (warehouseId: string, payload: any) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.put(`/warehouses/${warehouseId}`, payload)

      const data = response.data

      if (data.success) {
        toast.success('Succes!', {
          description: data.message || 'Warehouse updated successfully.',
          position: 'top-center',
        })
      } else {
        throw new Error(data.data.length > 0 ? data.data : data.message)
      }

      return
    } catch (err) {
      console.error(err)
      error.value = {
        message: err.message,
      }
      toast.error('Error!', {
        description: err.message,
        position: 'top-center',
      })
    } finally {
      loading.value = false
    }
  }

  const updateBay = async (bayId: string, payload: any) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.put(`/bays/${bayId}`, payload)

      const data = response.data

      if (data.success) {
        toast.success('Success!', {
          description: data.message || 'Bay updated successfully.',
          position: 'top-center',
        })
      } else {
        throw new Error(data.data.length > 0 ? data.data : data.message)
      }

      return
    } catch (err) {
      console.error(err)
      error.value = {
        message: err.message,
      }
      toast.error('Error!', {
        description: err.message,
        position: 'top-center',
      })
    } finally {
      loading.value = false
    }
  }

  const deleteBay = async (bayId: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.delete(`/bays/${bayId}`)

      const data = response.data

      if (data.success) {
        toast.success('Success!', {
          description: data.message || 'Bay deleted successfully.',
          position: 'top-center',
        })
      } else {
        throw new Error(data.data.length > 0 ? data.data : data.message)
      }
      return
    } catch (err) {
      console.error(err)
      error.value = {
        message: err.message,
      }
      toast.error('Error!', {
        description: err.message,
        position: 'top-center',
      })
    } finally {
      loading.value = false
    }
  }

  const deleteWarehouse = async (warehouseId: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.delete(`/warehouses/${warehouseId}`)

      const data = response.data

      if (data.success) {
        toast.success('Success!', {
          description: data.message || 'Warehouse deleted successfully.',
          position: 'top-center',
        })
      } else {
        throw new Error(data.data.length > 0 ? data.data : data.message)
      }
      return
    } catch (err) {
      console.error(err)
      error.value = {
        message: err.message,
      }
      toast.error('Error!', {
        description: err.message,
        position: 'top-center',
      })
    } finally {
      loading.value = false
    }
  }

  const createBay = async (payload: any) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.post(`/bays`, payload)

      const data = response.data

      if (data.success) {
        toast.success('Success!', {
          description: data.message || 'Bay created successfully.',
          position: 'top-center',
        })
      } else {
        throw new Error(data.data.length > 0 ? data.data : data.message)
      }

      return
    } catch (err) {
      console.error(err)
      error.value = {
        message: err.message,
      }
      toast.error('Error!', {
        description: err.message,
        position: 'top-center',
      })
    } finally {
      loading.value = false
    }
  }

  return {
    warehouses,
    warehouse,
    bay,
    loading,
    success,
    error,
    fetchWarehouses,
    fetchWarehouseDetails,
    fetchBayDetails,
    createWarehouse,
    createBay,
    updateWarehouse,
    updateBay,
    deleteWarehouse,
    deleteBay,
  }
})
