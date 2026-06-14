<template>
  <div class="app">
    <header class="header">
      <div class="container header-content">
        <router-link to="/" class="logo">问答社区</router-link>
        <nav class="nav">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/admin" class="nav-link">管理</router-link>
          <router-link to="/admin/stats" class="nav-link">统计</router-link>
        </nav>
        <div class="user-info">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan" class="avatar" />
          <span class="username">张三</span>
        </div>
      </div>
    </header>
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
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

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-size: 14px;
  color: #333;
}

.main {
  padding: 24px 0;
  min-height: calc(100vh - 60px);
}
</style>
