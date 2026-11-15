<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { X } from 'lucide-vue-next'
import AppSidebar from './components/layout/AppSidebar.vue'
import AppTopbar from './components/layout/AppTopbar.vue'
import ToastHost from './components/ToastHost.vue'
import { maybeSendDailyDigest } from './composables/useNotifications'

const route = useRoute()
const router = useRouter()
const topbar = ref(null)
const drawerOpen = ref(false)

watch(() => route.fullPath, () => (drawerOpen.value = false))
watch(drawerOpen, (open) => document.body.classList.toggle('overflow-hidden', open))

// ---- Keyboard shortcuts ----
function onKey(e) {
  if (e.key === 'Escape' && drawerOpen.value) {
    drawerOpen.value = false
    return
  }
  const tag = e.target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) return
  if (e.metaKey || e.ctrlKey || e.altKey || document.querySelector('[role="dialog"]')) return
  if (e.key === '/') {
    e.preventDefault()
    topbar.value?.focusSearch()
  } else if (e.key === 'n' && route.name !== 'task-new') {
    e.preventDefault()
    router.push('/tasks/new')
  }
}
onMounted(() => {
  window.addEventListener('keydown', onKey)
  maybeSendDailyDigest()
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="min-h-screen lg:flex">
    <!-- Sidebar (desktop) -->
    <aside
      class="sticky top-0 hidden h-screen w-72 shrink-0 overflow-y-auto border-r border-zinc-200/80 bg-white/70 px-5 py-6 backdrop-blur lg:block dark:border-zinc-800 dark:bg-zinc-900/50"
    >
      <AppSidebar />
    </aside>

    <!-- Sidebar (mobile drawer) -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="drawerOpen" class="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div class="drawer-backdrop absolute inset-0 bg-zinc-950/40 backdrop-blur-sm" @click="drawerOpen = false" />
          <div
            class="drawer-panel relative h-full w-72 max-w-[85vw] overflow-y-auto border-r border-zinc-200 bg-white px-5 py-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
          >
            <button
              @click="drawerOpen = false"
              aria-label="Close navigation"
              class="absolute top-6 right-4 grid size-8 cursor-pointer place-items-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <X class="size-4" />
            </button>
            <AppSidebar @navigate="drawerOpen = false" />
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Main -->
    <div class="min-w-0 flex-1">
      <AppTopbar ref="topbar" @open-menu="drawerOpen = true" />
      <main class="mx-auto max-w-6xl px-4 pt-8 pb-24 sm:px-6 lg:px-10">
        <RouterView v-slot="{ Component, route: r }">
          <Transition name="page" mode="out-in">
            <component :is="Component" :key="r.path" />
          </Transition>
        </RouterView>
      </main>
    </div>

    <ToastHost />
  </div>
</template>
