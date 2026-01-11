import { prisma } from '../config/prisma'
import { ResponseSchema as Response } from '@schemas/response.schema'

export async function indexActivities(): Promise<Response> {
  try {
    const activities = await prisma.activity.findMany()

    return {
      success: true,
      message: 'Successfully fetched activities',
      data: { activities }
    }
  } catch (err) {
    console.error(err)
    console.error(err)
    return err instanceof Error
      ? { success: false, message: err.message as string }
      : { success: false, message: 'Unexpected Error' }
  }
}
