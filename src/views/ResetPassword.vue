<!-- src/views/ResetPassword.vue -->
<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'

const newPassword = ref('')
const success = ref(false)
const error = ref('')
const loading = ref(false)

const updatePassword = async () => {
  loading.value = true
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword.value
  })

  if (updateError) {
    error.value = updateError.message
  } else {
    success.value = true
  }
  loading.value = false
}
</script>


<template>
  <div class="p-6 max-w-md mx-auto">
    <h2 class="text-2xl font-semibold mb-4">Reset Your Password</h2>

    <input
      v-model="newPassword"
      type="password"
      placeholder="Enter new password"
      class="input input-bordered w-full mb-4"
    />

    <button
      @click="updatePassword"
      class="btn btn-primary w-full"
      :disabled="loading"
    >
      {{ loading ? 'Updating...' : 'Update Password' }}
    </button>

    <p v-if="success" class="text-green-600 mt-4">✅ Password updated successfully.</p>
    <p v-if="error" class="text-red-500 mt-4">❌ {{ error }}</p>
  </div>
</template>
