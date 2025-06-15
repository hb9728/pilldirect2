
<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Your Contact Info</h2>
    <input v-model="formData.email" type="email" placeholder="Email address" class="input" />
    <input v-model="formData.phone" type="tel" placeholder="Phone number" class="input" />

    <div class="mt-6 flex justify-between">
      <button @click="$emit('back')" class="btn-secondary">Back</button>
      <button @click="$emit('submit')" class="btn">Submit</button>
    </div>
  </div>
</template>

<script setup>
defineProps(['formData'])
</script>
