import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type {
  AppSettings,
  Bookmark,
  LocationInfo,
  MemorizationProgress,
  ThemeMode,
} from '../types'
import { defaultCity } from '../data/cities'
import { pullCloudState, pushCloudState, supabase } from '../lib/supabase'
import { readStorage, writeStorage } from '../lib/storage'
import { useAuth } from './AuthContext'

const STORAGE_KEY = 'nur-settings-v1'

export const defaultSettings: AppSettings = {
  theme: 'dark',
  script: 'latin',
  showTranslation: true,
  autoScroll: true,
  playbackRate: 1,
  notificationMode: 'silent',
  adhanVolume: 0.8,
  location: {
    lat: defaultCity.lat,
    lon: defaultCity.lon,
    city: defaultCity.name,
    country: defaultCity.country,
    timezone: defaultCity.timezone,
    source: 'default',
  },
  calculationMethod: 3,
  asrSchool: 1,
  memorization: {},
  bookmarks: [],
  lastRead: null,
  onboarded: false,
}

type SyncStatus = 'local' | 'syncing' | 'synced' | 'pending' | 'error'

interface SettingsContextValue {
  settings: AppSettings
  updateSettings: (patch: Partial<AppSettings> | ((current: AppSettings) => Partial<AppSettings>)) => void
  setLocation: (location: LocationInfo) => void
  setTheme: (theme: ThemeMode) => void
  markMemorized: (surah: number, ayahs: number[], range?: { start: number; end: number; repeats: number }) => void
  toggleBookmark: (surah: number, ayah: number) => boolean
  isBookmarked: (surah: number, ayah: number) => boolean
  setLastRead: (surah: number, ayah: number) => void
  resetSettings: () => void
  syncStatus: SyncStatus
  syncError: string | null
}

function normalizeSettings(input: Partial<AppSettings> | null | undefined): AppSettings {
  if (!input || typeof input !== 'object') return defaultSettings
  return {
    ...defaultSettings,
    ...input,
    location: { ...defaultSettings.location, ...(input.location || {}) },
    memorization: { ...(input.memorization || {}) },
    bookmarks: Array.isArray(input.bookmarks) ? input.bookmarks : [],
    asrSchool: input.asrSchool === 0 ? 0 : 1,
  }
}

function unionBookmarks(a: Bookmark[], b: Bookmark[]) {
  const map = new Map<string, Bookmark>()
  for (const bookmark of [...a, ...b]) {
    const key = `${bookmark.surah}:${bookmark.ayah}`
    const existing = map.get(key)
    if (!existing || bookmark.createdAt < existing.createdAt) map.set(key, bookmark)
  }
  return Array.from(map.values()).sort((x, y) => y.createdAt - x.createdAt)
}

