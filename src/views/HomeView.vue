<script>
import { ref, onMounted } from 'vue'
import { useEmployeeStore } from '@/stores/EmployeeStore'

const { login, register } = useEmployeeStore()
const firstName = ref(null)
const lastName = ref(null)
const telephone = ref(null)
const email = ref(null)
const password = ref(null)

const handleLogin = async (event) => {
  event.preventDefault()
  console.log('Form submitted')
  console.log('Email is: ', email.value)
  console.log('Password is: ', password.value)

  await login({ email: email.value, password: password.value })
}

const handleRegister = async (event) => {
  event.preventDefault()
  console.log('Form submitted')
  console.log('First name is: ', firstName.value)
  console.log('Last name is: ', lastName.value)
  console.log('Telephone is: ', telephone.value)
  console.log('Email is: ', email.value)
  console.log('Password is: ', password.value)

  await register({
    first_name: firstName.value,
    last_name: lastName.value,
    email: email.value,
    telephone: telephone.value,
    password: password.value,
  })
}
</script>

<template>
  <h1>You did it!</h1>
  <form @submit="handleLogin" id="loginForm" class="bg-blue-200 px-4 py-2 border border-blue-500">
    <input
      type="email"
      required
      placeholder="Enter your email..."
      v-model="email"
      @input:v-model="(e) => (email = e.target.value)"
    />

    <input
      type="password"
      required
      placeholder="Enter your password..."
      v-model="password"
      @input:v-model="(e) => (password = e.target.value)"
    />

    <button type="submit" class="">Submit</button>
  </form>

  <form @submit="handleRegister" id="registerForm">
    <input
      type="text"
      required
      placeholder="Enter your first name..."
      v-model="firstName"
      @input:v-model="(e) => (firstName = e.target.value)"
    />

    <input
      type="text"
      required
      placeholder="Enter your last name..."
      v-model="lastName"
      @input:v-model="(e) => (lastName = e.target.value)"
    />

    <input
      type="telephone"
      required
      placeholder="Enter your telephone number..."
      v-model="telephone"
      @input:v-model="(e) => (telephone = e.target.value)"
    />

    <input
      type="email"
      required
      placeholder="Enter your email..."
      v-model="email"
      @input:v-model="(e) => (email = e.target.value)"
    />

    <input
      type="password"
      required
      placeholder="Enter your password..."
      v-model="password"
      @input:v-model="(e) => (password = e.target.value)"
    />

    <button type="submit" class="">Submit</button>
  </form>
</template>
