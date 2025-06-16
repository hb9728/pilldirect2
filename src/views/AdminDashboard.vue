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

    <table v-else class="w-full bg-white shadow rounded">
      <thead>
        <tr>
          <th class="text-left p-2 border-b">Name</th>
          <th class="text-left p-2 border-b">Date of Birth</th>
          <th class="text-left p-2 border-b">Email</th>
          <th class="text-left p-2 border-b">Response ID</th>
          <th class="text-left p-2 border-b">Submitted</th>
          <th class="text-left p-2 border-b">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="submission in filteredSubmissions"
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

    <div v-if="selectedSubmission" class="mt-8 bg-white p-4 rounded shadow">
      <h3 class="text-lg font-semibold mb-2">Submission Details</h3>
      <pre class="overflow-auto text-sm text-gray-800">{{ selectedSubmission }}</pre>
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

const logout = async () => {
  await supabase.auth.signOut()
  router.push('/admin/login')
}

const fetchSubmissions = async () => {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false }) // always newest first

  if (error) {
    console.error('Error loading submissions:', error.message)
  } else {
    submissions.value = data
  }
}

onMounted(fetchSubmissions)

const filteredSubmissions = computed(() => {
  if (!searchQuery.value) return submissions.value

  const q = searchQuery.value.toLowerCase()
  return submissions.value.filter((entry) => {
    return (
      (entry.firstName + ' ' + entry.lastName).toLowerCase().includes(q) ||
      (entry.dob || '').toLowerCase().includes(q) ||
      (entry.responseId || '').toLowerCase().includes(q)
    )
  })
})

const viewSubmission = (entry) => {
  selectedSubmission.value = entry
}
</script>
