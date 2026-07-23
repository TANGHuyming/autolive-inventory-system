<script setup>
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, ChevronsUpDown, Trash2 } from '@lucide/vue'
import { onMounted, ref, watch, computed } from 'vue'
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useInventoryStore } from '@/stores/InventoryStore'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useWarehouseStore } from '@/stores/WarehouseStore'

const searchQuery = ref('')
const router = useRouter()
const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const { items, makes, loading, success, error } = storeToRefs(inventoryStore)
const { warehouses } = storeToRefs(warehouseStore)
const { fetchItems, fetchMakes } = inventoryStore
const { fetchWarehouses } = warehouseStore

const warehousePopoverOpen = ref(false)
const selectedWarehouse = ref('')
const searchWarehouse = ref('')
const filteredWarehouses = computed(() => {
  return warehouses.value.filter((w) =>
    w.warehouse_name.toUpperCase().includes(searchWarehouse.value.toUpperCase()),
  )
})

const makePopoverOpen = ref(false)
const selectedMake = ref('')
const searchMake = ref('')
const filteredMakes = computed(() => {
  return makes.value.filter((m) =>
    m.make_name.toUpperCase().includes(searchMake.value.toUpperCase()),
  )
})

const carModelPopoverOpen = ref(false)
const selectedCarModel = ref('')
const searchCarModel = ref('')
const filteredCarModels = computed(() => {
  if (selectedMake.value.length === 0) return []
  const availableCarModels = makes.value.find((m) => m.make_name === selectedMake.value).car_models

  return availableCarModels.filter((m) =>
    m.car_model_name.toUpperCase().includes(searchCarModel.value.toUpperCase()),
  )
})

const yearRangePopoverOpen = ref(false)
const selectedYearRange = ref([])
const yearRange = computed(() => {
  if (selectedCarModel.value.length === 0) return []
  const availableYears = filteredCarModels.value.find(
    (m) => m.car_model_name === selectedCarModel.value,
  ).years
  return [availableYears[0].year_name, availableYears[availableYears.length - 1].year_name]
})

const showLocationForm = ref(false)

const locationForm = ref({
  warehouseName: '',
  bay: '',
  shelf: '',
})

const itemForm = ref({
  itemName: '',
  itemNameKhmer: '',
  itemCode: '',
  make: '',
  carModel: '',
  yearRange: [],
})

const itemsToAssign = ref([])

const handleSearch = async (e) => {
  e.preventDefault()
  await fetchItems({
    searchQuery: searchQuery.value,
  })
}

const goToItem = (value) => {
  router.push(`/items/${value}`)
}

const handleResetLocationForm = () => {
  selectedWarehouse.value = ''
  locationForm.value = {
    warehouseName: '',
    bay: '',
    shelf: '',
  }
}

const handleResetForm = () => {
  selectedMake.value = ''
  selectedCarModel.value = ''
  itemForm.value = {
    itemName: '',
    itemNameKhmer: '',
    itemCode: '',
    make: '',
    carModel: '',
    yearRange: [],
  }
}

const handleAddMoreItems = () => {
  itemForm.value = {
    ...itemForm.value,
    make: selectedMake.value,
    carModel: selectedCarModel.value,
    yearRange: selectedYearRange.value,
  }

  itemsToAssign.value.push(itemForm.value)

  handleResetForm()
}

const removeItem = (index) => {
  itemsToAssign.value.splice(index, 1)
}

onMounted(async () => {
  await fetchItems()
  await fetchMakes()
  await fetchWarehouses()
})

watch(selectedMake, () => {
  selectedCarModel.value = ''
})

watch(selectedCarModel, () => {
  selectedYearRange.value = yearRange.value
})
</script>

