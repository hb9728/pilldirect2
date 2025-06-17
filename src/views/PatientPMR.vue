<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-6">Patient Record</h2>

    <!-- Patient Info -->
    <div v-if="submissions.length">
      <div class="mb-6 bg-white p-4 rounded shadow">
        <h3 class="text-lg font-semibold mb-2">Patient Details</h3>
        <p><strong>Name:</strong> {{ submissions[0].firstName }} {{ submissions[0].lastName }}</p>
        <p><strong>Email:</strong> {{ submissions[0].email }}</p>
        <p><strong>DOB:</strong> {{ submissions[0].dob }}</p>
      </div>

      <!-- Submission History -->
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
              :class="{ 'bg-blue-50': selectedSubmission?.responseId === entry.responseId }"
              class="hover:bg-gray-50 cursor-pointer"
            >
              <td class="p-2">{{ formatDateTime(entry.created_at) }}</td>
              <td class="p-2">
                <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                  :class="{
                    'bg-yellow-100 text-yellow-800': entry.status === 'Pending',
                    'bg-green-100 text-green-800': entry.status === 'Complete',
                    'bg-red-100 text-red-800': entry.status === 'Rejected'
                  }">
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
                <button @click="selectSubmission(entry)" class="text-blue-600 hover:underline">Open</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="flex justify-between items-center mt-4 text-sm">
          <div class="space-x-2">
            <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1"
              class="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
            <button
              v-for="page in totalPages"
              :key="page"
              @click="changePage(page)"
              class="px-3 py-1 border rounded"
              :class="{ 'bg-blue-100': currentPage === page }"
            >{{ page }}</button>
            <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages"
              class="px-3 py-1 border rounded disabled:opacity-50">Next</button>
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
      <div v-if="selectedSubmission" class="bg-white p-4 rounded shadow text-sm text-gray-800">
        <h3 class="text-lg font-semibold mb-4">Full Submission Details</h3>

        <!-- Sections -->
        <div class="space-y-6">

          <!-- Contact Info -->
          <div>
            <h4 class="font-semibold text-gray-700 mb-2">Contact Information</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <p><strong>Name:</strong> {{ selectedSubmission.firstName }} {{ selectedSubmission.lastName }}</p>
              <p><strong>Email:</strong> {{ selectedSubmission.email }}</p>
              <p><strong>Phone:</strong> {{ selectedSubmission.phone }}</p>
              <p><strong>DOB:</strong> {{ selectedSubmission.dob }}</p>
              <p><strong>Sex:</strong> {{ selectedSubmission.sex }}</p>
              <p><strong>Address:</strong> {{ selectedSubmission.address1 }} {{ selectedSubmission.address2 }}, {{ selectedSubmission.city }}, {{ selectedSubmission.postcode }}</p>
            </div>
          </div>

          <!-- Contraception -->
          <div>
            <h4 class="font-semibold text-gray-700 mb-2">Contraception</h4>
            <p><strong>Current:</strong> {{ selectedSubmission.currentContraceptive || '—' }}</p>
            <p><strong>Preference:</strong> {{ selectedSubmission.treatmentPreference || '—' }}</p>
            <p><strong>Pill Choice:</strong> {{ selectedSubmission.pillChoice || '—' }}</p>
            <p><strong>Other Pill:</strong> {{ selectedSubmission.otherPill || '—' }}</p>
            <p><strong>Pill Gap:</strong> {{ selectedSubmission.pillGap || '—' }}</p>
            <p><strong>Other Meds:</strong> {{ selectedSubmission.extraMeds || '—' }}</p>
          </div>

          <!-- Vitals -->
          <div>
            <h4 class="font-semibold text-gray-700 mb-2">Vitals</h4>
            <p><strong>Measurement System:</strong> {{ selectedSubmission.imperialMetric || '—' }}</p>
            <p><strong>Height (ft/in):</strong> {{ selectedSubmission.heightFt || '—' }}' {{ selectedSubmission.heightIn || '—' }}"</p>
            <p><strong>Height (cm):</strong> {{ selectedSubmission.heightCm || '—' }}</p>
            <p><strong>Weight (st/lbs):</strong> {{ selectedSubmission.weightSt || '—' }} st {{ selectedSubmission.weightLbs || '—' }} lbs</p>
            <p><strong>Weight (kg):</strong> {{ selectedSubmission.weightKg || '—' }}</p>
            <p><strong>Blood Pressure:</strong> {{ selectedSubmission.bpChecked || '—' }}</p>
            <p><strong>BP Reading:</strong> {{ selectedSubmission.bpSystolic || '—' }}/{{ selectedSubmission.bpDiastolic || '—' }}</p>
          </div>

          <!-- Medical History -->
          <div>
            <h4 class="font-semibold text-gray-700 mb-2">Medical History</h4>
            <div v-if="parsedMedicalHistory.length">
              <ul class="list-disc list-inside">
                <li v-for="item in parsedMedicalHistory" :key="item">{{ item }}</li>
              </ul>
            </div>
            <p v-else>—</p>
            <p><strong>Extra Info:</strong> {{ selectedSubmission.extraInfo || '—' }}</p>
          </div>

          <!-- Consents -->
          <div>
            <h4 class="font-semibold text-gray-700 mb-2">Consents</h4>
            <p><strong>Promo Consent:</strong> {{ selectedSubmission.promoConsent ? 'Yes' : 'No' }}</p>
            <p><strong>Share with GP:</strong> {{ selectedSubmission.shareConsent ? 'Yes' : 'No' }}</p>
            <p><strong>Receive Updates:</strong> {{ selectedSubmission.updateConsent ? 'Yes' : 'No' }}</p>
          </div>

          <!-- Meta -->
          <div>
            <h4 class="font-semibold text-gray-700 mb-2">Meta</h4>
            <p><strong>Submitted:</strong> {{ formatDateTime(selectedSubmission.created_at) }}</p>
            <p><strong>Response ID:</strong> {{ selectedSubmission.responseId }}</p>
            <div class="mt-2">
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
    const { data } = await supabase
      .from('submissions')
      .select('*')
      .eq('email', target.email)
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
  if (error) console.error('Status update failed:', error.message)
}

const parsedMedicalHistory = computed(() => {
  const raw = selectedSubmission.value?.selectApplicable
  if (!raw) return []
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return raw.split(',').map(s => s.trim()).filter(Boolean)
  }
})

watch(itemsPerPage, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = Math.max(1, totalPages.value)
  }
})

onMounted(fetchByHashedEmail)
</script>
