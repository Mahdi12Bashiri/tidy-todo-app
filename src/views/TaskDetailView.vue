<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft, Pencil, Trash2, Check, RotateCcw, Flag, CalendarDays, Tag, Clock,
  CircleCheckBig, Circle, AlertTriangle, SearchX, CalendarRange,
} from 'lucide-vue-next'
import { useTasks, isOverdue } from '../composables/useTasks'
import { useTaskActions } from '../composables/useTaskActions'
import { priorityStyles, priorityBar, longDate, relativeDue, dateTime } from '../utils/format'
import EmptyState from '../components/EmptyState.vue'

const props = defineProps({ id: { type: String, required: true } })
const router = useRouter()
const { getTask } = useTasks()
const { toggle, remove } = useTaskActions()

const task = computed(() => getTask(props.id))
const overdue = computed(() => task.value && isOverdue(task.value))

const status = computed(() => {
  const t = task.value
  if (!t) return null
  if (t.completed) return { label: 'Completed', icon: CircleCheckBig, cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20' }
  if (overdue.value) return { label: 'Overdue', icon: AlertTriangle, cls: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20' }
  return { label: 'In progress', icon: Circle, cls: 'bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700' }
})

function back() {
  if (window.history.state?.back) router.back()
  else router.push('/tasks')
}

function onDelete() {
  const removed = remove(task.value)
  if (removed) {
    if (window.history.state?.back) router.back()
    else router.replace('/tasks')
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <button @click="back" class="inline-flex cursor-pointer items-center gap-1.5 text-sm text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
      <ArrowLeft class="size-4" /> Back
    </button>

    <EmptyState v-if="!task" class="mt-6" :icon="SearchX" title="Task not found" text="It may have been deleted. Tasks are saved in this browser only, so links from another device or browser will not open here.">
      <RouterLink to="/tasks" class="rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-600 ring-1 ring-indigo-200 ring-inset hover:bg-indigo-50 dark:text-indigo-400 dark:ring-indigo-500/30 dark:hover:bg-indigo-500/10">
        Go to all tasks
      </RouterLink>
    </EmptyState>

    <article v-else class="relative mt-4 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <span :class="['absolute inset-x-0 top-0 h-1', priorityBar[task.priority], task.completed ? 'opacity-30' : '']" />
      <div class="p-5 sm:p-8">
        <div class="flex flex-wrap items-center gap-2">
          <span :class="['inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium ring-1 ring-inset', status.cls]">
            <component :is="status.icon" class="size-3.5" /> {{ status.label }}
          </span>
          <span :class="['inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium capitalize ring-1 ring-inset', priorityStyles[task.priority]]">
            <Flag class="size-3.5" /> {{ task.priority }} priority
          </span>
        </div>

        <h1
          :class="[
            'mt-4 text-2xl font-semibold tracking-tight break-words sm:text-3xl',
            task.completed ? 'text-zinc-400 line-through decoration-zinc-300 dark:text-zinc-500 dark:decoration-zinc-600' : '',
          ]"
        >
          {{ task.title }}
        </h1>

        <div class="mt-5">
          <h2 class="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">Description</h2>
          <p v-if="task.description" class="mt-2 leading-relaxed whitespace-pre-wrap break-words text-zinc-700 dark:text-zinc-300">{{ task.description }}</p>
          <p v-else class="mt-2 text-sm text-zinc-400 italic">
            No description yet.
            <RouterLink :to="`/tasks/${task.id}/edit`" class="text-indigo-600 not-italic hover:underline dark:text-indigo-400">Add one</RouterLink>
          </p>
        </div>

        <dl class="mt-8 grid gap-px overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-200/80 sm:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-800">
          <div class="bg-white p-4 dark:bg-zinc-900">
            <dt class="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400"><CalendarDays class="size-3.5" /> Due date</dt>
            <dd class="mt-1 text-sm font-medium">
              <template v-if="task.dueDate">
                {{ longDate(task.dueDate) }}
                <span v-if="!task.completed" :class="['mt-0.5 block text-xs font-normal', overdue ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-500 dark:text-zinc-400']">
                  {{ relativeDue(task.dueDate) }}
                </span>
              </template>
              <span v-else class="text-zinc-400">No due date</span>
            </dd>
          </div>
          <div class="bg-white p-4 dark:bg-zinc-900">
            <dt class="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400"><Tag class="size-3.5" /> Category</dt>
            <dd class="mt-1 text-sm font-medium">
              <RouterLink v-if="task.category" :to="{ path: '/tasks', query: { category: task.category } }" class="hover:text-indigo-600 hover:underline dark:hover:text-indigo-400">
                {{ task.category }}
              </RouterLink>
              <span v-else class="text-zinc-400">Uncategorized</span>
            </dd>
          </div>
          <div class="bg-white p-4 dark:bg-zinc-900">
            <dt class="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400"><Clock class="size-3.5" /> Created</dt>
            <dd class="mt-1 text-sm font-medium">{{ dateTime(task.createdAt) }}</dd>
          </div>
          <div class="bg-white p-4 dark:bg-zinc-900">
            <dt class="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400"><CircleCheckBig class="size-3.5" /> Completed</dt>
            <dd class="mt-1 text-sm font-medium">
              <template v-if="task.completedAt">{{ dateTime(task.completedAt) }}</template>
              <span v-else class="text-zinc-400">Not yet</span>
            </dd>
          </div>
        </dl>
      </div>

      <footer class="flex flex-col gap-2 border-t border-zinc-100 bg-zinc-50/60 p-4 sm:flex-row sm:items-center sm:px-8 dark:border-zinc-800 dark:bg-zinc-900/60">
        <button
          @click="toggle(task)"
          :class="[
            'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98]',
            task.completed
              ? 'text-zinc-700 ring-1 ring-zinc-200 ring-inset hover:bg-white dark:text-zinc-200 dark:ring-zinc-700 dark:hover:bg-zinc-800'
              : 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400',
          ]"
        >
          <component :is="task.completed ? RotateCcw : Check" class="size-4" :stroke-width="2.5" />
          {{ task.completed ? 'Mark as active' : 'Mark as completed' }}
        </button>
        <RouterLink
          :to="`/tasks/${task.id}/edit`"
          class="inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-700 ring-1 ring-zinc-200 transition ring-inset hover:bg-white dark:text-zinc-200 dark:ring-zinc-700 dark:hover:bg-zinc-800"
        >
          <Pencil class="size-4" /> Edit
        </RouterLink>
        <RouterLink
          v-if="task.dueDate"
          :to="{ path: '/calendar', query: { date: task.dueDate } }"
          class="inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-700 ring-1 ring-zinc-200 transition ring-inset hover:bg-white dark:text-zinc-200 dark:ring-zinc-700 dark:hover:bg-zinc-800"
        >
          <CalendarRange class="size-4" /> Show in calendar
        </RouterLink>
        <button
          @click="onDelete"
          class="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 sm:ml-auto dark:text-rose-400 dark:hover:bg-rose-500/10"
        >
          <Trash2 class="size-4" /> Delete
        </button>
      </footer>
    </article>
  </div>
</template>
