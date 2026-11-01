import { app, shell, BrowserWindow, ipcMain, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { deleteSave, listSaves, writeSave } from './saves'
import { checkForUpdates } from './updates'

const APP_ID = 'com.github.processoriented.taipan'

function savesDir(): string {
  return join(app.getPath('userData'), 'saves')
}

function installMenu(): void {
  const menu = Menu.buildFromTemplate([
    {
      label: 'Taipan!',
      submenu: [
        process.platform === 'darwin'
          ? { role: 'about' }
          : { label: 'About Taipan!', click: () => app.showAboutPanel() },
        {
          label: 'Check for Updates…',
          click: () => {
            void checkForUpdates(true)
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }
  ])
  Menu.setApplicationMenu(menu)
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 720,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    title: 'Taipan!',
    backgroundColor: '#000000',
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    void checkForUpdates(false)
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const window = BrowserWindow.getAllWindows().find((item) => !item.isDestroyed())
    if (!window) return
    if (window.isMinimized()) window.restore()
    window.focus()
  })

  app.whenReady().then(() => {
    electronApp.setAppUserModelId(APP_ID)
    if (process.platform === 'darwin') app.dock?.setIcon(icon)
    app.setAboutPanelOptions({
      applicationName: 'Taipan!',
      applicationVersion: app.getVersion(),
      iconPath: icon
    })
    installMenu()

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    ipcMain.handle('app:version', () => app.getVersion())
    ipcMain.handle('saves:list', () => listSaves(savesDir()))
    ipcMain.handle('saves:write', (_event, payload: unknown, seq: unknown) => {
      writeSave(savesDir(), payload, seq)
    })
    ipcMain.handle('saves:delete', (_event, id: unknown) => {
      deleteSave(savesDir(), id)
    })
    ipcMain.on('app:quit', () => {
      app.quit()
    })
    ipcMain.on('saves:writeSync', (event, payload: unknown, seq: unknown) => {
      try {
        writeSave(savesDir(), payload, seq)
        event.returnValue = true
      } catch (error) {
        console.error(error)
        event.returnValue = false
      }
    })

    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
}
