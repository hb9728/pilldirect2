<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-semibold">My Submissions</h2>
      <router-link to="/account" class="text-blue-600 hover:underline">← Back to Account</router-link>
    </div>

    <button @click="$router.push('/request-next')" class="mb-4 bg-blue-600 text-white px-4 py-2 rounded">
      Request Next Pill
    </button>

    <div v-if="subs.length" class="bg-white rounded shadow divide-y">
      <div v-for="s in subs" :key="s.responseId" class="p-4 flex items-center justify-between">
        <div>
          <div class="font-medium">Submission {{ s.responseId }}</div>
          <div class="text-sm text-gray-600">
            {{ new Date(s.created_at).toLocaleString() }} · Status: <span class="font-medium">{{ s.status }}</span>
          </div>
        </div>
      </div>
    </div>
    <p v-else class="text-gray-500">No submissions yet.</p>
    <p v-if="err" class="text-red-600 mt-3">{{ err }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
const subs = ref([]), err = ref('')

onMounted(async () => {
  try {
    const { data, error } = await supabase.rpc('get_my_submissions')
    if (error) throw error
    subs.value = data ?? []
  } catch (e) { err.value = e.message }
})
</script>
