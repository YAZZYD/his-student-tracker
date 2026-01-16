import { ref, computed, Ref, ComputedRef } from 'vue'
import {
  StudentWithRelations as Student,
  SkillAvg,
  SkillEvaluationWithRelations as SkillEvaluation
} from '@renderer/types/models'

import { getVertexPosition } from '@renderer/lib/geometry.utils'

export const useStudentData = (): {
  student: Ref<Student | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  softSkills: ComputedRef<SkillAvg[]>
  hardSkills: ComputedRef<SkillAvg[]>
  age: ComputedRef<number>
  softSkillsAverage: ComputedRef<number>
  hardSkillsAverage: ComputedRef<number>
  engagementScore: ComputedRef<number>
  overallEvaluation: ComputedRef<number>
  getDataPoints: ComputedRef<{ x: number; y: number }[]>
  fetchStudent: (code: string) => Promise<void>
  initStudent: () => void
} => {
  const student = ref<Student | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  const averageSkillScores = computed<SkillAvg[]>(() => {
    if (!student.value?.evaluations.length) return []

    const skillMap = new Map<number, { skill: SkillEvaluation['skill']; scores: number[] }>()

    student.value.evaluations.forEach((evaluation) => {
      evaluation.skillEvaluations.forEach((sr) => {
        if (sr.score == null) return

        if (!skillMap.has(sr.skill.id)) {
          skillMap.set(sr.skill.id, { skill: sr.skill, scores: [] })
        }
        skillMap.get(sr.skill.id)!.scores.push(sr.score)
      })
    })

    return Array.from(skillMap.values())
      .filter(({ scores }) => scores.length > 0)
      .map(({ skill, scores }) => ({
        skill,
        average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      }))
  })

  const softSkills = computed(() => averageSkillScores.value.filter((s) => s.skill.type === 'SOFT'))

  const hardSkills = computed(() => averageSkillScores.value.filter((s) => s.skill.type === 'HARD'))

  const overallEvaluation = computed(() => {
    if (!averageSkillScores.value.length) return 0
    return Math.round(
      averageSkillScores.value.reduce((sum, s) => sum + s.average, 0) /
        averageSkillScores.value.length
    )
  })

  const age = computed(() => {
    if (!student.value) return 0
    const birth = new Date(student.value.birth_date)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  })

  const softSkillsAverage = computed(() => {
    if (!softSkills.value.length) return 0
    return Math.round(
      softSkills.value.reduce((sum, s) => sum + s.average, 0) / softSkills.value.length
    )
  })

  const hardSkillsAverage = computed(() => {
    if (!hardSkills.value.length) return 0
    return Math.round(
      hardSkills.value.reduce((sum, s) => sum + s.average, 0) / hardSkills.value.length
    )
  })

  const engagementScore = computed(() => {
    if (!student.value) return 0
    const activityCount = student.value.activities.length
    return Math.min(100, Math.round((activityCount / 10) * 100))
  })

  const initStudent = (): void => {
    const emptyStudent: Student = {
      id: 0,
      code: '',
      name: '',
      email: '',
      phone: '',
      birth_date: new Date(),
      birth_place: '',
      enrollment_year: new Date(),
      address: '',

      gradeId: 0,
      specialtyId: 0,
      grade: { id: 0, name: '' },
      specialty: { id: 0, name: '' },

      activities: [],
      evaluations: [],

      createdAt: new Date(),
      updatedAt: new Date()
    }
    student.value = emptyStudent
    loading.value = false
  }

  const fetchStudent = async (code: string): Promise<void> => {
    try {
      loading.value = true
      const response = await window.api.student.show(code)
      if (response.success) student.value = response.data
    } catch (err: any) {
      error.value = 'Failed to load student data'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const getDataPoints = computed(() => {
    const values = [softSkillsAverage.value, hardSkillsAverage.value, engagementScore.value]
    return values.map((value, i) => getVertexPosition(i, (value / 100) * 35, 0))
  })

  return {
    student,
    loading,
    error,
    softSkills,
    hardSkills,
    overallEvaluation,
    age,
    softSkillsAverage,
    hardSkillsAverage,
    engagementScore,
    getDataPoints,
    fetchStudent,
    initStudent
  }
}
