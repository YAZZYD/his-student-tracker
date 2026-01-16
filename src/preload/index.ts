import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  UpdateStudentInfoReq,
  AttachActivitiesReq,
  CreateStudentInfoReq,
  ImportBulkParams
} from '@/schemas/student.schema'
import { CreateEvaluationReq, updateEvaluationReq } from '@/schemas/evaluation.schema'
import { createSkillReq } from '@/schemas/skill.schema'
import { createActivityReq, updateActivityReq } from '@/schemas/activity.schema'

const auth = {
  authenticate: (username: string, password: string) =>
    ipcRenderer.invoke('auth:login', username, password)
}

const student = {
  index: (page?: number, query?: string) => ipcRenderer.invoke('student:index', page, query),

  show: (code: string) => ipcRenderer.invoke('student:show', code),

  create: (data: CreateStudentInfoReq) => ipcRenderer.invoke('student:create', data),

  update: (data: UpdateStudentInfoReq) => ipcRenderer.invoke('student:update', data),

  delete: (code: string) => ipcRenderer.invoke('student:delete', code),

  updateSkills: (data: UpdateStudentInfoReq) => ipcRenderer.invoke('student:update-skills', data),

  updateActivities: (data: AttachActivitiesReq) =>
    ipcRenderer.invoke('student:update-activities', data),
  importBulk: (params: ImportBulkParams) => ipcRenderer.invoke('student:import', params),
  downloadTemplate: () => ipcRenderer.invoke('student:template')
}

const activity = {
  index: (page?: number, query?: string, paginate = true) =>
    ipcRenderer.invoke('activity:index', page, query, paginate),

  create: (data: createActivityReq) => ipcRenderer.invoke('activity:create', data),

  update: (data: updateActivityReq) => ipcRenderer.invoke('activity:update', data),

  delete: (activityId: number) => ipcRenderer.invoke('activity:delete', activityId)
}

const skill = {
  index: () => ipcRenderer.invoke('skill:index'),

  create: (data: createSkillReq) => ipcRenderer.invoke('skill:create', data),

  delete: (skillId: number) => ipcRenderer.invoke('skill:delete', skillId)
}

const evaluation = {
  create: (data: CreateEvaluationReq) => ipcRenderer.invoke('evaluation:create', data),

  update: (data: updateEvaluationReq) => ipcRenderer.invoke('evaluation:update', data),

  delete: (evaluationId: number) => ipcRenderer.invoke('evaluation:delete', evaluationId)
}

const academic = {
  index: () => ipcRenderer.invoke('academic:index-catalog')
}

export const api = {
  auth,
  student,
  activity,
  skill,
  evaluation,
  academic
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
