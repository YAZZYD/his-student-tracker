import type { ElectronAPI } from '@electron-toolkit/preload'
import type { ResponseSchema } from '@/schemas/response.schema'
import type { updateStudentInfoReq, attachActivitiesReq } from '@/schemas/student.schema'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      authenticate(username: string, password: string): Promise<ResponseSchema>
      indexStudent(page?: number): Promise<ResponseSchema>
      showStudent(code: string): Promise<ResponseSchema>
      indexAcademicCatalog(): Promise<ResponseSchema>
      indexActivities(): Promise<ResponseSchema>
      updateStudent(data: updateStudentInfoReq): Promise<ResponseSchema>
      updateStudentActivities(data: attachActivitiesReq): Promise<ResponseSchema>
    }
  }
}

export {}
