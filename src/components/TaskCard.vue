<script setup>
import { Pencil, Trash2 } from 'lucide-vue-next'
import { priorityBar } from '../utils/format'
import TaskBadges from './TaskBadges.vue'
import TaskCheckbox from './TaskCheckbox.vue'

defineProps({ task: { type: Object, required: true } })
const emit = defineEmits(['toggle', 'delete'])
</script>

<template>
  <li
    class="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:shadow-black/30"
  >
    <span :class="['absolute inset-x-0 top-0 h-1', priorityBar[task.priority], task.completed ? 'opacity-30' : '']" />
    <div class="flex items-start justify-between gap-2">
      <TaskCheckbox class="mt-0.5" :checked="task.completed" @toggle="emit('toggle')" />
      <div class="-mt-1 -mr-1 flex items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
        <RouterLink
          :to="`/tasks/${task.id}/edit`"
          aria-label="Edit task"
          title="Edit"
          class="grid size-8 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <Pencil class="size-4" />
        </RouterLink>
        <button
          type="button"
          aria-label="Delete task"
          title="Delete"
          @click="emit('delete')"
          class="grid size-8 cursor-pointer place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
        >
          <Trash2 class="size-4" />
        </button>
      </div>
    </div>
    <RouterLink :to="`/tasks/${task.id}`" class="mt-3 flex flex-1 flex-col rounded-md outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40">
      <p
        :class="[
          'leading-snug font-medium break-words',
          task.completed ? 'text-zinc-400 line-through decoration-zinc-300 dark:text-zinc-500 dark:decoration-zinc-600' : '',
        ]"
      >
        {{ task.title }}
      </p>
      <p v-if="task.description" class="mt-1 line-clamp-3 text-sm text-zinc-500 dark:text-zinc-400">{{ task.description }}</p>
      <TaskBadges :task="task" class="mt-auto pt-4" />
    </RouterLink>
  </li>
</template>
