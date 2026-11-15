import { useTasks } from './useTasks'
import { useToast } from './useToast'
import { useSettings } from './useSettings'

/** Task mutations that come with user feedback (toasts + undo). */
export function useTaskActions() {
  const store = useTasks()
  const { show } = useToast()
  const { settings } = useSettings()

  function toggle(task) {
    store.toggleTask(task.id)
    if (task.completed && settings.notifications.completionToasts) {
      show('Task completed', { label: 'Undo', run: () => store.setCompleted(task.id, false) })
    }
  }

  function remove(task) {
    const removed = store.deleteTask(task.id)
    if (removed) show('Task deleted', { label: 'Undo', run: () => store.restoreTask(removed) })
    return removed
  }

  function clearCompleted() {
    const removed = store.clearCompleted()
    if (removed.length)
      show(`Cleared ${removed.length} completed`, { label: 'Undo', run: () => removed.forEach((t) => store.restoreTask(t)) })
  }

  function clearAll() {
    const removed = store.clearAll()
    if (removed.length) show(`Deleted ${removed.length} task${removed.length === 1 ? '' : 's'}`, { label: 'Undo', run: () => store.replaceAll(removed) })
  }

  return { toggle, remove, clearCompleted, clearAll }
}
