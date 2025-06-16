 <!-- <template>
  <div class="min-h-screen bg-gray-50 text-gray-800 p-6">
    <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-4">
      <component
        :is="steps[currentStep]"
        :formData="formData"
        :submitted="submitted"
        @next="nextStep"
        @back="prevStep"
        @submit="handleSubmit"
      />
    </div>
  </div>
</template>
-->


<template>
  <div>
    <router-view v-slot="{ Component }">
      <!-- Only show router component if /admin route -->
      <component :is="Component" v-if="isAdminRoute" />

      <!-- Otherwise show the form -->
      <div v-else>
        <div class="min-h-screen bg-gray-50 text-gray-800 p-6">
          <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-4">
            <component
              :is="steps[currentStep]"
              :formData="formData"
              :submitted="submitted"
              @next="nextStep"
              @back="prevStep"
              @submit="handleSubmit"
            />
          </div>
        </div>
      </div>
    </router-view>
  </div>
</template>






<script setup>
import { provide } from 'vue'
import { ref } from 'vue'
import StepIntro from './components/StepIntro.vue'
import StepScreening from './components/StepScreening.vue'
import StepContact from './components/StepContact.vue'
import StepPillHistory from './components/StepPillHistory.vue'
import StepVitals from './components/StepVitals.vue'
import StepMedicalHistory from './components/StepMedicalHistory.vue'
import StepFinalConsent from './components/StepFinalConsent.vue'
import StepThankYou from './components/StepThankYou.vue'



import { useRoute } from 'vue-router'

const route = useRoute()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))

// const emptyToNull = (val) => val === '' || val === undefined ? null : val







  
import { supabase } from './supabase'

const handleSubmit = async (data) => {
  if (!validateStep()) {
    alert("Please complete all required fields before submitting.")
    return
  }

  // Helper to clean numeric inputs
  const clean = (val) => {
    if (val === '' || val === null || isNaN(val)) return null
    return val
  }

  // Build the submission object
  const submission = {
    firstName: data.firstName,
    lastName: data.lastName,
    dob: data.dob,
    sex: data.sex,
    email: data.email,
    phone: data.phone,
    address1: data.address1,
    address2: data.address2,
    city: data.city,
    postcode: data.postcode,
    currentContraceptive: data.currentContraceptive,
    treatmentPreference: data.treatmentPreference,
    pillChoice: data.pillChoice,
    otherPill: data.otherPill,
    pillGap: data.pillGap,
    extraMeds: data.extraMeds,
    imperialMetric: data.imperialMetric,
    heightFt: clean(parseInt(data.heightFt)),
    heightIn: clean(parseInt(data.heightIn)),
    weightSt: clean(parseInt(data.weightSt)),
    weightLbs: clean(parseInt(data.weightLbs)),
    heightCm: clean(parseFloat(data.heightCm)),
    weightKg: clean(parseFloat(data.weightKg)),
    bpChecked: data.bpChecked,
    bpSystolic: clean(parseInt(data.bpSystolic)),
    bpDiastolic: clean(parseInt(data.bpDiastolic)),
    selectApplicable: data.selectApplicable,
    extraInfo: data.extraInfo,
    promoConsent: data.promoConsent,
    shareConsent: data.shareConsent,
    updateConsent: data.updateConsent,
    responseId: data.responseId
  }

  // Final cleanup: convert all "" to null
  const filtered = Object.fromEntries(
    Object.entries(submission).map(([k, v]) => [k, v === '' ? null : v])
  )

  const { error } = await supabase.from('submissions').insert([filtered])

  if (error) {
    console.error('❌ Supabase Insert Error:', JSON.stringify(error, null, 2))
    alert('There was a problem saving your data. Please try again.')
    return
  }

  console.log('✅ Submitted successfully to Supabase:', submission)
  
  // currentStep.value++ 
}







const submitted = ref(false)


  


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
  provide('formData', formData.value)

const steps = [
  StepIntro,
  StepScreening,
  StepContact,
  StepPillHistory,
  StepVitals,
  StepMedicalHistory,
  StepFinalConsent,
  StepThankYou
]
const currentStep = ref(0)

const validateStep = () => {
  const stepIndex = currentStep.value

  // ✅ Step 0 is just informational — allow navigation
  if (stepIndex === 0) return true

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
    // Must select one of the contraception types
    if (!formData.value.currentContraceptive) return false
  
    // Must answer whether they have a preference
    if (!formData.value.treatmentPreference) return false
  
    // If preference is yes, must choose a pill
    if (formData.value.treatmentPreference === 'Yes' && !formData.value.pillChoice) return false
  
    // If "Other" pill selected, must specify which one
    if (formData.value.pillChoice === 'Other' && !formData.value.otherPill) return false
  
    // Must answer gap question
    if (!formData.value.pillGap) return false
  
    // Must answer extra meds question (even if writing "none")
    if (!formData.value.extraMeds) return false
  
    return true
    }

  // Pill Vitals
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

  // Medical History
  if (stepIndex === 5) {
  const selected = formData.value.selectApplicable
  const notes = formData.value.extraInfo?.trim()

  // If nothing selected and no extra info, block the user
  if ((!selected || selected.length === 0) && !notes) {
    return false
  }

  return true
  }
  
  // Final Consent
  if (stepIndex === 6) {
    if (!formData.value.shareConsent || !formData.value.updateConsent) {
      return false
    }
  return true
  }
}



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
