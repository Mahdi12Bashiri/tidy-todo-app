<script setup>
import { computed } from 'vue'
import {
  ListTodo, CircleCheckBig, Clock, AlertTriangle, CalendarClock, CalendarRange,
  ArrowRight, Sparkles, Plus,
} from 'lucide-vue-next'
import { useTasks, queryTasks, todayISO } from '../composables/useTasks'
import { useTaskActions } from '../composables/useTaskActions'
import { useSettings } from '../composables/useSettings'
import { plural } from '../utils/format'
import StatCard from '../components/StatCard.vue'
import TaskItem from '../components/TaskItem.vue'
import QuickAdd from '../components/QuickAdd.vue'
import EmptyState from '../components/EmptyState.vue'

const { tasks, stats } = useTasks()
const { toggle, remove } = useTaskActions()
const { settings } = useSettings()

const greeting = computed(() => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
})
const todayLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
const summary = computed(() => {
  const s = stats.value
  if (!s.total) return 'Your list is empty. Add something to get started.'
  if (!s.remaining) return 'Everything is done. Enjoy the calm.'
  const parts = [`${plural(s.remaining, 'task')} remaining`]
  if (s.dueToday) parts.push(`${s.dueToday} due today`)
  if (s.overdue) parts.push(`${s.overdue} overdue`)
  return parts.join(' · ')
})

const cards = computed(() => {
  const s = stats.value
  return [
    { label: 'Total', value: s.total, icon: ListTodo, tone: 'indigo', hint: 'All tasks on your list', status: 'all' },
    { label: 'Completed', value: s.completed, icon: CircleCheckBig, tone: 'emerald', hint: `${s.progress}% complete`, status: 'completed' },
    { label: 'Remaining', value: s.remaining, icon: Clock, tone: 'zinc', hint: s.remaining ? 'Still to do' : 'Nothing left', status: 'active' },
    { label: 'Overdue', value: s.overdue, icon: AlertTriangle, tone: 'amber', hint: s.overdue ? 'Needs attention' : 'You are on track', status: 'overdue' },
    { label: 'Today', value: s.dueToday, icon: CalendarClock, tone: 'rose', hint: s.dueToday ? 'Due before midnight' : 'Nothing due today', status: 'today' },
    { label: 'Upcoming', value: s.upcoming, icon: CalendarRange, tone: 'sky', hint: 'Due in the next 7 days', status: 'upcoming' },
  ]
})

// Focus list: overdue + due today, most urgent first.
const focus = computed(() =>
  [...queryTasks(tasks.value, { status: 'overdue' }), ...queryTasks(tasks.value, { status: 'today' })].slice(0, 6),
)
const upcoming = computed(() => queryTasks(tasks.value, { status: 'upcoming', sort: 'due' }).slice(0, 5))
const recent = computed(() => queryTasks(tasks.value, { status: 'active', sort: 'created' }).slice(0, 5))
</script>

