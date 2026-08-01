<script setup>
import { toast } from 'vue-sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import {
  Table,
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { MapPin, Package, ChevronsUpDown } from '@lucide/vue'
import { onMounted, ref, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useInventoryStore } from '@/stores/InventoryStore'
import { storeToRefs } from 'pinia'
import { useWarehouseStore } from '@/stores/WarehouseStore'

const searchQuery = ref('')
const route = useRoute()
const router = useRouter()
const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const { item, makes, loading, error } = storeToRefs(inventoryStore)
const { warehouses } = storeToRefs(warehouseStore)
const { fetchItemDetails, fetchMakes, updateItem, deleteItem } = inventoryStore
const { fetchWarehouses } = warehouseStore
const deleteDialogOpen = ref(false)

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

const makePopoverOpen = ref(false)
const searchMake = ref('')
const filteredMakes = computed(() => {
  return makes.value.filter((m) =>
    m.make_name.toUpperCase().includes(searchMake.value.toUpperCase()),
  )
})

const carModelPopoverOpen = ref(false)
const searchCarModel = ref('')
const filteredCarModels = computed(() => {
  if (itemForm.value.make.length === 0) return []
  const availableCarModels = makes.value.find((m) => m.make_name === itemForm.value.make).car_models

  return availableCarModels.filter((m) =>
    m.car_model_name.toUpperCase().includes(searchCarModel.value.toUpperCase()),
  )
})

const yearRangePopoverOpen = ref(false)
const yearRange = computed(() => {
  if (itemForm.value.carModel.length === 0) return []
  const availableYears = filteredCarModels.value.find(
    (m) => m.car_model_name === itemForm.value.carModel,
  ).years
  return [availableYears[0].year_name, availableYears[availableYears.length - 1].year_name]
})

const fileInputKey = ref(0)
const itemImageUrl = ref('')

const showLocationForm = ref(false)

const locationForm = ref({
  warehouse: '',
  bay: '',
  shelf: '',
})

const itemForm = ref({
  itemName: '',
  itemNameKhmer: '',
  itemCode: '',
  itemStockQuantity: 0,
  make: '',
  carModel: '',
  yearRange: '',
  itemImage: null,
})

const handleFileChange = (event) => {
  itemForm.value.itemImage = event.target.files[0] || null
  setItemImageUrl(itemForm.value.itemImage)
}

const setItemImageUrl = (image) => {
  if (!image) return
  itemImageUrl.value = ''
  URL.revokeObjectURL(itemImageUrl.value)
  itemImageUrl.value = URL.createObjectURL(image)
}

const handleUpdateItem = () => {
  if (!validateItemFields(itemForm.value)) {
    return
  }

  const payload = toPayload(itemForm.value, locationForm.value)
  updateItem(route.params.itemId, payload)
  if (!error.value) {
    refillLocationForm()
    refillForm()
    fetchItemDetails(route.params.itemId, {})
    showLocationForm.value = false
  }
}

const validateItemFields = (item) => {
  try {
    // Validate all string fields
    const isEmpty = Object.values(item).some((i) => {
      return i?.length === 0 || null
    })
    if (isEmpty) throw new Error('All fields must be filled')

    // Validate stock quantity
    if (item.itemStockQuantity < 0) throw new Error("Stock quantity can't be negative")

    // Validate file size
    const maxFileSize = 1024 * 1024 * 5 // in 5 MB
    const allowedMimeTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/avif']
    if (item.itemImage) {
      if (item.itemImage.size > maxFileSize) {
        throw new Error('Image size should not exceed 5MB.')
      }

      if (!allowedMimeTypes.includes(item.itemImage.type)) {
        throw new Error('Invalid image format. Allowed formats: jpg, jpeg, png, avif.')
      }
    }

    return true
  } catch (err) {
    console.error(err.message)
    toast.error('Validation failed', {
      description: err.message || 'Atleast one item validation failed',
      position: 'top-center',
    })
    return false
  }
}

const expandYearRange = (yearRange) => {
  const start = yearRange[0]
  const end = yearRange[1]
  const expandedYearRange = []

  for (let i = start; i <= end; i++) {
    expandedYearRange.push(i)
  }

  return expandedYearRange
}

const toPayload = (item, location) => {
  const formData = new FormData()

  formData.append(`nameEn`, item.itemName)
  formData.append(`nameKh`, item.itemNameKhmer ?? '')
  formData.append(`code`, item.itemCode)
  formData.append(`make`, item.make)
  formData.append(`model`, item.carModel)
  formData.append(`stock_quantity`, item.itemStockQuantity)

  if (item.itemImage) formData.append(`item_image`, item.itemImage)

  expandYearRange(item.yearRange).forEach((year, yIndex) => {
    formData.append(`yearRange[${yIndex}]`, year)
  })
  Object.entries(location).forEach(([key, value]) => {
    formData.append(`${key}`, value)
  })

  formData.append('method', 'PUT')

  return formData
}

const handleSearch = async (e) => {
  e.preventDefault()
  await fetchItemDetails(route.params.itemId, {
    searchQuery: searchQuery.value,
  })
}

const refillLocationForm = () => {
  if (item.value) {
    const shelf = item.value.shelves[0]
    locationForm.value = {
      shelf: shelf.shelf_name || '',
      bay: shelf.bay.bay_name || '',
      warehouse: shelf.bay.warehouse.warehouse_name || '',
    }
  }
}

const refillForm = () => {
  fileInputKey.value++
  if (item.value) {
    const shelf = item.value.shelves[0]
    const years = item.value.item_year
    itemForm.value = {
      itemName: item.value.item_name_en || '',
      itemNameKhmer: item.value.item_name_kh || '',
      itemCode: item.value.item_code || '',
      itemStockQuantity: shelf.stock_quantity || 0,
      make: years[0].car_model.make.make_name || '',
      carModel: years[0].car_model.car_model_name || '',
      yearRange: [years[0].year_name, years[years.length - 1].year_name],
      itemImage: null,
    }
  }
}

