<script setup>
import { ref } from 'vue'
import { Download, Trash2 } from 'lucide-vue-next'
import { useTasks, SORT_OPTIONS } from '../composables/useTasks'
import { useTheme, THEME_MODES } from '../composables/useTheme'
import { useSettings } from '../composables/useSettings'
import { useTaskActions } from '../composables/useTaskActions'
import { requestPermission, notificationsSupported } from '../composables/useNotifications'
import { useToast } from '../composables/useToast'
import PageHeader from '../components/PageHeader.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const { tasks } = useTasks()
const { mode, setMode } = useTheme()
const { settings } = useSettings()
const { clearAll } = useTaskActions()
const { show } = useToast()
const confirmOpen = ref(false)

const notifLabels = {
  completionToasts: 'Show a toast with undo when completing a task',
  overdueBanner: 'Show an overdue banner on the dashboard',
  dailyDigest: 'Daily browser notification with today’s tasks',
}

async function toggleNotif(k) {
  const next = !settings.notifications[k]
  if (k === 'dailyDigest' && next) {
    const p = await requestPermission()
    if (p !== 'granted') return show(notificationsSupported ? 'Notification permission was not granted' : 'Notifications are not supported here')
  }
  settings.notifications[k] = next
}

function exportJSON() {
  const blob = new Blob([JSON.stringify(tasks.value, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `tidy-tasks-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(a.href)
  show(`Exported ${tasks.value.length} tasks`)
}

function confirmClear() {
  clearAll()
  confirmOpen.value = false
}

const card = 'rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900'
const seg = (on) => ['cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition', on ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200']
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <PageHeader eyebrow="Preferences" title="Settings" description="Settings are saved in this browser." />

    <div class="mt-8 space-y-4">
      <section :class="card">
        <h2 class="font-semibold">Appearance</h2>
        <div class="mt-4 inline-flex rounded-xl bg-zinc-200/60 p-1 dark:bg-zinc-800/70">
          <button v-for="m in THEME_MODES" :key="m" @click="setMode(m)" :aria-pressed="mode === m" :class="seg(mode === m)">{{ m }}</button>
        </div>
      </section>

      <section :class="card">
        <h2 class="font-semibold">Tasks</h2>
        <div class="mt-4 grid gap-4 sm:grid-cols-3">
          <label class="text-sm">
            <span class="text-zinc-500 dark:text-zinc-400">Default sorting</span>
            <select v-model="settings.defaultSort" class="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2 py-2 dark:border-zinc-700 dark:bg-zinc-800">
              <option v-for="s in SORT_OPTIONS" :key="s.id" :value="s.id">{{ s.label }}</option>
            </select>
          </label>
          <label class="text-sm">
            <span class="text-zinc-500 dark:text-zinc-400">Default layout</span>
            <select v-model="settings.defaultView" class="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2 py-2 dark:border-zinc-700 dark:bg-zinc-800">
              <option value="list">List</option><option value="grid">Grid</option>
            </select>
          </label>
          <label class="text-sm">
            <span class="text-zinc-500 dark:text-zinc-400">Week starts on</span>
            <select v-model.number="settings.weekStartsOn" class="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2 py-2 dark:border-zinc-700 dark:bg-zinc-800">
              <option :value="1">Monday</option><option :value="0">Sunday</option>
            </select>
          </label>
        </div>
      </section>

      <section :class="card">
        <h2 class="font-semibold">Notifications</h2>
        <ul class="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
          <li v-for="(label, k) in notifLabels" :key="k" class="flex items-center justify-between gap-4 py-3 text-sm">
            <span>{{ label }}</span>
            <button
              role="switch" :aria-checked="settings.notifications[k]" :aria-label="label" @click="toggleNotif(k)"
              :class="['relative h-6 w-10 shrink-0 cursor-pointer rounded-full transition', settings.notifications[k] ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-zinc-300 dark:bg-zinc-700']"
            >
              <span :class="['absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform', settings.notifications[k] ? 'translate-x-4' : '']" />
            </button>
          </li>
        </ul>
      </section>

      <section :class="card">
        <h2 class="font-semibold">Data</h2>
        <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{{ tasks.length }} tasks stored in this browser.</p>
        <div class="mt-4 flex flex-wrap gap-2">
          <button @click="exportJSON" class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium ring-1 ring-zinc-200 ring-inset hover:bg-zinc-50 dark:ring-zinc-700 dark:hover:bg-zinc-800">
            <Download class="size-4" /> Export as JSON
          </button>
          <button :disabled="!tasks.length" @click="confirmOpen = true" class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-rose-600 ring-1 ring-rose-200 ring-inset hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-rose-400 dark:ring-rose-500/30 dark:hover:bg-rose-500/10">
            <Trash2 class="size-4" /> Clear all tasks
          </button>
        </div>
      </section>
    </div>

    <ConfirmDialog :open="confirmOpen" title="Clear all tasks?" :message="`This deletes all ${tasks.length} tasks from this browser.`" confirm-label="Delete all" @confirm="confirmClear" @cancel="confirmOpen = false" />
  </div>
</template>
