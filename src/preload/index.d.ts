import { ElectronAPI } from '@electron-toolkit/preload'
import type { SaveFile } from '../shared/save'

export interface TaipanApi {
  listSaves: () => Promise<unknown[]>
  writeSave: (save: SaveFile, seq: number) => Promise<void>
  writeSaveSync: (save: SaveFile, seq: number) => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: TaipanApi
  }
}
