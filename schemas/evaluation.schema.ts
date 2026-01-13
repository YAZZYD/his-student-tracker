import { z } from 'zod'

export const CreateEvaluationSchema = z.object({
  code: z.string().min(1, 'Student code is required'),
  comment: z.string().nullable(),
  skillEvaluations: z.array(
    z.object({
      skillId: z.number().int().positive(),
      score: z.number().min(0).max(100)
    })
  )
})

export type CreateEvaluationReq = z.infer<typeof CreateEvaluationSchema>

export const updateEvaluationSchema = z.object({
  evaluationId: z.number().int().positive(),
  comment: z.string().nullable(),
  skillEvaluations: z.array(
    z.object({
      skillId: z.number().int().positive(),
      score: z.number().min(0).max(100)
    })
  )
})

export type updateEvaluationReq = z.infer<typeof updateEvaluationSchema>
