import { createActivityReq, updateActivityReq } from '@/schemas/activity.schema'
import { prisma } from '../config/prisma'
import { ResponseSchema as Response } from '@schemas/response.schema'

const PAGE_SIZE = 10
export async function indexActivities(
  page: number = 1,
  paginate: boolean = false
): Promise<Response> {
  try {
    if (!paginate) {
      const activities = await prisma.activity.findMany()

      return {
        success: true,
        message: 'Successfully fetched activities',
        data: { activities }
      }
    }

    const [activities, total] = await prisma.$transaction([
      prisma.activity.findMany({
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE
      }),
      prisma.activity.count()
    ])

    return {
      success: true,
      message: 'Successfully fetched activities',
      data: {
        activities,
        meta: {
          currentPage: page,
          PAGE_SIZE,
          total,
          lastPage: Math.ceil(total / PAGE_SIZE)
        }
      }
    }
  } catch (err) {
    console.error(err)
    throw err instanceof Error ? err : new Error('Unexpected error')
  }
}
export async function createActivity(data: createActivityReq): Promise<Response> {
  try {
    const activity = await prisma.activity.create({
      data: data
    })

    return {
      success: true,
      status: 201,
      message: 'created',
      data: { activity }
    }
  } catch (err) {
    console.error(err)
    throw err instanceof Error ? err : new Error('Unexpected error')
  }
}
export async function updateActivity(data: updateActivityReq): Promise<Response> {
  try {
    const { id, ...payload } = data
    const activity = await prisma.activity.update({
      where: { id },
      data: payload
    })
    return {
      success: true,
      status: 200,
      message: 'updated',
      data: { activity }
    }
  } catch (err) {
    console.error(err)
    throw err instanceof Error ? err : new Error('Unexpected error')
  }
}
export async function deleteActivity(activityId: number): Promise<Response> {
  try {
    const activity = await prisma.activity.findUniqueOrThrow({
      where: { id: activityId }
    })
    await prisma.activity.delete({
      where: { id: activityId }
    })
    return {
      success: true,
      status: 200,
      message: 'deleted',
      data: { activity }
    }
  } catch (err) {
    console.error(err)
    throw err instanceof Error ? err : new Error('Unexpected error')
  }
}
