import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient } from '@/api'

export const useTransactionStore = defineStore('transaction', () => {
  const transactions = ref([])
  const error = ref()
  const loading = ref(false)
  const success = ref()

  const fetchTransactions = async (params: any) => {
    loading.value = true
    error.value = null
    success.value = null

    try {
      const response = await apiClient.get('/transactions', {
        params: params,
      })
      const data = response.data
      if (data.success) {
        success.value = {
          success: true,
          message: 'Items fetched successfully',
        }

        transactions.value = data.data
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
    transactions,
    error,
    success,
    loading,
    fetchTransactions,
  }
})
