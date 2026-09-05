<script setup lang="ts">
import 'vue-sonner/style.css'
import { Toaster } from '@/components/ui/sonner'
import { webClient } from './api'

function initTheme() {
  const saved = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  if (saved === 'dark' || (!saved && prefersDark)) {
    document.documentElement.classList.add('dark')
  }
}
initTheme()

// set csrf token
async function initCsrf() {
  try {
    await webClient.get('sanctum/csrf-cookie')

    return
  } catch (err: any) {
    console.error(err.message)
  }
}
initCsrf()
</script>

<template>
  <Toaster richColors />
  <RouterView />
</template>

<style scoped></style>
