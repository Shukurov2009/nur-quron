import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Bell,
  BookOpen,
  BookOpenCheck,
  CalendarClock,
  GraduationCap,
  Home,
  Settings,
  Sparkles,
  X,
} from 'lucide-react'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'
import { ScriptToggle } from './ScriptToggle'
import { AudioDock } from './AudioDock'
import { usePrayer } from '../context/PrayerContext'
import { useSettings } from '../context/SettingsContext'
import { formatCountdownShort, formatClockInTimeZone } from '../lib/utils'
import { nextPrayerLabel } from '../lib/prayer'
import { NOTIFICATION_EVENT } from '../lib/notifications'

const navItems = [
  { to: '/', label: 'Asosiy', icon: Home, end: true },
  { to: '/quron', label: 'Qur’on', icon: BookOpen },
  { to: '/yodlash', label: 'Yodlash', icon: BrainIcon },
  { to: '/alifbo', label: 'Alifbo', icon: GraduationCap },
  { to: '/namoz', label: 'Namoz', icon: CalendarClock },
  { to: '/namozni-organish', label: 'O‘rganish', icon: BookOpenCheck },
  { to: '/sozlamalar', label: 'Sozlamalar', icon: Settings },
]

function BrainIcon(props: { size?: number }) {
  return <Sparkles {...props} />
}

function NextPrayerChip() {
  const { next, today, secondsLeft } = usePrayer()
  if (!next) return null
  return (
    <Link to="/namoz" className="sidebar-prayer">
      <span className="sidebar-prayer-icon">
        <Bell size={16} />
      </span>
      <span>
        <small>Keyingi namoz</small>
        <strong>
          {nextPrayerLabel(next.key)} · {formatClockInTimeZone(next.time, today?.timezone)}
        </strong>
      </span>
      <em>{formatCountdownShort(secondsLeft)}</em>
    </Link>
  )
}

interface ToastItem {
  id: number
  title: string
  body: string
}

function NotificationToast() {
  const [items, setItems] = useState<ToastItem[]>([])
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ title: string; body: string }>).detail
      if (!detail) return
      const id = Date.now()
      setItems((current) => [...current.slice(-2), { id, ...detail }])
      window.setTimeout(() => {
        setItems((current) => current.filter((item) => item.id !== id))
      }, 9000)
    }
    window.addEventListener(NOTIFICATION_EVENT, handler)
    return () => window.removeEventListener(NOTIFICATION_EVENT, handler)
  }, [])
  if (!items.length) return null
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {items.map((item) => (
        <div className="toast" key={item.id}>
          <span className="toast-icon">
            <Bell size={18} />
          </span>
          <div>
            <strong>{item.title}</strong>
            <p>{item.body}</p>
          </div>
          <button
            type="button"
            className="toast-close"
            onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}
            aria-label="Yopish"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}

function ScrollToTop() {
  const location = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [location.pathname])
  return null
}

function MobileBottomNav() {
  const items = useMemo(() => navItems.filter((item) => item.to !== '/namozni-organish'), [])
  return (
    <nav className="bottom-nav" aria-label="Asosiy navigatsiya">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
        >
          <item.icon size={19} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export function Layout() {
  const { settings } = useSettings()
  const location = useLocation()
  const isReader = location.pathname.startsWith('/quron/')

  return (
    <div className="app-shell">
      <ScrollToTop />
      <aside className="sidebar">
        <Link to="/" className="sidebar-logo" aria-label="Nur bosh sahifa">
          <Logo />
        </Link>
        <nav className="sidebar-nav" aria-label="Bo‘limlar">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <item.icon size={19} />
              <span>{item.label}</span>
              {item.to === '/yodlash' && <span className="nav-badge">yangi</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <NextPrayerChip />
        <div className="sidebar-tools">
          <ThemeToggle />
          <ScriptToggle />
        </div>
        <div className="sidebar-footer">
          <span>Mishary Rashid Alafasy</span>
          <small>Qiroat · 128 kbps</small>
        </div>
      </aside>

      <div className="main-wrap">
        <header className="mobile-header">
          <Link to="/" aria-label="Bosh sahifa">
            <Logo />
          </Link>
          <div className="mobile-header-actions">
            <ScriptToggle compact />
            <ThemeToggle compact />
            <Link to="/sozlamalar" className="icon-btn" aria-label="Sozlamalar">
              <Settings size={18} />
            </Link>
          </div>
        </header>

        <main className={isReader ? 'content reader-content' : 'content'}>
          <Outlet />
        </main>
      </div>

      <AudioDock />
      <MobileBottomNav />
      <NotificationToast />
      {!settings.onboarded && <span className="sr-only">Nur</span>}
    </div>
  )
}
