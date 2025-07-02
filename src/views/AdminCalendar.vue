<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold">PillDirect.co.uk Booking Calendar</h2>
      <div class="flex space-x-2">
        <RouterLink to="/admin/dashboard">
          <button class="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm border">
            ← Back to Dashboard
          </button>
        </RouterLink>
        <button @click="logout" class="text-red-600 hover:underline text-sm">Logout</button>
      </div>
    </div>

    <!-- Calendar Card -->
    <div class="bg-white p-4 rounded-lg shadow border border-gray-200 text-sm">
      <FullCalendar ref="fullCalendar" :options="calendarOptions" />
    </div>


<!-- Outer overlay -->
<div
  v-if="showModal"
  class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
  @click.self="closeModal"
>
  <!-- Inner content (modal) -->
  <div class="bg-white p-6 rounded shadow-md w-full max-w-2xl relative">
    
<!-- Modal -->

<div class="flex justify-between items-start mb-4">
  <h2 class="text-lg font-bold">Submission Details</h2>
  <div class="flex gap-2">
    <button
      @click="goToPMR"
      class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
    >
      Open Full PMR →
    </button>
    <button
      @click="closeModal"
      class="ml-2 p-1.5 rounded-full hover:bg-gray-100 text-gray-600"
      title="Close"
    >
      ×
    </button>
  </div>
</div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800">
      <div><strong>Name:</strong> {{ selectedEvent.firstName }} {{ selectedEvent.lastName }}</div>
      <div><strong>DOB:</strong> {{ selectedEvent.dob || '—' }}</div>
      <div><strong>Email:</strong> {{ selectedEvent.email }}</div>
      <div><strong>Phone:</strong> {{ selectedEvent.phone || '—' }}</div>
      <div><strong>Address:</strong> {{ selectedEvent.address1 || '' }} {{ selectedEvent.address2 || '' }}, {{ selectedEvent.city || '' }}, {{ selectedEvent.postcode || '' }}</div>
      <div><strong>Sex:</strong> {{ selectedEvent.sex || '—' }}</div>
      <div><strong>Submitted:</strong> {{ formatDateTime(selectedEvent.created_at) }}</div>
      <div><strong>Response ID:</strong> {{ selectedEvent.responseId }}</div>
      <div><strong>Preferred Contact Day:</strong> {{ selectedEvent.contactDay || '—' }}</div>
      <div><strong>Preferred Contact Time:</strong> {{ selectedEvent.contactTime || '—' }}</div>

      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1">Submission Status</label>

        <select
          v-model="selectedEvent.status"
          @change="updateStatus(selectedEvent)"
          :class="[
            'border rounded px-3 py-2 shadow-sm transition-colors',
            selectedEvent.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-400' :
            selectedEvent.status === 'Complete' ? 'bg-green-100 text-green-800 border-green-400' :
            selectedEvent.status === 'Rejected' ? 'bg-red-100 text-red-800 border-red-400' : ''
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

<!-- Pill-Style Legend -->
<div class="mt-4 flex gap-3 text-sm">
  <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
    <span class="w-2 h-2 rounded-full bg-yellow-500"></span> Pending
  </div>
  <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800">
    <span class="w-2 h-2 rounded-full bg-green-500"></span> Complete
  </div>
  <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-800">
    <span class="w-2 h-2 rounded-full bg-red-500"></span> Rejected
  </div>
</div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'
import sha256 from 'crypto-js/sha256'
import { DateTime } from 'luxon'

export default {
  components: {
    FullCalendar
  },
  setup() {
    const router = useRouter()

    const selectedEvent = ref(null)
    const showModal = ref(false)
    
    const closeModal = () => {
      selectedEvent.value = null
      showModal.value = false
    }
    
const goToPMR = () => {
  if (!selectedEvent.value?.email) return
  const email = selectedEvent.value.email.trim().toLowerCase()
  const hash = sha256(email).toString()
  router.push(`/admin/patient/${hash}?open=${selectedEvent.value.responseId}`)
}
    
    const calendarOptions = ref({
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'timeGridWeek',
      slotMinTime: '09:00:00',
      slotMaxTime: '17:00:00',
      slotDuration: '00:15:00',
      slotLabelInterval: '01:00',
      slotLabelFormat: { hour: 'numeric', minute: '2-digit', hour12: true },
      allDaySlot: false,
      height: 'auto',
      nowIndicator: true,
      eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      },
      eventClassNames: ['rounded-md', 'px-2', 'py-1', 'text-sm', 'shadow-sm', 'hover:shadow-md', 'transition'],
      eventDisplay: 'block',
      eventTextColor: '#fff',
      eventContent: function (arg) {
        return {
          html: `<div class="px-1 text-xs truncate">${arg.timeText} – ${arg.event.title}</div>`
        }
      },
      events: [], // populated on mount
eventClick: (info) => {
  selectedEvent.value = info.event.extendedProps.submission
  showModal.value = true
}
    })

    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          firstName,
          lastName,
          email,
          phone,
          dob,
          sex,
          address1,
          address2,
          city,
          postcode,
          created_at,
          contactDay,
          contactTime,
          responseId,
          status
        `)

      if (error) {
        console.error('Error fetching bookings:', error)
        return
      }

      const bookings = data
  .filter(sub => sub.contactDay && sub.contactTime)
  .map(sub => {
  const start = `${sub.contactDay}T${sub.contactTime}`
  return {
    title: `${sub.firstName} ${sub.lastName}`,
    start,
    end: new Date(new Date(start).getTime() + 15 * 60000).toISOString(),
    color:
      sub.status === 'Complete'
        ? '#22c55e'
        : sub.status === 'Rejected'
        ? '#ef4444'
        : '#facc15', // yellow-400 for Pending
    submission: sub // <- add full data
  }
})

      calendarOptions.value.events = bookings
    }

    const logout = () => {
      localStorage.removeItem('accessToken')
      router.push('/admin/login')
    }

    const formatDateTime = (isoString) => {
  if (!isoString) return ''
  return DateTime.fromISO(isoString, { zone: 'utc' }).setZone('Europe/London').toFormat('dd LLL yyyy, HH:mm')
}

const updateStatus = async () => {
  const { error } = await supabase
    .from('submissions')
    .update({ status: selectedEvent.value.status })
    .eq('responseId', selectedEvent.value.responseId)

  if (error) {
    console.error('Error updating status:', error.message)
  } else {
    // ✅ Don't close modal or re-fetch immediately — just let it be
  }
}

    onMounted(fetchEvents)

return {
  calendarOptions,
  logout,
  selectedEvent,
  showModal,
  closeModal,
  goToPMR,
  formatDateTime,
  updateStatus
}

  }
}
</script>

<style scoped>
.fc {
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem; /* Tailwind text-sm */
}

/* Tighter rows */
.fc-timegrid-slot {
  min-height: 24px !important;
}

/* Compact event title display */
.fc-event-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Optional: Soften the background grid lines */
.fc-timegrid-slot, .fc-scrollgrid {
  border-color: #e5e7eb !important; /* Tailwind gray-200 */
}

.fc-event {
  cursor: pointer;
}
</style>
