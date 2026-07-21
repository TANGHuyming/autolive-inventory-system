<script setup>
import { ref, onMounted } from 'vue'
import { Menu, Sun, Moon, User } from '@lucide/vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { RouterLink, useRouter } from 'vue-router'
import { useNavStore } from '@/stores/NavStore'
import { storeToRefs } from 'pinia'
import { useEmployeeStore } from '@/stores/EmployeeStore'
import { useRoute } from 'vue-router'

const route = useRoute()
const navStore = useNavStore()
const employeeStore = useEmployeeStore()
const router = useRouter()
const { navItem, navOptions, navTitles } = storeToRefs(navStore)
const { setNavItem } = navStore
const { profile } = storeToRefs(employeeStore)
const { logout } = employeeStore
const isLight = ref(localStorage.getItem('theme') === 'dark' ? false : true)

function toggleDark() {
  const isDark = document.documentElement.classList.toggle('dark')
  localStorage.setItem('theme', isDark ? 'dark' : 'light')
  isLight.value = !isLight.value
}

function isPermitted(value) {
  if (!value) {
    return true
  }

  const permissions = value.split('.')
  if (profile.value && !permissions.includes(profile.value.role.role_name)) {
    return false
  }

  return true
}

onMounted(() => {
  setNavItem(navTitles.value[1].location ?? route.path)
})
</script>

<template>
  <header class="sticky top-0 w-full z-10 backdrop-blur-2xl">
    <div class="flex flex-row justify-between items-center max-w-7xl mx-auto rounded-lg px-4 py-2">
      <div class="flex flex-row gap-5 items-center">
        <Avatar
          class="bg-background w-16 h-16 rounded-full border-2 border-primary overflow-hidden"
        >
          <AvatarImage
            src="../../../public/logo.png"
            class="object-contain cursor-pointer"
            @click="() => router.push('/')"
          />
          <AvatarFallback>COMPANY LOGO</AvatarFallback>
        </Avatar>

        <Breadcrumb class="hidden sm:block">
          <BreadcrumbList class="list-none text-lg md:text-2xl font-bold">
            <BreadcrumbItem v-for="(navTitle, index) in navTitles" :key="navTitle">
              <BreadcrumbLink asChild>
                <div
                  v-if="index !== navTitles.length - 1 && index !== 0"
                  class="flex flex-row items-center"
                >
                  <RouterLink
                    :to="navTitle.location"
                    class="mx-2 underline-offset-4 hover:underline text-foreground"
                    >{{ navTitle.name }}</RouterLink
                  >
                  <BreadcrumbSeparator class="mx-2"></BreadcrumbSeparator>
                </div>
                <BreadcrumbPage v-else-if="index !== 0" class="font-bold"
                  >{{ navTitle.name }}
                </BreadcrumbPage>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <nav class="flex flex-row items-center gap-2 sm:gap-5">
        <!-- Light dark toggle -->
        <Toggle @click="toggleDark" class="cursor-pointer">
          <Sun v-if="isLight" />
          <Moon v-else />
        </Toggle>

        <!-- Desktop navigation -->
        <div class="hidden lg:block">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem v-for="opt in navOptions" :key="opt.value">
                <NavigationMenuLink
                  asChild
                  v-if="isPermitted(opt.permission)"
                  :active="opt.value === navItem"
                  @click="setNavItem(opt.value)"
                >
                  <RouterLink :to="opt.value" class="font-bold text-md">{{ opt.label }}</RouterLink>
                </NavigationMenuLink>

                <!-- Do later -->
                <NavigationMenuSub v-else-if="opt.hasChildren">
                  <NavigationTrigger>{{ opt.label }}</NavigationTrigger>

                  <NavigationContent></NavigationContent>
                </NavigationMenuSub>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <!-- Mobile navigation -->
        <div class="block lg:hidden">
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
                asChild
              >
                <RouterLink :to="opt.value" @click="setNavItem(opt.value)">
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
              <Button variant="default" class="cursor-pointer">
                <span class="hidden sm:block">Profile</span>
                <User class="block sm:hidden" />
              </Button>
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
    </div>
  </header>
</template>
