<script setup>
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MoreHorizontal } from '@lucide/vue'
import { onMounted, ref } from 'vue'
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
import { useTransactionStore } from '@/stores/TransactionStore'
import { storeToRefs } from 'pinia'

const searchQuery = ref('')
const transactionStore = useTransactionStore()
const { transactions, loading, success, error } = storeToRefs(transactionStore)
const { fetchTransactions } = transactionStore

const handleSearch = async (e) => {
  e.preventDefault()
  await fetchTransactions({
    searchQuery: searchQuery.value,
  })
}

onMounted(async () => {
  await fetchTransactions()
})
</script>

<template>
  <div v-if="loading" class="max-w-7xl mx-auto space-y-2">
    <Skeleton v-for="n in 10" :key="n" class="bg-accent w-full h-10" />
  </div>

  <Card v-else class="max-w-7xl mx-auto overflow-scroll my-5">
    <CardHeader>Transaction List</CardHeader>
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
        <TableCaption>A list of recent warehouse transactions.</TableCaption>
        <TableHeader>
          <TableRow class="bg-primary text-primary-foreground hover:bg-primary">
            <TableHead>Warehouse</TableHead>
            <TableHead>Approver</TableHead>
            <TableHead>Requester</TableHead>
            <TableHead>Telephone</TableHead>
            <TableHead>Transaction Date</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow
            v-for="transaction in transactions"
            :key="transaction.transaction_id"
            class="cursor-pointer"
          >
            <TableCell>{{ transaction.warehouse.warehouse_name }}</TableCell>
            <TableCell>{{ transaction.approver.employee_name }}</TableCell>
            <TableCell>{{ transaction.requester_name }}</TableCell>
            <TableCell>{{ transaction.telephone }}</TableCell>
            <TableCell>{{ transaction.transaction_date }}</TableCell>
            <TableCell class="text-right">
              <Button variant="ghost" size="icon">
                <MoreHorizontal class="size-4" />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</template>
