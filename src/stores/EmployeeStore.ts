import { useRouter } from 'vue-router'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient } from '../api' // Your previously defined Axios instance
import { useNavStore } from './NavStore'
import { toast } from 'vue-sonner'

export const useEmployeeStore = defineStore('employee', () => {
  const router = useRouter()
  const { setNavItem } = useNavStore()
  const profile = ref(null)
  const employees = ref([])
  const employee = ref()
  const loading = ref(false)
  const error = ref()

  async function login(params: any) {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.post('/auth/login', params)

      const data = response.data

      if (data.success) {
        toast.success('Login successful!', { position: 'top-center' })
      } else {
        throw new Error(data.data.length !== 0 ? data.data : data.message)
      }

      profile.value = data.data.employee

      setNavItem('/')
      router.push('/')

      return
    } catch (err) {
      console.error(err)
      error.value = {
        message: err,
      }
      toast.error('Error!', { description: err.message, position: 'top-center' })
    } finally {
      loading.value = false
    }
  }

  async function register(params: any) {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.post('/auth/register', params)

      const data = response.data

      if (data.success) {
        toast.success('Register successful!', { position: 'top-center' })
      } else {
        throw new Error(data.data.length !== 0 ? data.data : data.message)
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

  async function me() {
    if (profile.value !== null) {
      return profile.value
    }

    try {
      const response = await apiClient.get('/auth/me')

      const data = response.data

      if (data.success) {
        profile.value = data.data
      }

      return
    } catch (err) {
      console.error(err)
      profile.value = null
    }
  }

  async function logout() {
    try {
      await apiClient.get('/auth/logout')
    } catch (err) {
      console.error(err)
    } finally {
      profile.value = null
      router.push('/login')
    }
  }

  async function fetchEmployees(params: any) {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get('/employees', {
        params: params,
      })

      const data = response.data

      if (data.success) {
        const pagination = data.meta.pagination
        employees.value = data.data.map((e: any, index: number) => ({
          ...e,
          no: index + 1 + (pagination.current_page - 1) * pagination.limit,
        }))
      } else {
        throw new Error(data.data.length !== 0 ? data.data : data.message)
      }

      return data
    } catch (err) {
      console.error(err)
      error.value = {
        message: err,
      }
      toast.error('Error!', { description: err.message, position: 'top-center' })
    } finally {
      loading.value = false
    }
  }

  async function fetchEmployeeDetail(employeeId: string, params: any) {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get(`/employees/${employeeId}`, {
        params: params,
      })

      const data = response.data

      if (data.success) {
        employee.value = data.data
      } else {
        throw new Error(data.data.length !== 0 ? data.data : data.message)
      }

      return
    } catch (err) {
      console.error(err)
      error.value = {
        message: err,
      }
      toast.error('Error!', { description: err.message, position: 'top-center' })
    } finally {
      loading.value = false
    }
  }

  async function updateEmployee(employeeId: string, payload: any) {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.post(`/employees/${employeeId}`, payload)

      const data = response.data

      if (data.success) {
        toast.success('Success!', {
          description: data.message || 'Employee information updated successfully',
          position: 'top-center',
        })
      } else {
        throw new Error(data.data.length !== 0 ? data.data : data.message)
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

  async function deleteEmployee(employeeId: string) {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.delete(`/employees/${employeeId}`)

      const data = response.data

      if (data.success) {
        toast.success('Success!', {
          description: data.message || 'Employee deleted successfully',
          position: 'top-center',
        })
      } else {
        throw new Error(data.data.length !== 0 ? data.data : data.message)
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
    profile,
    employees,
    employee,
    loading,
    error,
    login,
    logout,
    register,
    fetchEmployees,
    fetchEmployeeDetail,
    updateEmployee,
    deleteEmployee,
    me,
  }
})
