import type { LocationInfo, NextPrayer, PrayerDay, PrayerKey } from '../types'
import { readStorage, writeStorage } from './storage'

export const prayerLabels: Record<string, string> = {
  Fajr: 'Bomdod',
  Sunrise: 'Quyosh chiqishi',
  Dhuhr: 'Peshin',
  Asr: 'Asr',
  Maghrib: 'Shom',
  Isha: 'Xufton',
  Sunset: 'Quyosh botishi',
  Imsak: 'Saharlik',
  Midnight: 'Yarim tun',
}

export const prayerArabic: Record<string, string> = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
}

export const mainPrayerKeys: PrayerKey[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

export const calculationMethods = [
  { id: 3, name: 'Muslim World League (MWL)', note: 'O‘zbekiston uchun keng tarqalgan' },
  { id: 2, name: 'ISNA (Shimoliy Amerika)', note: 'Amerika va Kanada' },
  { id: 1, name: 'Karachi', note: 'Janubiy Osiyo' },
  { id: 4, name: 'Umm al-Qura, Makka', note: 'Saudiya Arabistoni' },
  { id: 5, name: 'Misr umumiy muassasasi', note: 'Misr' },
  { id: 13, name: 'Diyanet (Turkiya)', note: 'Turkiya' },
  { id: 16, name: 'Dubay', note: 'BAA' },
  { id: 23, name: 'Moonsighting Committee', note: 'Xalqaro' },
]

const hijriMonthsUz: Record<string, string> = {
  muharram: 'Muharram',
  safar: 'Safar',
  'rabi al-awwal': 'Rabiul avval',
  'rabi al-thani': 'Rabiul soniy',
  'jumada al-ula': 'Jumadul ula',
  'jumada al-akhirah': 'Jumadul oxira',
  rajab: 'Rajab',
  "sha'ban": 'Sha’bon',
  ramadan: 'Ramazon',
  shawwal: 'Shavvol',
  "dhu al-qi'dah": 'Zulqa’da',
  'dhu al-hijjah': 'Zulhijja',
}

function normalizeHijriMonth(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

const cacheKey = (location: LocationInfo, method: number, school: number, date: string) =>
  `nur-prayer:${date}:${location.lat.toFixed(4)}:${location.lon.toFixed(4)}:${method}:${school}`

interface ZonedParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
  weekday?: string
}

function partsInTimeZone(date: Date, timeZone: string): ZonedParts {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  const parts = formatter.formatToParts(date)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value || 0)
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
  }
}

export function dateParamForTimeZone(date: Date, timeZone: string): string {
  const p = partsInTimeZone(date, timeZone)
  return `${String(p.day).padStart(2, '0')}-${String(p.month).padStart(2, '0')}-${p.year}`
}

