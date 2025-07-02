<template>
  <div class="space-y-6">
    <h2 class="text-xl font-semibold mb-4">Contact Date and Time</h2>

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

    <div>
      <label for="contactTime" class="block text-sm font-medium text-gray-700 mb-1">
        Choose a time (between 9am and 4:45pm)
      </label>
      <select
        id="contactTime"
        v-model="contactTime"
        class="border rounded px-3 py-2 w-full"
      >
        <option disabled value="">Select time</option>
        <option
          v-for="time in availableTimes"
          :key="time"
          :value="time"
        >
          {{ time }}
        </option>
      </select>
    </div>

    <div class="flex justify-between pt-6">
      <button
        type="button"
        class="bg-gray-200 text-gray-800 px-4 py-2 rounded"
        @click="$emit('back')"
      >
        Back
      </button>



      
<button
  type="button"
  class="bg-blue-600 text-white px-4 py-2 rounded"
  @click="$emit('next')"
>
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

const availableTimes = [
  '09:00', '09:15', '09:30', '09:45',
  '10:00', '10:15', '10:30', '10:45',
  '11:00', '11:15', '11:30', '11:45',
  '12:00', '12:15', '12:30', '12:45',
  '13:00', '13:15', '13:30', '13:45',
  '14:00', '14:15', '14:30', '14:45',
  '15:00', '15:15', '15:30', '15:45',
  '16:00', '16:15', '16:30', '16:45'
]

// Refs initialized from formData if available
const selectedDate = ref(formData.contactDay ? new Date(formData.contactDay) : null)
const contactTime = ref(formData.contactTime || '')

// Disable weekends
const disableWeekends = (date) => {
  const day = date.getDay()
  return day === 0 || day === 6
}

// Write changes back into formData
watch([selectedDate, contactTime], () => {
  formData.contactDay = selectedDate.value
    ? selectedDate.value.toISOString().split('T')[0]
    : ''
  formData.contactTime = contactTime.value
})
</script>
