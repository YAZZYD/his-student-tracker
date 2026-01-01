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
    return { success: false, message: 'Error fetching students' }
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
    return { success: false, message: 'Error while fetching student' }
  }
}
