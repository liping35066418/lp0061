const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const Database = require('better-sqlite3')
const path = require('path')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const app = express()
const PORT = 8751
const JWT_SECRET = 'qa-community-secret-key-2024'

app.use(cors())
app.use(bodyParser.json())

const db = new Database(path.join(__dirname, 'qa.db'))

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT,
    avatar TEXT,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#1890ff',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    tag_id INTEGER,
    status TEXT DEFAULT 'approved',
    is_pinned INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
  );

  CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    question_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    status TEXT DEFAULT 'approved',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    answer_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(answer_id, user_id),
    FOREIGN KEY (answer_id) REFERENCES answers(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(question_id, user_id),
    FOREIGN KEY (question_id) REFERENCES questions(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`)

try {
  db.prepare('SELECT password FROM users LIMIT 1').get()
} catch (e) {
  db.exec('ALTER TABLE users ADD COLUMN password TEXT')
}

const initData = db.transaction(() => {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count
  if (userCount === 0) {
    const hash = bcrypt.hashSync('123456', 10)
    const insertUser = db.prepare('INSERT INTO users (username, password, avatar, role) VALUES (?, ?, ?, ?)')
    insertUser.run('张三', hash, 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan', 'user')
    insertUser.run('李四', hash, 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi', 'user')
    insertUser.run('王五', hash, 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu', 'user')
    insertUser.run('管理员', hash, 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', 'admin')
  }

  const tagCount = db.prepare('SELECT COUNT(*) as count FROM tags').get().count
  if (tagCount === 0) {
    const insertTag = db.prepare('INSERT INTO tags (name, color) VALUES (?, ?)')
    insertTag.run('技术', '#1890ff')
    insertTag.run('生活', '#52c41a')
    insertTag.run('职场', '#faad14')
    insertTag.run('学习', '#722ed1')
    insertTag.run('娱乐', '#eb2f96')
  }

  const questionCount = db.prepare('SELECT COUNT(*) as count FROM questions').get().count
  if (questionCount === 0) {
    const insertQuestion = db.prepare('INSERT INTO questions (title, content, user_id, tag_id, is_pinned) VALUES (?, ?, ?, ?, ?)')
    insertQuestion.run('如何学习前端开发？', '我是一名初学者，想系统学习前端开发，请问有什么好的学习路线和资源推荐吗？', 1, 1, 1)
    insertQuestion.run('周末有什么好玩的地方推荐？', '想在北京周边找一个适合周末放松的地方，大家有什么好的推荐吗？', 2, 2, 0)
    insertQuestion.run('如何应对职场压力？', '最近工作压力很大，经常加班，感觉身心俱疲，有什么好的调节方法吗？', 3, 3, 0)
    insertQuestion.run('考研还是直接工作？', '马上要毕业了，很纠结是继续考研还是直接找工作，大家给点建议吧', 1, 4, 0)
    insertQuestion.run('最近有什么好看的电视剧？', '剧荒了，求推荐最近好看的电视剧，最好是悬疑或者科幻类型的', 2, 5, 0)
  }

  const answerCount = db.prepare('SELECT COUNT(*) as count FROM answers').get().count
  if (answerCount === 0) {
    const insertAnswer = db.prepare('INSERT INTO answers (content, question_id, user_id) VALUES (?, ?, ?)')
    insertAnswer.run('建议先学习 HTML/CSS/JavaScript 基础，然后再学习 Vue 或 React 框架，可以配合 MDN 和菜鸟教程学习', 1, 2)
    insertAnswer.run('推荐去慕课网或者极客时间买系统课程，跟着做项目进步最快', 1, 3)
    insertAnswer.run('可以去古北水镇，风景很好，人也不会太多，适合放松心情', 2, 1)
    insertAnswer.run('建议多运动，保持规律作息，工作时注意劳逸结合，必要时可以跟领导沟通调整工作量', 3, 1)
  }
})
initData()

const migratePasswords = db.transaction(() => {
  const usersWithoutPwd = db.prepare("SELECT id FROM users WHERE password IS NULL OR password = ''").all()
  if (usersWithoutPwd.length > 0) {
    const hash = bcrypt.hashSync('123456', 10)
    const stmt = db.prepare('UPDATE users SET password = ? WHERE id = ?')
    for (const u of usersWithoutPwd) {
      stmt.run(hash, u.id)
    }
  }
})
migratePasswords()

const authOptional = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      req.userId = decoded.userId
      req.userRole = decoded.role
    } catch (e) {
      req.userId = null
      req.userRole = null
    }
  } else {
    req.userId = null
    req.userRole = null
  }
  next()
}

const authRequired = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return res.status(401).json({ code: 1, message: '未登录，请先登录' })
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.userId
    req.userRole = decoded.role
    next()
  } catch (e) {
    return res.status(401).json({ code: 1, message: '登录已过期，请重新登录' })
  }
}

const adminRequired = (req, res, next) => {
  if (!req.userId) {
    return res.status(401).json({ code: 1, message: '未登录，请先登录' })
  }
  if (req.userRole !== 'admin') {
    return res.status(403).json({ code: 1, message: '无权限访问' })
  }
  next()
}

app.post('/api/register', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.json({ code: 1, message: '用户名和密码不能为空' })
  }
  if (password.length < 6) {
    return res.json({ code: 1, message: '密码长度不能少于6位' })
  }
  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
  if (exists) {
    return res.json({ code: 1, message: '用户名已存在' })
  }
  const hashed = bcrypt.hashSync(password, 10)
  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`
  const result = db.prepare('INSERT INTO users (username, password, avatar, role) VALUES (?, ?, ?, ?)').run(username, hashed, avatar, 'user')
  const token = jwt.sign({ userId: result.lastInsertRowid, role: 'user' }, JWT_SECRET, { expiresIn: '7d' })
  const user = db.prepare('SELECT id, username, avatar, role, created_at FROM users WHERE id = ?').get(result.lastInsertRowid)
  res.json({ code: 0, data: { token, user } })
})

