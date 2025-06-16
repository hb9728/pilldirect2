
<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Screening Questions</h2>
    <input v-model="formData.firstName" placeholder="First name" class="input" />
    <input v-model="formData.lastName" placeholder="Last name" class="input" />
    <select v-model="formData.sex" class="input">
      <option disabled value="">Select sex</option>
      <option>Female</option>
      <option>Male</option>
      <option>Other</option>
    </select>
    
    <!-- <input v-model="formData.dob" type="date" class="input" @change="calculateAge" /> -->






      <!-- 👇 Responsive Date Input -->
    <div class="mt-2 w-full">
      <label class="block text-sm font-medium mb-1">Date of Birth</label>
      <input
        v-model="formData.dob"
        type="date"
        @change="calculateAge"
        class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
      />
    </div>








    

    <p class="mb-3">Age: <strong>{{ calculatedAge }}</strong></p>
    <p v-if="calculatedAge < 16" class="text-red-600 mt-2">You must be 16 or older to use this service.</p>

    <div class="mt-6 flex justify-between">
      <button @click="$emit('back')" class="btn-secondary">Back</button>
      <button :disabled="calculatedAge < 16" @click="$emit('next')" class="btn">Next</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps(['formData'])

const calculatedAge = computed(() => {
  if (!props.formData.dob) return ''
  const dob = new Date(props.formData.dob)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  return age
})

function calculateAge() {
  props.formData.age = calculatedAge.value
}
</script>