<template>
  <div>
    <section>
      <p class="text-sm text-zinc-500 dark:text-zinc-400">{{ todayLabel }}</p>
      <h1 class="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{{ greeting }}.</h1>
      <p class="mt-2 text-zinc-500 dark:text-zinc-400">{{ summary }}</p>
    </section>

    <Transition name="fade">
      <RouterLink
        v-if="settings.notifications.overdueBanner && stats.overdue"
        :to="{ path: '/tasks', query: { status: 'overdue' } }"
        class="group mt-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 transition hover:border-amber-300 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:border-amber-500/40"
      >
        <AlertTriangle class="size-4 shrink-0" />
        <span class="flex-1">You have {{ plural(stats.overdue, 'overdue task') }}. Review them to get back on track.</span>
        <ArrowRight class="size-4 transition-transform group-hover:translate-x-0.5" />
      </RouterLink>
    </Transition>

    <section class="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6" aria-label="Overview">
      <StatCard
        v-for="c in cards"
        :key="c.label"
        v-bind="c"
        :to="{ path: '/tasks', query: c.status === 'all' ? {} : { status: c.status } }"
      />
    </section>

    <div class="mt-4">
      <div class="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800" role="progressbar" :aria-valuenow="stats.progress" aria-valuemin="0" aria-valuemax="100">
        <div class="h-full rounded-full bg-indigo-600 transition-[width] duration-700 ease-out dark:bg-indigo-400" :style="{ width: stats.progress + '%' }" />
      </div>
    </div>

    <QuickAdd class="mt-8" />

    <div class="mt-10 grid gap-8 lg:grid-cols-5">
      <section class="lg:col-span-3">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold">
            Focus for today <span class="ml-1 font-mono font-normal text-zinc-400 tabular-nums">{{ stats.overdue + stats.dueToday }}</span>
          </h2>
          <RouterLink :to="{ path: '/tasks', query: { status: 'today' } }" class="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            View all <ArrowRight class="size-3.5" />
          </RouterLink>
        </div>
        <TransitionGroup v-if="focus.length" tag="ul" name="task" class="relative mt-3 space-y-2">
          <TaskItem v-for="t in focus" :key="t.id" :task="t" @toggle="toggle(t)" @delete="remove(t)" />
        </TransitionGroup>
        <EmptyState v-else class="mt-3" compact :icon="Sparkles" title="Nothing due today" text="Pick something from your upcoming list, or add a task above." />

        <template v-if="recent.length">
          <div class="mt-8 flex items-center justify-between">
            <h2 class="text-sm font-semibold">Recently added</h2>
            <RouterLink :to="{ path: '/tasks', query: { sort: 'created' } }" class="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              All tasks <ArrowRight class="size-3.5" />
            </RouterLink>
          </div>
          <TransitionGroup tag="ul" name="task" class="relative mt-3 space-y-2">
            <TaskItem v-for="t in recent" :key="t.id" :task="t" @toggle="toggle(t)" @delete="remove(t)" />
          </TransitionGroup>
        </template>
      </section>

      <section class="lg:col-span-2">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold">Coming up <span class="ml-1 font-mono font-normal text-zinc-400 tabular-nums">{{ stats.upcoming }}</span></h2>
          <RouterLink to="/calendar" class="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Calendar <ArrowRight class="size-3.5" />
          </RouterLink>
        </div>
        <ul v-if="upcoming.length" class="mt-3 divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
          <li v-for="t in upcoming" :key="t.id">
            <RouterLink :to="`/tasks/${t.id}`" class="flex items-center gap-3 px-4 py-3 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
              <span class="w-11 shrink-0 text-center">
                <span class="block text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                  {{ new Date(t.dueDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' }) }}
                </span>
                <span class="block font-mono text-lg leading-tight font-medium tabular-nums">{{ Number(t.dueDate.slice(8)) }}</span>
              </span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-medium">{{ t.title }}</span>
                <span class="block text-xs text-zinc-500 capitalize dark:text-zinc-400">{{ t.priority }} priority<template v-if="t.category"> · {{ t.category }}</template></span>
              </span>
              <ArrowRight class="size-4 shrink-0 text-zinc-300 dark:text-zinc-600" />
            </RouterLink>
          </li>
        </ul>
        <EmptyState v-else class="mt-3" compact :icon="CalendarRange" title="A clear week" text="No tasks are due in the next 7 days.">
          <RouterLink
            :to="{ path: '/tasks/new', query: { due: todayISO(1) } }"
            class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-600 ring-1 ring-indigo-200 transition ring-inset hover:bg-indigo-50 dark:text-indigo-400 dark:ring-indigo-500/30 dark:hover:bg-indigo-500/10"
          >
            <Plus class="size-4" /> Plan something
          </RouterLink>
        </EmptyState>
      </section>
    </div>

    <p class="mt-12 hidden text-center text-xs text-zinc-400 sm:block">
      Press <kbd class="rounded border border-zinc-200 px-1 font-mono dark:border-zinc-700">N</kbd> to create a task ·
      <kbd class="rounded border border-zinc-200 px-1 font-mono dark:border-zinc-700">/</kbd> to search · Tasks are saved in this browser
    </p>
  </div>
</template>
