import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  updateStudentInfoReq,
  attachActivitiesReq,
  createStudentInfoReq
} from '@/schemas/student.schema'
import { CreateEvaluationReq, updateEvaluationReq } from '@/schemas/evaluation.schema'
import { createSkillReq } from '@/schemas/skill.schema'
import { createActivityReq, updateActivityReq } from '@/schemas/activity.schema'

const api = {
  authenticate: (username: string, password: string) =>
    ipcRenderer.invoke('auth:login', username, password),
  indexStudent: (page?: number, query?: string) => ipcRenderer.invoke('student:index', page, query),
  showStudent: (code: string) => ipcRenderer.invoke('student:show', code),
  indexAcademicCatalog: () => ipcRenderer.invoke('index-academic-catalog'),
  updateStudent: (data: updateStudentInfoReq) => ipcRenderer.invoke('student:update', data),
  createStudent: (data: createStudentInfoReq) => ipcRenderer.invoke('student:create', data),
  updateStudentActivities: (data: attachActivitiesReq) =>
    ipcRenderer.invoke('student:update-activities', data),
  indexSkills: () => ipcRenderer.invoke('skill:index'),
  updateStudentSkills: (data: updateStudentInfoReq) =>
    ipcRenderer.invoke('student:update-skills', data),
  createEvaluation: (data: CreateEvaluationReq) => ipcRenderer.invoke('evaluation:create', data),
  updateEvaluation: (data: updateEvaluationReq) => ipcRenderer.invoke('evaluation:update', data),
  deleteEvaluation: (evaluationId: number) => ipcRenderer.invoke('evaluation:delete', evaluationId),
  createSkill: (data: createSkillReq) => ipcRenderer.invoke('skill:create', data),
  deleteSkill: (skillId: number) => ipcRenderer.invoke('skill:delete', skillId),
  indexActivities: (page?: number, paginate?: boolean) =>
    ipcRenderer.invoke('activity:index', page, paginate),
  createActivity: (data: createActivityReq) => ipcRenderer.invoke('activity:crate', data),
  updateActivity: (data: updateActivityReq) => ipcRenderer.invoke('activity:crate', data),
  deleteActivity: (activityId: number) => ipcRenderer.invoke('activity:crate', activityId)
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
