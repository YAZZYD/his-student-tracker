// ipc/student.handlers.ts
import { ipcMain } from 'electron'
import type { ResponseSchema as Response } from '../../schemas/response.schema'
import type {
  UpdateStudentInfoReq,
  AttachActivitiesReq,
  updateStudentSkillReq,
  CreateStudentInfoReq
} from '../../schemas/student.schema'

import {
  createStudent,
  indexStudents,
  showStudent,
  updateAttachedActivities,
  updateStudent,
  updateStudentSkills,
  deleteStudent,
  importBulk,
  downloadTemplate
} from '../../services/student.service'

export const registerStudentHandlers = (): void => {
  ipcMain.handle(
    'student:index',
    async (_e, page?: number, query?: string): Promise<Response> => indexStudents(page, query)
  )

  ipcMain.handle('student:show', async (_e, code: string): Promise<Response> => showStudent(code))

  ipcMain.handle(
    'student:create',
    async (_e, data: CreateStudentInfoReq): Promise<Response> => createStudent(data)
  )

  ipcMain.handle(
    'student:update',
    async (_e, data: UpdateStudentInfoReq): Promise<Response> => updateStudent(data)
  )

  ipcMain.handle(
    'student:delete',
    async (_e, code: string): Promise<Response> => deleteStudent(code)
  )

  ipcMain.handle(
    'student:update-skills',
    async (_e, data: updateStudentSkillReq): Promise<Response> => updateStudentSkills(data)
  )

  ipcMain.handle(
    'student:update-activities',
    async (_e, data: AttachActivitiesReq): Promise<Response> => updateAttachedActivities(data)
  )
  ipcMain.handle(
    'student:import',
    async (_e, filePath: string): Promise<Response> => importBulk(filePath)
  )
  ipcMain.handle('student:template', async (): Promise<Response> => downloadTemplate())
}
