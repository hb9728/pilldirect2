<template>
  <div class="max-w-2xl mx-auto p-6">
    <h2 class="text-2xl font-semibold mb-2">Request Next Pill</h2>
    <p class="text-gray-600 mb-4">We’ll prefill your consultation. Please review and submit.</p>

    <div class="bg-white rounded shadow p-4">
      <button @click="createDraft" :disabled="loading" class="bg-blue-600 text-white px-4 py-2 rounded">
        {{ loading ? 'Preparing…' : 'Create Draft' }}
      </button>
      <p v-if="msg" class="text-green-700 mt-3">{{ msg }}</p>
      <p v-if="err" class="text-red-600 mt-3">{{ err }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'
const router = useRouter()
const loading = ref(false), msg = ref(''), err = ref('')

async function createDraft() {
  try {
    loading.value = true; err.value = ''
    const { data, error } = await supabase.rpc('create_draft_from_profile')
    if (error) throw error
    const rid = Array.isArray(data) ? (data[0]?.responseid || data[0]?.responseId) : (data?.responseid || data?.responseId)
    msg.value = `Draft created: ${rid}`
    router.push({ path: '/', query: { draft: rid } }) // opens your existing form
  } catch (e) { err.value = e.message } finally { loading.value = false }
}
</script>
