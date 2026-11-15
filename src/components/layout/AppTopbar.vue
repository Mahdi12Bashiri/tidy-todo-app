<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CheckCheck, Search, Plus, Sun, Moon, X, Menu } from 'lucide-vue-next'
import { useTheme } from '../../composables/useTheme'

const emit = defineEmits(['open-menu'])
const route = useRoute()
const router = useRouter()
const { isDark, toggle } = useTheme()

const term = ref('')
const input = ref(null)

// Keep the box in sync with the All Tasks page's ?q= param.
watch(
  () => [route.name, route.query.q],
  ([name, q]) => {
    if (name === 'tasks') term.value = typeof q === 'string' ? q : ''
    else if (document.activeElement !== input.value) term.value = ''
  },
  { immediate: true },
)

function onInput() {
  const q = term.value || undefined
  if (route.name === 'tasks') router.replace({ query: { ...route.query, q } })
  else if (q) router.push({ path: '/tasks', query: { q } })
}
function clear() {
  term.value = ''
  onInput()
  input.value?.focus()
}
function onSubmit() {
  if (route.name !== 'tasks') router.push({ path: '/tasks', query: term.value ? { q: term.value } : {} })
}

defineExpose({ focusSearch: () => input.value?.focus() })
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-zinc-200/80 bg-zinc-50/80 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/80">
    <div class="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-10">
      <div class="flex items-center gap-1.5 lg:hidden">
        <button
          @click="emit('open-menu')"
          aria-label="Open navigation"
          class="grid size-9 cursor-pointer place-items-center rounded-xl text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
        >
          <Menu class="size-5" />
        </button>
        <RouterLink to="/" class="flex items-center gap-2" aria-label="Tidy dashboard">
          <span class="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white">
            <CheckCheck class="size-4" :stroke-width="2.5" />
          </span>
          <span class="hidden font-semibold tracking-tight sm:inline">Tidy</span>
        </RouterLink>
      </div>

      <form role="search" class="relative flex-1 lg:max-w-md" @submit.prevent="onSubmit">
        <Search class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
        <input
          ref="input"
          v-model="term"
          @input="onInput"
          type="search"
          placeholder="Search tasks…"
          aria-label="Search tasks"
          class="w-full rounded-xl border border-zinc-200 bg-white py-2 pr-14 pl-9 text-sm transition outline-none placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900 [&::-webkit-search-cancel-button]:hidden"
        />
        <button
          v-if="term"
          type="button"
          @click="clear"
          aria-label="Clear search"
          class="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 cursor-pointer place-items-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
        >
          <X class="size-3.5" />
        </button>
        <kbd
          v-else
          class="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded border border-zinc-200 px-1.5 font-mono text-[10px] text-zinc-400 sm:block dark:border-zinc-700"
          >/</kbd
        >
      </form>

      <div class="ml-auto flex items-center gap-2">
        <button
          @click="toggle"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          :title="isDark ? 'Light mode' : 'Dark mode'"
          class="relative grid size-9 cursor-pointer place-items-center overflow-hidden rounded-xl border border-zinc-200 bg-white text-zinc-600 transition hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-white"
        >
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="rotate-90 scale-50 opacity-0"
            leave-active-class="absolute transition duration-200 ease-in"
            leave-to-class="-rotate-90 scale-50 opacity-0"
          >
            <Moon v-if="!isDark" class="size-4" key="moon" />
            <Sun v-else class="size-4" key="sun" />
          </Transition>
        </button>
        <RouterLink
          to="/tasks/new"
          class="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-500 active:scale-[0.97] sm:px-4 lg:hidden dark:bg-indigo-500 dark:hover:bg-indigo-400"
          aria-label="New task"
        >
          <Plus class="size-4" :stroke-width="2.5" />
          <span class="hidden sm:inline">New task</span>
        </RouterLink>
      </div>
    </div>
  </header>
</template>
