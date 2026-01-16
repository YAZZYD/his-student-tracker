// ipc/academic.handlers.ts
import { ipcMain } from 'electron'
import type { ResponseSchema as Response } from '../../schemas/response.schema'
import { indexSpecialtiesWithGrades } from '../../services/academic.service'

export const registerAcademicHandlers = (): void => {
  ipcMain.handle(
    'academic:index-catalog',
    async (): Promise<Response> => indexSpecialtiesWithGrades()
  )
}
