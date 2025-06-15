
<template>
  <div class="min-h-screen bg-gray-50 text-gray-800 p-6">
    <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-4">
      <component :is="steps[currentStep]" 
                 :formData="formData" 
                 @next="nextStep" 
                 @back="prevStep" 
                 @submit="submitForm" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import StepIntro from './components/StepIntro.vue'
import StepScreening from './components/StepScreening.vue'
import StepContact from './components/StepContact.vue'
import StepPillHistory from './components/StepPillHistory.vue'

const steps = [
  StepIntro,
  StepScreening,
  StepContact,
  StepPillHistory
]
const currentStep = ref(0)

const formData = ref({
  firstName: '',
  lastName: '',
  sex: '',
  dob: '',
  email: '',
  phone: '',
  address1: '',
  address2: '',
  city: '',
  postcode: '',
  currentContraceptive: '',
  treatmentPreference: '',
  pillChoice: '',
  otherPill: '',
  pillGap: '',
  extraMeds: ''
})

function nextStep() {
  if (currentStep.value < steps.length - 1) currentStep.value++
}
function prevStep() {
  if (currentStep.value > 0) currentStep.value--
}
function submitForm() {
  console.log('Submitted:', formData.value)
}
</script>
