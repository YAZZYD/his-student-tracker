// composables/useEvaluationManagement.ts
import { ref, computed, Ref } from 'vue'
import type { EvaluationWithRelations as Evaluation, Skill } from '@renderer/types/models'
import { ResponseSchema } from '@/schemas/response.schema'
import { ComputedRef } from 'vue'

export function useEvaluationManagement(code: string): {
  loading: Ref<boolean>
  error: Ref<string | null>
  softSkills: Ref<Array<{ id: number; name: string }>>
  hardSkills: Ref<Array<{ id: number; name: string }>>
  editingEvaluationId: Ref<number | null>
  selectedSkillsForEvaluation: Ref<Map<number, number | null>>
  comment: Ref<string>
  submitting: Ref<boolean>
  canSubmitEvaluation: ComputedRef<boolean>
  toggleSkillForEvaluation: (skillId: number) => void
  updateSkillScore: (skillId: number, score: number) => void
  startEditEvaluation: (evaluation: Evaluation) => void
  cancelEdit: () => void
  submitEvaluation: () => Promise<ResponseSchema | void>
  deleteEvaluation: (evaluationId: number) => Promise<ResponseSchema | void>
  fetchSkills: () => Promise<void>
} {
  const editingEvaluationId = ref<number | null>(null)
  const softSkills = ref<Array<{ id: number; name: string }>>([])
  const hardSkills = ref<Array<{ id: number; name: string }>>([])
  const selectedSkillsForEvaluation = ref<Map<number, number | null>>(new Map())
  const comment = ref('')
  const submitting = ref(false)
  const loading = ref(true)
  const error = ref<string | null>(null)

  const canSubmitEvaluation = computed(() => selectedSkillsForEvaluation.value.size > 0)

  function toggleSkillForEvaluation(skillId: number): void {
    if (selectedSkillsForEvaluation.value.has(skillId)) {
      selectedSkillsForEvaluation.value.delete(skillId)
    } else {
      selectedSkillsForEvaluation.value.set(skillId, 0)
    }
  }

  function updateSkillScore(skillId: number, score: number): void {
    const clampedScore = Math.max(0, Math.min(100, score))
    selectedSkillsForEvaluation.value.set(skillId, clampedScore)
  }

  function startEditEvaluation(evaluation: Evaluation): void {
    editingEvaluationId.value = evaluation.id
    selectedSkillsForEvaluation.value = new Map(
      evaluation.skillEvaluations.map((sr) => [sr.skillId, sr.score])
    )
    comment.value = evaluation.comment || ''
  }

  function cancelEdit(): void {
    editingEvaluationId.value = null
    selectedSkillsForEvaluation.value.clear()
    comment.value = ''
  }

  async function submitEvaluation(): Promise<ResponseSchema | void> {
    if (!canSubmitEvaluation.value || submitting.value) return

    submitting.value = true
    try {
      const skillEvaluations = Array.from(selectedSkillsForEvaluation.value.entries()).map(
        ([skillId, score]) => ({ skillId, score })
      )

      const payload = {
        code: code,
        comment: comment.value.trim() || null,
        skillEvaluations
      }

      const response = editingEvaluationId.value
        ? await window.api.updateEvaluation({ evaluationId: editingEvaluationId.value, ...payload })
        : await window.api.createEvaluation(payload)

      if (response.success) {
        cancelEdit()
        return response
      }

      throw new Error(response.message)
    } finally {
      submitting.value = false
    }
  }

  async function fetchSkills(): Promise<void> {
    loading.value = true
    try {
      const response = await window.api.indexSkills()
      if (response.success) {
        const skills: Skill[] = response.data.skills
        softSkills.value = skills.filter((s: Skill) => s.type === 'SOFT')
        hardSkills.value = skills.filter((s: Skill) => s.type === 'HARD')
      }
    } catch (err) {
      error.value = 'Failed to fetch skills.'
      console.error('Failed to fetch skills:', err)
    } finally {
      loading.value = false
    }
  }
  async function deleteEvaluation(evaluationId: number): Promise<ResponseSchema | void> {
    if (!confirm('Delete this evaluation? This cannot be undone.')) return

    const response = await window.api.deleteEvaluation(evaluationId)
    return response
  }

  return {
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
    startEditEvaluation,
    cancelEdit,
    submitEvaluation,
    deleteEvaluation,
    fetchSkills
  }
}
