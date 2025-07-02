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

const events = ref([])

onMounted(async () => {
  const { data, error } = await supabase
    .from('submissions')
    .select('firstName, lastName, contactDay, contactTime')

  if (error) {
    console.error('Error fetching events:', error)
    return
  }

  events.value = data
    .filter(row => row.contactDay && row.contactTime)
    .map(row => ({
      title: `${row.firstName} ${row.lastName}`,
      start: `${row.contactDay}T${row.contactTime}`,
      end: `${row.contactDay}T${row.contactTime}`, // you can extend time later
    }))
})
</script>
