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

const loading = ref(false)
const msg = ref('')
const err = ref('')

function extractId(data) {
  // handle object or array shapes
  const obj = Array.isArray(data) ? data[0] : data
  return obj?.responseId || obj?.responseid || null
}

async function createDraft() {
  try {
    loading.value = true
    err.value = ''
    msg.value = ''

    const { data, error } = await supabase.rpc('create_draft_from_profile')
    if (error) throw error

    console.log('[create_draft_from_profile] raw data:', data)
    const rid = extractId(data)

    // Hard stop if invalid
    if (!rid || typeof rid !== 'string' || rid.toLowerCase() === 'null' || rid.toLowerCase() === 'undefined') {
      throw new Error(`Invalid responseId from RPC: ${JSON.stringify(data)}`)
    }

    msg.value = `Draft ready: ${rid}`

    // carry session to form.*
    const { data: sess } = await supabase.auth.getSession()
    const at = sess?.session?.access_token || ''
    const rt = sess?.session?.refresh_token || ''

    window.location.href =
      `https://form.pilldirect.co.uk/?draft=${encodeURIComponent(rid)}#access_token=${encodeURIComponent(at)}&refresh_token=${encodeURIComponent(rt)}`
  } catch (e) {
    console.error('[RequestNext] error:', e)
    err.value = e.message || String(e)
    // NOTE: we do NOT redirect on error
  } finally {
    loading.value = false
  }
}
</script>
