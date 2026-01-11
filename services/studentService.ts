import { attachActivitiesReq, updateStudentInfoReq } from '@/schemas/student.schema'
import { prisma } from '../config/prisma'
import { ResponseSchema as Response } from '@schemas/response.schema'

export async function indexStudents(page: number = 1): Promise<Response> {
  const PAGE_SIZE = 10
  try {
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        orderBy: { id: 'desc' },
        select: {
          code: true,
          name: true,
          email: true,
          specialty: {
            select: { name: true }
          },
          grade: {
            select: { name: true }
          }
        }
      }),
      prisma.student.count()
    ])

    return {
      success: true,
      message: 'students fetched successfully',
      data: {
        students,
        meta: {
          currentPage: page,
          perPage: PAGE_SIZE,
          total,
          lastPage: Math.ceil(total / PAGE_SIZE)
        }
      }
    }
  } catch (err) {
    console.error(err)
    console.error(err)
    return err instanceof Error
      ? { success: false, message: err.message as string }
      : { success: false, message: 'Unexpected Error' }
  }
}

export async function showStudent(code: string): Promise<Response> {
  try {
    const student = await prisma.student.findFirstOrThrow({
      where: {
        code: code
      },
      include: {
        grade: {
          select: { name: true }
        },
        specialty: {
          select: { name: true }
        },
        activities: true,
        ratings: {
          include: {
            skillRatings: {
              include: {
                skill: true
              }
            }
          }
        }
      }
    })
    return {
      success: true,
      message: 'Student fetched successfully',
      data: student
    }
  } catch (err) {
    console.error(err)
    return err instanceof Error
      ? { success: false, message: err.message as string }
      : { success: false, message: 'Unexpected Error' }
  }
}

export async function updateStudent(data: updateStudentInfoReq): Promise<Response> {
  try {
    await prisma.student.update({
      where: { code: data.code },
      data: data
    })
    return {
      success: true,
      message: 'Student updated Successfully'
    }
  } catch (err) {
    console.error(err)
    return err instanceof Error
      ? { success: false, message: err.message as string }
      : { success: false, message: 'Unexpected Error' }
  }
}
export async function updateAttachedActivities(data: attachActivitiesReq): Promise<Response> {
  try {
    const { code, activityIds } = data
    const student = await prisma.student.update({
      where: { code: code },
      data: {
        activities: {
          set: activityIds.map((id) => ({ id }))
        }
      },
      include: {
        activities: true
      }
    })

    return {
      success: true,
      message: 'Updated Successfully',
      data: { activities: student.activities }
    }
  } catch (err) {
    console.error(err)
    return err instanceof Error
      ? { success: false, message: err.message as string }
      : { success: false, message: 'Unexpected Error' }
  }
}
