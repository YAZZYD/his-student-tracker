import {
  attachActivitiesReq,
  updateStudentSkillReq,
  updateStudentInfoReq
} from '@/schemas/student.schema'
import { prisma } from '../config/prisma'
import { ResponseSchema as Response } from '@schemas/response.schema'
import { Prisma } from '@/prisma/generated/client'

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
        evaluations: {
          orderBy: { createdAt: 'desc' },
          include: {
            skillEvaluations: {
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

export async function updateStudentSkills(data: updateStudentSkillReq): Promise<Response> {
  const { code, skillIds } = data

  try {
    const student = await prisma.student.findFirstOrThrow({
      where: { code },
      select: { id: true }
    })

    const evaluation = await prisma.evaluation.findFirstOrThrow({
      where: { studentId: student.id },
      select: { id: true },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]
    })

    const existingSkillEvaluations = await prisma.skillEvaluation.findMany({
      where: { evaluationId: evaluation.id },
      select: { skillId: true }
    })

    const existingSkillIds = new Set(existingSkillEvaluations.map((sr) => sr.skillId))
    const incomingSkillIds = new Set(skillIds)

    const skillIdsToDelete = [...existingSkillIds].filter((id) => !incomingSkillIds.has(id))

    await prisma.$transaction([
      prisma.skillEvaluation.deleteMany({
        where: {
          evaluationId: evaluation.id,
          skillId: { in: skillIdsToDelete }
        }
      }),

      ...skillIds.map((skillId) =>
        prisma.skillEvaluation.upsert({
          where: {
            evaluationId_skillId: {
              evaluationId: evaluation.id,
              skillId
            }
          },
          update: {},
          create: {
            evaluationId: evaluation.id,
            skillId,
            score: null
          }
        })
      )
    ])

    const updatedEvaluation: Prisma.EvaluationGetPayload<{
      include: {
        skillEvaluations: {
          include: {
            skill: true
          }
        }
      }
    }> = await prisma.evaluation.findUniqueOrThrow({
      where: { id: evaluation.id },
      include: {
        skillEvaluations: {
          include: {
            skill: true
          }
        }
      }
    })

    return {
      success: true,
      message: 'Student skills updated successfully',
      data: { evaluation: updatedEvaluation }
    }
  } catch (err) {
    console.error(err)
    return err instanceof Error
      ? { success: false, message: err.message }
      : { success: false, message: 'Unexpected Error' }
  }
}
