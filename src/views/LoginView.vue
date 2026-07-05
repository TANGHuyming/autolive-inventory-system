<script setup>
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field'
import { AlertCircleIcon } from '@lucide/vue'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { useEmployeeStore } from '@/stores/EmployeeStore'

const employeeStore = useEmployeeStore()
const { success, error, loading } = storeToRefs(employeeStore)
const { login, register } = employeeStore

const isLogin = ref(true)
const firstName = ref(null)
const lastName = ref(null)
const telephone = ref(null)
const email = ref(null)
const password = ref(null)
const confirmingPassword = ref(null)

const handleLogin = async (event) => {
  event.preventDefault()
  await login({ email: email.value, password: password.value })

  email.value = null
  password.value = null
}

const handleRegister = async (event) => {
  event.preventDefault()

  if (password.value !== confirmingPassword.value) {
    return
  }

  await register({
    first_name: firstName.value,
    last_name: lastName.value,
    email: email.value,
    telephone: telephone.value,
    password: password.value,
  })

  firstName.value = null
  lastName.value = null
  email.value = null
  telephone.value = null
  password.value = null
  confirmingPassword.value = null

  isLogin.value = true
}

watch(isLogin, () => {
  firstName.value = null
  lastName.value = null
  email.value = null
  telephone.value = null
  password.value = null
  confirmingPassword.value = null
})
</script>

