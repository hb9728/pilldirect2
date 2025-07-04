import { createRouter, createWebHistory } from 'vue-router'
import AdminLogin from '../views/AdminLogin.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import FormView from '../views/FormView.vue'
import PatientPMR from '../views/PatientPMR.vue'
import { supabase } from '../supabase'
import AdminCalendar from '../views/AdminCalendar.vue'

const routes = [
  { path: '/', component: FormView },
  { path: '/admin/login', component: AdminLogin },
  { path: '/admin/dashboard', component: AdminDashboard, meta: { requiresAuth: true } },
  { path: '/admin/patient', component: PatientPMR, meta: { requiresAuth: true } },
  { path: '/admin/patient/:patientId', component: PatientPMR, props: true, meta: { requiresAuth: true } },
  { path: '/admin/calendar', name: 'AdminCalendar', component: AdminCalendar }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (to.meta.requiresAuth && !session) {
    next('/admin/login')
  } else {
    next()
  }
})

router.beforeEach((to, from, next) => {
  const host = window.location.host

  // Force admin subdomain to only access /admin routes
  if (host.startsWith('admin.') && !to.path.startsWith('/admin')) {
    return next('/admin/dashboard')
  }

  // Prevent access to admin routes from non-admin subdomains
  if (!host.startsWith('admin.') && to.path.startsWith('/admin')) {
    return next('/') // or '/not-authorized' if you want a nicer error
  }

  // Otherwise allow normal navigation
  next()
})

export default router
