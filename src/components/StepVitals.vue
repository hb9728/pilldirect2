
<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Contraception-Related Measurements</h2>

    <label class="block mb-2 font-medium">Would you like to enter your height and weight in imperial or metric values?</label>
    <select v-model="formData.imperialMetric" class="input">
      <option disabled value="">Select</option>
      <option>Imperial</option>
      <option>Metric</option>
    </select>

    <div v-if="formData.imperialMetric === 'Imperial'" class="mt-4 space-y-2">
      <input v-model="formData.heightFt" type="number" placeholder="Height (feet)" class="input" />
      <input v-model="formData.heightIn" type="number" placeholder="Height (inches)" class="input" />
      <input v-model="formData.weightSt" type="number" placeholder="Weight (stones)" class="input" />
      <input v-model="formData.weightLbs" type="number" placeholder="Weight (lbs)" class="input" />
    </div>

    <div v-if="formData.imperialMetric === 'Metric'" class="mt-4 space-y-2">
      <input v-model="formData.heightCm" type="number" placeholder="Height (cm)" class="input" />
      <input v-model="formData.weightKg" type="number" placeholder="Weight (kg)" class="input" />
    </div>

    <!-- Skip BP check for certain POP pills -->
    <div v-if="!['Cerazette (Mini Pill)', 'Desogestrel (Mini Pill)', 'Noriday (Mini Pill)'].includes(formData.pillChoice)" class="mt-6">
      <label class="block mb-2 font-medium">Have you had your blood pressure checked within the last three months?</label>
      <select v-model="formData.bpChecked" class="input">
        <option disabled value="">Select</option>
        <option>Yes</option>
        <option>No</option>
      </select>

      <div v-if="formData.bpChecked === 'Yes'" class="mt-3 space-y-2">
        <input v-model="formData.bpSystolic" type="number" placeholder="Top number (systolic pressure)" class="input" />
        <input v-model="formData.bpDiastolic" type="number" placeholder="Bottom number (diastolic pressure)" class="input" />
      </div>
    </div>

    <div class="mt-6 flex justify-between">
      <button @click="$emit('back')" class="btn-secondary">Back</button>
      <button @click="$emit('next')" class="btn">Next</button>
    </div>
  </div>
</template>

<script setup>
defineProps(['formData'])
</script>
