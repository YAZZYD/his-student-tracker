<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
import type { StudentWithRelations } from '@renderer/types/students'
import type { Skill } from '@/prisma/generated/client'
import { SkillTypeMap } from '@renderer/constants/skill.constants'
import { useToast } from '@renderer/composables/useToast'

const props = defineProps<{
  student: StudentWithRelations
  hasUnsavedChanges: boolean
}>()

const emit = defineEmits<{
  (e: 'dirty'): void
  (e: 'saved'): void
}>()

const router = useRouter()
const toast = useToast()

const allSkills = ref<Skill[]>([])
const attachedSkillIds = ref<Set<number>>(new Set())
const searchQuery = ref('')
const isSearching = ref(false)
const loading = ref(false)
const submitting = ref(false)
const showAttachModal = ref(false)

// Get currently attached skills
const attachedSkills = computed(() => {
  return allSkills.value.filter((skill) => attachedSkillIds.value.has(skill.id))
})

const softSkills = computed(() => attachedSkills.value.filter((s) => s.type === 'SOFT'))

const hardSkills = computed(() => attachedSkills.value.filter((s) => s.type === 'HARD'))

const unattachedSkills = computed(() =>
  allSkills.value.filter((skill) => !attachedSkillIds.value.has(skill.id))
)

const filteredUnattachedSkills = computed(() => {
  if (!searchQuery.value.trim()) return unattachedSkills.value

  const query = searchQuery.value.toLowerCase()
  return unattachedSkills.value.filter(
    (skill) =>
      skill.name.toLowerCase().includes(query) || skill.description.toLowerCase().includes(query)
  )
})

const debouncedSearch = useDebounceFn(() => {
  isSearching.value = false
}, 300)

const handleSearchInput = (): void => {
  isSearching.value = true
  debouncedSearch()
}

const fetchAllSkills = async (): Promise<void> => {
  loading.value = true
  try {
    const response = await window.api.indexSkills()
    if (response.success) {
      allSkills.value = response.data.skills

      // Initialize attached skill IDs from student.skills
      attachedSkillIds.value = new Set(
        props.student.ratings.flatMap((rating) => rating.skillRatings.map((sr) => sr.skillId))
      )
    }
  } catch (error) {
    console.error('Failed to fetch skills:', error)
    toast.showToast('Error loading skills', 'error')
  } finally {
    loading.value = false
  }
}

const attachSkill = (skillId: number): void => {
  attachedSkillIds.value.add(skillId)
  searchQuery.value = ''
  showAttachModal.value = false
  emit('dirty')
}

const detachSkill = (skillId: number, skillName: string): void => {
  if (!confirm(`Detach "${skillName}"?`)) {
    return
  }

  attachedSkillIds.value.delete(skillId)
  emit('dirty')
}

const saveSkills = async (): Promise<void> => {
  submitting.value = true
  try {
    const response = await window.api.updateStudentSkills({
      code: props.student.code,
      skillIds: Array.from(attachedSkillIds.value)
    })

    if (response.success) {
      emit('saved')
      toast.showToast('Skills updated successfully', 'success')
    } else {
      toast.showToast(response.message || 'Error updating skills', 'error')
    }
  } catch (error: any) {
    console.error('Error saving skills:', error)
    toast.showToast(error.message || 'Error updating skills', 'error')
  } finally {
    submitting.value = false
  }
}

const handleCancel = (): void => {
  router.replace({ name: 'student-show', params: { code: props.student.code } })
}

