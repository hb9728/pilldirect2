
<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Medical History</h2>

    <label class="block mb-2 font-medium">Select any points that apply from the following:</label>

    <!-- Pregnancy -->
    <div class="space-y-2">
      <label class="inline-flex items-start space-x-2">
        <input type="checkbox" value="Pregnant or possibly pregnant" v-model="formData.selectApplicable" class="mt-1" />
        <span>Pregnant or possibly pregnant</span>
      </label>
    </div>

    <hr class="my-4 border-gray-300" />

    <!-- Smoking & Clots -->
    <div class="space-y-2">
      <label v-for="item in [
        'Have long periods of immobility',
        'Currently smoking (including vaping / use of e-cigarettes)',
        'Current or past history of ischaemic heart disease, vascular disease, stroke, or transient ischaemic attack (TIA)',
        'Deep vein thrombosis or pulmonary embolus',
        'Current or past history of any heart disease',
        'Parents, siblings, or children who have had heart disease or strokes under the age of 45',
        'Any blood clotting illnesses/abnormalities',
        'Do you have any problems with your heart muscle or any impaired heart function',
        'Do you have or have you been diagnosed with atrial fibrillation'
      ]" :key="item" class="inline-flex items-start space-x-2">
        <input type="checkbox" :value="item" v-model="formData.selectApplicable" class="mt-1" />
        <span>{{ item }}</span>
      </label>
    </div>

    <hr class="my-4 border-gray-300" />

    <!-- Diabetes -->
    <div class="space-y-2">
      <label v-for="item in [
        'Do you have diabetes',
        'If you do have diabetes, has this affected any of your organs (causing retinopathy, nephropathy, or neuropathy)'
      ]" :key="item" class="inline-flex items-start space-x-2">
        <input type="checkbox" :value="item" v-model="formData.selectApplicable" class="mt-1" />
        <span>{{ item }}</span>
      </label>
    </div>

    <hr class="my-4 border-gray-300" />

    <!-- Migraines -->
    <div class="space-y-2">
      <label v-for="item in [
        'Suffer from migraines',
        'If you do suffer from migraines, do you experience any visual symptoms or changes in sensation or muscle power on one side of your body?',
        'If you do suffer from migraines, your first attack occurred when you started taking your contraceptive pill'
      ]" :key="item" class="inline-flex items-start space-x-2">
        <input type="checkbox" :value="item" v-model="formData.selectApplicable" class="mt-1" />
        <span>{{ item }}</span>
      </label>
    </div>

    <hr class="my-4 border-gray-300" />

    <!-- Cancer -->
    <div class="space-y-2">
      <label v-for="item in [
        'Past or current history of breast cancer',
        'Any undiagnosed breast symptoms',
        'Any family history of breast cancer under the age of 50',
        'Any past or current history of any other cancer'
      ]" :key="item" class="inline-flex items-start space-x-2">
        <input type="checkbox" :value="item" v-model="formData.selectApplicable" class="mt-1" />
        <span>{{ item }}</span>
      </label>
    </div>

    <hr class="my-4 border-gray-300" />

    <!-- Liver, Gallbladder, GI -->
    <div class="space-y-2">
      <label v-for="item in [
        'Any form of liver disease or liver impairment',
        'Any gall bladder disease that causes you symptoms or is medically managed',
        'Suffer from acute/active inflammatory bowel disease or Crohn’s disease',
        'Had any bariatric surgery or any other surgery that has reduced your ability to absorb things from your stomach',
        'Suffer from cholestasis, a condition caused by blocked or reduced flow of bile fluid'
      ]" :key="item" class="inline-flex items-start space-x-2">
        <input type="checkbox" :value="item" v-model="formData.selectApplicable" class="mt-1" />
        <span>{{ item }}</span>
      </label>
    </div>

    <hr class="my-4 border-gray-300" />

    <!-- Other Complex -->
    <div class="space-y-2">
      <label v-for="item in [
        'Any planned major surgeries',
        'Ever diagnosed with anti-phospholipid syndrome (APS aka Hughes syndrome) with or without Lupus',
        'Ever had an organ transplant that resulted in complications',
        'Have severe kidney impairment or acute kidney failure',
        'Diagnosed with acute porphyria'
      ]" :key="item" class="inline-flex items-start space-x-2">
        <input type="checkbox" :value="item" v-model="formData.selectApplicable" class="mt-1" />
        <span>{{ item }}</span>
      </label>
    </div>

    <!-- Extra Info -->
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
</script>
