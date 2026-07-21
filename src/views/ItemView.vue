<script setup>
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MoreHorizontal, ChevronsUpDown } from '@lucide/vue'
import { onMounted, ref, watch } from 'vue'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useInventoryStore } from '@/stores/InventoryStore'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const searchQuery = ref('')
const router = useRouter()
const inventoryStore = useInventoryStore()
const { items, makes, loading, success, error } = storeToRefs(inventoryStore)
const { fetchItems, fetchMakes } = inventoryStore
const makePopoverOpen = ref(false)
const selectedMake = ref()
const searchMake = ref('')
const filteredMakes = ref([])

const carModelPopoverOpen = ref(false)
const selectedCarModel = ref()
const searchCarModel = ref('')
const filteredCarModels = ref([])

const itemForm = ref({
  itemName: '',
  itemNameKhmer: '',
  make: '',
  carModel: '',
})

const handleSearch = async (e) => {
  e.preventDefault()
  await fetchItems({
    searchQuery: searchQuery.value,
  })
}

const goToItem = (value) => {
  router.push(`/items/${value}`)
}

const handleResetForm = () => {
  selectedMake.value = ''
  selectedCarModel.value = ''
  itemForm.value = {
    itemName: '',
    itemNameKhmer: '',
    make: '',
    carModel: '',
  }
}

onMounted(async () => {
  await fetchItems()
  await fetchMakes()
  filteredMakes.value = makes.value
})

watch(searchMake, () => {
  filteredMakes.value = makes.value.filter((m) =>
    m.make_name.toUpperCase().includes(searchMake.value.toUpperCase()),
  )
})

watch([selectedMake, searchCarModel], () => {
  if (selectedMake.value.length === 0) return
  filteredCarModels.value = makes.value.find(
    (m) => m.make_name === selectedMake.value,
  ).available_car_models

  filteredCarModels.value = filteredCarModels.value.filter((m) =>
    m.car_model_name.toUpperCase().includes(searchCarModel.value.toUpperCase()),
  )
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
            <Button variant="default" class="cursor-pointer">Add Item</Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle> Add a new item </DialogTitle>
              <DialogDescription>
                Fill in the form below to add a new item to the inventory
              </DialogDescription>
            </DialogHeader>
            <form @submit="handleAddItem">
              <FieldSet>
                <FieldGroup class="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-6">
                  <Field>
                    <FieldLabel for="itemName">Name (EN)</FieldLabel>
                    <Input
                      class="text-sm"
                      id="itemName"
                      type="text"
                      required
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
                      required
                      placeholder="សូមបញ្ចូលឈ្មោះ......"
                      v-model="itemForm.itemNameKhmer"
                      @input:v-model="(e) => (itemForm.itemNameKhmer = e.target.value)"
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

                  <Field class="flex flex-col sm:flex-row mt-8 w-full">
                    <Button
                      class="cursor-pointer"
                      variant="outline"
                      @click="handleResetForm"
                      type="button"
                    >
                      Reset
                    </Button>
                    <Button
                      variant="default"
                      type="submit"
                      class="cursor-pointer"
                      :class="{
                        'opacity-50': loading,
                      }"
                      :disabled="loading"
                    >
                      {{ loading ? 'Adding item...' : 'Add item' }}
                    </Button>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </form>
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
