<template>
  <div class="p-6 min-h-screen bg-gray-50">
    <h2 class="text-2xl font-bold mb-4">Patient Record</h2>

    <!-- Patient Header -->
    <div v-if="submissions.length" class="bg-white p-4 rounded shadow mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800">
        <div><strong>Name:</strong> {{ submissions[0].firstName }} {{ submissions[0].lastName }}</div>
        <div><strong>Email:</strong> {{ submissions[0].email }}</div>
        <div><strong>DOB:</strong> {{ submissions[0].dob }}</div>
      </div>
    </div>

    <!-- Submission History -->
    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">Submission History</h3>
      <table class="w-full bg-white shadow rounded text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-2 border-b text-left">Submitted</th>
            <th class="p-2 border-b text-left">Status</th>
            <th class="p-2 border-b text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="s in paginatedSubmissions"
            :key="s.responseId"
            @click="selectSubmission(s)"
            class="hover:bg-gray-50 cursor-pointer"
            :class="{ 'bg-blue-50': selectedSubmission?.responseId === s.responseId }"
          >
            <td class="p-2">{{ formatDateTime(s.created_at) }}</td>
            <td class="p-2">
              <span
                class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                :class="{
                  'bg-yellow-100 text-yellow-800': s.status === 'Pending',
                  'bg-green-100 text-green-800': s.status === 'Complete',
                  'bg-red-100 text-red-800': s.status === 'Rejected'
                }"
              >
                <span
                  class="h-2 w-2 rounded-full"
                  :class="{
                    'bg-yellow-500': s.status === 'Pending',
                    'bg-green-500': s.status === 'Complete',
                    'bg-red-500': s.status === 'Rejected'
                  }"
                ></span>
                {{ s.status }}
              </span>
            </td>
            <td class="p-2">
              <button @click.stop="selectSubmission(s)" class="text-blue-600 hover:underline">Open</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination Controls -->
      <div class="flex justify-between items-center mt-4 text-sm">
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

    <!-- Detailed Submission View -->
    <div v-if="selectedSubmission" class="bg-white p-4 rounded shadow mt-8">
      <h3 class="text-lg font-semibold mb-2">Submission Details</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800">
        <div><strong>Name:</strong> {{ selectedSubmission.firstName }} {{ selectedSubmission.lastName }}</div>
        <div><strong>DOB:</strong> {{ selectedSubmission.dob }}</div>
        <div><strong>Email:</strong> {{ selectedSubmission.email }}</div>
        <div><strong>Phone:</strong> {{ selectedSubmission.phone }}</div>
        <div><strong>Address:</strong> {{ selectedSubmission.address1 }} {{ selectedSubmission.address2 }}, {{ selectedSubmission.city }}, {{ selectedSubmission.postcode }}</div>
        <div><strong>Sex:</strong> {{ selectedSubmission.sex }}</div>
        <div><strong>Submitted:</strong> {{ formatDateTime(selectedSubmission.created_at) }}</div>
        <div><strong>Response ID:</strong> {{ selectedSubmission.responseId }}</div>

        <!-- Status -->
        <div class="col-span-1 sm:col-span-2">
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

        <!-- Add more fields from your form below -->
        <div class="col-span-1 sm:col-span-2" v-for="(value, key) in selectedSubmission" v-if="!skipFields.includes(key) && typeof value === 'string'" :key="key">
          <strong>{{ formatKey(key) }}:</strong> {{ value }}
        </div>
      </div>
    </div>
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

const skipFields = ['created_at', 'id', 'email', 'firstName', 'lastName', 'dob', 'responseId', 'status', 'sex', 'phone', 'address1', 'address2', 'city', 'postcode']

const formatDateTime = (iso) => new Date(iso).toLocaleString('en-GB')

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

const selectSubmission = (s) => {
  selectedSubmission.value = s
}

const formatKey = (key) => {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
}

const totalPages = computed(() => Math.ceil(submissions.value.length / itemsPerPage.value) || 1)

const paginatedSubmissions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return submissions.value.slice(start, start + itemsPerPage.value)
})

const changePage = (newPage) => {
  const maxPage = totalPages.value
  if (newPage < 1 || newPage > maxPage) return
  currentPage.value = newPage
}

watch([submissions, itemsPerPage], () => {
  const maxPage = totalPages.value
  if (currentPage.value > maxPage) {
    currentPage.value = maxPage
  }
})

const updateStatus = async (entry) => {
  const { error } = await supabase
    .from('submissions')
    .update({ status: entry.status })
    .eq('responseId', entry.responseId)

  if (error) {
    console.error('Error updating status:', error.message)
  } else {
    console.log('✅ Status updated')
  }
}

onMounted(fetchByHashedEmail)
</script>
