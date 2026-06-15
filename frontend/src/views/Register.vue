<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2 class="auth-title">注册</h2>
      <p class="auth-subtitle">创建账号，加入问答社区</p>

      <div class="form-item">
        <label>用户名</label>
        <input v-model="form.username" type="text" placeholder="请输入用户名" @keyup.enter="handleRegister" />
      </div>

      <div class="form-item">
        <label>密码</label>
        <input v-model="form.password" type="password" placeholder="请输入密码（至少6位）" @keyup.enter="handleRegister" />
      </div>

      <div class="form-item">
        <label>确认密码</label>
        <input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" @keyup.enter="handleRegister" />
      </div>

      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

      <button class="btn btn-primary btn-block" :disabled="loading" @click="handleRegister">
        {{ loading ? '注册中...' : '注册' }}
      </button>

      <div class="auth-footer">
        已有账号？<router-link to="/login" class="link">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import request from '../utils/request'
import { setUser } from '../stores/user'

const router = useRouter()
const form = ref({ username: '', password: '', confirmPassword: '' })
const loading = ref(false)
const errorMsg = ref('')

const handleRegister = async () => {
  if (!form.value.username || !form.value.password) {
    errorMsg.value = '请输入用户名和密码'
    return
  }
  if (form.value.password.length < 6) {
    errorMsg.value = '密码长度不能少于6位'
    return
  }
  if (form.value.password !== form.value.confirmPassword) {
    errorMsg.value = '两次输入的密码不一致'
    return
  }
  errorMsg.value = ''
  loading.value = true
  try {
    const res = await request.post('/register', {
      username: form.value.username,
      password: form.value.password
    })
    if (res.data.code === 0) {
      setUser(res.data.data.token, res.data.data.user)
      router.push('/')
    } else {
      errorMsg.value = res.data.message
    }
  } catch (e) {
    errorMsg.value = e.response?.data?.message || '注册失败，请重试'
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
</style>
