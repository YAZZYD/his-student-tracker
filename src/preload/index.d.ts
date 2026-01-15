import type { ElectronAPI } from '@electron-toolkit/preload'
import type { ResponseSchema as Response } from '@/schemas/response.schema'
import type { CreateEvaluationReq, updateEvaluationReq } from '@/schemas/evaluationtion.schema'
import type {
  updateStudentInfoReq,
  attachActivitiesReq,
  updateStudentSkillReq,
  createStudentInfoReq
} from '@/schemas/student.schema'
import { createSkillReq } from '@/schemas/skill.schema'
import { createActivityReq } from '@/schemas/activity.schema'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      authenticate(username: string, password: string): Promise<Response>
      indexStudent(page?: number, query?: string): Promise<Response>
      showStudent(code: string): Promise<Response>
      indexAcademicCatalog(): Promise<Response>
      createStudent(data: createStudentInfoReq): Promise<Response>
      updateStudent(data: updateStudentInfoReq): Promise<Response>
      updateStudentActivities(data: attachActivitiesReq): Promise<Response>
      indexSkills(): Promise<Response>
      updateStudentSkills(data: updateStudentSkillReq): Promise<Response>
      createEvaluation(data: CreateEvaluationReq): Promise<Response>
      updateEvaluation(data: updateEvaluationReq): Promise<Response>
      deleteEvaluation(evaluationId: number): Promise<Response>
      createSkill(data: createSkillReq): Promise<Response>
      deleteSkill(skillId: number): Promise<Response>
      indexActivities(page?: number, paginate?: boolean): Promise<Response>
      createActivity(data: createActivityReq): Promise<Response>
      updateActivity(data: createActivityReq): Promise<Response>
      deleteActivity(activityId: number): Promise<Response>
    }
  }
}

export {}
