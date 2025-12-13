import { z } from 'zod'

export const loginSchema = z.object({
  name: z.string().min(5, { message: 'Name must be at least 5 characters long' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' })
})

export type LoginInput = z.infer<typeof loginSchema>
