import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { SaveFile } from '../shared/save'

const api = {
  listSaves: (): Promise<unknown[]> => ipcRenderer.invoke('saves:list'),
  writeSave: (save: SaveFile, seq: number): Promise<void> =>
    ipcRenderer.invoke('saves:write', save, seq),
  writeSaveSync: (save: SaveFile, seq: number): void => {
    ipcRenderer.sendSync('saves:writeSync', save, seq)
  },
  deleteSave: (id: string): Promise<void> => ipcRenderer.invoke('saves:delete', id),
  quit: (): void => {
    ipcRenderer.send('app:quit')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
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
