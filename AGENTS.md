# AGENTS.md

## Overview
Tidy is a client-only, multi-page Vue 3 + Vite + Vue Router productivity app (Dashboard, All tasks, task detail/create/edit, Calendar, Analytics, Settings). It has no backend. All task data lives in `localStorage`, as the product spec requires. It deploys to Netlify as a static SPA (`netlify.toml`: build `npm run build`, publish `dist`, SPA fallback redirect).

## Structure
- `index.html`: loads the fonts (Geist / Geist Mono) and runs an inline script that applies the `dark` class before paint, based on the stored `light`/`dark`/`system` mode.
- `src/router.js`: history-mode routes: `/`, `/tasks`, `/tasks/new`, `/tasks/:id`, `/tasks/:id/edit`, `/calendar`, `/insights`, `/settings`, and a catch-all not-found page. Views are imported **eagerly** on purpose, so a tab left open across a deploy can't fail to load an old chunk.
- `src/App.vue`: app shell (desktop sidebar, mobile/tablet drawer below `lg`, top bar, `<RouterView>` with a page transition, toast host, `N` and `/` shortcuts).
- `src/composables/useTasks.js`: **the single source of truth** for tasks. It holds a module-level reactive singleton persisted under `tidy-tasks-v1`, plus pure helpers (`queryTasks`, `sortTasks`, `isOverdue`, `isDueToday`, `isUpcoming`, `todayISO`, and `STATUS_FILTERS`/`SORT_OPTIONS`). The sanitized list is written back on load so generated ids stay stable.
- `useTaskActions.js` (mutations with toast and undo), `useToast.js`, `useSettings.js` (`tidy-settings-v1`: default sort/view, week start, notification prefs), `useTheme.js` (`tidy-theme`), `useNotifications.js` (optional daily browser notification).
- `src/views/`: one component per page. Filter, sort, view, and calendar date state live in the URL query, so they survive a refresh and work with back/forward.
- `src/components/`: shared UI (`TaskItem`, `TaskCard`, `TaskBadges`, `TaskCheckbox`, `StatCard`, `QuickAdd`, `EmptyState`, `PageHeader`, `ConfirmDialog`, `ProgressRing`, `ToastHost`, `layout/AppSidebar`, `layout/AppTopbar`).
- `src/utils/format.js`: date labels and priority color classes.

## Conventions and decisions
- The task shape is `{ id, title, description, priority: 'low'|'medium'|'high', dueDate: 'YYYY-MM-DD' | '', category, completed, createdAt, completedAt }`. `load()` sanitizes stored data, so make schema changes there (and bump the storage key if the change is breaking).
- Due dates are local-time ISO date strings, compared as strings against `todayISO()`.
- First-time visitors (no storage key yet) get a few seed tasks. Once the key exists, an empty list stays empty.
- Deleting is immediate and comes with a 5-second undo toast.
- Styling uses Tailwind utilities only, with zinc neutrals and an indigo accent. Every color needs a matching `dark:` variant.
