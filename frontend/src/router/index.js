import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import QuestionDetail from '../views/QuestionDetail.vue'
import Admin from '../views/Admin.vue'
import AdminStats from '../views/AdminStats.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/question/:id', name: 'QuestionDetail', component: QuestionDetail },
  { path: '/admin', name: 'Admin', component: Admin },
  { path: '/admin/stats', name: 'AdminStats', component: AdminStats }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
