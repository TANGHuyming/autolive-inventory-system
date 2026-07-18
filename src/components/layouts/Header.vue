<script setup>
import { ref } from 'vue'
import { Menu, Sun, Moon } from '@lucide/vue'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { RouterLink } from 'vue-router'
import { useNavStore } from '@/stores/NavStore'
import { storeToRefs } from 'pinia'
import { useEmployeeStore } from '@/stores/EmployeeStore'

const navStore = useNavStore()
const employeeStore = useEmployeeStore()
const { navItem, navOptions, navTitle } = storeToRefs(navStore)
const { setNavItem } = navStore
const { logout } = employeeStore
const isLight = ref(localStorage.getItem('theme') === 'dark' ? false : true)

function toggleDark() {
  const isDark = document.documentElement.classList.toggle('dark')
  localStorage.setItem('theme', isDark ? 'dark' : 'light')
  isLight.value = !isLight.value
}
</script>

<template>
  <header
    class="bg-background flex flex-row justify-between items-center max-w-7xl mx-auto rounded-lg px-4 py-2"
  >
    <div class="flex flex-row gap-5 items-center">
      <div class="bg-background w-16 h-16 rounded-full border-2 border-primary overflow-hidden">
        <img
          src="../../../public/logo.png"
          alt="Image of autolive logo"
          class="object-contain w-full h-full"
        />
      </div>

      <h1 class="text-xl lg:text-2xl font-bold">{{ navTitle }}</h1>
    </div>

    <nav class="flex flex-row items-center gap-5">
      <!-- Light dark toggle -->
      <Toggle @click="toggleDark" class="cursor-pointer">
        <Sun v-if="isLight" />
        <Moon v-else />
      </Toggle>

      <!-- Desktop navigation -->
      <div class="hidden md:block">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem v-for="opt in navOptions" :key="opt.value">
              <NavigationMenuLink
                :active="opt.value === navItem"
                @click="() => setNavItem(opt.value)"
              >
                <RouterLink :to="opt.value" class="font-bold text-md">{{ opt.label }}</RouterLink>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <!-- Mobile navigation -->
      <div class="block md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" class="cursor-pointer">
              <Menu />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              v-for="opt in navOptions"
              :key="opt.value"
              :class="{ 'font-bold': opt.value === navItem }"
              as-child
            >
              <RouterLink :to="opt.value" @click="() => setNavItem(opt.value)">
                {{ opt.label }}
              </RouterLink>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <!-- Profile -->
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" class="cursor-pointer">Profile</Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <Button variant="outline" class="w-full cursor-pointer">Profile</Button>
            <Button @click="logout" variant="destructive" class="w-full cursor-pointer"
              >Logout</Button
            >
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  </header>
</template>
