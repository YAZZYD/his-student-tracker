<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
import { X, Plus, Search } from 'lucide-vue-next'
import { SkillTypeMap } from '@renderer/constants/skill.constants'
import { useToast } from '@renderer/composables/useToast'
import { useForm } from 'vee-validate'
import Modal from '@renderer/components/ui/modal/Modal.vue'
import { createSkillReq, createSkillSchema } from '@/schemas/skill.schema'
import type { EvaluationWithRelations, StudentWithRelations } from '@renderer/types/models'
import type { Skill } from '@/prisma/generated/client'
import { toTypedSchema } from '@vee-validate/zod'

const props = defineProps<{
  student: StudentWithRelations
  hasUnsavedChanges: boolean
}>()

const emit = defineEmits<{
  (e: 'dirty'): void
  (e: 'saved'): void
  (e: 'skill-updated', skillEvaluations: EvaluationWithRelations): void
}>()

const router = useRouter()
const toast = useToast()

// Data
const allSkills = ref<Skill[]>([])
const attachedSkillIds = ref<Set<number>>(new Set())
const searchQuery = ref('')
const isSearching = ref(false)
const loading = ref(false)
const submitting = ref(false)

const showAttachModal = ref(false)
const showCreateSkillModal = ref(false)

const { defineField, handleSubmit, errors, resetForm } = useForm<createSkillReq>({
  validationSchema: toTypedSchema(createSkillSchema),
  initialValues: {
    name: '',
    description: '',
    type: 'SOFT' as const
  }
})

const [name, nameAttrs] = defineField('name')
const [description, descriptionAttrs] = defineField('description')
const [type, typeAttrs] = defineField('type')

// Computed
const attachedSkills = computed(() =>
  allSkills.value.filter((skill) => attachedSkillIds.value.has(skill.id))
)

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

// Search debounce
const debouncedSearch = useDebounceFn(() => {
  isSearching.value = false
}, 300)

const handleSearchInput = (): void => {
  isSearching.value = true
  debouncedSearch()
}

// Fetch all skills
const fetchAllSkills = async (): Promise<void> => {
  loading.value = true
  try {
    const response = await window.api.indexSkills()
    if (response.success) {
      allSkills.value = response.data.skills
      attachedSkillIds.value = new Set(
        props.student.evaluations.flatMap((e) => e.skillEvaluations.map((sr) => sr.skillId))
      )
    }
  } catch (err) {
    console.error(err)
    toast.showToast('Error loading skills', 'error')
  } finally {
    loading.value = false
  }
}

// Skill actions
const attachSkill = (skillId: number): void => {
  attachedSkillIds.value.add(skillId)
  searchQuery.value = ''
  showAttachModal.value = false
  emit('dirty')
}

const detachSkill = (skillId: number, skillName: string): void => {
  if (!confirm(`Detach "${skillName}"?`)) return
  attachedSkillIds.value.delete(skillId)
  emit('dirty')
}

const deleteSkill = async (skillId: number): Promise<void> => {
  if (!confirm('Are you sure you want to delete this skill?')) return
  try {
    const res = await window.api.deleteSkill(skillId)
    if (res.success) {
      allSkills.value = allSkills.value.filter((s) => s.id !== skillId)
      attachedSkillIds.value.delete(skillId)

      toast.showToast('Skill deleted', 'success')
    }
  } catch (err) {
    console.error(err)
    toast.showToast('Error deleting skill', 'error')
  }
}

// Save attached skills
const saveSkills = async (): Promise<void> => {
  submitting.value = true
  try {
    const res = await window.api.updateStudentSkills({
      code: props.student.code,
      skillIds: Array.from(attachedSkillIds.value)
    })
    if (res.success) {
      emit('saved')
      emit('skill-updated', res.data.skillEvaluations)
      toast.showToast('Skills updated', 'success')
    }
  } catch (err: any) {
    console.error(err)
    toast.showToast(err.message || 'Error updating skills', 'error')
  } finally {
    submitting.value = false
  }
}

const handleCancel = (): void => {
  if (props.hasUnsavedChanges && !confirm('Discard unsaved changes?')) return
  router.replace({ name: 'student-show', params: { code: props.student.code } })
}

const createSkill = handleSubmit(async (values) => {
  submitting.value = true
  try {
    const data = {
      name: values.name,
      description: values.description,
      type: values.type
    }
    const res = await window.api.createSkill(data)
    if (res.success) {
      resetForm()
      allSkills.value.push(res.data.skill)
      showCreateSkillModal.value = false
      searchQuery.value = ''
      toast.showToast('Skill created', 'success')
    }
  } catch (err: any) {
    console.error(err)
    toast.showToast(err.message || 'Error creating skill', 'error')
  } finally {
    submitting.value = false
  }
})

onMounted(fetchAllSkills)
</script>

