<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <!-- Top Bar: Title + Back/Menu -->
    <div class="flex items-center justify-between mb-3">
      <h1 class="text-2xl font-semibold">Calendar</h1>

      <div class="flex items-center gap-2">
        <button class="px-3 py-2 rounded border hover:bg-gray-100" @click="$router.back()">← Back</button>
        <HeaderMenu :items="menuItems" @navigate="onNavigate" @logout="onLogout" />
      </div>
    </div>

    <!-- Calendar Card -->
    <div class="bg-white p-4 rounded-lg shadow border border-gray-200 text-sm">
      <FullCalendar ref="calendarRef" :options="calendarOptions" />
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      @click.self="closeModal"
    >
      <div class="bg-white p-6 rounded shadow-md w-full max-w-2xl relative">
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
              class="ml-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600"
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

          <!-- Appointment Time Block -->
          <div class="col-span-2">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Preferred Appointment</label>

            <div v-if="!isEditingAppointment" class="flex items-center gap-4">
              <div>
                {{ selectedEvent.contactDay || '—' }} at {{ selectedEvent.contactTime || '—' }}
              </div>
              <button
                @click="() => {
                  isEditingAppointment = true
                  editedContactDay = selectedEvent.contactDay
                  editedContactTime = selectedEvent.contactTime
                  editedContactDayObj = selectedEvent.contactDay ? new Date(selectedEvent.contactDay) : null
                }"
                class="text-blue-600 hover:underline text-sm"
              >
                Edit Appointment
              </button>
            </div>

            <div v-else class="flex flex-col sm:flex-row gap-3">
              <Datepicker
                v-model="editedContactDayObj"
                :disabled-dates="disableWeekends"
                :min-date="new Date()"
                input-class="border rounded px-3 py-2 text-sm w-full"
                :clearable="false"
                :inline="false"
                :enable-time-picker="false"
              />

              <select v-model="editedContactTime" class="border rounded px-3 py-2 text-sm w-full">
                <option disabled value="">Select time</option>
                <option v-for="time in availableTimes" :key="time" :value="time">
                  {{ time }}
                </option>
              </select>

              <div class="flex gap-2">
                <button
                  @click="updateAppointment"
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

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Submission Status</label>
            <select
              v-model="selectedEvent.status"
              @change="updateStatus"
              :class="[
                'mt-1 border rounded px-3 py-2 text-sm shadow-sm transition-colors',
                selectedEvent.status === 'Pending'
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-400'
                  : selectedEvent.status === 'Complete'
                  ? 'bg-green-100 text-green-800 border-green-400'
                  : selectedEvent.status === 'Rejected'
                  ? 'bg-red-100 text-red-800 border-red-400'
                  : ''
              ]"
            >
              <option value="Pending">Pending</option>
              <option value="Complete">Complete</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend -->
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
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '../supabase'
import sha256 from 'crypto-js/sha256'
import { DateTime } from 'luxon'
import HeaderMenu from '../components/HeaderMenu.vue'
import enGbLocale from '@fullcalendar/core/locales/en-gb'

