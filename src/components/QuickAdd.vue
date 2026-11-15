<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, CornerDownLeft, SlidersHorizontal } from 'lucide-vue-next'
import { PRIORITIES, LIMITS, todayISO, useTasks } from '../composables/useTasks'
import { useToast } from '../composables/useToast'
import { priorityDots } from '../utils/format'

const router = useRouter()
const { addTask } = useTasks()
const { show } = useToast()

const title = ref('')
const priority = ref('medium')
const due = ref('') // '' | today | tomorrow
const input = ref(null)
const dueOptions = [
  { id: '', label: 'No date' },
  { id: 'today', label: 'Today' },
  { id: 'tomorrow', label: 'Tomorrow' },
]

function submit() {
  const dueDate = due.value === 'today' ? todayISO(0) : due.value === 'tomorrow' ? todayISO(1) : ''
  const task = addTask({ title: title.value, priority: priority.value, dueDate })
  if (!task) return input.value?.focus()
  title.value = ''
  show('Task added', { label: 'View', run: () => router.push(`/tasks/${task.id}`) })
}

function moreOptions() {
  const query = { priority: priority.value }
  if (title.value.trim()) query.title = title.value.trim()
  if (due.value) query.due = due.value === 'today' ? todayISO(0) : todayISO(1)
  router.push({ path: '/tasks/new', query })
}

defineExpose({ focus: () => input.value?.focus() })
</script>

<template>
  <form
    @submit.prevent="submit"
    class="rounded-2xl border border-zinc-200/80 bg-white p-2 shadow-sm shadow-zinc-200/50 transition focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none"
  >
    <div class="flex items-center gap-2 pl-2">
      <Plus class="size-5 shrink-0 text-zinc-400" />
      <input
        ref="input"
        v-model="title"
        :maxlength="LIMITS.title"
        placeholder="Add a task and press Enter"
        aria-label="New task title"
        class="min-w-0 flex-1 bg-transparent py-2 text-[15px] outline-none placeholder:text-zinc-400"
      />
      <button
        type="submit"
        :disabled="!title.trim()"
        aria-label="Add task"
        class="grid size-9 shrink-0 cursor-pointer place-items-center rounded-xl bg-zinc-900 text-white transition hover:bg-zinc-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        <CornerDownLeft class="size-4" />
      </button>
    </div>
    <div class="mt-2 flex flex-wrap items-center gap-2 border-t border-zinc-100 px-1 pt-2 dark:border-zinc-800">
      <div class="flex items-center gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800" role="group" aria-label="Priority">
        <button
          v-for="p in PRIORITIES"
          :key="p"
          type="button"
          @click="priority = p"
          :aria-pressed="priority === p"
          :class="[
            'flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition',
            priority === p ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white' : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200',
          ]"
        >
          <span :class="['size-2 rounded-full', priorityDots[p]]" />
          {{ p }}
        </button>
      </div>
      <div class="flex items-center gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800" role="group" aria-label="Due date">
        <button
          v-for="d in dueOptions"
          :key="d.id"
          type="button"
          @click="due = d.id"
          :aria-pressed="due === d.id"
          :class="[
            'cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition',
            due === d.id ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white' : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200',
          ]"
        >
          {{ d.label }}
        </button>
      </div>
      <button
        type="button"
        @click="moreOptions"
        class="ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
      >
        <SlidersHorizontal class="size-3.5" /> More options
      </button>
    </div>
  </form>
</template>
