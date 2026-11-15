<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Search, Flag, ArrowUpDown, Tag, List, LayoutGrid, Trash2, Plus, Sparkles,
  CircleCheckBig, AlertTriangle, CalendarClock, CalendarRange, X,
} from 'lucide-vue-next'
import { useTasks, queryTasks, PRIORITIES, STATUS_FILTERS, SORT_OPTIONS } from '../composables/useTasks'
import { useTaskActions } from '../composables/useTaskActions'
import { useSettings } from '../composables/useSettings'
import PageHeader from '../components/PageHeader.vue'
import TaskItem from '../components/TaskItem.vue'
import TaskCard from '../components/TaskCard.vue'
import EmptyState from '../components/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const { tasks, statusCounts, categories, stats } = useTasks()
const { toggle, remove, clearCompleted } = useTaskActions()
const { settings } = useSettings()

const pick = (v, allowed, fallback) => (typeof v === 'string' && allowed.includes(v) ? v : fallback)

// All filter state lives in the URL, so it survives refresh and back/forward.
const status = computed(() => pick(route.query.status, STATUS_FILTERS.map((f) => f.id), 'all'))
const priority = computed(() => pick(route.query.priority, PRIORITIES, 'any'))
const category = computed(() => pick(route.query.category, categories.value, 'any'))
const sort = computed(() => pick(route.query.sort, SORT_OPTIONS.map((s) => s.id), settings.defaultSort))
const view = computed(() => pick(route.query.view, ['list', 'grid'], settings.defaultView))
const search = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''))

function setQuery(patch, { push = false } = {}) {
  const query = { ...route.query, ...patch }
  for (const k of Object.keys(query)) if (query[k] === undefined || query[k] === '') delete query[k]
  router[push ? 'push' : 'replace']({ query })
}
const setStatus = (s) => setQuery({ status: s === 'all' ? undefined : s }, { push: true })
const setPriority = (p) => setQuery({ priority: p === 'any' ? undefined : p })
const setCategory = (c) => setQuery({ category: c === 'any' ? undefined : c })
const setSort = (s) => setQuery({ sort: s === settings.defaultSort ? undefined : s })
function setView(v) {
  settings.defaultView = v // remember the last-used layout
  setQuery({ view: undefined })
}

const visible = computed(() =>
  queryTasks(tasks.value, { status: status.value, priority: priority.value, category: category.value, search: search.value, sort: sort.value }),
)

const current = computed(() => STATUS_FILTERS.find((f) => f.id === status.value))
const hasQuery = computed(() => !!search.value.trim() || priority.value !== 'any' || category.value !== 'any')
function resetQuery() {
  setQuery({ q: undefined, priority: undefined, category: undefined })
}

const emptyCopy = computed(() => {
  if (hasQuery.value) return { icon: Search, title: 'No matching tasks', text: 'Try a different search or reset the filters.' }
  return (
    {
      completed: { icon: CircleCheckBig, title: 'Nothing completed yet', text: 'Tick off a task and it will show up here.' },
      active: { icon: Sparkles, title: 'All caught up', text: 'Every task is done. Add something new when you are ready.' },
      overdue: { icon: AlertTriangle, title: 'Nothing overdue', text: 'You are on top of every deadline.' },
      today: { icon: CalendarClock, title: 'Nothing due today', text: 'Enjoy the breathing room, or schedule something.' },
      upcoming: { icon: CalendarRange, title: 'No upcoming deadlines', text: 'Nothing is due in the next 7 days.' },
    }[status.value] ?? { icon: Sparkles, title: 'A fresh start', text: 'Create your first task to get going.' }
  )
})

const selectClass =
  'cursor-pointer appearance-none rounded-lg border border-zinc-200 bg-white py-1.5 pr-3 pl-7 text-xs font-medium outline-none transition hover:border-zinc-300 focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
</script>

