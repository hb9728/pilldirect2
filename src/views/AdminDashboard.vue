<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Patient Submissions</h2>
      <button @click="logout" class="btn bg-red-500 hover:bg-red-600 text-white">Logout</button>
    </div>

    <table class="min-w-full bg-white shadow rounded overflow-hidden">
      <thead>
        <tr class="bg-gray-200 text-left">
          <th
            v-for="col in columns"
            :key="col.key"
            class="cursor-pointer px-4 py-2"
            @click="sortBy(col.key)"
          >
            {{ col.label }}
            <span v-if="sortColumn === col.key">
              {{ sortAsc ? '↑' : '↓' }}
            </span>
          </th>
          <th class="px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="submission in sortedSubmissions"
          :key="submission.responseId"
          class="border-b hover:bg-gray-50"
        >
          <td class="px-4 py-2">{{ submission.responseId }}</td>
          <td class="px-4 py-2">{{ submission.firstName }}</td>
          <td class="px-4 py-2">{{ submission.lastName }}</td>
          <td class="px-4 py-2">{{ submission.dob }}</td>
          <td class="px-4 py-2">{{ submission.email }}</td>
          <td class="px-4 py-2">{{ submission.submitted_at?.split('T')[0] }}</td>
          <td class="px-4 py-2">
            <button @click="selectSubmission(submission)" class="text-blue-600 hover:underline">
              View
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Detail Panel -->
    <div v-if="selectedSubmission" class="mt-6 p-4 bg-white rounded shadow">
      <h3 class="text-lg font-semibold mb-2">Submission Details</h3>
      <pre class="text-sm bg-gray-100 p-3 rounded overflow-auto max-h-96">
{{ selectedSubmission }}
      </pre>
      <button @click="selectedSubmission = null" class="mt-2 text-blue-600 hover:underline">
        Close
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'

const router = useRouter()
const submissions = ref([])
const selectedSubmission = ref(null)
const sortColumn = ref('submitted_at')
const sortAsc = ref(false)

const columns = [
  { key: 'responseId', label: 'Response ID' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'dob', label: 'Date of Birth' },
  { key: 'email', label: 'Email' },
  { key: 'submitted_at', label: 'Submission Date' }
]

const fetchSubmissions = async () => {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .order('submitted_at', { ascending: false })

  if (!error) submissions.value = data
  else console.error('❌ Failed to fetch submissions:', error)
}

const sortedSubmissions = computed(() => {
  return [...submissions.value].sort((a, b) => {
    const aVal = a[sortColumn.value]
    const bVal = b[sortColumn.value]
    return sortAsc.value
      ? (aVal > bVal ? 1 : -1)
      : (aVal < bVal ? 1 : -1)
  })
})

const sortBy = (column) => {
  if (sortColumn.value === column) {
    sortAsc.value = !sortAsc.value
  } else {
    sortColumn.value = column
    sortAsc.value = true
  }
}

const selectSubmission = (submission) => {
  selectedSubmission.value = submission
}

const logout = async () => {
  await supabase.auth.signOut()
  router.push('/admin/login')
}

onMounted(fetchSubmissions)
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
