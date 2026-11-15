<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from 'lucide-vue-next'
import { useTasks, sortTasks, todayISO, toISODate, isValidISODate, isOverdue } from '../composables/useTasks'
import { useTaskActions } from '../composables/useTaskActions'
import { useSettings } from '../composables/useSettings'
import { parseISO, priorityDots, priorityBar, plural } from '../utils/format'
import PageHeader from '../components/PageHeader.vue'
import TaskCheckbox from '../components/TaskCheckbox.vue'

const route = useRoute()
const router = useRouter()
const { tasks } = useTasks()
const { toggle } = useTaskActions()
const { settings } = useSettings()

// View + anchor date live in the URL (?view=week&date=2026-11-15).
const view = computed(() => (route.query.view === 'week' ? 'week' : 'month'))
const anchor = computed(() => (isValidISODate(route.query.date) ? route.query.date : todayISO()))
const today = computed(() => todayISO())

function go(patch) {
  const query = { view: view.value, date: anchor.value, ...patch }
  if (query.view === 'month') delete query.view
  if (query.date === todayISO()) delete query.date
  router.push({ query })
}

function shift(dir) {
  const d = parseISO(anchor.value)
  if (view.value === 'month') {
    d.setDate(1)
    d.setMonth(d.getMonth() + dir)
  } else d.setDate(d.getDate() + dir * 7)
  go({ date: toISODate(d) })
}

const startOfWeek = (d) => {
  const s = new Date(d)
  s.setDate(s.getDate() - ((s.getDay() - settings.weekStartsOn + 7) % 7))
  return s
}
const addDays = (d, n) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

const weekdayNames = computed(() =>
  Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(new Date(2026, 0, 4)), i).toLocaleDateString(undefined, { weekday: 'short' })),
)

const byDate = computed(() => {
  const map = {}
  for (const t of tasks.value) if (t.dueDate) (map[t.dueDate] ??= []).push(t)
  for (const k in map) map[k] = sortTasks(map[k], 'priority')
  return map
})

const monthDays = computed(() => {
  const a = parseISO(anchor.value)
  const first = new Date(a.getFullYear(), a.getMonth(), 1)
  const start = startOfWeek(first)
  const last = new Date(a.getFullYear(), a.getMonth() + 1, 0)
  const weeks = Math.ceil(((first - start) / 86400000 + last.getDate()) / 7)
  return Array.from({ length: weeks * 7 }, (_, i) => {
    const d = addDays(start, i)
    const iso = toISODate(d)
    return { iso, day: d.getDate(), inMonth: d.getMonth() === a.getMonth(), tasks: byDate.value[iso] ?? [] }
  })
})

const weekDays = computed(() => {
  const start = startOfWeek(parseISO(anchor.value))
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(start, i)
    const iso = toISODate(d)
    return {
      iso,
      day: d.getDate(),
      weekday: d.toLocaleDateString(undefined, { weekday: 'short' }),
      tasks: byDate.value[iso] ?? [],
    }
  })
})

const title = computed(() => {
  const a = parseISO(anchor.value)
  if (view.value === 'month') return a.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const s = parseISO(weekDays.value[0].iso)
  const e = parseISO(weekDays.value[6].iso)
  const sameMonth = s.getMonth() === e.getMonth()
  const fmt = (d, opts) => d.toLocaleDateString(undefined, opts)
  return sameMonth
    ? `${fmt(s, { month: 'long', day: 'numeric' })} – ${e.getDate()}, ${e.getFullYear()}`
    : `${fmt(s, { month: 'short', day: 'numeric' })} – ${fmt(e, { month: 'short', day: 'numeric', year: 'numeric' })}`
})

const visibleDays = computed(() => (view.value === 'month' ? monthDays.value.filter((d) => d.inMonth) : weekDays.value))
const periodCount = computed(() => visibleDays.value.reduce((n, d) => n + d.tasks.length, 0))
const agenda = computed(() => visibleDays.value.filter((d) => d.tasks.length))
const unscheduled = computed(() => tasks.value.filter((t) => !t.dueDate && !t.completed).length)

const createOn = (iso) => router.push({ path: '/tasks/new', query: { due: iso } })
const openTask = (t) => router.push(`/tasks/${t.id}`)
const longDay = (iso) => parseISO(iso).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })

