import type { DailyAyah, Surah, SurahMeta } from '../types'

const indexCache = { promise: null as Promise<SurahMeta[]> | null }
const surahCache = new Map<number, Promise<Surah>>()
const dailyCache = { promise: null as Promise<DailyAyah[]> | null }

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`Ma'lumotni yuklab bo'lmadi (${res.status})`)
  return (await res.json()) as T
}

export function loadSurahIndex(): Promise<SurahMeta[]> {
  if (!indexCache.promise) {
    indexCache.promise = fetchJson<SurahMeta[]>('/data/index.json').catch((error) => {
      indexCache.promise = null
      throw error
    })
  }
  return indexCache.promise
}

export function loadSurah(number: number): Promise<Surah> {
  if (!Number.isInteger(number) || number < 1 || number > 114) {
    return Promise.reject(new Error('Sura raqami noto‘g‘ri'))
  }
  const existing = surahCache.get(number)
  if (existing) return existing
  const promise = fetchJson<Surah>(`/data/surah/${number}.json`).catch((error) => {
    surahCache.delete(number)
    throw error
  })
  surahCache.set(number, promise)
  return promise
}

export function loadDailyAyahs(): Promise<DailyAyah[]> {
  if (!dailyCache.promise) {
    dailyCache.promise = fetchJson<DailyAyah[]>('/data/daily.json').catch((error) => {
      dailyCache.promise = null
      throw error
    })
  }
  return dailyCache.promise
}
