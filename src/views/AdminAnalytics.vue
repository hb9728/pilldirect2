<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <!-- Header -->
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-semibold">Analytics</h1>
      <select v-model="selectedRange" @change="fetchAnalytics" class="border p-2 rounded">
        <option value="today">Today</option>
        <option value="past_week">Past Week</option>
        <option value="past_month">Past Month</option>
        <option value="month_to_date">Month to Date</option>
        <option value="year_to_date">Year to Date</option>
        <option value="past_year">Past Year</option>
      </select>
    </div>

    <!-- Metric panels -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="bg-white p-4 shadow rounded">
        <h2 class="text-lg font-bold mb-2">Total Submissions</h2>
        <p class="text-3xl">{{ analytics.total }}</p>
      </div>
      <div class="bg-white p-4 shadow rounded">
        <h2 class="text-lg font-bold mb-2">Pending</h2>
        <p class="text-3xl text-yellow-600">{{ analytics.pending }}</p>
      </div>
      <div class="bg-white p-4 shadow rounded">
        <h2 class="text-lg font-bold mb-2">Completed</h2>
        <p class="text-3xl text-green-600">{{ analytics.completed }}</p>
      </div>
      <div class="bg-white p-4 shadow rounded">
        <h2 class="text-lg font-bold mb-2">Rejected</h2>
        <p class="text-3xl text-red-600">{{ analytics.rejected }}</p>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
      <div class="bg-white p-4 shadow rounded">
        <h2 class="text-lg font-bold mb-2">Submissions Over Time</h2>
        <canvas id="lineChart"></canvas>
      </div>
      <div class="bg-white p-4 shadow rounded">
        <h2 class="text-lg font-bold mb-2">Status Breakdown</h2>
        <canvas id="pieChart"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { createClient } from '@supabase/supabase-js'
import Chart from 'chart.js/auto'

// Supabase client
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY)

// Reactive state
const selectedRange = ref('past_week')
const analytics = ref({ total: 0, pending: 0, completed: 0, rejected: 0 })
const timeSeries = ref([])

// Chart instances
let lineChart = null
let pieChart = null

// Fetch & group data
const fetchAnalytics = async () => {
  const { startDate, endDate, interval } = getDateRange(selectedRange.value)

  const { data, error } = await supabase
    .from('submissions')
    .select('status, created_at')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  if (error) {
    console.error(error)
    return
  }

  // Group by status
  analytics.value = {
    total: data.length,
    pending: data.filter(s => s.status === 'Pending').length,
    completed: data.filter(s => s.status === 'Complete').length,
    rejected: data.filter(s => s.status === 'Rejected').length,
  }

  timeSeries.value = getTimeSeriesData(data, startDate, endDate, interval)
  await renderCharts()
}

// Time range helper
const getDateRange = (range) => {
  const now = new Date()
  const start = new Date()
  let interval = 'day'

  switch (range) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      interval = 'hour'
      break
    case 'past_week':
      start.setDate(now.getDate() - 7)
      break
    case 'past_month':
      start.setMonth(now.getMonth() - 1)
      break
    case 'month_to_date':
      start.setDate(1)
      break
    case 'year_to_date':
      start.setMonth(0, 1)
      break
    case 'past_year':
      start.setFullYear(now.getFullYear() - 1)
      interval = 'week'
      break
  }

  return { startDate: start, endDate: now, interval }
}

// Time bucketing helper
const getTimeSeriesData = (data, startDate, endDate, interval) => {
  const map = new Map()

  data.forEach(row => {
    const date = new Date(row.created_at)
    let key

    if (interval === 'hour') {
      key = date.toISOString().slice(0, 13) // YYYY-MM-DDTHH
    } else if (interval === 'day') {
      key = date.toISOString().slice(0, 10) // YYYY-MM-DD
    } else {
      const week = getWeekOfYear(date)
      key = `${date.getFullYear()}-W${week}`
    }

    map.set(key, (map.get(key) || 0) + 1)
  })

  const keys = Array.from(map.keys()).sort()
  return keys.map(k => ({ time: k, count: map.get(k) }))
}

const getWeekOfYear = (date) => {
  const start = new Date(date.getFullYear(), 0, 1)
  const diff = date - start
  return Math.ceil((diff / (1000 * 60 * 60 * 24) + start.getDay() + 1) / 7)
}

// Chart rendering
const renderCharts = async () => {
  await nextTick()

  const line = document.getElementById('lineChart')
  const pie = document.getElementById('pieChart')

  if (!line || !pie) {
    console.warn('Chart canvas not found.')
    return
  }

  // Destroy old instances
  lineChart?.destroy()
  pieChart?.destroy()

  lineChart = new Chart(line, {
    type: 'line',
    data: {
      labels: timeSeries.value.map(t => t.time),
      datasets: [{
        label: 'Submissions',
        data: timeSeries.value.map(t => t.count),
        borderColor: '#3b82f6',
        fill: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  })

  pieChart = new Chart(pie, {
    type: 'pie',
    data: {
      labels: ['Pending', 'Completed', 'Rejected'],
      datasets: [{
        data: [
          analytics.value.pending,
          analytics.value.completed,
          analytics.value.rejected
        ],
        backgroundColor: ['#facc15', '#22c55e', '#ef4444']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  })
}

// Initial mount
onMounted(fetchAnalytics)
watch(selectedRange, fetchAnalytics)
</script>

<style scoped>
canvas {
  width: 100% !important;
  height: 300px !important;
}
</style>
