import { createRouter, createWebHistory } from 'vue-router'
import FormView from '../views/FormView.vue'
import AdminLogin from '../views/AdminLogin.vue'

const routes = [
  { path: '/', component: FormView },
  { path: '/admin/login', component: AdminLogin }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
