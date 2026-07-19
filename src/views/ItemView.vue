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
import { useInventoryStore } from '@/stores/InventoryStore'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const searchQuery = ref('')
const router = useRouter()
const inventoryStore = useInventoryStore()
const { items, loading, success, error } = storeToRefs(inventoryStore)
const { fetchItems } = inventoryStore

const handleSearch = async (e) => {
  e.preventDefault()
  await fetchItems({
    searchQuery: searchQuery.value,
  })
}

const goToItem = (value) => {
  router.push(`/items/${value}`)
}

onMounted(async () => {
  await fetchItems()
})
</script>

<template>
  <div v-if="loading || !items" class="max-w-7xl mx-auto space-y-2">
    <Skeleton v-for="n in 10" :key="n" class="bg-accent w-full h-10" />
  </div>

  <Card v-else class="max-w-7xl mx-auto overflow-scroll my-5">
    <CardHeader>Inventory List</CardHeader>

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
        <TableCaption>
          <div class="flex flex-wrap justify-start gap-x-6 gap-y-1 text-xs">
            <span
              ><span class="font-medium text-foreground">Item Code</span>: unique part
              identifier</span
            >
            <span
              ><span class="font-medium text-foreground">Item Name</span>: part name (EN / KH)</span
            >
            <span><span class="font-medium text-foreground">Make</span>: vehicle manufacturer</span>
            <span
              ><span class="font-medium text-foreground">Model</span>: vehicle model this part
              fits</span
            >
            <span
              ><span class="font-medium text-foreground">Year</span>: compatible model year</span
            >
            <span
              ><span class="font-medium text-foreground">Origin</span>: manufacturer's country of
              origin</span
            >
          </div>
        </TableCaption>
        <TableHeader>
          <TableRow class="bg-primary text-primary-foreground hover:bg-primary">
            <TableHead class="w-30">Item Code</TableHead>
            <TableHead>Item Name</TableHead>
            <TableHead>Make</TableHead>
            <TableHead>Model</TableHead>
            <TableHead class="w-20">Year</TableHead>
            <TableHead>Origin</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow
            v-for="item in items"
            :key="item.item_code"
            class="cursor-pointer"
            @click="goToItem(item.item_id)"
          >
            <TableCell class="font-mono text-sm">{{ item.item_code }}</TableCell>

            <TableCell>
              <div class="font-medium">{{ item.item_name_en }}</div>
              <div v-if="item.item_name_kh" class="text-sm text-muted-foreground">
                {{ item.item_name_kh }}
              </div>
            </TableCell>

            <TableCell>{{ item.item_year[0]?.car_model.make.make_name }}</TableCell>

            <TableCell>{{ item.item_year[0]?.car_model.car_model_name }}</TableCell>

            <TableCell>{{ item.item_year[0]?.year_name }}</TableCell>

            <TableCell>{{ item.item_year[0]?.car_model.make.make_country_of_origin }}</TableCell>

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
