import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { transliterateUz, surahNames } from './translit.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const cacheDir = path.join(root, '.cache')
const outDir = path.join(root, 'public', 'data')
const surahOutDir = path.join(outDir, 'surah')

const QURAN_URL = 'https://api.alquran.cloud/v1/quran/quran-uthmani'
const TRANSLATION_URL = (n) =>
  `https://quranenc.com/api/v1/translation/sura/uzbek_sadiq/${n}`

async function ensureDirs() {
  await fs.mkdir(cacheDir, { recursive: true })
  await fs.mkdir(surahOutDir, { recursive: true })
}

async function fetchJson(url, cacheName, attempts = 4) {
  const cachePath = path.join(cacheDir, cacheName)
  try {
    return JSON.parse(await fs.readFile(cachePath, 'utf8'))
  } catch {
    // not cached yet
  }

  let lastError
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: {
          'user-agent': 'NurQuran/1.0 (educational project)',
          accept: 'application/json',
        },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
      const text = await res.text()
      const json = JSON.parse(text)
      await fs.writeFile(cachePath, JSON.stringify(json))
      return json
    } catch (error) {
      lastError = error
      await new Promise((resolve) => setTimeout(resolve, 700 * attempt))
    }
  }
  throw lastError
}

function cleanTranslation(text) {
  return String(text || '')
    .replace(/\uFEFF/g, '')
    .replace(/\s*\[\d+\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanArabic(text) {
  return String(text || '')
    .replace(/\uFEFF/g, '')
    .replace(/^\s+|\s+$/g, '')
}

async function main() {
  await ensureDirs()

  console.log('Quran matni yuklanmoqda...')
  const quran = await fetchJson(QURAN_URL, 'quran-uthmani.json')
  if (quran.code !== 200 || !Array.isArray(quran.data?.surahs)) {
    throw new Error('Quran API javobi kutilgan formatda emas')
  }

  console.log(`114 sura uchun tarjima yuklanmoqda (0/114)...`)
  const translations = new Array(115)
  const surahs = quran.data.surahs
  let completed = 0
  const queue = surahs.map((s) => s.number)
  const workers = Array.from({ length: 5 }, async () => {
    while (queue.length) {
      const number = queue.shift()
      const json = await fetchJson(
        TRANSLATION_URL(number),
        `sadiq-${number}.json`,
      )
      if (!json.result || !Array.isArray(json.result)) {
        throw new Error(`Sura ${number} tarjimasi topilmadi`)
      }
      translations[number] = json.result
      completed += 1
      if (completed % 10 === 0 || completed === 114) {
        process.stdout.write(`\r114 sura uchun tarjima yuklanmoqda (${completed}/114)...`)
      }
    }
  })
  await Promise.all(workers)
  console.log('')

  const index = []
  const dailyRefs = [
    [2, 255],
    [2, 286],
    [94, 5],
    [94, 6],
    [65, 3],
    [39, 53],
    [3, 139],
    [13, 28],
    [17, 82],
    [40, 60],
    [7, 56],
    [2, 152],
    [57, 4],
    [50, 16],
  ]
  const byRef = new Map()

  let totalAyahs = 0
  for (const surah of surahs) {
    const names = surahNames[surah.number - 1]
    if (!names) throw new Error(`Sura ${surah.number} nomi topilmadi`)
    const translationRows = translations[surah.number]
    if (translationRows.length !== surah.ayahs.length) {
      throw new Error(
        `Sura ${surah.number}: oyatlar ${surah.ayahs.length}, tarjima ${translationRows.length}`,
      )
    }

    const ayahs = surah.ayahs.map((ayah, i) => {
      const translationCyr = cleanTranslation(translationRows[i].translation)
      const item = {
        number: ayah.number,
        numberInSurah: ayah.numberInSurah,
        text: cleanArabic(ayah.text),
        translation: {
          latin: transliterateUz(translationCyr),
          cyrillic: translationCyr,
        },
        audio: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`,
        audio64: `https://cdn.islamic.network/quran/audio/64/ar.alafasy/${ayah.number}.mp3`,
        juz: ayah.juz,
        page: ayah.page,
        sajda: Boolean(ayah.sajda),
      }
      byRef.set(`${surah.number}:${ayah.numberInSurah}`, {
        ...item,
        surah: surah.number,
      })
      return item
    })

    const arabicName = String(surah.name || '')
      .replace(/^سُورَةُ\s*/, '')
      .trim()

    const surahData = {
      number: surah.number,
      nameUz: names[0],
      nameCyr: names[1],
      nameArabic: arabicName,
      nameEnglish: surah.englishName,
      englishNameTranslation: surah.englishNameTranslation,
      revelation: surah.revelationType === 'Meccan' ? 'Makkiy' : 'Madaniy',
      ayahCount: surah.ayahs.length,
      ayahs,
    }

    await fs.writeFile(
      path.join(surahOutDir, `${surah.number}.json`),
      JSON.stringify(surahData),
    )

    index.push({
      number: surah.number,
      nameUz: names[0],
      nameCyr: names[1],
      nameArabic: arabicName,
      nameEnglish: surah.englishName,
      englishNameTranslation: surah.englishNameTranslation,
      revelation: surahData.revelation,
      ayahCount: surah.ayahs.length,
    })
    totalAyahs += surah.ayahs.length
  }

  if (totalAyahs !== 6236) {
    throw new Error(`Jami oyatlar 6236 bo'lishi kerak, topildi: ${totalAyahs}`)
  }
  if (index.length !== 114) {
    throw new Error(`Suralar 114 bo'lishi kerak, topildi: ${index.length}`)
  }

  const daily = dailyRefs.map(([surahNumber, ayahNumber]) => {
    const item = byRef.get(`${surahNumber}:${ayahNumber}`)
    const meta = index.find((s) => s.number === surahNumber)
    if (!item || !meta) throw new Error(`Kunlik oyat topilmadi: ${surahNumber}:${ayahNumber}`)
    return {
      surah: surahNumber,
      surahNameUz: meta.nameUz,
      surahNameCyr: meta.nameCyr,
      ayah: ayahNumber,
      arabic: item.text,
      translation: item.translation,
    }
  })

  await fs.writeFile(path.join(outDir, 'index.json'), JSON.stringify(index))
  await fs.writeFile(path.join(outDir, 'daily.json'), JSON.stringify(daily))
  await fs.writeFile(
    path.join(outDir, 'meta.json'),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        surahs: 114,
        ayahs: totalAyahs,
        reciter: 'Mishary Rashid Alafasy',
        translation: 'Muhammad Sodiq Muhammad Yusuf',
        sources: [
          'https://api.alquran.cloud (Uthmani matn)',
          'https://quranenc.com (Muhammad Sodiq tarjimasi)',
          'https://cdn.islamic.network (Mishary Rashid Alafasy audiosi)',
        ],
      },
      null,
      2,
    ),
  )

  console.log(`Tayyor: 114 sura, ${totalAyahs} oyat.`)
  console.log(`Chiqqan papka: ${outDir}`)
}

main().catch((error) => {
  console.error('\nXatolik:', error)
  process.exitCode = 1
})
