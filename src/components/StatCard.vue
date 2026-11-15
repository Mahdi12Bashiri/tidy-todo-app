<script setup>
import { RouterLink } from 'vue-router'
defineProps({
  label: String,
  value: Number,
  hint: String,
  icon: [Object, Function],
  tone: { type: String, default: 'zinc' },
  to: { type: [String, Object], default: null },
})

const tones = {
  zinc: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
}
</script>

<template>
  <component
    :is="to ? RouterLink : 'div'"
    :to="to || undefined"
    class="group block rounded-2xl border border-zinc-200/80 bg-white p-4 transition-all duration-300 outline-none hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/50 focus-visible:ring-4 focus-visible:ring-indigo-500/20 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:shadow-black/30"
  >
    <div class="flex items-center justify-between">
      <span class="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">{{ label }}</span>
      <span :class="['grid size-8 place-items-center rounded-lg transition-transform duration-300 group-hover:scale-110', tones[tone]]">
        <component :is="icon" class="size-4" :stroke-width="2.2" />
      </span>
    </div>
    <Transition name="fade" mode="out-in">
      <p :key="value" class="mt-3 font-mono text-3xl font-medium tracking-tight tabular-nums">{{ value }}</p>
    </Transition>
    <p v-if="hint" class="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">{{ hint }}</p>
  </component>
</template>
