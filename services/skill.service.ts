import { createSkillReq } from '@/schemas/skill.schema'
import { prisma } from '../prisma/prisma'

import { ResponseSchema as Response } from '@schemas/response.schema'
import { Skill } from '@/prisma/generated/client'

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

export async function createSkill(data: createSkillReq): Promise<Response> {
  try {
    const existing = await prisma.skill.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: 'insensitive'
        }
      }
    })

    if (existing) {
      return {
        success: false,
        message: 'A skill with this name already exists'
      }
    }

    const skill: Skill = await prisma.skill.create({
      data: {
        ...data
      }
    })

    return {
      success: true,
      message: 'Successfully created skill',
      data: { skill }
    }
  } catch (err) {
    console.error(err)
    return err instanceof Error
      ? { success: false, message: err.message as string }
      : { success: false, message: 'Unexpected Error' }
  }
}

export async function deleteSkill(skillId: number): Promise<Response> {
  try {
    await prisma.skill.delete({
      where: { id: skillId }
    })
    return {
      success: true,
      message: 'Successfully deleted skill'
    }
  } catch (err) {
    console.error(err)
    return err instanceof Error
      ? { success: false, message: err.message as string }
      : { success: false, message: 'Unexpected Error' }
  }
}
