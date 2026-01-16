import { prisma } from '../prisma/prisma'
import bcrypt from 'bcryptjs'
import { ResponseSchema as Response } from '@schemas/response.schema'

export async function authenticate(username: string, password: string): Promise<Response> {
  try {
    const user = await prisma.admin.findUnique({
      where: { username }
    })
    if (!user) return { success: false, message: 'User not found' }
    const passwordMatch = await bcrypt.compare(password, user!.password)
    if (!passwordMatch) return { success: false, message: 'Invalid password' }
    return { success: true, message: 'Login successful' }
  } catch (err) {
    console.error('Authentication error:', err)
    throw err instanceof Error ? err : 'Unexpected Error'
  }
}
