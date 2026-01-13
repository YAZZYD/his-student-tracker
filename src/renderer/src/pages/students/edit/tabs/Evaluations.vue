<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useEvaluationManagement } from '@renderer/composables/useEvaluationManagement'
import { useRoute } from 'vue-router'
import { Check, Plus, Trash2, Pencil, ChevronDown } from 'lucide-vue-next'

import type {
  EvaluationWithRelations as Evaluation,
  SkillEvaluation,
  StudentWithRelations
} from '@renderer/types/models'
import { formatDate, getEvaluationColor } from '@renderer/lib/format.utils'
import Error from '@renderer/components/ui/error/Error.vue'
import Loading from '@renderer/components/ui/loading/Loading.vue'
import { SkillTypeMap } from '@renderer/constants/skill.constants'

interface Props {
  student: StudentWithRelations
}

const route = useRoute()

const {
  loading,
  error,
  softSkills,
  hardSkills,
  editingEvaluationId,
  selectedSkillsForEvaluation,
  comment,
  submitting,
  canSubmitEvaluation,
  toggleSkillForEvaluation,
  updateSkillScore,
  startEditEvaluation: startEdit,
  cancelEdit: cancel,
  submitEvaluation,
  deleteEvaluation,
  fetchSkills
} = useEvaluationManagement(route.params.code as string)
const showEvaluationForm = ref(false)

//eslint-disable-next-line
const props = defineProps<Props>()

function calculateAverage(skillEvaluations: SkillEvaluation[]): number {
  const validScores = skillEvaluations
    .map((sr) => sr.score)
    .filter((score): score is number => score != null)

  if (!validScores.length) return 0

  return Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
}

function startEditEvaluation(evaluation: Evaluation): void {
  startEdit(evaluation)
  showEvaluationForm.value = true
}

function cancelEdit(): void {
  cancel()
  showEvaluationForm.value = false
}

async function handleSubmitEvaluation(): Promise<void> {
  const response = await submitEvaluation()
  if (response?.success) {
    showEvaluationForm.value = false
    // Refresh student data
    // await fetchStudent(route.params.code as string)
  }
}

async function handleDeleteEvaluation(evaluationId: number): Promise<void> {
  const response = await deleteEvaluation(evaluationId)
  if (response?.success) {
    // await fetchStudent(route.params.code as string)
  }
}
onMounted(async () => {
  await fetchSkills()
})
</script>

