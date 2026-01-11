import { ipcMain } from 'electron'
import { authenticate } from '../services/authService'
import { ResponseSchema as Response, ResponseSchema } from '../schemas/response.schema'
import {
  indexStudents,
  showStudent,
  updateAttachedActivities,
  updateStudent
} from '../services/studentService'
import { indexSpecialtiesWithGrades } from '../services/academicCatalogService'
import type { updateStudentInfoReq, attachActivitiesReq } from '../schemas/student.schema'
import { indexActivities } from '../services/activityService'
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

  ipcMain.handle('activity:index', async (): Promise<Response> => await indexActivities())
  ipcMain.handle(
    'student:update-activities',
    async (_event, data: attachActivitiesReq): Promise<Response> =>
      await updateAttachedActivities(data)
  )
}
