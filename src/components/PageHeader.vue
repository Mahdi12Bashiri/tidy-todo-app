<script setup>
defineProps({ eyebrow: String, title: String, description: String })
</script>

<template>
  <header class="flex flex-wrap items-end justify-between gap-4">
    <div class="min-w-0">
      <p v-if="eyebrow" class="text-sm text-zinc-500 dark:text-zinc-400">{{ eyebrow }}</p>
      <h1 class="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{{ title }}</h1>
      <p v-if="description" class="mt-2 text-zinc-500 dark:text-zinc-400">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2"><slot name="actions" /></div>
  </header>
</template>
