<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <!-- Header -->
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-semibold">Analytics (Dummy)</h1>
      <select v-model="selectedRange" class="border p-2 rounded">
        <option value="today">Today</option>
        <option value="past_week">Past Week</option>
        <option value="past_month">Past Month</option>
        <option value="month_to_date">Month to Date</option>
        <option value="year_to_date">Year to Date</option>
        <option value="past_year">Past Year</option>
      </select>
    </div>

    <!-- Grid of metrics -->
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
</template>

<script setup>
import { ref, onMounted } from 'vue'

console.log('👀 AdminAnalytics.vue loaded')

const selectedRange = ref('past_week')

const analytics = ref({
  total: 42,
  pending: 15,
  completed: 23,
  rejected: 4
})

onMounted(() => {
  console.log('✅ Dummy analytics loaded:', analytics.value)
})
</script>
