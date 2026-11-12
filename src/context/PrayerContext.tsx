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
import type { LocationInfo, NextPrayer, PrayerDay } from '../types'
import {
  addDaysInTimeZone,
  dateParamForTimeZone,
  fetchPrayerDay,
  findNextPrayer,
  mainPrayerKeys,
  prayerDate,
  prayerLabels,
  qiblaBearing,
} from '../lib/prayer'
import { dispatchInAppReminder, requestNotificationPermission, showPrayerNotification } from '../lib/notifications'
import { useSettings } from './SettingsContext'
import { formatClockInTimeZone } from '../lib/utils'

interface PrayerContextValue {
  today: PrayerDay | null
  tomorrow: PrayerDay | null
  next: NextPrayer | null
  secondsLeft: number
  now: Date
  loading: boolean
  error: string | null
  refresh: () => void
  qibla: number
  location: LocationInfo
  requestNotifications: () => Promise<NotificationPermission | 'unsupported'>
  testAdhan: () => Promise<boolean>
  stopAdhan: () => void
}

const PrayerContext = createContext<PrayerContextValue | null>(null)

export function PrayerProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings()
  const { location, calculationMethod, asrSchool, notificationMode, adhanVolume } = settings
  const [today, setToday] = useState<PrayerDay | null>(null)
  const [tomorrow, setTomorrow] = useState<PrayerDay | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(() => new Date())
  const [refreshKey, setRefreshKey] = useState(0)
  const adhanRef = useRef<HTMLAudioElement | null>(null)
  const unlockedRef = useRef(false)
  const notifiedRef = useRef<Set<string>>(new Set())

  const timezone = location.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const current = new Date()
      const [todayResult, tomorrowResult] = await Promise.allSettled([
        fetchPrayerDay(location, calculationMethod, asrSchool, current),
        fetchPrayerDay(
          location,
          calculationMethod,
          asrSchool,
          addDaysInTimeZone(current, timezone, 1),
        ),
      ])
      if (todayResult.status === 'fulfilled') setToday(todayResult.value)
      if (tomorrowResult.status === 'fulfilled') setTomorrow(tomorrowResult.value)
      if (todayResult.status === 'rejected') {
        setError('Namoz vaqtlarini yuklab bo‘lmadi. Internet aloqasini tekshiring.')
      }
    } finally {
      setLoading(false)
    }
  }, [location, calculationMethod, asrSchool, timezone])

  useEffect(() => {
    void load()
  }, [load, refreshKey])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  // If the day changes while the app stays open, refresh the timetable.
  useEffect(() => {
    if (!today) return
    const timer = window.setInterval(() => {
      const currentDate = dateParamForTimeZone(new Date(), timezone)
      if (currentDate !== today.date) setRefreshKey((key) => key + 1)
    }, 60_000)
    return () => window.clearInterval(timer)
  }, [today, timezone])

  const refresh = useCallback(() => setRefreshKey((key) => key + 1), [])

  const next = useMemo(() => findNextPrayer(today, tomorrow, now), [today, tomorrow, now])
  const secondsLeft = next ? Math.max(0, Math.floor((next.time.getTime() - now.getTime()) / 1000)) : 0

  // Adhan audio element + first-gesture unlock.
  useEffect(() => {
    const audio = new Audio('/audio/azan.mp3')
    audio.preload = 'auto'
    audio.volume = adhanVolume
    adhanRef.current = audio

    const unlock = () => {
      if (unlockedRef.current) return
      audio.muted = true
      audio
        .play()
        .then(() => {
          audio.pause()
          audio.currentTime = 0
          audio.muted = false
          unlockedRef.current = true
          window.removeEventListener('pointerdown', unlock)
        })
        .catch(() => {
          audio.muted = false
        })
    }
    window.addEventListener('pointerdown', unlock)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      audio.pause()
      audio.src = ''
      adhanRef.current = null
    }
  }, [])

  useEffect(() => {
    if (adhanRef.current) adhanRef.current.volume = adhanVolume
  }, [adhanVolume])

  const playAdhan = useCallback(async () => {
    const audio = adhanRef.current
    if (!audio) return false
    try {
      audio.muted = false
      audio.volume = adhanVolume
      audio.currentTime = 0
      await audio.play()
      return true
    } catch {
      return false
    }
  }, [adhanVolume])

  const stopAdhan = useCallback(() => {
    const audio = adhanRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
  }, [])

  const testAdhan = useCallback(async () => {
    return playAdhan()
  }, [playAdhan])

  const requestNotifications = useCallback(async () => {
    return requestNotificationPermission()
  }, [])

  const fireReminder = useCallback(
    (key: string, time: Date) => {
      const id = `${dateParamForTimeZone(time, timezone)}:${key}`
      if (notifiedRef.current.has(id)) return
      notifiedRef.current.add(id)
      const label = prayerLabels[key] || key
      const title = `${label} vaqti bo‘ldi`
      const body = `${location.city} · ${formatClockInTimeZone(time, timezone)}. Namozni o‘z vaqtida ado eting.`
      dispatchInAppReminder(title, body)
      if (notificationMode === 'adhan') {
        void playAdhan()
        void showPrayerNotification(title, body, `prayer-${id}`)
      } else if (notificationMode === 'silent') {
        void showPrayerNotification(title, body, `prayer-${id}`)
      }
    },
    [location.city, notificationMode, playAdhan, timezone],
  )

  // Schedule today's prayers and tomorrow's Fajr while the app is open.
  useEffect(() => {
    if (notificationMode === 'none' || !today) return
    const timers: number[] = []
    const current = new Date()
    const candidates: Array<[string, Date]> = mainPrayerKeys.map((key) => [
      key,
      prayerDate(today, key),
    ])
    if (tomorrow) candidates.push(['Fajr', prayerDate(tomorrow, 'Fajr')])

    for (const [key, time] of candidates) {
      const diff = time.getTime() - current.getTime()
      if (diff > 0 && diff < 26 * 60 * 60 * 1000) {
        timers.push(
          window.setTimeout(() => {
            fireReminder(key, time)
            if (Date.now() - time.getTime() > 24 * 60 * 60 * 1000) {
              setRefreshKey((value) => value + 1)
            }
          }, diff),
        )
      }
    }
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [today, tomorrow, notificationMode, fireReminder])

  // If the tab wakes up after a prayer time, show a reminder only if it just passed.
  useEffect(() => {
    if (notificationMode === 'none' || !today) return
    const check = () => {
      const current = new Date()
      for (const key of mainPrayerKeys) {
        const time = prayerDate(today, key)
        const diff = current.getTime() - time.getTime()
        if (diff >= 0 && diff < 90_000) fireReminder(key, time)
      }
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') check()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [today, notificationMode, fireReminder])

  const qibla = useMemo(() => qiblaBearing(location.lat, location.lon), [location.lat, location.lon])

  const value = useMemo<PrayerContextValue>(
    () => ({
      today,
      tomorrow,
      next,
      secondsLeft,
      now,
      loading,
      error,
      refresh,
      qibla,
      location,
      requestNotifications,
      testAdhan,
      stopAdhan,
    }),
    [
      today,
      tomorrow,
      next,
      secondsLeft,
      now,
      loading,
      error,
      refresh,
      qibla,
      location,
      requestNotifications,
      testAdhan,
      stopAdhan,
    ],
  )

  return <PrayerContext.Provider value={value}>{children}</PrayerContext.Provider>
}

export function usePrayer() {
  const value = useContext(PrayerContext)
  if (!value) throw new Error('usePrayer PrayerProvider ichida ishlatilishi kerak')
  return value
}
