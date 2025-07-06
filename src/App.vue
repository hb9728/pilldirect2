<template>
  <router-view />
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from './supabase'

export default {
  setup() {
    const router = useRouter()
    let idleTimer = null
    let logoutTimer = null

    const IDLE_LIMIT_MS = 15 * 60 * 1000 // 15 minutes
    const ABSOLUTE_LIMIT_MS = 8 * 60 * 60 * 1000 // 8 hours

    const resetIdleTimer = () => {
      if (idleTimer) clearTimeout(idleTimer)
      idleTimer = setTimeout(handleIdleLogout, IDLE_LIMIT_MS)
    }

    const handleIdleLogout = async () => {
      await supabase.auth.signOut()
      router.push('/admin/login')
      alert('You have been logged out due to inactivity.')
    }

    const startAbsoluteTimer = () => {
      logoutTimer = setTimeout(async () => {
        await supabase.auth.signOut()
        router.push('/admin/login')
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
      // Only run on authenticated admin subdomain
      const host = window.location.host
      if (!host.startsWith('admin.')) return

      addActivityListeners()
      resetIdleTimer()
      startAbsoluteTimer()
    })

    onBeforeUnmount(() => {
      clearTimeout(idleTimer)
      clearTimeout(logoutTimer)
      removeActivityListeners()
    })
  }
}
</script>
