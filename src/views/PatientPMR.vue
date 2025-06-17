<template>
  <div class="p-6 space-y-6">
    <h2 class="text-2xl font-bold">Patient Record</h2>

    <!-- Patient Header -->
    <div class="bg-white border rounded shadow p-4">
      <h3 class="text-lg font-semibold mb-2">Patient Details</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        <p><strong>Name:</strong> {{ selectedSubmission?.firstName }} {{ selectedSubmission?.lastName }}</p>
        <p><strong>Email:</strong> {{ selectedSubmission?.email }}</p>
        <p><strong>DOB:</strong> {{ selectedSubmission?.dob }}</p>
      </div>
    </div>

    <!-- Submission History -->
    <div class="bg-white border rounded shadow p-4">
      <h3 class="text-lg font-semibold mb-4">Submission History</h3>
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-100 text-left">
            <th class="p-2">Submitted</th>
            <th class="p-2">Status</th>
            <th class="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="entry in paginatedSubmissions"
            :key="entry.responseId"
            :class="{ 'bg-blue-50': selectedSubmission?.responseId === entry.responseId }"
            class="hover:bg-gray-50"
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
              <button @click="selectSubmission(entry)" class="text-blue-600 hover:underline">Open</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
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

    <!-- Full Submission Viewer -->
    <div v-if="selectedSubmission" class="bg-white border rounded shadow p-4 text-sm space-y-6">
      <h3 class="text-lg font-semibold">Full Submission Details</h3>

      <!-- Contact -->
      <Section title="Contact Information">
        <Field label="First Name" :value="selectedSubmission.firstName" />
        <Field label="Last Name" :value="selectedSubmission.lastName" />
        <Field label="Email" :value="selectedSubmission.email" />
        <Field label="Phone Number" :value="selectedSubmission.phone" />
        <Field label="Sex" :value="selectedSubmission.sex" />
        <Field label="Date of Birth" :value="selectedSubmission.dob" />
        <Field label="Address" :value="formatAddress(selectedSubmission)" />
      </Section>

      <!-- Contraception -->
      <Section title="Contraception">
        <Field label="Current Method" :value="selectedSubmission.currentContraceptive" />
        <Field label="Treatment Preference" :value="selectedSubmission.treatmentPreference" />
        <Field label="Pill Choice" :value="selectedSubmission.pillChoice" />
        <Field label="Other Pill" :value="selectedSubmission.otherPill" />
        <Field label="Pill Gap" :value="selectedSubmission.pillGap" />
        <Field label="Other Meds" :value="selectedSubmission.extraMeds" />
      </Section>

      <!-- Vitals -->
      <Section title="Vitals">
        <Field label="Imperial / Metric" :value="selectedSubmission.imperialMetric" />
        <Field label="Height (ft/in)" :value="`${selectedSubmission.heightFt || '—'}' ${selectedSubmission.heightIn || '—'}"` />
        <Field label="Height (cm)" :value="selectedSubmission.heightCm" />
        <Field label="Weight (st/lbs)" :value="`${selectedSubmission.weightSt || '—'} st ${selectedSubmission.weightLbs || '—'} lbs`" />
        <Field label="Weight (kg)" :value="selectedSubmission.weightKg" />
        <Field label="BP Checked?" :value="selectedSubmission.bpChecked" />
        <Field label="BP Reading" :value="`${selectedSubmission.bpSystolic || '—'}/${selectedSubmission.bpDiastolic || '—'}`" />
      </Section>

      <!-- Medical History -->
      <Section title="Medical History">
        <div>
          <p class="font-semibold">Selected Conditions:</p>
          <ul v-if="parsedMedicalHistory.length" class="list-disc list-inside">
            <li v-for="item in parsedMedicalHistory" :key="item">{{ item }}</li>
          </ul>
          <p v-else>—</p>
        </div>
        <Field label="Extra Info" :value="selectedSubmission.extraInfo" />
      </Section>

      <!-- Consents -->
      <Section title="Consents">
        <Field label="Promotional Emails" :value="selectedSubmission.promoConsent ? 'Yes' : 'No'" />
        <Field label="Share With GP" :value="selectedSubmission.shareConsent ? 'Yes' : 'No'" />
        <Field label="Receive Updates" :value="selectedSubmission.updateConsent ? 'Yes' : 'No'" />
      </Section>

      <!-- Meta -->
      <Section title="Meta">
        <Field label="Response ID" :value="selectedSubmission.responseId" />
        <Field label="Submitted At" :value="formatDateTime(selectedSubmission.created_at)" />
        <div class="mt-2">
          <label class="block font-semibold mb-1">Submission Status</label>
          <select
            v-model="selectedSubmission.status"
            @change="updateStatus(selectedSubmission)"
            :class="[
              'border rounded px-3 py-2 shadow-sm',
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
      </Section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../supabase'
import sha256 from 'crypto-js/sha256'

// State
const submissions = ref([])
const selectedSubmission = ref(null)
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Route logic
const route = useRoute()
const fetchByHashedEmail = async () => {
  const all = await supabase.from('submissions').select('*')
  const match = all.data.find((s) => sha256(s.email.trim().toLowerCase()).toString() === route.params.patientId)
  if (!match) return

  const { data } = await supabase
    .from('submissions')
    .select('*')
    .eq('email', match.email)
    .order('created_at', { ascending: false })

  submissions.value = data || []
  selectedSubmission.value = submissions.value[0]
}
onMounted(fetchByHashedEmail)

// Pagination
const totalPages = computed(() => Math.ceil(submissions.value.length / itemsPerPage.value) || 1)
const paginatedSubmissions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return submissions.value.slice(start, start + itemsPerPage.value)
})
watch(itemsPerPage, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = Math.max(1, totalPages.value)
  }
})
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page
}
const selectSubmission = (entry) => (selectedSubmission.value = entry)

// Formatting
const formatDateTime = (iso) => new Date(iso).toLocaleString('en-GB')
const formatAddress = (s) =>
  [s.address1, s.address2, s.city, s.postcode].filter(Boolean).join(', ')

// Update Status
const updateStatus = async (entry) => {
  await supabase.from('submissions').update({ status: entry.status }).eq('responseId', entry.responseId)
}

// Computed for Medical History
const parsedMedicalHistory = computed(() => {
  const raw = selectedSubmission.value?.selectApplicable
  if (!raw) return []
  try {
    return Array.isArray(raw) ? raw : JSON.parse(raw)
  } catch {
    return raw.split(',').map((x) => x.trim()).filter(Boolean)
  }
})
</script>

<!-- Reusable Field + Section Components -->
<script>
export const Field = {
  props: ['label', 'value'],
  template: `
    <p><strong>{{ label }}:</strong> {{ value || '—' }}</p>
  `,
}
export const Section = {
  props: ['title'],
  template: `
    <div class="border-t pt-4">
      <h4 class="font-semibold text-gray-700 mb-2">{{ title }}</h4>
      <div class="space-y-1">
        <slot></slot>
      </div>
    </div>
  `,
}
</script>
