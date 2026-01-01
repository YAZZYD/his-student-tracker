import type { ElectronAPI } from '@electron-toolkit/preload'
import type { ResponseSchema } from '@/schemas/response.schema'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      authenticate(username: string, password: string): Promise<ResponseSchema>
      indexStudent(page?: number): Promise<ResponseSchema>
      showStudent(code: string): Promise<ResponseSchema>
    }
  }
}

export {}
