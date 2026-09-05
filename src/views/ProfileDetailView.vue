<script setup>
import { useEmployeeStore } from '@/stores/EmployeeStore'
import { storeToRefs } from 'pinia'
import { watch, ref, onMounted } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const employeeStore = useEmployeeStore()
const { profile, error } = storeToRefs(employeeStore)
const { me, updateEmployee } = employeeStore
const profileEditDialog = ref(false)
const confirmProfileSaveDialog = ref(false)
const updatedProfile = ref({
  first_name: profile.value.employee_first_name,
  last_name: profile.value.employee_last_name,
  email: profile.value.employee_email,
  telephone: profile.value.employee_telephone,
})

onMounted(() => {
  me()
})

function handleOpenProfileEditDialog() {
  profileEditDialog.value = true
}

function handleProfileSave() {
  confirmProfileSaveDialog.value = true
}

function handleConfirmProfileSave() {
  profileEditDialog.value = false
  confirmProfileSaveDialog.value = false
  updateEmployee(profile.value.employee_id, { ...updatedProfile.value, method: 'PUT' })
  if (!error.value) {
    me(true)
  }
}
</script>

<template>
  <Dialog v-model:open="profileEditDialog">
    <DialogContent class="w-full sm:w-[80vw]">
      <DialogHeader>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogDescription>Update your profile information below.</DialogDescription>
      </DialogHeader>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
        <div>
          <label for="firstName" class="text-md text-primary font-semibold">First Name:</label>
          <Input
            id="firstName"
            v-model="updatedProfile.first_name"
            class="font-semibold text-foreground"
          />
        </div>

        <div>
          <label for="lastName" class="text-md text-primary font-semibold">Last Name:</label>
          <Input
            id="lastName"
            v-model="updatedProfile.last_name"
            class="font-semibold text-foreground"
          />
        </div>

        <div>
          <label for="email" class="text-md text-primary font-semibold">Email:</label>
          <Input id="email" v-model="updatedProfile.email" class="font-semibold text-foreground" />
        </div>

        <div>
          <label for="telephone" class="text-md text-primary font-semibold">Telephone:</label>
          <Input
            id="telephone"
            v-model="updatedProfile.telephone"
            class="font-semibold text-foreground"
          />
        </div>
      </div>

      <div class="flex justify-end space-x-2">
        <Button variant="outline" @click="profileEditDialog = false">Cancel</Button>
        <Button variant="default" @click="handleProfileSave">Save</Button>
      </div>
    </DialogContent>
  </Dialog>

  <Dialog v-model:open="confirmProfileSaveDialog">
    <DialogContent class="w-full sm:w-[80vw]">
      <DialogHeader>
        <DialogTitle>Confirm Save</DialogTitle>
        <DialogDescription
          >Are you sure you want to save the changes to your profile?</DialogDescription
        >
      </DialogHeader>

      <div class="flex justify-end space-x-2">
        <Button variant="outline" @click="confirmProfileSaveDialog = false">Cancel</Button>
        <Button variant="default" @click="handleConfirmProfileSave">Confirm</Button>
      </div>
    </DialogContent>
  </Dialog>

  <div class="max-w-5xl mx-auto mt-20 space-y-10">
    <div class="rounded-full w-50 h-50 overflow-hidden mx-auto">
      <img
        :src="profile.employee_avatar ?? '../../public/frontGate.png'"
        :alt="`Image of ${profile.employee_name}`"
        class="object-cover w-full h-full"
      />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
      <div>
        <label for="firstName" class="text-md text-primary font-semibold">First Name:</label>
        <Input
          id="firstName"
          :disabled="true"
          v-model="profile.employee_first_name"
          class="font-semibold text-foreground"
        />
      </div>

      <div>
        <label for="lastName" class="text-md text-primary font-semibold">Last Name:</label>
        <Input
          id="lastName"
          :disabled="true"
          v-model="profile.employee_last_name"
          class="font-semibold text-foreground"
        />
      </div>

      <div>
        <label for="email" class="text-md text-primary font-semibold">Email:</label>
        <Input
          id="email"
          :disabled="true"
          v-model="profile.employee_email"
          class="font-semibold text-foreground"
        />
      </div>

      <div>
        <label for="telephone" class="text-md text-primary font-semibold">Telephone:</label>
        <Input
          id="telephone"
          :disabled="true"
          v-model="profile.employee_telephone"
          class="font-semibold text-foreground"
        />
      </div>
    </div>

    <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <Button variant="default" class="cursor-pointer w-1/2" @click="handleOpenProfileEditDialog"
        >Edit</Button
      >
    </div>
  </div>
</template>