const handleDeleteItem = () => {
  deleteItem(route.params.itemId)
  if (!error.value) {
    deleteDialogOpen.value = false
    router.push('/items')
  }
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

onUnmounted(() => {
  if (!itemForm.value.itemImage || itemImageUrl.value.length !== 0) {
    URL.revokeObjectURL(itemImageUrl.value)
  }
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
            <Badge variant="default">Code: {{ item.item_code }}</Badge>
          </div>
          <div>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  class="cursor-pointer"
                  @click="
                    () => {
                      showLocationForm = true
                      if (!warehouses || warehouses.length === 0) fetchWarehouses()
                      refillLocationForm()
                      refillForm()
                    }
                  "
                  >Edit item</Button
                >
              </DialogTrigger>

              <DialogContent class="min-w-[90vw] max-h-[70vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle>Edit this item</DialogTitle>
                  <DialogDescription>
                    Fill in the form below to edit the current item
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
                    <!---->
                    <!-- <Field> -->
                    <!--   <FieldLabel for="bay">Bay</FieldLabel> -->
                    <!--   <Input -->
                    <!--     class="text-sm" -->
                    <!--     id="bay" -->
                    <!--     type="text" -->
                    <!--     placeholder="Enter bay name..." -->
                    <!--     v-model="locationForm.bay" -->
                    <!--     @input:v-model="(e) => (locationForm.bay = e.target.value)" -->
                    <!--   /> -->
                    <!-- </Field> -->

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
                    <!-- <Field> -->
                    <!--   <FieldLabel for="shelf">Shelf</FieldLabel> -->
                    <!--   <Input -->
                    <!--     class="text-sm" -->
                    <!--     id="shelf" -->
                    <!--     type="text" -->
                    <!--     placeholder="Enter shelf name..." -->
                    <!--     v-model="locationForm.shelf" -->
                    <!--     @input:v-model="(e) => (locationForm.shelf = e.target.value)" -->
                    <!--   /> -->
                    <!-- </Field> -->

                    <Field class="col-span-full grid grid-cols-1 sm:grid-cols-2">
                      <Button
                        class="cursor-pointer"
                        variant="outline"
                        @click="refillLocationForm"
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
                            if (!makes || makes.length === 0) fetchMakes()
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

                    <Field>
                      <FieldLabel for="itemMake">Make</FieldLabel>
                      <Popover id="itemMake" v-model:open="makePopoverOpen">
                        <PopoverTrigger as-child>
                          <Button variant="outline" role="combobox" class="w-full justify-between">
                            {{ itemForm.make || 'Select make...' }}
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
                                  itemForm.make = m.make_name
                                  itemForm.carModel = ''
                                  itemForm.yearRange = yearRange
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

                    <Field>
                      <FieldLabel for="itemCarModel">Car Model</FieldLabel>
                      <Popover id="itemCarModel" v-model:open="carModelPopoverOpen">
                        <PopoverTrigger as-child :disabled="!itemForm.make">
                          <Button variant="outline" role="combobox" class="w-full justify-between">
                            {{ itemForm.carModel || 'Select car model...' }}
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
                                  itemForm.carModel = m.car_model_name
                                  itemForm.yearRange = yearRange
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
                        <PopoverTrigger asChild :disabled="!itemForm.carModel">
                          <Button variant="outline" role="combobox" class="w-full justify-between">
                            <span>
                              {{
                                itemForm.yearRange.length === 0
                                  ? 'Select year range'
                                  : itemForm.yearRange[0] + ' to ' + itemForm.yearRange[1]
                              }}
                            </span>
                            <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <Slider
                            v-model="itemForm.yearRange"
                            :step="1"
                            :min="yearRange[0]"
                            :max="yearRange[1]"
                          ></Slider>

                          <div
                            v-if="!yearRange.length"
                            class="px-3 py-2 text-sm text-muted-foreground"
                          >
                            No year(s) found.
                          </div>
                        </PopoverContent>
                      </Popover>
                    </Field>

                    <Field>
                      <FieldLabel for="itemImage">Item Image</FieldLabel>
                      <Input
                        type="file"
                        id="itemImage"
                        :key="fileInputKey"
                        @change="handleFileChange"
                      />
                    </Field>

                    <Field class="col-span-full grid grid-cols-1 sm:grid-cols-3">
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
                        @click="refillForm"
                        type="button"
                      >
                        Reset
                      </Button>
                      <Button
                        class="cursor-pointer"
                        variant="default"
                        @click="handleUpdateItem"
                        type="button"
                      >
                        Confirm Update
                      </Button>
                    </Field>

                    <div v-if="itemImageUrl">
                      <img
                        :src="itemImageUrl"
                        :alt="`Image of ${itemForm.itemName}`"
                        class="object-cover w-full h-full"
                      />
                    </div>
                  </FieldGroup>
                </FieldSet>
              </DialogContent>
            </Dialog>

            <Dialog v-model:open="deleteDialogOpen">
              <DialogTrigger asChild>
                <Button variant="destructive" class="cursor-pointer ml-2">Delete Item</Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure you want to delete this item?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete the item from our
                    database.
                  </DialogDescription>
                </DialogHeader>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button variant="default" class="cursor-pointer" @click="handleDeleteItem"
                    >Yes</Button
                  >
                  <Button
                    variant="destructive"
                    class="cursor-pointer"
                    @click="() => (deleteDialogOpen = false)"
                  >
                    No
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
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
