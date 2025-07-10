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
  { path: '/admin/calendar', name: 'AdminCalendar', component: AdminCalendar, meta: { requiresAuth: true } },
  { path: '/reset-password', name: 'ResetPassword', component: ResetPassword },

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const host = window.location.host

  // Enforce subdomain routing
  if (host.startsWith('admin.') && !to.path.startsWith('/admin')) {
    return next('/admin/dashboard')
  }

  if (!host.startsWith('admin.') && to.path.startsWith('/admin')) {
    return next('/') // or redirect to a dedicated /not-authorized route
  }

  // Enforce Supabase Auth on protected routes
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
