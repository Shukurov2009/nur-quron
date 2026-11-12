import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const iconsDir = path.join(root, 'public', 'icons')

const baseSvg = (size, maskable = false) => {
  const pad = maskable ? size * 0.18 : 0
  const inner = size - pad * 2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${maskable ? 0 : size * 0.22}" fill="#0b1f1a"/>
  <g transform="translate(${pad},${pad}) scale(${inner / 64})">
    <circle cx="31" cy="33" r="20" fill="none" stroke="#d9b96e" stroke-width="2.4"/>
    <path d="M43 15a20 20 0 1 0 0 36 23 23 0 1 1 0-36Z" fill="#d9b96e"/>
    <path d="m50 10 1.9 5.1 5.3 1.9-5.3 1.9L50 24l-1.9-5.1-5.3-1.9 5.3-1.9L50 10Z" fill="#f4e7c3"/>
    <path d="M22 49h26" stroke="#d9b96e" stroke-width="1.6" stroke-linecap="round"/>
  </g>
</svg>`
}

async function main() {
  await fs.mkdir(iconsDir, { recursive: true })
  const jobs = [
    { name: 'icon-192.png', size: 192, maskable: false },
    { name: 'icon-512.png', size: 512, maskable: false },
    { name: 'icon-maskable-512.png', size: 512, maskable: true },
    { name: 'apple-touch-icon.png', size: 180, maskable: false },
  ]
  for (const job of jobs) {
    await sharp(Buffer.from(baseSvg(job.size, job.maskable)))
      .png()
      .toFile(path.join(iconsDir, job.name))
    console.log(`Yaratildi: icons/${job.name}`)
  }
  await fs.copyFile(
    path.join(root, 'public', 'favicon.svg'),
    path.join(root, 'public', 'favicon.svg'),
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
