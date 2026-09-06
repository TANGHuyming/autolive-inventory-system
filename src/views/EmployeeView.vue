<script setup>
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { MoreHorizontal } from '@lucide/vue'
import { onMounted, ref, watch } from 'vue'
import PaginatorComponent from '@/components/PaginatorComponent.vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useEmployeeStore } from '@/stores/EmployeeStore'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'
import { toast } from 'vue-sonner'

const searchQuery = ref('')
const route = useRoute()
const router = useRouter()
const pageSize = ref(10)
const currentPage = ref(1)
const totalPages = ref(1)
const showEmployeeForm = ref(false)
const employeeForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  telephone: '',
  password: '',
  confirmPassword: '',
})
const fileInputKey = ref(0)
const employeeImageUrl = ref('')
const employeeStore = useEmployeeStore()
const { employees, loading } = storeToRefs(employeeStore)
const { fetchEmployees, register } = employeeStore

const handleSearch = async (e) => {
  e.preventDefault()
  router.push({
    query: {
      ...route.query,
      page: 1,
      searchQuery: !searchQuery.value.trim() ? undefined : searchQuery.value.trim(),
    },
  })
}

const handleResetEmployeeForm = () => {
  fileInputKey.value++
  employeeForm.value = {
    firstName: '',
    lastName: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
    employeeImage: null,
  }
}

const validateEmployeeForm = () => {
  try {
    if (
      !Object.entries(employeeForm.value).some(([key, value]) => value && key !== 'employeeImage')
    ) {
      throw new Error('Please fill in atleast one field')
    }

    if (employeeForm.value.password !== employeeForm.value.confirmPassword) {
      throw new Error('Passwords do not match.')
    }

    const maxFileSize = 1024 * 1024 * 5 // in 5 MB
    const allowedMimeTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/avif']
    if (employeeForm.value.employeeImage) {
      if (employeeForm.value.employeeImage.size > maxFileSize) {
        throw new Error('Image size should not exceed 5MB.')
      }

      if (!allowedMimeTypes.includes(employeeForm.value.employeeImage.type)) {
        throw new Error('Invalid image format. Allowed formats: jpg, jpeg, png, avif.')
      }
    }

    return true
  } catch (err) {
    console.error(err.message)
    toast.error('Validation failed', {
      description: err.message || 'Atleast one item validation failed',
      position: 'top-center',
    })
    return false
  }
}

const handleFileChange = (event) => {
  employeeForm.value.employeeImage = event.target.files[0] || null
  setEmployeeImageUrl(employeeForm.value.employeeImage)
}

const setEmployeeImageUrl = (image) => {
  if (!image) return
  employeeImageUrl.value = ''
  URL.revokeObjectURL(employeeImageUrl.value)
  employeeImageUrl.value = URL.createObjectURL(image)
}

const toPayload = (employeeForm) => {
  const formData = new FormData()

  employeeForm = {
    first_name: employeeForm.firstName,
    last_name: employeeForm.lastName,
    email: employeeForm.email,
    telephone: employeeForm.telephone,
    password: !employeeForm.password ? undefined : employeeForm.password,
    avatar: !employeeForm.employeeImage ? undefined : employeeForm.employeeImage,
    method: 'PUT',
  }

  Object.entries(employeeForm).forEach(([key, value]) => {
    if (value) {
      formData.append(key, value)
    }
  })

  return formData
}

const handleSubmitEmployeeForm = async () => {
  const payload = toPayload(employeeForm.value)
  await register(payload)
  if (!error.value) {
    handleResetEmployeeForm()
    showEmployeeForm.value = false
    await loadEmployees()
  }
}

async function loadEmployees(params = {}) {
  try {
    const result = await fetchEmployees(params)
    totalPages.value = result.meta.pagination.total_pages ?? 1
  } catch (err) {
    console.error(err)
  }
}

watch(
  () => route.params,
  () => {
    currentPage.value = parseInt(route.query.page) || 1
    pageSize.value = parseInt(route.query.limit) || 10

    loadEmployees({
      ...route.query,
    })
  },
  { deep: true },
)

onMounted(() => {
  loadEmployees({
    ...route.query,
  })
})
</script>

