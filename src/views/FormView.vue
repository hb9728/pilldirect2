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

/**
 * =============================================================
 *  HANDLE SUBMISSION
 * =============================================================
 */
const handleSubmit = async (data) => {
  if (!validateStep()) {
    alert('Please complete all required fields before submitting.')
    return
  }

  // Helper to clean numeric inputs
  const clean = (val) => {
    if (val === '' || val === null || isNaN(val)) return null
    return val
  }

  const submission = {
    firstName: data.firstName,
    lastName: data.lastName,
    dob: data.dob,
    sex: data.sex,

    //  Delivery address
    address1: data.address1,
    address2: data.address2,
    city: data.city,
    postcode: data.postcode,

    //  GP-registered address – NEW
    gp_address1: data.gpAddress1,
    gp_address2: data.gpAddress2,
    gp_city: data.gpCity,
    gp_postcode: data.gpPostcode,

    email: data.email,
    phone: data.phone,

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

  // Convert empty strings to null so Supabase stores proper NULLs
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

/**
 * =============================================================
 *  REACTIVE STATE
 * =============================================================
 */
const submitted = ref(false)
const validationError = ref('')

const formData = ref({
  /** Personal */
  firstName: '',
  lastName: '',
  sex: '',
  dob: '',

  /** Delivery address (pill will be shipped here) */
  address1: '',
  address2: '',
  city: '',
  postcode: '',

  /** GP-registered address – NEW */
  gp_address1: '',
  gp_address2: '',
  gp_city: '',
  gp_postcode: '',

  /** Contact */
  email: '',
  phone: '',

  /** Clinical */
  currentContraceptive: '',
  treatmentPreference: '',
  pillChoice: '',
  otherPill: '',
  pillGap: '',
  extraMeds: '',

  /** Vitals */
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

  /** History */
  selectApplicable: [],
  extraInfo: '',

  /** Consents */
  promoConsent: false,
  shareConsent: false,
  updateConsent: false,

  /** Misc */
  responseId: '',
  contactDay: '',
  contactTime: '',
})
provide('formData', formData.value)

/**
 * =============================================================
 *  STEP CONFIGURATION – personal-info screens are near the end
 * =============================================================
 */
const steps = [
  StepIntro,          // 0
  StepPillHistory,    // 1
  StepVitals,         // 2
  StepMedicalHistory, // 3
  StepContactTime,    // 4
  StepScreening,      // 5 (name / DOB)
  StepContact,        // 6 (addresses / email / phone)
  StepFinalConsent,   // 7
  StepThankYou        // 8
]
const currentStep = ref(0)

/**
 * =============================================================
 *  VALIDATION PER STEP
 * =============================================================
 */
const validateStep = () => {
  const i = currentStep.value

  // Intro always valid
  if (i === 0) return true

  // Pill History (1)
  if (i === 1) {
    if (!formData.value.currentContraceptive) return false
    if (!formData.value.treatmentPreference) return false
    if (formData.value.treatmentPreference === 'Yes' && !formData.value.pillChoice) return false
    if (formData.value.pillChoice === 'Other' && !formData.value.otherPill) return false
    if (!formData.value.pillGap) return false
    if (!formData.value.extraMeds) return false
    return true
  }

  // Vitals (2)
  if (i === 2) {
    if (!formData.value.imperialMetric) return false
    if (formData.value.imperialMetric === 'Imperial') {
      const empty = (v) => v === '' || v === null || v === undefined
      const ft = Number(formData.value.heightFt)
      const inc = Number(formData.value.heightIn)
      const st = Number(formData.value.weightSt)
      const lbs = Number(formData.value.weightLbs)
      if (empty(ft) || empty(inc) || empty(st) || empty(lbs)) return false
      if (ft === 0 && inc === 0) {
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

  // Medical History (3)
  if (i === 3) {
    const sel = formData.value.selectApplicable
    const notes = formData.value.extraInfo?.trim()
    if ((!sel || sel.length === 0) && !notes) return false
    return true
  }

  // Contact Time (4)
  if (i === 4) {
    if (!formData.value.contactDay || !formData.value.contactTime) {
      validationError.value = 'Please choose a contact day and time for a follow-up call.'
      return false
    }
    return true
  }

  // Screening – personal details (5)
  if (i === 5) {
    return !!formData.value.firstName && !!formData.value.lastName && !!formData.value.dob && formData.value.age >= 16
  }

  // Contact – addresses & comms (6)  NEW validation includes GP address
  if (i === 6) {
    const deliveryOk = !!formData.value.address1 && !!formData.value.city && !!formData.value.postcode
    const gpOk = !!formData.value.gpAddress1 && !!formData.value.gpCity && !!formData.value.gpPostcode
    const commsOk = !!formData.value.email && !!formData.value.phone
    return deliveryOk && gpOk && commsOk
  }

  // Consent (7)
  if (i === 7) {
    return formData.value.shareConsent && formData.value.updateConsent
  }

  return true
}

/** Navigation helpers */
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
