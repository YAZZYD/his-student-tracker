import { faker } from '@faker-js/faker'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { Skill_Type, Activity_Type } from './generated/enums'

export async function adminSeeder(): Promise<void> {
  await prisma.admin.create({
    data: {
      username: 'admin',
      password: await bcrypt.hash('admin1234', 10)
    }
  })
}

export async function gradeSpecialtySeeder(): Promise<void> {
  const grades = ['L1', 'L2', 'L3', 'M1', 'M2', 'Alumni']
  const specialties = [
    'SI',
    'SSI',
    'GTR',
    'CyberSec',
    'Web',
    'E-commerce',
    'Finnnce',
    'MBA',
    'Management',
    'Psychology',
    'Educational Sciences',
    'DDA',
    'Public Law'
  ]
  await prisma.grade.createMany({
    data: grades.map((name) => ({ name })),
    skipDuplicates: true
  })
  await prisma.specialty.createMany({
    data: specialties.map((name) => ({ name })),
    skipDuplicates: true
  })

  const createdGrades = await prisma.grade.findMany()
  const createdSpecialties = await prisma.specialty.findMany()

  for (const grade of createdGrades) {
    for (const specialty of createdSpecialties) {
      await prisma.specialtyGrade
        .create({
          data: {
            gradeId: grade.id,
            specialtyId: specialty.id
          }
        })
        .catch(() => {}) // Skip duplicates
    }
  }
}

export async function studentSeeder(): Promise<void> {
  const grades = await prisma.grade.findMany()
  const specialties = await prisma.specialty.findMany()
  const students = Array.from({ length: 30 }).map(() => {
    const grade = faker.helpers.arrayElement(grades)
    const specialty = faker.helpers.arrayElement(specialties)

    return {
      code: `HIS-${faker.string.alphanumeric(8).toUpperCase()}`,
      name: faker.person.fullName() + ' ' + faker.number.int({ min: 1000, max: 9999 }),
      email: faker.internet.email().toLowerCase(),
      phone: faker.phone.number(),
      address: 'fake address, DZ',
      birth_date: faker.date.past({ years: 25 }),
      birth_place: faker.location.city(),
      enrollment_year: faker.date.past({ years: 5 }),
      gradeId: grade.id,
      specialtyId: specialty.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  })

  await prisma.student.createMany({
    data: students,
    skipDuplicates: true
  })
}

export async function activitySeeder(): Promise<void> {
  const activities = Array.from({ length: 10 }).map(() => ({
    name: faker.word.words({ count: 2 }),
    description: faker.lorem.sentence(),
    type: faker.helpers.arrayElement([
      Activity_Type.EVENT,
      Activity_Type.WORKSHOP,
      Activity_Type.INTERNSHIP,
      Activity_Type.SPORT
    ])
  }))

  await prisma.activity.createMany({
    data: activities,
    skipDuplicates: true
  })
}

export async function studentActivitySeeder(): Promise<void> {
  const students = await prisma.student.findMany()
  const activities = await prisma.activity.findMany()

  for (const student of students) {
    const activity = faker.helpers.arrayElement(activities)

    await prisma.student.update({
      where: { id: student.id },
      data: {
        activities: {
          connect: { id: activity.id }
        }
      }
    })
  }
}

export async function skillSeeder(): Promise<void> {
  const softSkills = [
    'Communication',
    'Teamwork',
    'Problem Solving',
    'Adaptability',
    'Leadership',
    'Creativity',
    'Time Management',
    'Critical Thinking',
    'Emotional Intelligence',
    'Conflict Resolution'
  ]

  const hardSkills = [
    'Python',
    'JavaScript',
    'SQL',
    'Data Analysis',
    'Machine Learning',
    'Cybersecurity',
    'Linux Administration',
    'Docker',
    'AWS',
    'Network Security'
  ]

  const skills = [
    ...softSkills.map((name) => ({
      name,
      description: faker.hacker.phrase(),
      type: Skill_Type.SOFT
    })),
    ...hardSkills.map((name) => ({
      name,
      description: faker.hacker.phrase(),
      type: Skill_Type.HARD
    }))
  ]

  await prisma.skill.createMany({
    data: skills,
    skipDuplicates: true
  })
}

export async function evaluationSeeder(): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const students = await tx.student.findMany()
    const skills = await tx.skill.findMany()

    for (const student of students) {
      const evaluations = await Promise.all([
        tx.evaluation.create({
          data: {
            studentId: student.id,
            comment: faker.lorem.sentence()
          }
        }),
        tx.evaluation.create({
          data: {
            studentId: student.id,
            comment: faker.lorem.sentence()
          }
        })
      ])

      for (const evaluation of evaluations) {
        const selectedSkills = faker.helpers.arrayElements(skills, 3)

        await tx.skillEvaluation.createMany({
          data: selectedSkills.map((skill) => ({
            evaluationId: evaluation.id,
            skillId: skill.id,
            score: faker.number.int({ min: 20, max: 100 })
          }))
        })
      }
    }
  })
}
