<script setup lang="ts">
import { ref } from 'vue'
import { useRatingManagement } from '@renderer/composables/useRatingManagement'
import { useRoute } from 'vue-router'
import type {
  RatingWithRelations as Rating,
  SkillAvg,
  SkillRating,
  StudentWithRelations
} from '@renderer/types/models'
import { formatDate, getRatingColor } from '@renderer/lib/format.utils'
import { Pencil, Trash2 } from 'lucide-vue-next'

interface Props {
  student: StudentWithRelations
  softSkills: SkillAvg[]
  hardSkills: SkillAvg[]
}

const route = useRoute()

const {
  editingRatingId,
  selectedSkillsForRating,
  comment,
  submitting,
  canSubmitRating,
  toggleSkillForRating,
  updateSkillScore,
  startEditRating: startEdit,
  cancelEdit: cancel,
  submitRating,
  deleteRating
} = useRatingManagement(route.params.code as string)
const showRatingForm = ref(false)

//eslint-disable-next-line
const props = defineProps<Props>()

function calculateAverage(skillRatings: SkillRating[]): number {
  if (!skillRatings.length) return 0
  return Math.round(skillRatings.reduce((sum, sr) => sum + sr.score, 0) / skillRatings.length)
}

function startEditRating(rating: Rating): void {
  startEdit(rating)
  showRatingForm.value = true
}

function cancelEdit(): void {
  cancel()
  showRatingForm.value = false
}

async function handleSubmitRating(): Promise<void> {
  const response = await submitRating()
  if (response?.success) {
    showRatingForm.value = false
    // Refresh student data
    // await fetchStudent(route.params.code as string)
  }
}

async function handleDeleteRating(ratingId: number): Promise<void> {
  const response = await deleteRating(ratingId)
  if (response?.success) {
    // await fetchStudent(route.params.code as string)
  }
}
</script>

