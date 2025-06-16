<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold">Submissions Dashboard</h2>
      <button @click="logout" class="text-red-600 hover:underline">Logout</button>
    </div>

    <input
      v-model="searchQuery"
      type="text"
      placeholder="Search by name, DOB, or ID..."
      class="w-full mb-4 p-2 border border-gray-300 rounded"
    />

    <div v-if="filteredSubmissions.length === 0" class="text-gray-500">
      No submissions found.
    </div>

    <div class="mb-4 flex justify-between items-center">
      <span class="text-sm text-gray-700">Showing page {{ currentPage }} of {{ totalPages }}</span>
      <label class="text-sm">
        Show:
        <select v-model.number="perPage" class="ml-2 border rounded px-2 py-1">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>
      </label>
    </div>

    <table v-if="paginatedSubmissions.length > 0" class="w-full bg-white shadow rounded">
      <thead>
        <tr>
          <th class="text-left p-2 border-b">Name</th>
          <th class="text-left p-2 border-b">DOB</th>
          <th class="text-left p-2 border-b">Email</th>
          <th class="text-left p-2 border-b">Response ID</th>
          <th class="text-left p-2 border-b">Submitted</th>
          <th class="p-2 border-b">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="submission in paginatedSubmissions"
          :key="submission.responseId"
          class="hover:bg-gray-50"
        >
          <td class="p-2">{{ submission.firstName }} {{ submission.lastName }}</td>
          <td class="p-2">{{ submission.dob }}</td>
          <td class="p-2">{{ submission.email }}</td>
          <td class="p-2">{{ submission.responseId }}</td>
          <td class="p-2">{{ formatDateTime(submission.created_at) }}</td>
          <td class="p-2">
            <button @click="viewSubmission(submission)" class="text-blue-600 hover:underline">View</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="mt-4 flex justify-between items-center" v-if="totalPages > 1">
      <button
        :disabled="currentPage === 1"
        @click="currentPage--"
        class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
      >
        Prev
      </button>
      <button
        :disabled="currentPage === totalPages"
        @click="currentPage++"
        class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
      >
        Next
      </button>
    </div>

    <div v-if="selectedSubmission" class="mt-10 bg-white p-6 rounded shadow-md">
      <h3 class="text-lg font-semibold mb-4">Submission Details</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div><strong>Name:</strong> {{ selectedSubmission.firstName }} {{ selectedSubmission.lastName }}</div>
        <div><strong>DOB:</strong> {{ selectedSubmission.dob }}</div>
        <div><strong>Email:</strong> {{ selectedSubmission.email }}</div>
        <div><strong>Phone:</strong> {{ selectedSubmission.phone }}</div>
        <div><strong>Address:</strong> {{ selectedSubmission.address1 }} {{ selectedSubmission.address2 }}</div>
        <div><strong>Postcode:</strong> {{ selectedSubmission.postcode }}</div>
        <div><strong>Response ID:</strong> {{ selectedSubmission.responseId }}</div>
        <div><strong>Submitted:</strong> {{ formatDateTime(selectedSubmission.created_at) }}</div>
        <!-- Add more fields as needed -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'

const router = useRouter()
const submissions = ref([])
const searchQuery = ref('')
const selectedSubmission = ref(null)

const perPage = ref(10)
const currentPage = ref(1)

const logout = async () => {
  await supabase.auth.signOut()
  router.push('/admin/login')
}

const fetchSubmissions = async () => {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error loading submissions:', error.message)
  } else {
    submissions.value = data
  }
}

onMounted(fetchSubmissions)

const filteredSubmissions = computed(() => {
  if (!searchQuery.value) return submissions.value

  return submissions.value.filter((entry) => {
    const q = searchQuery.value.toLowerCase()
    return (
      (entry.firstName + ' ' + entry.lastName).toLowerCase().includes(q) ||
      (entry.dob || '').toLowerCase().includes(q) ||
      (entry.responseId || '').toLowerCase().includes(q)
    )
  })
})

const paginatedSubmissions = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredSubmissions.value.slice(start, start + perPage.value)
})

const totalPages = computed(() => {
  return Math.ceil(filteredSubmissions.value.length / perPage.value)
})

const viewSubmission = (entry) => {
  selectedSubmission.value = entry
}

const formatDateTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
