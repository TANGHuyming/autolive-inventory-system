<script setup>
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { MapPin, Trash2 } from '@lucide/vue'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useWarehouseStore } from '@/stores/WarehouseStore'
import { storeToRefs } from 'pinia'
import { toast } from 'vue-sonner'

const searchQuery = ref('')
const route = useRoute()
const router = useRouter()
const warehouseStore = useWarehouseStore()
const { warehouse, loading, error } = storeToRefs(warehouseStore)
const { fetchWarehouseDetails, updateWarehouse, deleteWarehouse, createBay } = warehouseStore

const showWarehouseForm = ref(false)
const showBayForm = ref(false)
const showAssignedShelves = ref(false)
const deleteDialogOpen = ref(false)

const warehouseForm = ref({
  warehouseName: '',
  city: '',
  district: '',
  commune: '',
  village: '',
  street: '',
  houseNumber: '',
})

const bayForm = ref({
  bayName: '',
  shelves: [],
})

const handleRefillWarehouseForm = () => {
  warehouseForm.value = {
    warehouseName: warehouse.value.warehouse_name || '',
    city: warehouse.value.city || '',
    district: warehouse.value.district || '',
    commune: warehouse.value.commune || '',
    village: warehouse.value.village || '',
    street: warehouse.value.street || '',
    houseNumber: warehouse.value.house_number || '',
  }
}

const handleResetBayForm = () => {
  bayForm.value = {
    ...bayForm.value,
    bayName: '',
  }
}

const handleRemoveShelf = (index) => {
  bayForm.value.shelves.splice(index, 1)
}

const validateBayForm = () => {
  try {
    if (bayForm.value.bayName.trim().length === 0) {
      throw new Error('Bay name is required')
    }

    if (bayForm.value.shelves.length === 0) {
      throw new Error('At least one shelf is required')
    }

    if (
      bayForm.value.shelves.some((shelf) => {
        return Object.entries(shelf).some(([key, value]) => value.trim().length === 0)
      })
    ) {
      throw new Error('All shelf fields must be filled')
    }

    return true
  } catch (err) {
    toast.error('Validated failed', {
      description: err.message,
      position: 'top-center',
    })
    return false
  }
}

const validateWarehouseForm = () => {
  try {
    if (warehouseForm.value.warehouseName.trim().length === 0) {
      throw new Error('Warehouse name is required')
    }

    return true
  } catch (err) {
    toast.error('Validated failed', {
      description: err.message,
      position: 'top-center',
    })
    return false
  }
}

const toWarehousePayload = (warehouse) => {
  return {
    name: warehouse.warehouseName,
    city: warehouse.city,
    district: warehouse.district,
    commune: warehouse.commune,
    village: warehouse.village,
    street: warehouse.street,
    house_number: warehouse.houseNumber,
  }
}

const toBayPayload = (bay) => {
  return {
    warehouse_id: route.params.warehouseId,
    name: bay.bayName,
    shelves: bay.shelves.map((shelf) => {
      return {
        name: shelf.shelfName,
      }
    }),
  }
}

const handleSubmitWarehouseForm = async () => {
  const payload = toWarehousePayload(warehouseForm.value)
  await updateWarehouse(route.params.warehouseId, payload)
  if (!error.value) {
    showWarehouseForm.value = false
    handleRefillWarehouseForm()
    await fetchWarehouseDetails(route.params.warehouseId, {})
  }
}

const handleSubmitBayForm = async () => {
  const payload = toBayPayload(bayForm.value)
  await createBay(payload)
  if (!error.value) {
    showBayForm.value = false
    handleResetBayForm()
    await fetchBays(route.params.warehouseId, {})
  }
}

const handleDeleteWarehouse = async () => {
  await deleteWarehouse(route.params.warehouseId)
  if (!error.value) {
    router.push('/warehouses')
  }
}

const handleAddShelf = () => {
  bayForm.value.shelves.push({
    shelfName: '',
  })
}

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

