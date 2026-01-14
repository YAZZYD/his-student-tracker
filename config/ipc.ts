import { ipcMain } from 'electron'
import { authenticate } from '../services/authService'
import { ResponseSchema as Response, ResponseSchema } from '../schemas/response.schema'
import {
  createStudent,
  indexStudents,
  showStudent,
  updateAttachedActivities,
  updateStudent,
  updateStudentSkills
} from '../services/studentService'
import { indexSpecialtiesWithGrades } from '../services/academicCatalogService'
import type {
  updateStudentInfoReq,
  attachActivitiesReq,
  updateStudentSkillReq,
  createStudentInfoReq
} from '../schemas/student.schema'
import { indexActivities } from '../services/activityService'
import { createSkill, deleteSkill, indexSkills } from '../services/skillService'
import { createEvaluation, deleteEvaluation, updateEvaluation } from '../services/evaluationService'
import { createSkillReq } from '../schemas/skill.schema'
export function registerIpcHandler(): void {
  ipcMain.handle(
    'auth:login',
    async (_event, username: string, password: string): Promise<Response> => {
      return await authenticate(username, password)
    }
  )

  ipcMain.handle('student:index', async (_event, page?: number): Promise<Response> => {
    return await indexStudents(page)
  })

  ipcMain.handle('student:show', async (_event, code: string): Promise<Response> => {
    return await showStudent(code)
  })

  ipcMain.handle('index-academic-catalog', async (): Promise<Response> => {
    return await indexSpecialtiesWithGrades()
  })

  ipcMain.handle(
    'student:update',
    async (_event, data: updateStudentInfoReq): Promise<ResponseSchema> => {
      return await updateStudent(data)
    }
  )

  ipcMain.handle(
    'student:create',
    async (_event, data: createStudentInfoReq): Promise<ResponseSchema> => {
      return await createStudent(data)
    }
  )
  ipcMain.handle('activity:index', async (): Promise<Response> => await indexActivities())
  ipcMain.handle(
    'student:update-activities',
    async (_event, data: attachActivitiesReq): Promise<Response> =>
      await updateAttachedActivities(data)
  )

  ipcMain.handle('skill:index', async (): Promise<Response> => await indexSkills())

  ipcMain.handle(
    'student:update-skills',
    async (_event, data: updateStudentSkillReq): Promise<Response> =>
      await updateStudentSkills(data)
  )

  ipcMain.handle(
    'evaluation:create',
    async (_event, payload): Promise<Response> => await createEvaluation(payload)
  )
  ipcMain.handle(
    'evaluation:update',
    async (_event, payload): Promise<Response> => await updateEvaluation(payload)
  )

  ipcMain.handle(
    'evaluation:delete',
    async (_event, evaluationId: number): Promise<Response> => await deleteEvaluation(evaluationId)
  )

  ipcMain.handle(
    'skill:create',
    async (_event, payload: createSkillReq): Promise<Response> => await createSkill(payload)
  )
  ipcMain.handle(
    'skill:delete',
    async (_event, skillId: number): Promise<Response> => await deleteSkill(skillId)
  )
}
