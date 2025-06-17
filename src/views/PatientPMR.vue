<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <h2 class="text-2xl font-semibold mb-6">Patient Record</h2>

    <!-- Patient Info -->
    <div v-if="submissions.length" class="bg-white p-4 rounded shadow mb-6">
      <h3 class="text-lg font-semibold mb-2">Patient Details</h3>
      <div class="text-sm text-gray-700 grid gap-1">
        <div><strong>Name:</strong> {{ submissions[0].firstName }} {{ submissions[0].lastName }}</div>
        <div><strong>Email:</strong> {{ submissions[0].email }}</div>
        <div><strong>DOB:</strong> {{ submissions[0].dob }}</div>
      </div>
    </div>

    <!-- Submission History Table -->
    <div v-if="paginatedSubmissions.length" class="mb-6">
      <h3 class="text-lg font-semibold mb-2">Submission History</h3>
      <table class="w-full bg-white shadow rounded text-sm">
        <thead>
          <tr class="bg-gray-100">
            <th class="text-left p-2 border-b">Submitted</th>
            <th class="text-left p-2 border-b">Status</th>
            <th class="text-left p-2 border-b">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="entry in paginatedSubmissions"
            :key="entry.responseId"
            class="hover:bg-gray-50 cursor-pointer"
            :class="{ 'bg-blue-50': selectedSubmission?.responseId === entry.responseId }"
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
              <button
                @click="selectedSubmission = entry"
                class="text-blue-600 hover:underline"
              >
                Open
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-between items-center mt-4 text-sm">
        <div class="space-x-2">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1 border rounded disabled:opacity-50"
          >Prev</button>

          <button
            v-for="page in totalPages"
            :key="page"
            @click="changePage(page)"
            class="px-3 py-1 border rounded"
            :class="{ 'bg-blue-100': currentPage === page }"
          >{{ page }}</button>

          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 border rounded disabled:opacity-50"
          >Next</button>
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

    <!-- Submission Detail Viewer -->
    <div v-if="selectedSubmission" class="bg-white p-4 rounded shadow text-sm">
      <h3 class="text-lg font-semibold mb-2">Submission Details</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-800">
        <div><strong>Response ID:</strong> {{ selectedSubmission.responseId }}</div>
        <div><strong>Submitted:</strong> {{ formatDateTime(selectedSubmission.created_at) }}</div>
        <div><strong>Status:</strong>
          <select
            v-model="selectedSubmission.status"
            @change="updateStatus(selectedSubmission)"
            class="ml-2 border rounded p-1"
          >
            <option>Pending</option>
            <option>Complete</option>
            <option>Rejected</option>
          </select>
        </div>

        <!-- You can add as many fields as needed here -->
        <div><strong>Current Pill:</strong> {{ selectedSubmission.currentContraceptive }}</div>
        <div><strong>Treatment Preference:</strong> {{ selectedSubmission.treatmentPreference }}</div>
        <div><strong>Pill Choice:</strong> {{ selectedSubmission.pillChoice }}</div>
        <div><strong>Extra Meds:</strong> {{ selectedSubmission.extraMeds }}</div>
        <div><strong>Height:</strong> {{ selectedSubmission.heightCm || selectedSubmission.heightFt + 'ft ' + selectedSubmission.heightIn + 'in' }}</div>
        <div><strong>Weight:</strong> {{ selectedSubmission.weightKg || selectedSubmission.weightSt + 'st ' + selectedSubmission.weightLbs + 'lbs' }}</div>
        <div><strong>BP:</strong> {{ selectedSubmission.bpSystolic }}/{{ selectedSubmission.bpDiastolic }}</div>
      </div>
    </div>

    <div v-else-if="submissions.length === 0" class="text-gray-600">Loading submissions...</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../supabase'
import sha256 from 'crypto-js/sha256'

const route = useRoute()
const submissions = ref([])
const selectedSubmission = ref(null)
const currentPage = ref(1)
const itemsPerPage = ref(10)

const fetchSubmissions = async () => {
  const { data: all } = await supabase.from('submissions').select('*')
  const match = all.find(
    (entry) =>
      sha256(entry.email.trim().toLowerCase()).toString() === route.params.patientId
  )
  if (!match) return

  const { data } = await supabase
    .from('submissions')
    .select('*')
    .eq('email', match.email)
    .order('created_at', { ascending: false })

  submissions.value = data
  selectedSubmission.value = data[0]
}

onMounted(fetchSubmissions)

const formatDateTime = (iso) => new Date(iso).toLocaleString('en-GB')

const totalPages = computed(() =>
  Math.ceil(submissions.value.length / itemsPerPage.value)
)

const paginatedSubmissions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return submissions.value.slice(start, start + itemsPerPage.value)
})

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const updateStatus = async (entry) => {
  const { error } = await supabase
    .from('submissions')
    .update({ status: entry.status })
    .eq('responseId', entry.responseId)

  if (error) {
    console.error('Error updating status:', error.message)
  }
}
</script>
