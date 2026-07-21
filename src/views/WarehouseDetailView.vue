<script setup>
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { MapPin } from '@lucide/vue'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useWarehouseStore } from '@/stores/WarehouseStore'
import { storeToRefs } from 'pinia'

const searchQuery = ref('')
const route = useRoute()
const warehouseStore = useWarehouseStore()
const { warehouse, loading, success, error } = storeToRefs(warehouseStore)
const { fetchWarehouseDetails } = warehouseStore

const handleSearch = async (e) => {
  e.preventDefault()
  await fetchWarehouseDetails(route.params.warehouseId, {
    searchQuery: searchQuery.value,
  })
}

function formatAddress(w) {
  return [w.house_number, w.street, w.village, w.commune, w.district, w.city]
    .filter(Boolean)
    .join(', ')
}

onMounted(async () => {
  await fetchWarehouseDetails(route.params.warehouseId, {})
})
</script>

<template>
  <div v-if="loading || !warehouse" class="max-w-7xl mx-auto space-y-2">
    <Skeleton v-for="n in 10" :key="n" class="bg-accent w-full h-10" />
  </div>

  <div v-else class="space-y-6 max-w-7xl mx-auto">
    <!-- Warehouse Overview -->
    <Card>
      <CardHeader>
        <div class="flex flex-col sm:flex-row items-start justify-between gap-2">
          <div class="flex flex-row items-center gap-5">
            <Avatar class="sm:w-20 sm:h-20 w-12 h-12">
              <AvatarImage src="" />
              <AvatarFallback>
                <img
                  src="../../public/frontGate.png"
                  :alt="`Picture of warehouse: ${warehouse.warehouse_name}`"
                  class="w-full h-full object-cover"
                />
              </AvatarFallback>
            </Avatar>
            <CardTitle class="text-lg md:text-2xl">{{ warehouse.warehouse_name }}</CardTitle>
            <p v-if="warehouse.warehouse_name_khmer" class="text-muted-foreground">
              {{ warehouse.warehouse_name_khmer }}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="flex flex-row items-center gap-2 text-xs sm:text-sm md:text-md sm:col-span-2">
          <MapPin class="min-w-4 min-h-4 w-4 h-4" />{{ formatAddress(warehouse) }}
        </div>
      </CardContent>
    </Card>

    <!-- Bays -->
    <Card>
      <CardHeader>
        <CardTitle>Bays</CardTitle>
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
          <TableCaption>{{ warehouse.bays.length }} bay(s) in this warehouse.</TableCaption>
          <TableHeader>
            <TableRow class="bg-primary text-primary-foreground hover:bg-primary">
              <TableHead>Bay ID</TableHead>
              <TableHead>Bay Name</TableHead>
              <TableHead>Bay Capacity (Shelves)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="b in warehouse.bays" :key="b.bay_id" class="cursor-pointer">
              <TableCell>#{{ b.bay_id }}</TableCell>
              <TableCell>{{ b.bay_name }}</TableCell>
              <TableCell>{{ b.shelf_count }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
