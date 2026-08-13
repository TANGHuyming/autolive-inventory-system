<script setup>
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MoreHorizontal } from '@lucide/vue'
import { onMounted, ref, watch } from 'vue'
import PaginatorComponent from '@/components/PaginatorComponent.vue'
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

const searchQuery = ref('')
const route = useRoute()
const router = useRouter()
const pageSize = ref(10)
const currentPage = ref(1)
const totalPages = ref(1)
const employeeStore = useEmployeeStore()
const { employees, loading } = storeToRefs(employeeStore)
const { fetchEmployees } = employeeStore

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
