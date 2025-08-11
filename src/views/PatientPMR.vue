<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <!-- Top Bar: Title + Back/Menu -->
    <div class="flex items-center justify-between mb-3">
      <!-- Title on the left -->
      <h1 class="text-2xl font-semibold">Patient Records</h1>

      <!-- Back + Menu on the right -->
      <div class="flex items-center gap-2">
        <button
          v-if="showBackButton"
          class="px-3 py-2 rounded border hover:bg-gray-100"
          @click="$router.back()"
        >
          ← Back
        </button>
        <HeaderMenu :items="menuItems" @navigate="onNavigate" @logout="logout" />
      </div>
    </div>

    <!-- PMR Search Bar -->
    <div ref="searchBoxRef" class="mb-4 relative w-full">
      <input
        v-model="searchTerm"
        placeholder="Search patients by name, DOB, ID, or email..."
        class="w-full p-2 border border-gray-300 rounded"
        @focus="showDropdown = true"
      />
      <div
        v-if="searchTerm && filteredPatients.length && showDropdown"
        class="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded shadow z-10 max-h-60 overflow-y-auto"
      >
        <button
          v-for="(sub, idx) in filteredPatients"
          :key="idx"
          @click="handleDropdownSelect(sub)"
          class="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm"
        >
          {{ sub.firstName }} {{ sub.lastName }} — {{ sub.email }} — {{ sub.dob }} — {{ sub.responseId }}
        </button>
      </div>
      <div
        v-else-if="searchTerm && !filteredPatients.length && showDropdown"
        class="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded shadow text-sm px-4 py-2 text-gray-500"
      >
        No matching patients.
      </div>
    </div>

    <div v-if="showBlankState" class="px-4">
      <div class="flex flex-col items-center justify-center h-[300px] w-full text-gray-500">
        <!-- Embossed Text in Bordered Capsule -->
        <div class="px-6 py-4 rounded-md border border-gray-300 bg-gray-100">
          <p class="text-lg font-semibold text-gray-500 relative leading-none">
            <span class="relative inline-block">
              <span
                class="absolute inset-0 text-black opacity-20 -translate-x-[1px] -translate-y-[1px] blur-[0.3px]"
                style="z-index: -1;"
                aria-hidden="true"
              >
                PillDirect.co.uk
              </span>
              <span
                class="absolute inset-0 text-white opacity-80 translate-x-[1px] translate-y-[1px] blur-[0.3px]"
                style="z-index: -1;"
                aria-hidden="true"
              >
                PillDirect.co.uk
              </span>
              PillDirect.co.uk
            </span>
          </p>
        </div>

        <p class="text-sm mt-4 text-gray-400">
          Search for a patient above to view their record.
        </p>
      </div>
    </div>

    <!-- PMR Header + Submission history -->
    <div v-if="route.params.patientId">
      <div v-if="submissions.length">
        <div class="mb-6 bg-white p-4 rounded shadow border border-gray-200">
          <h3 class="text-lg font-semibold mb-2">Patient Record</h3>
          <p class="text-sm text-gray-700">
            Submissions associated with: <strong>{{ submissions[0].email }}</strong>
          </p>
          <p
            v-if="hasConflictingDetails"
            class="text-xs text-red-500 mt-1"
          >
            ⚠️ Multiple people may be using this email address. Verify each entry carefully.
          </p>
        </div>

        <!-- Submission History -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-2">Submission History</h3>
          <table class="w-full bg-white shadow rounded text-sm">
            <thead>
              <tr class="bg-gray-100">
                <th class="p-2 border-b text-left">Response ID</th>
                <th class="p-2 border-b text-left">Submitted</th>
                <th class="p-2 border-b text-left">Status</th>
                <th class="p-2 border-b text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(entry, index) in paginatedSubmissions"
                :key="entry.responseId + '--' + index"
                :class="{ 'bg-blue-50': selectedSubmission?.responseId === entry.responseId }"
                class="hover:bg-gray-50"
              >
                <td class="p-2">{{ entry.responseId }}</td>
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
                  <button @click="selectSubmission(entry)" class="text-blue-600 hover:underline">Open</button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="flex justify-between items-center mt-4 text-sm">
            <div class="flex items-center space-x-1">
              <button
                @click="changePage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>

              <template v-for="page in visiblePageNumbers" :key="page">
                <span v-if="page === '...'" class="px-2">...</span>
                <button
                  v-else
                  @click="changePage(page)"
                  class="px-3 py-1 border rounded"
                  :class="{ 'bg-blue-100': currentPage === page }"
                >
                  {{ page }}
                </button>
              </template>

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
                <option :value="5">5</option>
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
              </select>
              per page
            </div>
          </div>
        </div>

        <!-- Full Submission Detail Viewer -->
        <div
          v-if="selectedSubmission"
          id="pdfContent"
          class="bg-white p-4 rounded shadow text-sm text-gray-800"
        >
          <h3 class="text-lg font-semibold mb-4">Full Submission Details</h3>

          <!-- PDF Button -->
          <div class="mb-4 flex justify-end">
            <button
              @click="downloadPDF"
              class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded"
            >
              Download as PDF
            </button>
          </div>

          <!-- Sections -->
          <div class="space-y-6">
            <!-- Contact Info -->
            <div class="border border-gray-300 rounded bg-gray-50 p-4 mb-6 shadow-sm">
              <h4 class="font-semibold text-gray-800 text-md mb-3 border-b pb-1">Contact Information</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-gray-800">
                <div>
                  <p class="text-base font-semibold">{{ selectedSubmission.firstName }} {{ selectedSubmission.lastName }}</p>
                  <p><strong>Phone:</strong> {{ selectedSubmission.phone || '—' }}</p>
                  <p><strong>Sex:</strong> {{ selectedSubmission.sex || '—' }}</p>
                </div>
                <div>
                  <p><strong>Email:</strong> {{ selectedSubmission.email || '—' }}</p>
                  <p><strong>DOB:</strong> {{ selectedSubmission.dob || '—' }}</p>

                  <!-- GP address -->
                  <p><strong>GP-registered address:</strong><br />
                    {{ selectedSubmission.gp_address1 || '' }} {{ selectedSubmission.gp_address2 || '' }}<span v-if="selectedSubmission.gp_address1 || selectedSubmission.gp_address2">,</span>
                    {{ selectedSubmission.gp_city || '' }}<span v-if="selectedSubmission.gp_city">,</span>
                    {{ selectedSubmission.gp_postcode || '' }}
                  </p>

                  <!-- Delivery address -->
                  <p><strong>Delivery address:</strong><br />
                    {{ selectedSubmission.address1 || '' }} {{ selectedSubmission.address2 || '' }}<span v-if="selectedSubmission.address1 || selectedSubmission.address2">,</span>
                    {{ selectedSubmission.city || '' }}<span v-if="selectedSubmission.city">,</span>
                    {{ selectedSubmission.postcode || '' }}
                  </p>
                </div>
              </div>
            </div>

            <hr class="my-4 border-gray-200" />

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

            <hr class="my-4 border-gray-200" />

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

            <hr class="my-4 border-gray-200" />

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

            <hr class="my-4 border-gray-200" />

            <!-- Callback Timing with Editable Appointment -->
            <div>
              <h4 class="font-semibold text-gray-700 mb-2">Callback Timing</h4>

              <div v-if="!isEditingAppointment" class="flex items-center gap-4">
                <p>
                  <strong>Preferred:</strong>
                  {{ selectedSubmission.contactDay || '—' }} at {{ selectedSubmission.contactTime || '—' }}
                </p>
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
                  <option v-for="time in availableTimes" :key="time" :value="time">{{ time }}</option>
                </select>

                <div class="flex gap-2">
                  <button
                    @click="updateAppointmentPMR"
                    class="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 text-sm"
                  >
                    Update
                  </button>
                  <button
                    @click="() => (isEditingAppointment = false)"
                    class="bg-gray-200 text-gray-800 px-3 py-2 rounded hover:bg-gray-300 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            <hr class="my-4 border-gray-200" />

            <!-- Consents -->
            <div>
              <h4 class="font-semibold text-gray-700 mb-2">Consents</h4>
              <p><strong>Promo Consent:</strong> {{ selectedSubmission.promoConsent ? 'Yes' : 'No' }}</p>
              <p><strong>Share with GP:</strong> {{ selectedSubmission.shareConsent ? 'Yes' : 'No' }}</p>
              <p><strong>Receive Updates:</strong> {{ selectedSubmission.updateConsent ? 'Yes' : 'No' }}</p>
            </div>

            <hr class="my-4 border-gray-200" />

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

          <!-- Notes -->
          <div class="mt-6">
            <h4 class="font-semibold text-gray-700 mb-2">Staff Notes</h4>

            <!-- AI Note Generator -->
            <div class="flex items-center gap-2 mb-2">
              <button
                @click="generateAINote"
                :disabled="loadingNote || !selectedSubmission"
                class="px-3 py-1 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 transition"
              >
                {{ loadingNote ? 'Generating...' : 'Generate AI Note' }}
              </button>
              <span v-if="aiNoteStatus" class="text-sm text-gray-500">{{ aiNoteStatus }}</span>
            </div>

            <textarea
              v-model="selectedSubmission.notes"
              @blur="saveNotes(selectedSubmission)"
              placeholder="Add notes about this submission..."
              rows="4"
              class="w-full border border-gray-300 rounded p-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            ></textarea>

            <p class="text-xs text-gray-500 mt-1">Saved automatically when you click away.</p>
          </div>
        </div>
      </div>

      <div v-else class="text-gray-600">Loading submissions...</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../supabase'
