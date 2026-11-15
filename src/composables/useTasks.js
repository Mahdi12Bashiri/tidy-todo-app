import { ref, computed, watch } from 'vue'

// Same key as v1: new fields (description, category) are additive and
// sanitized in load(), so existing task data is preserved.
const STORAGE_KEY = 'tidy-tasks-v1'
export const PRIORITIES = ['low', 'medium', 'high']
export const PRIORITY_WEIGHT = { high: 3, medium: 2, low: 1 }
export const DEFAULT_CATEGORIES = ['Work', 'Personal', 'Errands', 'Health']
export const LIMITS = { title: 200, description: 2000, category: 30 }

export const STATUS_FILTERS = [
  { id: 'all', label: 'All tasks', short: 'All' },
  { id: 'active', label: 'Active', short: 'Active' },
  { id: 'completed', label: 'Completed', short: 'Done' },
  { id: 'today', label: 'Due today', short: 'Today' },
  { id: 'upcoming', label: 'Upcoming', short: 'Upcoming' },
  { id: 'overdue', label: 'Overdue', short: 'Overdue' },
]

export const SORT_OPTIONS = [
  { id: 'smart', label: 'Smart' },
  { id: 'due', label: 'Due date' },
  { id: 'priority', label: 'Priority' },
  { id: 'created', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
]

/** How many days ahead count as "upcoming". */
export const UPCOMING_DAYS = 7

const uid = () =>
  crypto.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2)

/** Local-time YYYY-MM-DD for a Date. */
export function toISODate(d) {
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d - tz).toISOString().slice(0, 10)
}

export function todayISO(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return toISODate(d)
}

export function isValidISODate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const d = new Date(s + 'T00:00:00')
  return !Number.isNaN(d.getTime()) && toISODate(d) === s
}

function seed() {
  const now = Date.now()
  return [
    { title: 'Welcome to Tidy — click a task to see its details', description: 'Every task has its own page with a description, category and history. Use Edit to change anything.', priority: 'medium', dueDate: '', category: 'Personal', completed: false },
    { title: 'Plan the week ahead', description: 'Block focus time and list the three outcomes that matter most.', priority: 'high', dueDate: todayISO(0), category: 'Work', completed: false },
    { title: 'Review pull requests', description: '', priority: 'medium', dueDate: todayISO(1), category: 'Work', completed: false },
    { title: 'Book dentist appointment', description: '', priority: 'low', dueDate: todayISO(5), category: 'Health', completed: false },
    { title: 'Try dark mode in Settings', description: '', priority: 'low', dueDate: '', category: 'Personal', completed: true },
  ].map((t, i) => ({ id: uid(), createdAt: now - i * 1000, completedAt: t.completed ? now : null, ...t }))
}

function sanitize(t) {
  const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '')
  const completed = !!t.completed
  return {
    id: typeof t.id === 'string' && t.id ? t.id : uid(),
    title: t.title.trim().slice(0, LIMITS.title) || 'Untitled task',
    description: str(t.description, LIMITS.description),
    priority: PRIORITIES.includes(t.priority) ? t.priority : 'medium',
    dueDate: typeof t.dueDate === 'string' && isValidISODate(t.dueDate) ? t.dueDate : '',
    category: str(t.category, LIMITS.category).trim(),
    completed,
    createdAt: Number(t.createdAt) || Date.now(),
    completedAt: completed ? Number(t.completedAt) || Number(t.createdAt) || Date.now() : null,
  }
}

/** Sanitize an arbitrary array (from storage or an import file). */
export function sanitizeList(parsed) {
  if (!Array.isArray(parsed)) return []
  return parsed.filter((t) => t && typeof t.title === 'string').map(sanitize)
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return seed()
    return sanitizeList(JSON.parse(raw))
  } catch {
    return []
  }
}

// Module-level singleton so every component shares the same state.
const tasks = ref(load())

// Write the sanitized list back immediately so generated ids (and seed tasks)
// are stable across reloads; otherwise task URLs could stop resolving.
try {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks.value))
} catch {}

watch(
  tasks,
  (val) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    } catch {}
  },
  { deep: true },
)

// Keep multiple tabs in sync.
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) tasks.value = load()
})

// ---------- Pure helpers ----------

export function isOverdue(task) {
  return !task.completed && !!task.dueDate && task.dueDate < todayISO()
}
export function isDueToday(task) {
  return !task.completed && task.dueDate === todayISO()
}
export function isUpcoming(task) {
  return !task.completed && !!task.dueDate && task.dueDate > todayISO() && task.dueDate <= todayISO(UPCOMING_DAYS)
}

