import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Bell,
  BellRing,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  Info,
  LocateFixed,
  MapPin,
  Navigation,
  Play,
  RefreshCw,
  Volume2,
  VolumeX,
} from 'lucide-react'
import type { LocationInfo, NotificationMode, PrayerKey } from '../types'
import { cities } from '../data/cities'
import { useSettings } from '../context/SettingsContext'
import { usePrayer } from '../context/PrayerContext'
import {
  dateParamForTimeZone,
  fetchMonthlyCalendar,
  mainPrayerKeys,
  nextPrayerLabel,
  prayerLabels,
  type CalendarDay,
} from '../lib/prayer'
import { notificationPermission } from '../lib/notifications'
import {
  formatClockInTimeZone,
  formatCountdown,
  formatUzDate,
  uzMonths,
  uzWeekdays,
} from '../lib/utils'
import { ErrorBlock, LoadingBlock } from '../components/SectionHeading'

const weekdayMap: Record<string, string> = {
  Sunday: 'yakshanba',
  Monday: 'dushanba',
  Tuesday: 'seshanba',
  Wednesday: 'chorshanba',
  Thursday: 'payshanba',
  Friday: 'juma',
  Saturday: 'shanba',
}

const notificationOptions: Array<{
  id: NotificationMode
  title: string
  text: string
  icon: typeof Bell
}> = [
  {
    id: 'adhan',
    title: 'Azon ovozi',
    text: 'Namoz vaqtida azon yangraydi va bildirishnoma chiqadi.',
    icon: Volume2,
  },
  {
    id: 'silent',
    title: 'Jim bildirishnoma',
    text: 'Faqat ovozsiz bildirishnoma yuboriladi, azon yangramaydi.',
    icon: Bell,
  },
  {
    id: 'none',
    title: 'O‘chirilgan',
    text: 'Namoz vaqtlarini ko‘rasiz, lekin eslatma yuborilmaydi.',
    icon: VolumeX,
  },
]

function dateLabelFromParam(param?: string) {
  if (!param) return ''
  const [day, month, year] = param.split('-').map(Number)
  if (!day || !month || !year) return ''
  return formatUzDate(new Date(year, month - 1, day))
}

