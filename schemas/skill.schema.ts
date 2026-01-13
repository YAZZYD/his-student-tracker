import { z } from 'zod'

export const createSkillSchema = z.object({
  name: z
    .string()
    .min(2, 'name must be at least 2 characters')
    .max(50, 'name must be at most 50 characters'),
  description: z
    .string()
    .min(5, 'Description must be at least 5 characters')
    .max(255, 'Description must be at most 255 characters'),
  type: z.enum(['SOFT', 'HARD'])
})

export type createSkillReq = z.infer<typeof createSkillSchema>
