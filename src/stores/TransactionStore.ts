import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient } from '@/api'
import { toast } from 'vue-sonner'

export const useTransactionStore = defineStore('transaction', () => {
  const transactions = ref([])
  const transactionSummary = ref({})
  const transaction = ref()
  const error = ref()
  const loading = ref(false)
  const success = ref()

  const toTransactionSummary = (summary: any) => {
    const newSummary = Object.entries(summary).map(([key, value]) => {
      const keyName = key.replace(/_(.)/g, (_, letter) => letter.toUpperCase())
      return {
        key: keyName,
        [keyName]: value,
      }
    })
    return newSummary
  }

  const fetchTransactionSummary = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await apiClient.get('/transactions/summary')

      const data = response.data

      if (data.success) {
        transactionSummary.value = toTransactionSummary(data.data)
      } else {
        throw new Error(data.data.length > 0 ? data.data : data.message)
      }

      return
    } catch (err) {
      console.error(err)
      error.value = {
        message: err.message,
      }
    } finally {
      loading.value = false
    }
  }

  const fetchTransactions = async (params: any) => {
    loading.value = true
    error.value = null

    try {
      const response = await apiClient.get('/transactions', {
        params: params,
      })
      const data = response.data
      if (data.success) {
        const pagination = data.meta.pagination
        transactions.value = data.data.map((t: any, index: number) => ({
          ...t,
          no: index + 1 + (pagination.current_page - 1) * pagination.limit,
        }))
      }

      return data
    } catch (err) {
      console.error(err)
      error.value = {
        message: err,
      }
    } finally {
      loading.value = false
    }
  }

  const fetchTransactionDetail = async (transactionId, params: any) => {
    loading.value = true
    error.value = null
    success.value = null

    try {
      const response = await apiClient.get(`/transactions/${transactionId}`, {
        params: params,
      })
      const data = response.data
      if (data.success) {
        success.value = {
          success: true,
          message: 'Items fetched successfully',
        }

        transaction.value = data.data
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

  const createTransaction = async (payload: any) => {
    loading.value = true
    error.value = null

    try {
      const response = await apiClient.post('/transactions', payload)

      const data = response.data

      if (data.success) {
        toast.success('Success!', {
          description: 'Transaction created successfully',
          position: 'top-center',
        })
      } else {
        throw new Error(data.message || 'Failed to create transaction')
      }

      return
    } catch (err) {
      console.error(err)
      error.value = {
        message: err.message,
      }
      toast.error('Error!', { description: err.message, position: 'top-center' })
    } finally {
      loading.value = false
    }
  }

  return {
    transactions,
    transactionSummary,
    transaction,
    error,
    success,
    loading,
    fetchTransactions,
    fetchTransactionSummary,
    fetchTransactionDetail,
    createTransaction,
  }
})
