import { createRouter, createWebHashHistory } from 'vue-router'
import MainLayout from '@renderer/layouts/MainLayout.vue'
import Login from '@renderer/pages/auth/Login.vue'
import StudentIndex from '@renderer/pages/students/index/IndexStudent.vue'
import ShowStudent from '@renderer/pages/students/show/ShowStudent.vue'
import EditStudent from '@renderer/pages/students/edit/EditStudent.vue'
import CreateStudent from '@renderer/pages/students/create/CreateStudent.vue'

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
      { path: 'show/:code', name: 'student-show', component: ShowStudent, props: true },
      { path: 'update/:code', name: 'student-edit', component: EditStudent, props: true },
      { path: 'create', name: 'student-create', component: CreateStudent, props: false }
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
