<script setup>
import { reactive, ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Flag, CalendarDays, Tag, AlignLeft, X, Type, SearchX, Info } from 'lucide-vue-next'
import { useTasks, PRIORITIES, LIMITS, DEFAULT_CATEGORIES, todayISO, isValidISODate } from '../composables/useTasks'
import { useToast } from '../composables/useToast'
import { priorityActive, longDate } from '../utils/format'
import EmptyState from '../components/EmptyState.vue'

const props = defineProps({ id: { type: String, default: null } })
const route = useRoute()
const router = useRouter()
const { getTask, addTask, updateTask, categories } = useTasks()
const { show } = useToast()

const isEdit = computed(() => !!props.id)
const task = computed(() => (props.id ? getTask(props.id) : null))

const q = (k) => (typeof route.query[k] === 'string' ? route.query[k] : '')
const source = task.value ?? {
  title: q('title'),
  description: '',
  priority: PRIORITIES.includes(q('priority')) ? q('priority') : 'medium',
  dueDate: isValidISODate(q('due')) ? q('due') : '',
  category: q('category'),
}
const form = reactive({
  title: source.title,
  description: source.description,
  priority: source.priority,
  dueDate: source.dueDate,
  category: source.category,
})

const errors = reactive({ title: '', dueDate: '', category: '', description: '' })
const submitted = ref(false)
const titleInput = ref(null)

const categoryChoices = computed(() => [...new Set([...DEFAULT_CATEGORIES, ...categories.value])])
const quickDates = [
  { label: 'Today', value: () => todayISO(0) },
  { label: 'Tomorrow', value: () => todayISO(1) },
  { label: 'Next week', value: () => todayISO(7) },
]
const isPast = computed(() => !!form.dueDate && isValidISODate(form.dueDate) && form.dueDate < todayISO())

function validate() {
  const t = form.title.trim()
  errors.title = !t ? 'Give your task a title.' : t.length < 2 ? 'The title needs at least 2 characters.' : t.length > LIMITS.title ? `Keep the title under ${LIMITS.title} characters.` : ''
  errors.description = form.description.length > LIMITS.description ? `Keep the description under ${LIMITS.description} characters.` : ''
  errors.dueDate = form.dueDate && !isValidISODate(form.dueDate) ? 'Enter a valid date.' : ''
  const c = form.category.trim()
  errors.category = c.length > LIMITS.category ? `Keep the category under ${LIMITS.category} characters.` : ''
  return !Object.values(errors).some(Boolean)
}

function onField(field) {
  if (submitted.value) validate()
  else errors[field] = ''
}

function submit() {
  submitted.value = true
  if (!validate()) {
    nextTick(() => document.querySelector('[aria-invalid="true"]')?.focus())
    return
  }
  const data = { ...form, title: form.title.trim(), description: form.description.trim(), category: form.category.trim() }
  if (isEdit.value) {
    updateTask(props.id, data)
    show('Changes saved')
    router.replace(`/tasks/${props.id}`)
  } else {
    const created = addTask(data)
    show('Task created')
    router.replace(`/tasks/${created.id}`)
  }
}

function cancel() {
  if (window.history.state?.back) router.back()
  else router.push(isEdit.value ? `/tasks/${props.id}` : '/tasks')
}

onMounted(() => titleInput.value?.focus())

