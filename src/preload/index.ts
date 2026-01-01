import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  authenticate: (username: string, password: string) =>
    ipcRenderer.invoke('auth:login', username, password),
  indexStudent: (page?: number) => ipcRenderer.invoke('student:index', page),
  showStudent: (code: string) => ipcRenderer.invoke('student:show', code)
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
