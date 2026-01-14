import { z } from 'zod'

export const studentInfoSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(2, 'Name must be at least 8 characters'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(2, 'must be 2 at least').max(90, 'must be 90 chars at max'),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{7,14}$/, 'Invalid phone number')
    .default(''),
  birth_date: z.string().min(1, 'Birth date is required'),
  birth_place: z.string().min(2, 'Birth place is required'),
  enrollment_year: z.string().min(4, 'Enrollment year is required'),
  gradeId: z.number().min(1, 'Grade is required'),
  specialtyId: z.number().min(1, 'Specialty is required')
})

export type updateStudentInfoReq = z.infer<typeof studentInfoSchema>
export type createStudentInfoReq = z.infer<typeof studentInfoSchema>

export const attachActivitiesSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  activityIds: z.array(z.number().int().positive()).default([])
})

export type attachActivitiesReq = z.infer<typeof attachActivitiesSchema>

export const updateStudentSkillSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  skillIds: z.array(z.number().int().positive()).default([])
})

export type updateStudentSkillReq = z.infer<typeof updateStudentSkillSchema>
