import { createRouter, createWebHashHistory } from 'vue-router'
import MainLayout from '@renderer/layouts/MainLayout.vue'
import Login from '@renderer/pages/auth/Login.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [{ path: '', name: 'login', component: Login }]
    // component: Login
  }
]
export const router = createRouter({
  history: createWebHashHistory(),
  routes: routes
})
