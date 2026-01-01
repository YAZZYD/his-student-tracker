import { ipcMain } from 'electron'
import { authenticate } from '../services/authService'
import { ResponseSchema as Response } from '../schemas/response.schema'
import { indexStudents, showStudent } from '../services/studentService'
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
}
