import { app, dialog, shell, BrowserWindow, type MessageBoxOptions } from 'electron'

const RELEASES_URL = 'https://api.github.com/repos/Processoriented/taipan-clone/releases/latest'
const RELEASE_PAGE = 'https://github.com/Processoriented/taipan-clone/releases/latest'

type Version = [number, number, number]

function parseVersion(value: string): Version | null {
  const match = /^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?/i.exec(value.trim())
  if (!match) return null
  return [Number(match[1]), Number(match[2] ?? 0), Number(match[3] ?? 0)]
}

function formatVersion(version: Version): string {
  return version.join('.')
}

function isNewer(latest: Version, current: Version): boolean {
  for (let index = 0; index < 3; index += 1) {
    if (latest[index] !== current[index]) return latest[index] > current[index]
  }
  return false
}

type LatestRelease = { version: Version; url: string }

async function fetchLatestRelease(): Promise<LatestRelease | 'none'> {
  const response = await fetch(RELEASES_URL, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'taipan-clone'
    },
    signal: AbortSignal.timeout(15000)
  })
  if (response.status === 404) return 'none'
  if (!response.ok) throw new Error(`GitHub releases responded ${response.status}`)
  const body = (await response.json()) as { tag_name?: unknown; html_url?: unknown }
  if (typeof body.tag_name !== 'string') throw new Error('Release is missing a version')
  const version = parseVersion(body.tag_name)
  if (!version) throw new Error(`Could not read release version ${body.tag_name}`)
  const url = typeof body.html_url === 'string' ? body.html_url : RELEASE_PAGE
  return { version, url }
}

function parentWindow(): BrowserWindow | undefined {
  const parent = BrowserWindow.getAllWindows().find((window) => !window.isDestroyed())
  return parent
}

function showMessage(options: MessageBoxOptions): Promise<Electron.MessageBoxReturnValue> {
  const parent = parentWindow()
  if (parent) return dialog.showMessageBox(parent, options)
  return dialog.showMessageBox(options)
}

async function runCheck(interactive: boolean): Promise<void> {
  const current = parseVersion(app.getVersion())
  if (!current) {
    if (interactive) {
      await showMessage({
        type: 'warning',
        message: 'Could not check for updates.',
        detail: `The app version "${app.getVersion()}" is not a release number.`
      })
    }
    return
  }

  let latest: LatestRelease | 'none'
  try {
    latest = await fetchLatestRelease()
  } catch (error) {
    console.error(error)
    if (interactive) {
      await showMessage({
        type: 'warning',
        message: 'Could not check for updates.',
        detail: 'Check your connection and try again.'
      })
    }
    return
  }

  if (latest === 'none') {
    if (interactive) {
      await showMessage({
        type: 'info',
        message: 'No release has been published yet.',
        detail: `You are running ${formatVersion(current)}.`
      })
    }
    return
  }

  if (isNewer(latest.version, current)) {
    const result = await showMessage({
      type: 'info',
      message: `Taipan ${formatVersion(latest.version)} is available.`,
      detail: `You are running ${formatVersion(current)}.`,
      buttons: ['Download', 'Later'],
      defaultId: 0,
      cancelId: 1
    })
    if (result.response === 0) await shell.openExternal(latest.url)
    return
  }

  if (!interactive) return

  if (isNewer(current, latest.version)) {
    await showMessage({
      type: 'info',
      message: `You are running ${formatVersion(current)}.`,
      detail: `The latest release is ${formatVersion(latest.version)}.`
    })
    return
  }

  await showMessage({
    type: 'info',
    message: `Taipan ${formatVersion(current)} is the latest release.`
  })
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
