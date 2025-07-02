<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-800">Callback Preference</h2>
      <p class="text-sm text-gray-600">Please select a weekday and time between 9:00am and 4:30pm for a callback about your request.</p>
    </div>

    <!-- Date Picker -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Preferred Day</label>
      <input
        type="date"
        v-model="formData.contactDay"
        :min="minDate"
        class="border border-gray-300 rounded px-3 py-2 w-full"
        @input="ensureWeekday"
      />
      <p v-if="!isWeekday(formData.contactDay)" class="text-red-500 text-xs mt-1">
        Please select a weekday (Mon–Fri).
      </p>
    </div>

    <!-- Time Picker -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
      <select
        v-model="formData.contactTime"
        class="border border-gray-300 rounded px-3 py-2 w-full"
      >
        <option disabled value="">Select a time</option>
        <option v-for="time in timeSlots" :key="time" :value="time">
          {{ time }}
        </option>
      </select>
    </div>

    <!-- Navigation Buttons -->
    <div class="flex justify-between mt-6">
      <button @click="$emit('back')" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Back</button>
      <button
        @click="next"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'
const formData = inject('formData')

const emit = defineEmits(['next', 'back'])

const minDate = new Date().toISOString().split('T')[0]

// Only allow Mon–Fri
function isWeekday(dateStr) {
  if (!dateStr) return false
  const day = new Date(dateStr).getDay()
  return day >= 1 && day <= 5
}

function ensureWeekday(e) {
  const val = e.target.value
  if (!isWeekday(val)) formData.contactDay = ''
}

const timeSlots = []
for (let hour = 9; hour <= 16; hour++) {
  for (let min of [0, 15, 30, 45]) {
    if (hour === 16 && min > 30) break
    const hh = String(hour).padStart(2, '0')
    const mm = String(min).padStart(2, '0')
    timeSlots.push(`${hh}:${mm}`)
  }
}

function next() {
  if (!formData.contactDay || !formData.contactTime || !isWeekday(formData.contactDay)) {
    alert("Please choose a valid weekday and time.")
    return
  }
  emit('next')
}
</script>
