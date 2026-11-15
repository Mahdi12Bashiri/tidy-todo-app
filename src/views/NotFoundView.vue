<script setup>
import { Compass } from 'lucide-vue-next'
import EmptyState from '../components/EmptyState.vue'
</script>

<template>
  <EmptyState :icon="Compass" title="Page not found" text="The page you are looking for doesn't exist.">
    <RouterLink to="/" class="rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-600 ring-1 ring-indigo-200 ring-inset hover:bg-indigo-50 dark:text-indigo-400 dark:ring-indigo-500/30 dark:hover:bg-indigo-500/10">Back to dashboard</RouterLink>
  </EmptyState>
</template>
