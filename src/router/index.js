import { createRouter, createWebHistory } from 'vue-router'
import AdminLogin from '../views/AdminLogin.vue'
import FormView from '../App.vue' // Your form lives in App.vue

const routes = [
  { path: '/', component: FormView },
  { path: '/admin/login', component: AdminLogin }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
