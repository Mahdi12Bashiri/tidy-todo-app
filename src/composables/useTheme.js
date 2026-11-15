import { ref, computed, watch } from 'vue'

const KEY = 'tidy-theme'
export const THEME_MODES = ['light', 'dark', 'system']

const media = window.matchMedia('(prefers-color-scheme: dark)')
const systemDark = ref(media.matches)
media.addEventListener?.('change', (e) => (systemDark.value = e.matches))

function readMode() {
  try {
    const v = localStorage.getItem(KEY)
    return THEME_MODES.includes(v) ? v : 'system'
  } catch {
    return 'system'
  }
}

const mode = ref(readMode())
const isDark = computed(() => (mode.value === 'system' ? systemDark.value : mode.value === 'dark'))

watch(isDark, (dark) => document.documentElement.classList.toggle('dark', dark), { immediate: true })
watch(mode, (m) => {
  try {
    localStorage.setItem(KEY, m)
  } catch {}
})

export function useTheme() {
  const toggle = () => (mode.value = isDark.value ? 'light' : 'dark')
  const setMode = (m) => THEME_MODES.includes(m) && (mode.value = m)
  return { mode, isDark, toggle, setMode }
}
