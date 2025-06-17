import { createRouter, createWebHistory } from 'vue-router'
import AdminLogin from '../views/AdminLogin.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import FormView from '../views/FormView.vue'
import PatientPMR from '../views/PatientPMR.vue'

const routes = [
  { path: '/', component: FormView },
  { path: '/admin/login', component: AdminLogin },
  { path: '/admin/dashboard', component: AdminDashboard },
  { path: '/admin/patient/:patientId', component: PatientPMR, props: true } 
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
