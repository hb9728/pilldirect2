<!--
  
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold">PillDirect.co.uk Submissions Dashboard</h2>
      <button @click="logout" class="text-red-600 hover:underline">Logout</button>
    </div>
-->



    <template>
<div class="min-h-screen bg-gray-50 p-6">
<div class="flex justify-between items-center mb-6">
  <h2 class="text-2xl font-semibold">PillDirect.co.uk Submissions Dashboard</h2>

<div class="relative" ref="menuRef">
  <button
    @click="toggleMenu"
    class="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm border"
  >
    Menu ▾
  </button>

  <div
    v-if="menuOpen"
    class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-md z-10"
  >
    <button
      class="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
      @click="goToCalendar"
    >
      View Calendar
    </button>
    <button
      class="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
      @click="logout"
    >
      Logout
    </button>
  </div>
</div>
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
  v-for="(submission, index) in paginatedSubmissions"
  :key="submission.responseId + '-' + index"
  :class="{ 'bg-blue-50': selectedSubmission?.responseId === submission.responseId }"
  class="hover:bg-gray-50"
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

<!-- Pagination Controls -->
<div class="flex justify-between items-center mt-4 text-sm">
  <!-- Page navigation stays always visible -->
  <div class="space-x-2">
    <button
      @click="changePage(currentPage - 1)"
      :disabled="currentPage === 1"
      class="px-3 py-1 border rounded disabled:opacity-50"
    >Prev</button>

  <button
  v-for="page in getSmartPages"
  :key="page"
  @click="typeof page === 'number' && changePage(page)"
  class="px-3 py-1 border rounded"
  :class="{
    'bg-blue-100': currentPage === page,
    'cursor-default text-gray-400': page === '...'
  }"
  :disabled="page === '...'"
>
  {{ page }}
</button>

    <button
      @click="changePage(currentPage + 1)"
      :disabled="currentPage === totalPages"
      class="px-3 py-1 border rounded disabled:opacity-50"
    >Next</button>
  </div>

  <!-- Dropdown always shown, on right -->
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

      
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-lg font-semibold">Submission Details</h3>
        <button
          v-if="selectedSubmission"
          @click="goToPatientPMR(selectedSubmission.email, selectedSubmission.responseId)"
          class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 px-4 rounded"
        >
          Open Full PMR
        </button>
      </div>
      
      
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800">
        <div><strong>Name:</strong> {{ selectedSubmission.firstName }} {{ selectedSubmission.lastName }}</div>
        <div><strong>DOB:</strong> {{ selectedSubmission.dob }}</div>
        <div><strong>Email:</strong> {{ selectedSubmission.email }}</div>
        <div><strong>Phone:</strong> {{ selectedSubmission.phone }}</div>
        <div><strong>Address:</strong> {{ selectedSubmission.address1 }} {{ selectedSubmission.address2 }}, {{ selectedSubmission.city }}, {{ selectedSubmission.postcode }}</div>
        <div><strong>Sex:</strong> {{ selectedSubmission.sex }}</div>
        <div><strong>Submitted:</strong> {{ formatDateTime(selectedSubmission.created_at) }}</div>
        <div><strong>Response ID:</strong> {{ selectedSubmission.responseId }}</div>
        
        <div class="col-span-2">
  <label class="block text-sm font-semibold text-gray-700 mb-1">Preferred Appointment</label>

  <div v-if="!isEditingAppointment" class="flex items-center gap-4">
    <div>
      {{ selectedSubmission.contactDay || '—' }} at {{ selectedSubmission.contactTime || '—' }}
    </div>
    <button
  @click="() => {
    isEditingAppointment = true
    editedContactDayObj = selectedSubmission.contactDay ? new Date(selectedSubmission.contactDay) : null
    editedContactTime = selectedSubmission.contactTime || ''
  }"
  class="text-blue-600 hover:underline text-sm"
>
  Edit Appointment
