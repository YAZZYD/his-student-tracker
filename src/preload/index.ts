import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { updateStudentInfoReq, attachActivitiesReq } from '@/schemas/student.schema'
import { CreateRatingReq, updateRatingReq } from '@/schemas/rating.schema'

const api = {
  authenticate: (username: string, password: string) =>
    ipcRenderer.invoke('auth:login', username, password),
  indexStudent: (page?: number) => ipcRenderer.invoke('student:index', page),
  showStudent: (code: string) => ipcRenderer.invoke('student:show', code),
  indexAcademicCatalog: () => ipcRenderer.invoke('index-academic-catalog'),
  indexActivities: () => ipcRenderer.invoke('activity:index'),
  updateStudent: (data: updateStudentInfoReq) => ipcRenderer.invoke('student:update', data),
  updateStudentActivities: (data: attachActivitiesReq) =>
    ipcRenderer.invoke('student:update-activities', data),
  indexSkills: () => ipcRenderer.invoke('skill:index'),
  updateStudentSkills: (data: updateStudentInfoReq) =>
    ipcRenderer.invoke('student:update-skills', data),
  createRating: (payload: CreateRatingReq) => ipcRenderer.invoke('rating:create', payload),
  updateRating: (payload: updateRatingReq) => ipcRenderer.invoke('rating:update', payload),
  deleteRating: (ratingId: number) => ipcRenderer.invoke('rating:delete', ratingId)
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