<template>
  <div class="w-full max-w-6xl mx-auto space-y-6">
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="space-y-3 text-center">
        <div
          class="w-12 h-12 border-3 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto"
        ></div>
        <p class="text-slate-400 text-sm">Loading skills...</p>
      </div>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-white">Manage Skills</h2>
          <p class="text-xs text-slate-400 mt-1">Attach skills to {{ props.student.name }}</p>
        </div>
        <button
          class="flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-950/90 border-blue-500/40 hover:bg-blue-700 text-blue-300 rounded transition-colors"
          @click="showCreateSkillModal = true"
        >
          <Plus class="w-3.5 h-3.5" />
          New Skill
        </button>
      </div>

      <!-- Attach Skill Section -->
      <div class="bg-slate-800/30 border border-slate-700/50 rounded-lg overflow-hidden">
        <div class="p-5 border-b border-slate-700/50">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-slate-300">Attach Skill</h3>
            <button
              v-if="showAttachModal"
              class="text-xs text-slate-400 hover:text-slate-300 transition-colors"
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
        </div>

        <div class="p-5">
          <!-- Attach button -->
          <button
            v-if="!showAttachModal"
            :disabled="!unattachedSkills.length"
            class="w-full py-3 border-2 border-dashed border-slate-700 hover:border-blue-500/50 hover:bg-slate-700/20 rounded-lg text-sm text-slate-400 hover:text-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-700 disabled:hover:bg-transparent"
            @click="showAttachModal = true"
          >
            {{
              unattachedSkills.length
                ? `Click to attach a skill (${unattachedSkills.length} available)`
                : 'All skills attached'
            }}
          </button>

          <!-- Search & Results -->
          <div v-else class="space-y-4">
            <!-- Search Input -->
            <div class="relative">
              <Search
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
              />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search skills by name or description..."
                class="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                autofocus
                @input="handleSearchInput"
              />
              <div
                v-if="isSearching"
                class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin"
              ></div>
            </div>

            <!-- Results List -->
            <div
              v-if="filteredUnattachedSkills.length"
              class="max-h-80 overflow-y-auto scrollbar-thin space-y-2"
            >
              <div
                v-for="skill in filteredUnattachedSkills"
                :key="skill.id"
                class="group relative p-4 border border-slate-700/50 rounded-lg hover:border-blue-500/40 hover:bg-slate-700/30 transition-all cursor-pointer"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="flex-1 min-w-0" @click="attachSkill(skill.id)">
                    <div class="flex items-center gap-2 mb-1.5">
                      <h4 class="text-sm font-medium text-white truncate">{{ skill.name }}</h4>
                      <span
                        class="px-2 py-0.5 text-[10px] font-medium rounded shrink-0"
                        :class="SkillTypeMap[skill.type].style"
                      >
                        {{ skill.type }}
                      </span>
                    </div>
                    <p class="text-xs text-slate-400 line-clamp-2">{{ skill.description }}</p>
                  </div>
                  <button
                    class="shrink-0 p-1.5 rounded hover:bg-red-500/10 transition-colors group/delete"
                    @click.stop="deleteSkill(skill.id)"
                  >
                    <X
                      class="w-4 h-4 text-slate-500 group-hover/delete:text-red-400 transition-colors"
                    />
                  </button>
                </div>
              </div>
            </div>

            <!-- No Results -->
            <div
              v-else-if="searchQuery.trim()"
              class="py-12 text-center border border-slate-700/30 rounded-lg bg-slate-800/20"
            >
              <p class="text-sm text-slate-400 mb-3">
                No skills found for <span class="text-white font-medium">"{{ searchQuery }}"</span>
              </p>
              <button
                class="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                @click="showCreateSkillModal = true"
              >
                Create new skill instead
              </button>
            </div>

            <!-- Empty State -->
            <div
              v-else
              class="py-12 text-center border border-slate-700/30 rounded-lg bg-slate-800/20"
            >
              <p class="text-sm text-slate-500">No unattached skills available</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Skills Grid -->
      <div class="grid md:grid-cols-2 gap-6">
        <!-- Soft Skills -->
        <div class="bg-slate-800/30 border border-slate-700/50 rounded-lg overflow-hidden">
          <div class="p-5 border-b border-slate-700/50">
            <div class="flex items-center gap-2">
              <component :is="SkillTypeMap['SOFT'].icon" class="w-4 h-4 text-purple-400" />
              <h3 class="text-sm font-semibold text-purple-400">Soft Skills</h3>
              <span
                class="ml-auto px-2 py-0.5 text-[10px] font-medium bg-purple-500/10 text-purple-400 rounded"
              >
                {{ softSkills.length }}
              </span>
            </div>
          </div>

          <div class="p-5">
            <div v-if="softSkills.length" class="space-y-3">
              <div
                v-for="skill in softSkills"
                :key="skill.id"
                class="group p-4 border border-slate-700/50 rounded-lg hover:border-purple-500/30 hover:bg-slate-700/20 transition-all"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-white mb-1">{{ skill.name }}</h4>
                    <p class="text-xs text-slate-400 line-clamp-2">{{ skill.description }}</p>
                  </div>
                  <button
                    :disabled="submitting"
                    class="shrink-0 p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    @click="detachSkill(skill.id, skill.name)"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div
              v-else
              class="py-12 text-center border border-slate-700/30 rounded-lg bg-slate-800/20"
            >
              <p class="text-xs text-slate-500">No soft skills attached</p>
            </div>
          </div>
        </div>

        <!-- Hard Skills -->
        <div class="bg-slate-800/30 border border-slate-700/50 rounded-lg overflow-hidden">
          <div class="p-5 border-b border-slate-700/50">
            <div class="flex items-center gap-2">
              <component :is="SkillTypeMap['HARD'].icon" class="w-4 h-4 text-cyan-400" />
              <h3 class="text-sm font-semibold text-cyan-400">Hard Skills</h3>
              <span
                class="ml-auto px-2 py-0.5 text-[10px] font-medium bg-cyan-500/10 text-cyan-400 rounded"
              >
                {{ hardSkills.length }}
              </span>
            </div>
          </div>

          <div class="p-5">
            <div v-if="hardSkills.length" class="space-y-3">
              <div
                v-for="skill in hardSkills"
                :key="skill.id"
                class="group p-4 border border-slate-700/50 rounded-lg hover:border-cyan-500/30 hover:bg-slate-700/20 transition-all"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-white mb-1">{{ skill.name }}</h4>
                    <p class="text-xs text-slate-400 line-clamp-2">{{ skill.description }}</p>
                  </div>
                  <button
                    :disabled="submitting"
                    class="shrink-0 p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    @click="detachSkill(skill.id, skill.name)"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div
              v-else
              class="py-12 text-center border border-slate-700/30 rounded-lg bg-slate-800/20"
            >
              <p class="text-xs text-slate-500">No hard skills attached</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-between pt-2">
        <button
          type="button"
          class="px-4 py-2 text-sm text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 rounded transition-all"
          :disabled="submitting"
          @click="handleCancel"
        >
          Cancel
        </button>
        <div class="flex gap-3">
          <button
            v-if="hasUnsavedChanges"
            type="button"
            class="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-all"
            :disabled="submitting"
            @click="handleCancel"
          >
            Discard
          </button>
          <button
            type="button"
            class="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded transition-all shadow-lg shadow-blue-500/20"
            :disabled="submitting || !hasUnsavedChanges"
            @click="saveSkills"
          >
            {{ submitting ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </template>

    <!-- Create Skill Modal -->
    <Modal
      :show="showCreateSkillModal"
      title="Create New Skill"
      width="500px"
      @close="showCreateSkillModal = false"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-2">Skill Name</label>
          <input
            v-model="name"
            v-bind="nameAttrs"
            type="text"
            placeholder="e.g., Leadership, Python Programming"
            class="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            :class="errors.name ? ' red-slate-500' : ' border-slate-700'"
            :disabled="submitting"
          />
          <p v-if="errors.name" class="text-xs text-red-400 mt-1">{{ errors.name }}</p>
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-400 mb-2">Description</label>
          <textarea
            v-model="description"
            v-bind="descriptionAttrs"
            placeholder="Describe this skill..."
            rows="3"
            class="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            :class="errors.description ? ' red-slate-500' : ' border-slate-700'"
            :disabled="submitting"
          />
          <p v-if="errors.description" class="text-xs text-red-400 mt-1">
            {{ errors.description }}
          </p>
        </div>

        <div>
          <!-- eslint-disable-next-line  -->
          <input type="hidden" v-model="type" v-bind="typeAttrs" />
          <label class="block text-xs font-medium text-slate-400 mb-2">Skill Type</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              class="px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium"
              :class="
                type === 'SOFT'
                  ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                  : 'border-slate-700 bg-slate-800/30 text-slate-400 hover:border-slate-600'
              "
              :disabled="submitting"
              @click="type = 'SOFT'"
            >
              <component :is="SkillTypeMap['SOFT'].icon" class="w-4 h-4 mx-auto mb-1" />
              Soft Skill
            </button>
            <button
              type="button"
              class="px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium"
              :class="
                type === 'HARD'
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                  : 'border-slate-700 bg-slate-800/30 text-slate-400 hover:border-slate-600'
              "
              :disabled="submitting"
              @click="type = 'HARD'"
            >
              <component :is="SkillTypeMap['HARD'].icon" class="w-4 h-4 mx-auto mb-1" />
              Hard Skill
            </button>
          </div>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          class="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-all"
          :disabled="submitting"
          @click="showCreateSkillModal = false"
        >
          Cancel
        </button>
        <button
          type="button"
          class="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded transition-all"
          :disabled="submitting"
          @click="createSkill"
        >
          {{ submitting ? 'Creating...' : 'Create Skill' }}
        </button>
      </template>
    </Modal>
  </div>
</template>
