<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2 class="auth-title">登录</h2>
      <p class="auth-subtitle">欢迎回来，登录后参与问答讨论</p>

      <div class="form-item">
        <label>用户名</label>
        <input v-model="form.username" type="text" placeholder="请输入用户名" @keyup.enter="handleLogin" />
      </div>

      <div class="form-item">
        <label>密码</label>
        <input v-model="form.password" type="password" placeholder="请输入密码" @keyup.enter="handleLogin" />
      </div>

      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

      <button class="btn btn-primary btn-block" :disabled="loading" @click="handleLogin">
        {{ loading ? '登录中...' : '登录' }}
      </button>

      <div class="auth-footer">
        还没有账号？<router-link to="/register" class="link">立即注册</router-link>
      </div>

      <div class="hint">
        测试账号：管理员 / 123456 &nbsp;·&nbsp; 张三 / 123456
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import request from '../utils/request'
import { setUser } from '../stores/user'

const router = useRouter()
const route = useRoute()
const form = ref({ username: '', password: '' })
const loading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  if (!form.value.username || !form.value.password) {
    errorMsg.value = '请输入用户名和密码'
    return
  }
  errorMsg.value = ''
  loading.value = true
  try {
    const res = await request.post('/login', form.value)
    if (res.data.code === 0) {
      setUser(res.data.data.token, res.data.data.user)
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    } else {
      errorMsg.value = res.data.message
    }
  } catch (e) {
    errorMsg.value = e.response?.data?.message || '登录失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}

.auth-card {
  width: 400px;
  background-color: #fff;
  border-radius: 8px;
  padding: 40px 36px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.auth-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
  text-align: center;
}

.auth-subtitle {
  font-size: 14px;
  color: #999;
  margin-bottom: 28px;
  text-align: center;
}

.form-item {
  margin-bottom: 18px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
}

.form-item input {
  width: 100%;
}

.error-msg {
  color: #ff4d4f;
  font-size: 13px;
  margin-bottom: 14px;
  padding: 8px 12px;
  background-color: #fff2f0;
  border-radius: 4px;
}

.btn-block {
  width: 100%;
  height: 42px;
  font-size: 15px;
}

.btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 13px;
  color: #666;
}

.link {
  color: #1890ff;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.hint {
  margin-top: 16px;
  padding: 10px 12px;
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 4px;
  font-size: 12px;
  color: #52c41a;
  text-align: center;
}
</style>
