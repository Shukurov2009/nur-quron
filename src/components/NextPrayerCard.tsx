import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, MapPin } from 'lucide-react'
import { usePrayer } from '../context/PrayerContext'
import { formatClockInTimeZone, formatCountdownShort, formatUzDate } from '../lib/utils'
import { dateParamForTimeZone, nextPrayerLabel, prayerLabels } from '../lib/prayer'

export function NextPrayerCard({ compact = false }: { compact?: boolean }) {
  const { next, secondsLeft, today, location, loading } = usePrayer()

  if (loading && !next) {
    return (
      <div className="next-prayer-card skeleton-card">
        <span className="skeleton-line short" />
        <span className="skeleton-line" />
        <span className="skeleton-line medium" />
      </div>
    )
  }

  if (!next || !today) {
    return (
      <div className="next-prayer-card">
        <span className="eyebrow">Namoz vaqti</span>
        <h3>Vaqtlar yuklanmadi</h3>
        <p className="muted">Internet aloqasini tekshirib, qayta urinib ko‘ring.</p>
        <Link to="/namoz" className="btn btn-soft btn-small">
          Namoz bo‘limi
        </Link>
      </div>
    )
  }

  const ringProgress = 1 - Math.min(secondsLeft, 6 * 3600) / (6 * 3600)
  const currentLabel = nextPrayerLabel(next.key)
  const remaining = formatCountdownShort(secondsLeft)
  const nextDateParam = dateParamForTimeZone(next.time, today.timezone)
  const [dayPart, monthPart, yearPart] = nextDateParam.split('-').map(Number)
  const dateLabel = `${formatUzDate(new Date(yearPart, monthPart - 1, dayPart))}${
    nextDateParam !== today.date ? ' · ertaga' : ''
  }`

  return (
    <Link to="/namoz" className={`next-prayer-card${compact ? ' compact' : ''}`}>
      <div className="next-prayer-top">
        <span className="eyebrow">
          <span className="live-dot" /> Keyingi namoz
        </span>
        <span className="next-prayer-place">
          <MapPin size={12} /> {location.city}
        </span>
      </div>
      <div className="next-prayer-main">
        <div>
          <h3>{currentLabel}</h3>
          <p className="next-prayer-time">
            {formatClockInTimeZone(next.time, today.timezone)}
          </p>
          <p className="next-prayer-date">{dateLabel}</p>
        </div>
        <div
          className="prayer-ring"
          style={{ '--ring': `${Math.round(ringProgress * 100)}%` } as CSSProperties}
          aria-hidden="true"
        >
          <div>
            <strong>{remaining}</strong>
            <span>qoldi</span>
          </div>
        </div>
      </div>
      <div className="next-prayer-footer">
        <span>
          {prayerLabels.Fajr} {today.timings.Fajr} · {prayerLabels.Maghrib} {today.timings.Maghrib}
        </span>
        <span className="open-link">
          Barchasi <ArrowUpRight size={14} />
        </span>
      </div>
    </Link>
  )
}
