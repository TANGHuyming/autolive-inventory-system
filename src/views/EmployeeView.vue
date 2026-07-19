<script setup>
import { MoreHorizontal } from '@lucide/vue'
import { onMounted, ref, watch } from 'vue'
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

const searchQuery = ref('')
const employeeStore = useEmployeeStore()
const { employees, success, error, loading } = storeToRefs(employeeStore)
const { fetchEmployees } = employeeStore

const handleSearch = async (e) => {
  e.preventDefault()
  await fetchEmployees({
    searchQuery: searchQuery.value,
  })
}

onMounted(async () => {
  await fetchEmployees()
})
</script>

<template>
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

  <div v-if="loading" class="max-w-7xl mx-auto space-y-2">
    <Skeleton v-for="n in 10" :key="n" class="bg-accent w-full h-10" />
  </div>

  <Table v-else class="max-w-7xl mx-auto overflow-scroll my-5">
    <TableCaption>A list of employees and their assigned roles.</TableCaption>
    <TableHeader>
      <TableRow class="bg-primary text-primary-foreground hover:bg-primary">
        <TableHead>Name</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Telephone</TableHead>
        <TableHead>Role</TableHead>
        <TableHead>Role Description</TableHead>
        <TableHead class="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>

    <TableBody>
      <TableRow v-for="employee in employees" :key="employee.employee_id" class="cursor-pointer">
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
        <TableCell class="text-muted-foreground">{{ employee.role.role_description }}</TableCell>
        <TableCell class="text-right">
          <Button variant="ghost" size="icon">
            <MoreHorizontal class="size-4" />
          </Button>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
