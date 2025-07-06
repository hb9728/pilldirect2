<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="w-full max-w-md bg-white p-6 rounded shadow">
      <h2 class="text-xl font-semibold mb-4">Admin Login</h2>

      <div v-if="sessionExpired" class="mb-4 p-3 rounded text-yellow-800 bg-yellow-100 border border-yellow-300 text-sm">
        Your session expired due to inactivity. Please log in again.
      </div>

<form @submit.prevent="login">
  <input v-model="email" type="email" placeholder="Email" class="input mb-3 w-full" />
  <input v-model="password" type="password" placeholder="Password" class="input mb-4 w-full" />
  
  <button type="submit" class="btn w-full">Login</button>
</form>
      <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { supabase } from '../supabase'
import { useRouter, useRoute } from 'vue-router'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()
const route = useRoute()

const sessionExpired = computed(() => route.query.expired === '1')

const login = async () => {
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  if (loginError) {
    error.value = loginError.message
  } else {
    router.push('/admin/dashboard')
  }
}
</script>