import sha256 from 'crypto-js/sha256'
import html2pdf from 'html2pdf.js'
import { DateTime } from 'luxon'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import HeaderMenu from '../components/HeaderMenu.vue'

const route = useRoute()
const router = useRouter()

const submissions = ref([])
const selectedSubmission = ref(null)
const currentPage = ref(1)
const itemsPerPage = ref(5)

const searchTerm = ref('')
const allSubmissions = ref([])

const filteredPatients = computed(() => {
  const term = searchTerm.value.toLowerCase().trim()
  const seenIds = new Set()

  return allSubmissions.value
    .filter(sub => {
      const firstName = sub.firstName?.toLowerCase() || ''
      const lastName = sub.lastName?.toLowerCase() || ''
      const email = sub.email?.toLowerCase() || ''
      const dob = sub.dob || ''
      const responseId = sub.responseId?.toLowerCase() || ''

      const isMatch =
        firstName.includes(term) ||
        lastName.includes(term) ||
        email.includes(term) ||
        dob.includes(term) ||
        responseId.includes(term)

      if (isMatch && !seenIds.has(sub.responseId)) {
        seenIds.add(sub.responseId)
        return true
      }
      return false
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

const fetchAllSubmissions = async () => {
  const { data, error } = await supabase.from('submissions').select('*')
  if (error) {
    console.error('Failed to fetch all submissions:', error.message)
    return
  }
  allSubmissions.value = data || []
}

const handleDropdownSelect = (sub) => {
  const hashed = sha256(sub.email.trim().toLowerCase()).toString()
  const responseId = sub.responseId
  if (route.params.patientId !== hashed || route.query.open !== responseId) {
    router.push({ path: `/admin/patient/${hashed}`, query: { open: responseId } })
  } else {
    router.replace({ path: `/admin/patient/${hashed}`, query: { open: responseId, t: Date.now() } })
  }
}

const goToPatientPMR = (email) => {
  const hashed = sha256(email.trim().toLowerCase()).toString()
  router.push(`/admin/patient/${hashed}`)
}

const handlePatientSelect = (email) => {
  const hashed = sha256(email.trim().toLowerCase()).toString()
  if (route.params.patientId !== hashed) {
    router.push(`/admin/patient/${hashed}`)
  } else {
    router.replace({ path: `/admin/patient/${hashed}`, query: { t: Date.now() } })
  }
}

const patientId = computed(() => route.params.patientId || null)
const showBlankState = computed(() => !patientId.value)

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) router.push('/admin/login')
  await fetchAllSubmissions()
})

const showBackButton = ref(false)
onMounted(() => {
  showBackButton.value = window.history.length > 1
})

/* Click-outside for search dropdown */
const searchBoxRef = ref(null)
const showDropdown = ref(false)
const handleClickOutsideSearch = (event) => {
  if (searchBoxRef.value && !searchBoxRef.value.contains(event.target)) {
    showDropdown.value = false
  }
}
onMounted(() => document.addEventListener('click', handleClickOutsideSearch))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutsideSearch))

