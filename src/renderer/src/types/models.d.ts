import type { Skill_Type, Activity_Type, Skill, Prisma } from '@/prisma/generated/client'
import type {
  SkillEvaluation,
  Evaluation,
  Activity,
  Grade,
  Specialty,
  Student
} from '@/prisma/generated/client'

export interface StudentHeadInfo extends Pick<Student, 'code' | 'name' | 'email'> {
  grade: { name: string }
  specialty: { name: string }
}

export type StudentCode = Pick<Student, 'code'>

export type { Skill_Type, Activity_Type }

export type {
  SkillEvaluation,
  Evaluation,
  Activity,
  Grade,
  Specialty,
  Student,
  Skill,
  SkillEvaluation
}

export interface SkillAvg {
  skill: Skill
  average: number
}

export type StudentWithRelations = Prisma.StudentGetPayload<{
  include: {
    grade: true
    specialty: true
    activities: true
    evaluations: {
      include: {
        skillEvaluations: {
          include: {
            skill: true
          }
        }
      }
    }
  }
}>

export type SkillEvaluationWithRelations = Prisma.SkillEvaluationGetPayload<{
  include: {
    skill: true
  }
}>
export type EvaluationWithRelations = Prisma.EvaluationGetPayload<{
  include: {
    skillEvaluations: {
      include: {
        skill: true
      }
    }
  }
}>
