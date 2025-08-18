import { createRouter, createWebHistory } from 'vue-router'
import AdminLogin from '../views/AdminLogin.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import FormView from '../views/FormView.vue'
import PatientPMR from '../views/PatientPMR.vue'
import { supabase } from '../supabase'
import AdminCalendar from '../views/AdminCalendar.vue'
import ResetPassword from '../views/ResetPassword.vue'
import AdminAnalytics from '../views/AdminAnalytics.vue'
import Login from '../views/Login.vue'
import Account from '../views/Account.vue'
import MySubmissions from '../views/MySubmissions.vue'
import RequestNext from '../views/RequestNext.vue'

const routes = [
  // PUBLIC FORM (served on form.pilldirect.co.uk)
  { path: '/', component: FormView },

  // ADMIN
  { path: '/admin/login', component: AdminLogin },
  { path: '/admin/dashboard', component: AdminDashboard, meta: { requiresAuth: true } },
  { path: '/admin/patient', component: PatientPMR, meta: { requiresAuth: true } },
  { path: '/admin/patient/:patientId', component: PatientPMR, props: true, meta: { requiresAuth: true } },
  { path: '/admin/calendar', name: 'AdminCalendar', component: AdminCalendar, meta: { requiresAuth: true } },
  { path: '/admin/analytics', name: 'AdminAnalytics', component: AdminAnalytics, meta: { requiresAuth: true } },

  // ADMIN password reset (special flow)
  { path: '/reset-password', name: 'ResetPassword', component: ResetPassword },

  // PATIENT PORTAL (served on user.pilldirect.co.uk)
  { path: '/login', component: Login },
  { path: '/account', component: Account, meta: { requiresAuth: true } },
  { path: '/me/submissions', component: MySubmissions, meta: { requiresAuth: true } },
  { path: '/request-next', component: RequestNext, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const host = window.location.host
  const isAdminHost = host.startsWith('admin.')
  const isFormHost  = host.startsWith('form.')
  const isUserHost  = host.startsWith('user.')
  const isAdminRoute = to.path.startsWith('/admin')

  // --- 0) Special: admin password recovery (Supabase sends tokens in hash) ---
  if (isAdminHost && to.path === '/' && window.location.hash.includes('type=recovery')) {
    return next('/reset-password' + window.location.hash)
  }

  // Allow reset-password always
  if (to.path === '/reset-password') return next()

  // Collect whether we have magic-link tokens (patient portal)
  const hasSupabaseTokens =
    window.location.hash.includes('access_token') ||
    window.location.hash.includes('refresh_token') ||
    window.location.hash.includes('type=magiclink')

  // --- 1) Enforce subdomain ↔ route pairing ---

  // Admin host only serves /admin/*
  if (isAdminHost && !isAdminRoute && to.path !== '/reset-password') {
    return next('/admin/dashboard')
  }

  // Non-admin hosts should not serve /admin/*
  if (!isAdminHost && isAdminRoute) {
    // If a user hits an admin route on user/form host, bounce to form root
    return next('/')
  }

  // Form host = consultation only (no login/account UI here)
  if (isFormHost) {
    if (
      to.path === '/login' ||
      to.path.startsWith('/account') ||
      to.path.startsWith('/me/') ||
      to.path.startsWith('/request-next')
    ) {
      // Send patient portal paths to the user host
      return window.location.replace('https://user.pilldirect.co.uk' + to.fullPath)
    }
    // otherwise allow (your form lives at /)
    return next()
  }

  // User host = patient portal
  if (isUserHost) {
    // Nice default: root goes to /login
    if (to.path === '/') return next('/login')
  }

  // If someone opens /login on the wrong host, forward to user host
  if (!isUserHost && to.path === '/login') {
    return window.location.replace('https://user.pilldirect.co.uk/login')
  }

  // --- 2) Auth gates with correct login target per host ---
  if (to.meta?.requiresAuth) {
    const { data: { session } } = await supabase.auth.getSession()

    // Patient portal (user host)
    if (isUserHost) {
      if (!session) {
        // Let Supabase finish magic-link on /account once
        if (to.path === '/account' && hasSupabaseTokens) return next()
        return next('/login')
      }
      return next()
    }

    // Admin portal (admin host)
    if (isAdminHost) {
      if (!session) return next('/admin/login')
      return next()
    }

    // If neither user/admin host (e.g., someone hits form host protected route), just send home
    return next('/')
  }

  // --- 3) Default allow for any public route ---
  return next()
})

export default router
