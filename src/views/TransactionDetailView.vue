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
import { Mail, Phone, MapPin, User } from '@lucide/vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Skeleton } from '@/components/ui/skeleton'
import { useTransactionStore } from '@/stores/TransactionStore'
import { storeToRefs } from 'pinia'

const route = useRoute()
const transactionStore = useTransactionStore()
const { transaction, loading, success, error } = storeToRefs(transactionStore)
const { fetchTransactionDetail } = transactionStore

function formatDate(dateStr) {
  return new Date(dateStr.replace(' ', 'T')).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatAddress(w) {
  return [w.house_number, w.street, w.village, w.commune, w.district, w.city]
    .filter(Boolean)
    .join(', ')
}

onMounted(async () => {
  await fetchTransactionDetail(route.params.transactionId)
})
</script>

<template>
  <div v-if="loading || !transaction" class="max-w-7xl mx-auto space-y-2">
    <Skeleton v-for="n in 10" :key="n" class="bg-accent w-full h-10" />
  </div>

  <div v-else class="space-y-6 max-w-7xl mx-auto">
    <!-- Transaction Overview -->
    <Card>
      <CardHeader>
        <div class="flex flex-col sm:flex-row items-start justify-between gap-2">
          <div>
            <CardTitle class="text-lg md:text-2xl"
              >Transaction #{{ transaction.transaction_id }}</CardTitle
            >
            <p class="text-muted-foreground text-sm">
              {{ formatDate(transaction.transaction_date) }}
            </p>
          </div>
          <Badge variant="default">{{ transaction.warehouse.warehouse_name }}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-row items-center gap-2 text-xs sm:text-sm md:text-md">
            <User class="w-4 h-4" />{{ transaction.requester_name }}
          </div>
          <div class="flex flex-row items-center gap-2 text-xs sm:text-sm md:text-md">
            <Phone class="w-4 h-4" />{{ transaction.telephone }}
          </div>
          <div class="flex flex-row items-center gap-2 text-xs sm:text-sm md:text-md sm:col-span-2">
            <MapPin class="min-w-4 min-h-4 w-4 h-4" />{{ formatAddress(transaction.warehouse) }}
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Approver -->
    <Card>
      <CardHeader>
        <CardTitle>Approved By</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-col sm:flex-row items-center gap-5">
          <Avatar class="w-12 h-12">
            <AvatarImage src="" />
            <AvatarFallback>
              <img
                src="../../public/frontGate.png"
                :alt="`Profile picture of employee: ${transaction.approver.employee_name}`"
                class="w-full h-full object-cover"
              />
            </AvatarFallback>
          </Avatar>
          <div>
            <p class="font-medium text-sm sm:text-md">{{ transaction.approver.employee_name }}</p>
            <div
              class="flex flex-col sm:flex-row sm:gap-4 text-xs sm:text-sm text-muted-foreground"
            >
              <div class="flex items-center gap-1">
                <Mail class="w-3 h-3" />{{ transaction.approver.employee_email }}
              </div>
              <div class="flex items-center gap-1">
                <Phone class="w-3 h-3" />{{ transaction.approver.employee_telephone }}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Items -->
    <Card>
      <CardHeader>
        <CardTitle>Items</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>{{ transaction.items.length }} item(s) in this transaction.</TableCaption>
          <TableHeader>
            <TableRow class="bg-primary text-primary-foreground hover:bg-primary">
              <TableHead>Item Code</TableHead>
              <TableHead>Name (EN)</TableHead>
              <TableHead>Name (KH)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="item in transaction.items" :key="item.item_id">
              <TableCell class="font-mono">{{ item.item_code }}</TableCell>
              <TableCell>{{ item.item_name_en }}</TableCell>
              <TableCell class="text-muted-foreground">{{ item.item_name_kh ?? '—' }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
