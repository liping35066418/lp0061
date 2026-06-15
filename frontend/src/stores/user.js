import { reactive } from 'vue'
import request from '../utils/request'

const user = reactive({
  info: null,
  token: localStorage.getItem('token') || ''
})

export function initUser() {
  const saved = localStorage.getItem('user')
  if (saved) {
    try {
      user.info = JSON.parse(saved)
    } catch (e) {
      user.info = null
    }
  }
  if (user.token) {
    fetchUser()
  }
}

export async function fetchUser() {
  try {
    const res = await request.get('/user')
    if (res.data.code === 0) {
      user.info = res.data.data
      localStorage.setItem('user', JSON.stringify(res.data.data))
    } else {
      clearUser()
    }
  } catch (e) {
    clearUser()
  }
}

export function setUser(token, userInfo) {
  user.token = token
  user.info = userInfo
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(userInfo))
}

export function clearUser() {
  user.token = ''
  user.info = null
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export function isLoggedIn() {
  return !!user.token && !!user.info
}

export function isAdmin() {
  return user.info?.role === 'admin'
}

export default user
