import { app, dialog, BrowserWindow, type MessageBoxOptions } from 'electron'
import { autoUpdater } from 'electron-updater'

autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = true

let downloadedVersion: string | null = null
let prompting = false
let listenersInstalled = false

function parentWindow(): BrowserWindow | undefined {
  return BrowserWindow.getAllWindows().find((window) => !window.isDestroyed())
}

function showMessage(options: MessageBoxOptions): Promise<Electron.MessageBoxReturnValue> {
  const parent = parentWindow()
  if (parent) return dialog.showMessageBox(parent, options)
  return dialog.showMessageBox(options)
}

async function promptRestart(version: string): Promise<void> {
  if (prompting) return
  prompting = true
  try {
    const result = await showMessage({
      type: 'info',
      message: `Taipan ${version} is ready to install.`,
      detail: 'Restart now to update, or install it the next time you quit.',
      buttons: ['Restart', 'Later'],
      defaultId: 0,
      cancelId: 1
    })
    if (result.response === 0) autoUpdater.quitAndInstall(true, true)
  } catch (error) {
    console.error(error)
  } finally {
    prompting = false
  }
}

function installListeners(): void {
  if (listenersInstalled) return
  listenersInstalled = true
  autoUpdater.on('update-downloaded', (info) => {
    downloadedVersion = info.version
    void promptRestart(info.version)
  })
}

async function showLatest(): Promise<void> {
  await showMessage({
    type: 'info',
    message: `Taipan ${app.getVersion()} is the latest release.`
  })
}

async function showFailure(): Promise<void> {
  await showMessage({
    type: 'warning',
    message: 'Could not check for updates.',
    detail: 'Check your connection and try again.'
  })
}

async function runCheck(interactive: boolean): Promise<void> {
  if (!app.isPackaged) {
    if (!interactive) return
    await showMessage({
      type: 'info',
      message: 'Updates run in an installed build.',
      detail: 'This development copy does not check GitHub for a newer release.'
    })
    return
  }

  installListeners()

  if (downloadedVersion) {
    if (interactive) await promptRestart(downloadedVersion)
    return
  }

  try {
    const result = await autoUpdater.checkForUpdates()
    if (result == null || (result.isUpdateAvailable && result.downloadPromise == null)) {
      if (interactive) await showFailure()
      return
    }
    if (!result.isUpdateAvailable) {
      if (interactive) await showLatest()
      return
    }
    await result.downloadPromise
  } catch (error) {
    console.error(error)
    if (interactive) await showFailure()
  }
}

let pending: Promise<void> = Promise.resolve()

export function checkForUpdates(interactive: boolean): Promise<void> {
  const check = pending.then(() => runCheck(interactive))
  pending = check.then(
    () => undefined,
    () => undefined
  )
  return check
}