/* Header menu (shared) */
const menuItems = computed(() => ([
  { label: 'Dashboard', to: '/admin/dashboard', current: route.path === '/admin/dashboard' },
  { label: 'Calendar',  to: '/admin/calendar',  current: route.path === '/admin/calendar' },
  { label: 'Analytics', to: '/admin/analytics', current: route.path === '/admin/analytics' },
  { label: 'Open Full PMR', to: '/admin/patient', current: route.path.startsWith('/admin/patient') },
]))
function onNavigate(item) {
  router.push(item.to)
}

/* Pagination + selection */
const changePage = (page) => {
  const max = totalPages.value
  if (page < 1 || page > max) return
  currentPage.value = page
  selectedSubmission.value = null
}

const totalPages = computed(() => Math.ceil(submissions.value.length / itemsPerPage.value) || 1)

const paginatedSubmissions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return submissions.value.slice(start, end)
})

const selectSubmission = (entry) => {
  selectedSubmission.value = { ...entry }
  router.replace({ query: { ...route.query, open: entry.responseId } })
}

/* Formatting + data fetch */
const formatDateTime = (isoString) => {
  if (!isoString) return ''
  return DateTime.fromISO(isoString, { zone: 'utc' })
    .setZone('Europe/London')
    .toFormat('dd LLL yyyy, HH:mm')
}