const inputClass = (err) => [
  'w-full rounded-xl border bg-zinc-50 px-3.5 py-2.5 text-[15px] transition outline-none placeholder:text-zinc-400 focus:bg-white focus:ring-4 dark:bg-zinc-800/60 dark:focus:bg-zinc-800',
  err
    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10 dark:border-rose-500/60'
    : 'border-zinc-200 focus:border-indigo-500 focus:ring-indigo-500/10 dark:border-zinc-700',
]
const labelClass = 'flex items-center gap-1.5 text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400'
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <button @click="cancel" class="inline-flex cursor-pointer items-center gap-1.5 text-sm text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
      <ArrowLeft class="size-4" /> Back
    </button>

    <EmptyState v-if="isEdit && !task" class="mt-6" :icon="SearchX" title="Task not found" text="It may have been deleted. Tasks are saved in this browser only, so links from another device or browser will not open here.">
      <RouterLink to="/tasks" class="rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-600 ring-1 ring-indigo-200 ring-inset hover:bg-indigo-50 dark:text-indigo-400 dark:ring-indigo-500/30 dark:hover:bg-indigo-500/10">
        Go to all tasks
      </RouterLink>
    </EmptyState>

    <template v-else>
      <h1 class="mt-4 text-3xl font-semibold tracking-tight">{{ isEdit ? 'Edit task' : 'New task' }}</h1>
      <p class="mt-2 text-zinc-500 dark:text-zinc-400">
        {{ isEdit ? 'Update the details below and save your changes.' : 'Capture what needs doing, then give it a priority and a date.' }}
      </p>

      <form
        novalidate
        @submit.prevent="submit"
        class="mt-8 space-y-6 rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-7 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <!-- Title -->
        <div>
          <div class="flex items-center justify-between">
            <label for="f-title" :class="labelClass"><Type class="size-3.5" /> Title <span class="text-rose-500">*</span></label>
            <span class="font-mono text-[11px] text-zinc-400 tabular-nums">{{ form.title.length }}/{{ LIMITS.title }}</span>
          </div>
          <input
            id="f-title"
            ref="titleInput"
            v-model="form.title"
            :maxlength="LIMITS.title"
            placeholder="What needs to be done?"
            @input="onField('title')"
            :aria-invalid="!!errors.title"
            aria-describedby="f-title-err"
            :class="['mt-2', inputClass(errors.title)]"
          />
          <p v-if="errors.title" id="f-title-err" class="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{{ errors.title }}</p>
        </div>

        <!-- Description -->
        <div>
          <div class="flex items-center justify-between">
            <label for="f-desc" :class="labelClass"><AlignLeft class="size-3.5" /> Description</label>
            <span class="font-mono text-[11px] text-zinc-400 tabular-nums">{{ form.description.length }}/{{ LIMITS.description }}</span>
          </div>
          <textarea
            id="f-desc"
            v-model="form.description"
            rows="4"
            :maxlength="LIMITS.description"
            placeholder="Add notes, links or context (optional)"
            @input="onField('description')"
            :aria-invalid="!!errors.description"
            :class="['mt-2 resize-y', inputClass(errors.description)]"
          />
          <p v-if="errors.description" class="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{{ errors.description }}</p>
        </div>

        <!-- Priority -->
        <fieldset>
          <legend :class="labelClass"><Flag class="size-3.5" /> Priority</legend>
          <div class="mt-2 grid grid-cols-3 gap-2">
            <button
              v-for="p in PRIORITIES"
              :key="p"
              type="button"
              @click="form.priority = p"
              :aria-pressed="form.priority === p"
              :class="[
                'cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-medium capitalize transition-all duration-150 active:scale-95',
                form.priority === p
                  ? priorityActive[p]
                  : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800',
              ]"
            >
              {{ p }}
            </button>
          </div>
        </fieldset>

        <!-- Due date -->
        <div>
          <label for="f-due" :class="labelClass"><CalendarDays class="size-3.5" /> Due date</label>
          <div class="mt-2 flex flex-col gap-2 sm:flex-row">
            <input id="f-due" type="date" v-model="form.dueDate" @input="onField('dueDate')" :aria-invalid="!!errors.dueDate" :class="['flex-1 !text-sm', inputClass(errors.dueDate)]" />
            <div class="flex gap-1.5">
              <button
                v-for="d in quickDates"
                :key="d.label"
                type="button"
                @click="(form.dueDate = d.value()), onField('dueDate')"
                class="flex-1 cursor-pointer rounded-lg px-2.5 py-2 text-xs font-medium whitespace-nowrap text-zinc-600 ring-1 ring-zinc-200 transition ring-inset hover:bg-zinc-100 sm:flex-none dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-800"
              >
                {{ d.label }}
              </button>
              <button
                v-if="form.dueDate"
                type="button"
                @click="form.dueDate = ''"
                aria-label="Clear due date"
                class="grid cursor-pointer place-items-center rounded-lg px-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
              >
                <X class="size-3.5" />
              </button>
            </div>
          </div>
          <p v-if="errors.dueDate" class="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{{ errors.dueDate }}</p>
          <p v-else-if="isPast" class="mt-1.5 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
            <Info class="size-3.5" /> This date is in the past, so the task will show as overdue.
          </p>
          <p v-else-if="form.dueDate" class="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">{{ longDate(form.dueDate) }}</p>
        </div>

        <!-- Category -->
        <div>
          <label for="f-cat" :class="labelClass"><Tag class="size-3.5" /> Category</label>
          <input
            id="f-cat"
            v-model="form.category"
            :maxlength="LIMITS.category"
            list="f-cat-list"
            placeholder="e.g. Work (optional)"
            @input="onField('category')"
            :aria-invalid="!!errors.category"
            :class="['mt-2 !text-sm', inputClass(errors.category)]"
          />
          <datalist id="f-cat-list">
            <option v-for="c in categoryChoices" :key="c" :value="c" />
          </datalist>
          <div class="mt-2 flex flex-wrap gap-1.5">
            <button
              v-for="c in categoryChoices"
              :key="c"
              type="button"
              @click="form.category = form.category === c ? '' : c"
              :aria-pressed="form.category === c"
              :class="[
                'cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition',
                form.category === c
                  ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700',
              ]"
            >
              {{ c }}
            </button>
          </div>
          <p v-if="errors.category" class="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{{ errors.category }}</p>
        </div>

        <div class="flex flex-col-reverse gap-2 border-t border-zinc-100 pt-6 sm:flex-row sm:justify-end dark:border-zinc-800">
          <button
            type="button"
            @click="cancel"
            class="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="cursor-pointer rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-500 active:scale-[0.98] dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            {{ isEdit ? 'Save changes' : 'Create task' }}
          </button>
        </div>
      </form>
    </template>
  </div>
</template>