<template>
  <div class="min-h-screen grid grid-cols-1 lg:grid-cols-2">
    <v-expand-transition>
      <Alert
        v-if="success"
        class="flex items-center justify-center fixed bottom-0 right-0 max-w-100 bg-green-200 border border-green-500 font-bold text-2xl text-green-500"
      >
        <AlertCircleIcon />
        <AlertTitle>{{ success.message }}</AlertTitle>
      </Alert>
      <Alert
        v-else-if="error"
        class="flex items-center justify-center fixed bottom-0 right-0 max-w-100 bg-red-200 border border-red-500 font-bold text-2xl text-red-500"
      >
        <AlertCircleIcon />
        <AlertTitle>{{ error.message }}</AlertTitle>
      </Alert>
    </v-expand-transition>

    <div
      class="bg-green-500 lg:flex flex-col justify-center items-center p-16 text-center gap-y-2 hidden"
    >
      <img
        src="../../public/frontGate.png"
        alt="picture of autolive entrance"
        class="w-90 h-90 rounded-full"
      />
      <h2 class="text-5xl text-white font-bold">Autolive Inventory Management System</h2>
      <p class="text-2xl text-green-100 font-bold">
        Genuine spareparts and vehicle repairing service
      </p>
    </div>

    <form @submit="handleLogin" class="flex flex-col justify-center items-center" v-if="isLogin">
      <FieldSet
        class="flex justify-center items-center p-8 bg-green-100 w-[90%] border-2 border-green-500 rounded-md shadow-gray-200 shadow-lg"
      >
        <FieldTitle class="text-4xl font-bold text-green-500">Login</FieldTitle>
        <FieldDescription class="text-2xl font-semibold"
          >Enter your employee credentials to login</FieldDescription
        >

        <FieldGroup class="flex flex-col gap-y-2">
          <Field class="grid grid-cols-1 lg:grid-cols-[20%_1fr]">
            <FieldLabel for="email" class="text-lg font-medium">Email</FieldLabel>
            <input
              id="email"
              type="email"
              required
              placeholder="Enter your email..."
              class="px-4 py-2 text-left bg-white border border-green-500 text-lg rounded-md"
              v-model="email"
              @input:v-model="(e) => (email = e.target.value)"
            />
          </Field>

          <Field class="grid grid-cols-1 lg:grid-cols-[20%_1fr]">
            <FieldLabel for="password" class="text-lg font-medium">Password</FieldLabel>
            <input
              id="password"
              type="password"
              required
              placeholder="Enter your password..."
              class="px-4 py-2 text-left bg-white border border-green-500 text-lg rounded-md"
              v-model="password"
              @input:v-model="(e) => (password = e.target.value)"
            />
          </Field>

          <Field class="mt-8">
            <button
              type="submit"
              class="rounded-lg bg-green-500 hover:bg-green-400 text-center px-4 py-2 cursor-pointer"
              :class="{
                'opacity-50': loading,
              }"
              :disabled="loading"
            >
              {{ loading ? 'Logging in...' : 'Log in' }}
            </button>
            <button
              @click="isLogin = false"
              type="button"
              class="rounded-lg bg-white hover:bg-green-500 border border-green-500 text-center px-4 py-2 cursor-pointer"
            >
              Register
            </button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>

    <form @submit="handleRegister" class="flex flex-col justify-center items-center" v-else>
      <FieldSet
        class="flex justify-center items-center p-8 bg-green-100 w-[90%] border-2 border-green-500 rounded-md shadow-gray-200 shadow-lg"
      >
        <FieldTitle class="text-4xl font-bold text-green-500">Register</FieldTitle>
        <FieldDescription class="text-2xl font-semibold"
          >Sign up as an employee of Auto Live</FieldDescription
        >

        <FieldGroup class="flex flex-col gap-y-2">
          <Field class="grid grid-cols-1 lg:grid-cols-[20%_1fr]">
            <FieldLabel for="first_name" class="text-lg font-medium">First name</FieldLabel>
            <input
              id="firstName"
              type="text"
              required
              placeholder="Enter your first name..."
              class="px-4 py-2 text-left bg-white border border-green-500 text-lg rounded-md"
              v-model="firstName"
              @input:v-model="(e) => (firstName = e.target.value)"
            />
          </Field>

          <Field class="grid grid-cols-1 lg:grid-cols-[20%_1fr]">
            <FieldLabel for="lastName" class="text-lg font-medium">Last name</FieldLabel>
            <input
              id="lastName"
              type="text"
              required
              placeholder="Enter your last name..."
              class="px-4 py-2 text-left bg-white border border-green-500 text-lg rounded-md"
              v-model="lastName"
              @input:v-model="(e) => (lastName = e.target.value)"
            />
          </Field>

          <Field class="grid grid-cols-1 lg:grid-cols-[20%_1fr]">
            <FieldLabel for="telephone" class="text-lg font-medium">Telephone</FieldLabel>
            <input
              id="telephone"
              type="tel"
              required
              placeholder="Enter your phone number..."
              class="px-4 py-2 text-left bg-white border border-green-500 text-lg rounded-md"
              v-model="telephone"
              @input:v-model="(e) => (telephone = e.target.value)"
            />
          </Field>

          <Field class="grid grid-cols-1 lg:grid-cols-[20%_1fr]">
            <FieldLabel for="email" class="text-lg font-medium">Email</FieldLabel>
            <input
              id="email"
              type="email"
              required
              placeholder="Enter your email..."
              class="px-4 py-2 text-left bg-white border border-green-500 text-lg rounded-md"
              v-model="email"
              @input:v-model="(e) => (email = e.target.value)"
            />
          </Field>

          <Field class="grid grid-cols-1 lg:grid-cols-[20%_1fr]">
            <FieldLabel for="password" class="text-lg font-medium">Password</FieldLabel>
            <input
              id="password"
              type="password"
              required
              placeholder="Enter your password..."
              class="px-4 py-2 text-left bg-white border border-green-500 text-lg rounded-md"
              v-model="password"
              @input:v-model="(e) => (password = e.target.value)"
            />
          </Field>

          <Field class="grid grid-cols-1 lg:grid-cols-[20%_1fr]">
            <FieldLabel for="confirmPassword" class="text-lg font-medium"
              >Confirm password</FieldLabel
            >
            <input
              id="confirmPassword"
              type="password"
              required
              placeholder="Confirm your password..."
              class="px-4 py-2 text-left bg-white border border-green-500 text-lg rounded-md"
              v-model="confirmingPassword"
              @input:v-model="(e) => (confirmingPassword = e.target.value)"
            />
            <FieldError
              class="text-red-500 col-span-full text-center"
              :class="{
                hidden: !confirmingPassword || !password,
                'text-green-500': confirmingPassword === password,
              }"
            >
              {{ confirmingPassword === password ? 'Passwords matched' : 'Passwords do not match' }}
            </FieldError>
          </Field>

          <Field class="mt-8">
            <button
              type="submit"
              class="rounded-lg bg-green-500 hover:bg-green-400 text-center px-4 py-2 cursor-pointer"
              :class="{
                'opacity-50': loading,
              }"
              :disabled="loading"
            >
              {{ loading ? 'Registering...' : 'Register' }}
            </button>
            <button
              @click="isLogin = true"
              type="button"
              class="rounded-lg bg-white hover:bg-green-500 border border-green-500 text-center px-4 py-2 cursor-pointer"
            >
              Back
            </button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  </div>
</template>
