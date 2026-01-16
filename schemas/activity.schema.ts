import { z } from 'zod'

export const ActivityTypeEnum = z.enum(['INTERNSHIP', 'EVENT', 'WORKSHOP', 'SPORT'])
export const createActivitySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),

  description: z.string().min(1, 'Description is required'),

  type: ActivityTypeEnum
})
export const updateActivitySchema = createActivitySchema.extend({
  id: z.number().int().positive()
})
export type createActivityReq = z.infer<typeof createActivitySchema>
export type updateActivityReq = z.infer<typeof updateActivitySchema>
export type activityType = z.infer<typeof ActivityTypeEnum>
