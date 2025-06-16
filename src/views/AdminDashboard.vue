<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Patient Submissions</h1>

    <input
      v-model="searchTerm"
      type="text"
      placeholder="Search by name, DOB or ID"
      class="input mb-4 w-full"
    />

    <table class="w-full border">
      <thead>
        <tr class="bg-gray-100 text-left">
          <th class="p-2 border">Name</th>
          <th class="p-2 border">DOB</th>
          <th class="p-2 border">Response ID</th>
          <th class="p-2 border">Submitted</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in filteredSubmissions" :key="row.responseId">
          <td class="p-2 border">{{ row.firstName }} {{ row.lastName }}</td>
          <td class="p-2 border">{{ row.dob }}</td>
          <td class="p-2 border font-mono">{{ row.responseId }}</td>
          <td class="p-2 border">{{ new Date(row.created_at).toLocaleString() }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'

const searchTerm = ref('')
const submissions = ref([])

onMounted(async () => {
  const { data, error } = await supabase.from('submissions').select('*').order('created_at', { ascending: false })
  if (!error) submissions.value = data
})

const filteredSubmissions = computed(() => {
  return submissions.value.filter(row => {
    const search = searchTerm.value.toLowerCase()
    return (
      row.firstName?.toLowerCase().includes(search) ||
      row.lastName?.toLowerCase().includes(search) ||
      row.responseId?.toLowerCase().includes(search) ||
      row.dob?.includes(search)
    )
  })
})
</script>
