<script setup>
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MoreHorizontal, Plus, Trash2, ChevronsUpDown } from '@lucide/vue'
import { onMounted, ref, computed } from 'vue'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useTransactionStore } from '@/stores/TransactionStore'
import { useInventoryStore } from '@/stores/InventoryStore'
import { useWarehouseStore } from '@/stores/WarehouseStore'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const searchQuery = ref('')
const itemSearchQuery = ref('')
const router = useRouter()
const transactionStore = useTransactionStore()
const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const { transactions, loading } = storeToRefs(transactionStore)
const { warehouses } = storeToRefs(warehouseStore)
const { items } = storeToRefs(inventoryStore)
const { fetchTransactions } = transactionStore
const { fetchWarehouses } = warehouseStore
const { fetchItems } = inventoryStore

const showLocationForm = ref(false)
const showAssignedItems = ref(false)

const quantity = ref(1)

const warehousePopoverOpen = ref(false)
const searchWarehouse = ref('')
const filteredWarehouses = computed(() => {
  return warehouses.value.filter((w) =>
    w.warehouse_name.toUpperCase().includes(searchWarehouse.value.toUpperCase()),
  )
})

const bayPopoverOpen = ref(false)
const searchBay = ref('')
const filteredBays = computed(() => {
  if (!locationForm.value.warehouse) return []

  const availableBays = warehouses.value.find(
    (w) => w.warehouse_name === locationForm.value.warehouse,
  ).bays

  return availableBays.filter((b) =>
    b.bay_name.toUpperCase().includes(searchBay.value.toUpperCase()),
  )
})

const shelfPopoverOpen = ref(false)
const searchShelf = ref('')
const filteredShelves = computed(() => {
  if (!locationForm.value.bay) return []

  const availableShelves = filteredBays.value.find(
    (b) => b.bay_name === locationForm.value.bay,
  ).shelves

  return availableShelves.filter((s) =>
    s.shelf_name.toUpperCase().includes(searchShelf.value.toUpperCase()),
  )
})

const locationForm = ref({
  warehouse: '',
  bay: '',
  shelf: '',
  shelfId: '',
})

const itemsToAssign = ref([])

const handleResetLocationForm = () => {
  locationForm.value = {
    warehouse: '',
    bay: '',
    shelf: '',
    shelfId: '',
  }
}

const handleAddMoreItems = (item, shelfId) => {
  itemsToAssign.value.push({
    itemName: item.item_name_en,
    itemNameKhmer: item.item_name_kh,
    itemCode: item.item_code,
    itemStockQuantity: item.shelves[0].stock_quantity,
    make: item.item_year[0].car_model.make.make_name,
    carModel: item.item_year[0].car_model.car_model_name,
    yearRange: [item.item_year[0].year_name, item.item_year[item.item_year.length - 1].year_name],
    inventoryId: item.item_id,
    shelfId: shelfId,
    quantity: quantity.value,
  })

  quantity.value = 1
}

const removeItem = (itemId) => {
  const index = itemsToAssign.value.findIndex((item) => item.inventoryId === itemId)
  itemsToAssign.value.splice(index, 1)
}

const handleSearch = async (e) => {
  e.preventDefault()
  await fetchTransactions({
    searchQuery: searchQuery.value,
  })
}

const handleItemSearch = async (e) => {
  e.preventDefault()
  await fetchItems({
    searchQuery: itemSearchQuery.value,
  })
}

