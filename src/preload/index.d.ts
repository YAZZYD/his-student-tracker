import type { ElectronAPI } from '@electron-toolkit/preload'
import type { ResponseSchema as Response } from '@/schemas/response.schema'

import type { CreateEvaluationReq, updateEvaluationReq } from '@/schemas/evaluationtion.schema'

import type {
  UpdateStudentInfoReq,
  AttachActivitiesReq,
  updateStudentSkillReq,
  CreateStudentInfoReq,
  ImportBulkParams
} from '@/schemas/student.schema'

import type { createSkillReq } from '@/schemas/skill.schema'
import type { createActivityReq, updateActivityReq } from '@/schemas/activity.schema'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      auth: {
        authenticate(username: string, password: string): Promise<Response>
      }

      student: {
        index(page?: number, query?: string): Promise<Response>
        show(code: string): Promise<Response>
        create(data: CreateStudentInfoReq): Promise<Response>
        update(data: UpdateStudentInfoReq): Promise<Response>
        delete(code: string): Promise<Response>
        updateSkills(data: updateStudentSkillReq): Promise<Response>
        updateActivities(data: AttachActivitiesReq): Promise<Response>
        importBulk(params: ImportBulkParams): Promise<Response>
        downloadTemplate(): Promise<Response>
      }

      activity: {
        index(page?: number, query?: string, paginate?: boolean): Promise<Response>
        create(data: createActivityReq): Promise<Response>
        update(data: updateActivityReq): Promise<Response>
        delete(activityId: number): Promise<Response>
      }

      skill: {
        index(): Promise<Response>
        create(data: createSkillReq): Promise<Response>
        delete(skillId: number): Promise<Response>
      }

      evaluation: {
        create(data: CreateEvaluationReq): Promise<Response>
        update(data: updateEvaluationReq): Promise<Response>
        delete(evaluationId: number): Promise<Response>
      }

      academic: {
        index(): Promise<Response>
      }
    }
  }
}

export {}