export function PrayerTimesPage() {
  const { settings, setLocation, updateSettings } = useSettings()
  const {
    today,
    tomorrow,
    next,
    secondsLeft,
    loading,
    error,
    refresh,
    qibla,
    requestNotifications,
    testAdhan,
    stopAdhan,
  } = usePrayer()

  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [permission, setPermission] = useState(() => notificationPermission())
  const [testing, setTesting] = useState(false)
  const [testMessage, setTestMessage] = useState<string | null>(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [calendar, setCalendar] = useState<CalendarDay[] | null>(null)
  const [calendarLoading, setCalendarLoading] = useState(false)
  const [calendarError, setCalendarError] = useState<string | null>(null)
  const [calYear, setCalYear] = useState(() => new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth() + 1)

  const matchedCity = useMemo(
    () =>
      cities.find(
        (city) =>
          Math.abs(city.lat - settings.location.lat) < 0.02 &&
          Math.abs(city.lon - settings.location.lon) < 0.02,
      ),
    [settings.location.lat, settings.location.lon],
  )

  const requestGps = () => {
    if (!navigator.geolocation) {
      setGeoError('Brauzeringiz joylashuvni aniqlashni qo‘llab-quvvatlamaydi.')
      return
    }
    setLocating(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: LocationInfo = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          city: 'Mening joylashuvim',
          country: 'GPS orqali aniqlandi',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          source: 'gps',
        }
        setLocation(location)
        setLocating(false)
      },
      (geo) => {
        setLocating(false)
        if (geo.code === geo.PERMISSION_DENIED) {
          setGeoError('Joylashuvga ruxsat berilmadi. Shaharni qo‘lda tanlashingiz mumkin.')
        } else {
          setGeoError('Joylashuvni aniqlab bo‘lmadi. Qayta urinib ko‘ring.')
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10 * 60 * 1000 },
    )
  }

  const chooseCity = (id: string) => {
    const city = cities.find((item) => item.id === id)
    if (!city) return
    setLocation({
      lat: city.lat,
      lon: city.lon,
      city: city.name,
      country: city.country,
      timezone: city.timezone,
      source: 'manual',
    })
  }

  const changeNotificationMode = async (mode: NotificationMode) => {
    updateSettings({ notificationMode: mode })
    setTestMessage(null)
    if (mode !== 'none') {
      const result = await requestNotifications()
      setPermission(result)
    }
  }

  const handleTestAdhan = async () => {
    setTesting(true)
    setTestMessage(null)
    if (settings.notificationMode === 'none') {
      updateSettings({ notificationMode: 'adhan' })
    }
    const result = await testAdhan()
    setTesting(false)
    setTestMessage(
      result
        ? 'Azon ijro etilmoqda. Ovoz eshitilmasa, qurilma ovozini tekshiring.'
        : 'Azonni ijro etib bo‘lmadi. Brauzer avval sahifaga bosishingizni talab qiladi.',
    )
  }

  const loadCalendar = useCallback(async () => {
    setCalendarLoading(true)
    setCalendarError(null)
    try {
      const days = await fetchMonthlyCalendar(
        settings.location,
        settings.calculationMethod,
        settings.asrSchool,
        calYear,
        calMonth,
      )
      setCalendar(days)
    } catch (reason) {
      setCalendarError(String((reason as Error)?.message || reason))
    } finally {
      setCalendarLoading(false)
    }
  }, [settings.location, settings.calculationMethod, settings.asrSchool, calYear, calMonth])

  useEffect(() => {
    if (!showCalendar) return
    void loadCalendar()
  }, [showCalendar, loadCalendar])

  const changeMonth = (delta: number) => {
    const date = new Date(calYear, calMonth - 1 + delta, 1)
    setCalYear(date.getFullYear())
    setCalMonth(date.getMonth() + 1)
    setCalendar(null)
  }

  const todayDateNumber = today ? Number(today.date.split('-')[0]) : 0

  const extraKeys: string[] = ['Sunrise', 'Sunset']

  return (
    <div className="page prayer-page">
      <header className="page-head">
        <div>
          <span className="eyebrow">
            <Compass size={14} /> Namoz vaqtlari
          </span>
          <h1>Namoz vaqtlari</h1>
          <p>
            Joylashuvingizga qarab aniq vaqtlar, keyingi namozga qadar hisoblagich, qibla
            yo‘nalishi va eslatmalar.
          </p>
        </div>
        <div className="page-head-stat">
          <CalendarDays size={32} />
          <strong>{today?.hijri ? today.hijri.split(' ').slice(0, 3).join(' ') : 'Hijriy'}</strong>
          <span>{dateLabelFromParam(today?.date)}</span>
        </div>
      </header>

      <section className="location-bar">
        <div className="location-main">
          <span className="location-pin">
            <MapPin size={20} />
          </span>
          <div>
            <strong>{settings.location.city}</strong>
            <span>
              {settings.location.country || 'Tanlangan joylashuv'}
              {settings.location.source === 'gps' ? ' · GPS' : ''}
            </span>
          </div>
        </div>
        <label className="location-select">
          <select
            value={matchedCity?.id || (settings.location.source === 'gps' ? 'gps' : '')}
            onChange={(event) => chooseCity(event.target.value)}
            aria-label="Shaharni tanlash"
          >
            <option value="" disabled>
              Shaharni tanlang
            </option>
            {settings.location.source === 'gps' && <option value="gps">Mening joylashuvim</option>}
            {cities.map((city) => (
              <option value={city.id} key={city.id}>
                {city.name} — {city.country}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn btn-gold btn-small" onClick={requestGps} disabled={locating}>
          {locating ? <RefreshCw size={15} className="spin" /> : <LocateFixed size={15} />}
          {locating ? 'Aniqlanmoqda...' : 'Joylashuvni aniqlash'}
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={refresh}
          title="Vaqtlarni yangilash"
          aria-label="Vaqtlarni yangilash"
        >
          <RefreshCw size={17} />
        </button>
      </section>
      {geoError && <p className="inline-error">{geoError}</p>}

      {error && <ErrorBlock message={error} onRetry={refresh} />}

      {loading && !today ? (
        <LoadingBlock label="Namoz vaqtlari yuklanmoqda..." />
      ) : today ? (
        <>
          <div className="prayer-top-grid">
            <section className="prayer-next-hero">
              <span className="eyebrow">
                <span className="live-dot" /> Keyingi namoz
              </span>
              <div className="prayer-next-main">
                <div>
                  <h2>{next ? nextPrayerLabel(next.key) : 'Bomdod'}</h2>
                  <p className="prayer-next-time">
                    {next ? formatClockInTimeZone(next.time, today.timezone) : today.timings.Fajr}
                  </p>
                  <span className="prayer-next-count">
                    {next ? `${formatCountdown(secondsLeft)} qoldi` : 'Vaqtlar yangilanmoqda'}
                    {next &&
                      dateParamForTimeZone(next.time, today.timezone) !== today.date &&
                      ' · ertaga'}
                  </span>
                </div>
                <div className="prayer-arc" aria-hidden="true">
                  <svg viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="58" fill="none" stroke="currentColor" strokeOpacity=".14" strokeWidth="8" />
                    <circle
                      cx="70"
                      cy="70"
                      r="58"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${Math.max(24, 364 - Math.min(364, (secondsLeft / (6 * 3600)) * 364))} 364`}
                      transform="rotate(-90 70 70)"
                    />
                  </svg>
                  <Navigation size={26} />
                </div>
              </div>
              <div className="prayer-next-footer">
                <span>
                  {next
                    ? dateLabelFromParam(dateParamForTimeZone(next.time, today.timezone))
                    : dateLabelFromParam(today.date)}
                </span>
                <span>{today.hijri}</span>
              </div>
            </section>

            <section className="qibla-card">
              <div className="qibla-head">
                <span className="eyebrow">Qibla</span>
                <span className="qibla-degree">{Math.round(qibla)}°</span>
              </div>
              <div className="qibla-compass">
                <div className="qibla-face">
                  <span className="qibla-north">N</span>
                  <span className="qibla-south">S</span>
                  <span className="qibla-east">E</span>
                  <span className="qibla-west">W</span>
                  <div className="qibla-needle" style={{ transform: `rotate(${qibla}deg)` }}>
                    <span className="qibla-kaaba">🕋</span>
                  </div>
                  <span className="qibla-center" />
                </div>
              </div>
              <p>
                Shimolga yuzlanib turing, so‘ngra kompasni {Math.round(qibla)}° ga burang —
                Makka tomon yo‘nalish shu.
              </p>
            </section>
          </div>

          <section className="prayer-times-card">
            <div className="prayer-times-head">
              <div>
                <span className="eyebrow">Bugungi vaqtlar</span>
                <h2>{settings.location.city}</h2>
              </div>
              <span className="prayer-method">Hisoblash usuli: {settings.calculationMethod}</span>
            </div>
            <div className="prayer-time-grid">
              {mainPrayerKeys.map((key: PrayerKey) => (
                <div
                  key={key}
                  className={`prayer-time-item${next?.key === key ? ' active' : ''}`}
                >
                  <span className="prayer-time-icon">
                    {key === 'Fajr' || key === 'Maghrib' ? (
                      <span className="prayer-dot-alt" />
                    ) : (
                      <span className="prayer-dot" />
                    )}
                  </span>
                  <div>
                    <strong>{prayerLabels[key]}</strong>
                    <span>{key}</span>
                  </div>
                  <em>{today.timings[key]}</em>
                  {next?.key === key && <span className="prayer-time-badge">keyingi</span>}
                </div>
              ))}
            </div>
            <div className="prayer-extra-row">
              {extraKeys.map((key) => (
                <span key={key}>
                  <strong>{prayerLabels[key]}</strong> {today.timings[key] || '—'}
                </span>
              ))}
              {tomorrow && (
                <span>
                  <strong>Ertaga Bomdod</strong> {tomorrow.timings.Fajr}
                </span>
              )}
            </div>
            <p className="prayer-note">
              <Info size={14} /> Vaqtlar Aladhan hisoblash xizmati asosida. Mahalliy masjid
              taqvimi bilan kichik farq bo‘lishi mumkin.
            </p>
          </section>
        </>
      ) : null}

      <section className="notifications-card">
        <div className="notifications-head">
          <div>
            <span className="eyebrow">Eslatmalar</span>
            <h2>Namoz vaqtini qanday bildiramiz?</h2>
            <p>O‘zingizga qulay usulni tanlang. Har doim o‘zgartirishingiz mumkin.</p>
          </div>
          <span className={`permission-chip ${permission}`}>
            {permission === 'granted'
              ? 'Bildirishnoma yoqilgan'
              : permission === 'denied'
                ? 'Ruxsat berilmagan'
                : permission === 'unsupported'
                  ? 'Qo‘llab-quvvatlanmaydi'
                  : 'Ruxsat so‘ralmagan'}
          </span>
        </div>

        <div className="notification-options">
          {notificationOptions.map((option) => {
            const active = settings.notificationMode === option.id
            return (
              <button
                type="button"
                key={option.id}
                className={`notification-option${active ? ' active' : ''}`}
                onClick={() => void changeNotificationMode(option.id)}
                aria-pressed={active}
              >
                <span className="notification-option-icon">
                  <option.icon size={20} />
                </span>
                <strong>{option.title}</strong>
                <p>{option.text}</p>
                {active && (
                  <span className="notification-check">
                    <Check size={14} /> Tanlangan
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="notification-actions">
          <button type="button" className="btn btn-soft btn-small" onClick={handleTestAdhan} disabled={testing}>
            {testing ? <RefreshCw size={15} className="spin" /> : <Play size={15} />}
            {testing ? 'Ijro etilmoqda...' : 'Azonni sinab ko‘rish'}
          </button>
          <button type="button" className="btn btn-soft btn-small" onClick={stopAdhan}>
            <VolumeX size={15} /> To‘xtatish
          </button>
          {settings.notificationMode !== 'none' && permission !== 'granted' && (
            <button
              type="button"
              className="btn btn-gold btn-small"
              onClick={async () => {
                const result = await requestNotifications()
                setPermission(result)
                if (result === 'denied') {
                  setTestMessage('Brauzer sozlamalarida bildirishnomaga ruxsat bering.')
                }
              }}
            >
              <BellRing size={15} /> Ruxsat so‘rash
            </button>
          )}
        </div>
        {testMessage && <p className="inline-note">{testMessage}</p>}
        <p className="notification-limit">
          <Info size={14} /> Brauzer bildirishnomalari ilova yoki sahifa ochiq turganda
          ishlaydi. Telefonda ilova sifatida o‘rnatib, fon rejimida ham eslatmalardan
          foydalanishingiz mumkin.
        </p>
      </section>

      <section className="calendar-section">
        <div className="calendar-head">
          <div>
            <span className="eyebrow">Oylik taqvim</span>
            <h2>Namoz vaqtlari jadvali</h2>
            <p>Butun oy uchun vaqtlarni ko‘ring va rejalashtiring.</p>
          </div>
          <button
            type="button"
            className="btn btn-soft btn-small"
            onClick={() => setShowCalendar((value) => !value)}
          >
            <CalendarDays size={15} />
            {showCalendar ? 'Jadvalni yashirish' : 'Oylik jadvalni ochish'}
          </button>
        </div>

        {showCalendar && (
          <>
            <div className="calendar-toolbar">
              <button type="button" className="icon-btn" onClick={() => changeMonth(-1)} aria-label="Oldingi oy">
                <ChevronLeft size={18} />
              </button>
              <strong>
                {uzMonths[calMonth - 1]} {calYear}
              </strong>
              <button type="button" className="icon-btn" onClick={() => changeMonth(1)} aria-label="Keyingi oy">
                <ChevronRight size={18} />
              </button>
            </div>
            {calendarLoading ? (
              <LoadingBlock label="Jadval yuklanmoqda..." />
            ) : calendarError ? (
              <ErrorBlock message={calendarError} onRetry={() => void loadCalendar()} />
            ) : calendar ? (
              <div className="calendar-table-wrap">
                <table className="calendar-table">
                  <thead>
                    <tr>
                      <th>Kun</th>
                      <th>Hafta kuni</th>
                      <th>Bomdod</th>
                      <th>Peshin</th>
                      <th>Asr</th>
                      <th>Shom</th>
                      <th>Xufton</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calendar.map((day) => {
                      const isToday = calYear === new Date().getFullYear() && calMonth === new Date().getMonth() + 1 && day.day === todayDateNumber
                      return (
                        <tr key={`${day.date}-${day.day}`} className={isToday ? 'today' : ''}>
                          <td>
                            <strong>{day.day}</strong>
                          </td>
                          <td>{weekdayMap[day.weekday] || day.weekday}</td>
                          <td>{day.timings.Fajr}</td>
                          <td>{day.timings.Dhuhr}</td>
                          <td>{day.timings.Asr}</td>
                          <td>{day.timings.Maghrib}</td>
                          <td>{day.timings.Isha}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
          </>
        )}
      </section>

      <p className="prayer-footer-note">
        <Compass size={14} /> Qibla yo‘nalishi shimoliy qutbga nisbatan hisoblangan. Aniqroq
        natija uchun telefon kompasidan foydalaning.
      </p>
    </div>
  )
}
