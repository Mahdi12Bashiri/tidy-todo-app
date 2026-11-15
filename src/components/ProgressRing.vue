<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, default: 0 }, // 0–100
  stroke: { type: Number, default: 8 },
})
const RADIUS = computed(() => 40 - props.stroke / 2 - 2)
const CIRC = computed(() => 2 * Math.PI * RADIUS.value)
const offset = computed(() => CIRC.value - (Math.min(100, Math.max(0, props.value)) / 100) * CIRC.value)
</script>

<template>
  <svg viewBox="0 0 80 80" class="-rotate-90" role="img" :aria-label="`${value}% complete`">
    <circle cx="40" cy="40" :r="RADIUS" fill="none" :stroke-width="stroke" class="stroke-zinc-100 dark:stroke-zinc-800" />
    <circle
      cx="40" cy="40" :r="RADIUS" fill="none" :stroke-width="stroke" stroke-linecap="round"
      class="stroke-indigo-600 transition-[stroke-dashoffset] duration-700 ease-out dark:stroke-indigo-400"
      :stroke-dasharray="CIRC" :stroke-dashoffset="offset"
    />
  </svg>
</template>
