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
import { provide, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
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

const route = useRoute()

/* -----------------------------------------------------------
   REVIEW MODE + DRAFT HANDOFF (from user.* → form.*)
----------------------------------------------------------- */
const reviewMode = ref(false)
const currentDraftId = ref(null)

function parseHashTokens() {
  const h = window.location.hash || ''
  const params = new URLSearchParams(h.startsWith('#') ? h.slice(1) : h)
  return {
    access_token: params.get('access_token'),
    refresh_token: params.get('refresh_token'),
  }
}

async function maybeEstablishSessionFromHash() {
  const { access_token, refresh_token } = parseHashTokens()
  if (access_token && refresh_token) {
    await supabase.auth.setSession({ access_token, refresh_token })
    // Clean the hash so tokens aren’t visible after first load
    history.replaceState(null, '', window.location.pathname + window.location.search)
  }
}

async function maybeLoadDraft() {
  const draft = route.query.draft
  if (!draft) return
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('responseId', draft)
    .maybeSingle()
  if (!error && data) {
    reviewMode.value = true
    currentDraftId.value = draft
    prefillFromDraft(data)
  }
}

/* -----------------------------------------------------------
   SUBMIT HANDLER
----------------------------------------------------------- */
const handleSubmit = async (data) => {
  if (!validateStep()) {
    alert('Please complete all required fields before submitting.')
    return
  }

  const clean = (val) => (val === '' || val === null || isNaN(val) ? null : val)

  const submission = {
    firstName: data.firstName,
    lastName: data.lastName,
    dob: data.dob,
    sex: data.sex,

    // Delivery address
    address1: data.address1,
    address2: data.address2,
    city: data.city,
    postcode: data.postcode,

    // GP-registered address (snake_case)
    gp_address1: data.gp_address1,
    gp_address2: data.gp_address2,
    gp_city: data.gp_city,
    gp_postcode: data.gp_postcode,

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

  const filtered = Object.fromEntries(
    Object.entries(submission).map(([k, v]) => [k, v === '' ? null : v])
  )

  // If we’re in Review Mode with a draft id, UPDATE that row instead of inserting
  if (reviewMode.value && currentDraftId.value) {
    const payload = { ...filtered, status: 'Pending' }
    const { error } = await supabase
      .from('submissions')
      .update(payload)
      .eq('responseId', currentDraftId.value)

    if (error) {
      console.error('❌ Supabase Update Error:', JSON.stringify(error, null, 2))
      alert('There was a problem submitting your draft. Please try again.')
      return
    }
    submitted.value = true
    currentStep.value = steps.length - 1 // Thank You
    return
  }

  // Else: original insert flow
  const { error } = await supabase.from('submissions').insert([filtered])
  if (error) {
    console.error('❌ Supabase Insert Error:', JSON.stringify(error, null, 2))
    alert('There was a problem saving your data. Please try again.')
    return
  }
  submitted.value = true
  currentStep.value = steps.length - 1 // Thank You
}

/* -----------------------------------------------------------
   REACTIVE STATE
----------------------------------------------------------- */
const submitted = ref(false)
const validationError = ref('')

const formData = ref({
  /** Personal */
  firstName: '',
  lastName: '',
  sex: '',
  dob: '',

  /** Delivery address */
  address1: '',
  address2: '',
  city: '',
  postcode: '',

  /** GP-registered address (snake_case) */
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

/* -----------------------------------------------------------
   STEP CONFIGURATION
----------------------------------------------------------- */
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

/* -----------------------------------------------------------
   VALIDATION
----------------------------------------------------------- */
const validateStep = () => {
  const i = currentStep.value
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
    return !!formData.value.firstName && !!formData.value.lastName && !!formData.value.dob
  }

  // Contact – addresses & comms (6)
  if (i === 6) {
    const deliveryOk =
      !!formData.value.address1 && !!formData.value.city && !!formData.value.postcode
    const gpOk =
      !!formData.value.gp_address1 && !!formData.value.gp_city && !!formData.value.gp_postcode
    const commsOk = !!formData.value.email && !!formData.value.phone
    return deliveryOk && gpOk && commsOk
  }

  // Consent (7)
  if (i === 7) {
    return formData.value.shareConsent && formData.value.updateConsent
  }

  return true
}

/* -----------------------------------------------------------
   NAVIGATION
----------------------------------------------------------- */
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

/* -----------------------------------------------------------
   PREFILL FROM DRAFT
----------------------------------------------------------- */
function prefillFromDraft(row) {
  // Personal
  formData.value.firstName = row.firstName || ''
  formData.value.lastName  = row.lastName || ''
  formData.value.sex       = row.sex || ''
  formData.value.dob       = row.dob || ''

  // Delivery
  formData.value.address1  = row.address1 || ''
  formData.value.address2  = row.address2 || ''
  formData.value.city      = row.city || ''
  formData.value.postcode  = row.postcode || ''

  // GP (snake_case)
  formData.value.gp_address1 = row.gp_address1 || ''
  formData.value.gp_address2 = row.gp_address2 || ''
  formData.value.gp_city     = row.gp_city || ''
  formData.value.gp_postcode = row.gp_postcode || ''

  // Contact
  formData.value.email     = row.email || ''
  formData.value.phone     = row.phone || ''

  // Clinical
  formData.value.currentContraceptive   = row.currentContraceptive || ''
  formData.value.treatmentPreference    = row.treatmentPreference || ''
  formData.value.pillChoice             = row.pillChoice || ''
  formData.value.otherPill              = row.otherPill || ''
  formData.value.pillGap                = row.pillGap || ''
  formData.value.extraMeds              = row.extraMeds || ''

  // Vitals
  formData.value.imperialMetric = row.imperialMetric || ''
  formData.value.heightFt       = row.heightFt ?? ''
  formData.value.heightIn       = row.heightIn ?? ''
  formData.value.weightSt       = row.weightSt ?? ''
  formData.value.weightLbs      = row.weightLbs ?? ''
  formData.value.heightCm       = row.heightCm ?? ''
  formData.value.weightKg       = row.weightKg ?? ''
  formData.value.bpChecked      = row.bpChecked || ''
  formData.value.bpSystolic     = row.bpSystolic ?? ''
  formData.value.bpDiastolic    = row.bpDiastolic ?? ''

  // History
  formData.value.selectApplicable = Array.isArray(row.selectApplicable) ? row.selectApplicable : []
  formData.value.extraInfo        = row.extraInfo || ''

  // Consents
  formData.value.promoConsent  = !!row.promoConsent
  formData.value.shareConsent  = !!row.shareConsent
  formData.value.updateConsent = !!row.updateConsent

  // Misc
  formData.value.responseId = row.responseId || ''
  formData.value.contactDay = row.contactDay || ''
  formData.value.contactTime = row.contactTime || ''
}

/* -----------------------------------------------------------
   ON MOUNT: establish session (from hash) then load draft
----------------------------------------------------------- */
onMounted(async () => {
  await maybeEstablishSessionFromHash()
  await maybeLoadDraft()
})
</script>