<!-- Updated template section with edit functionality -->
<template>
  <div class="space-y-6">
    <Loading v-if="loading" />
    <Error v-else-if="error" :error="error" />

    <!-- Evaluation Form (Create/Edit) -->
    <div class="bg-slate-800/30 border border-slate-700/50 rounded-lg overflow-hidden">
      <button
        type="button"
        class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
        @click="showEvaluationForm = !showEvaluationForm"
      >
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Pencil v-if="editingEvaluationId" class="w-4 h-4 text-blue-400" :stroke-width="2" />
            <Plus v-else class="w-4 h-4 text-blue-400" :stroke-width="2" />
          </div>

          <span class="text-sm font-medium text-slate-300">
            {{ editingEvaluationId ? 'Edit Evaluation' : 'Add New Evaluation' }}
          </span>
        </div>

        <ChevronDown
          class="w-4 h-4 text-slate-400 transition-transform"
          :class="{ 'rotate-180': showEvaluationForm }"
          :stroke-width="2"
        />
      </button>

      <div v-if="showEvaluationForm" class="px-6 pb-6 space-y-5 border-t border-slate-700/50">
        <div class="pt-5">
          <h3 class="text-sm font-medium text-slate-300 mb-3">
            Select Skills & Assign Scores ({{ selectedSkillsForEvaluation.size }} selected)
          </h3>

          <div class="space-y-4 max-h-[30vh] overflow-y-auto pr-2">
            <div v-if="softSkills.length">
              <p class="text-s text-purple-400 mb-2 flex items-center gap-1">
                <component :is="SkillTypeMap['SOFT'].icon" class="inline w-4 h-4 mr-1" />
                <span>Soft Skills</span>
              </p>
              <div class="space-y-2">
                <div
                  v-for="skill in softSkills"
                  :key="skill.id"
                  class="border rounded p-3 transition-all"
                  :class="
                    selectedSkillsForEvaluation.has(skill.id)
                      ? 'border-purple-500/50 bg-purple-500/5'
                      : 'border-slate-700/30 hover:border-slate-600/50'
                  "
                >
                  <div class="flex items-center gap-3">
                    <button
                      type="button"
                      class="shrink-0 w-5 h-5 rounded border-2 transition-colors flex items-center justify-center"
                      :class="
                        selectedSkillsForEvaluation.has(skill.id)
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-slate-600 hover:border-slate-500'
                      "
                      @click="toggleSkillForEvaluation(skill.id)"
                    >
                      <Check
                        v-if="selectedSkillsForEvaluation.has(skill.id)"
                        class="w-3 h-3 text-white"
                        :stroke-width="3"
                      />
                    </button>

                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-medium text-slate-300">{{ skill.name }}</p>
                    </div>

                    <div
                      v-if="selectedSkillsForEvaluation.has(skill.id)"
                      class="flex items-center gap-2 shrink-0"
                    >
                      <input
                        type="number"
                        min="0"
                        max="100"
                        class="w-16 bg-slate-900/50 border border-slate-700/50 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        :value="selectedSkillsForEvaluation.get(skill.id)"
                        @input="
                          updateSkillScore(
                            skill.id,
                            parseInt(($event.target as HTMLInputElement).value) || 0
                          )
                        "
                      />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        class="w-24"
                        :value="selectedSkillsForEvaluation.get(skill.id)"
                        @input="
                          updateSkillScore(
                            skill.id,
                            parseInt(($event.target as HTMLInputElement).value)
                          )
                        "
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="hardSkills.length">
              <p class="text-xs text-cyan-400 mb-2 flex items-center gap-1">
                <component :is="SkillTypeMap['HARD'].icon" class="inline w-4 h-4 mr-1" />
                <span>Hard Skills</span>
              </p>
              <div class="space-y-2">
                <div
                  v-for="skill in hardSkills"
                  :key="skill.id"
                  class="border rounded p-3 transition-all"
                  :class="
                    selectedSkillsForEvaluation.has(skill.id)
                      ? 'border-cyan-500/50 bg-cyan-500/5'
                      : 'border-slate-700/30 hover:border-slate-600/50'
                  "
                >
                  <div class="flex items-center gap-3">
                    <button
                      type="button"
                      class="shrink-0 w-5 h-5 rounded border-2 transition-colors flex items-center justify-center"
                      :class="
                        selectedSkillsForEvaluation.has(skill.id)
                          ? 'border-cyan-500 bg-cyan-500'
                          : 'border-slate-600 hover:border-slate-500'
                      "
                      @click="toggleSkillForEvaluation(skill.id)"
                    >
                      <Check
                        v-if="selectedSkillsForEvaluation.has(skill.id)"
                        class="w-3 h-3 text-white"
                        :stroke-width="3"
                      />
                    </button>

                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-medium text-slate-300">{{ skill.name }}</p>
                    </div>

                    <div
                      v-if="selectedSkillsForEvaluation.has(skill.id)"
                      class="flex items-center gap-2 shrink-0"
                    >
                      <input
                        type="number"
                        min="0"
                        max="100"
                        class="w-16 bg-slate-900/50 border border-slate-700/50 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        :value="selectedSkillsForEvaluation.get(skill.id)"
                        @input="
                          updateSkillScore(
                            skill.id,
                            parseInt(($event.target as HTMLInputElement).value) || 0
                          )
                        "
                      />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        class="w-24"
                        :value="selectedSkillsForEvaluation.get(skill.id)"
                        @input="
                          updateSkillScore(
                            skill.id,
                            parseInt(($event.target as HTMLInputElement).value)
                          )
                        "
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
              No skills available for evaluation
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
            type="button"
            class="px-4 py-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
            :disabled="submitting"
            @click="cancelEdit"
          >
            Cancel
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white rounded transition-colors"
            :disabled="!canSubmitEvaluation || submitting"
            @click="handleSubmitEvaluation"
          >
            {{
              submitting
                ? 'Saving...'
                : editingEvaluationId
                  ? 'Update Evaluation'
                  : 'Submit Evaluation'
            }}
          </button>
        </div>
      </div>
    </div>

    <!-- Evaluation History -->
    <div
      v-if="student.evaluations?.length"
      class="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6"
    >
      <h3 class="text-sm font-semibold text-slate-300 mb-4">
        Evaluation History ({{ student.evaluations.length }})
      </h3>

      <div class="space-y-3">
        <div
          v-for="evaluation in student.evaluations"
          :key="evaluation.id"
          class="border border-slate-700/30 rounded p-4 hover:border-slate-600/50 transition-colors"
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <p class="text-xs text-slate-400 mb-1">
                {{ formatDate(evaluation.createdAt.toString()) }}
              </p>
              <div class="flex items-center gap-2">
                <span
                  class="text-lg font-bold"
                  :style="{
                    color: getEvaluationColor(calculateAverage(evaluation.skillEvaluations))
                  }"
                >
                  {{ calculateAverage(evaluation.skillEvaluations) }}
                </span>
                <span class="text-xs text-slate-500">average</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="px-3 py-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-950/30 hover:bg-blue-950/50 border border-blue-500/30 hover:border-blue-500/50 rounded transition-colors flex items-center gap-1.5"
                @click="startEditEvaluation(evaluation)"
              >
                <Pencil :size="14" />
              </button>
              <button
                type="button"
                class="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/50 border border-red-500/30 hover:border-red-500/50 rounded transition-colors flex items-center gap-1.5"
                @click="handleDeleteEvaluation(evaluation.id)"
              >
                <Trash2 :size="14" />
              </button>
            </div>
          </div>

          <p v-if="evaluation.comment" class="text-xs text-slate-300 mb-3 italic">
            "{{ evaluation.comment }}"
          </p>

          <div class="flex flex-wrap gap-2">
            <span
              v-for="sr in evaluation.skillEvaluations"
              :key="sr.skill.id"
              class="px-2 py-1 text-xs font-medium rounded border"
              :style="{
                borderColor: getEvaluationColor(sr.score),
                color: getEvaluationColor(sr.score),
                backgroundColor: getEvaluationColor(sr.score) + '15'
              }"
            >
              {{ sr.skill.name }}: {{ sr.score ?? 'N/A' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
