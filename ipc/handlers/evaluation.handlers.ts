// ipc/evaluation.handlers.ts
import { ipcMain } from 'electron'
import type { ResponseSchema as Response } from '../../schemas/response.schema'
import type { CreateEvaluationReq, updateEvaluationReq } from '../../schemas/evaluation.schema'
import {
  createEvaluation,
  deleteEvaluation,
  updateEvaluation
} from '../../services/evaluation.service'

export const registerEvaluationHandlers = (): void => {
  ipcMain.handle(
    'evaluation:create',
    async (_e, data: CreateEvaluationReq): Promise<Response> => createEvaluation(data)
  )

  ipcMain.handle(
    'evaluation:update',
    async (_e, data: updateEvaluationReq): Promise<Response> => updateEvaluation(data)
  )

  ipcMain.handle(
    'evaluation:delete',
    async (_e, evaluationId: number): Promise<Response> => deleteEvaluation(evaluationId)
  )
}
