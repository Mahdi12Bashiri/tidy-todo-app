<script setup>
import { Undo2, X } from 'lucide-vue-next'
import { useToast } from '../composables/useToast'

const { toast, dismiss, runAction } = useToast()
</script>

<template>
  <Teleport to="body">
    <Transition name="fade" mode="out-in">
      <div
        v-if="toast"
        :key="toast.id"
        class="fixed bottom-5 left-1/2 z-[60] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-xl bg-zinc-900 py-2.5 pr-2 pl-4 text-sm text-white shadow-xl dark:bg-white dark:text-zinc-900"
        role="status"
        aria-live="polite"
      >
        <span class="truncate">{{ toast.message }}</span>
        <button
          v-if="toast.action"
          @click="runAction"
          class="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold transition hover:bg-white/20 dark:bg-zinc-900/10 dark:hover:bg-zinc-900/20"
        >
          <Undo2 v-if="toast.action.label === 'Undo'" class="size-3.5" /> {{ toast.action.label }}
        </button>
        <button
          @click="dismiss"
          aria-label="Dismiss"
          class="grid size-6 shrink-0 cursor-pointer place-items-center rounded-md text-white/60 transition hover:bg-white/10 hover:text-white dark:text-zinc-500 dark:hover:bg-zinc-900/10 dark:hover:text-zinc-900"
        >
          <X class="size-3.5" />
        </button>
      </div>
    </Transition>
  </Teleport>
</template>
