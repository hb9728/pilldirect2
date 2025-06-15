
<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Contraception & Medication History</h2>

    <label class="block mb-2 font-medium">Are you currently using any of the following contraceptives?</label>
    <div class="mb-4">
      <div v-for="option in contraceptiveOptions" :key="option" class="mb-1">
        <label class="inline-flex items-center">
          <input type="radio" v-model="formData.currentContraceptive" :value="option" class="mr-2" />
          {{ option }}
        </label>
      </div>
    </div>

    <label class="block mb-2 font-medium">Do you have a treatment preference?</label>
    <select v-model="formData.treatmentPreference" class="input">
      <option disabled value="">Select</option>
      <option>Yes</option>
      <option>No or First Time User</option>
    </select>

    <div v-if="formData.treatmentPreference === 'Yes'" class="mt-4">
      <label class="block mb-2 font-medium">Which of the following do you take?</label>
      <select v-model="formData.pillChoice" class="input">
        <option disabled value="">Select</option>
        <option>Microgynon 30</option>
        <option>Rigevidon</option>
        <option>Yasmin</option>
        <option>Femodette</option>
        <option>Cerazette (Mini Pill)</option>
        <option>Noriday (Mini Pill)</option>
        <option>Desogestrel (Mini Pill)</option>
        <option>Other</option>
      </select>

      <div v-if="formData.pillChoice === 'Other'" class="mt-3">
        <input v-model="formData.otherPill" placeholder="Which other contraceptive pill do you take?" class="input" />
      </div>
    </div>

    <label class="block mt-6 mb-2 font-medium">Have you missed any pills since your last supply?</label>
    <select v-model="formData.pillGap" class="input">
      <option disabled value="">Select</option>
      <option>Yes</option>
      <option>No</option>
    </select>

    <label class="block mt-6 mb-2 font-medium">List any other prescribed medications, OTC or herbal products:</label>
    <textarea v-model="formData.extraMeds" class="input" rows="3" placeholder="If none, type 'none'"></textarea>

    <div class="mt-6 flex justify-between">
      <button @click="$emit('back')" class="btn-secondary">Back</button>
      <button @click="$emit('next')" class="btn">Next</button>
    </div>
  </div>
</template>

<script setup>
defineProps(['formData'])

const contraceptiveOptions = [
  'A contraceptive pill, patch, or ring',
  'Injection',
  'Implant',
  'IUS (hormonal coil) or IUD (copper coil)',
  'None of the above'
]
</script>
