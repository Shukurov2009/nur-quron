export type ScriptMode = 'latin' | 'cyrillic'
export type ThemeMode = 'dark' | 'light' | 'system'
export type NotificationMode = 'adhan' | 'silent' | 'none'

export interface Ayah {
  number: number
  numberInSurah: number
  text: string
  translation: {
    latin: string
    cyrillic: string
  }
  audio: string
  audio64: string
  juz: number
  page: number
  sajda: boolean
}

export interface SurahMeta {
  number: number
  nameUz: string
  nameCyr: string
  nameArabic: string
  nameEnglish: string
  englishNameTranslation: string
  revelation: 'Makkiy' | 'Madaniy'
  ayahCount: number
}

export interface Surah extends SurahMeta {
  ayahs: Ayah[]
}

export interface DailyAyah {
  surah: number
  surahNameUz: string
  surahNameCyr: string
  ayah: number
  arabic: string
  translation: {
    latin: string
    cyrillic: string
  }
}

export interface LocationInfo {
  lat: number
  lon: number
  city: string
  country?: string
  timezone?: string
  source: 'gps' | 'manual' | 'default'
}

export interface MemorizationProgress {
  surah: number
  completed: number[]
  lastRange?: { start: number; end: number; repeats: number }
  updatedAt: number
}

export interface Bookmark {
  surah: number
  ayah: number
  createdAt: number
}

export interface LastRead {
  surah: number
  ayah: number
  at: number
}

export interface AppSettings {
  theme: ThemeMode
  script: ScriptMode
  showTranslation: boolean
  autoScroll: boolean
  playbackRate: number
  notificationMode: NotificationMode
  adhanVolume: number
  location: LocationInfo
  calculationMethod: number
  asrSchool: 0 | 1
  memorization: Record<string, MemorizationProgress>
  bookmarks: Bookmark[]
  lastRead: LastRead | null
  onboarded: boolean
}

export type PrayerKey = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'

export interface PrayerDay {
  date: string
  dateLabel: string
  hijri: string
  timezone: string
  timings: Record<string, string>
  fetchedAt: number
}

export interface NextPrayer {
  key: PrayerKey
  time: Date
}
