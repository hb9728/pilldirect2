<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-xl font-semibold">Booking Calendar</h1>
      <div class="flex space-x-2">
        <RouterLink to="/admin/dashboard">
          <button class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">← Back to Dashboard</button>
        </RouterLink>
        <button @click="logout" class="text-red-600 hover:underline">Logout</button>
      </div>
    </div>

    <!-- Calendar -->
    <FullCalendar ref="fullCalendar" :options="calendarOptions" />
  </div>
</template>

<script>
import { ref } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useRouter } from 'vue-router'

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
      events: [
        // Simple test event to confirm it's working
        { title: 'Test Event', start: new Date().toISOString().slice(0, 10) }
      ]
    })

    const logout = () => {
      localStorage.removeItem('accessToken')
      router.push('/admin/login')
    }

    return {
      calendarOptions,
      logout
    }
  }
}
</script>
