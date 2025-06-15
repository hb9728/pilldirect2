<template>
  <div class="text-center p-6">
    <h2 class="text-2xl font-semibold mb-4">Thank you for choosing PillDirect.co.uk!</h2>
    <p class="mb-2">Your response ID is <strong>{{ formData.responseId }}</strong>.</p>
    <p class="mb-4">Please keep a record of this in case we need to follow up with you.</p>
  </div>
</template>

<script setup>
const props = defineProps(['formData'])
</script>
