// composables/useRatingManagement.ts
import { ref, computed, Ref } from 'vue'
import type { RatingWithRelations as Rating } from '@renderer/types/models'
import { ResponseSchema } from '@/schemas/response.schema'
import { ComputedRef } from 'vue'

export function useRatingManagement(code: string): {
  editingRatingId: Ref<number | null>
  selectedSkillsForRating: Ref<Map<number, number>>
  comment: Ref<string>
  submitting: Ref<boolean>
  canSubmitRating: ComputedRef<boolean>
  toggleSkillForRating: (skillId: number) => void
  updateSkillScore: (skillId: number, score: number) => void
  startEditRating: (rating: Rating) => void
  cancelEdit: () => void
  submitRating: () => Promise<ResponseSchema | void>
  deleteRating: (ratingId: number) => Promise<ResponseSchema | void>
} {
  const editingRatingId = ref<number | null>(null)
  const selectedSkillsForRating = ref<Map<number, number>>(new Map())
  const comment = ref('')
  const submitting = ref(false)

  const canSubmitRating = computed(() => selectedSkillsForRating.value.size > 0)

  function toggleSkillForRating(skillId: number): void {
    if (selectedSkillsForRating.value.has(skillId)) {
      selectedSkillsForRating.value.delete(skillId)
    } else {
      selectedSkillsForRating.value.set(skillId, 0) // default score
    }
  }

  function updateSkillScore(skillId: number, score: number): void {
    const clampedScore = Math.max(0, Math.min(100, score))
    selectedSkillsForRating.value.set(skillId, clampedScore)
  }

  function startEditRating(rating: Rating): void {
    editingRatingId.value = rating.id
    selectedSkillsForRating.value = new Map(rating.skillRatings.map((sr) => [sr.skillId, sr.score]))
    comment.value = rating.comment || ''
  }

  function cancelEdit(): void {
    editingRatingId.value = null
    selectedSkillsForRating.value.clear()
    comment.value = ''
  }

  async function submitRating(): Promise<ResponseSchema | void> {
    if (!canSubmitRating.value || submitting.value) return

    submitting.value = true
    try {
      const skillRatings = Array.from(selectedSkillsForRating.value.entries()).map(
        ([skillId, score]) => ({ skillId, score })
      )

      const payload = {
        code: code,
        comment: comment.value.trim() || null,
        skillRatings
      }

      const response = editingRatingId.value
        ? await window.api.updateRating({ ratingId: editingRatingId.value, ...payload })
        : await window.api.createRating(payload)

      if (response.success) {
        cancelEdit()
        return response
      }

      throw new Error(response.message)
    } finally {
      submitting.value = false
    }
  }

  async function deleteRating(ratingId: number): Promise<ResponseSchema | void> {
    if (!confirm('Delete this rating? This cannot be undone.')) return

    const response = await window.api.deleteRating(ratingId)
    return response
  }

  return {
    editingRatingId,
    selectedSkillsForRating,
    comment,
    submitting,
    canSubmitRating,
    toggleSkillForRating,
    updateSkillScore,
    startEditRating,
    cancelEdit,
    submitRating,
    deleteRating
  }
}
