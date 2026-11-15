<script setup>
import { computed } from 'vue'
import { Flag, CalendarDays, Tag } from 'lucide-vue-next'
import { isOverdue } from '../composables/useTasks'
import { dueLabel, priorityStyles } from '../utils/format'

const props = defineProps({ task: { type: Object, required: true }, showCategory: { type: Boolean, default: true } })
const overdue = computed(() => isOverdue(props.task))
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 text-xs">
    <span :class="['inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium capitalize ring-1 ring-inset', priorityStyles[task.priority]]">
      <Flag class="size-3" :stroke-width="2.5" />
      {{ task.priority }}
    </span>
    <span
      v-if="task.dueDate"
      :class="[
        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium',
        overdue ? 'bg-rose-600 text-white dark:bg-rose-500' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
      ]"
    >
      <CalendarDays class="size-3" :stroke-width="2.5" />
      {{ overdue ? `Overdue · ${dueLabel(task.dueDate)}` : dueLabel(task.dueDate) }}
    </span>
    <span
      v-if="showCategory && task.category"
      class="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-1.5 py-0.5 font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
    >
      <Tag class="size-3" :stroke-width="2.5" />
      {{ task.category }}
    </span>
  </div>
</template>