app.post('/api/login', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.json({ code: 1, message: '用户名和密码不能为空' })
  }
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
  if (!user) {
    return res.json({ code: 1, message: '用户名或密码错误' })
  }
  const valid = bcrypt.compareSync(password, user.password)
  if (!valid) {
    return res.json({ code: 1, message: '用户名或密码错误' })
  }
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
  const { password: _, ...safeUser } = user
  res.json({ code: 0, data: { token, user: safeUser } })
})

app.get('/api/user', authOptional, (req, res) => {
  if (!req.userId) {
    return res.json({ code: 1, message: '未登录' })
  }
  const user = db.prepare('SELECT id, username, avatar, role, created_at FROM users WHERE id = ?').get(req.userId)
  if (!user) {
    return res.json({ code: 1, message: '用户不存在' })
  }
  res.json({ code: 0, data: user })
})

app.get('/api/tags', (req, res) => {
  const tags = db.prepare('SELECT * FROM tags ORDER BY id').all()
  res.json({ code: 0, data: tags })
})

app.get('/api/questions', authOptional, (req, res) => {
  const { tagId, sort = 'latest', keyword } = req.query
  let sql = `
    SELECT q.*, u.username, u.avatar, t.name as tag_name, t.color as tag_color,
      (SELECT COUNT(*) FROM answers a WHERE a.question_id = q.id AND a.status = 'approved') as answer_count,
      (SELECT COUNT(*) FROM favorites f WHERE f.question_id = q.id) as favorite_count,
      ${req.userId ? "EXISTS(SELECT 1 FROM favorites f WHERE f.question_id = q.id AND f.user_id = ?)" : "0 as is_favorited"}
    FROM questions q
    LEFT JOIN users u ON q.user_id = u.id
    LEFT JOIN tags t ON q.tag_id = t.id
    WHERE q.status = 'approved'
  `
  const params = req.userId ? [req.userId] : []

  if (tagId && tagId !== 'all') {
    sql += ' AND q.tag_id = ?'
    params.push(tagId)
  }
  if (keyword) {
    sql += ' AND (q.title LIKE ? OR q.content LIKE ?)'
    params.push(`%${keyword}%`, `%${keyword}%`)
  }

  if (sort === 'hot') {
    sql += ' ORDER BY q.is_pinned DESC, answer_count DESC, q.views DESC'
  } else {
    sql += ' ORDER BY q.is_pinned DESC, q.created_at DESC'
  }

  const questions = db.prepare(sql).all(...params)
  res.json({ code: 0, data: questions })
})

