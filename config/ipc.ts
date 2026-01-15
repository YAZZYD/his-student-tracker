import { ipcMain } from 'electron'
import { authenticate } from '../services/authService'
import { ResponseSchema as Response } from '../schemas/response.schema'
import {
  createStudent,
  indexStudents,
  showStudent,
  updateAttachedActivities,
  updateStudent,
  updateStudentSkills
} from '../services/studentService'
import type {
  updateStudentInfoReq,
  attachActivitiesReq,
  updateStudentSkillReq,
  createStudentInfoReq
} from '../schemas/student.schema'
import type { createSkillReq } from '../schemas/skill.schema'
import type { createActivityReq, updateActivityReq } from '../schemas/activity.schema'
import {
  createActivity,
  deleteActivity,
  indexActivities,
  updateActivity
} from '../services/activityService'
import { createSkill, deleteSkill, indexSkills } from '../services/skillService'
import { createEvaluation, deleteEvaluation, updateEvaluation } from '../services/evaluationService'
import { indexSpecialtiesWithGrades } from '../services/academicCatalogService'

export function registerIpcHandler(): void {
  ipcMain.handle(
    'auth:login',
    async (_event, username: string, password: string): Promise<Response> => {
      return await authenticate(username, password)
    }
  )

  ipcMain.handle(
    'student:index',
    async (_event, page?: number, query?: string): Promise<Response> => {
      return await indexStudents(page, query)
    }
  )

  ipcMain.handle('student:show', async (_event, code: string): Promise<Response> => {
    return await showStudent(code)
  })

  ipcMain.handle('index-academic-catalog', async (): Promise<Response> => {
    return await indexSpecialtiesWithGrades()
  })

  ipcMain.handle(
    'student:update',
    async (_event, data: updateStudentInfoReq): Promise<Response> => {
      return await updateStudent(data)
    }
  )

  ipcMain.handle(
    'student:create',
    async (_event, data: createStudentInfoReq): Promise<Response> => {
      return await createStudent(data)
    }
  )
  ipcMain.handle(
    'activity:index',
    async (_event, page?: number, paginate?: boolean): Promise<Response> =>
      await indexActivities(page, paginate)
  )
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
    async (_event, data): Promise<Response> => await createEvaluation(data)
  )
  ipcMain.handle(
    'evaluation:update',
    async (_event, data): Promise<Response> => await updateEvaluation(data)
  )

  ipcMain.handle(
    'evaluation:delete',
    async (_event, evaluationId: number): Promise<Response> => await deleteEvaluation(evaluationId)
  )

  ipcMain.handle(
    'skill:create',
    async (_event, data: createSkillReq): Promise<Response> => await createSkill(data)
  )
  ipcMain.handle(
    'skill:delete',
    async (_event, skillId: number): Promise<Response> => await deleteSkill(skillId)
  )
  ipcMain.handle(
    'activity:create',
    async (_event, data: createActivityReq): Promise<Response> => await createActivity(data)
  )
  ipcMain.handle(
    'activity:update',
    async (_event, data: updateActivityReq): Promise<Response> => await updateActivity(data)
  )
  ipcMain.handle(
    'activity:delete',
    async (_event, activityId: number): Promise<Response> => await deleteActivity(activityId)
  )
}
