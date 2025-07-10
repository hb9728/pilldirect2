<!-- src/views/ResetPassword.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'

const newPassword = ref('')
const success = ref(false)
const error = ref('')
const loading = ref(false)

// Parse token from the URL fragment manually
onMounted(async () => {
  const hash = window.location.hash
  const params = new URLSearchParams(hash.slice(1))
  const access_token = params.get('access_token')
  const refresh_token = params.get('refresh_token')
  const type = params.get('type')

  if (access_token && refresh_token && type === 'recovery') {
    const { error: authError } = await supabase.auth.setSession({
      access_token,
      refresh_token
    })

    if (authError) {
      error.value = 'Could not set session: ' + authError.message
    }
  } else {
    error.value = 'Invalid or missing reset token.'
  }
})

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
