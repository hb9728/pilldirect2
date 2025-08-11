<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <button
          class="px-3 py-2 rounded border hover:bg-gray-100"
          @click="$router.back()"
          aria-label="Back"
        >
          ← Back
        </button>
        <h1 class="text-2xl font-semibold">Analytics</h1>
      </div>

      <div class="flex items-center gap-2">
        <!-- Range selector -->
        <select v-model="selectedRange" @change="handleRangeChange" class="border p-2 rounded">
          <option value="today">Today</option>
          <option value="past_week">Past Week</option>
          <option value="past_month">Past Month</option>
          <option value="month_to_date">Month to Date</option>
          <option value="year_to_date">Year to Date</option>
          <option value="past_year">Past Year</option>
          <option value="custom">Custom…</option>
        </select>

        <button
          class="px-3 py-2 rounded border hover:bg-gray-100"
          @click="fetchAnalytics"
          :disabled="loading"
        >
          {{ loading ? 'Refreshing…' : 'Refresh' }}
        </button>

        <!-- Menu -->
        <div class="relative" @keydown.escape="menuOpen = false">
          <button
            class="px-3 py-2 rounded border hover:bg-gray-100"
            @click="menuOpen = !menuOpen"
            aria-haspopup="menu"
            aria-expanded="menuOpen ? 'true' : 'false'"
          >
            ☰ Menu
          </button>
          <div
            v-if="menuOpen"
            class="absolute right-0 mt-2 w-44 bg-white border rounded shadow z-10"
            @click="menuOpen = false"
          >
            <button class="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm" @click="$router.push('/admin/dashboard')">
              Dashboard
            </button>
            <button class="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm" @click="$router.push('/admin/calendar')">
              Calendar
            </button>
            <button class="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm font-semibold" @click="$router.push('/admin/analytics')">
              Analytics
            </button>
            <div class="h-px bg-gray-200 my-1"></div>
            <button class="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600" @click="logout">
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom range picker -->
    <div v-if="selectedRange === 'custom'" class="mb-4 flex items-center gap-3">
      <Datepicker
        v-model="customRange"
        range
        :enable-time-picker="false"
        :clearable="false"
        input-class-name="border rounded p-2 w-72"
        :max-date="new Date()"
        placeholder="Select custom date range"
        @update:model-value="onCustomRangePicked"
      />
      <button class="px-3 py-2 rounded border hover:bg-gray-100" @click="fetchAnalytics" :disabled="!hasValidCustomRange || loading">
        Apply
      </button>
    </div>

    <!-- Meta -->
    <div class="text-sm text-gray-500 mb-3" v-if="lastRefreshed">
      Showing: <span class="font-medium">{{ activeRangeLabel }}</span>
      <span class="mx-2">•</span>
      Last refreshed: {{ lastRefreshed }}
    </div>

    <!-- Loading / empty -->
    <div v-if="loading" class="text-gray-500">Loading analytics…</div>

    <div v-else>
      <div v-if="analytics.total === 0" class="text-gray-500">
        No submissions in this period.
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

      <p class="text-sm text-gray-400 mt-6">Charts are disabled in this version.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { createClient } from '@supabase/supabase-js'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY)

const menuOpen = ref(false)
const loading = ref(false)
const selectedRange = ref('past_week')
const customRange = ref(null) // [startDate, endDate]
const lastRefreshed = ref('')

const analytics = ref({
  total: 0,
  pending: 0,
  completed: 0,
  rejected: 0,
})

const hasValidCustomRange = computed(() => {
  return Array.isArray(customRange.value) && customRange.value.length === 2 && customRange.value[0] && customRange.value[1]
})

const activeRangeLabel = computed(() => {
  const map = {
    today: 'Today',
    past_week: 'Past 7 days',
    past_month: 'Past 30 days',
    month_to_date: 'Month to date',
    year_to_date: 'Year to date',
    past_year: 'Past 12 months',
    custom: hasValidCustomRange.value ? `${fmt(customRange.value[0])} → ${fmt(customRange.value[1])}` : 'Custom range'
  }
  return map[selectedRange.value] || 'Range'
})

function fmt(d) {
  const date = new Date(d)
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}

function handleRangeChange() {
  if (selectedRange.value !== 'custom') {
    customRange.value = null
    fetchAnalytics()
  }
}

function onCustomRangePicked() {
  // user will click Apply -> fetchAnalytics
}

function getRangeDates(range) {
  const now = new Date()
  const start = new Date()
  const end = new Date()

  switch (range) {
    case 'today':
      start.setHours(0,0,0,0); end.setHours(23,59,59,999); break
    case 'past_week':
      start.setDate(now.getDate() - 6); start.setHours(0,0,0,0); end.setHours(23,59,59,999); break
    case 'past_month':
      start.setDate(now.getDate() - 29); start.setHours(0,0,0,0); end.setHours(23,59,59,999); break
    case 'month_to_date':
      start.setDate(1); start.setHours(0,0,0,0); end.setHours(23,59,59,999); break
    case 'year_to_date':
      start.setMonth(0,1); start.setHours(0,0,0,0); end.setHours(23,59,59,999); break
    case 'past_year':
      start.setFullYear(now.getFullYear() - 1); start.setHours(0,0,0,0); end.setHours(23,59,59,999); break
    case 'custom':
      if (hasValidCustomRange.value) {
        const s = new Date(customRange.value[0]); s.setHours(0,0,0,0)
        const e = new Date(customRange.value[1]); e.setHours(23,59,59,999)
        return { startDate: s, endDate: e }
      }
      // Fallback to past_week if custom not valid
      start.setDate(now.getDate() - 6); start.setHours(0,0,0,0); end.setHours(23,59,59,999); break
  }
  return { startDate: start, endDate: end }
}

async function fetchAnalytics() {
  loading.value = true
  try {
    const { startDate, endDate } = getRangeDates(selectedRange.value)

    // Pull only needed fields
    const { data, error } = await supabase
      .from('submissions')
      .select('status, created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (error) throw error

    const pending = data.filter(s => s.status === 'Pending').length
    const completed = data.filter(s => s.status === 'Complete' || s.status === 'Completed').length
    const rejected = data.filter(s => s.status === 'Rejected').length

    analytics.value = {
      total: data.length,
      pending,
      completed,
      rejected,
    }

    lastRefreshed.value = new Date().toLocaleString()
  } catch (err) {
    console.error('Analytics fetch failed:', err)
    analytics.value = { total: 0, pending: 0, completed: 0, rejected: 0 }
  } finally {
    loading.value = false
  }
}

async function logout() {
  try { await supabase.auth.signOut() } catch (_) {}
  window.location.href = '/admin/login'
}

onMounted(fetchAnalytics)
</script>
