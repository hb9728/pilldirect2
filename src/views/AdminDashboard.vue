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
          <th
            v-for="column in columns"
            :key="column.key"
            @click="sortBy(column.key)"
            class="text-left p-2 border-b cursor-pointer hover:bg-gray-100"
          >
            {{ column.label }}
            <span v-if="sortKey === column.key">
              {{ sortOrder === 'asc' ? '▲' : '▼' }}
            </span>
          </th>
          <th class="p-2 border-b">Action</th>
        </tr>
      </thead>
      <tbody>
       <tr
          v-for="submission in sortedSubmissions"
          :key="submission.responseId"
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
const sortKey = ref('created_at')
const sortOrder = ref('desc') // default: latest first

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

const columns = [
  { key: 'lastName', label: 'Name' }, // use lastName (or firstName if preferred)
  { key: 'dob', label: 'Date of Birth' },
  { key: 'email', label: 'Email' },
  { key: 'responseId', label: 'Response ID' },
  { key: 'created_at', label: 'Submitted' }
]


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

const sortedSubmissions = computed(() => {
  if (!sortKey.value) return filteredSubmissions.value

  return [...filteredSubmissions.value].sort((a, b) => {
    const aVal = a[sortKey.value]
    const bVal = b[sortKey.value]

    // Handle null or undefined values
    if (aVal == null) return 1
    if (bVal == null) return -1

    // Special case: sort by created_at (date)
    if (sortKey.value === 'created_at') {
      return sortOrder.value === 'asc'
        ? new Date(aVal) - new Date(bVal)
        : new Date(bVal) - new Date(aVal)
    }

    // Default: string or number comparison
    const aStr = aVal.toString().toLowerCase()
    const bStr = bVal.toString().toLowerCase()

    if (aStr < bStr) return sortOrder.value === 'asc' ? -1 : 1
    if (aStr > bStr) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
})


const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

const viewSubmission = (entry) => {
  selectedSubmission.value = entry
}
</script>
