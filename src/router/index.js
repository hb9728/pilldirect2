import { createRouter, createWebHistory } from 'vue-router'
import AdminLogin from '../views/AdminLogin.vue'

const routes = [
  { path: '/admin/login', component: AdminLogin },
  // Later we’ll add: { path: '/admin/dashboard', component: AdminDashboard }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
