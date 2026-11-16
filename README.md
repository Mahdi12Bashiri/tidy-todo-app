# Tidy — Task Management & Productivity

A modern, responsive task management app for organizing everyday work. Tidy brings task planning, calendar views, productivity insights, and personal preferences into one clean workspace.

**Live demo:** https://mahdi12bashiri.github.io/tidy-todo-app/  
**Alternative demo (Netlify):** https://my-tidy-app.netlify.app  
**Source code:** https://github.com/Mahdi12Bashiri/tidy-todo-app

## Features

### Task management
- Create, view, edit, and delete tasks.
- Mark tasks as complete or active.
- Set a task priority: Low, Medium, or High.
- Add descriptions, categories, and due dates.
- Search tasks and filter by status, priority, or other task views.
- Sort tasks by smart order, due date, priority, or creation time.
- Undo supported task actions where available.

### Workspace and productivity
- **Dashboard:** See task totals, completed and remaining work, overdue items, tasks due today, and upcoming tasks.
- **All tasks:** Manage tasks in one place with filtering, sorting, and list/grid layouts.
- **Task details:** Open a dedicated page for each task and access its editing actions.
- **Calendar:** Review scheduled tasks in monthly and weekly views.
- **Analytics:** See completion progress, task status, priority distribution, and recent activity based on your task data.
- **Settings:** Choose the appearance, default sorting and layout, week start day, and notification preferences. Export task data as JSON.

### Experience
- Responsive layout for desktop, tablet, and mobile.
- Light, dark, and system appearance modes.
- Keyboard shortcuts: `N` to focus quick add, `/` to focus search, and `Esc` to close dialogs.
- Task and preference data persist in the browser.
- Updates are synchronized across open tabs in the same browser.

## Tech stack

- [Vue 3](https://vuejs.org/) — Composition API and `<script setup>`
- [Vue Router](https://router.vuejs.org/) — client-side routing
- [Vite](https://vite.dev/) — development server and build tooling
- [Tailwind CSS v4](https://tailwindcss.com/) — styling
- [Lucide](https://lucide.dev/) — icons via `lucide-vue-next`
- [GitHub Pages](https://pages.github.com/) — static site hosting
- [GitHub Actions](https://github.com/features/actions) — automated build and deployment
- [Netlify](https://www.netlify.com/) — alternative hosting configuration

## Run locally

### Requirements
- Node.js (a current LTS version is recommended)
- npm

### Setup

```bash
git clone https://github.com/Mahdi12Bashiri/tidy-todo-app.git
cd tidy-todo-app
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal.

### Production build

```bash
npm run build
npm run preview
```

The production build is generated in the `dist/` directory.

## Data and privacy

Tidy is currently a **client-side application**. Tasks and preferences are stored in the browser using LocalStorage; there is no backend database, account system, or cloud synchronization at this stage.

That means data belongs to the browser and device where it was created. It is not automatically shared between different devices or browsers. Use the JSON export in Settings to make a copy of your task data.

## Deployment

The primary public deployment uses GitHub Pages and GitHub Actions:
- Workflow: `.github/workflows/deploy.yml`
- The workflow builds the app with the `/tidy-todo-app/` base path and hash-based routing, then publishes the `dist/` directory to GitHub Pages.
- Every push to `main` triggers a new build and deployment; the workflow can also be started manually from the Actions tab.

The project also retains its Netlify configuration as an alternative deployment target:
- Build command: `npm run build`
- Publish directory: `dist`
- SPA fallback is configured in `netlify.toml` for nested application routes.

---

Built as a personal web development project by [Mahdi Bashiri](https://github.com/Mahdi12Bashiri).
