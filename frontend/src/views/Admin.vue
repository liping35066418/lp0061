<template>
  <div class="container admin">
    <h1 class="page-title">内容管理</h1>

    <div class="tabs">
      <span
        class="tab"
        :class="{ active: activeTab === 'questions' }"
        @click="activeTab = 'questions'"
      >问题管理</span>
      <span
        class="tab"
        :class="{ active: activeTab === 'answers' }"
        @click="activeTab = 'answers'; loadAnswers()"
      >回答管理</span>
    </div>

    <div v-if="activeTab === 'questions'" class="filter-bar">
      <div class="filter-group">
        <label>状态</label>
        <select v-model="filters.status" class="filter-select" @change="loadQuestions">
          <option value="all">全部</option>
          <option value="approved">已通过</option>
          <option value="pending">待审核</option>
          <option value="blocked">已屏蔽</option>
        </select>
      </div>
      <div class="filter-group">
        <label>标签</label>
        <select v-model="filters.tagId" class="filter-select" @change="loadQuestions">
          <option value="all">全部</option>
          <option v-for="tag in tags" :key="tag.id" :value="tag.id">{{ tag.name }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label>开始日期</label>
        <input v-model="filters.startDate" type="date" class="filter-input" @change="loadQuestions" />
      </div>
      <div class="filter-group">
        <label>结束日期</label>
        <input v-model="filters.endDate" type="date" class="filter-input" @change="loadQuestions" />
      </div>
    </div>

    <div v-if="activeTab === 'questions'" class="card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>标题</th>
            <th>提问人</th>
            <th>分类</th>
            <th>回答数</th>
            <th>状态</th>
            <th>置顶</th>
            <th>发布时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="q in questions" :key="q.id">
            <td>{{ q.id }}</td>
            <td class="title-cell">{{ q.title }}</td>
            <td>{{ q.username }}</td>
            <td>
              <span v-if="q.tag_name" class="tag" :style="{ backgroundColor: getTagColor(q.tag_name) }">
                {{ q.tag_name }}
              </span>
            </td>
            <td>{{ q.answer_count }}</td>
            <td>
              <span class="status-badge" :class="'status-' + q.status">
                {{ getStatusText(q.status) }}
              </span>
            </td>
            <td>
              <button
                class="btn btn-sm"
                :class="q.is_pinned ? 'btn-success' : 'btn-default'"
                @click="togglePin(q)"
              >
                {{ q.is_pinned ? '已置顶' : '置顶' }}
              </button>
            </td>
            <td>{{ formatDate(q.created_at) }}</td>
            <td>
              <div class="action-buttons">
                <button
                  v-if="q.status !== 'approved'"
                  class="btn btn-sm btn-success"
                  @click="updateQuestionStatus(q, 'approved')"
                >通过</button>
                <button
                  v-if="q.status !== 'blocked'"
                  class="btn btn-sm btn-danger"
                  @click="updateQuestionStatus(q, 'blocked')"
                >屏蔽</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="questions.length === 0" class="empty">暂无数据</div>
    </div>

    <div v-if="activeTab === 'answers'" class="card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>内容</th>
            <th>回答人</th>
            <th>所属问题</th>
            <th>状态</th>
            <th>发布时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in answers" :key="a.id">
            <td>{{ a.id }}</td>
            <td class="content-cell">{{ a.content }}</td>
            <td>{{ a.username }}</td>
            <td class="title-cell">{{ a.question_title }}</td>
            <td>
              <span class="status-badge" :class="'status-' + a.status">
                {{ getStatusText(a.status) }}
              </span>
            </td>
            <td>{{ formatDate(a.created_at) }}</td>
            <td>
              <div class="action-buttons">
                <button
                  v-if="a.status !== 'approved'"
                  class="btn btn-sm btn-success"
                  @click="updateAnswerStatus(a, 'approved')"
                >通过</button>
                <button
                  v-if="a.status !== 'blocked'"
                  class="btn btn-sm btn-danger"
                  @click="updateAnswerStatus(a, 'blocked')"
                >屏蔽</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="answers.length === 0" class="empty">暂无数据</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../utils/request'

const activeTab = ref('questions')
const questions = ref([])
const answers = ref([])
const tags = ref([])
const filters = ref({
  status: 'all',
  tagId: 'all',
  startDate: '',
  endDate: ''
})

const tagColors = {
  '技术': '#1890ff',
  '生活': '#52c41a',
  '职场': '#faad14',
  '学习': '#722ed1',
  '娱乐': '#eb2f96'
}

const getTagColor = (name) => tagColors[name] || '#1890ff'

const getStatusText = (status) => {
  const map = {
    approved: '已通过',
    pending: '待审核',
    blocked: '已屏蔽'
  }
  return map[status] || status
}

const formatDate = (time) => {
  return new Date(time).toLocaleString()
}

const loadQuestions = async () => {
  const res = await request.get('/admin/questions', {
    params: filters.value
  })
  if (res.data.code === 0) {
    questions.value = res.data.data
  }
}

const loadAnswers = async () => {
  const res = await request.get('/admin/answers')
  if (res.data.code === 0) {
    answers.value = res.data.data
  }
}

const loadTags = async () => {
  const res = await request.get('/tags')
  if (res.data.code === 0) {
    tags.value = res.data.data
  }
}

const updateQuestionStatus = async (q, status) => {
  const res = await request.post(`/admin/questions/${q.id}/status`, { status })
  if (res.data.code === 0) {
    q.status = status
  }
}

const togglePin = async (q) => {
  const res = await request.post(`/admin/questions/${q.id}/pin`, { pinned: !q.is_pinned })
  if (res.data.code === 0) {
    q.is_pinned = q.is_pinned ? 0 : 1
  }
}

const updateAnswerStatus = async (a, status) => {
  const res = await request.post(`/admin/answers/${a.id}/status`, { status })
  if (res.data.code === 0) {
    a.status = status
  }
}

onMounted(() => {
  loadQuestions()
  loadTags()
})
</script>

<style scoped>
.page-title {
  font-size: 22px;
  margin-bottom: 20px;
  color: #333;
}

.tabs {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.tab {
  cursor: pointer;
  color: #666;
  font-size: 15px;
  padding: 12px 0;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.tab.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
}

.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-size: 13px;
  color: #666;
}

.filter-select,
.filter-input {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 13px;
  outline: none;
  background-color: #fff;
}

.filter-select:focus,
.filter-input:focus {
  border-color: #1890ff;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th,
.admin-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
}

.admin-table th {
  background-color: #fafafa;
  font-weight: 600;
  color: #333;
}

.admin-table tbody tr:hover {
  background-color: #fafafa;
}

.title-cell {
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.content-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-approved {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-pending {
  background-color: #fffbe6;
  color: #faad14;
}

.status-blocked {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.empty {
  text-align: center;
  padding: 40px 0;
  color: #999;
}
</style>
