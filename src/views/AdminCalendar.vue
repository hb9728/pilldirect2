<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold mb-4">Booking Calendar</h1>
    <FullCalendar
      :plugins="[dayGridPlugin, timeGridPlugin]"
      initial-view="timeGridWeek"
      :events="events"
      :slot-min-time="'09:00:00'"
      :slot-max-time="'17:00:00'"
      :all-day-slot="false"
      :eventTimeFormat="{ hour: '2-digit', minute: '2-digit', hour12: false }"
      height="auto"
    />
  </div>
</template>

<script setup>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { DateTime } from 'luxon'
import { useRouter } from 'vue-router'

const router = useRouter()
const events = ref([])

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
  const nextWeekStart = today.startOf('week').plus({ weeks: 1 }) // upcoming Monday

  events.value = data
    .filter(row => row.contactDay && row.contactTime && dayMap[row.contactDay])
    .map(row => {
      const dayNum = dayMap[row.contactDay]
      const eventDate = nextWeekStart.set({ weekday: dayNum })
      const [hour, minute] = row.contactTime.split(':')
      const start = eventDate.set({ hour: +hour, minute: +minute })
      const end = start.plus({ minutes: 15 })

      let color = '#facc15' // yellow for Pending
      if (row.status === 'Complete') color = '#4ade80' // green
      if (row.status === 'Rejected') color = '#f87171' // red

      return {
        id: row.responseId,
        title: `${row.firstName} ${row.lastName}`,
        start: start.toISO(),
        end: end.toISO(),
        backgroundColor: color,
        borderColor: color
      }
    })
})
</script>

<style scoped>
/* Optional: tweak calendar UI here if needed */
</style>
