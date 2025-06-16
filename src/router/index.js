import { createRouter, createWebHistory } from 'vue-router'
import FormView from '../views/FormView.vue'
import AdminLogin from '../views/AdminLogin.vue'

const routes = [
  { path: '/', component: FormView },              // root = your form view
  { path: '/admin/login', component: AdminLogin }  // admin login route
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
