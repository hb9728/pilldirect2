<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-4">Patient Record</h2>

    <div v-if="submissions.length">
      <!-- Patient Info -->
      <div class="mb-6 bg-white p-4 rounded shadow">
        <h3 class="text-lg font-semibold mb-2">Patient Details</h3>
        <p><strong>Name:</strong> {{ submissions[0].firstName }} {{ submissions[0].lastName }}</p>
        <p><strong>Email:</strong> {{ submissions[0].email }}</p>
        <p><strong>DOB:</strong> {{ submissions[0].dob }}</p>
      </div>

      <!-- Submission History Table -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-2">Submission History</h3>
        <table class="w-full bg-white shadow rounded text-sm">
          <thead>
            <tr class="bg-gray-100">
              <th class="p-2 border-b text-left">Submitted</th>
              <th class="p-2 border-b text-left">Status</th>
              <th class="p-2 border-b text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="entry in paginatedSubmissions"
              :key="entry.responseId"
              :class="{
                'bg-blue-50': selectedSubmission?.responseId === entry.responseId
              }"
              class="hover:bg-gray-50"
            >
              <td class="p-2">{{ formatDateTime(entry.created_at) }}</td>
              <td class="p-2">
                <span
                  class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                  :class="{
                    'bg-yellow-100 text-yellow-800': entry.status === 'Pending',
                    'bg-green-100 text-green-800': entry.status === 'Complete',
                    'bg-red-100 text-red-800': entry.status === 'Rejected'
                  }"
                >
                  <span
                    class="h-2 w-2 rounded-full"
                    :class="{
                      'bg-yellow-500': entry.status === 'Pending',
                      'bg-green-500': entry.status === 'Complete',
                      'bg-red-500': entry.status === 'Rejected'
                    }"
                  ></span>
                  {{ entry.status }}
                </span>
              </td>
              <td class="p-2">
                <button @click="selectSubmission(entry)" class="text-blue-600 hover:underline">
                  Open
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="flex justify-between items-center mt-4 text-sm">
          <div class="space-x-2">
            <button
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button
              v-for="page in totalPages"
              :key="page"
              @click="changePage(page)"
              class="px-3 py-1 border rounded"
              :class="{ 'bg-blue-100': currentPage === page }"
            >
              {{ page }}
            </button>
            <button
              @click="changePage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>

          <div>
            Show
            <select v-model.number="itemsPerPage" class="ml-1 border rounded p-1">
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
            </select>
            per page
          </div>
        </div>
      </div>

      <!-- Full Submission Detail Viewer -->
      <div v-if="selectedSubmission" class="bg-white p-4 rounded shadow">
        <h3 class="text-lg font-semibold mb-4">Full Submission Details</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800">
          <template v-for="(label, key) in fieldLabels" :key="key">
            <div>
              <strong>{{ label }}:</strong>
              <template v-if="key === 'medicationHistory'">
                <ul v-if="getMedicationList(selectedSubmission[key]).length">
                  <li v-for="item in getMedicationList(selectedSubmission[key])" :key="item" class="list-disc list-inside">
                    {{ item }}
                  </li>
                </ul>
                <span v-else>—</span>
              </template>
              <template v-else>
                {{ selectedSubmission[key] || '—' }}
              </template>
            </div>
          </template>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Submission Status</label>
            <select
              v-model="selectedSubmission.status"
              @change="updateStatus(selectedSubmission)"
              :class="[
                'border rounded px-3 py-2 shadow-sm transition-colors',
                selectedSubmission.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-400' :
                selectedSubmission.status === 'Complete' ? 'bg-green-100 text-green-800 border-green-400' :
                selectedSubmission.status === 'Rejected' ? 'bg-red-100 text-red-800 border-red-400' : ''
              ]"
            >
              <option>Pending</option>
              <option>Complete</option>
              <option>Rejected</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-gray-600">Loading submissions...</div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../supabase'
import sha256 from 'crypto-js/sha256'

const route = useRoute()
const submissions = ref([])
const selectedSubmission = ref(null)
const currentPage = ref(1)
const itemsPerPage = ref(10)

const changePage = (page) => {
  const max = totalPages.value
  if (page < 1 || page > max) return
  currentPage.value = page
}

const totalPages = computed(() => {
  return Math.ceil(submissions.value.length / itemsPerPage.value) || 1
})

const paginatedSubmissions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return submissions.value.slice(start, end)
})

const selectSubmission = (entry) => {
  selectedSubmission.value = entry
}

const formatDateTime = (iso) => {
  if (!iso) return ''
  const date = new Date(iso)
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchByHashedEmail = async () => {
  const all = await supabase.from('submissions').select('*')
  const target = all.data.find(sub => sha256(sub.email.trim().toLowerCase()).toString() === route.params.patientId)

  if (target) {
    const email = target.email
    const { data } = await supabase
      .from('submissions')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })

    submissions.value = data
    selectedSubmission.value = data[0]
  }
}

const updateStatus = async (entry) => {
  const { error } = await supabase
    .from('submissions')
    .update({ status: entry.status })
    .eq('responseId', entry.responseId)

  if (error) {
    console.error('Status update failed:', error.message)
  }
}

const getMedicationList = (raw) => {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
  } catch (e) {
    // Not valid JSON, fallback to comma-separated string
    return raw.split(',').map(s => s.trim()).filter(Boolean)
  }
  return []
}

watch([itemsPerPage], () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = Math.max(1, totalPages.value)
  }
})

onMounted(fetchByHashedEmail)

// FIELD LABELS — match these to your actual Supabase column names
const fieldLabels = {
  firstName: 'First Name',
  lastName: 'Last Name',
  dob: 'Date of Birth',
  email: 'Email',
  phone: 'Phone Number',
  address1: 'Address Line 1',
  address2: 'Address Line 2',
  city: 'City',
  postcode: 'Postcode',
  sex: 'Sex',
  heightFt: 'Height (Feet)',
  heightIn: 'Height (Inches)',
  weight: 'Weight (kg)',
  smoker: 'Smoking Status',
  migraines: 'Migraines',
  medications: 'Current Medications',
  medicationHistory: 'Medication History',
  allergies: 'Allergies',
  created_at: 'Submitted At',
  responseId: 'Response ID',
  // Add all other custom fields from your form here...
}
</script>