<!-- Updated template section with edit functionality -->
<template>
  <div class="space-y-6">
    <!-- Rating Form (Create/Edit) -->
    <div class="bg-slate-800/30 border border-slate-700/50 rounded-lg overflow-hidden">
      <button
        @click="showRatingForm = !showRatingForm"
        type="button"
        class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
      >
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <span class="text-blue-400 text-sm">{{ editingRatingId ? '✎' : '+' }}</span>
          </div>
          <span class="text-sm font-medium text-slate-300">
            {{ editingRatingId ? 'Edit Rating' : 'Add New Rating' }}
          </span>
        </div>
        <svg
          class="w-4 h-4 text-slate-400 transition-transform"
          :class="{ 'rotate-180': showRatingForm }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <div v-if="showRatingForm" class="px-6 pb-6 space-y-5 border-t border-slate-700/50">
        <div class="pt-5">
          <h3 class="text-sm font-medium text-slate-300 mb-3">
            Select Skills & Assign Scores ({{ selectedSkillsForRating.size }} selected)
          </h3>

          <div class="space-y-4">
            <div v-if="softSkills.length">
              <p class="text-xs text-purple-400 mb-2 flex items-center gap-1">
                <span>🧠</span>
                <span>Soft Skills</span>
              </p>
              <div class="space-y-2">
                <div
                  v-for="skill in softSkills"
                  :key="skill.skill.id"
                  class="border rounded p-3 transition-all"
                  :class="
                    selectedSkillsForRating.has(skill.skill.id)
                      ? 'border-purple-500/50 bg-purple-500/5'
                      : 'border-slate-700/30 hover:border-slate-600/50'
                  "
                >
                  <div class="flex items-center gap-3">
                    <button
                      @click="toggleSkillForRating(skill.skill.id)"
                      type="button"
                      class="flex-shrink-0 w-5 h-5 rounded border-2 transition-colors flex items-center justify-center"
                      :class="
                        selectedSkillsForRating.has(skill.skill.id)
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-slate-600 hover:border-slate-500'
                      "
                    >
                      <svg
                        v-if="selectedSkillsForRating.has(skill.skill.id)"
                        class="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="3"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>

                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-medium text-slate-300">{{ skill.skill.name }}</p>
                    </div>

                    <div
                      v-if="selectedSkillsForRating.has(skill.skill.id)"
                      class="flex items-center gap-2 flex-shrink-0"
                    >
                      <input
                        type="number"
                        min="0"
                        max="100"
                        :value="selectedSkillsForRating.get(skill.skill.id)"
                        @input="
                          updateSkillScore(
                            skill.skill.id,
                            parseInt(($event.target as HTMLInputElement).value) || 0
                          )
                        "
                        class="w-16 bg-slate-900/50 border border-slate-700/50 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        :value="selectedSkillsForRating.get(skill.skill.id)"
                        @input="
                          updateSkillScore(
                            skill.skill.id,
                            parseInt(($event.target as HTMLInputElement).value)
                          )
                        "
                        class="w-24"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="hardSkills.length">
              <p class="text-xs text-cyan-400 mb-2 flex items-center gap-1">
                <span>⚙️</span>
                <span>Hard Skills</span>
              </p>
              <div class="space-y-2">
                <div
                  v-for="skill in hardSkills"
                  :key="skill.skill.id"
                  class="border rounded p-3 transition-all"
                  :class="
                    selectedSkillsForRating.has(skill.skill.id)
                      ? 'border-cyan-500/50 bg-cyan-500/5'
                      : 'border-slate-700/30 hover:border-slate-600/50'
                  "
                >
                  <div class="flex items-center gap-3">
                    <button
                      @click="toggleSkillForRating(skill.skill.id)"
                      type="button"
                      class="flex-shrink-0 w-5 h-5 rounded border-2 transition-colors flex items-center justify-center"
                      :class="
                        selectedSkillsForRating.has(skill.skill.id)
                          ? 'border-cyan-500 bg-cyan-500'
                          : 'border-slate-600 hover:border-slate-500'
                      "
                    >
                      <svg
                        v-if="selectedSkillsForRating.has(skill.skill.id)"
                        class="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="3"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>

                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-medium text-slate-300">{{ skill.skill.name }}</p>
                    </div>

                    <div
                      v-if="selectedSkillsForRating.has(skill.skill.id)"
                      class="flex items-center gap-2 flex-shrink-0"
                    >
                      <input
                        type="number"
                        min="0"
                        max="100"
                        :value="selectedSkillsForRating.get(skill.skill.id)"
                        @input="
                          updateSkillScore(
                            skill.skill.id,
                            parseInt(($event.target as HTMLInputElement).value) || 0
                          )
                        "
                        class="w-16 bg-slate-900/50 border border-slate-700/50 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        :value="selectedSkillsForRating.get(skill.skill.id)"
                        @input="
                          updateSkillScore(
                            skill.skill.id,
                            parseInt(($event.target as HTMLInputElement).value)
                          )
                        "
                        class="w-24"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p
              v-if="!(softSkills.length && hardSkills.length)"
              class="text-slate-500 text-xs text-center py-4"
            >
              No skills available for rating
            </p>
          </div>
        </div>

        <div>
          <label for=" comment" class="block text-xs font-medium text-slate-400 mb-2">
            comment (Optional)
          </label>
          <textarea
            id=" comment"
            v-model="comment"
            rows="3"
            placeholder="Add any additional notes or feedback..."
            class="w-full bg-slate-900/50 border border-slate-700/50 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          ></textarea>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <button
            @click="cancelEdit"
            type="button"
            class="px-4 py-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
            :disabled="submitting"
          >
            Cancel
          </button>
          <button
            @click="handleSubmitRating"
            type="button"
            class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white rounded transition-colors"
            :disabled="!canSubmitRating || submitting"
          >
            {{ submitting ? 'Saving...' : editingRatingId ? 'Update Rating' : 'Submit Rating' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Rating History -->
    <div
      v-if="student.ratings?.length"
      class="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6"
    >
      <h3 class="text-sm font-semibold text-slate-300 mb-4">
        Rating History ({{ student.ratings.length }})
      </h3>

      <div class="space-y-3">
        <div
          v-for="rating in student.ratings"
          :key="rating.id"
          class="border border-slate-700/30 rounded p-4 hover:border-slate-600/50 transition-colors"
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <p class="text-xs text-slate-400 mb-1">
                {{ formatDate(rating.createdAt.toString()) }}
              </p>
              <div class="flex items-center gap-2">
                <span
                  class="text-lg font-bold"
                  :style="{ color: getRatingColor(calculateAverage(rating.skillRatings)) }"
                >
                  {{ calculateAverage(rating.skillRatings) }}
                </span>
                <span class="text-xs text-slate-500">average</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="startEditRating(rating)"
                type="button"
                class="px-3 py-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-950/30 hover:bg-blue-950/50 border border-blue-500/30 hover:border-blue-500/50 rounded transition-colors flex items-center gap-1.5"
              >
                <Pencil :size="14" />
              </button>
              <button
                @click="handleDeleteRating(rating.id)"
                type="button"
                class="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/50 border border-red-500/30 hover:border-red-500/50 rounded transition-colors flex items-center gap-1.5"
              >
                <Trash2 :size="14" />
              </button>
            </div>
          </div>

          <p v-if="rating.comment" class="text-xs text-slate-300 mb-3 italic">
            "{{ rating.comment }}"
          </p>

          <div class="flex flex-wrap gap-2">
            <span
              v-for="sr in rating.skillRatings"
              :key="sr.skill.id"
              class="px-2 py-1 text-xs font-medium rounded border"
              :style="{
                borderColor: getRatingColor(sr.score),
                color: getRatingColor(sr.score),
                backgroundColor: getRatingColor(sr.score) + '15'
              }"
            >
              {{ sr.skill.name }}: {{ sr.score }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
