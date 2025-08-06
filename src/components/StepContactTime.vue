<template>
  <div class="space-y-6">
    <h2 class="text-xl font-semibold mb-4">Contact Date and Time</h2>

    <!-- Date Picker -->
    <div>
      <label for="contactDay" class="block text-sm font-medium text-gray-700 mb-1">
        Choose a day for us to call you
      </label>
      <Datepicker
        v-model="selectedDate"
        :disabled-dates="disableWeekends"
        :min-date="new Date()"
        input-class="border rounded px-3 py-2 w-full"
        :clearable="false"
        :inline="false"
        :enable-time-picker="false"
      />
    </div>

    <!-- Time Picker -->
    <div>
      <label for="contactTime" class="block text-sm font-medium text-gray-700 mb-1">
        Choose a time (between 9 am and 9 pm)
      </label>
      <select
        id="contactTime"
        v-model="contactTime"
        class="border rounded px-3 py-2 w-full"
      >
        <option disabled value="">Select time</option>
        <option v-for="time in availableTimes" :key="time" :value="time">
          {{ time }}
        </option>
      </select>
    </div>

    <!-- Navigation -->
    <div class="flex justify-between pt-6">
      <button type="button" class="bg-gray-200 text-gray-800 px-4 py-2 rounded" @click="$emit('back')">
        Back
      </button>
      <button type="button" class="bg-blue-600 text-white px-4 py-2 rounded" @click="$emit('next')">
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, inject } from 'vue'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const formData = inject('formData')

// Generate 15-minute slots from 09:00 → 20:45
const availableTimes = Array.from({ length: 13 * 4 }, (_, i) => {
  const h = 9 + Math.floor(i / 4)            // 09 → 21 (exclusive)
  const m = (i % 4) * 15                     // 00, 15, 30, 45
  if (h === 21) return null                  // exclude 21:00 exact
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}).filter(Boolean)

const selectedDate = ref(formData.contactDay ? new Date(formData.contactDay) : null)
const contactTime   = ref(formData.contactTime || '')

const disableWeekends = (date) => {
  const day = date.getDay()
  return day === 0 || day === 6
}

watch([selectedDate, contactTime], () => {
  formData.contactDay = selectedDate.value ? selectedDate.value.toISOString().split('T')[0] : ''
  formData.contactTime = contactTime.value
})
</script>
