<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-4">Patient Record</h2>

    <div v-if="submissions.length">
      <div class="mb-6 bg-white p-4 rounded shadow">
        <h3 class="text-lg font-semibold mb-2">Patient Details</h3>
        <p><strong>Name:</strong> {{ submissions[0].firstName }} {{ submissions[0].lastName }}</p>
        <p><strong>Email:</strong> {{ submissions[0].email }}</p>
        <p><strong>DOB:</strong> {{ submissions[0].dob }}</p>
      </div>

      <div class="mb-4">
        <h3 class="text-lg font-semibold">Submission History</h3>
        <ul class="divide-y divide-gray-200">
          <li
            v-for="s in submissions"
            :key="s.responseId"
            @click="selectedSubmission = s"
            class="cursor-pointer p-2 hover:bg-gray-50"
          >
            <span class="text-sm">{{ formatDateTime(s.created_at) }}</span> — Status: {{ s.status }}
          </li>
        </ul>
      </div>

      <div v-if="selectedSubmission" class="bg-white p-4 rounded shadow">
        <h3 class="text-lg font-semibold mb-2">Submission Details</h3>
        <p><strong>Response ID:</strong> {{ selectedSubmission.responseId }}</p>
        <p><strong>Status:</strong> {{ selectedSubmission.status }}</p>
        <!-- Add export and notes features here -->
      </div>
    </div>

    <div v-else class="text-gray-600">Loading submissions...</div>
  </div>
</template>

<script setup>
import sha256 from 'crypto-js/sha256'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../supabase'

const route = useRoute()
const submissions = ref([])
const selectedSubmission = ref(null)

const formatDateTime = (iso) => new Date(iso).toLocaleString('en-GB')

const fetchByHashedEmail = async () => {
  const { data: allSubs, error: allError } = await supabase.from('submissions').select('*')
  if (allError) {
    console.error('Error fetching submissions:', allError.message)
    return
  }

  const match = allSubs.find(sub => {
    const hashed = sha256(sub.email.trim().toLowerCase()).toString()
    return hashed === route.params.patientId
  })

  if (!match) return

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('email', match.email)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error loading patient PMR:', error.message)
  } else {
    submissions.value = data
    selectedSubmission.value = data[0]
  }
}

onMounted(fetchByHashedEmail)

import sha256 from 'crypto-js/sha256'
</script>