</button>
  </div>

  <div v-else class="flex flex-col sm:flex-row gap-3 mt-2">
    <Datepicker
      v-model="editedContactDayObj"
      :disabled-dates="disableWeekends"
      :min-date="new Date()"
      input-class="border rounded px-3 py-2 text-sm w-full"
      :clearable="false"
      :inline="false"
      :enable-time-picker="false"
    />
    <select
      v-model="editedContactTime"
      class="border rounded px-3 py-2 text-sm w-full"
    >
      <option disabled value="">Select time</option>
      <option v-for="time in availableTimes" :key="time" :value="time">
        {{ time }}
      </option>
    </select>

    <div class="flex gap-2">
      <button
        @click="updateAppointmentDashboard"
        class="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 text-sm"
      >
        Update
      </button>
      <button
        @click="() => (isEditingAppointment.value = false)"
        class="bg-gray-200 text-gray-800 px-3 py-2 rounded hover:bg-gray-300 text-sm"
      >
        Cancel
      </button>
    </div>
  </div>
</div>

        
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
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'
import sha256 from 'crypto-js/sha256'
import { DateTime } from 'luxon'

const router = useRouter()

const submissions = ref([])
const selectedSubmission = ref(null)
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Menu logic
const menuOpen = ref(false)
const menuRef = ref(null)
const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}
const handleClickOutside = (event) => {
  if (menuRef.value && !menuRef.value.contains(event.target)) {
    menuOpen.value = false
  }
}
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    router.push('/admin/login')
  }
})

const logout = async () => {
  await supabase.auth.signOut()
  router.replace('/admin/login')
  location.reload()
}

const formatDateTime = (isoString) => {
  if (!isoString) return ''
  return DateTime.fromISO(isoString, { zone: 'utc' }).setZone('Europe/London').toFormat('dd LLL yyyy, HH:mm')
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

const totalPages = computed(() => Math.ceil(filteredSubmissions.value.length / itemsPerPage.value) || 1)
const paginatedSubmissions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredSubmissions.value.slice(start, start + itemsPerPage.value)
})

const changePage = (newPage) => {
  if (newPage < 1 || newPage > totalPages.value) return
  currentPage.value = newPage
}

watch([filteredSubmissions, itemsPerPage], () => {
  const maxPage = totalPages.value
  if (currentPage.value > maxPage) currentPage.value = maxPage
})
watch(currentPage, () => {
  selectedSubmission.value = null
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
    await fetchSubmissions()
  }
}

const goToPatientPMR = (email, responseId) => {
  const hashed = sha256(email.trim().toLowerCase()).toString()
  router.push(`/admin/patient/${hashed}?open=${responseId}`)
}

const getSmartPages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  pages.push(1)
  if (current > 4) pages.push('...')
  for (let i = Math.max(2, current - 2); i <= Math.min(total - 1, current + 2); i++) {
    pages.push(i)
  }
  if (current + 2 < total - 1) pages.push('...')
  pages.push(total)
  return pages
})


const goToCalendar = () => {
  router.push('/admin/calendar')
}

  import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const editedContactDayObj = ref(null)
const editedContactTime = ref('')
const isEditingAppointment = ref(false)

const availableTimes = [
  '09:00', '09:15', '09:30', '09:45',
  '10:00', '10:15', '10:30', '10:45',
  '11:00', '11:15', '11:30', '11:45',
  '12:00', '12:15', '12:30', '12:45',
  '13:00', '13:15', '13:30', '13:45',
  '14:00', '14:15', '14:30', '14:45',
  '15:00', '15:15', '15:30', '15:45',
  '16:00', '16:15', '16:30', '16:45'
]

const disableWeekends = (date) => {
  const day = date.getDay()
  return day === 0 || day === 6
}

  const updateAppointmentDashboard = async () => {
  const contactDayString = editedContactDayObj.value
    ? editedContactDayObj.value.toISOString().split('T')[0]
    : ''

  const { error } = await supabase
    .from('submissions')
    .update({
      contactDay: contactDayString,
      contactTime: editedContactTime.value
    })
    .eq('responseId', selectedSubmission.value.responseId)

  if (error) {
    console.error('Failed to update appointment time:', error.message)
    return
  }

  isEditingAppointment.value = false
  await fetchSubmissions()

  const updated = submissions.value.find(s => s.responseId === selectedSubmission.value.responseId)
  selectedSubmission.value = { ...updated }
}
</script>
