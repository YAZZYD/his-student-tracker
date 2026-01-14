import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  updateStudentInfoReq,
  attachActivitiesReq,
  createStudentInfoReq
} from '@/schemas/student.schema'
import { CreateEvaluationReq, updateEvaluationReq } from '@/schemas/evaluation.schema'
import { createSkillReq } from '@/schemas/skill.schema'

const api = {
  authenticate: (username: string, password: string) =>
    ipcRenderer.invoke('auth:login', username, password),
  indexStudent: (page?: number, query?: string) => ipcRenderer.invoke('student:index', page, query),
  showStudent: (code: string) => ipcRenderer.invoke('student:show', code),
  indexAcademicCatalog: () => ipcRenderer.invoke('index-academic-catalog'),
  indexActivities: () => ipcRenderer.invoke('activity:index'),
  updateStudent: (data: updateStudentInfoReq) => ipcRenderer.invoke('student:update', data),
  createStudent: (data: createStudentInfoReq) => ipcRenderer.invoke('student:create', data),
  updateStudentActivities: (data: attachActivitiesReq) =>
    ipcRenderer.invoke('student:update-activities', data),
  indexSkills: () => ipcRenderer.invoke('skill:index'),
  updateStudentSkills: (data: updateStudentInfoReq) =>
    ipcRenderer.invoke('student:update-skills', data),
  createEvaluation: (payload: CreateEvaluationReq) =>
    ipcRenderer.invoke('evaluation:create', payload),
  updateEvaluation: (payload: updateEvaluationReq) =>
    ipcRenderer.invoke('evaluation:update', payload),
  deleteEvaluation: (evaluationId: number) => ipcRenderer.invoke('evaluation:delete', evaluationId),
  createSkill: (payload: createSkillReq) => ipcRenderer.invoke('skill:create', payload),
  deleteSkill: (skillId: number) => ipcRenderer.invoke('skill:delete', skillId)
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
