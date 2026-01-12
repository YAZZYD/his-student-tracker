<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { activityTypeMap } from '@renderer/constants/activity.constants'
import { useToast } from '@renderer/composables/useToast'
import { Plus } from 'lucide-vue-next'
import type { Activity } from '@renderer/types/models'

interface Props {
  studentActivities: Activity[]
  studentCode: string
  hasUnsavedChanges: boolean
}

const router = useRouter()
const toast = useToast()

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'dirty'): void
  (e: 'saved'): void
  (e: 'activities-updated', activities: Activity[]): void
}>()

const allActivities = ref<Activity[]>([])
const availableActivities = ref<Activity[]>([])
const attachedActivities = ref<Activity[]>([...props.studentActivities])
const selectedNewActivityId = ref<number | null>(null)
const loading = ref(false)
const submitting = ref(false)

const fetchActivities = async (): Promise<void> => {
  loading.value = true
  try {
    const response = await window.api.indexActivities()
    if (response.success) {
      allActivities.value = response.data.activities
      updateAvailableActivities()
    }
  } catch (error) {
    console.error('Error fetching activities:', error)
    toast.showToast('Error loading activities', 'error')
  } finally {
    loading.value = false
  }
}

const updateAvailableActivities = (): void => {
  const attachedIds = new Set(attachedActivities.value.map((a) => a.id))
  availableActivities.value = allActivities.value.filter((a) => !attachedIds.has(a.id))
}

const detachActivity = (activityId: number): void => {
  if (!confirm('Are you sure you want to remove this activity?')) return
  const index = attachedActivities.value.findIndex((a) => a.id === activityId)
  if (index !== -1) {
    attachedActivities.value.splice(index, 1)
    updateAvailableActivities()
    emit('dirty')
  }
}

const attachActivity = (): void => {
  if (selectedNewActivityId.value === null) return

  const activity = allActivities.value.find((a) => a.id === selectedNewActivityId.value)
  if (activity) {
    attachedActivities.value.push(activity)
    updateAvailableActivities()
    selectedNewActivityId.value = null
    emit('dirty')
  }
}

const saveActivities = async (): Promise<void> => {
  submitting.value = true

  try {
    const activityIds = attachedActivities.value.map((a) => a.id)

    const response = await window.api.updateStudentActivities({
      code: props.studentCode,
      activityIds
    })

    if (response.success) {
      emit('saved')
      emit('activities-updated', response.data.activities)
      toast.showToast('Activities updated successfully', 'success')
    } else {
      toast.showToast(response.message || 'Error updating activities', 'error')
    }
  } catch (error: any) {
    console.error('Error saving activities:', error)
    toast.showToast(error.message || 'Error updating activities', 'error')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchActivities()
})

onUnmounted(() => {
  emit('saved')
})
</script>

<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="space-y-3 text-center">
        <div
          class="w-10 h-10 border-3 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto"
        ></div>
        <p class="text-slate-400 text-sm">Loading activities...</p>
      </div>
    </div>

    <template v-else>
      <!-- Add New Activity -->
      <div class="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
        <div v-if="availableActivities.length" class="flex gap-3">
          <select
            v-model="selectedNewActivityId"
            class="flex-1 bg-slate-900/50 border border-slate-700/50 rounded px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option :value="null" disabled>Select new activity</option>
            <option v-for="activity in availableActivities" :key="activity.id" :value="activity.id">
              {{ activityTypeMap[activity.type].icon }} {{ activity.name }}
            </option>
          </select>

          <button
            type="button"
            class="px-4 py-2 text-sm bg-green-950/40 hover:bg-green-950/60 disabled:bg-slate-700/50 disabled:text-slate-500 text-green-400 hover:text-green-300 border border-green-500/30 hover:border-green-500/50 disabled:border-slate-700/30 rounded transition-colors flex items-center gap-2"
            :disabled="selectedNewActivityId === null"
            @click="attachActivity"
          >
            <Plus :size="16" />
          </button>
        </div>

        <p v-else class="text-slate-500 text-sm text-center py-4">
          All activities are already attached
        </p>
      </div>
      <!-- Attached Activities -->
      <div class="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
        <h2 class="text-sm font-semibold text-slate-300 mb-4">
          Attached Activities ({{ attachedActivities.length }})
        </h2>

        <div v-if="attachedActivities.length" class="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="activity in attachedActivities"
            :key="activity.id"
            class="border rounded p-4 relative group"
            :class="activityTypeMap[activity.type].color"
          >
            <button
              type="button"
              class="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
              title="Remove"
              @click="detachActivity(activity.id)"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div class="flex items-start justify-between mb-2 pr-6">
              <span class="text-base">{{ activityTypeMap[activity.type].icon }}</span>
            </div>

            <h4 class="text-sm font-medium text-white mb-1 line-clamp-1">
              {{ activity.name }}
            </h4>
            <p class="text-xs text-slate-400 line-clamp-2">{{ activity.description }}</p>
          </div>
        </div>

        <p v-else class="text-slate-500 text-sm text-center py-8">No activities attached</p>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3">
        <button
          type="button"
          class="px-4 py-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
          :disabled="submitting"
          @click="router.replace({ name: 'student-show', params: { code: studentCode } })"
        >
          Cancel
        </button>

        <button
          type="button"
          class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded transition-colors"
          :disabled="submitting || !hasUnsavedChanges"
          @click="saveActivities"
        >
          {{ submitting ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </template>
  </div>
</template>
