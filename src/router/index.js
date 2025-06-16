import { createRouter, createWebHistory } from 'vue-router'
import AdminLogin from '../views/AdminLogin.vue'

const routes = [
  { path: '/admin/login', name: 'AdminLogin', component: AdminLogin },
  // You can add more routes later like /admin/dashboard
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
