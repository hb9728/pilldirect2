<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold">Booking Calendar</h1>
      <div class="flex items-center gap-4">
        <button
          @click="router.push('/admin/dashboard')"
          class="bg-gray-100 hover:bg-gray-200 text-sm px-4 py-2 rounded border"
        >
          ← Back to Dashboard
        </button>
        <button
          @click="logout"
          class="text-red-600 text-sm hover:underline"
        >
          Logout
        </button>
      </div>
    </div>

    <div class="bg-white rounded shadow w-full overflow-auto">
      <FullCalendar
        :plugins="[dayGridPlugin, timeGridPlugin]"
        initial-view="timeGridWeek"
        :events="events"
        :slot-min-time="'09:00:00'"
        :slot-max-time="'17:00:00'"
        :all-day-slot="false"
        :event-time-format="{ hour: '2-digit', minute: '2-digit', hour12: false }"
        :height="700"
      />
    </div>
  </div>
</template>

<script setup>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'

// ✅ Correct CSS imports (safe for modern versions)
import '@fullcalendar/common/main.css'
import '@fullcalendar/daygrid/main.css'
import '@fullcalendar/timegrid/main.css'

import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { DateTime } from 'luxon'
import { useRouter } from 'vue-router'

const router = useRouter()
const events = ref([])

const logout = async () => {
  await supabase.auth.signOut()
  router.replace('/admin/login')
  location.reload()
}

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    router.replace('/admin/login')
    return
  }

  const { data, error } = await supabase
    .from('submissions')
    .select('firstName, lastName, contactDay, contactTime, status, responseId')

  if (error) {
    console.error('Error fetching events:', error)
    return
  }

  const dayMap = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5
  }

  const today = DateTime.now().setZone('Europe/London')
  const nextWeekStart = today.startOf('week').plus({ weeks: 1 })

  events.value = data
    .filter(row => row.contactDay && row.contactTime && dayMap[row.contactDay])
    .map(row => {
      const dayNum = dayMap[row.contactDay]
      const eventDate = nextWeekStart.set({ weekday: dayNum })
      const [hour, minute] = row.contactTime.split(':')
      const start = eventDate.set({ hour: +hour, minute: +minute })
      const end = start.plus({ minutes: 15 })

      let color = '#facc15' // Pending
      if (row.status === 'Complete') color = '#4ade80'
      if (row.status === 'Rejected') color = '#f87171'

      return {
        id: row.responseId,
        title: `${row.firstName} ${row.lastName}`,
        start: start.toISO(),
        end: end.toISO(),
        backgroundColor: color,
        borderColor: color
      }
    })

  console.log('📅 Loaded events:', events.value)
})
</script>
