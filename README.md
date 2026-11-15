# Tidy — a minimal task dashboard

Tidy is a clean, responsive to-do list built with Vue 3. It's a dashboard where you add, edit, prioritize, schedule, and complete tasks, and it works the same on desktop, tablet, and mobile. Tasks are stored in the browser's LocalStorage, so they're still there after a page refresh.

## Features

- Add tasks with the quick-add bar (press Enter) or open the full **New task** dialog
- Edit, delete (with undo), and complete tasks
- Low / Medium / High priorities, plus due dates with Today / Tomorrow / Next week shortcuts
- Filter by All / Active / Completed and by priority; search as you type
- Sort by Smart (overdue first, then due date), Due date, Priority, or Newest
- Stats for total, completed, remaining, and overdue tasks, plus a progress ring
- Light and dark mode (follows your system setting at first, then remembers your choice)
- Keyboard shortcuts: `N` focuses quick add, `/` focuses search, `Esc` closes dialogs
- Changes sync across open tabs

## Tech stack

- [Vue 3](https://vuejs.org) (Composition API, `<script setup>`)
- [Vite](https://vite.dev)
- [Tailwind CSS v4](https://tailwindcss.com) via `@tailwindcss/vite`
- [Lucide Icons](https://lucide.dev) (`lucide-vue-next`)
- Deployed as a static site on Netlify

## Running locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints. To create a production build, run `npm run build`; the output goes to `dist/`.
