<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import ActivityRow from './components/ActivityRow.vue'
import ActivityFormModal from './components/modals/ActivityFormModal.vue'
import Loading from '@renderer/components/ui/loading/Loading.vue'
import type { ResponseSchema as Response } from '@/schemas/response.schema'
import type { Activity, Meta } from '@renderer/types/models'
import { Plus, Search, X } from 'lucide-vue-next'
import { useToast } from '@renderer/composables/useToast'

const toast = useToast()
const activities = ref<Activity[]>([])
const meta = ref<Meta | null>(null)
const loading = ref(false)
const page = ref(1)
const searchQuery = ref('')

const showModal = ref(false)
const modalMode = ref<'create' | 'update'>('create')
const selectedActivity = ref<Activity | null>(null)

const fetchActivities = async (page = 1, query = ''): Promise<void> => {
  loading.value = true
  try {
    const res: Response = await window.api.activity.index(page, query)
    if (res.success) {
      activities.value = res.data.activities
      meta.value = res.data.meta
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const debouncedSearch = useDebounceFn((query: string) => {
  page.value = 1
  fetchActivities(1, query)
}, 300)

const handleSearch = (): void => {
  debouncedSearch(searchQuery.value)
}

const clearSearch = (): void => {
  searchQuery.value = ''
  page.value = 1
  fetchActivities(1, '')
}

const openCreateModal = (): void => {
  modalMode.value = 'create'
  selectedActivity.value = null
  showModal.value = true
}

const editActivity = (activity: Activity): void => {
  modalMode.value = 'update'
  selectedActivity.value = activity
  showModal.value = true
}

const deleteActivity = async (activity: Activity): Promise<void> => {
  try {
    const res: Response = await window.api.activity.delete(activity.id)
    if (res.success) {
      toast.showToast('Deleted successfully', 'success')
      fetchActivities(page.value, searchQuery.value)
    }
  } catch (err: any) {
    toast.showToast(err?.message || 'Error', 'error')
  }
}

const handleActivityCreated = (): void => {
  toast.showToast('Created successfully', 'success')
  fetchActivities(page.value, searchQuery.value)
}

const handleActivityUpdated = (): void => {
  toast.showToast('Updated successfully', 'success')
  fetchActivities(page.value, searchQuery.value)
}

const prevPage = (): void => {
  if (page.value > 1) {
    page.value--
    fetchActivities(page.value, searchQuery.value)
  }
}

const nextPage = (): void => {
  if (meta.value && page.value < meta.value.lastPage) {
    page.value++
    fetchActivities(page.value, searchQuery.value)
  }
}

onMounted(() => fetchActivities())
</script>

<template>
  <div class="p-6 w-full max-w-7xl mx-auto">
    <div class="mb-6">
      <div class="flex items-center justify-between gap-4 mb-4">
        <div>
          <h1 class="text-3xl font-bold text-white tracking-tight">Activities</h1>
          <p v-if="meta" class="text-sm text-slate-400 mt-1.5">
            <span class="font-medium text-slate-300">{{ meta.total }}</span>
            {{ searchQuery ? 'matching' : 'total' }} activities
          </p>
        </div>

        <div class="relative flex-1 max-w-md">
          <Search
            :size="18"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search activities..."
            class="w-full pl-10 pr-9 py-2 bg-slate-800/60 border border-slate-700/60 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-600 transition-colors"
            @input="handleSearch"
          />
          <button
            v-if="searchQuery"
            class="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-slate-500 hover:text-slate-300 transition-colors"
            title="Clear"
            @click="clearSearch"
          >
            <X :size="16" :stroke-width="2" />
          </button>
        </div>

        <button
          class="flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg border border-blue-500/50 hover:border-blue-600/50 shadow-lg shadow-blue-500/20 transition-all duration-200 hover:shadow-blue-600/40"
          @click="openCreateModal"
        >
          <Plus :size="18" :stroke-width="2" />
          <span>Create Activity</span>
        </button>
      </div>
    </div>

    <div
      class="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden relative"
    >
      <Loading v-if="loading" />

      <div class="bg-slate-900/80 border-b border-slate-700/50">
        <table class="w-full">
          <thead>
            <tr class="text-slate-300 text-sm font-semibold">
              <th class="px-6 py-4 text-left">Name</th>
              <th class="px-6 py-4 text-left">Description</th>
              <th class="px-6 py-4 text-center w-32">Type</th>
              <th class="px-6 py-4 text-right w-36"></th>
            </tr>
          </thead>
        </table>
      </div>

      <div
        class="max-h-[calc(100vh-380px)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
      >
        <table class="w-full">
          <tbody>
            <ActivityRow
              v-for="activity in activities"
              :key="activity.id"
              :activity="activity"
              @edit="editActivity"
              @delete="deleteActivity"
            />
            <tr v-if="!loading && activities.length === 0">
              <td colspan="4" class="px-6 py-16 text-center text-slate-400">
                <div class="flex flex-col items-center gap-2">
                  <span class="text-lg">
                    {{ searchQuery ? 'No activities match your search' : 'No activities found' }}
                  </span>
                  <button
                    v-if="searchQuery"
                    class="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    @click="clearSearch"
                  >
                    Clear search
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="mt-6 flex items-center justify-between">
      <button
        class="px-4 py-2 rounded-lg border border-slate-600 bg-slate-800/50 text-slate-200 font-medium hover:bg-slate-700 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-800/50 transition-all"
        :disabled="page === 1 || loading"
        @click="prevPage"
      >
        Previous
      </button>

      <div class="flex items-center gap-2 text-slate-300">
        <span class="text-sm font-medium">Page</span>
        <span class="px-3 py-1 bg-slate-700/50 rounded-lg font-bold">{{ page }}</span>
        <span class="text-sm font-medium">of {{ meta?.lastPage ?? 1 }}</span>
      </div>

      <button
        class="px-4 py-2 rounded-lg border border-slate-600 bg-slate-800/50 text-slate-200 font-medium hover:bg-slate-700 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-800/50 transition-all"
        :disabled="page === meta?.lastPage || loading"
        @click="nextPage"
      >
        Next
      </button>
    </div>

    <ActivityFormModal
      :show="showModal"
      :mode="modalMode"
      :activity="selectedActivity"
      @close="showModal = false"
      @created="handleActivityCreated"
      @updated="handleActivityUpdated"
    />
  </div>
</template>