const STATUS_TEST = {
  all: () => true,
  active: (t) => !t.completed,
  completed: (t) => t.completed,
  today: isDueToday,
  upcoming: isUpcoming,
  overdue: isOverdue,
}

const byDue = (a, b) => {
  if (!a.dueDate && !b.dueDate) return 0
  if (!a.dueDate) return 1
  if (!b.dueDate) return -1
  return a.dueDate.localeCompare(b.dueDate)
}
const byPriority = (a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]
const byCreated = (a, b) => b.createdAt - a.createdAt

export function sortTasks(list, sort = 'smart') {
  return [...list].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    if (sort === 'due') return byDue(a, b) || byPriority(a, b) || byCreated(a, b)
    if (sort === 'priority') return byPriority(a, b) || byDue(a, b) || byCreated(a, b)
    if (sort === 'created') return byCreated(a, b)
    if (sort === 'oldest') return -byCreated(a, b)
    // smart: overdue first, then due date, then priority
    return isOverdue(b) - isOverdue(a) || byDue(a, b) || byPriority(a, b) || byCreated(a, b)
  })
}

/** Filter + sort a task list. All criteria are optional. */
export function queryTasks(list, { status = 'all', priority = 'any', category = 'any', search = '', sort = 'smart' } = {}) {
  const q = search.trim().toLowerCase()
  const test = STATUS_TEST[status] ?? STATUS_TEST.all
  const filtered = list.filter((t) => {
    if (!test(t)) return false
    if (priority !== 'any' && t.priority !== priority) return false
    if (category !== 'any' && t.category !== category) return false
    if (q && !t.title.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q) && !t.category.toLowerCase().includes(q)) return false
    return true
  })
  return sortTasks(filtered, sort)
}

// ---------- Store API ----------

const stats = computed(() => {
  const list = tasks.value
  const total = list.length
  const completed = list.filter((t) => t.completed).length
  return {
    total,
    completed,
    remaining: total - completed,
    overdue: list.filter(isOverdue).length,
    dueToday: list.filter(isDueToday).length,
    upcoming: list.filter(isUpcoming).length,
    progress: total ? Math.round((completed / total) * 100) : 0,
  }
})

const statusCounts = computed(() =>
  Object.fromEntries(STATUS_FILTERS.map((f) => [f.id, tasks.value.filter(STATUS_TEST[f.id]).length])),
)

const categories = computed(() => {
  const set = new Set(tasks.value.map((t) => t.category).filter(Boolean))
  return [...set].sort((a, b) => a.localeCompare(b))
})

function getTask(id) {
  return tasks.value.find((t) => t.id === id) ?? null
}

function addTask({ title, description = '', priority = 'medium', dueDate = '', category = '' }) {
  const clean = (title ?? '').trim()
  if (!clean) return null
  const task = sanitize({ title: clean, description, priority, dueDate, category, completed: false, createdAt: Date.now() })
  tasks.value.unshift(task)
  return task
}

function updateTask(id, patch) {
  const t = getTask(id)
  if (!t) return
  const next = { ...patch }
  if (next.title !== undefined) {
    next.title = next.title.trim()
    if (!next.title) delete next.title
  }
  if (next.category !== undefined) next.category = next.category.trim()
  Object.assign(t, next)
}

function setCompleted(id, completed) {
  const t = getTask(id)
  if (!t || t.completed === completed) return
  t.completed = completed
  t.completedAt = completed ? Date.now() : null
}

function toggleTask(id) {
  const t = getTask(id)
  if (t) setCompleted(id, !t.completed)
  return t
}

function deleteTask(id) {
  const i = tasks.value.findIndex((t) => t.id === id)
  if (i === -1) return null
  return tasks.value.splice(i, 1)[0]
}

function restoreTask(task) {
  if (!getTask(task.id)) tasks.value.unshift(task)
}

function clearCompleted() {
  const removed = tasks.value.filter((t) => t.completed)
  tasks.value = tasks.value.filter((t) => !t.completed)
  return removed
}

function clearAll() {
  const removed = tasks.value
  tasks.value = []
  return removed
}

function replaceAll(list) {
  tasks.value = list
}

export function useTasks() {
  return {
    tasks,
    stats,
    statusCounts,
    categories,
    getTask,
    addTask,
    updateTask,
    setCompleted,
    toggleTask,
    deleteTask,
    restoreTask,
    clearCompleted,
    clearAll,
    replaceAll,
  }
}
