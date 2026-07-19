<script setup>
import { ShieldAlert } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.back()
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
    <ShieldAlert class="h-16 w-16 text-destructive" />

    <h1 class="text-3xl font-bold tracking-tight">Access Denied</h1>
    <p class="max-w-md text-muted-foreground">
      You don't have permission to view this page. If you believe this is a mistake, contact your
      administrator.
    </p>

    <div class="mt-4 flex gap-3">
      <Button variant="outline" @click="goBack">Go Back</Button>
      <Button @click="goHome">Go Home</Button>
    </div>
  </div>
</template>