watch(warehouse, () => {
  if (warehouse.value) {
    handleRefillWarehouseForm()
  }
})

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

          <div>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  class="cursor-pointer"
                  @click="
                    () => {
                      showWarehouseForm = true
                    }
                  "
                  >Edit Warehouse</Button
                >
              </DialogTrigger>

              <DialogContent class="min-w-[90vw] max-h-[70vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle> Edit current warehouse </DialogTitle>
                  <DialogDescription>
                    Fill in the form below to edit warehouse information
                  </DialogDescription>
                </DialogHeader>
                <FieldSet>
                  <FieldGroup class="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-6">
                    <Field>
                      <FieldLabel for="warehouseName">Warehouse Name</FieldLabel>
                      <Input
                        class="text-sm"
                        id="warehouseName"
                        type="text"
                        placeholder="Enter warehouse name..."
                        v-model="warehouseForm.warehouseName"
                        @input:v-model="(e) => (warehouseForm.warehouseName = e.target.value)"
                      />
                    </Field>

                    <Field>
                      <FieldLabel for="city">City</FieldLabel>
                      <Input
                        class="text-sm"
                        id="city"
                        type="text"
                        placeholder="Enter city name..."
                        v-model="warehouseForm.city"
                        @input:v-model="(e) => (warehouseForm.city = e.target.value)"
                      />
                    </Field>

                    <Field>
                      <FieldLabel for="district">District</FieldLabel>
                      <Input
                        class="text-sm"
                        id="district"
                        type="text"
                        placeholder="Enter district name..."
                        v-model="warehouseForm.district"
                        @input:v-model="(e) => (warehouseForm.district = e.target.value)"
                      />
                    </Field>

                    <Field>
                      <FieldLabel for="commune">Commune</FieldLabel>
                      <Input
                        class="text-sm"
                        id="commune"
                        type="text"
                        placeholder="Enter commune name..."
                        v-model="warehouseForm.commune"
                        @input:v-model="(e) => (warehouseForm.commune = e.target.value)"
                      />
                    </Field>

                    <Field>
                      <FieldLabel for="village">Village</FieldLabel>
                      <Input
                        class="text-sm"
                        id="village"
                        type="text"
                        placeholder="Enter village name..."
                        v-model="warehouseForm.village"
                        @input:v-model="(e) => (warehouseForm.village = e.target.value)"
                      />
                    </Field>

                    <Field>
                      <FieldLabel for="street">Street</FieldLabel>
                      <Input
                        class="text-sm"
                        id="street"
                        type="text"
                        placeholder="Enter street name..."
                        v-model="warehouseForm.street"
                        @input:v-model="(e) => (warehouseForm.street = e.target.value)"
                      />
                    </Field>

                    <Field>
                      <FieldLabel for="houseNumber">House Number</FieldLabel>
                      <Input
                        class="text-sm"
                        id="houseNumber"
                        type="number"
                        placeholder="Enter number name..."
                        v-model="warehouseForm.houseNumber"
                        @input:v-model="(e) => (warehouseForm.houseNumber = e.target.value)"
                      />
                    </Field>

                    <Field class="col-span-full grid grid-cols-1 sm:grid-cols-2">
                      <Button
                        class="cursor-pointer"
                        variant="outline"
                        @click="handleRefillWarehouseForm"
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
                            if (validateWarehouseForm()) {
                              handleSubmitWarehouseForm()
                            }
                          }
                        "
                      >
                        Confirm Submission
                      </Button>
                    </Field>
                  </FieldGroup>
                </FieldSet>
              </DialogContent>
            </Dialog>

            <Dialog v-model:open="deleteDialogOpen">
              <DialogTrigger asChild>
                <Button variant="destructive" class="cursor-pointer ml-2">Delete Warehouse</Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure you want to delete this warehouse?</DialogTitle>
                  <DialogDescription>
                    This will permanently delete the warehouse from our database.
                  </DialogDescription>
                </DialogHeader>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button variant="default" class="cursor-pointer" @click="handleDeleteWarehouse"
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
          <Dialog v-model:open="showBayForm">
            <DialogTrigger asChild>
              <Button variant="default" class="cursor-pointer"> Add Bay </Button>
            </DialogTrigger>

            <DialogContent class="min-w-[90vw] max-h-[70vh] overflow-auto">
              <DialogHeader>
                <DialogTitle> Add a new bay </DialogTitle>
                <DialogDescription>
                  Fill in the form below to add a new bay to the warehouse along with the shelves
                </DialogDescription>
              </DialogHeader>
              <FieldSet>
                <FieldGroup class="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-6">
                  <Field>
                    <FieldLabel for="bayName">Bay Name</FieldLabel>
                    <Input
                      class="text-sm"
                      id="bayName"
                      type="text"
                      placeholder="Enter bay name..."
                      v-model="bayForm.bayName"
                      @input:v-model="(e) => (bayForm.bayName = e.target.value)"
                    />
                  </Field>

                  <Field class="col-span-full">
                    <Button type="button" class="cursor-pointer" @click="handleAddShelf">
                      Add Shelf
                    </Button>

                    <Table>
                      <TableHeader>
                        <TableRow class="bg-primary text-primary-foreground hover:bg-primary">
                          <TableHead>Shelf Name</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        <TableRow v-for="(shelf, index) in bayForm.shelves" :key="index">
                          <TableCell v-for="[key, _] in Object.entries(shelf)" :key="key">
                            <Input
                              placeholder="Enter shelf name..."
                              v-model="shelf.shelfName"
                              @input:v-model="(e) => (shelf.shelfName = e.target.value)"
                            />
                          </TableCell>

                          <TableCell>
                            <Button
                              variant="ghost"
                              class="cursor-pointer text-destructive"
                              @click="handleRemoveShelf(index)"
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
                      @click="handleResetBayForm"
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
                          if (validateBayForm()) {
                            showAssignedShelves = true
                          }
                        }
                      "
                    >
                      Next
                    </Button>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </DialogContent>
          </Dialog>

          <Dialog v-model:open="showAssignedShelves">
            <DialogContent class="min-w-[90vw] max-h-[70vh] overflow-auto">
              <DialogHeader>
                <DialogTitle> Assigned Shelves </DialogTitle>
                <DialogDescription class="flex flex-col">
                  <span>
                    Please review the shelves you have assigned to the bay before submission
                  </span>
                </DialogDescription>
              </DialogHeader>

              <Card>
                <CardHeader>
                  <CardTitle>Bay Information</CardTitle>
                  <CardDescription>Information about the bay that you filled</CardDescription>
                </CardHeader>
                <CardContent>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
                    <h2>Bay: {{ bayForm.bayName }}</h2>
                  </div>
                </CardContent>
              </Card>

              <Table>
                <TableHeader>
                  <TableRow class="bg-primary text-primary-foreground hover:bg-primary">
                    <TableHead>Shelf Name</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  <TableRow v-for="(shelf, index) in bayForm.shelves" :key="index">
                    <TableCell>{{ shelf.shelfName }}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Button
                variant="default"
                class="cursor-pointer"
                @click="
                  () => {
                    handleSubmitBayForm()
                    showAssignedShelves = false
                  }
                "
              >
                Confirm Submission
              </Button>
            </DialogContent>
          </Dialog>
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
            <TableRow
              v-for="b in warehouse.bays"
              :key="b.bay_id"
              class="cursor-pointer"
              @click="router.push(`/warehouses/${route.params.warehouseId}/bays/${b.bay_id}`)"
            >
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
