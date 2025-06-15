
<template>
  <div class="min-h-screen bg-gray-50 text-gray-800 p-6">
    <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-4">
      <component :is="steps[currentStep]" 
                 :formData="formData" 
                 @next="nextStep" 
                 @back="prevStep" 
                 @submit="handleSubmit" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import StepIntro from './components/StepIntro.vue'
import StepScreening from './components/StepScreening.vue'
import StepContact from './components/StepContact.vue'
import StepPillHistory from './components/StepPillHistory.vue'
import StepVitals from './components/StepVitals.vue'
import StepMedicalHistory from './components/StepMedicalHistory.vue'
import StepFinalConsent from './components/StepFinalConsent.vue'

const handleSubmit = (data) => {
  console.log('Final submission:', data)
  // TODO: send to backend / Supabase / Zapier / etc.
}

const steps = [
  StepIntro,
  StepScreening,
  StepContact,
  StepPillHistory,
  StepVitals,
  StepMedicalHistory,
  StepFinalConsent,
]
const currentStep = ref(0)

const validateStep = () => {
  const stepIndex = currentStep.value

  // Screening
  if (stepIndex === 1) {
    return !!formData.value.firstName &&
           !!formData.value.lastName &&
           !!formData.value.dob &&
           formData.value.age >= 16
  }

  // Contact Info
  if (stepIndex === 2) {
    return !!formData.value.email &&
           !!formData.value.phone &&
           !!formData.value.address1 &&
           !!formData.value.city &&
           !!formData.value.postcode
  }

  // Pill History
  if (stepIndex === 3) {
  // Always required
  if (!formData.value.currentContraceptive) return false

  // If they have a treatment preference, ensure a pill choice is selected
  if (formData.value.treatmentPreference === 'Yes' && !formData.value.pillChoice) return false

  // If 'Other' pill is selected, a description must be provided
  if (formData.value.pillChoice === 'Other' && !formData.value.otherPill) return false

  return true
  }

  if (stepIndex === 4) {
  if (!formData.value.imperialMetric) return false

  if (formData.value.imperialMetric === 'Imperial') {
    if (
      !formData.value.heightFt ||
      !formData.value.heightIn ||
      !formData.value.weightSt ||
      !formData.value.weightLbs
    ) return false
  }

  if (formData.value.imperialMetric === 'Metric') {
    if (
      !formData.value.heightCm ||
      !formData.value.weightKg
    ) return false
  }

  if (formData.value.bpChecked === 'Yes') {
    if (
      !formData.value.bpSystolic ||
      !formData.value.bpDiastolic
    ) return false
  }

  return true
}

  
  // Final Consent
  if (stepIndex === 6) {
    return !!formData.value.shareConsent &&
           !!formData.value.updateConsent
    // promoConsent is optional
  }

  return true
}


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
  extraMeds: '',
  imperialMetric: '',
  heightFt: '',
  heightIn: '',
  weightSt: '',
  weightLbs: '',
  heightCm: '',
  weightKg: '',
  bpChecked: '',
  bpSystolic: '',
  bpDiastolic: '',
  selectApplicable: [],
  extraInfo: '',
  promoConsent: false,
  shareConsent: false,
  updateConsent: false,
  responseId: ''
})

function nextStep() {
  if (!validateStep()) {
    alert("Please complete all required fields before proceeding.")
    return
  }
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}
function prevStep() {
  if (currentStep.value > 0) currentStep.value--
}
function submitForm() {
  console.log('Submitted:', formData.value)
}
</script>