app.get('/api/questions/hot', (req, res) => {
  const questions = db.prepare(`
    SELECT q.id, q.title, q.views,
      (SELECT COUNT(*) FROM answers a WHERE a.question_id = q.id AND a.status = 'approved') as answer_count
    FROM questions q
    WHERE q.status = 'approved'
    ORDER BY q.views DESC, answer_count DESC
    LIMIT 5
  `).all()
  res.json({ code: 0, data: questions })
})

app.get('/api/questions/:id', authOptional, (req, res) => {
  const { id } = req.params
  db.prepare('UPDATE questions SET views = views + 1 WHERE id = ?').run(id)

  let sql = `
    SELECT q.*, u.username, u.avatar, t.name as tag_name, t.color as tag_color,
      (SELECT COUNT(*) FROM answers a WHERE a.question_id = q.id AND a.status = 'approved') as answer_count,
      ${req.userId ? "EXISTS(SELECT 1 FROM favorites f WHERE f.question_id = q.id AND f.user_id = ?)" : "0 as is_favorited"}
    FROM questions q
    LEFT JOIN users u ON q.user_id = u.id
    LEFT JOIN tags t ON q.tag_id = t.id
    WHERE q.id = ?
  `
  const params = req.userId ? [req.userId, id] : [id]

  const question = db.prepare(sql).get(...params)

  if (!question) {
    return res.json({ code: 1, message: '问题不存在' })
  }

  let answerSql = `
    SELECT a.*, u.username, u.avatar,
      (SELECT COUNT(*) FROM likes l WHERE l.answer_id = a.id) as like_count,
      ${req.userId ? "EXISTS(SELECT 1 FROM likes l WHERE l.answer_id = a.id AND l.user_id = ?)" : "0 as is_liked"}
    FROM answers a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.question_id = ? AND a.status = 'approved'
    ORDER BY a.created_at DESC
  `
  const answerParams = req.userId ? [req.userId, id] : [id]

  const answers = db.prepare(answerSql).all(...answerParams)

  res.json({ code: 0, data: { ...question, answers } })
})

app.post('/api/questions', authRequired, (req, res) => {
  const { title, content, tagId } = req.body
  if (!title || !content) {
    return res.json({ code: 1, message: '标题和内容不能为空' })
  }
  const result = db.prepare('INSERT INTO questions (title, content, user_id, tag_id) VALUES (?, ?, ?, ?)').run(title, content, req.userId, tagId || null)
  res.json({ code: 0, data: { id: result.lastInsertRowid } })
})

app.post('/api/questions/:id/answers', authRequired, (req, res) => {
  const { id } = req.params
  const { content } = req.body
  if (!content) {
    return res.json({ code: 1, message: '内容不能为空' })
  }
  const result = db.prepare('INSERT INTO answers (content, question_id, user_id) VALUES (?, ?, ?)').run(content, id, req.userId)
  res.json({ code: 0, data: { id: result.lastInsertRowid } })
})

app.post('/api/answers/:id/like', authRequired, (req, res) => {
  const { id } = req.params
  const exists = db.prepare('SELECT id FROM likes WHERE answer_id = ? AND user_id = ?').get(id, req.userId)
  if (exists) {
    db.prepare('DELETE FROM likes WHERE answer_id = ? AND user_id = ?').run(id, req.userId)
    res.json({ code: 0, data: { liked: false } })
  } else {
    db.prepare('INSERT INTO likes (answer_id, user_id) VALUES (?, ?)').run(id, req.userId)
    res.json({ code: 0, data: { liked: true } })
  }
})

app.post('/api/questions/:id/favorite', authRequired, (req, res) => {
  const { id } = req.params
  const exists = db.prepare('SELECT id FROM favorites WHERE question_id = ? AND user_id = ?').get(id, req.userId)
  if (exists) {
    db.prepare('DELETE FROM favorites WHERE question_id = ? AND user_id = ?').run(id, req.userId)
    res.json({ code: 0, data: { favorited: false } })
  } else {
    db.prepare('INSERT INTO favorites (question_id, user_id) VALUES (?, ?)').run(id, req.userId)
    res.json({ code: 0, data: { favorited: true } })
  }
})