const fetchByHashedEmail = async () => {
  const all = await supabase.from('submissions').select('*')
  const target = all.data.find(sub => sha256(sub.email.trim().toLowerCase()).toString() === route.params.patientId)
  if (target) {
    const { data } = await supabase
      .from('submissions')
      .select('*')
      .ilike('email', target.email)
      .order('created_at', { ascending: false })
    submissions.value = data
    const openId = route.query.open
    const match = data.find(s => s.responseId === openId)
    selectedSubmission.value = match || null
  }
}
onMounted(fetchByHashedEmail)

watch(() => route.params.patientId, async (newId, oldId) => {
  if (newId && newId !== oldId) {
    selectedSubmission.value = null
    currentPage.value = 1
    await fetchByHashedEmail()
  }
})
watch(() => route.query.open, async (newId) => {
  if (newId && allSubmissions.value.length) {
    const found = allSubmissions.value.find(s => s.responseId === newId)
    if (found) selectedSubmission.value = found
  }
})

/* Status + notes + AI note */
const updateStatus = async (entry) => {
  // Get the currently logged-in admin
  const { data: { user } } = await supabase.auth.getUser()
  const adminEmail = user?.email || 'unknown'

  const { error } = await supabase
    .from('submissions')
    .update({
      status: entry.status,
      statusUpdatedAt: new Date().toISOString(),
      statusUpdatedBy: adminEmail
    })
    .eq('responseId', entry.responseId)

  if (error) {
    console.error('Error updating status:', error.message)
  } else {
    // Refresh view if this page uses a table/list
    if (typeof fetchSubmissions === 'function') {
      await fetchSubmissions()
    }
  }
}

