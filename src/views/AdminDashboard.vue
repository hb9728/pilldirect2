<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold">PillDirect.co.uk Submissions Dashboard</h2>
      <button @click="logout" class="text-red-600 hover:underline">Logout</button>
    </div>

    <input
      v-model="searchQuery"
      type="text"
      placeholder="Search by name, DOB, or ID..."
      class="w-full mb-4 p-2 border border-gray-300 rounded"
    />

    <div v-if="paginatedSubmissions.length === 0" class="text-gray-500">
      No submissions found.
    </div>

    <table v-else class="w-full bg-white shadow rounded text-sm">
      <thead>
        <tr class="bg-gray-100">
          <th class="p-2 border-b text-left">Name</th>
          <th class="p-2 border-b text-left">DOB</th>
          <th class="p-2 border-b text-left">Email</th>
          <th class="p-2 border-b text-left">Response ID</th>
          <th class="p-2 border-b text-left">Submitted</th>
          <th class="p-2 border-b text-left">Status</th>
          <th class="p-2 border-b text-left">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr
  v-for="submission in paginatedSubmissions"
  :key="submission.responseId"
  class="hover:bg-gray-50"
  :class="{ 'bg-blue-50': selectedSubmission?.responseId === submission.responseId }"
>
          <td class="p-2">{{ submission.firstName }} {{ submission.lastName }}</td>
          <td class="p-2">{{ submission.dob }}</td>
          <td class="p-2">{{ submission.email }}</td>
          <td class="p-2">{{ submission.responseId }}</td>
          <td class="p-2">{{ formatDateTime(submission.created_at) }}</td>



          
          <td class="p-2">
  <span
    class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
    :class="{
      'bg-yellow-100 text-yellow-800': submission.status === 'Pending',
      'bg-green-100 text-green-800': submission.status === 'Complete',
      'bg-red-100 text-red-800': submission.status === 'Rejected'
    }"
  >
    <span
      class="h-2 w-2 rounded-full"
      :class="{
        'bg-yellow-500': submission.status === 'Pending',
        'bg-green-500': submission.status === 'Complete',
        'bg-red-500': submission.status === 'Rejected'
      }"
    ></span>
    {{ submission.status }}
  </span>
</td>

          
          
          
          
          <td class="p-2">
            <button @click="viewSubmission(submission)" class="text-blue-600 hover:underline">View</button>
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

    <!-- Inline Submission View -->
    <div v-if="selectedSubmission" class="mt-8 bg-white p-4 rounded shadow">
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()

const submissions = ref([])
const selectedSubmission = ref(null)
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const logout = async () => {
  await supabase.auth.signOut()
  router.push('/admin/login')
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
  const q = searchQuery.value.toLowerCase()
  return submissions.value.filter(entry =>
    (entry.firstName + ' ' + entry.lastName).toLowerCase().includes(q) ||
    (entry.dob || '').toLowerCase().includes(q) ||
    (entry.responseId || '').toLowerCase().includes(q)
  )
})

const totalPages = computed(() => {
  return Math.ceil(filteredSubmissions.value.length / itemsPerPage.value) || 1
})

const paginatedSubmissions = computed(() => {
  const start = Math.max(0, (currentPage.value - 1) * itemsPerPage.value)
  const end = Math.min(filteredSubmissions.value.length, start + itemsPerPage.value)
  return filteredSubmissions.value.slice(start, end)
})

const changePage = (newPage) => {
  const maxPage = totalPages.value
  if (newPage < 1 || newPage > maxPage) return
  currentPage.value = newPage
}

watch([filteredSubmissions, itemsPerPage], () => {
  const maxPage = totalPages.value
  if (currentPage.value > maxPage) {
    currentPage.value = maxPage
  }
})

watch([filteredSubmissions, itemsPerPage], () => {
  const maxPage = Math.ceil(filteredSubmissions.value.length / itemsPerPage.value) || 1
  if (currentPage.value > maxPage) currentPage.value = maxPage
})  

const viewSubmission = (entry) => {
  selectedSubmission.value = { ...entry }
}

const updateStatus = async (entry) => {
  const { error } = await supabase
    .from('submissions')
    .update({ status: entry.status })
    .eq('responseId', entry.responseId)

  if (error) {
    console.error('Error updating status:', error.message)
  } else {
    console.log('✅ Status updated')
    await fetchSubmissions() // <-- re-fetch latest from Supabase
  }
}

</script>
