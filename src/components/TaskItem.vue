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
    class="group relative flex items-start gap-3 overflow-hidden rounded-xl border border-zinc-200/80 bg-white py-3.5 pr-3 pl-4 transition-all duration-200 hover:border-zinc-300 hover:shadow-md hover:shadow-zinc-200/40 sm:gap-4 sm:pl-5 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:shadow-black/20"
  >
    <span :class="['absolute inset-y-0 left-0 w-1 transition-opacity', priorityBar[task.priority], task.completed ? 'opacity-30' : '']" />

    <TaskCheckbox class="mt-0.5" :checked="task.completed" @toggle="emit('toggle')" />

    <RouterLink :to="`/tasks/${task.id}`" class="min-w-0 flex-1 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40">
      <p
        :class="[
          'text-[15px] leading-snug font-medium break-words transition-colors duration-200',
          task.completed ? 'text-zinc-400 line-through decoration-zinc-300 dark:text-zinc-500 dark:decoration-zinc-600' : '',
        ]"
      >
        {{ task.title }}
      </p>
      <p v-if="task.description" class="mt-0.5 line-clamp-1 text-sm text-zinc-500 dark:text-zinc-400">{{ task.description }}</p>
      <TaskBadges :task="task" class="mt-2" />
    </RouterLink>

    <div class="flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
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
  </li>
</template>
