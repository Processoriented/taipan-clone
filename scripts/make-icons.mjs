import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import pngToIco from 'png-to-ico'
import sharp from 'sharp'

const execFileAsync = promisify(execFile)
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(root, 'src/renderer/src/assets/ship.gif')

// Integer 7x scale of the 98x84 ship, centered on a 1024 canvas.
const CANVAS = 1024
const SCALE_AT_CANVAS = 7

const iconsetSizes = [
  ['icon_16x16.png', 16],
  ['icon_16x16@2x.png', 32],
  ['icon_32x32.png', 32],
  ['icon_32x32@2x.png', 64],
  ['icon_128x128.png', 128],
  ['icon_128x128@2x.png', 256],
  ['icon_256x256.png', 256],
  ['icon_256x256@2x.png', 512],
  ['icon_512x512.png', 512],
  ['icon_512x512@2x.png', 1024]
]

const icoSizes = [16, 24, 32, 48, 64, 128, 256]

/**
 * @param {number} size
 * @returns {Promise<Buffer>}
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- plain Node script
async function render(size) {
  const meta = await sharp(source).metadata()
  const srcW = meta.width ?? 1
  const srcH = meta.height ?? 1
  const targetScale = (SCALE_AT_CANVAS * size) / CANVAS
  const intScale = Math.floor(targetScale)
  const scale = intScale >= 1 ? intScale : targetScale
  const width = Math.max(1, Math.round(srcW * scale))
  const height = Math.max(1, Math.round(srcH * scale))
  const ship = await sharp(source)
    .resize(width, height, { kernel: sharp.kernel.nearest, fit: 'fill' })
    .png()
    .toBuffer()

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    }
  })
    .composite([{ input: ship, gravity: 'centre' }])
    .png()
    .toBuffer()
}

const buildDir = join(root, 'build')
const resourcesDir = join(root, 'resources')
await mkdir(buildDir, { recursive: true })
await mkdir(resourcesDir, { recursive: true })

await writeFile(join(buildDir, 'icon.png'), await render(1024))
await writeFile(join(resourcesDir, 'icon.png'), await render(512))

const icoBuffers = await Promise.all(icoSizes.map((size) => render(size)))
await writeFile(join(buildDir, 'icon.ico'), await pngToIco(icoBuffers))

if (process.platform !== 'darwin') {
  console.log('Skipped icon.icns (iconutil is available on macOS).')
} else {
  const iconset = await mkdtemp(join(tmpdir(), 'taipan-iconset-'))
  const iconsetDir = join(iconset, 'icon.iconset')
  await mkdir(iconsetDir)
  await Promise.all(
    iconsetSizes.map(async ([name, size]) => {
      await writeFile(join(iconsetDir, name), await render(size))
    })
  )
  await execFileAsync('iconutil', ['-c', 'icns', iconsetDir, '-o', join(buildDir, 'icon.icns')])
  await rm(iconset, { recursive: true, force: true })
}

console.log('Wrote build/icon.png, build/icon.ico, resources/icon.png, and build/icon.icns.')
