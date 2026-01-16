// ipc/auth.handlers.ts
import { ipcMain } from 'electron'
import type { ResponseSchema as Response } from '../../schemas/response.schema'
import { authenticate } from '../../services/auth.service'

export const registerAuthHandlers = (): void => {
  ipcMain.handle(
    'auth:login',
    async (_e, username: string, password: string): Promise<Response> =>
      authenticate(username, password)
  )
}