<template>
  <div v-if="loading || !items" class="max-w-7xl mx-auto space-y-2">
    <Skeleton v-for="n in 10" :key="n" class="bg-accent w-full h-10" />
  </div>

  <Card v-else class="max-w-7xl mx-auto overflow-scroll my-5">
    <CardHeader>Inventory List</CardHeader>

    <CardContent>
      <div class="flex flex-row flex-wrap justify-between items-center my-5 gap-2">
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
              @click="() => (showLocationForm = true)"
              >Add Item</Button
            >
          </DialogTrigger>

          <DialogContent class="min-w-[90vw]">
            <DialogHeader>
              <DialogTitle> Add a new item </DialogTitle>
              <DialogDescription>
                Fill in the form below to add a new item to the inventory
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
                        {{ !selectedWarehouse ? 'Select Warehouse' : selectedWarehouse }}
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
                              selectedWarehouse = w.warehouse_name
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
                  <Input
                    class="text-sm"
                    id="bay"
                    type="text"
                    placeholder="Enter bay name..."
                    v-model="locationForm.bay"
                    @input:v-model="(e) => (locationForm.bay = e.target.value)"
                  />
                </Field>

                <Field>
                  <FieldLabel for="shelf">Shelf</FieldLabel>
                  <Input
                    class="text-sm"
                    id="shelf"
                    type="text"
                    placeholder="Enter shelf name..."
                    v-model="locationForm.shelf"
                    @input:v-model="(e) => (locationForm.shelf = e.target.value)"
                  />
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
                      }
                    "
                  >
                    Next
                  </Button>
                </Field>
              </FieldGroup>

              <FieldGroup class="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-6" v-else>
                <Field>
                  <FieldLabel for="itemName">Name (EN)</FieldLabel>
                  <Input
                    class="text-sm"
                    id="itemName"
                    type="text"
                    placeholder="Enter item name..."
                    v-model="itemForm.itemName"
                    @input:v-model="(e) => (itemForm.itemName = e.target.value)"
                  />
                </Field>

                <Field>
                  <FieldLabel for="itemNameKhmer">Name (KH)</FieldLabel>
                  <Input
                    class="text-sm"
                    id="itemNameKhmer"
                    type="text"
                    placeholder="សូមបញ្ចូលឈ្មោះ......"
                    v-model="itemForm.itemNameKhmer"
                    @input:v-model="(e) => (itemForm.itemNameKhmer = e.target.value)"
                  />
                </Field>

                <Field>
                  <FieldLabel for="itemCode">Replace Code</FieldLabel>
                  <Input
                    class="text-sm"
                    id="itemCode"
                    type="text"
                    placeholder="Enter item code..."
                    v-model="itemForm.itemCode"
                    @input:v-model="(e) => (itemForm.itemCode = e.target.value)"
                  />
                </Field>

                <Field>
                  <FieldLabel for="itemStockQuantity">Stock Quantity</FieldLabel>
                  <Input
                    class="text-sm"
                    id="itemStockQuantity"
                    type="number"
                    :min="0"
                    placeholder="Enter stock quantity..."
                    v-model="itemForm.itemStockQuantity"
                    @input:v-model="(e) => (itemForm.itemStockQuantity = e.target.value)"
                  />
                </Field>

                <!-- Car make -->
                <Field>
                  <FieldLabel for="itemMake">Make</FieldLabel>
                  <Popover id="itemMake" v-model:open="makePopoverOpen">
                    <PopoverTrigger as-child>
                      <Button variant="outline" role="combobox" class="w-full justify-between">
                        {{ selectedMake || 'Select make...' }}
                        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent class="w-full p-0">
                      <div class="p-2 border-b">
                        <Input
                          type="text"
                          placeholder="Search make..."
                          v-model="searchMake"
                          autofocus
                        />
                      </div>
                      <ScrollArea class="max-h-60 overflow-y-auto">
                        <div
                          v-for="m in filteredMakes"
                          :key="m.make_id"
                          class="px-3 py-2 cursor-pointer hover:bg-accent text-sm"
                          @click="
                            () => {
                              selectedMake = m.make_name
                              makePopoverOpen = false
                            }
                          "
                        >
                          {{ m.make_name }}
                        </div>
                        <div
                          v-if="!filteredMakes.length"
                          class="px-3 py-2 text-sm text-muted-foreground"
                        >
                          No make found.
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                </Field>

                <!-- Car model -->
                <Field>
                  <FieldLabel for="itemCarModel">Car Model</FieldLabel>
                  <Popover id="itemCarModel" v-model:open="carModelPopoverOpen">
                    <PopoverTrigger as-child :disabled="!selectedMake">
                      <Button variant="outline" role="combobox" class="w-full justify-between">
                        {{
                          !selectedMake
                            ? 'Select make first'
                            : selectedCarModel || 'Select car model...'
                        }}
                        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent class="w-full p-0">
                      <div class="p-2 border-b">
                        <Input
                          type="text"
                          placeholder="Search car model..."
                          v-model="searchCarModel"
                          autofocus
                        />
                      </div>
                      <ScrollArea class="max-h-60 overflow-y-auto">
                        <div
                          v-for="m in filteredCarModels"
                          :key="m.car_model_name"
                          class="px-3 py-2 cursor-pointer hover:bg-accent text-sm"
                          @click="
                            () => {
                              selectedCarModel = m.car_model_name
                              carModelPopoverOpen = false
                            }
                          "
                        >
                          {{ m.car_model_name }}
                        </div>
                        <div
                          v-if="!filteredCarModels.length"
                          class="px-3 py-2 text-sm text-muted-foreground"
                        >
                          No car model found.
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                </Field>

                <Field>
                  <FieldLabel for="yearRange">Year</FieldLabel>
                  <Popover id="yearRange" v-model:open="yearRangePopoverOpen">
                    <PopoverTrigger asChild :disabled="!selectedCarModel">
                      <Button variant="outline" role="combobox" class="w-full justify-between">
                        <span>Select Year Range</span>
                        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <h2 class="text-md font-bold text-foreground text-center">
                        {{ selectedYearRange[0] + ' to ' + selectedYearRange[1] }}
                      </h2>
                      <Slider
                        v-model="selectedYearRange"
                        :step="1"
                        :min="yearRange[0]"
                        :max="yearRange[1]"
                      ></Slider>

                      <div v-if="!yearRange.length" class="px-3 py-2 text-sm text-muted-foreground">
                        No year(s) found.
                      </div>
                    </PopoverContent>
                  </Popover>
                </Field>

                <Field>
                  <FieldLabel for="itemImage">Item Image</FieldLabel>
                  <Input
                    type="file"
                    accept="image/jpg, image/jpeg, image/png, image/avif"
                    id="itemImage"
                  />
                </Field>

                <Field class="col-span-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
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
                    variant="outline"
                    @click="handleResetForm"
                    type="button"
                  >
                    Reset
                  </Button>
                  <Button
                    variant="secondary"
                    type="button"
                    class="cursor-pointer"
                    :class="{
                      'opacity-50': loading,
                    }"
                    :disabled="loading"
                    @click="handleAddMoreItems"
                  >
                    Add More Items
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

                <div class="col-span-full h-36 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow class="bg-primary text-primary-foreground hover:bg-primary">
                        <TableHead>Name (EN)</TableHead>
                        <TableHead>Name (KH)</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead class="text-right">Stock</TableHead>
                        <TableHead>Make</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead class="w-[60px]"></TableHead>
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
                        <TableCell class="text-right">{{ item.itemStockQuantity }}</TableCell>
                        <TableCell>{{ item.make }}</TableCell>
                        <TableCell>{{ item.carModel }}</TableCell>
                        <TableCell>{{ item.yearRange[0] }}–{{ item.yearRange[1] }}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            class="h-8 w-8 cursor-pointer"
                            @click="removeItem(index)"
                          >
                            <Trash2 class="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </FieldGroup>
            </FieldSet>
          </DialogContent>
        </Dialog>
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