function mergeSettings(local: AppSettings, cloud: Partial<AppSettings>): AppSettings {
  const remote = normalizeSettings(cloud)
  const memorization: Record<string, MemorizationProgress> = { ...local.memorization }
  for (const [key, value] of Object.entries(remote.memorization)) {
    const existing = memorization[key]
    if (!existing || (value.updatedAt || 0) > (existing.updatedAt || 0)) {
      memorization[key] = value
    }
  }
  const lastRead =
    (remote.lastRead?.at || 0) > (local.lastRead?.at || 0) ? remote.lastRead : local.lastRead
  return {
    ...local,
    ...remote,
    memorization,
    bookmarks: unionBookmarks(local.bookmarks, remote.bookmarks),
    lastRead,
  }
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [settings, setSettings] = useState<AppSettings>(() =>
    normalizeSettings(readStorage<AppSettings>(STORAGE_KEY, defaultSettings)),
  )
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('local')
  const [syncError, setSyncError] = useState<string | null>(null)
  const hydratedUser = useRef<string | null>(null)
  const skipPush = useRef(true)
  const settingsRef = useRef(settings)
  settingsRef.current = settings

  const updateSettings = useCallback(
    (patch: Partial<AppSettings> | ((current: AppSettings) => Partial<AppSettings>)) => {
      setSettings((current) => {
        const next = normalizeSettings({
          ...current,
          ...(typeof patch === 'function' ? patch(current) : patch),
        })
        return next
      })
    },
    [],
  )

  const setLocation = useCallback(
    (location: LocationInfo) => {
      setSettings((current) => normalizeSettings({ ...current, location }))
    },
    [],
  )

  const setTheme = useCallback((theme: ThemeMode) => {
    setSettings((current) => normalizeSettings({ ...current, theme }))
  }, [])

  const markMemorized = useCallback(
    (surah: number, ayahs: number[], range?: { start: number; end: number; repeats: number }) => {
      setSettings((current) => {
        const key = String(surah)
        const existing = current.memorization[key]
        const completed = new Set(existing?.completed || [])
        ayahs.forEach((ayah) => completed.add(ayah))
        const record: MemorizationProgress = {
          surah,
          completed: Array.from(completed).sort((a, b) => a - b),
          lastRange: range ?? existing?.lastRange,
          updatedAt: Date.now(),
        }
        return normalizeSettings({
          ...current,
          memorization: { ...current.memorization, [key]: record },
        })
      })
    },
    [],
  )

  const toggleBookmark = useCallback(
    (surah: number, ayah: number) => {
      let added = false
      setSettings((current) => {
        const existing = current.bookmarks.find((b) => b.surah === surah && b.ayah === ayah)
        if (existing) {
          return normalizeSettings({
            ...current,
            bookmarks: current.bookmarks.filter((b) => !(b.surah === surah && b.ayah === ayah)),
          })
        }
        added = true
        return normalizeSettings({
          ...current,
          bookmarks: [{ surah, ayah, createdAt: Date.now() }, ...current.bookmarks],
        })
      })
      return added
    },
    [],
  )

  const isBookmarked = useCallback(
    (surah: number, ayah: number) =>
      settings.bookmarks.some((b) => b.surah === surah && b.ayah === ayah),
    [settings.bookmarks],
  )

  const setLastRead = useCallback((surah: number, ayah: number) => {
    setSettings((current) => {
      const last = current.lastRead
      if (last && last.surah === surah && last.ayah === ayah && Date.now() - last.at < 15000) {
        return current
      }
      return normalizeSettings({
        ...current,
        lastRead: { surah, ayah, at: Date.now() },
      })
    })
  }, [])

  const resetSettings = useCallback(() => {
    setSettings({ ...defaultSettings })
  }, [])

  // Persist locally on every change.
  useEffect(() => {
    writeStorage(STORAGE_KEY, settings)
  }, [settings])

  // Apply theme.
  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = settings.theme === 'dark' || (settings.theme === 'system' && media.matches)
      root.dataset.theme = dark ? 'dark' : 'light'
      root.style.colorScheme = dark ? 'dark' : 'light'
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) meta.setAttribute('content', dark ? '#0b1f1a' : '#f5f0e6')
    }
    apply()
    if (settings.theme === 'system') {
      media.addEventListener('change', apply)
      return () => media.removeEventListener('change', apply)
    }
    return undefined
  }, [settings.theme])

  // Pull cloud state once per signed-in user.
  useEffect(() => {
    if (!user || !supabase) {
      hydratedUser.current = null
      setSyncStatus('local')
      setSyncError(null)
      return
    }
    let cancelled = false
    setSyncStatus('syncing')
    setSyncError(null)
    skipPush.current = true
    pullCloudState(user.id)
      .then((cloud) => {
        if (cancelled) return
        if (cloud?.data && Object.keys(cloud.data).length > 0) {
          setSettings((current) => mergeSettings(current, cloud.data as Partial<AppSettings>))
        } else {
          pushCloudState(user.id, settingsRef.current as unknown as Record<string, unknown>).catch(
            (error) => setSyncError(String(error?.message || error)),
          )
        }
        hydratedUser.current = user.id
        setSyncStatus('synced')
        window.setTimeout(() => {
          skipPush.current = false
        }, 300)
      })
      .catch((error) => {
        if (cancelled) return
        hydratedUser.current = user.id
        setSyncStatus('error')
        setSyncError(String(error?.message || error))
        window.setTimeout(() => {
          skipPush.current = false
        }, 300)
      })
    return () => {
      cancelled = true
    }
  }, [user?.id])

  // Push changes to Supabase with a debounce.
  useEffect(() => {
    if (!user || !supabase || hydratedUser.current !== user.id || skipPush.current) return
    setSyncStatus('pending')
    const timer = window.setTimeout(() => {
      pushCloudState(user.id, settings as unknown as Record<string, unknown>)
        .then(() => {
          setSyncStatus('synced')
          setSyncError(null)
        })
        .catch((error) => {
          setSyncStatus('error')
          setSyncError(String(error?.message || error))
        })
    }, 1200)
    return () => window.clearTimeout(timer)
  }, [settings, user?.id])

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      updateSettings,
      setLocation,
      setTheme,
      markMemorized,
      toggleBookmark,
      isBookmarked,
      setLastRead,
      resetSettings,
      syncStatus,
      syncError,
    }),
    [
      settings,
      updateSettings,
      setLocation,
      setTheme,
      markMemorized,
      toggleBookmark,
      isBookmarked,
      setLastRead,
      resetSettings,
      syncStatus,
      syncError,
    ],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const value = useContext(SettingsContext)
  if (!value) throw new Error('useSettings SettingsProvider ichida ishlatilishi kerak')
  return value
}
