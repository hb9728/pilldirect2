import { createRouter, createWebHistory } from 'vue-router'
import AdminLogin from '../views/AdminLogin.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import FormView from '../views/FormView.vue'
import PatientPMR from '../views/PatientPMR.vue'
import { supabase } from '../supabase'
import AdminCalendar from '../views/AdminCalendar.vue'
import ResetPassword from '../views/ResetPassword.vue'
import AdminAnalytics from '../views/AdminAnalytics.vue'

const routes = [
  { path: '/', component: FormView },
  { path: '/admin/login', component: AdminLogin },
  { path: '/admin/dashboard', component: AdminDashboard, meta: { requiresAuth: true } },
  { path: '/admin/patient', component: PatientPMR, meta: { requiresAuth: true } },
  { path: '/admin/patient/:patientId', component: PatientPMR, props: true, meta: { requiresAuth: true } },
  { path: '/admin/calendar', name: 'AdminCalendar', component: AdminCalendar, meta: { requiresAuth: true } },
  { path: '/reset-password', name: 'ResetPassword', component: ResetPassword },
  { path: '/admin/analytics', name: 'AdminAnalytics', component: AdminAnalytics, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const host = window.location.host

  // ✅ Intercept Supabase recovery redirect and forward it to /reset-password
  if (
    host.startsWith('admin.') &&
    to.path === '/' &&
    window.location.hash.includes('type=recovery')
  ) {
    return next('/reset-password' + window.location.hash)
  }

  // ✅ Allow /reset-password route explicitly
  if (to.path === '/reset-password') return next()

  // 🔐 Enforce subdomain routing
  if (
    host.startsWith('admin.') &&
    !to.path.startsWith('/admin') &&
    to.path !== '/reset-password'
  ) {
    return next('/admin/dashboard')
  }

  if (!host.startsWith('admin.') && to.path.startsWith('/admin')) {
    return next('/')
  }

  // 🔐 Supabase Auth check
  if (to.meta.requiresAuth) {
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session) {
      return next('/admin/login')
    }
  }

  next()
})


export default router