const chipClass = (t) => [
  'flex w-full items-center gap-1.5 truncate rounded-md px-1.5 py-0.5 text-left text-xs font-medium transition',
  t.completed
    ? 'text-zinc-400 line-through hover:bg-zinc-100 dark:text-zinc-500 dark:hover:bg-zinc-800'
    : isOverdue(t)
      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20'
      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700',
]
const btn =
  'grid size-9 cursor-pointer place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-white'
</script>

<template>
  <div>
    <PageHeader eyebrow="Plan" title="Calendar" :description="`${plural(periodCount, 'task')} this ${view}${unscheduled ? ` · ${unscheduled} unscheduled` : ''}`">
      <template #actions>
        <div class="flex rounded-xl bg-zinc-200/60 p-1 dark:bg-zinc-800/70" role="group" aria-label="Calendar view">
          <button
            v-for="v in ['month', 'week']"
            :key="v"
            @click="go({ view: v })"
            :aria-pressed="view === v"
            :class="[
              'cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition',
              view === v ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200',
            ]"
          >
            {{ v }}
          </button>
        </div>
      </template>
    </PageHeader>

    <!-- Navigation -->
    <div class="mt-8 flex items-center gap-2">
      <button :class="btn" @click="shift(-1)" :aria-label="`Previous ${view}`"><ChevronLeft class="size-4" /></button>
      <button :class="btn" @click="shift(1)" :aria-label="`Next ${view}`"><ChevronRight class="size-4" /></button>
      <button
        @click="go({ date: todayISO() })"
        class="cursor-pointer rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-white"
      >
        Today
      </button>
      <h2 class="ml-2 text-lg font-semibold tracking-tight sm:text-xl">{{ title }}</h2>
    </div>

    <!-- Month view -->
    <div v-if="view === 'month'" class="mt-5 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div class="grid grid-cols-7 border-b border-zinc-200/80 dark:border-zinc-800">
        <div v-for="w in weekdayNames" :key="w" class="py-2 text-center text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">{{ w }}</div>
      </div>
      <div class="grid grid-cols-7 gap-px bg-zinc-200/80 dark:bg-zinc-800">
        <div
          v-for="d in monthDays"
          :key="d.iso"
          @click="createOn(d.iso)"
          :class="[
            'group relative min-h-16 cursor-pointer p-1 transition-colors sm:min-h-28 sm:p-1.5',
            d.inMonth ? 'bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/60' : 'bg-zinc-50 text-zinc-400 hover:bg-zinc-100 dark:bg-zinc-950/60 dark:text-zinc-600 dark:hover:bg-zinc-900',
          ]"
        >
          <div class="flex items-center justify-between">
            <span
              :class="[
                'grid size-6 place-items-center rounded-full font-mono text-xs tabular-nums sm:size-7',
                d.iso === today ? 'bg-indigo-600 font-semibold text-white dark:bg-indigo-500' : '',
                d.iso === anchor && d.iso !== today ? 'ring-2 ring-indigo-400 ring-inset' : '',
              ]"
              >{{ d.day }}</span
            >
            <button
              type="button"
              @click.stop="createOn(d.iso)"
              :aria-label="`Add task on ${longDay(d.iso)}`"
              class="hidden size-6 cursor-pointer place-items-center rounded-md text-zinc-400 opacity-0 transition group-hover:opacity-100 hover:bg-indigo-50 hover:text-indigo-600 focus:opacity-100 sm:grid dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
            >
              <Plus class="size-3.5" />
            </button>
          </div>
          <!-- Desktop chips -->
          <ul class="mt-1 hidden space-y-0.5 sm:block">
            <li v-for="t in d.tasks.slice(0, 3)" :key="t.id">
              <RouterLink :to="`/tasks/${t.id}`" @click.stop :class="chipClass(t)" :title="t.title">
                <span :class="['size-1.5 shrink-0 rounded-full', priorityDots[t.priority], t.completed ? 'opacity-40' : '']" />
                <span class="truncate">{{ t.title }}</span>
              </RouterLink>
            </li>
            <li v-if="d.tasks.length > 3">
              <button
                type="button"
                @click.stop="go({ view: 'week', date: d.iso })"
                class="w-full cursor-pointer rounded-md px-1.5 text-left text-[11px] font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                +{{ d.tasks.length - 3 }} more
              </button>
            </li>
          </ul>
          <!-- Mobile dots -->
          <div v-if="d.tasks.length" class="mt-1 flex flex-wrap justify-center gap-0.5 sm:hidden">
            <span v-for="t in d.tasks.slice(0, 4)" :key="t.id" :class="['size-1.5 rounded-full', priorityDots[t.priority], t.completed ? 'opacity-30' : '']" />
          </div>
        </div>
      </div>
    </div>

    <!-- Week view -->
    <div v-else class="mt-5 grid gap-3 lg:grid-cols-7 lg:gap-2">
      <section
        v-for="d in weekDays"
        :key="d.iso"
        @click="createOn(d.iso)"
        :class="[
          'group flex cursor-pointer flex-col rounded-2xl border bg-white p-3 transition hover:border-zinc-300 lg:min-h-80 dark:bg-zinc-900 dark:hover:border-zinc-700',
          d.iso === today ? 'border-indigo-300 dark:border-indigo-500/50' : 'border-zinc-200/80 dark:border-zinc-800',
        ]"
      >
        <header class="flex items-center justify-between">
          <div class="flex items-baseline gap-1.5 lg:flex-col lg:gap-0">
            <span class="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">{{ d.weekday }}</span>
            <span :class="['font-mono text-xl font-medium tabular-nums', d.iso === today ? 'text-indigo-600 dark:text-indigo-400' : '']">{{ d.day }}</span>
          </div>
          <button
            type="button"
            @click.stop="createOn(d.iso)"
            :aria-label="`Add task on ${longDay(d.iso)}`"
            class="grid size-7 cursor-pointer place-items-center rounded-lg text-zinc-400 transition hover:bg-indigo-50 hover:text-indigo-600 lg:opacity-0 lg:group-hover:opacity-100 lg:focus:opacity-100 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
          >
            <Plus class="size-4" />
          </button>
        </header>
        <ul class="mt-3 space-y-1.5">
          <li
            v-for="t in d.tasks"
            :key="t.id"
            @click.stop="openTask(t)"
            class="relative flex cursor-pointer items-start gap-2 overflow-hidden rounded-lg border border-zinc-200/80 bg-white py-2 pr-2 pl-3 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
          >
            <span :class="['absolute inset-y-0 left-0 w-0.5', priorityBar[t.priority], t.completed ? 'opacity-30' : '']" />
            <TaskCheckbox size="size-4" class="mt-px" :checked="t.completed" @toggle="toggle(t)" />
            <RouterLink
              :to="`/tasks/${t.id}`"
              @click.stop
              :class="['min-w-0 flex-1 text-xs leading-snug font-medium break-words', t.completed ? 'text-zinc-400 line-through dark:text-zinc-500' : isOverdue(t) ? 'text-rose-600 dark:text-rose-400' : '']"
              >{{ t.title }}</RouterLink
            >
          </li>
        </ul>
        <p v-if="!d.tasks.length" class="mt-2 text-xs text-zinc-400 lg:mt-auto lg:text-center lg:opacity-0 lg:group-hover:opacity-100">Click to add a task</p>
      </section>
    </div>

    <!-- Mobile agenda for the month -->
    <section v-if="view === 'month'" class="mt-6 sm:hidden">
      <h3 class="text-sm font-semibold">Agenda</h3>
      <div v-if="agenda.length" class="mt-3 space-y-4">
        <div v-for="d in agenda" :key="d.iso">
          <p class="text-xs font-medium text-zinc-500 dark:text-zinc-400">{{ longDay(d.iso) }}</p>
          <ul class="mt-1.5 space-y-1">
            <li v-for="t in d.tasks" :key="t.id">
              <RouterLink :to="`/tasks/${t.id}`" :class="[chipClass(t), '!py-2 !text-sm']">
                <span :class="['size-2 shrink-0 rounded-full', priorityDots[t.priority]]" />
                <span class="truncate">{{ t.title }}</span>
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>
      <p v-else class="mt-3 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <CalendarDays class="size-4" /> No tasks due this month. Tap a date to add one.
      </p>
    </section>

    <p class="mt-6 hidden text-xs text-zinc-400 sm:block">Click any date to create a task due that day. Click a task to open it.</p>
  </div>
</template>
