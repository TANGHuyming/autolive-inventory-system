<script setup>
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Mail, Phone } from '@lucide/vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { onMounted, ref, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useEmployeeStore } from '@/stores/EmployeeStore'
import { storeToRefs } from 'pinia'
import { toast } from 'vue-sonner'

const searchQuery = ref('')
const route = useRoute()
const router = useRouter()
const employeeStore = useEmployeeStore()
const { employee, loading, error } = storeToRefs(employeeStore)
const { fetchEmployeeDetail, updateEmployee, deleteEmployee } = employeeStore

const employeeImageUrl = ref('')
const deleteDialogOpen = ref(false)
const fileInputKey = ref(0)
const showEmployeeForm = ref(false)

const employeeForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  telephone: '',
  password: '',
  confirmPassword: '',
})

const handleRefillEmployeeForm = () => {
  fileInputKey.value++
  employeeForm.value = {
    firstName: employee.value.employee_first_name || '',
    lastName: employee.value.employee_last_name || '',
    email: employee.value.employee_email || '',
    telephone: employee.value.employee_telephone || '',
    password: '',
    confirmPassword: '',
    employeeImage: null,
  }
}

const validateEmployeeForm = () => {
  try {
    if (
      !Object.entries(employeeForm.value).some(([key, value]) => !value && key !== 'employeeImage')
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

const handleSubmitEmployeeForm = () => {
  const payload = toPayload(employeeForm.value)
  updateEmployee(route.params.employeeId, payload)
  if (!error.value) {
    handleRefillEmployeeForm()
    showEmployeeForm.value = false
    fetchEmployeeDetail(route.params.employeeId, {})
  }
}

const handleSearch = async (e) => {
  e.preventDefault()
  await fetchEmployeeDetail(route.params.employeeId, {
    searchQuery: searchQuery.value,
  })
}

const handleDeleteEmployee = async () => {
  deleteEmployee(route.params.employeeId)
  if (!error.value) {
    router.push('/employees')
  }
}

function formatDate(dateStr) {
  return new Date(dateStr.replace(' ', 'T')).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

watch(employee, () => {
  if (employee.value) {
    handleRefillEmployeeForm()
  }
})

onMounted(async () => {
  await fetchEmployeeDetail(route.params.employeeId, {})
})

onUnmounted(() => {
  if (employeeImageUrl.value) {
    URL.revokeObjectURL(employeeImageUrl.value)
  }
})
</script>

<template>
  <div v-if="loading || !employee" class="max-w-7xl mx-auto space-y-2">
    <Skeleton v-for="n in 10" :key="n" class="bg-accent w-full h-10" />
  </div>

  <div v-else class="space-y-6 max-w-7xl mx-auto">
    <!-- Employee Overview -->
    <Card>
      <CardHeader>
        <div class="flex flex-col sm:flex-row items-start justify-between gap-2">
          <div class="flex flex-row items-center gap-5">
            <Avatar class="sm:w-20 sm:h-20 w-12 h-12">
              <AvatarImage src="" />
              <AvatarFallback>
                <img
                  src="../../public/frontGate.png"
                  :alt="`Profile picture of employee: ${employee.employee_name}`"
                  class="w-full h-full object-cover"
                />
              </AvatarFallback>
            </Avatar>
            <CardTitle class="text-lg md:text-2xl">{{ employee.employee_name }}</CardTitle>
            <p v-if="employee.employee_name_khmer" class="text-muted-foreground">
              {{ employee.employee_name_khmer }}
            </p>
            <Badge variant="default">{{ employee.role.role_name }}</Badge>
          </div>

          <div>
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
                  >Edit Employee</Button
                >
              </DialogTrigger>

              <DialogContent class="min-w-[90vw] max-h-[70vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle> Edit current employee </DialogTitle>
                  <DialogDescription>
                    Fill in the form below to edit employee information
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
                        @click="handleRefillEmployeeForm"
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

            <Dialog v-model:open="deleteDialogOpen">
              <DialogTrigger asChild>
                <Button variant="destructive" class="cursor-pointer ml-2">Delete Employee</Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure you want to delete this employee?</DialogTitle>
                  <DialogDescription>
                    This will permanently delete the employee from our database.
                  </DialogDescription>
                </DialogHeader>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button variant="default" class="cursor-pointer" @click="handleDeleteEmployee"
                    >Yes</Button
                  >
                  <Button
                    variant="destructive"
                    class="cursor-pointer"
                    @click="() => (deleteDialogOpen = false)"
                  >
                    No
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 sm:grid-cols-2">
          <div class="flex flex-row items-center gap-2 text-xs sm:text-sm md:text-md">
            <Mail />{{ employee.employee_email }}
          </div>
          <div class="flex flex-row items-center gap-2 text-xs sm:text-sm md:text-md">
            <Phone />{{ employee.employee_telephone }}
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Transactions -->
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="max-w-7xl mx-auto my-5">
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
        </div>

        <Table>
          <TableCaption
            >{{ employee.transactions.length }} transaction(s) for this item.</TableCaption
          >
          <TableHeader>
            <TableRow class="bg-primary text-primary-foreground hover:bg-primary">
              <TableHead>Transaction ID</TableHead>
              <TableHead>Requester</TableHead>
              <TableHead>Telephone</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="tx in employee.transactions"
              :key="tx.transaction_id"
              class="cursor-pointer"
            >
              <TableCell>#{{ tx.transaction_id }}</TableCell>
              <TableCell>{{ tx.requester_name }}</TableCell>
              <TableCell>{{ tx.telephone }}</TableCell>
              <TableCell>{{ formatDate(tx.transaction_date) }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
