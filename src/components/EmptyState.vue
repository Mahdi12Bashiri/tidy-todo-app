<script setup>
defineProps({ icon: [Object, Function], title: String, text: String, compact: Boolean })
</script>

<template>
  <div
    :class="[
      'flex flex-col items-center rounded-2xl border border-dashed border-zinc-300 px-6 text-center dark:border-zinc-700',
      compact ? 'py-10' : 'py-16',
    ]"
  >
    <span class="grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
      <component :is="icon" class="size-6" />
    </span>
    <h3 class="mt-4 font-semibold">{{ title }}</h3>
    <p v-if="text" class="mt-1 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">{{ text }}</p>
    <div v-if="$slots.default" class="mt-5 flex flex-wrap justify-center gap-2"><slot /></div>
  </div>
</template>
