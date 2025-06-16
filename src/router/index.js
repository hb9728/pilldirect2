import { createRouter, createWebHistory } from 'vue-router'
import AdminLogin from '../views/AdminLogin.vue'

const routes = [
  { path: '/admin/login', name: 'AdminLogin', component: AdminLogin },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