export function localDateLabel(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`
}

export function addDaysInTimeZone(date: Date, timeZone: string, days: number): Date {
  const p = partsInTimeZone(date, timeZone)
  const target = new Date(Date.UTC(p.year, p.month - 1, p.day + days, 12, 0, 0))
  return zonedTimeToDate(
    target.getUTCFullYear(),
    target.getUTCMonth() + 1,
    target.getUTCDate(),
    12,
    0,
    timeZone,
  )
}

export function zonedTimeToDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const desiredUtc = Date.UTC(year, month - 1, day, hour, minute, 0)
  let timestamp = desiredUtc
  for (let i = 0; i < 4; i += 1) {
    const p = partsInTimeZone(new Date(timestamp), timeZone)
    const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
    const diff = asUtc - desiredUtc
    if (diff === 0) break
    timestamp -= diff
  }
  return new Date(timestamp)
}

export function prayerDate(day: PrayerDay, key: string): Date {
  const [d, m, y] = day.date.split('-').map(Number)
  const [h, min] = (day.timings[key] || '00:00').split(':').map(Number)
  return zonedTimeToDate(y, m, d, h, min, day.timezone)
}

export function formatHijri(raw: any): string {
  const hijri = raw?.hijri
  if (!hijri) return ''
  const monthEn = String(hijri.month?.en || '')
  const month = hijriMonthsUz[normalizeHijriMonth(monthEn)] || monthEn
  const year = hijri.year || ''
  const day = hijri.day || ''
  return `${day} ${month} ${year} hijriy`
}

export async function fetchPrayerDay(
  location: LocationInfo,
  method: number,
  school: number,
  date = new Date(),
): Promise<PrayerDay> {
  const timezone = location.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  const dateParam = dateParamForTimeZone(date, timezone)
  const saved = readStorage<PrayerDay | null>(
    cacheKey(location, method, school, dateParam),
    null,
  )
  if (saved && Date.now() - saved.fetchedAt < 1000 * 60 * 60 * 6) return saved

  const url = new URL(`https://api.aladhan.com/v1/timings/${dateParam}`)
  url.searchParams.set('latitude', String(location.lat))
  url.searchParams.set('longitude', String(location.lon))
  url.searchParams.set('method', String(method))
  url.searchParams.set('school', String(school))

  try {
    const res = await fetch(url.toString())
    if (!res.ok) throw new Error(`Namoz vaqti API xatosi (${res.status})`)
    const json = await res.json()
    if (!json?.data?.timings) throw new Error('Namoz vaqti ma’lumoti topilmadi')
    const t = json.data.timings
    const timings: Record<string, string> = {}
    for (const key of ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Sunset', 'Isha', 'Imsak', 'Midnight']) {
      if (typeof t[key] === 'string') timings[key] = t[key].slice(0, 5)
    }
    const day: PrayerDay = {
      date: dateParam,
      dateLabel: dateParam,
      hijri: formatHijri(json.data.date),
      timezone: json.data.meta?.timezone || timezone,
      timings,
      fetchedAt: Date.now(),
    }
    writeStorage(cacheKey(location, method, school, dateParam), day)
    return day
  } catch (error) {
    if (saved) return saved
    throw error
  }
}

export function findNextPrayer(
  today: PrayerDay | null,
  tomorrow: PrayerDay | null,
  now = new Date(),
): NextPrayer | null {
  if (today) {
    for (const key of mainPrayerKeys) {
      const time = prayerDate(today, key)
      if (time.getTime() > now.getTime()) return { key, time }
    }
  }
  if (tomorrow) {
    const time = prayerDate(tomorrow, 'Fajr')
    return { key: 'Fajr', time }
  }
  return null
}

export function nextPrayerLabel(key: string) {
  return prayerLabels[key] || key
}

export interface CalendarDay {
  date: string
  day: number
  weekday: string
  hijri: string
  timings: Record<string, string>
}

export async function fetchMonthlyCalendar(
  location: LocationInfo,
  method: number,
  school: number,
  year: number,
  month: number,
): Promise<CalendarDay[]> {
  const url = new URL(`https://api.aladhan.com/v1/calendar/${year}/${month}`)
  url.searchParams.set('latitude', String(location.lat))
  url.searchParams.set('longitude', String(location.lon))
  url.searchParams.set('method', String(method))
  url.searchParams.set('school', String(school))
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Kalendar API xatosi (${res.status})`)
  const json = await res.json()
  if (!Array.isArray(json?.data)) throw new Error('Kalendar ma’lumoti topilmadi')
  return json.data.map((item: any) => ({
    date:
      item.date?.gregorian?.date ||
      [item.date?.gregorian?.day, item.date?.gregorian?.month?.number, item.date?.gregorian?.year]
        .map((value: number | undefined) => String(value ?? '').padStart(2, '0'))
        .join('-'),
    day: Number(item.date?.gregorian?.day || 0),
    weekday: item.date?.gregorian?.weekday?.en || '',
    hijri: formatHijri(item.date),
    timings: Object.fromEntries(
      ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((key) => [
        key,
        String(item.timings?.[key] || '').slice(0, 5),
      ]),
    ),
  }))
}

export function qiblaBearing(lat: number, lon: number): number {
  const kaabaLat = 21.4225
  const kaabaLon = 39.8262
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const toDeg = (rad: number) => (rad * 180) / Math.PI
  const dLon = toRad(kaabaLon - lon)
  const y = Math.sin(dLon)
  const x =
    Math.cos(toRad(lat)) * Math.tan(toRad(kaabaLat)) -
    Math.sin(toRad(lat)) * Math.cos(dLon)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

export function currentSecondsToNext(next: NextPrayer | null, now = new Date()): number {
  if (!next) return 0
  return Math.max(0, Math.floor((next.time.getTime() - now.getTime()) / 1000))
}
