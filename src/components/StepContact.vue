
<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Your Contact Info</h2>

    <input v-model="formData.email" type="email" placeholder="Email address" class="input" />
    <input v-model="formData.phone" type="tel" placeholder="Phone number" class="input" />

    <input v-model="formData.address1" placeholder="Address Line 1" class="input" />
    <input v-model="formData.address2" placeholder="Address Line 2 (optional)" class="input" />
    <input v-model="formData.city" placeholder="City" class="input" />
    <input v-model="formData.postcode" placeholder="Postcode" class="input" />

    <div class="mt-6 flex justify-between">
      <button @click="$emit('back')" class="btn-secondary">Back</button>
      <button @click="$emit('next')" class="btn">Next</button>
    </div>
  </div>
</template>

<script setup>
defineProps(['formData'])
</script>
