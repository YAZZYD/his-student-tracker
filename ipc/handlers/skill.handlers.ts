// ipc/skill.handlers.ts
import { ipcMain } from 'electron'
import type { ResponseSchema as Response } from '../../schemas/response.schema'
import type { createSkillReq } from '../../schemas/skill.schema'
import { createSkill, deleteSkill, indexSkills } from '../../services/skillService'

export const registerSkillHandlers = (): void => {
  ipcMain.handle('skill:index', async (): Promise<Response> => indexSkills())

  ipcMain.handle(
    'skill:create',
    async (_e, data: createSkillReq): Promise<Response> => createSkill(data)
  )

  ipcMain.handle(
    'skill:delete',
    async (_e, skillId: number): Promise<Response> => deleteSkill(skillId)
  )
}
