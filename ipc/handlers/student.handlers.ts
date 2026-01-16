// ipc/student.handlers.ts
import { ipcMain } from 'electron'
import type { ResponseSchema as Response } from '../../schemas/response.schema'
import type {
  updateStudentInfoReq,
  attachActivitiesReq,
  updateStudentSkillReq,
  createStudentInfoReq
} from '../../schemas/student.schema'

import {
  createStudent,
  indexStudents,
  showStudent,
  updateAttachedActivities,
  updateStudent,
  updateStudentSkills,
  deleteStudent
} from '../../services/studentService'

export const registerStudentHandlers = (): void => {
  ipcMain.handle(
    'student:index',
    async (_e, page?: number, query?: string): Promise<Response> => indexStudents(page, query)
  )

  ipcMain.handle('student:show', async (_e, code: string): Promise<Response> => showStudent(code))

  ipcMain.handle(
    'student:create',
    async (_e, data: createStudentInfoReq): Promise<Response> => createStudent(data)
  )

  ipcMain.handle(
    'student:update',
    async (_e, data: updateStudentInfoReq): Promise<Response> => updateStudent(data)
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
    async (_e, data: attachActivitiesReq): Promise<Response> => updateAttachedActivities(data)
  )
}