<template>
  <div>
    <PageHeader eyebrow="Manage" title="All tasks" :description="`${stats.remaining} open · ${stats.completed} completed`">
      <template #actions>
        <RouterLink
          to="/tasks/new"
          class="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-500 active:scale-[0.97] dark:bg-indigo-500 dark:hover:bg-indigo-400"
        >
          <Plus class="size-4" :stroke-width="2.5" /> New task
        </RouterLink>
      </template>
    </PageHeader>

    <!-- Status tabs -->
    <div class="mt-8 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div class="inline-flex min-w-full gap-1 rounded-xl bg-zinc-200/60 p-1 sm:min-w-0 dark:bg-zinc-800/70" role="tablist" aria-label="Status">
        <button
          v-for="f in STATUS_FILTERS"
          :key="f.id"
          role="tab"
          :aria-selected="status === f.id"
          @click="setStatus(f.id)"
          :class="[
            'flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition sm:flex-none',
            status === f.id ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200',
          ]"
        >
          {{ f.short }}
          <span
            :class="[
              'font-mono text-xs tabular-nums',
              f.id === 'overdue' && statusCounts.overdue ? 'text-rose-500' : 'text-zinc-400',
            ]"
            >{{ statusCounts[f.id] }}</span
          >
        </button>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="mt-5 flex flex-wrap items-center gap-2">
      <div class="relative w-full sm:w-56">
        <Search class="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-zinc-400" />
        <input
          :value="search"
          @input="setQuery({ q: $event.target.value })"
          type="search"
          placeholder="Filter by keyword"
          aria-label="Filter tasks by keyword"
          class="w-full rounded-lg border border-zinc-200 bg-white py-1.5 pr-3 pl-7 text-xs outline-none placeholder:text-zinc-400 focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 [&::-webkit-search-cancel-button]:hidden"
        />
      </div>

      <label class="relative">
        <span class="sr-only">Priority filter</span>
        <Flag class="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-zinc-400" />
        <select :value="priority" @change="setPriority($event.target.value)" :class="[selectClass, 'capitalize']">
          <option value="any">Any priority</option>
          <option v-for="p in PRIORITIES" :key="p" :value="p">{{ p }}</option>
        </select>
      </label>

      <label v-if="categories.length" class="relative">
        <span class="sr-only">Category filter</span>
        <Tag class="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-zinc-400" />
        <select :value="category" @change="setCategory($event.target.value)" :class="selectClass">
          <option value="any">Any category</option>
          <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
        </select>
      </label>

      <label class="relative">
        <span class="sr-only">Sort by</span>
        <ArrowUpDown class="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-zinc-400" />
        <select :value="sort" @change="setSort($event.target.value)" :class="selectClass">
          <option v-for="s in SORT_OPTIONS" :key="s.id" :value="s.id">Sort: {{ s.label }}</option>
        </select>
      </label>

      <div class="ml-auto flex items-center gap-2">
        <button
          v-if="stats.completed && (status === 'completed' || status === 'all')"
          @click="clearCompleted"
          class="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition hover:text-rose-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-rose-400"
        >
          <Trash2 class="size-3.5" /> Clear completed
        </button>
        <div class="flex rounded-lg border border-zinc-200 bg-white p-0.5 dark:border-zinc-800 dark:bg-zinc-900" role="group" aria-label="Layout">
          <button
            v-for="v in [{ id: 'list', icon: List, label: 'List view' }, { id: 'grid', icon: LayoutGrid, label: 'Grid view' }]"
            :key="v.id"
            @click="setView(v.id)"
            :aria-pressed="view === v.id"
            :aria-label="v.label"
            :title="v.label"
            :class="[
              'grid size-7 cursor-pointer place-items-center rounded-md transition',
              view === v.id ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200',
            ]"
          >
            <component :is="v.icon" class="size-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Active filter chips -->
    <Transition name="fade">
      <div v-if="hasQuery" class="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <button v-if="search.trim()" @click="setQuery({ q: undefined })" class="inline-flex cursor-pointer items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20">
          Matching “{{ search.trim() }}” <X class="size-3" />
        </button>
        <button v-if="priority !== 'any'" @click="setPriority('any')" class="inline-flex cursor-pointer items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 capitalize text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20">
          {{ priority }} priority <X class="size-3" />
        </button>
        <button v-if="category !== 'any'" @click="setCategory('any')" class="inline-flex cursor-pointer items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20">
          {{ category }} <X class="size-3" />
        </button>
        <button @click="resetQuery" class="cursor-pointer text-zinc-500 underline-offset-2 hover:underline">Reset</button>
      </div>
    </Transition>

    <h2 class="mt-6 text-sm font-semibold">
      {{ current.label }}
      <span class="ml-1 font-mono font-normal text-zinc-400 tabular-nums">{{ visible.length }}</span>
    </h2>

    <div class="relative mt-3">
      <TransitionGroup v-if="view === 'list'" tag="ul" name="task" class="relative space-y-2">
        <TaskItem v-for="t in visible" :key="t.id" :task="t" @toggle="toggle(t)" @delete="remove(t)" />
      </TransitionGroup>
      <TransitionGroup v-else tag="ul" name="task" class="relative grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <TaskCard v-for="t in visible" :key="t.id" :task="t" @toggle="toggle(t)" @delete="remove(t)" />
      </TransitionGroup>

      <Transition name="fade">
        <EmptyState v-if="!visible.length" v-bind="emptyCopy">
          <button
            v-if="hasQuery"
            @click="resetQuery"
            class="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-600 ring-1 ring-indigo-200 transition ring-inset hover:bg-indigo-50 dark:text-indigo-400 dark:ring-indigo-500/30 dark:hover:bg-indigo-500/10"
          >
            Reset filters
          </button>
          <RouterLink
            v-else-if="status !== 'completed'"
            to="/tasks/new"
            class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-600 ring-1 ring-indigo-200 transition ring-inset hover:bg-indigo-50 dark:text-indigo-400 dark:ring-indigo-500/30 dark:hover:bg-indigo-500/10"
          >
            <Plus class="size-4" /> New task
          </RouterLink>
        </EmptyState>
      </Transition>
    </div>
  </div>
</template>
