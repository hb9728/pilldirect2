<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
    <div class="w-full max-w-md bg-white p-6 rounded shadow">
      <h2 class="text-xl font-semibold mb-4">Sign in to PillDirect</h2>
      <p class="text-sm text-gray-600 mb-3">We’ll email you a secure magic link.</p>
      <input v-model="email" type="email" placeholder="you@example.com" class="w-full border rounded px-3 py-2 mb-3" />
      <button @click="send" :disabled="loading" class="w-full bg-blue-600 text-white py-2 rounded">
        {{ loading ? 'Sending…' : 'Send Magic Link' }}
      </button>
      <p v-if="msg" class="text-sm text-green-700 mt-3">{{ msg }}</p>
      <p v-if="err" class="text-sm text-red-600 mt-3">{{ err }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'
const router = useRouter()

const email = ref(''), loading = ref(false), msg = ref(''), err = ref('')

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    await supabase.from('profiles').upsert(
      { user_id: session.user.id, email: session.user.email },
      { onConflict: 'user_id' }
    )
    router.replace('/account')
  }
})

async function send() {
  try {
    loading.value = true; err.value = ''
    const { error } = await supabase.auth.signInWithOtp({
      email: email.value,
      options: { emailRedirectTo: `${window.location.origin}/account` }
    })
    if (error) throw error
    msg.value = 'Check your email for the sign-in link.'
  } catch (e) { err.value = e.message } finally { loading.value = false }
}
</script>
