<template>
  <div class="container stats">
    <h1 class="page-title">数据统计</h1>

    <div class="stat-cards">
      <div class="stat-card card stat-card-blue">
        <div class="stat-icon">📝</div>
        <div class="stat-info">
          <div class="stat-label">总提问数</div>
          <div class="stat-value">{{ stats.totalQuestions || 0 }}</div>
        </div>
      </div>
      <div class="stat-card card stat-card-green">
        <div class="stat-icon">💬</div>
        <div class="stat-info">
          <div class="stat-label">总回答数</div>
          <div class="stat-value">{{ stats.totalAnswers || 0 }}</div>
        </div>
      </div>
      <div class="stat-card card stat-card-purple">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <div class="stat-label">注册用户</div>
          <div class="stat-value">{{ stats.totalUsers || 0 }}</div>
        </div>
      </div>
      <div class="stat-card card stat-card-orange">
        <div class="stat-icon">⏳</div>
        <div class="stat-info">
          <div class="stat-label">待审核内容</div>
          <div class="stat-value">{{ (stats.pendingQuestions || 0) + (stats.pendingAnswers || 0) }}</div>
        </div>
      </div>
    </div>

    <div class="charts-row">
      <div class="chart-card card">
        <h3 class="chart-title">近7天提问趋势</h3>
        <div class="bar-chart">
          <div
            v-for="item in questionTrendData"
            :key="item.date"
            class="bar-item"
          >
            <div class="bar-wrapper">
              <div
                class="bar bar-blue"
                :style="{ height: item.height + '%' }"
              >
                <span class="bar-label">{{ item.count }}</span>
              </div>
            </div>
            <div class="bar-date">{{ item.dateLabel }}</div>
          </div>
        </div>
      </div>

      <div class="chart-card card">
        <h3 class="chart-title">近7天回答趋势</h3>
        <div class="bar-chart">
          <div
            v-for="item in answerTrendData"
            :key="item.date"
            class="bar-item"
          >
            <div class="bar-wrapper">
              <div
                class="bar bar-green"
                :style="{ height: item.height + '%' }"
              >
                <span class="bar-label">{{ item.count }}</span>
              </div>
            </div>
            <div class="bar-date">{{ item.dateLabel }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card active-users-card">
      <h3 class="chart-title">活跃用户排行</h3>
      <div class="active-users-list">
        <div
          v-for="(user, index) in stats.activeUsers || []"
          :key="user.id"
          class="active-user-item"
        >
          <span class="user-rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
          <img :src="user.avatar" class="user-avatar" />
          <span class="user-name">{{ user.username }}</span>
          <div class="user-stats">
            <span class="user-stat">
              <span class="stat-dot stat-dot-blue"></span>
              {{ user.question_count }} 提问
            </span>
            <span class="user-stat">
              <span class="stat-dot stat-dot-green"></span>
              {{ user.answer_count }} 回答
            </span>
          </div>
          <div class="user-total">
            共 {{ user.question_count + user.answer_count }} 条
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import request from '../utils/request'

const stats = ref({})

const questionTrendData = computed(() => {
  const data = stats.value.questionTrend || []
  const days = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const found = data.find(d => d.date === dateStr)
    days.push({
      date: dateStr,
      dateLabel: `${date.getMonth() + 1}/${date.getDate()}`,
      count: found ? found.count : 0
    })
  }
  const maxCount = Math.max(...days.map(d => d.count), 1)
  return days.map(d => ({
    ...d,
    height: Math.max((d.count / maxCount) * 100, d.count > 0 ? 5 : 0)
  }))
})

const answerTrendData = computed(() => {
  const data = stats.value.answerTrend || []
  const days = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const found = data.find(d => d.date === dateStr)
    days.push({
      date: dateStr,
      dateLabel: `${date.getMonth() + 1}/${date.getDate()}`,
      count: found ? found.count : 0
    })
  }
  const maxCount = Math.max(...days.map(d => d.count), 1)
  return days.map(d => ({
    ...d,
    height: Math.max((d.count / maxCount) * 100, d.count > 0 ? 5 : 0)
  }))
})

const loadStats = async () => {
  const res = await request.get('/admin/stats')
  if (res.data.code === 0) {
    stats.value = res.data.data
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.page-title {
  font-size: 22px;
  margin-bottom: 20px;
  color: #333;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.stat-icon {
  font-size: 36px;
}

.stat-label {
  font-size: 13px;
  color: #999;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.stat-card-blue .stat-value { color: #1890ff; }
.stat-card-green .stat-value { color: #52c41a; }
.stat-card-purple .stat-value { color: #722ed1; }
.stat-card-orange .stat-value { color: #fa8c16; }

.charts-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.chart-card {
  padding: 24px;
}

.chart-title {
  font-size: 16px;
  color: #333;
  margin-bottom: 24px;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 220px;
  padding-top: 20px;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.bar-wrapper {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bar {
  width: 32px;
  border-radius: 4px 4px 0 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 4px;
  transition: height 0.5s ease;
  min-height: 4px;
}

.bar-blue {
  background: linear-gradient(180deg, #1890ff 0%, #91d5ff 100%);
}

.bar-green {
  background: linear-gradient(180deg, #52c41a 0%, #b7eb8f 100%);
}

.bar-label {
  font-size: 11px;
  color: #fff;
  font-weight: 500;
}

.bar-date {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.active-users-card {
  padding: 24px;
}

.active-users-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.active-user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background-color: #fafafa;
  border-radius: 8px;
}

.user-rank {
  width: 24px;
  height: 24px;
  background-color: #f0f0f0;
  border-radius: 50%;
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

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  width: 100px;
}

.user-stats {
  flex: 1;
  display: flex;
  gap: 20px;
}

.user-stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

.stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.stat-dot-blue {
  background-color: #1890ff;
}

.stat-dot-green {
  background-color: #52c41a;
}

.user-total {
  font-size: 14px;
  font-weight: 600;
  color: #1890ff;
}

@media (max-width: 1024px) {
  .stat-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  .charts-row {
    grid-template-columns: 1fr;
  }
}
</style>