<template>
  <div v-if="loading" class="max-w-7xl mx-auto space-y-2">
    <Skeleton v-for="n in 10" :key="n" class="bg-accent w-full h-10" />
  </div>

  <Card v-else class="max-w-7xl mx-auto overflow-scroll my-5">
    <CardHeader>Employee List</CardHeader>
    <CardContent>
      <div class="flex flex-col sm:flex-row items-start justify-between gap-2 my-5">
        <form @submit="handleSearch">
          <Input
            type="text"
            v-model="searchQuery"
            placeholder="search..."
            class="max-w-md"
            @input:v-model="(e) => (searchQuery = e.target.value)"
          />
          <Input type="submit" class="hidden" />
        </form>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="default"
              class="cursor-pointer"
              @click="
                () => {
                  showEmployeeForm = true
                }
              "
              >Register Employee</Button
            >
          </DialogTrigger>

          <DialogContent class="min-w-[90vw] max-h-[70vh] overflow-auto">
            <DialogHeader>
              <DialogTitle> Add new employee </DialogTitle>
              <DialogDescription>
                Fill in the form below to register a new employee
              </DialogDescription>
            </DialogHeader>
            <FieldSet>
              <FieldGroup class="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-6">
                <Field>
                  <FieldLabel for="firstName">First Name</FieldLabel>
                  <Input
                    class="text-sm"
                    id="firstName"
                    type="text"
                    placeholder="Enter first name..."
                    v-model="employeeForm.firstName"
                    @input:v-model="(e) => (employeeForm.firstName = e.target.value)"
                  />
                </Field>

                <Field>
                  <FieldLabel for="lastName">Last Name</FieldLabel>
                  <Input
                    class="text-sm"
                    id="lastName"
                    type="text"
                    placeholder="Enter last name..."
                    v-model="employeeForm.lastName"
                    @input:v-model="(e) => (employeeForm.lastName = e.target.value)"
                  />
                </Field>

                <Field>
                  <FieldLabel for="email">Email</FieldLabel>
                  <Input
                    class="text-sm"
                    id="email"
                    type="email"
                    placeholder="Enter email..."
                    v-model="employeeForm.email"
                    @input:v-model="(e) => (employeeForm.email = e.target.value)"
                  />
                </Field>

                <Field>
                  <FieldLabel for="telephone">Telephone</FieldLabel>
                  <Input
                    class="text-sm"
                    id="telephone"
                    type="tel"
                    placeholder="Enter telephone..."
                    v-model="employeeForm.telephone"
                    @input:v-model="(e) => (employeeForm.telephone = e.target.value)"
                  />
                </Field>

                <Field>
                  <FieldLabel for="password">Password</FieldLabel>
                  <Input
                    class="text-sm"
                    id="password"
                    type="password"
                    placeholder="Enter password..."
                    v-model="employeeForm.password"
                    @input:v-model="(e) => (employeeForm.password = e.target.value)"
                  />
                </Field>

                <Field>
                  <FieldLabel for="confirmPassword">Confirm Password</FieldLabel>
                  <Input
                    class="text-sm"
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm password..."
                    v-model="employeeForm.confirmPassword"
                    @input:v-model="(e) => (employeeForm.confirmPassword = e.target.value)"
                  />
                </Field>

                <Field>
                  <FieldLabel for="employeeImage">Employee Image</FieldLabel>
                  <Input
                    type="file"
                    id="employeeImage"
                    :key="fileInputKey"
                    @change="handleFileChange"
                  />
                </Field>

                <div v-if="employeeImageUrl" class="flex justify-center">
                  <img
                    :src="employeeImageUrl"
                    :alt="`Image of ${employeeForm.firstName} ${employeeForm.lastName}`"
                    class="object-cover w-lg"
                  />
                </div>

                <Field class="col-span-full grid grid-cols-1 sm:grid-cols-2">
                  <Button
                    class="cursor-pointer"
                    variant="outline"
                    @click="handleResetEmployeeForm"
                    type="button"
                  >
                    Reset
                  </Button>
                  <Button
                    variant="default"
                    type="button"
                    class="cursor-pointer"
                    @click="
                      () => {
                        if (validateEmployeeForm()) {
                          handleSubmitEmployeeForm()
                        }
                      }
                    "
                  >
                    Confirm Submission
                  </Button>
                </Field>
              </FieldGroup>
            </FieldSet>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableCaption>A list of employees and their assigned roles.</TableCaption>
        <TableHeader>
          <TableRow class="bg-primary text-primary-foreground hover:bg-primary">
            <TableHead>No</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telephone</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Role Description</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow
            v-for="employee in employees"
            :key="employee.employee_id"
            class="cursor-pointer"
            @click="() => router.push(`/employees/${employee.employee_id}`)"
          >
            <TableCell>{{ employee.no }}</TableCell>
            <TableCell>{{ employee.employee_name }}</TableCell>
            <TableCell>{{ employee.employee_email }}</TableCell>
            <TableCell>{{ employee.employee_telephone }}</TableCell>
            <TableCell>
              <Badge v-if="employee.role.role_name === 'super_admin'" variant="default">{{
                employee.role.role_name
              }}</Badge>
              <Badge v-else-if="employee.role.role_name === 'admin'" variant="secondary">{{
                employee.role.role_name
              }}</Badge>
              <Badge v-if="employee.role.role_name === 'employee'" variant="outline">{{
                employee.role.role_name
              }}</Badge>
            </TableCell>
            <TableCell class="text-muted-foreground">{{
              employee.role.role_description
            }}</TableCell>
            <TableCell class="text-right">
              <Button variant="ghost" size="icon">
                <MoreHorizontal class="size-4" />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <PaginatorComponent
        :totalPages="totalPages"
        v-model:currentPage="currentPage"
        v-model:pageSize="pageSize"
      />
    </CardContent>
  </Card>
</template>
