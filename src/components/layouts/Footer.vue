<script setup>
import { Mail, Phone, MapPin } from '@lucide/vue'
</script>

<template>
  <footer
    class="bg-secondary flex flex-row justify-between items-center max-w-7xl mx-auto rounded-lg px-4 py-2 gap-5"
  >
    <!-- Brand / address block -->
    <div class="space-y-2">
      <h3 class="font-bold text-lg">Autolive Spareparts and Repair Service</h3>
      <p class="text-sm text-muted-foreground flex items-start gap-2">
        <MapPin class="size-4 shrink-0 mt-0.5" />
        146AE Street 122, Toul Kork, Tuek Laak I, Phnom Penh, Cambodia
      </p>
      <p class="text-sm text-muted-foreground flex items-center gap-2">
        <Phone class="size-4 shrink-0" />
        +855 15 978 206
      </p>
      <p class="text-sm text-muted-foreground flex items-center gap-2">
        <Mail class="size-4 shrink-0" />
        huymingtang@gmail.com
      </p>
    </div>

    <!-- Copyright -->
    <p class="text-md text-muted-foreground">
      Copyright (&copy;) {{ new Date().getFullYear() }} Author. All Rights Reserved.
    </p>
  </footer>
</template>
