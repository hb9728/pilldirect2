<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Preferred Contact Time</h2>

    <label class="block mb-2 font-medium">Choose a weekday:</label>
    <select
      v-model="formData.contactDay"
      required
      class="mb-4 border rounded p-2 w-full"
    >
      <option disabled value="">Select a day</option>
      <option>Monday</option>
      <option>Tuesday</option>
      <option>Wednesday</option>
      <option>Thursday</option>
      <option>Friday</option>
    </select>

    <label class="block mb-2 font-medium">Preferred time (9:00–16:30):</label>
    <input
      v-model="formData.contactTime"
      type="time"
      min="09:00"
      max="16:30"
      required
      class="border rounded p-2 w-full"
    />
  </div>
</template>

<script setup>
import { inject } from 'vue'
const formData = inject('formData')
</script>