const formatYear = (yearRange) => {
  const start = yearRange[0]
  const end = yearRange[yearRange.length - 1]

  return `${start.year_name} to ${end.year_name}`
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
      <div class="flex flex-col sm:flex-row justify-between my-5 gap-2">
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

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="default"
              class="cursor-pointer"
              @click="
                () => {
                  showLocationForm = true
                  if (warehouses.length === 0) fetchWarehouses()
                }
              "
            >
              Make Transaction
            </Button>
          </DialogTrigger>

          <DialogContent class="min-w-[90vw] max-h-[70vh] overflow-auto">
            <DialogHeader>
              <DialogTitle> Make a new transaction </DialogTitle>
              <DialogDescription>
                Fill in the form below to make a new transaction. This action will notify all admins
              </DialogDescription>
            </DialogHeader>

            <FieldSet>
              <FieldGroup
                class="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-6"
                v-if="showLocationForm"
              >
                <Field>
                  <FieldLabel for="warehouse">Warehouse</FieldLabel>
                  <Popover id="warehouse" v-model:open="warehousePopoverOpen">
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" class="w-full justify-between">
                        {{ locationForm.warehouse || 'Select Warehouse' }}
                        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent class="w-full p-0">
                      <div class="p-2 border-b">
                        <Input
                          type="text"
                          placeholder="Search warehouse..."
                          v-model="searchWarehouse"
                          autofocus
                        />
                      </div>
                      <ScrollArea class="max-h-60 overflow-y-auto">
                        <div
                          v-for="w in filteredWarehouses"
                          :key="w.warehouse_id"
                          class="px-3 py-2 cursor-pointer hover:bg-accent text-sm"
                          @click="
                            () => {
                              locationForm.warehouse = w.warehouse_name
                              locationForm.bay = ''
                              locationForm.shelf = ''
                              warehousePopoverOpen = false
                            }
                          "
                        >
                          {{ w.warehouse_name }}
                        </div>
                        <div
                          v-if="!filteredWarehouses.length"
                          class="px-3 py-2 text-sm text-muted-foreground"
                        >
                          No warehouse found.
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                </Field>

                <Field>
                  <FieldLabel for="bay">Bay</FieldLabel>
                  <Popover id="bay" v-model:open="bayPopoverOpen">
                    <PopoverTrigger asChild :disabled="!locationForm.warehouse">
                      <Button variant="outline" role="combobox" class="w-full justify-between">
                        {{ locationForm.bay || 'Select Bay' }}
                        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent class="w-full p-0">
                      <div class="p-2 border-b">
                        <Input
                          type="text"
                          placeholder="Search bay..."
                          v-model="searchBay"
                          autofocus
                        />
                      </div>
                      <ScrollArea class="max-h-60 overflow-y-auto">
                        <div
                          v-for="b in filteredBays"
                          :key="b.bay_id"
                          class="px-3 py-2 cursor-pointer hover:bg-accent text-sm"
                          @click="
                            () => {
                              locationForm.bay = b.bay_name
                              locationForm.shelf = ''
                              bayPopoverOpen = false
                            }
                          "
                        >
                          {{ b.bay_name }}
                        </div>
                        <div
                          v-if="!filteredBays.length"
                          class="px-3 py-2 text-sm text-muted-foreground"
                        >
                          No bay found.
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                </Field>

                <Field>
                  <FieldLabel for="shelf">shelf</FieldLabel>
                  <Popover id="shelf" v-model:open="shelfPopoverOpen">
                    <PopoverTrigger asChild :disabled="!locationForm.bay">
                      <Button variant="outline" role="combobox" class="w-full justify-between">
                        {{ locationForm.shelf || 'Select Shelf' }}
                        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent class="w-full p-0">
                      <div class="p-2 border-b">
                        <Input
                          type="text"
                          placeholder="Search shelf..."
                          v-model="searchShelf"
                          autofocus
                        />
                      </div>
                      <ScrollArea class="max-h-60 overflow-y-auto">
                        <div
                          v-for="s in filteredShelves"
                          :key="s.shelf_id"
                          class="px-3 py-2 cursor-pointer hover:bg-accent text-sm"
                          @click="
                            () => {
                              locationForm.shelf = s.shelf_name
                              locationForm.shelfId = s.shelf_id
                              shelfPopoverOpen = false
                            }
                          "
                        >
                          {{ s.shelf_name }}
                        </div>
                        <div
                          v-if="!filteredShelves.length"
                          class="px-3 py-2 text-sm text-muted-foreground"
                        >
                          No shelf found.
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                </Field>

                <Field class="col-span-full grid grid-cols-1 sm:grid-cols-2">
                  <Button
                    class="cursor-pointer"
                    variant="outline"
                    @click="handleResetLocationForm"
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
                        showLocationForm = false
                        if (items.length === 0) fetchItems()
                      }
                    "
                  >
                    Next
                  </Button>
                </Field>
              </FieldGroup>

              <FieldGroup class="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-6" v-else>
                <Field>
                  <FieldLabel for="search">Search</FieldLabel>
                  <form @submit="handleItemSearch" id="search">
                    <Input
                      type="text"
                      v-model="itemSearchQuery"
                      placeholder="search..."
                      class="w-full sm:max-w-md"
                      @input:v-model="(e) => (itemSearchQuery = e.target.value)"
                    />
                    <Input type="submit" class="hidden" />
                  </form>
                </Field>

                <Field>
                  <FieldLabel for="quantity">Quantity</FieldLabel>
                  <Input
                    class="text-sm"
                    id="quantity"
                    type="number"
                    placeholder="Enter item name..."
                    v-model="quantity"
                    @input:v-model="(e) => (quantity = e.target.value)"
                  />
                </Field>

                <Field class="col-span-full">
                  <Table>
                    <TableHeader>
                      <TableRow class="bg-primary text-primary-foreground hover:bg-primary">
                        <TableHead>Name (EN)</TableHead>
                        <TableHead>Name (KH)</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Make</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead class="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow v-if="!items.length">
                        <TableCell
                          :colspan="8"
                          class="text-center text-muted-foreground py-6 hover:bg-background"
                        >
                          No items added yet.
                        </TableCell>
                      </TableRow>
                      <TableRow
                        v-for="(item, index) in items"
                        :key="index"
                        :class="{
                          'bg-muted text-muted-foreground': itemsToAssign.some(
                            (i) => i.inventoryId === item.item_id,
                          ),
                        }"
                      >
                        <TableCell>{{ item.item_name_en }}</TableCell>
                        <TableCell>{{ item.item_name_kh }}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{{ item.item_code }}</Badge>
                        </TableCell>
                        <TableCell>{{ item.shelves[0].stock_quantity }}</TableCell>
                        <TableCell>{{ item.item_year[0].car_model.make.make_name }}</TableCell>
                        <TableCell>{{ item.item_year[0].car_model.car_model_name }}</TableCell>
                        <TableCell>{{ formatYear(item.item_year) }}</TableCell>
                        <TableCell class="flex justify-center gap-x-2">
                          <Button
                            v-if="!itemsToAssign.some((i) => i.inventoryId === item.item_id)"
                            type="button"
                            variant="ghost"
                            size="icon"
                            class="h-8 w-8 cursor-pointer"
                            @click="handleAddMoreItems(item, locationForm.shelfId)"
                          >
                            <Plus class="h-4 w-4 text-foreground" />
                          </Button>
                          <Button
                            v-else
                            type="button"
                            variant="ghost"
                            size="icon"
                            class="h-8 w-8 cursor-pointer"
                            @click="removeItem(item.item_id)"
                          >
                            <Trash2 class="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Field>

                <Field class="col-span-full grid grid-cols-1 sm:grid-cols-2">
                  <Button
                    class="cursor-pointer"
                    variant="outline"
                    @click="
                      () => {
                        showLocationForm = true
                      }
                    "
                    type="button"
                  >
                    Back
                  </Button>
                  <Button
                    class="cursor-pointer"
                    variant="default"
                    @click="() => (showAssignedItems = true)"
                    type="button"
                  >
                    Next
                  </Button>
                </Field>
              </FieldGroup>
            </FieldSet>
          </DialogContent>
        </Dialog>

        <Dialog v-model:open="showAssignedItems">
          <DialogContent class="min-w-[80vw]">
            <DialogHeader>
              <DialogTitle>Assigned Items</DialogTitle>
              <DialogDescription class="flex flex-col">
                <span>Please confirm that all the items here are correct </span>
                <span class="font-bold text-md">
                  {{
                    `Warehouse: ${locationForm.warehouse}  Bay: ${locationForm.bay}  Shelf: ${locationForm.shelf}`
                  }}
                </span>
              </DialogDescription>
            </DialogHeader>

            <Table>
              <TableHeader>
                <TableRow class="bg-primary text-primary-foreground hover:bg-primary">
                  <TableHead>Name (EN)</TableHead>
                  <TableHead>Name (KH)</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Stock Quantity</TableHead>
                  <TableHead>Transacted Quantity</TableHead>
                  <TableHead>Make</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Year</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-if="!itemsToAssign.length">
                  <TableCell
                    :colspan="8"
                    class="text-center text-muted-foreground py-6 hover:bg-background"
                  >
                    No items added yet.
                  </TableCell>
                </TableRow>
                <TableRow v-for="(item, index) in itemsToAssign" :key="index">
                  <TableCell>{{ item.itemName }}</TableCell>
                  <TableCell>{{ item.itemNameKhmer }}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{{ item.itemCode }}</Badge>
                  </TableCell>
                  <TableCell>{{ item.itemStockQuantity }}</TableCell>
                  <TableCell>{{ item.quantity }}</TableCell>
                  <TableCell>{{ item.make }}</TableCell>
                  <TableCell>{{ item.carModel }}</TableCell>
                  <TableCell>{{ item.yearRange[0] }}–{{ item.yearRange[1] }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div class="flex justify-end">
              <Button type="button" @click="handleSubmitItems" class="w-full sm:max-w-48">
                Confirm Submission
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
            @click="() => router.push(`/transactions/${transaction.transaction_id}`)"
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