const saveNotes = async (entry) => {
  const { error } = await supabase
    .from('submissions')
    .update({ notes: entry.notes })
    .eq('responseId', entry.responseId)
  if (error) {
    console.error('Failed to save notes:', error.message)
  } else {
    console.log('✅ Notes saved')
  }
}

const loadingNote = ref(false)
const aiNoteStatus = ref('')

const generateAINote = async () => {
  if (!selectedSubmission.value) return
  loadingNote.value = true
  aiNoteStatus.value = 'Generating...'

  try {
    const startRes = await fetch('/api/startNote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submission: selectedSubmission.value })
    })

    const { id, error } = await startRes.json()
    if (error || !id) throw new Error(error || 'No prediction ID returned')

    let done = false
    let result
    const timeout = Date.now() + 60000

    while (!done && Date.now() < timeout) {
      await new Promise(r => setTimeout(r, 1000))
      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
        headers: { Authorization: `Token ${import.meta.env.VITE_REPLICATE_API_KEY}` }
      })
      result = await pollRes.json()
      if (result.status === 'succeeded' || result.status === 'failed') done = true
    }

    if (result.status !== 'succeeded') throw new Error('AI generation failed or timed out')

    selectedSubmission.value.notes = result.output?.join(' ') || '—'
    aiNoteStatus.value = 'AI note inserted. Review & edit before saving.'
  } catch (err) {
    console.error('❌ AI polling failed:', err)
    aiNoteStatus.value = 'Could not generate AI note. Please try again.'
  } finally {
    loadingNote.value = false
  }
}

/* PDF */
const downloadPDF = () => {
  const element = document.getElementById('pdfContent')
  if (!element) return

  const opt = {
    margin: 0.5,
    filename: `Submission-${selectedSubmission.value?.responseId || 'export'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  }

  html2pdf().set(opt).from(element).save()
}

/* Appointment editing */
const isEditingAppointment = ref(false)
const editedContactDayObj = ref(null)
const editedContactTime = ref('')

const availableTimes = Array.from({ length: 13 * 4 }, (_, i) => {
  const h = 9 + Math.floor(i / 4)   // 09 → 20:45
  const m = (i % 4) * 15
  return h === 21 ? null : `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
}).filter(Boolean)

const disableWeekends = (date) => {
  const day = date.getDay()
  return day === 0 || day === 6
}

const updateAppointmentPMR = async () => {
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
    console.error('❌ Failed to update appointment:', error.message)
    return
  }

  selectedSubmission.value.contactDay = contactDayString
  selectedSubmission.value.contactTime = editedContactTime.value
  isEditingAppointment.value = false
}

/* Derived */
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

const hasConflictingDetails = computed(() => {
  if (submissions.value.length <= 1) return false
  const norm = (str) => (str || '').trim().toLowerCase()

  const reference = {
    firstName: norm(submissions.value[0].firstName),
    lastName: norm(submissions.value[0].lastName),
    dob: submissions.value[0].dob,
    phone: submissions.value[0].phone,
    sex: norm(submissions.value[0].sex)
  }

  return submissions.value.some(entry => {
    return (
      norm(entry.firstName) !== reference.firstName ||
      norm(entry.lastName) !== reference.lastName ||
      entry.dob !== reference.dob ||
      entry.phone !== reference.phone ||
      norm(entry.sex) !== reference.sex
    )
  })
})

/* Logout */
const logout = async () => {
  await supabase.auth.signOut()
  router.replace('/admin/login')
  location.reload()
}

/* Visible pages */
const visiblePageNumbers = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current > 3) pages.push(1)
    if (current > 4) pages.push('...')
    for (let i = current - 2; i <= current + 2; i++) {
      if (i > 0 && i <= total) pages.push(i)
    }
    if (current < total - 3) pages.push('...')
    if (current < total - 2) pages.push(total)
  }
  return pages
})

watch(itemsPerPage, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = Math.max(1, totalPages.value)
  }
})
watch(currentPage, () => {
  selectedSubmission.value = null
})
</script>
