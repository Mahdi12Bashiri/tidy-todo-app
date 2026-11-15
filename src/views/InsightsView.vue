<script setup>
import { computed } from 'vue'
import { useTasks, PRIORITIES, todayISO } from '../composables/useTasks'
import { toISODate } from '../composables/useTasks'
import { priorityDots } from '../utils/format'
import PageHeader from '../components/PageHeader.vue'
import ProgressRing from '../components/ProgressRing.vue'

const { tasks, stats } = useTasks()

const priority = computed(() =>
  PRIORITIES.map((p) => {
    const list = tasks.value.filter((t) => t.priority === p)
    return { p, total: list.length, done: list.filter((t) => t.completed).length }
  }),
)
const maxPriority = computed(() => Math.max(1, ...priority.value.map((x) => x.total)))

// Completions per day over the last 7 days.
const week = computed(() =>
  Array.from({ length: 7 }, (_, i) => {
    const iso = todayISO(i - 6)
    const done = tasks.value.filter((t) => t.completedAt && toISODate(new Date(t.completedAt)) === iso).length
    const created = tasks.value.filter((t) => toISODate(new Date(t.createdAt)) === iso).length
    return { iso, done, created, label: new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' }) }
  }),
)
const maxWeek = computed(() => Math.max(1, ...week.value.flatMap((d) => [d.done, d.created])))
const weekDone = computed(() => week.value.reduce((n, d) => n + d.done, 0))
const card = 'rounded-2xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900'
</script>

<template>
  <div>
    <PageHeader eyebrow="Insights" title="Analytics" description="How your work is going, based on your real task data." />

    <div class="mt-8 grid gap-4 lg:grid-cols-3">
      <section :class="card">
        <h2 class="text-sm font-semibold">Completion rate</h2>
        <div class="mt-4 flex items-center gap-5">
          <ProgressRing :value="stats.progress" class="size-28" :stroke="10" />
          <div>
            <p class="font-mono text-3xl font-medium tabular-nums">{{ stats.progress }}%</p>
            <p class="text-sm text-zinc-500 dark:text-zinc-400">{{ stats.completed }} of {{ stats.total }} tasks</p>
          </div>
        </div>
      </section>

      <section :class="card">
        <h2 class="text-sm font-semibold">Completed vs pending</h2>
        <div class="mt-6 flex h-3 gap-0.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div class="bg-indigo-600 transition-all dark:bg-indigo-400" :style="{ width: stats.progress + '%' }" />
          <div class="flex-1 bg-zinc-300 dark:bg-zinc-600" v-if="stats.remaining" />
        </div>
        <dl class="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div><dt class="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400"><span class="size-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />Completed</dt><dd class="font-mono text-xl tabular-nums">{{ stats.completed }}</dd></div>
          <div><dt class="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400"><span class="size-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />Pending</dt><dd class="font-mono text-xl tabular-nums">{{ stats.remaining }}</dd></div>
        </dl>
        <p class="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{{ stats.overdue }} overdue · {{ stats.dueToday }} due today</p>
      </section>

      <section :class="card">
        <h2 class="text-sm font-semibold">Priority distribution</h2>
        <ul class="mt-4 space-y-3">
          <li v-for="x in priority" :key="x.p" :title="`${x.total} ${x.p} priority, ${x.done} done`">
            <div class="flex items-center justify-between text-sm capitalize">
              <span class="flex items-center gap-1.5"><span :class="['size-2 rounded-full', priorityDots[x.p]]" />{{ x.p }}</span>
              <span class="font-mono text-zinc-500 tabular-nums dark:text-zinc-400">{{ x.total }}</span>
            </div>
            <div class="mt-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div :class="['h-full rounded-full transition-all', priorityDots[x.p]]" :style="{ width: (x.total / maxPriority) * 100 + '%' }" />
            </div>
          </li>
        </ul>
      </section>
    </div>

    <section :class="[card, 'mt-4']">
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <h2 class="text-sm font-semibold">Last 7 days</h2>
        <p class="text-xs text-zinc-500 dark:text-zinc-400">{{ weekDone }} completed this week</p>
      </div>
      <div class="mt-2 flex gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span class="flex items-center gap-1.5"><span class="size-2 rounded-sm bg-indigo-600 dark:bg-indigo-400" />Completed</span>
        <span class="flex items-center gap-1.5"><span class="size-2 rounded-sm bg-zinc-300 dark:bg-zinc-600" />Created</span>
      </div>
      <div class="mt-4 grid h-48 grid-cols-7 items-end gap-2">
        <div v-for="d in week" :key="d.iso" class="flex h-full flex-col justify-end" :title="`${d.label}: ${d.done} completed, ${d.created} created`">
          <div class="flex flex-1 items-end justify-center gap-0.5">
            <div class="w-3 rounded-t bg-indigo-600 transition-all dark:bg-indigo-400" :style="{ height: (d.done / maxWeek) * 100 + '%' }" />
            <div class="w-3 rounded-t bg-zinc-300 transition-all dark:bg-zinc-600" :style="{ height: (d.created / maxWeek) * 100 + '%' }" />
          </div>
          <p class="mt-2 text-center text-[11px] text-zinc-400">{{ d.label }}</p>
        </div>
      </div>
    </section>
  </div>
</template>
