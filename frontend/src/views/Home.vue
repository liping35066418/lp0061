<template>
  <div class="container home">
    <div class="home-layout">
      <div class="main-content">
        <div class="top-bar">
          <input
            v-model="keyword"
            type="text"
            class="search-input"
            placeholder="搜索问题..."
            @keyup.enter="loadQuestions"
          />
          <button class="btn btn-primary" @click="showAskModal = true">
            + 发布问题
          </button>
        </div>

        <div class="sort-tabs">
          <span
            class="tab"
            :class="{ active: sort === 'latest' }"
            @click="sort = 'latest'; loadQuestions()"
          >最新</span>
          <span
            class="tab"
            :class="{ active: sort === 'hot' }"
            @click="sort = 'hot'; loadQuestions()"
          >热门</span>
        </div>

        <div class="question-list">
          <div
            v-for="q in questions"
            :key="q.id"
            class="question-card card"
            @click="goToDetail(q.id)"
          >
            <div class="card-header">
              <img :src="q.avatar" class="avatar" />
              <div class="user-meta">
                <span class="username">{{ q.username }}</span>
                <span class="time">{{ formatTime(q.created_at) }}</span>
              </div>
              <span v-if="q.is_pinned" class="pin-tag">置顶</span>
              <span v-if="q.tag_name" class="tag" :style="{ backgroundColor: q.tag_color }">
                {{ q.tag_name }}
              </span>
            </div>
            <h3 class="card-title">{{ q.title }}</h3>
            <p class="card-content">{{ q.content }}</p>
            <div class="card-footer">
              <span class="stat">
                <svg viewBox="64 64 896 896" width="14" height="14" fill="#999">
                  <path d="M795 888H152a32 32 0 01-32-32V214a32 32 0 0132-32h643a32 32 0 0132 32v642a32 32 0 01-32 32z m-648-72h618V246H147z m438-114H240c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h345c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8z m0-188H240c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h345c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8z"/>
                </svg>
                {{ q.answer_count }} 回答
              </span>
              <span class="stat">
                <svg viewBox="64 64 896 896" width="14" height="14" fill="#999">
                  <path d="M856 400c-24.3 0-46.8 8.9-64.4 23.7-18.5-94.9-103.9-167.7-207.6-167.7-68.2 0-127.2 32.1-166.5 83.3C386.2 265.4 314.6 232 236 232 134.5 232 52 314.5 52 416c0 185.3 292.4 383.3 429.2 466.5 7.8 4.8 17.8 4.8 25.6 0C643.6 799.3 936 601.3 936 416c0-8.8-7.2-16-16-16h-64z"/>
                </svg>
                {{ q.favorite_count }} 收藏
              </span>
              <span class="stat">
                <svg viewBox="64 64 896 896" width="14" height="14" fill="#999">
                  <path d="M928 648h-72a32 32 0 01-32-32V440c0-4.4 3.6-8 8-8h72c4.4 0 8 3.6 8 8v168c0 17.7-14.3 32-32 32zM785.7 417.6L512 684.6 238.3 417.6A40 40 0 10181.7 475L489 776.8a8 8 0 0011.3 0L842.3 475a40 40 0 00-56.6-57.4z"/>
                </svg>
                {{ q.views }} 浏览
              </span>
              <span
                v-if="q.is_favorited"
                class="favorited"
                @click.stop="toggleFavorite(q)"
              >已收藏</span>
              <span
                v-else
                class="favorite-btn"
                @click.stop="toggleFavorite(q)"
              >收藏</span>
            </div>
          </div>

          <div v-if="questions.length === 0" class="empty">
            暂无问题
          </div>
        </div>
      </div>

      <div class="sidebar">
        <div class="card tags-section">
          <h3 class="section-title">分类标签</h3>
          <div class="tag-list">
            <span
              class="tag-item"
              :class="{ active: selectedTag === 'all' }"
              @click="selectedTag = 'all'; loadQuestions()"
            >全部</span>
            <span
              v-for="tag in tags"
              :key="tag.id"
              class="tag-item"
              :class="{ active: selectedTag === tag.id }"
              :style="selectedTag === tag.id ? { backgroundColor: tag.color, color: '#fff' } : {}"
              @click="selectedTag = tag.id; loadQuestions()"
            >{{ tag.name }}</span>
          </div>
        </div>

        <div class="card hot-section">
          <h3 class="section-title">热门推荐</h3>
          <div class="hot-list">
            <div
              v-for="(item, index) in hotQuestions"
              :key="item.id"
              class="hot-item"
              @click="goToDetail(item.id)"
            >
              <span class="rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
              <span class="hot-title">{{ item.title }}</span>
              <span class="hot-count">{{ item.answer_count }}回答</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAskModal" class="modal-mask" @click.self="showAskModal = false">
      <div class="modal">
        <h3 class="modal-title">发布问题</h3>
        <div class="form-item">
          <label>标题</label>
          <input v-model="newQuestion.title" type="text" placeholder="请输入问题标题" />
        </div>
        <div class="form-item">
          <label>分类</label>
          <select v-model="newQuestion.tagId" class="select-input">
            <option :value="null">选择分类</option>
            <option v-for="tag in tags" :key="tag.id" :value="tag.id">{{ tag.name }}</option>
          </select>
        </div>
        <div class="form-item">
          <label>内容</label>
          <textarea v-model="newQuestion.content" placeholder="请详细描述你的问题"></textarea>
        </div>
        <div class="modal-footer">
          <button class="btn btn-default" @click="showAskModal = false">取消</button>
          <button class="btn btn-primary" @click="submitQuestion">发布</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '../utils/request'

