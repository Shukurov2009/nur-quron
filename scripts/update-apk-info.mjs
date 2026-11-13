import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const apkPath = path.join(root, 'public', 'download', 'nur-quron.apk')
const infoPath = path.join(root, 'src', 'data', 'download.ts')

if (!fs.existsSync(apkPath)) {
  console.error(`APK topilmadi: ${apkPath}`)
  console.error('Avval GitHub Actions’dan APK’ni yuklab, shu joyga qo‘ying.')
  process.exit(1)
}

const apk = fs.readFileSync(apkPath)
const sha256 = crypto.createHash('sha256').update(apk).digest('hex')
const size = `${(apk.length / (1024 * 1024)).toFixed(1)} MB`
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))

const content = `export const apkInfo = {
  version: '${pkg.version}',
  size: '${size}',
  sha256: '${sha256}',
  url: 'https://nur-quron.vercel.app/download/nur-quron.apk',
  buildUrl: 'https://github.com/Shukurov2009/nur-quron/actions/workflows/android-apk.yml',
  requirements: 'Android 7.0+',
}
`

fs.writeFileSync(infoPath, content)
fs.writeFileSync(path.join(root, 'public', 'download', 'nur-quron.apk.sha256'), `${sha256}  nur-quron.apk\n`)
console.log(`Versiya: ${pkg.version}`)
console.log(`Hajm: ${size} (${apk.length} bayt)`)
console.log(`SHA-256: ${sha256}`)
