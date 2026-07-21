import { useRouter } from 'vue-router'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient } from '../api' // Your previously defined Axios instance
import { useNavStore } from './NavStore'

export const useEmployeeStore = defineStore('employee', () => {
  const router = useRouter()
  const { setNavItem } = useNavStore()
  const profile = ref(null)
  const employees = ref([])
  const employee = ref()
  const loading = ref(false)
  const error = ref()
  const success = ref()

  async function login(params: any) {
    loading.value = true
    error.value = null
    success.value = null

    try {
      const response = await apiClient.post('/auth/login', params)

      const data = response.data

      if (!data.success) {
        throw new Error(data.data || data.message)
      }

      const token = data.data.token
      profile.value = data.data.employee

      sessionStorage.setItem('authToken', token)

      success.value = {
        success: true,
        message: 'Login successful!',
      }

      setNavItem('/')
      router.push('/')

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

  async function register(params: any) {
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

  async function me() {
    if (profile.value !== null) {
      return profile.value
    }

    try {
      const response = await apiClient.get('/auth/me')

      const data = response.data

      if (data.success) {
        profile.value = data.data
        return data.data
      }

      return
    } catch (err) {
      console.error(err)
      profile.value = null
      sessionStorage.removeItem('authToken')
    }
  }

  async function logout() {
    try {
      await apiClient.get('/auth/logout')
    } catch (err) {
      console.error(err)
    } finally {
      profile.value = null
      sessionStorage.removeItem('authToken')
      router.push('/login')
    }
  }

  async function fetchEmployees(params: any) {
    loading.value = true
    error.value = null
    success.value = null
    try {
      const response = await apiClient.get('/employees', {
        params: params,
      })

      const data = response.data

      if (data.success) {
        success.value = {
          success: true,
          message: 'Employees fetched successfully',
        }
        employees.value = data.data
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

  async function fetchEmployeeDetail(employeeId: string, params: any) {
    loading.value = true
    error.value = null
    success.value = null
    try {
      const response = await apiClient.get(`/employees/${employeeId}`, {
        params: params,
      })

      const data = response.data

      if (data.success) {
        success.value = {
          success: true,
          message: 'Employees fetched successfully',
        }
        employee.value = data.data
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
    profile,
    employees,
    employee,
    loading,
    error,
    success,
    login,
    logout,
    register,
    fetchEmployees,
    fetchEmployeeDetail,
    me,
  }
})