const router = useRouter()
const questions = ref([])
const tags = ref([])
const hotQuestions = ref([])
const selectedTag = ref('all')
const sort = ref('latest')
const keyword = ref('')
const showAskModal = ref(false)
const newQuestion = ref({
  title: '',
  content: '',
  tagId: null
})

const loadQuestions = async () => {
  const res = await request.get('/questions', {
    params: {
      tagId: selectedTag.value,
      sort: sort.value,
      keyword: keyword.value
    }
  })
  if (res.data.code === 0) {
    questions.value = res.data.data
  }
}

const loadTags = async () => {
  const res = await request.get('/tags')
  if (res.data.code === 0) {
    tags.value = res.data.data
  }
}

const loadHotQuestions = async () => {
  const res = await request.get('/questions/hot')
  if (res.data.code === 0) {
    hotQuestions.value = res.data.data
  }
}

const toggleFavorite = async (q) => {
  const res = await request.post(`/questions/${q.id}/favorite`)
  if (res.data.code === 0) {
    q.is_favorited = res.data.data.favorited
    q.favorite_count += res.data.data.favorited ? 1 : -1
  }
}

const submitQuestion = async () => {
  if (!newQuestion.value.title || !newQuestion.value.content) {
    alert('请填写标题和内容')
    return
  }
  const res = await request.post('/questions', newQuestion.value)
  if (res.data.code === 0) {
    showAskModal.value = false
    newQuestion.value = { title: '', content: '', tagId: null }
    loadQuestions()
  }
}

const goToDetail = (id) => {
  router.push(`/question/${id}`)
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
  loadQuestions()
  loadTags()
  loadHotQuestions()
})
</script>

<style scoped>
.home-layout {
  display: flex;
  gap: 24px;
}

.main-content {
  flex: 1;
}

.sidebar {
  width: 300px;
  flex-shrink: 0;
}

.top-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.search-input {
  flex: 1;
  max-width: 400px;
}

.sort-tabs {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.tab {
  cursor: pointer;
  color: #666;
  font-size: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.tab.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
}

.question-card {
  cursor: pointer;
  transition: box-shadow 0.3s;
}

.question-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
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
}

.pin-tag {
  background-color: #ff4d4f;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.card-title {
  font-size: 18px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 600;
}

.card-content {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  gap: 20px;
  align-items: center;
  color: #999;
  font-size: 13px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
}

.favorite-btn {
  margin-left: auto;
  color: #1890ff;
  cursor: pointer;
}

.favorited {
  margin-left: auto;
  color: #52c41a;
  cursor: pointer;
}

.empty {
  text-align: center;
  padding: 60px 0;
  color: #999;
}

.section-title {
  font-size: 16px;
  margin-bottom: 16px;
  color: #333;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  padding: 4px 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
  color: #666;
}

.tag-item:hover {
  opacity: 0.8;
}

.tag-item.active {
  background-color: #1890ff;
  color: #fff;
}

.hot-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hot-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px 0;
}

.hot-item:hover .hot-title {
  color: #1890ff;
}

.rank {
  width: 20px;
  height: 20px;
  background-color: #f5f5f5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #999;
  font-weight: bold;
}

.rank-1 {
  background-color: #ff4d4f;
  color: #fff;
}

.rank-2 {
  background-color: #fa8c16;
  color: #fff;
}

.rank-3 {
  background-color: #fadb14;
  color: #fff;
}

.hot-title {
  flex: 1;
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.3s;
}

.hot-count {
  font-size: 12px;
  color: #999;
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background-color: #fff;
  border-radius: 8px;
  width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
}

.modal-title {
  font-size: 18px;
  margin-bottom: 20px;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
}

.form-item input,
.form-item textarea,
.select-input {
  width: 100%;
}

.select-input {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  outline: none;
  background-color: #fff;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
</style>
