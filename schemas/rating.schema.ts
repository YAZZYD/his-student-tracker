import { z } from 'zod'

export const CreateRatingSchema = z.object({
  code: z.string().min(1, 'Student code is required'),
  comment: z.string().nullable(),
  skillRatings: z.array(
    z.object({
      skillId: z.number().int().positive(),
      score: z.number().min(0).max(100)
    })
  )
})

export type CreateRatingReq = z.infer<typeof CreateRatingSchema>

export const updateRatingSchema = z.object({
  ratingId: z.number().int().positive(),
  comment: z.string().nullable(),
  skillRatings: z.array(
    z.object({
      skillId: z.number().int().positive(),
      score: z.number().min(0).max(100)
    })
  )
})

export type updateRatingReq = z.infer<typeof updateRatingSchema>
