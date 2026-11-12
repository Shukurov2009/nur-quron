import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const assetsDir = path.join(root, 'assets')
const icon = path.join(root, 'public', 'icons', 'icon-512.png')
const maskable = path.join(root, 'public', 'icons', 'icon-maskable-512.png')
const bg = { r: 11, g: 31, b: 26, alpha: 1 }
const transparent = { r: 0, g: 0, b: 0, alpha: 0 }

await fs.mkdir(assetsDir, { recursive: true })

await sharp(icon)
  .resize(1024, 1024, { fit: 'contain', background: transparent })
  .png()
  .toFile(path.join(assetsDir, 'icon-only.png'))

await sharp({ create: { width: 1024, height: 1024, channels: 4, background: bg } })
  .png()
  .toFile(path.join(assetsDir, 'icon-background.png'))

const foreground = await sharp(maskable)
  .resize(640, 640, { fit: 'contain' })
  .png()
  .toBuffer()

await sharp({ create: { width: 1024, height: 1024, channels: 4, background: transparent } })
  .composite([{ input: foreground, gravity: 'center' }])
  .png()
  .toFile(path.join(assetsDir, 'icon-foreground.png'))

const splashLogo = await sharp(icon)
  .resize(480, 480, { fit: 'contain', background: transparent })
  .png()
  .toBuffer()

for (const name of ['splash.png', 'splash-dark.png']) {
  await sharp({ create: { width: 2732, height: 2732, channels: 4, background: bg } })
    .composite([{ input: splashLogo, gravity: 'center' }])
    .png()
    .toFile(path.join(assetsDir, name))
}

console.log('Android icon va splash assetlari tayyor:', assetsDir)
