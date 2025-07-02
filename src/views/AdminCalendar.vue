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

    <div class="bg-white rounded-lg shadow border border-gray-200 p-4">
      <FullCalendar ref="fullCalendar" :options="calendarOptions" />
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
      allDaySlot: false,
      height: 'auto',
      eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      },
      events: [] // initially empty
    })

    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('firstName, lastName, contactDay, contactTime, status')

      if (error) {
        console.error('Error fetching bookings:', error)
        return
      }

      // Convert to FullCalendar format
      const bookings = data
        .filter(sub => sub.contactDay && sub.contactTime)
        .map(sub => {
          const start = `${sub.contactDay}T${sub.contactTime}`
          return {
            title: `${sub.firstName} ${sub.lastName}`,
            start,
            end: new Date(new Date(start).getTime() + 15 * 60000).toISOString(), // 15 min slot
            color:
              sub.status === 'Complete'
                ? '#16a34a'
                : sub.status === 'Rejected'
                ? '#dc2626'
                : '#2563eb'
          }
        })

      calendarOptions.value.events = bookings
    }

    const logout = () => {
      localStorage.removeItem('accessToken')
      router.push('/admin/login')
    }

    onMounted(() => {
      fetchEvents()
    })

    return {
      calendarOptions,
      logout
    }
  }
}
</script>
