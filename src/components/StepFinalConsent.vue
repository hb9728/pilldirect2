
<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Final Consent Agreements</h2>

    <div class="space-y-3 mb-6">
      <label class="inline-flex items-start space-x-2">
        <input type="checkbox" v-model="formData.promoConsent" :disabled="submitted" class="mt-1" />
        <span>I consent to receive occasional emails about relevant health services and promotions. I understand I can unsubscribe at any time.</span>
      </label>

      <label class="inline-flex items-start space-x-2">
        <input type="checkbox" v-model="formData.shareConsent" :disabled="submitted" class="mt-1" required />
        <span>I consent to my information being securely shared with the dispensing pharmacy for the purpose of reviewing my consultation and safely supplying my medication.</span>
      </label>

      <label class="inline-flex items-start space-x-2">
        <input type="checkbox" v-model="formData.updateConsent" :disabled="submitted" class="mt-1" required />
        <span>I consent to being contacted via email or telephone with updates regarding the status of my contraceptive consultation, prescription, and delivery.</span>
      </label>
    </div>

    <div class="flex justify-between mt-6">
      <button
        @click="$emit('back')"
        :disabled="submitted"
        :class="[
          'px-6 py-2 rounded transition',
          submitted ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-300 text-black hover:bg-gray-400'
        ]"
      >
        Back
      </button>

    
      <button
        :disabled="!formData.shareConsent || !formData.updateConsent || submitting"
        @click="submitForm"
        class="px-6 py-2 rounded text-white font-semibold transition duration-200"
        :class="(formData.shareConsent && formData.updateConsent && !submitting)
                 ? 'bg-blue-600 hover:bg-blue-700'
                 : 'bg-gray-400 cursor-not-allowed opacity-60'"
      >
        Submit
      </button>

    </div>

    <div v-if="submitted" class="mt-10 p-4 border border-green-300 bg-green-50 rounded">
      <h3 class="text-lg font-semibold mb-2">Thank you for choosing PillDirect.co.uk!</h3>
      <p class="mb-1">Your response ID is <strong>{{ responseId }}</strong>.</p>
      <p>Please keep a record of this in case we need to follow up with you about your submission.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps(['formData'])
const emit = defineEmits(['submit'])

const submitted = ref(false)
const submitting = ref(false)
const responseId = ref('')

// Create a unique submission ID (e.g., timestamp-based or hash)
const generateSubmissionId = () => {
  const now = new Date()
  return 'PD-' + now.getTime().toString(36).toUpperCase()
}

const submitForm = () => {
  if (submitting.value) return // prevent double submit

  submitting.value = true

  if (!props.formData.responseId) {
    responseId.value = generateSubmissionId()
    props.formData.responseId = responseId.value
  } else {
    responseId.value = props.formData.responseId
  }

  emit('submit', props.formData)

  submitted.value = true
}


</script>
