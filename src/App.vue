<template>
  <router-view />
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from './supabase'

const router = useRouter()

let idleTimer
let logoutTimer

const IDLE_LIMIT_MS = 15 * 60 * 1000 // 15 minutes
const ABSOLUTE_LIMIT_MS = 1 * 60 * 1000 // 8 hours

const resetIdleTimer = () => {
  clearTimeout(idleTimer)
  idleTimer = setTimeout(handleIdleLogout, IDLE_LIMIT_MS)
}

const handleIdleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/admin/login?expired=1')
  alert('You have been logged out due to inactivity.')
}

const startAbsoluteTimer = () => {
  logoutTimer = setTimeout(async () => {
    await supabase.auth.signOut()
    router.push('/admin/login?expired=1')
    alert('Your session has expired (8 hours).')
  }, ABSOLUTE_LIMIT_MS)
}

const addActivityListeners = () => {
  window.addEventListener('mousemove', resetIdleTimer)
  window.addEventListener('keydown', resetIdleTimer)
  window.addEventListener('click', resetIdleTimer)
  window.addEventListener('touchstart', resetIdleTimer)
}

const removeActivityListeners = () => {
  window.removeEventListener('mousemove', resetIdleTimer)
  window.removeEventListener('keydown', resetIdleTimer)
  window.removeEventListener('click', resetIdleTimer)
  window.removeEventListener('touchstart', resetIdleTimer)
}

onMounted(() => {
  const host = window.location.host
  if (!host.startsWith('admin.')) return

  addActivityListeners()
  resetIdleTimer()
  startAbsoluteTimer()
})

onUnmounted(() => {
  clearTimeout(idleTimer)
  clearTimeout(logoutTimer)
  removeActivityListeners()
})
</script>
