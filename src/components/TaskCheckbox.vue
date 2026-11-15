<script setup>
import { Check } from 'lucide-vue-next'
defineProps({ checked: Boolean, size: { type: String, default: 'size-5' } })
defineEmits(['toggle'])
</script>

<template>
  <button
    type="button"
    role="checkbox"
    :aria-checked="checked"
    :aria-label="checked ? 'Mark as active' : 'Mark as completed'"
    @click.stop="$emit('toggle')"
    :class="[
      'grid shrink-0 cursor-pointer place-items-center rounded-full border-2 transition-all duration-200 active:scale-90',
      size,
      checked
        ? 'border-indigo-600 bg-indigo-600 text-white dark:border-indigo-500 dark:bg-indigo-500'
        : 'border-zinc-300 hover:border-indigo-500 dark:border-zinc-600 dark:hover:border-indigo-400',
    ]"
  >
    <Check :class="['size-3 transition-transform duration-200', checked ? 'scale-100' : 'scale-0']" :stroke-width="3.5" />
  </button>
</template>
