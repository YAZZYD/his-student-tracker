import type { Skill_Type, Activity_Type, Skill, Prisma } from '@/prisma/generated/client'
import type {
  SkillRating,
  Rating,
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

export type { SkillRating, Rating, Activity, Grade, Specialty, Student }

export interface SkillAvg {
  skill: Skill
  average: number
}

export type StudentWithRelations = Prisma.StudentGetPayload<{
  include: {
    grade: true
    specialty: true
    activities: true
    ratings: {
      include: {
        skillRatings: {
          include: {
            skill: true
          }
        }
      }
    }
  }
}>

export type SkillRatingWithRelations = Prisma.SkillRatingGetPayload<{
  include: {
    skill: true
  }
}>
export type RatingWithRelations = Prisma.RatingGetPayload<{
  include: {
    skillRatings: {
      include: {
        skill: true
      }
    }
  }
}>
