import { prisma } from '../config/prisma'

import { ResponseSchema as Response } from '@schemas/response.schema'

export async function indexSkills(): Promise<Response> {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { name: 'asc' }
    })

    return {
      success: true,
      message: 'Successfully fetched skills',
      data: { skills }
    }
  } catch (err) {
    console.error(err)
    return err instanceof Error
      ? { success: false, message: err.message as string }
      : { success: false, message: 'Unexpected Error' }
  }
}
