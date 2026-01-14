import type { ElectronAPI } from '@electron-toolkit/preload'
import type { ResponseSchema } from '@/schemas/response.schema'
import type { CreateEvaluationReq, updateEvaluationReq } from '@/schemas/evaluationtion.schema'
import type {
  updateStudentInfoReq,
  attachActivitiesReq,
  updateStudentSkillReq,
  createStudentInfoReq
} from '@/schemas/student.schema'
import { createSkillReq } from '@/schemas/skill.schema'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      authenticate(username: string, password: string): Promise<ResponseSchema>
      indexStudent(page?: number, query?: string): Promise<ResponseSchema>
      showStudent(code: string): Promise<ResponseSchema>
      indexAcademicCatalog(): Promise<ResponseSchema>
      indexActivities(): Promise<ResponseSchema>
      createStudent(data: createStudentInfoReq): Promise<ResponseSchema>
      updateStudent(data: updateStudentInfoReq): Promise<ResponseSchema>
      updateStudentActivities(data: attachActivitiesReq): Promise<ResponseSchema>
      indexSkills(): Promise<ResponseSchema>
      updateStudentSkills(data: updateStudentSkillReq): Promise<ResponseSchema>
      createEvaluation(payload: CreateEvaluationReq): Promise<ResponseSchema>
      updateEvaluation(payload: updateEvaluationReq): Promise<ResponseSchema>
      deleteEvaluation(evaluationId: number): Promise<ResponseSchema>
      createSkill(payload: createSkillReq): Promise<ResponseSchema>
      deleteSkill(skillId: number): Promise<ResponseSchema>
    }
  }
}

export {}
