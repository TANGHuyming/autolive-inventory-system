<script setup>
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MoreHorizontal } from '@lucide/vue'
import { onMounted, ref, watch } from 'vue'
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
import { toast } from 'vue-sonner'

const searchQuery = ref('')
const router = useRouter()
const warehouseStore = useWarehouseStore()
const { warehouses, loading, error } = storeToRefs(warehouseStore)
const { fetchWarehouses, createWarehouse } = warehouseStore

const showWarehouseForm = ref(false)

const warehouseForm = ref({
  warehouseName: '',
  city: '',
  district: '',
  commune: '',
  village: '',
  street: '',
  houseNumber: '',
})

const handleResetWarehouseForm = () => {
  warehouseForm.value = {
    warehouseName: '',
    city: '',
    district: '',
    commune: '',
    village: '',
    street: '',
    houseNumber: '',
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

const toPayload = (warehouse) => {
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

const handleSubmitWarehouseForm = async () => {
  const payload = toPayload(warehouseForm.value)
  await createWarehouse(payload)
  if (!error.value) {
    showWarehouseForm.value = false
    handleResetWarehouseForm()
    await fetchWarehouses()
  }
}

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
              @click="
                () => {
                  showWarehouseForm = true
                }
              "
              >Add Warehouse</Button
            >
          </DialogTrigger>

          <DialogContent class="min-w-[90vw] max-h-[70vh] overflow-auto">
            <DialogHeader>
              <DialogTitle> Add a new warehouse </DialogTitle>
              <DialogDescription>
                Fill in the form below to add a new warehouse to the database
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
                    @click="handleResetWarehouseForm"
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
