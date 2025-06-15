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
        :disabled="props.submitted || !formData.shareConsent || !formData.updateConsent"
        @click="submitForm"
        class="px-6 py-2 rounded text-white font-semibold transition duration-200"
        :class="[
          (props.submitted || !formData.shareConsent || !formData.updateConsent)
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        ]"
      >
        Submit
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps(['formData', 'submitted'])
const emit = defineEmits(['submit'])

const submitted = ref(false)
const responseId = ref('')

const generateSubmissionId = () => {
  const now = new Date()
  return 'PD-' + now.getTime().toString(36).toUpperCase()
}

const submitForm = () => {
  if (props.submitted) return

  if (!props.formData.responseId) {
    const id = generateSubmissionId()
    props.formData.responseId = id
    responseId.value = id
  } else {
    responseId.value = props.formData.responseId
  }

  submitted.value = true
  emit('submit', props.formData)
  emit('next') // THIS IS THE IMPORTANT LINE TO TRIGGER THE NEXT PAGE
}
</script>
