import { todayISO } from '../composables/useTasks'

export const priorityDots = { low: 'bg-sky-400', medium: 'bg-amber-400', high: 'bg-rose-500' }
export const priorityBar = { high: 'bg-rose-500', medium: 'bg-amber-400', low: 'bg-sky-400' }
export const priorityStyles = {
  high: 'bg-rose-50 text-rose-600 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20',
  medium: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20',
  low: 'bg-sky-50 text-sky-600 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/20',
}
export const priorityActive = {
  low: 'border-sky-400 bg-sky-50 text-sky-700 dark:border-sky-500/60 dark:bg-sky-500/10 dark:text-sky-300',
  medium: 'border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-500/60 dark:bg-amber-500/10 dark:text-amber-300',
  high: 'border-rose-400 bg-rose-50 text-rose-700 dark:border-rose-500/60 dark:bg-rose-500/10 dark:text-rose-300',
}

export function parseISO(d) {
  return new Date(d + 'T00:00:00')
}

/** Short relative label for a due date: Today, Tomorrow, Mar 4 … */
export function dueLabel(d) {
  if (!d) return ''
  if (d === todayISO()) return 'Today'
  if (d === todayISO(1)) return 'Tomorrow'
  if (d === todayISO(-1)) return 'Yesterday'
  const date = parseISO(d)
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }) })
}

export function longDate(d) {
  if (!d) return ''
  return parseISO(d).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export function dateTime(ms) {
  if (!ms) return ''
  return new Date(ms).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

/** Whole days between two YYYY-MM-DD strings (b - a). */
export function daysBetween(a, b) {
  return Math.round((parseISO(b) - parseISO(a)) / 86400000)
}

export function relativeDue(d) {
  if (!d) return ''
  const n = daysBetween(todayISO(), d)
  if (n === 0) return 'Due today'
  if (n === 1) return 'Due tomorrow'
  if (n > 1) return `Due in ${n} days`
  if (n === -1) return '1 day overdue'
  return `${-n} days overdue`
}

export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`
