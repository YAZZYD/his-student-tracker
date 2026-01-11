import { z } from 'zod'

export const updateStudentInfoSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(2, 'Name must be at least 8 characters'),
  email: z.string().email('Invalid email address'),
  birth_date: z.string().min(1, 'Birth date is required'),
  birth_place: z.string().min(2, 'Birth place is required'),
  enrollment_year: z.string().min(4, 'Enrollment year is required'),
  gradeId: z.number().min(1, 'Grade is required'),
  specialtyId: z.number().min(1, 'Specialty is required')
})

export type updateStudentInfoReq = z.infer<typeof updateStudentInfoSchema>

export const attachActivitiesSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  activityIds: z.array(z.number().int().positive()).default([])
})

export type attachActivitiesReq = z.infer<typeof attachActivitiesSchema>
