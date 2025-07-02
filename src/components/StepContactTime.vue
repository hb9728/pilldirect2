<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-800">Callback Preference</h2>
      <p class="text-sm text-gray-600">Choose a weekday and time (9:00 to 16:30) to be contacted by phone.</p>
    </div>

    <!-- Fancy Date Picker with weekend restriction -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Preferred Day</label>
      <Datepicker
        v-model="formData.contactDay"
        :min-date="new Date()"
        :disabled-dates="isWeekend"
        input-class="w-full border border-gray-300 rounded px-3 py-2"
      />
    </div>

    <!-- Time Dropdown -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
      <select v-model="formData.contactTime" class="border border-gray-300 rounded px-3 py-2 w-full">
        <option disabled value="">Select a time</option>
        <option v-for="time in timeSlots" :key="time" :value="time">
          {{ time }}
        </option>
      </select>
    </div>

    <!-- Navigation -->
    <div class="flex justify-between mt-6">
      <button @click="$emit('back')" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Back</button>
      <button @click="next" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Next</button>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import Datepicker from 'vue3-datepicker'

const formData = inject('formData')
const emit = defineEmits(['next', 'back'])

const isWeekend = (date) => {
  const day = date.getDay()
  return day === 0 || day === 6 // Sunday or Saturday
}

const timeSlots = []
for (let hour = 9; hour <= 16; hour++) {
  for (let min of [0, 15, 30, 45]) {
    if (hour === 16 && min > 30) break
    timeSlots.push(`${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`)
  }
}

function next() {
  if (!formData.contactDay || !formData.contactTime) {
    alert('Please select both a valid day and time.')
    return
  }
  emit('next')
}
</script>

<style scoped>
/* Optional: make datepicker inputs look consistent */
.dp__input {
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
}
</style>
