import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '../api' // Your previously defined Axios instance

export const useEmployeeStore = defineStore('employee', () => {
  // 1. State (reactive variables)
  const profile = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const success = ref(null)

  // 2. Getters (computed values)
  const isLoggedIn = computed(() => profile.value !== null)
  const userRole = computed(() => profile.value?.role || 'guest')

  // 3. Actions (functions that change state or handle async API operations)
  async function login(params: any) {
    loading.value = true
    error.value = null
    success.value = null

    try {
      const response = await apiClient.post('/auth/login', params)

      if (response.status !== 200) {
        throw new Error('Internal server error')
      }

      const data = response.data

      if (!data.success) {
        throw new Error(data.message)
      }

      const employee = data.data.employee
      const token = data.data.token

      profile.value = { employee, token }

      success.value = {
        success: true,
        message: 'Login successful!',
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

  async function register(params) {
    loading.value = true
    error.value = null
    success.value = null

    try {
      const response = await apiClient.post('/auth/register', params)

      if (response.status !== 200) {
        throw new Error('Internal server error')
      }

      const data = response.data

      if (!data.success) {
        throw new Error(data.message)
      }

      success.value = {
        success: true,
        message: 'Register successful!',
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

  function clearProfile() {
    profile.value = null
  }

  // Return everything you want the components to access
  return {
    profile,
    loading,
    error,
    success,
    isLoggedIn,
    login,
    register,
    userRole,
    clearProfile,
  }
})
