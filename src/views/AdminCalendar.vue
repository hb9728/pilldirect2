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

  <!-- Legend -->
<div class="mt-4 text-sm flex gap-4 text-gray-700">
  <div class="flex items-center gap-2">
    <span class="w-3 h-3 bg-yellow-400 rounded-full"></span> Pending
  </div>
  <div class="flex items-center gap-2">
    <span class="w-3 h-3 bg-green-500 rounded-full"></span> Complete
  </div>
  <div class="flex items-center gap-2">
    <span class="w-3 h-3 bg-red-500 rounded-full"></span> Rejected
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

export default {
  components: {
    FullCalendar
  },
  setup() {
    const router = useRouter()

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
      events: [] // populated on mount
    })

    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('firstName, lastName, contactDay, contactTime, status')

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
          ? '#22c55e'   // Tailwind green-500
          : sub.status === 'Rejected'
          ? '#ef4444'   // Tailwind red-500
          : '#facc15'   // Tailwind yellow-400 (Pending)
    }
  })

      calendarOptions.value.events = bookings
    }

    const logout = () => {
      localStorage.removeItem('accessToken')
      router.push('/admin/login')
    }

    onMounted(fetchEvents)

    return {
      calendarOptions,
      logout
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
</style>
