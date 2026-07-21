<script setup>
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useEmployeeStore } from '@/stores/EmployeeStore'
import { storeToRefs } from 'pinia'

const searchQuery = ref('')
const route = useRoute()
const employeeStore = useEmployeeStore()
const { employee, loading, success, error } = storeToRefs(employeeStore)
const { fetchEmployeeDetail } = employeeStore

const handleSearch = async (e) => {
  e.preventDefault()
  await fetchEmployeeDetail(route.params.employeeId, {
    searchQuery: searchQuery.value,
  })
}

function formatDate(dateStr) {
  return new Date(dateStr.replace(' ', 'T')).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(async () => {
  await fetchEmployeeDetail(route.params.employeeId, {})
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
          </div>
          <Badge variant="default">{{ employee.role.role_name }}</Badge>
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
