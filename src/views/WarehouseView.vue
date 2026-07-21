<script setup>
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { useWarehouseStore } from '@/stores/WarehouseStore'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const searchQuery = ref('')
const router = useRouter()
const warehouseStore = useWarehouseStore()
const { warehouses, loading, success, error } = storeToRefs(warehouseStore)
const { fetchWarehouses } = warehouseStore

const handleSearch = async (e) => {
  e.preventDefault()
  await fetchWarehouses({
    searchQuery: searchQuery.value,
  })
}

const goToWarehouse = (value) => {
  router.push(`/warehouses/${value}`)
}

onMounted(async () => {
  await fetchWarehouses()
})
</script>

<template>
  <div v-if="loading || !warehouses" class="max-w-7xl mx-auto space-y-2">
    <Skeleton v-for="n in 10" :key="n" class="bg-accent w-full h-10" />
  </div>

  <Card v-else class="max-w-7xl mx-auto overflow-scroll my-5">
    <CardHeader>Warehouse List</CardHeader>

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
        <TableCaption> A list of all available warehouses </TableCaption>
        <TableHeader>
          <TableRow class="bg-primary text-primary-foreground hover:bg-primary">
            <TableHead class="w-30">Warehouse Name</TableHead>
            <TableHead>City</TableHead>
            <TableHead>District</TableHead>
            <TableHead>Commune</TableHead>
            <TableHead>Village</TableHead>
            <TableHead>Street</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow
            v-for="warehouse in warehouses"
            :key="warehouse.warehouse_id"
            class="cursor-pointer"
            @click="goToWarehouse(warehouse.warehouse_id)"
          >
            <TableCell>
              <div class="font-medium">{{ warehouse.warehouse_name }}</div>
              <div v-if="warehouse.warehouse_name_khmer" class="text-sm text-muted-foreground">
                {{ warehouse.warehouse_name_khmer }}
              </div>
            </TableCell>

            <TableCell>{{ warehouse.city }}</TableCell>

            <TableCell>{{ warehouse.district }}</TableCell>

            <TableCell>{{ warehouse.commune }}</TableCell>

            <TableCell>{{ warehouse.village }}</TableCell>

            <TableCell>{{ warehouse.street }}</TableCell>

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
