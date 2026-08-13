<script setup>
import { MoreHorizontal } from '@lucide/vue'
import { onMounted, ref, computed } from 'vue'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Donut } from '@unovis/ts'
import { VisDonut, VisSingleContainer } from '@unovis/vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  componentToString,
} from '@/components/ui/chart'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useInventoryStore } from '@/stores/InventoryStore'
import { useTransactionStore } from '@/stores/TransactionStore'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const router = useRouter()
const inventoryStore = useInventoryStore()
const transactionStore = useTransactionStore()
const { items, itemSummary, loading: loadingItem } = storeToRefs(inventoryStore)
const {
  transactions,
  transactionSummary,
  loading: loadingTransaction,
} = storeToRefs(transactionStore)
const { fetchItems, fetchItemSummary } = inventoryStore
const { fetchTransactions, fetchTransactionSummary } = transactionStore
const transactionChartConfig = {
  totalCount: {
    label: 'TotalCount',
    color: 'var(--primary)',
  },
}
const itemChartConfig = {
  totalCount: {
    label: 'TotalCount',
    color: 'var(--primary)',
  },
}

onMounted(async () => {
  await fetchItems({ limit: 5 })
  await fetchTransactions({ limit: 5 })
  await fetchTransactionSummary()
  await fetchItemSummary()
})
</script>

<template>
  <div v-if="loadingItem || loadingTransaction" class="max-w-7xl mx-auto space-y-2">
    <Skeleton v-for="n in 10" :key="n" class="bg-accent w-full h-10" />
  </div>

  <div v-else class="max-w-7xl mx-auto overflow-scroll my-5 space-y-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>all previous transactions</CardDescription>
        </CardHeader>

        <CardContent>
          <ChartContainer :config="transactionChartConfig" class="max-h-[20vh]">
            <VisSingleContainer :data="transactionSummary">
              <VisDonut
                :value="(d) => d[d.key]"
                :color="(d) => transactionChartConfig[d.key].color"
              />
              <ChartTooltip
                :triggers="{
                  [Donut.selectors.segment]: componentToString(
                    transactionChartConfig,
                    ChartTooltipContent,
                    { hideLabel: false },
                  ),
                }"
              />
            </VisSingleContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
          <CardDescription>Current inventory</CardDescription>
        </CardHeader>

        <CardContent>
          <ChartContainer :config="itemChartConfig" class="max-h-[20vh]">
            <VisSingleContainer :data="itemSummary">
              <VisDonut :value="(d) => d[d.key]" :color="(d) => itemChartConfig[d.key].color" />
              <ChartTooltip
                :triggers="{
                  [Donut.selectors.segment]: componentToString(
                    itemChartConfig,
                    ChartTooltipContent,
                    {
                      hideLabel: false,
                    },
                  ),
                }"
              />
            </VisSingleContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>

    <Button class="cursor-pointer" variant="outline" @click="router.push('/transactions')">
      View More
    </Button>
    <Table>
      <TableHeader>
        <TableRow class="bg-primary text-primary-foreground hover:bg-primary">
          <TableHead>No</TableHead>
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
          <TableCell>{{ transaction.no }}</TableCell>
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

    <Button class="cursor-pointer" variant="outline" @click="router.push('/items')">
      View More
    </Button>
    <Table>
      <TableHeader>
        <TableRow class="bg-primary text-primary-foreground hover:bg-primary">
          <TableHead>No</TableHead>
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
        <TableRow v-for="item in items" :key="item.item_code" class="cursor-pointer">
          <TableCell>{{ item.no }}</TableCell>
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
  </div>
</template>