export default {
  components: {
    FullCalendar,
    Datepicker,
    HeaderMenu
  },
  setup() {
    const isEditingAppointment = ref(false)
    const editedContactDay = ref('')
    const editedContactTime = ref('')

    const calendarRef = ref(null)
    const router = useRouter()
    const route = useRoute()

    const selectedEvent = ref(null)
    const showModal = ref(false)
    const showBackButton = ref(false)

    const closeModal = () => {
      selectedEvent.value = null
      showModal.value = false
    }

    onMounted(() => {
      showBackButton.value = window.history.length > 1
    })

    // Header menu items
    const menuItems = computed(() => ([
      { label: 'Dashboard', to: '/admin/dashboard', current: route.path === '/admin/dashboard' },
      { label: 'Calendar',  to: '/admin/calendar',  current: route.path === '/admin/calendar' },
      { label: 'Analytics', to: '/admin/analytics', current: route.path === '/admin/analytics' },
      { label: 'Open Full PMR', to: '/admin/patient', current: route.path.startsWith('/admin/patient') },
    ]))
    function onNavigate(item) {
      router.push(item.to)
    }
    function onLogout() {
      localStorage.removeItem('accessToken')
      router.push('/admin/login')
    }

    const goToPMR = () => {
      if (!selectedEvent.value?.email) return
      const email = selectedEvent.value.email.trim().toLowerCase()
      const hash = sha256(email).toString()
      router.push(`/admin/patient/${hash}?open=${selectedEvent.value.responseId}`)
    }

    const calendarOptions = ref({
      locale: enGbLocale,
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],

      // Views + toolbar
      initialView: 'timeGridWeek',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'timeGridDay,timeGridWeek,dayGridMonth'
      },
      buttonText: {
        today: 'Today',
        dayGridMonth: 'Month',
        timeGridWeek: 'Week',
        timeGridDay: 'Day'
      },

      // Layout & UX
      height: 'auto',
      expandRows: true,
      stickyHeaderDates: true,
      navLinks: true,
      nowIndicator: true,
      dayMaxEventRows: 3,
      moreLinkContent: function(args) {
        return `+${args.num} more entries`;
      },
      aspectRatio: 1.8,
      weekNumbers: true,

      // Working hours
      businessHours: { daysOfWeek: [1,2,3,4,5], startTime: '09:00', endTime: '21:00' },
      slotMinTime: '09:00:00',
      slotMaxTime: '21:00:00',
      scrollTime: '09:00:00',
      slotDuration: '00:15:00',
      slotLabelInterval: '01:00',
      slotLabelFormat: { hour: 'numeric', minute: '2-digit', hour12: true },
      allDaySlot: false,

      // Events
      eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
      events: [], // populated by fetchEvents
      eventClick: (info) => {
        selectedEvent.value = info.event.extendedProps.submission
        showModal.value = true
      },
      eventClassNames: ['rounded-md', 'px-2', 'py-1', 'text-sm', 'shadow-sm', 'hover:shadow-md', 'transition'],
      eventContent: (arg) => ({
        html: `<div class="px-1 text-xs truncate cursor-pointer">${arg.timeText} – ${arg.event.title}</div>`
      }),
    })

    // Auto switch to Day view on small screens; switch back on resize
    const applyResponsiveView = () => {
      const api = calendarRef.value?.getApi()
      if (!api) return
      if (window.matchMedia('(max-width: 640px)').matches) {
        api.changeView('timeGridDay')
      } else if (api.view.type === 'timeGridDay') {
        api.changeView('timeGridWeek')
      }
    }
    let resizeListener
    onMounted(() => {
      applyResponsiveView()
      resizeListener = () => applyResponsiveView()
      window.addEventListener('resize', resizeListener)
    })
    onBeforeUnmount(() => {
      if (resizeListener) window.removeEventListener('resize', resizeListener)
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

      const bookings = (data || [])
        .filter(sub => sub.contactDay && sub.contactTime)
        .map(sub => {
          const start = `${sub.contactDay}T${sub.contactTime}`
          const statusClass =
            sub.status === 'Complete'
              ? 'event-complete'
              : sub.status === 'Rejected'
              ? 'event-rejected'
              : 'event-pending'

          return {
            title: `${sub.firstName} ${sub.lastName}`,
            start,
            end: new Date(new Date(start).getTime() + 15 * 60000).toISOString(),
            classNames: [statusClass],
            submission: sub
          }
        })

      calendarOptions.value.events = bookings
    }

    const formatDateTime = (isoString) => {
      if (!isoString) return ''
      return DateTime.fromISO(isoString, { zone: 'utc' })
        .setZone('Europe/London')
        .toFormat('dd LLL yyyy, HH:mm')
    }

    const updateStatus = async () => {
      const newStatus = selectedEvent.value.status
      const { data: { user } } = await supabase.auth.getUser()
      const adminEmail = user?.email || 'unknown'

      const { error } = await supabase
        .from('submissions')
        .update({
          status: newStatus,
          statusUpdatedAt: new Date().toISOString(),
          statusUpdatedBy: adminEmail
        })
        .eq('responseId', selectedEvent.value.responseId)

      if (error) {
        console.error('Error updating status:', error.message)
        return
      }
      await fetchEvents()
    }

    onMounted(fetchEvents)

    const editedContactDayObj = ref(null)

    const availableTimes = Array.from({ length: 13 * 4 }, (_, i) => {
      const h = 9 + Math.floor(i / 4) // 09:00 → 20:45
      const m = (i % 4) * 15
      return h === 21 ? null : `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    }).filter(Boolean)

    const disableWeekends = (date) => {
      const day = date.getDay()
      return day === 0 || day === 6
    }

    const updateAppointment = async () => {
      const contactDayString = editedContactDayObj.value
        ? editedContactDayObj.value.toISOString().split('T')[0]
        : ''

      const { error } = await supabase
        .from('submissions')
        .update({
          contactDay: contactDayString,
          contactTime: editedContactTime.value
        })
        .eq('responseId', selectedEvent.value.responseId)

      if (error) {
        console.error('Failed to update appointment time:', error.message)
        return
      }

      selectedEvent.value.contactDay = contactDayString
      selectedEvent.value.contactTime = editedContactTime.value
      isEditingAppointment.value = false

      await fetchEvents()
    }

    return {
      // components / ui
      calendarRef,
      calendarOptions,
      showBackButton,
      HeaderMenu,
      menuItems,
      onNavigate,
      onLogout,

      // modal & selection
      selectedEvent,
      showModal,
      closeModal,
      goToPMR,

      // status & formatting
      formatDateTime,
      updateStatus,

      // appointment editing
      isEditingAppointment,
      editedContactDay,
      editedContactTime,
      editedContactDayObj,
      availableTimes,
      disableWeekends,
      updateAppointment,
    }
  }
}
</script>

<style scoped>
/* Base calendar font and size */
:deep(.fc) {
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem; /* text-sm */
}

/* Toolbar polish */
:deep(.fc .fc-toolbar) {
  margin-bottom: 0.75rem;
}
:deep(.fc .fc-toolbar-title) {
  font-weight: 600;
  font-size: 1.125rem; /* text-lg */
}
:deep(.fc .fc-button) {
  border-radius: 0.5rem;        /* rounded-lg */
  border: 1px solid #e5e7eb;    /* gray-200 */
  background: #fff;
  color: #111827;               /* gray-900 */
  padding: 0.375rem 0.75rem;
}
:deep(.fc .fc-button:hover) {
  background: #f3f4f6;          /* gray-100 */
}
:deep(.fc .fc-button-primary:not(:disabled).fc-button-active),
:deep(.fc .fc-button-primary:not(:disabled):active) {
  background: #111827;          /* gray-900 */
  color: #fff;
  border-color: #111827;
}

/* Grid & slots */
:deep(.fc-timegrid-slot) { min-height: 24px !important; }
:deep(.fc-timegrid-slot), :deep(.fc-scrollgrid) { border-color: #e5e7eb !important; }
:deep(.fc-col-header-cell-cushion) { padding: 0.5rem 0; }

/* Month view density + highlight today */
:deep(.fc-daygrid-day-number) {
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}
:deep(.fc-day-today .fc-daygrid-day-number) {
  background: #eef2ff;          /* indigo-50 */
  color: #3730a3;               /* indigo-800 */
}

/* Events */
:deep(.fc-event) { cursor: pointer; border: none; }
:deep(.fc .fc-daygrid-event) { margin: 2px 4px; } /* tidier month chips */
</style>

<style>
/* Status colours */
.event-complete {
  background-color: #22c55e !important; /* green-500 */
  border-color: #22c55e !important;
  color: white !important;
}
.event-rejected {
  background-color: #ef4444 !important; /* red-500 */
  border-color: #ef4444 !important;
  color: white !important;
}
.event-pending {
  background-color: #facc15 !important; /* yellow-400 */
  border-color: #facc15 !important;
  color: black !important;
}
</style>
