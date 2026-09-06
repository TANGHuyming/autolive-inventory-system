<script setup>
import { defineProps, defineModel, watch, computed, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight } from '@lucide/vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  pageSizeOptions: { type: Array, default: [1, 10, 25, 50, 100] },
  totalPages: { type: Number, required: true },
})
const currentPage = defineModel('currentPage')
const pageSize = defineModel('pageSize')

const route = useRoute()
const router = useRouter()

function handleFirst() {
  currentPage.value = 1
}
function handleLast() {
  currentPage.value = props.totalPages
}
function handlePrevious() {
  currentPage.value = Math.max(currentPage.value - 1, 1)
}
function handleNext() {
  currentPage.value = Math.min(currentPage.value + 1, props.totalPages)
}

watch(pageSize, () => {
  currentPage.value = 1
})

watch([currentPage, pageSize], () => {
  router.replace({
    query: {
      ...route.query,
      page: currentPage.value,
      limit: pageSize.value,
    },
  })
})
</script>

<template>
  <div class="flex flex-col sm:flex-row justify-between items-center gap-y-2">
    <Select v-model="pageSize">
      <SelectTrigger class="cursor-pointer">
        <SelectValue :placeholder="`${pageSize}`" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem
          v-for="(option, index) in pageSizeOptions"
          :key="index"
          :value="option"
          class="cursor-pointer"
        >
          {{ option }}
        </SelectItem>
      </SelectContent>
    </Select>

    <div class="flex gap-2">
      <Button @click="handleFirst" class="cursor-pointer" :disabled="currentPage === 1">
        <span class="hidden sm:block">First</span>
        <ChevronsLeft class="block sm:hidden" />
      </Button>
      <Button @click="handlePrevious" class="cursor-pointer" :disabled="currentPage === 1"
        ><span class="hidden sm:block">Previous</span><ChevronLeft class="block sm:hidden"
      /></Button>
      <Button @click="handleNext" class="cursor-pointer" :disabled="currentPage === totalPages"
        ><span class="hidden sm:block">Next</span><ChevronRight class="block sm:hidden"
      /></Button>
      <Button @click="handleLast" class="cursor-pointer" :disabled="currentPage === totalPages"
        ><span class="hidden sm:block">Last</span><ChevronsRight class="block sm:hidden"
      /></Button>
    </div>

    <p>{{ currentPage }} of {{ totalPages }}</p>
  </div>
</template>
