import { reactive, watch } from 'vue'
import { SORT_OPTIONS } from './useTasks'

const KEY = 'tidy-settings-v1'

const DEFAULTS = {
  defaultSort: 'smart', // one of SORT_OPTIONS
  defaultView: 'list', // list | grid
  weekStartsOn: 1, // 0 = Sunday, 1 = Monday
  notifications: {
    completionToasts: true, // toast with undo after completing a task
    overdueBanner: true, // dashboard banner when tasks are overdue
    dailyDigest: false, // browser notification with today's tasks, once per day
  },
  lastDigest: '', // YYYY-MM-DD the digest was last shown
}

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}') || {}
    return {
      defaultSort: SORT_OPTIONS.some((s) => s.id === raw.defaultSort) ? raw.defaultSort : DEFAULTS.defaultSort,
      defaultView: ['list', 'grid'].includes(raw.defaultView) ? raw.defaultView : DEFAULTS.defaultView,
      weekStartsOn: raw.weekStartsOn === 0 ? 0 : 1,
      notifications: Object.fromEntries(
        Object.entries(DEFAULTS.notifications).map(([k, v]) => [k, typeof raw.notifications?.[k] === 'boolean' ? raw.notifications[k] : v]),
      ),
      lastDigest: typeof raw.lastDigest === 'string' ? raw.lastDigest : '',
    }
  } catch {
    return structuredClone(DEFAULTS)
  }
}

const settings = reactive(load())

watch(
  settings,
  (val) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(val))
    } catch {}
  },
  { deep: true },
)

window.addEventListener('storage', (e) => {
  if (e.key === KEY) Object.assign(settings, load())
})

export function useSettings() {
  return { settings }
}
