<template>
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

<script setup>
import { provide } from 'vue'
import { ref } from 'vue'
import StepIntro from '../components/StepIntro.vue'
import StepScreening from '../components/StepScreening.vue'
import StepContact from '../components/StepContact.vue'
import StepPillHistory from '../components/StepPillHistory.vue'
import StepVitals from '../components/StepVitals.vue'
import StepMedicalHistory from '../components/StepMedicalHistory.vue'
import StepContactTime from '../components/StepContactTime.vue'
import StepFinalConsent from '../components/StepFinalConsent.vue'
import StepThankYou from '../components/StepThankYou.vue'

import { supabase } from '../supabase'

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
    responseId: data.responseId,
    contactDay: data.contactDay,
    contactTime: data.contactTime,
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
}

const submitted = ref(false)
const validationError = ref('')

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
  responseId: '',
  contactDay: '',
  contactTime: '',
})
provide('formData', formData.value)

// NEW STEP ORDER — personal-info screens now sit just before consent
const steps = [
  StepIntro,          // 0
  StepPillHistory,    // 1
  StepVitals,         // 2
  StepMedicalHistory, // 3
  StepContactTime,    // 4
  StepScreening,      // 5 (name/DOB)
  StepContact,        // 6 (address/email/phone)
  StepFinalConsent,   // 7
  StepThankYou        // 8
]

const currentStep = ref(0)

const validateStep = () => {
  const stepIndex = currentStep.value

  // Intro — always ok
  if (stepIndex === 0) return true

  // 1️⃣ Pill History
  if (stepIndex === 1) {
    if (!formData.value.currentContraceptive) return false
    if (!formData.value.treatmentPreference) return false
    if (formData.value.treatmentPreference === 'Yes' && !formData.value.pillChoice) return false
    if (formData.value.pillChoice === 'Other' && !formData.value.otherPill) return false
    if (!formData.value.pillGap) return false
    if (!formData.value.extraMeds) return false
    return true
  }

  // 2️⃣ Pill Vitals
  if (stepIndex === 2) {
    if (!formData.value.imperialMetric) return false

    if (formData.value.imperialMetric === 'Imperial') {
      const empty = (v) => v === '' || v === null || v === undefined
      const ft = Number(formData.value.heightFt)
      const inches = Number(formData.value.heightIn)
      const st = Number(formData.value.weightSt)
      const lbs = Number(formData.value.weightLbs)

      if (empty(ft) || empty(inches) || empty(st) || empty(lbs)) return false
      if (ft === 0 && inches === 0) {
        validationError.value = 'Please enter a height in either feet or inches (cannot both be 0).'
        return false
      }
      if (st === 0 && lbs === 0) {
        validationError.value = 'Please enter a weight in either stone or pounds (cannot both be 0).'
        return false
      }
    }

    if (formData.value.imperialMetric === 'Metric') {
      if (!formData.value.heightCm || !formData.value.weightKg) return false
    }

    if (formData.value.bpChecked === 'Yes') {
      if (!formData.value.bpSystolic || !formData.value.bpDiastolic) return false
    }

    return true
  }

  // 3️⃣ Medical History
  if (stepIndex === 3) {
    const selected = formData.value.selectApplicable
    const notes = formData.value.extraInfo?.trim()
    if ((!selected || selected.length === 0) && !notes) return false
    return true
  }

  // 4️⃣ Preferred Contact Time
  if (stepIndex === 4) {
    if (!formData.value.contactDay || !formData.value.contactTime) {
      validationError.value = 'Please choose a contact day and time for a follow-up call.'
      return false
    }
    return true
  }

  // 5️⃣ Screening (personal details)
  if (stepIndex === 5) {
    return !!formData.value.firstName &&
           !!formData.value.lastName &&
           !!formData.value.dob &&
           formData.value.age >= 16
  }

  // 6️⃣ Contact Info (address/email/phone)
  if (stepIndex === 6) {
    return !!formData.value.email &&
           !!formData.value.phone &&
           !!formData.value.address1 &&
           !!formData.value.city &&
           !!formData.value.postcode
  }

  // 7️⃣ Final Consent
  if (stepIndex === 7) {
    return formData.value.shareConsent && formData.value.updateConsent
  }

  return true
}

function nextStep() {
  if (!validateStep()) {
    if (validationError.value) {
      alert(validationError.value)
      validationError.value = ''
    } else {
      alert('Please complete all required fields before proceeding.')
    }
    return
  }
  if (currentStep.value < steps.length - 1) currentStep.value++
}

function prevStep() {
  if (currentStep.value > 0) currentStep.value--
}

function submitForm() {
  console.log('Submitted:', formData.value)
}
</script>
