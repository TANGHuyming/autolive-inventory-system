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
import { Trash2 } from '@lucide/vue'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useWarehouseStore } from '@/stores/WarehouseStore'
import { storeToRefs } from 'pinia'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const warehouseStore = useWarehouseStore()
const { bay, loading, error } = storeToRefs(warehouseStore)
const { fetchBayDetails, updateBay, deleteBay } = warehouseStore

const showBayForm = ref(false)
const showAssignedShelves = ref(false)
const deleteDialogOpen = ref(false)

const bayForm = ref({
  bayName: '',
  shelves: [],
})

const handleRefillBayForm = () => {
  bayForm.value = {
    bayName: bay.value.bay_name || '',
    shelves: bay.value.shelves.map((shelf) => ({
      shelfId: shelf.shelf_id || '',
      shelfName: shelf.shelf_name || '',
    })),
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
        return Object.entries(shelf).some(([key, value]) => {
          if (typeof value === 'string') {
            return value.trim().length === 0
          }
        })
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

const toBayPayload = (bay) => {
  return {
    name: bay.bayName,
    shelves: bay.shelves.map((shelf) => {
      return {
        id: shelf.shelfId,
        name: shelf.shelfName,
      }
    }),
  }
}

const handleSubmitBayForm = async () => {
  const payload = toBayPayload(bayForm.value)
  await updateBay(route.params.bayId, payload)
  if (!error.value) {
    showBayForm.value = false
    handleResetBayForm()
    await fetchBayDetails(route.params.bayId, {})
  }
}

const handleDeleteBay = async () => {
  await deleteBay(route.params.bayId)
  if (!error.value) {
    router.push(`/warehouses/${route.params.warehouseId}`)
  }
}

const handleAddShelf = () => {
  bayForm.value.shelves.push({
    shelfName: '',
  })
}

watch(bay, () => {
  if (bay.value) {
    handleRefillBayForm()
  }
})

onMounted(async () => {
  await fetchBayDetails(route.params.bayId, {})
})
</script>

<template>
  <div v-if="loading || !bay" class="max-w-7xl mx-auto space-y-2">
    <Skeleton v-for="n in 10" :key="n" class="bg-accent w-full h-10" />
  </div>

  <div v-else class="space-y-6 max-w-7xl mx-auto">
    <!-- Bay Overview -->
    <Card>
      <CardHeader>
        <div class="flex flex-col sm:flex-row items-start justify-between gap-2">
          <div class="flex flex-row items-center gap-5">
            <CardTitle class="text-lg md:text-2xl">{{ bay.bay_name }}</CardTitle>
          </div>

          <div>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  class="cursor-pointer"
                  @click="
                    () => {
                      showBayForm = true
                    }
                  "
                  >Edit Bay</Button
                >
              </DialogTrigger>

              <DialogContent class="min-w-[90vw] max-h-[70vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle> Edit current bay </DialogTitle>
                  <DialogDescription>
                    Fill in the form below to edit bay information
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
                            <TableHead>Shelf ID</TableHead>
                            <TableHead>Shelf Name</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          <TableRow v-for="(shelf, index) in bayForm.shelves" :key="index">
                            <TableCell v-for="[key, _] in Object.entries(shelf)" :key="key">
                              <span v-if="key === 'shelfId'">#{{ shelf.shelfId }}</span>
                              <Input
                                v-else
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
                        @click="handleRefillBayForm"
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

            <Dialog v-model:open="deleteDialogOpen">
              <DialogTrigger asChild>
                <Button variant="destructive" class="cursor-pointer ml-2">Delete Bay</Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure you want to delete this bay?</DialogTitle>
                  <DialogDescription>
                    This will permanently delete the bay from our database.
                  </DialogDescription>
                </DialogHeader>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button variant="default" class="cursor-pointer" @click="handleDeleteBay"
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
    </Card>

    <!-- Bays -->
    <Card>
      <CardHeader>
        <CardTitle>Shelves</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>{{ bay.shelves.length }} shelve(s) in this bay.</TableCaption>
          <TableHeader>
            <TableRow class="bg-primary text-primary-foreground hover:bg-primary">
              <TableHead>Shelf ID</TableHead>
              <TableHead>Shelf Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="s in bay.shelves" :key="s.shelf_id" class="cursor-pointer">
              <TableCell>#{{ s.shelf_id }}</TableCell>
              <TableCell>{{ s.shelf_name }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
