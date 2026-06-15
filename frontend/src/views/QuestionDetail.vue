<template>
  <div class="container detail">
    <button class="btn btn-default back-btn" @click="goBack">
      ← 返回列表
    </button>

    <div v-if="question" class="question-card card">
      <div class="question-header">
        <img :src="question.avatar" class="avatar-lg" />
        <div class="user-meta">
          <span class="username">{{ question.username }}</span>
          <span class="time">{{ formatTime(question.created_at) }}</span>
        </div>
        <span v-if="question.tag_name" class="tag" :style="{ backgroundColor: question.tag_color }">
          {{ question.tag_name }}
        </span>
      </div>
      <h1 class="question-title">{{ question.title }}</h1>
      <p class="question-content">{{ question.content }}</p>
      <div class="question-stats">
        <span>{{ question.views }} 浏览</span>
        <span>{{ question.answer_count }} 回答</span>
        <button
          class="favorite-btn"
          :class="{ active: question.is_favorited }"
          @click="toggleFavorite"
        >
          <svg viewBox="64 64 896 896" width="16" height="16" :fill="question.is_favorited ? '#eb2f96' : '#999'">
            <path d="M856 400c-24.3 0-46.8 8.9-64.4 23.7-18.5-94.9-103.9-167.7-207.6-167.7-68.2 0-127.2 32.1-166.5 83.3C386.2 265.4 314.6 232 236 232 134.5 232 52 314.5 52 416c0 185.3 292.4 383.3 429.2 466.5 7.8 4.8 17.8 4.8 25.6 0C643.6 799.3 936 601.3 936 416c0-8.8-7.2-16-16-16h-64z"/>
          </svg>
          {{ question.is_favorited ? '已收藏' : '收藏' }}
        </button>
      </div>
    </div>

    <div class="card answer-section">
      <h3 class="section-title">写回答</h3>
      <textarea
        v-model="newAnswer"
        class="answer-input"
        placeholder="请输入你的回答..."
      ></textarea>
      <div class="submit-row">
        <button class="btn btn-primary" @click="submitAnswer">提交回答</button>
      </div>
    </div>

    <div class="answers-list">
      <h3 class="section-title answer-count">{{ question?.answer_count || 0 }} 个回答</h3>
      <div
        v-for="answer in answers"
        :key="answer.id"
        class="answer-card card"
      >
        <div class="answer-header">
          <img :src="answer.avatar" class="avatar" />
          <div class="user-meta">
            <span class="username">{{ answer.username }}</span>
            <span class="time">{{ formatTime(answer.created_at) }}</span>
          </div>
        </div>
        <p class="answer-content">{{ answer.content }}</p>
        <div class="answer-footer">
          <button
            class="like-btn"
            :class="{ active: answer.is_liked }"
            @click="toggleLike(answer)"
          >
            <svg viewBox="64 64 896 896" width="16" height="16" :fill="answer.is_liked ? '#1890ff' : '#999'">
              <path d="M885.9 765.9c7.5-20.7 7.5-43.1 0-63.8L755.2 279.1c-14-39.3-52.4-65.9-95.1-66.4l-109.2-1.1c-11.1 0-20.6 8.4-21.5 19.4l-11.5 139.8H163.2c-13.3 0-24 10.7-24 23.9l-25.2 320.5c0 13.2 10.7 23.9 24 23.9h589.8c2.6 0 5.1 0 7.6-0.2l106 54.6c19.4 9.4 42.3 3.1 54.9-15.6 6.7-9.9 10.1-21.9 9.6-33.9z"/>
            </svg>
            {{ answer.like_count }} 赞同
          </button>
        </div>
      </div>

      <div v-if="answers.length === 0" class="empty">
        暂无回答，快来抢沙发吧~
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const question = ref(null)
const answers = ref([])
const newAnswer = ref('')

const loadQuestion = async () => {
  const res = await request.get(`/questions/${route.params.id}`)
  if (res.data.code === 0) {
    question.value = res.data.data
    answers.value = res.data.data.answers
  }
}

const toggleFavorite = async () => {
  const res = await axios.post(`/api/questions/${question.value.id}/favorite`)
  if (res.data.code === 0) {
    question.value.is_favorited = res.data.data.favorited
  }
}

const toggleLike = async (answer) => {
  const res = await axios.post(`/api/answers/${answer.id}/like`)
  if (res.data.code === 0) {
    answer.is_liked = res.data.data.liked
    answer.like_count += res.data.data.liked ? 1 : -1
  }
}

const submitAnswer = async () => {
  if (!newAnswer.value.trim()) {
    alert('请输入回答内容')
    return
  }
  const res = await request.post(`/questions/${question.value.id}/answers`, {
    content: newAnswer.value
  })
  if (res.data.code === 0) {
    newAnswer.value = ''
    loadQuestion()
  }
}

const goBack = () => {
  router.push('/')
}

const formatTime = (time) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  return date.toLocaleDateString()
}

onMounted(() => {
  loadQuestion()
})
</script>

<style scoped>
.back-btn {
  margin-bottom: 16px;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.avatar-lg {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.user-meta {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.username {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.time {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.question-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 16px;
  font-weight: 600;
}

.question-content {
  color: #555;
  font-size: 15px;
  line-height: 1.8;
  margin-bottom: 20px;
}

.question-stats {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  color: #999;
  font-size: 13px;
}

.favorite-btn {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  color: #999;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.favorite-btn:hover {
  background-color: #f5f5f5;
}

.favorite-btn.active {
  color: #eb2f96;
}

.answer-section {
  margin-top: 16px;
}

.section-title {
  font-size: 16px;
  margin-bottom: 16px;
  color: #333;
}

.answer-input {
  width: 100%;
  min-height: 120px;
  margin-bottom: 12px;
}

.submit-row {
  display: flex;
  justify-content: flex-end;
}

.answers-list {
  margin-top: 16px;
}

.answer-count {
  margin-bottom: 12px;
  font-size: 16px;
  color: #333;
}

.answer-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.answer-content {
  color: #555;
  font-size: 14px;
  line-height: 1.8;
  margin-bottom: 12px;
}

.answer-footer {
  display: flex;
  align-items: center;
  gap: 12px;
}

.like-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  color: #999;
  padding: 4px 10px;
  border-radius: 4px;
  transition: all 0.3s;
}

.like-btn:hover {
  background-color: #f0f7ff;
}

.like-btn.active {
  color: #1890ff;
}

.empty {
  text-align: center;
  padding: 60px 0;
  color: #999;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
</style>
