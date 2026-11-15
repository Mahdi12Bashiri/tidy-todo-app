<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'

const props = defineProps({
  open: Boolean,
  title: String,
  message: String,
  confirmLabel: { type: String, default: 'Confirm' },
  danger: { type: Boolean, default: true },
})
const emit = defineEmits(['confirm', 'cancel'])
const cancelBtn = ref(null)

watch(
  () => props.open,
  async (open) => {
    if (!open) return
    await nextTick()
    cancelBtn.value?.focus()
  },
)

function onKey(e) {
  if (props.open && e.key === 'Escape') emit('cancel')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" :aria-label="title">
        <div class="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm" @click="emit('cancel')" />
        <div class="modal-panel relative w-full max-w-md rounded-t-3xl border border-zinc-200 bg-white p-6 shadow-2xl sm:rounded-2xl dark:border-zinc-800 dark:bg-zinc-900">
          <div class="flex gap-4">
            <span
              :class="[
                'grid size-10 shrink-0 place-items-center rounded-xl',
                danger ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
              ]"
            >
              <AlertTriangle class="size-5" />
            </span>
            <div>
              <h2 class="text-lg font-semibold tracking-tight">{{ title }}</h2>
              <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{{ message }}</p>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-2">
            <button
              ref="cancelBtn"
              type="button"
              @click="emit('cancel')"
              class="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="emit('confirm')"
              :class="[
                'cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98]',
                danger ? 'bg-rose-600 shadow-rose-600/30 hover:bg-rose-500 dark:bg-rose-500 dark:hover:bg-rose-400' : 'bg-indigo-600 shadow-indigo-600/30 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400',
              ]"
            >
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
