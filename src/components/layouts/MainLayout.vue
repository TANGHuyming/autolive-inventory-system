<script setup lang="ts">
import Header from '@/components/layouts/Header.vue'
import Footer from '@/components/layouts/Footer.vue'
</script>

<template>
  <Header />
  <main class="min-h-screen p-10">
    <RouterView />
  </main>
  <Footer />
</template>

<style scoped></style>
