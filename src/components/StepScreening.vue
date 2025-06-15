
<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Screening Questions</h2>
    <input v-model="formData.firstName" placeholder="First name" class="input" />
    <input v-model="formData.lastName" placeholder="Last name" class="input" />
    <select v-model="formData.sex" class="input">
      <option disabled value="">Select sex</option>
      <option>Female</option>
      <option>Male</option>
    </select>
    <input v-model="formData.dob" type="date" class="input" />
    <input v-model.number="formData.age" type="number" placeholder="Age" class="input" />
    <p v-if="formData.age < 16" class="text-red-600 mt-2">Must be 16+ to use this service.</p>

    <div class="mt-6 flex justify-between">
      <button @click="$emit('back')" class="btn-secondary">Back</button>
      <button :disabled="formData.age < 16" @click="$emit('next')" class="btn">Next</button>
    </div>
  </div>
</template>

<script setup>
defineProps(['formData'])
</script>
