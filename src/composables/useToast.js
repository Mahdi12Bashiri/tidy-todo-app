import { ref } from 'vue'

const toast = ref(null)
let timer

/** Show a toast. `action` is optional: { label, icon?, run }. */
function show(message, action = null, duration = 5000) {
  clearTimeout(timer)
  toast.value = { id: Date.now(), message, action }
  timer = setTimeout(() => (toast.value = null), duration)
}

function dismiss() {
  clearTimeout(timer)
  toast.value = null
}

function runAction() {
  toast.value?.action?.run?.()
  dismiss()
}

export function useToast() {
  return { toast, show, dismiss, runAction }
}
