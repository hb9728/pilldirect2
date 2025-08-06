<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Your Contact & Address Info</h2>

    <!-- Email & Phone -->
    <div class="space-y-3 mb-6">
      <input v-model="formData.email" type="email" placeholder="Email address" class="input" />
      <input v-model="formData.phone" type="tel" placeholder="Phone number" class="input" />
    </div>

    <!-- GP-registered address -->
    <h3 class="text-lg font-medium mb-2">GP-registered address</h3>
    <div class="space-y-3 mb-6">
      <input v-model="formData.gpAddress1" placeholder="Address Line 1" class="input" />
      <input v-model="formData.gpAddress2" placeholder="Address Line 2 (optional)" class="input" />
      <input v-model="formData.gpCity" placeholder="City" class="input" />
      <input v-model="formData.gpPostcode" placeholder="Postcode" class="input" />
    </div>

    <!-- Same-as checkbox -->
    <label class="inline-flex items-center mb-4">
      <input type="checkbox" v-model="sameAsGp" class="mr-2" />
      <span class="select-none">My delivery address is the same as my GP-registered address</span>
    </label>

    <!-- Delivery address -->
    <h3 class="text-lg font-medium mb-2">Delivery address</h3>
    <div class="space-y-3 mb-6">
      <input v-model="formData.address1" :disabled="sameAsGp" placeholder="Address Line 1" class="input" />
      <input v-model="formData.address2" :disabled="sameAsGp" placeholder="Address Line 2 (optional)" class="input" />
      <input v-model="formData.city"      :disabled="sameAsGp" placeholder="City"            class="input" />
      <input v-model="formData.postcode"  :disabled="sameAsGp" placeholder="Postcode"        class="input" />
    </div>

    <div class="mt-6 flex justify-between">
      <button @click="$emit('back')" class="btn-secondary">Back</button>
      <button @click="$emit('next')" class="btn">Next</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

// Bring in the injected formData object
const props = defineProps(['formData'])

// Checkbox state
const sameAsGp = ref(false)

// When user ticks the box, mirror GP address into delivery address
watch(sameAsGp, (checked) => {
  if (checked) {
    props.formData.address1   = props.formData.gpAddress1
    props.formData.address2   = props.formData.gpAddress2
    props.formData.city       = props.formData.gpCity
    props.formData.postcode   = props.formData.gpPostcode
  }
})
</script>
