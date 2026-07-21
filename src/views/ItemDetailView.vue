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
import { MapPin, Package } from '@lucide/vue'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useInventoryStore } from '@/stores/InventoryStore'
import { storeToRefs } from 'pinia'

const searchQuery = ref('')
const route = useRoute()
const inventoryStore = useInventoryStore()
const { item, loading, success, error } = storeToRefs(inventoryStore)
const { fetchItemDetails } = inventoryStore

const handleSearch = async (e) => {
  e.preventDefault()
  await fetchItemDetails(route.params.itemId, {
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
  await fetchItemDetails(route.params.itemId, {})
})
</script>

<template>
  <div v-if="loading || !item" class="max-w-7xl mx-auto space-y-2">
    <Skeleton v-for="n in 10" :key="n" class="bg-accent w-full h-10" />
  </div>

  <div v-else class="space-y-6 max-w-7xl mx-auto">
    <!-- Item Overview -->
    <Card>
      <CardHeader>
        <div class="flex flex-col sm:flex-row items-start justify-between gap-2">
          <div>
            <CardTitle class="text-lg md:text-2xl">{{ item.item_name_en }}</CardTitle>
            <p v-if="item.item_name_kh" class="text-muted-foreground">{{ item.item_name_kh }}</p>
          </div>
          <Badge variant="default">Code: {{ item.item_code }}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <p class="col-span-full text-sm text-muted-foreground">Compatible Vehicle</p>
          <div v-for="(fitment, i) in item.item_year" :key="i" class="rounded-md border p-3">
            <p class="font-medium">
              {{ fitment.car_model.make.make_name }} {{ fitment.car_model.car_model_name }}
            </p>
            <p class="text-sm text-muted-foreground">
              {{ fitment.year_name }} · {{ fitment.car_model.make.make_country_of_origin }}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Shelf / Warehouse Locations -->
    <div class="space-y-3">
      <Card>
        <CardHeader><CardTitle>Stock Locations</CardTitle></CardHeader>
        <CardContent
          v-for="(shelf, i) in item.shelves"
          :key="i"
          class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4"
        >
          <div class="flex items-center gap-3">
            <div class="rounded-full bg-muted p-2">
              <MapPin class="h-5 w-5 text-muted-foreground" />
            </div>

            <div>
              <RouterLink
                :to="`/warehouses/${shelf.bay.warehouse.warehouse_id}`"
                class="font-medium hover:underline underline-offset-4"
                >{{ shelf.bay.warehouse.warehouse_name }}</RouterLink
              >
              <p class="text-sm text-muted-foreground">
                {{ shelf.bay.warehouse.village }}, {{ shelf.bay.warehouse.commune }},
                {{ shelf.bay.warehouse.district }}, {{ shelf.bay.warehouse.city }}
              </p>
              <p class="text-xs text-muted-foreground">
                Street {{ shelf.bay.warehouse.street }}, House No.
                {{ shelf.bay.warehouse.house_number }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-6 text-right">
            <div>
              <p class="text-sm text-muted-foreground">Bay</p>
              <p class="font-medium">{{ shelf.bay.bay_name }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Shelf</p>
              <p class="font-medium">{{ shelf.shelf_name }}</p>
            </div>
            <div class="flex items-center gap-1">
              <Package class="h-4 w-4 text-muted-foreground" />
              <span class="font-semibold">{{ shelf.stock_quantity }}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

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
          <TableCaption>{{ item.transactions.length }} transaction(s) for this item.</TableCaption>
          <TableHeader>
            <TableRow class="bg-primary text-primary-foreground hover:bg-primary">
              <TableHead>Transaction ID</TableHead>
              <TableHead>Approver</TableHead>
              <TableHead>Requester</TableHead>
              <TableHead>Telephone</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="tx in item.transactions"
              :key="tx.transaction_id"
              class="cursor-pointer"
            >
              <TableCell>#{{ tx.transaction_id }}</TableCell>
              <TableCell>{{ tx.approver.employee_name }}</TableCell>
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
