import { useTasks, todayISO } from './useTasks'
import { useSettings } from './useSettings'

export const notificationsSupported = typeof window !== 'undefined' && 'Notification' in window

export function notificationPermission() {
  return notificationsSupported ? Notification.permission : 'unsupported'
}

export async function requestPermission() {
  if (!notificationsSupported) return 'unsupported'
  if (Notification.permission !== 'default') return Notification.permission
  return Notification.requestPermission()
}

function digestText() {
  const { stats } = useTasks()
  const s = stats.value
  if (!s.dueToday && !s.overdue) return 'Nothing is due today. Enjoy the calm.'
  const parts = []
  if (s.dueToday) parts.push(`${s.dueToday} due today`)
  if (s.overdue) parts.push(`${s.overdue} overdue`)
  return parts.join(' · ')
}

export function sendDigest() {
  if (notificationPermission() !== 'granted') return false
  try {
    new Notification('Tidy — today', { body: digestText(), icon: '/favicon.svg', tag: 'tidy-digest' })
    return true
  } catch {
    return false
  }
}

/** Show the daily digest once per day when enabled. */
export function maybeSendDailyDigest() {
  const { settings } = useSettings()
  if (!settings.notifications.dailyDigest || settings.lastDigest === todayISO()) return
  if (sendDigest()) settings.lastDigest = todayISO()
}
