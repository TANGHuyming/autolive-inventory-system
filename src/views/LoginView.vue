<script setup>
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field'
import { AlertCircleIcon } from '@lucide/vue'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { useEmployeeStore } from '@/stores/EmployeeStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
    <Alert
      v-if="success"
      class="flex items-center justify-center fixed bottom-0 right-0 w-full bg-background/50 border border-background font-bold text-xl text-background"
    >
      <AlertCircleIcon />
      <AlertTitle>{{ success.message }}</AlertTitle>
    </Alert>
    <Alert
      v-else-if="error"
      class="flex items-center justify-center fixed bottom-0 right-0 w-full bg-destructive/50 border border-destructive font-bold text-xl text-destructive"
    >
      <AlertCircleIcon />
      <AlertTitle>{{ error.message }}</AlertTitle>
    </Alert>

    <div
      class="bg-sidebar lg:flex flex-col justify-center items-center p-16 text-center gap-y-2 hidden"
    >
      <img
        src="../../public/frontGate.png"
        alt="picture of autolive entrance"
        class="w-90 h-90 rounded-full"
      />
      <h2 class="text-5xl text-sidebar-foreground font-bold">
        Autolive Inventory Management System
      </h2>
      <p class="text-2xl text-sidebar-primary font-bold">
        Genuine spareparts and vehicle repairing service
      </p>
    </div>

    <form
      @submit="handleLogin"
      class="bg-background flex flex-col justify-center items-center"
      v-if="isLogin"
    >
      <FieldSet>
        <FieldTitle class="text-xl">Login</FieldTitle>
        <FieldDescription class="text-lg"
          >Enter your employee credentials to login</FieldDescription
        >

        <FieldGroup>
          <Field>
            <FieldLabel for="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              required
              placeholder="Enter your email..."
              v-model="email"
              @input:v-model="(e) => (email = e.target.value)"
            />
          </Field>

          <Field>
            <FieldLabel for="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              required
              placeholder="Enter your password..."
              v-model="password"
              @input:v-model="(e) => (password = e.target.value)"
            />
          </Field>

          <Field class="mt-8">
            <Button
              variant="default"
              type="submit"
              class="cursor-pointer"
              :class="{
                'opacity-50': loading,
              }"
              :disabled="loading"
            >
              {{ loading ? 'Logging in...' : 'Log in' }}
            </Button>
            <Button class="cursor-pointer" variant="outline" @click="isLogin = false" type="button">
              Register
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>

    <form @submit="handleRegister" class="flex flex-col justify-center items-center" v-else>
      <FieldSet>
        <FieldTitle class="text-xl">Register</FieldTitle>
        <FieldDescription class="text-lg">Sign up as an employee of Auto Live</FieldDescription>

        <FieldGroup>
          <Field>
            <FieldLabel for="first_name">First name</FieldLabel>
            <Input
              id="firstName"
              type="text"
              required
              placeholder="Enter your first name..."
              v-model="firstName"
              @input:v-model="(e) => (firstName = e.target.value)"
            />
          </Field>

          <Field>
            <FieldLabel for="lastName">Last name</FieldLabel>
            <Input
              id="lastName"
              type="text"
              required
              placeholder="Enter your last name..."
              v-model="lastName"
              @input:v-model="(e) => (lastName = e.target.value)"
            />
          </Field>

          <Field>
            <FieldLabel for="telephone">Telephone</FieldLabel>
            <Input
              id="telephone"
              type="tel"
              required
              placeholder="Enter your phone number..."
              v-model="telephone"
              @input:v-model="(e) => (telephone = e.target.value)"
            />
          </Field>

          <Field>
            <FieldLabel for="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              required
              placeholder="Enter your email..."
              v-model="email"
              @input:v-model="(e) => (email = e.target.value)"
            />
          </Field>

          <Field>
            <FieldLabel for="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              required
              placeholder="Enter your password..."
              v-model="password"
              @input:v-model="(e) => (password = e.target.value)"
            />
          </Field>

          <Field>
            <FieldLabel for="confirmPassword">Confirm password</FieldLabel>
            <Input
              id="confirmPassword"
              type="password"
              required
              placeholder="Confirm your password..."
              v-model="confirmingPassword"
              @input:v-model="(e) => (confirmingPassword = e.target.value)"
            />
            <FieldError>
              {{ confirmingPassword !== password ? 'Passwords do not match' : '' }}
            </FieldError>
          </Field>

          <Field>
            <Button
              variant="default"
              type="submit"
              class="cursor-pointer"
              :class="{
                'opacity-50': loading,
              }"
              :disabled="loading"
            >
              {{ loading ? 'Registering...' : 'Register' }}
            </Button>
            <Button class="cursor-pointer" variant="outline" @click="isLogin = true" type="button">
              Back
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  </div>
</template>
