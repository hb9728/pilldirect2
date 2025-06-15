
<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Medical History</h2>

    <label class="block mb-2 font-medium">Select any points that apply from the following:</label>
    <div class="mb-4 space-y-2">
      <div v-for="option in options" :key="option">
        <label class="inline-flex items-start space-x-2">
          <input type="checkbox" :value="option" v-model="formData.selectApplicable" class="mt-1" />
          <span>{{ option }}</span>
        </label>
      </div>
    </div>

    <label class="block mt-6 mb-2 font-medium">Please enter any further information you would like to provide to our medical team:</label>
    <textarea v-model="formData.extraInfo" class="input" rows="4"></textarea>

    <div class="mt-6 flex justify-between">
      <button @click="$emit('back')" class="btn-secondary">Back</button>
      <button @click="$emit('next')" class="btn">Next</button>
    </div>
  </div>
</template>

<script setup>
defineProps(['formData'])

const options = [
  'Pregnant or possibly pregnant',
  'Have long periods of immobility',
  'Currently smoking (including vaping / use of e-cigarettes)',
  'Current or past history of ischaemic heart disease, vascular disease, stroke, or transient ischaemic attack (TIA)',
  'Do you have diabetes',
  'If you do have diabetes, has this affected any of your organs (causing retinopathy, nephropathy, or neuropathy)',
  'Deep vein thrombosis or pulmonary embolus',
  'Current or past history of any heart disease',
  'Parents, siblings, or children who have had heart disease or strokes under the age of 45',
  'Any blood clotting illnesses/abnormalities',
  'Do you have any problems with your heart muscle or any impaired heart function',
  'Do you have or have you been diagnosed with atrial fibrillation',
  'Suffer from migraines',
  'If you do suffer from migraines, do you experience any visual symptoms or changes in sensation or muscle power on one side of your body?',
  'If you do suffer from migraines, your first attack occurred when you started taking your contraceptive pill',
  'Past or current history of breast cancer',
  'Any undiagnosed breast symptoms',
  'Any family history of breast cancer under the age of 50',
  'Any past or current history of any other cancer',
  'Any form of liver disease or liver impairment',
  'Any gall bladder disease that causes you symptoms or is medically managed',
  'Suffer from acute/active inflammatory bowel disease or Crohn’s disease',
  'Had any bariatric surgery or any other surgery that has reduced your ability to absorb things from your stomach',
  'Suffer from cholestasis, a condition caused by blocked or reduced flow of bile fluid',
  'Any planned major surgeries',
  'Ever diagnosed with anti-phospholipid syndrome (APS aka Hughes syndrome) with or without Lupus',
  'Ever had an organ transplant that resulted in complications',
  'Have severe kidney impairment or acute kidney failure',
  'Diagnosed with acute porphyria'
]
</script>
