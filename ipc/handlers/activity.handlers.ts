// ipc/activity.handlers.ts
import { ipcMain } from 'electron'
import type { ResponseSchema as Response } from '../../schemas/response.schema'
import type { createActivityReq, updateActivityReq } from '../../schemas/activity.schema'

import {
  createActivity,
  deleteActivity,
  indexActivity,
  updateActivity
} from '../../services/activityService'

export const registerActivityHandlers = (): void => {
  ipcMain.handle(
    'activity:index',
    async (_e, page?: number, query?: string, paginate = true): Promise<Response> =>
      indexActivity(page, query, paginate)
  )

  ipcMain.handle(
    'activity:create',
    async (_e, data: createActivityReq): Promise<Response> => createActivity(data)
  )

  ipcMain.handle(
    'activity:update',
    async (_e, data: updateActivityReq): Promise<Response> => updateActivity(data)
  )

  ipcMain.handle(
    'activity:delete',
    async (_e, activityId: number): Promise<Response> => deleteActivity(activityId)
  )
}
