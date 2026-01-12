// services/rating.service.ts
import { CreateRatingReq, updateRatingReq } from '@/schemas/rating.schema'
import { prisma } from '../config/prisma'
import { ResponseSchema as Response } from '@schemas/response.schema'

export async function createRating(payload: CreateRatingReq): Promise<Response> {
  try {
    const { code, comment, skillRatings } = payload
    const student = await prisma.student.findUniqueOrThrow({
      where: { code: code },
      select: { id: true }
    })

    const rating = await prisma.rating.create({
      data: {
        studentId: student.id,
        comment: comment,
        skillRatings: {
          create: skillRatings.map((sr) => ({
            skillId: sr.skillId,
            score: sr.score
          }))
        }
      },
      include: {
        skillRatings: {
          include: { skill: true }
        }
      }
    })

    return {
      success: true,
      message: 'Rating created successfully',
      data: rating
    }
  } catch (err) {
    console.error(err)
    return err instanceof Error
      ? { success: false, message: err.message }
      : { success: false, message: 'Unexpected Error' }
  }
}
export async function updateRating(payload: updateRatingReq): Promise<Response> {
  const { ratingId, comment, skillRatings } = payload

  try {
    const existingSkillRatings = await prisma.skillRating.findMany({
      where: { ratingId },
      select: { skillId: true }
    })

    const existingSkillIds = new Set(existingSkillRatings.map((sr) => sr.skillId))
    const incomingSkillIds = new Set(skillRatings.map((sr) => sr.skillId))

    const skillIdsToDelete = [...existingSkillIds].filter((id) => !incomingSkillIds.has(id))

    await prisma.$transaction([
      // Delete skill ratings that were removed
      prisma.skillRating.deleteMany({
        where: {
          ratingId,
          skillId: { in: skillIdsToDelete }
        }
      }),
      // Upsert all incoming skill ratings
      ...skillRatings.map((sr) =>
        prisma.skillRating.upsert({
          where: {
            ratingId_skillId: {
              ratingId,
              skillId: sr.skillId
            }
          },
          update: {
            score: sr.score
          },
          create: {
            ratingId,
            skillId: sr.skillId,
            score: sr.score
          }
        })
      ),
      // Update the comment
      prisma.rating.update({
        where: { id: ratingId },
        data: { comment }
      })
    ])

    const updated = await prisma.rating.findUnique({
      where: { id: ratingId },
      include: { skillRatings: { include: { skill: true } } }
    })

    return {
      success: true,
      message: 'Rating updated successfully',
      data: updated
    }
  } catch (err) {
    console.error(err)
    return { success: false, message: 'Failed to update rating' }
  }
}

export async function deleteRating(ratingId: number): Promise<Response> {
  try {
    // Cascade delete handled by Prisma (skillRatings deleted automatically)
    await prisma.rating.delete({
      where: { id: ratingId }
    })

    return {
      success: true,
      message: 'Rating deleted successfully'
    }
  } catch (err) {
    console.error(err)
    return { success: false, message: 'Failed to delete rating' }
  }
}
