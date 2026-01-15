// services/evaluation.service.ts
import { CreateEvaluationReq, updateEvaluationReq } from '@/schemas/evaluation.schema'
import { prisma } from '../config/prisma'
import { ResponseSchema as Response } from '@schemas/response.schema'

export async function createEvaluation(data: CreateEvaluationReq): Promise<Response> {
  try {
    const { code, comment, skillEvaluations } = data
    const student = await prisma.student.findUniqueOrThrow({
      where: { code: code },
      select: { id: true }
    })

    const evaluation = await prisma.evaluation.create({
      data: {
        studentId: student.id,
        comment: comment,
        skillEvaluations: {
          create: skillEvaluations.map((sr) => ({
            skillId: sr.skillId,
            score: sr.score
          }))
        }
      },
      include: {
        skillEvaluations: {
          include: { skill: true }
        }
      }
    })

    return {
      success: true,
      status: 201,
      message: 'Evaluation created successfully',
      data: { evaluation }
    }
  } catch (err) {
    console.error(err)
    throw err instanceof Error ? err : new Error('Unexpected error')
  }
}
export async function updateEvaluation(data: updateEvaluationReq): Promise<Response> {
  const { evaluationId, comment, skillEvaluations } = data

  try {
    const existingSkillEvaluations = await prisma.skillEvaluation.findMany({
      where: { evaluationId },
      select: { skillId: true }
    })

    const existingSkillIds = new Set(existingSkillEvaluations.map((sr) => sr.skillId))
    const incomingSkillIds = new Set(skillEvaluations.map((sr) => sr.skillId))

    const skillIdsToDelete = [...existingSkillIds].filter((id) => !incomingSkillIds.has(id))

    await prisma.$transaction([
      // Delete skill evaluations that were removed
      prisma.skillEvaluation.deleteMany({
        where: {
          evaluationId,
          skillId: { in: skillIdsToDelete }
        }
      }),
      // Upsert all incoming skill evaluations
      ...skillEvaluations.map((sr) =>
        prisma.skillEvaluation.upsert({
          where: {
            evaluationId_skillId: {
              evaluationId,
              skillId: sr.skillId
            }
          },
          update: {
            score: sr.score
          },
          create: {
            evaluationId,
            skillId: sr.skillId,
            score: sr.score
          }
        })
      ),
      // Update the comment
      prisma.evaluation.update({
        where: { id: evaluationId },
        data: { comment }
      })
    ])

    const updatedEvaluation = await prisma.evaluation.findUnique({
      where: { id: evaluationId },
      include: { skillEvaluations: { include: { skill: true } } }
    })

    return {
      success: true,
      status: 200,
      message: 'Evaluation updated successfully',
      data: { evaluation: updatedEvaluation }
    }
  } catch (err) {
    console.error(err)
    return { success: false, message: 'Failed to update evaluation' }
  }
}

export async function deleteEvaluation(evaluationId: number): Promise<Response> {
  try {
    const deletedEvaluation = await prisma.evaluation.findUnique({
      where: { id: evaluationId },
      include: { skillEvaluations: { include: { skill: true } } }
    })
    await prisma.evaluation.delete({
      where: { id: evaluationId }
    })

    return {
      success: true,
      data: { evaluation: deletedEvaluation },
      message: 'Evaluation deleted successfully'
    }
  } catch (err) {
    console.error(err)
    return { success: false, message: 'Failed to delete evaluation' }
  }
}