onMounted(() => {
  fetchAllSkills()
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
        <p class="text-slate-400 text-sm">Loading skills...</p>
      </div>
    </div>

    <template v-else>
      <!-- Attach Skill Section -->
      <div class="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="text-lg">➕</span>
            <h3 class="text-sm font-semibold text-slate-300">Attach Skill</h3>
          </div>
          <button
            v-if="showAttachModal"
            class="text-xs text-slate-400 hover:text-slate-300"
            @click="
              () => {
                showAttachModal = false
                searchQuery = ''
              }
            "
          >
            Cancel
          </button>
        </div>

        <div v-if="!showAttachModal">
          <button
            :disabled="!unattachedSkills.length"
            class="w-full py-2.5 border-2 border-dashed border-slate-700 hover:border-blue-500/50 rounded-lg text-sm text-slate-400 hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            @click="showAttachModal = true"
          >
            {{ unattachedSkills.length ? 'Click to attach a skill' : 'All skills attached' }}
          </button>
        </div>

        <div v-else class="space-y-3">
          <!-- Search Input -->
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search unattached skills..."
              class="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
              autofocus
              @input="handleSearchInput"
            />
            <div v-if="isSearching" class="absolute right-3 top-1/2 -translate-y-1/2">
              <div
                class="w-4 h-4 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin"
              ></div>
            </div>
          </div>

          <!-- Search Results -->
          <div
            v-if="filteredUnattachedSkills.length"
            class="max-h-64 overflow-y-auto scrollbar-thin space-y-2"
          >
            <button
              v-for="skill in filteredUnattachedSkills"
              :key="skill.id"
              :disabled="submitting"
              class="w-full text-left p-3 border border-slate-700/30 rounded-lg hover:border-blue-500/30 hover:bg-slate-700/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              @click="attachSkill(skill.id)"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <h4 class="text-sm font-medium text-white">{{ skill.name }}</h4>
                    <span
                      class="px-2 py-0.5 text-[10px] font-medium rounded"
                      :class="SkillTypeMap[skill.type].style"
                    >
                      {{ skill.type }}
                    </span>
                  </div>
                </div>
                <component
                  :is="SkillTypeMap[skill.type].icon"
                  class="inline w-4 h-4 mr-1 text-slate-400"
                />
              </div>
            </button>
          </div>

          <div v-else-if="searchQuery.trim()" class="py-8 text-center text-sm text-slate-500">
            No unattached skills found matching "{{ searchQuery }}"
          </div>

          <div v-else class="py-8 text-center text-sm text-slate-500">
            No skills available to attach
          </div>
        </div>
      </div>

      <!-- Skills Grid -->
      <div class="grid md:grid-cols-2 gap-6">
        <!-- Soft Skills -->
        <div class="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
          <div class="flex items-center gap-2 mb-4">
            <component :is="SkillTypeMap['SOFT'].icon" class="inline w-4 h-4 mr-1 text-slate-400" />
            <h3 class="text-sm font-semibold text-purple-400">
              Soft Skills ({{ softSkills.length }})
            </h3>
          </div>

          <div v-if="softSkills.length" class="space-y-3">
            <div
              v-for="skill in softSkills"
              :key="skill.id"
              class="border border-slate-700/30 rounded p-3 hover:border-purple-500/30 transition-colors group"
            >
              <div class="flex items-start justify-between gap-2 mb-1">
                <h4 class="text-sm font-medium text-white">{{ skill.name }}</h4>
                <button
                  :disabled="submitting"
                  class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity text-xs px-2 py-0.5 rounded hover:bg-red-500/10 disabled:opacity-30"
                  title="Detach skill"
                  @click="detachSkill(skill.id, skill.name)"
                >
                  ✕
                </button>
              </div>
              <p class="text-xs text-slate-400">{{ skill.description }}</p>
            </div>
          </div>

          <p v-else class="text-slate-500 text-xs text-center py-8">No soft skills attached yet</p>
        </div>

        <!-- Hard Skills -->
        <div class="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
          <div class="flex items-center gap-2 mb-4">
            <component :is="SkillTypeMap['HARD'].icon" class="inline w-4 h-4 mr-1 text-slate-400" />
            <h3 class="text-sm font-semibold text-cyan-400">
              Hard Skills ({{ hardSkills.length }})
            </h3>
          </div>

          <div v-if="hardSkills.length" class="space-y-3">
            <div
              v-for="skill in hardSkills"
              :key="skill.id"
              class="border border-slate-700/30 rounded p-3 hover:border-cyan-500/30 transition-colors group"
            >
              <div class="flex items-start justify-between gap-2 mb-1">
                <h4 class="text-sm font-medium text-white">{{ skill.name }}</h4>
                <button
                  :disabled="submitting"
                  class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity text-xs px-2 py-0.5 rounded hover:bg-red-500/10 disabled:opacity-30"
                  title="Detach skill"
                  @click="detachSkill(skill.id, skill.name)"
                >
                  ✕
                </button>
              </div>
              <p class="text-xs text-slate-400">{{ skill.description }}</p>
            </div>
          </div>

          <p v-else class="text-slate-500 text-xs text-center py-8">No hard skills attached yet</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3">
        <button
          type="button"
          class="px-4 py-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
          :disabled="submitting"
          @click="handleCancel"
        >
          Cancel
        </button>

        <button
          type="button"
          class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded transition-colors"
          :disabled="submitting || !hasUnsavedChanges"
          @click="saveSkills"
        >
          {{ submitting ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </template>
  </div>
</template>
