import {
  AttachActivitiesReq,
  updateStudentSkillReq,
  UpdateStudentInfoReq,
  CreateStudentInfoReq,
  ImportStudentRow,
  ImportBulkParams
} from '@/schemas/student.schema'
import { prisma } from '../prisma/prisma'
import { ResponseSchema as Response } from '@schemas/response.schema'
import { Prisma } from '@/prisma/generated/client'
import { parse } from 'csv-parse/sync'
import * as XLSX from 'xlsx'
import fs from 'fs'
import { dialog } from 'electron'

export async function indexStudents(page: number = 1, query: string = ''): Promise<Response> {
  const PAGE_SIZE = 10
  try {
    const whereClause: Prisma.StudentWhereInput = query
      ? {
          OR: [
            { code: { contains: query, mode: 'insensitive' } },
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            {
              activities: {
                some: {
                  name: { contains: query, mode: 'insensitive' }
                }
              }
            }
          ]
        }
      : {}

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where: whereClause,
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
      prisma.student.count({ where: whereClause })
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

export async function createStudent(data: CreateStudentInfoReq): Promise<Response> {
  try {
    await prisma.student.create({
      data: data
    })
    return {
      success: true,
      message: 'Student created Successfully'
    }
  } catch (err) {
    console.error(err)
    return err instanceof Error
      ? { success: false, message: err.message as string }
      : { success: false, message: 'Unexpected Error' }
  }
}
export async function updateStudent(data: UpdateStudentInfoReq): Promise<Response> {
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
export async function updateAttachedActivities(data: AttachActivitiesReq): Promise<Response> {
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
    throw err instanceof Error ? err : new Error('Unexpected error')
  }
}

export async function deleteStudent(code: string): Promise<Response> {
  try {
    await prisma.student.delete({
      where: { code: code }
    })

    return {
      success: true,
      message: 'deleted'
    }
  } catch (err) {
    console.error(err)
    throw err instanceof Error ? err : new Error('Unexpected error')
  }
}
function normalizeRow(row: any): any {
  const normalized: any = {}

  for (const key of Object.keys(row)) {
    const cleanKey = key
      .replace(/^\uFEFF/, '') // 🔥 remove BOM
      .trim()

    normalized[cleanKey] = row[key]
  }

  return normalized
}
export async function importBulk(params: ImportBulkParams): Promise<Response> {
  try {
    const { fileName, fileData } = params
    const buffer = Buffer.from(fileData)
    const fileExtension = fileName.split('.').pop()?.toLowerCase()

    let records: ImportStudentRow[]

    if (fileExtension === 'csv') {
      const fileContent = buffer.toString('utf-8')
      records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      })
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const sheetName = workbook.SheetNames[0]
      records = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])
    } else {
      return { success: false, message: 'Unsupported file format' }
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ row: number; field: string; message: string }>
    }

    for (let i = 0; i < records.length; i++) {
      const row = normalizeRow(records[i])
      const rowNumber = i + 2
      try {
        if (
          !row.code ||
          !row.name ||
          !row.email ||
          !row.phone ||
          !row.address ||
          !row.birth_date ||
          !row.birth_place ||
          !row.enrollment_year ||
          !row.specialtyId ||
          !row.gradeId
        ) {
          results.failed++
          results.errors.push({
            row: rowNumber,
            field: 'required',
            message:
              'Missing required fields (code, name, email,phone,address,birth_date,birth_place,gradeId,SpecialtyId)'
          })
          continue
        }

        const grade = await prisma.grade.findUnique({
          where: { id: Number(row.gradeId) },
          select: { id: true }
        })
        if (!grade) {
          results.failed++
          results.errors.push({
            row: rowNumber,
            field: 'grade',
            message: `Grade with Id"${row.gradeId}" not found`
          })
          continue
        }

        const specialty = await prisma.specialty.findUnique({
          where: { id: Number(row.specialtyId) },
          select: { id: true }
        })
        if (!specialty) {
          results.failed++
          results.errors.push({
            row: rowNumber,
            field: 'specialty',
            message: `Specialty with Id "${row.specialtyId}" not found`
          })
          continue
        }

        // Create student
        await prisma.student.create({
          data: {
            code: row.code,
            name: row.name,
            email: row.email,
            phone: row.phone,
            address: row.address,
            birth_date: new Date(row.birth_date),
            birth_place: row.birth_place,
            enrollment_year: new Date(row.enrollment_year),
            gradeId: grade.id,
            specialtyId: specialty.id
          }
        })

        results.success++
      } catch (err: any) {
        results.failed++
        results.errors.push({
          row: rowNumber,
          field: 'database',
          message: err.message || 'Failed to create student'
        })
      }
    }

    return {
      success: true,
      message: `Import completed: ${results.success} success, ${results.failed} failed`,
      data: results
    }
  } catch (err: any) {
    console.error(err)
    throw err instanceof Error ? err : new Error(err?.message || 'Unexpected Error')
  }
}

export async function downloadTemplate(): Promise<Response> {
  const template = [
    [
      'code',
      'name',
      'email',
      'phone',
      'address',
      'birth_date',
      'birth_place',
      'enrollment_year',
      'gradeId',
      'specialtyId'
    ],
    [
      'STU001',
      'John Doe',
      'john@example.com',
      '0555554544',
      'Algiers address',
      '2000-01-15',
      'Algiers',
      '2023-09-01',
      '2',
      '3'
    ]
  ]

  const ws = XLSX.utils.aoa_to_sheet(template)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Students')

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'csv' })
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'save student template',
    defaultPath: 'student_template.csv',
    filters: [{ name: 'CSV Files', extensions: ['csv'] }]
  })
  if (canceled || !filePath) return { success: false, message: 'Canceled' }
  fs.writeFileSync(filePath, buffer)
  return {
    success: true,
    message: 'Saved'
  }
}
