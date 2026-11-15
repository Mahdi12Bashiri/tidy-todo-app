<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  CheckCheck, LayoutDashboard, ListTodo, CalendarDays, ChartColumn, Settings,
  CalendarClock, CalendarRange, AlertTriangle, Trash2, Plus,
} from 'lucide-vue-next'
import { useTasks } from '../../composables/useTasks'
import { useTaskActions } from '../../composables/useTaskActions'
import ProgressRing from '../ProgressRing.vue'

const emit = defineEmits(['navigate'])
const route = useRoute()
const { stats, statusCounts } = useTasks()
const { clearCompleted } = useTaskActions()

const nav = computed(() => [
  { id: 'dashboard', label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { id: 'tasks', label: 'All tasks', to: '/tasks', icon: ListTodo, count: statusCounts.value.active },
  { id: 'calendar', label: 'Calendar', to: '/calendar', icon: CalendarDays },
  { id: 'insights', label: 'Analytics', to: '/insights', icon: ChartColumn },
  { id: 'settings', label: 'Settings', to: '/settings', icon: Settings },
])

const shortcuts = computed(() => [
  { id: 'today', label: 'Due today', icon: CalendarClock, count: statusCounts.value.today },
  { id: 'upcoming', label: 'Upcoming', icon: CalendarRange, count: statusCounts.value.upcoming },
  { id: 'overdue', label: 'Overdue', icon: AlertTriangle, count: statusCounts.value.overdue, alert: true },
])

const isShortcutActive = (id) => route.name === 'tasks' && route.query.status === id
</script>

<template>
  <div class="flex h-full flex-col">
    <RouterLink to="/" class="flex items-center gap-2.5 px-2" @click="emit('navigate')">
      <span class="grid size-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
        <CheckCheck class="size-5" :stroke-width="2.5" />
      </span>
      <span class="text-lg font-semibold tracking-tight">Tidy</span>
    </RouterLink>

    <RouterLink
      to="/tasks/new"
      @click="emit('navigate')"
      class="mt-7 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-500 active:scale-[0.98] dark:bg-indigo-500 dark:hover:bg-indigo-400"
    >
      <Plus class="size-4" :stroke-width="2.5" /> New task
    </RouterLink>

    <nav class="mt-7" aria-label="Main">
      <p class="px-2 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">Workspace</p>
      <ul class="mt-2 space-y-0.5">
        <li v-for="item in nav" :key="item.id">
          <RouterLink
            :to="item.to"
            @click="emit('navigate')"
            :aria-current="route.meta.nav === item.id ? 'page' : undefined"
            :class="[
              'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
              route.meta.nav === item.id
                ? 'bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/70',
            ]"
          >
            <component :is="item.icon" class="size-4" />
            {{ item.label }}
            <span
              v-if="item.count !== undefined"
              :class="[
                'ml-auto rounded-md px-1.5 py-0.5 font-mono text-xs tabular-nums',
                route.meta.nav === item.id ? 'bg-white/15 dark:bg-zinc-900/10' : 'text-zinc-400',
              ]"
              >{{ item.count }}</span
            >
          </RouterLink>
        </li>
      </ul>

      <p class="mt-7 px-2 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">Focus</p>
      <ul class="mt-2 space-y-0.5">
        <li v-for="s in shortcuts" :key="s.id">
          <RouterLink
            :to="{ path: '/tasks', query: { status: s.id } }"
            @click="emit('navigate')"
            :class="[
              'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
              isShortcutActive(s.id)
                ? 'bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-white'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/70',
            ]"
          >
            <component :is="s.icon" class="size-4" />
            {{ s.label }}
            <span
              :class="[
                'ml-auto rounded-md px-1.5 py-0.5 font-mono text-xs tabular-nums',
                s.alert && s.count ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' : 'text-zinc-400',
              ]"
              >{{ s.count }}</span
            >
          </RouterLink>
        </li>
      </ul>
    </nav>

    <!-- Progress card -->
    <div class="mt-auto pt-6">
      <div class="rounded-2xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <RouterLink to="/insights" @click="emit('navigate')" class="group flex items-center gap-4" title="Open analytics">
          <ProgressRing :value="stats.progress" class="size-16" />
          <div>
            <p class="font-mono text-2xl font-medium tabular-nums">{{ stats.progress }}%</p>
            <p class="text-xs text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-200">
              {{ stats.completed }} of {{ stats.total }} done
            </p>
          </div>
        </RouterLink>
        <button
          v-if="stats.completed"
          @click="clearCompleted"
          class="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium text-zinc-500 ring-1 ring-zinc-200 transition ring-inset hover:bg-zinc-50 hover:text-zinc-800 dark:text-zinc-400 dark:ring-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <Trash2 class="size-3.5" /> Clear completed
        </button>
      </div>
    </div>
  </div>
</template>
