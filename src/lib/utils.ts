export function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

export function pad3(value: number | string) {
  return String(value).padStart(3, '0')
}

export const uzMonths = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentabr',
  'oktabr',
  'noyabr',
  'dekabr',
]

export const uzWeekdays = [
  'yakshanba',
  'dushanba',
  'seshanba',
  'chorshanba',
  'payshanba',
  'juma',
  'shanba',
]

export function formatUzDate(date: Date) {
  return `${date.getDate()}-${uzMonths[date.getMonth()]}, ${date.getFullYear()}, ${uzWeekdays[date.getDay()]}`
}

export function formatUzShortDate(date: Date) {
  return `${date.getDate()} ${uzMonths[date.getMonth()]}`
}

export function formatClock(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function formatClockInTimeZone(date: Date, timeZone?: string) {
  if (!timeZone) return formatClock(date)
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(date)
    const get = (type: string) => parts.find((part) => part.type === type)?.value || '00'
    return `${get('hour')}:${get('minute')}`
  } catch {
    return formatClock(date)
  }
}

export function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}

export function formatCountdown(seconds: number) {
  if (seconds <= 0) return 'hozir'
  const total = Math.floor(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h} soat ${m} daqiqa`
  if (m > 0) return `${m} daqiqa ${s} soniya`
  return `${s} soniya`
}

export function formatCountdownShort(seconds: number) {
  if (seconds <= 0) return '00:00'
  const total = Math.floor(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function haptic(pattern: number | number[] = 8) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    // ignore
  }
}

export function pluralAyah(count: number) {
  return `${count} oyat`
}

export function ayahLabel(surah: number, ayah: number) {
  return `${surah}:${ayah}`
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function shareText(title: string, text: string) {
  if (navigator.share) {
    navigator.share({ title, text }).catch(() => undefined)
    return
  }
  copyText(text)
}

export function getDailyIndex(length: number) {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const day = Math.floor((now.getTime() - start.getTime()) / 86_400_000)
  return ((day % length) + length) % length
}
