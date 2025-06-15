<template>
  <div class="text-center py-10">
    <h2 class="text-2xl font-bold mb-4">Thank you for choosing PillDirect.co.uk!</h2>
    <p class="text-lg mb-2">Your response has been submitted successfully.</p>
    <p class="mb-6">Your response ID is <strong>{{ responseId }}</strong>.</p>
    <p class="text-sm text-gray-600">Please keep a record of this in case we need to follow up with you.</p>
  </div>
</template>

<script setup>
import { inject } from 'vue'

// Grab the responseId from global formData
const formData = inject('formData')
const responseId = formData?.responseId || ''
</script>
