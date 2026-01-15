import { prisma } from '../config/prisma'
import { ResponseSchema as Response } from '@schemas/response.schema'

export async function indexSpecialtiesWithGrades(): Promise<Response> {
  try {
    const specialties = await prisma.specialty.findMany({
      include: {
        specialtyGrades: {
          include: {
            grade: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    const data = specialties.map((specialty) => ({
      id: specialty.id,
      name: specialty.name,
      grades: specialty.specialtyGrades.map((sg) => sg.grade)
    }))

    return {
      success: true,
      message: 'success',
      data
    }
  } catch (err) {
    console.error(err)
    throw err instanceof Error ? err : new Error('Unexpected error')
  }
}
