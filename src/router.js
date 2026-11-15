import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
// Views are bundled eagerly: the app is small, and avoiding lazy chunks means a
// tab left open across a deploy can never fail to load a page (e.g. the edit
// page on mobile) because an old chunk filename no longer exists.
import DashboardView from './views/DashboardView.vue'
import TasksView from './views/TasksView.vue'
import TaskFormView from './views/TaskFormView.vue'
import TaskDetailView from './views/TaskDetailView.vue'
import CalendarView from './views/CalendarView.vue'
import InsightsView from './views/InsightsView.vue'
import SettingsView from './views/SettingsView.vue'
import NotFoundView from './views/NotFoundView.vue'

const routes = [
  { path: '/', name: 'dashboard', component: DashboardView, meta: { title: 'Dashboard', nav: 'dashboard' } },
  { path: '/tasks', name: 'tasks', component: TasksView, meta: { title: 'All tasks', nav: 'tasks' } },
  { path: '/tasks/new', name: 'task-new', component: TaskFormView, meta: { title: 'New task', nav: 'tasks' } },
  { path: '/tasks/:id', name: 'task', component: TaskDetailView, props: true, meta: { title: 'Task', nav: 'tasks' } },
  { path: '/tasks/:id/edit', name: 'task-edit', component: TaskFormView, props: true, meta: { title: 'Edit task', nav: 'tasks' } },
  { path: '/calendar', name: 'calendar', component: CalendarView, meta: { title: 'Calendar', nav: 'calendar' } },
  { path: '/insights', name: 'insights', component: InsightsView, meta: { title: 'Analytics', nav: 'insights' } },
  { path: '/settings', name: 'settings', component: SettingsView, meta: { title: 'Settings', nav: 'settings' } },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView, meta: { title: 'Page not found' } },
]

// GitHub Pages hosts this project under /tidy-todo-app/ and does not provide
// SPA rewrites for arbitrary paths. Hash history keeps client-side routes
// working there, while Netlify keeps its existing clean URL history mode.
const history =
  import.meta.env.VITE_ROUTER_MODE === 'hash'
    ? createWebHashHistory(import.meta.env.BASE_URL)
    : createWebHistory(import.meta.env.BASE_URL)

const router = createRouter({
  history,
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    // Filter/sort changes on the same page shouldn't jump to the top.
    if (to.path === from.path) return false
    return { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · Tidy` : 'Tidy'
})

export default router
