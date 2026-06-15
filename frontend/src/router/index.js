import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import QuestionDetail from '../views/QuestionDetail.vue'
import Admin from '../views/Admin.vue'
import AdminStats from '../views/AdminStats.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import { isLoggedIn, isAdmin, initUser } from '../stores/user'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/question/:id', name: 'QuestionDetail', component: QuestionDetail },
  { path: '/login', name: 'Login', component: Login, meta: { public: true } },
  { path: '/register', name: 'Register', component: Register, meta: { public: true } },
  { path: '/admin', name: 'Admin', component: Admin, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/stats', name: 'AdminStats', component: AdminStats, meta: { requiresAuth: true, requiresAdmin: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

let userInited = false

router.beforeEach(async (to, from, next) => {
  if (!userInited) {
    initUser()
    userInited = true
  }

  if (to.meta.public) {
    if (isLoggedIn() && (to.name === 'Login' || to.name === 'Register')) {
      return next('/')
    }
    return next()
  }

  if (to.meta.requiresAuth && !isLoggedIn()) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }

  if (to.meta.requiresAdmin && !isAdmin()) {
    return next('/')
  }

  next()
})

export default router
