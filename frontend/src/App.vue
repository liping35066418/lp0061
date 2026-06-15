<template>
  <div class="app">
    <header class="header">
      <div class="container header-content">
        <router-link to="/" class="logo">问答社区</router-link>
        <nav class="nav">
          <router-link to="/" class="nav-link">首页</router-link>
          <template v-if="isAdmin">
            <router-link to="/admin" class="nav-link">管理</router-link>
            <router-link to="/admin/stats" class="nav-link">统计</router-link>
          </template>
        </nav>
        <div class="user-info">
          <template v-if="user.info">
            <img :src="user.info.avatar" class="avatar" />
            <span class="username">{{ user.info.username }}</span>
            <span v-if="isAdmin" class="admin-tag">管理员</span>
            <button class="logout-btn" @click="handleLogout">退出</button>
          </template>
          <template v-else>
            <router-link to="/login" class="nav-link">登录</router-link>
            <router-link to="/register" class="nav-link register-link">注册</router-link>
          </template>
        </div>
      </div>
    </header>
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import user, { initUser, clearUser, isAdmin as checkAdmin } from './stores/user'

const router = useRouter()

const isAdmin = computed(() => checkAdmin())

const handleLogout = () => {
  clearUser()
  router.push('/login')
}

onMounted(() => {
  initUser()
})
</script>

<style scoped>
.header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.logo {
  font-size: 22px;
  font-weight: bold;
  color: #1890ff;
  text-decoration: none;
}

.nav {
  display: flex;
  gap: 24px;
}

.nav-link {
  text-decoration: none;
  color: #666;
  font-size: 15px;
  transition: color 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #1890ff;
}

.register-link {
  color: #1890ff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.username {
  font-size: 14px;
  color: #333;
}

.admin-tag {
  font-size: 11px;
  color: #ff4d4f;
  background-color: #fff1f0;
  padding: 2px 6px;
  border-radius: 4px;
}

.logout-btn {
  background: none;
  border: none;
  color: #999;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.logout-btn:hover {
  background-color: #f5f5f5;
  color: #ff4d4f;
}

.main {
  padding: 24px 0;
  min-height: calc(100vh - 60px);
}
</style>