app.get('/api/admin/questions', authRequired, adminRequired, (req, res) => {
  const { status, tagId, startDate, endDate } = req.query
  let sql = `
    SELECT q.*, u.username, t.name as tag_name,
      (SELECT COUNT(*) FROM answers a WHERE a.question_id = q.id) as answer_count
    FROM questions q
    LEFT JOIN users u ON q.user_id = u.id
    LEFT JOIN tags t ON q.tag_id = t.id
    WHERE 1=1
  `
  const params = []

  if (status && status !== 'all') {
    sql += ' AND q.status = ?'
    params.push(status)
  }
  if (tagId && tagId !== 'all') {
    sql += ' AND q.tag_id = ?'
    params.push(tagId)
  }
  if (startDate) {
    sql += ' AND q.created_at >= ?'
    params.push(startDate)
  }
  if (endDate) {
    sql += ' AND q.created_at <= ?'
    params.push(endDate + ' 23:59:59')
  }

  sql += ' ORDER BY q.created_at DESC'

  const questions = db.prepare(sql).all(...params)
  res.json({ code: 0, data: questions })
})

app.get('/api/admin/answers', authRequired, adminRequired, (req, res) => {
  const answers = db.prepare(`
    SELECT a.*, u.username, q.title as question_title
    FROM answers a
    LEFT JOIN users u ON a.user_id = u.id
    LEFT JOIN questions q ON a.question_id = q.id
    ORDER BY a.created_at DESC
  `).all()
  res.json({ code: 0, data: answers })
})

app.post('/api/admin/questions/:id/status', authRequired, adminRequired, (req, res) => {
  const { id } = req.params
  const { status } = req.body
  db.prepare('UPDATE questions SET status = ? WHERE id = ?').run(status, id)
  res.json({ code: 0, message: '操作成功' })
})

app.post('/api/admin/questions/:id/pin', authRequired, adminRequired, (req, res) => {
  const { id } = req.params
  const { pinned } = req.body
  db.prepare('UPDATE questions SET is_pinned = ? WHERE id = ?').run(pinned ? 1 : 0, id)
  res.json({ code: 0, message: '操作成功' })
})

app.post('/api/admin/answers/:id/status', authRequired, adminRequired, (req, res) => {
  const { id } = req.params
  const { status } = req.body
  db.prepare('UPDATE answers SET status = ? WHERE id = ?').run(status, id)
  res.json({ code: 0, message: '操作成功' })
})

app.get('/api/admin/stats', authRequired, adminRequired, (req, res) => {
  const totalQuestions = db.prepare('SELECT COUNT(*) as count FROM questions').get().count
  const totalAnswers = db.prepare('SELECT COUNT(*) as count FROM answers').get().count
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count
  const pendingQuestions = db.prepare("SELECT COUNT(*) as count FROM questions WHERE status = 'pending'").get().count
  const pendingAnswers = db.prepare("SELECT COUNT(*) as count FROM answers WHERE status = 'pending'").get().count

  const questionTrend = db.prepare(`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM questions
    WHERE created_at >= DATE('now', '-7 days')
    GROUP BY DATE(created_at)
    ORDER BY date
  `).all()

  const answerTrend = db.prepare(`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM answers
    WHERE created_at >= DATE('now', '-7 days')
    GROUP BY DATE(created_at)
    ORDER BY date
  `).all()

  const activeUsers = db.prepare(`
    SELECT u.id, u.username, u.avatar, COUNT(DISTINCT q.id) as question_count, COUNT(DISTINCT a.id) as answer_count
    FROM users u
    LEFT JOIN questions q ON q.user_id = u.id
    LEFT JOIN answers a ON a.user_id = u.id
    GROUP BY u.id
    ORDER BY (question_count + answer_count) DESC
    LIMIT 5
  `).all()

  res.json({
    code: 0,
    data: {
      totalQuestions,
      totalAnswers,
      totalUsers,
      pendingQuestions,
      pendingAnswers,
      questionTrend,
      answerTrend,
      activeUsers
    }
  })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`后端服务已启动: http://localhost:${PORT}`)
})
