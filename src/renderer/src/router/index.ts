import { createRouter, createWebHashHistory } from 'vue-router'
import MainLayout from '@renderer/layouts/MainLayout.vue'
import Login from '@renderer/pages/auth/Login.vue'
import StudentIndex from '@renderer/pages/students/IndexStudent.vue'
import ShowStudent from '@renderer/pages/students/ShowStudent.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [{ path: '', name: 'login', component: Login }]
  },
  {
    path: '/students',
    component: MainLayout,
    children: [
      { path: 'index', name: 'student-index', component: StudentIndex },
      { path: 'show/:code', name: 'student-show', component: ShowStudent, props: true }
    ]
  }
]
export const router = createRouter({
  history: createWebHashHistory(),
  routes: routes
})

router.afterEach(() => {
  document.title = 'HIS | Student tracker'
})
