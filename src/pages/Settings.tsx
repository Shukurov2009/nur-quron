import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  Check,
  Cloud,
  Download,
  Info,
  Languages,
  Loader2,
  LocateFixed,
  LogOut,
  Mail,
  MapPin,
  Palette,
  Play,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Sun,
  UserRound,
  Volume2,
  VolumeX,
} from 'lucide-react'
import type { NotificationMode, ThemeMode } from '../types'
import { cities } from '../data/cities'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { usePrayer } from '../context/PrayerContext'
import { usePlayer } from '../context/PlayerContext'
import { calculationMethods } from '../lib/prayer'
import { notificationPermission } from '../lib/notifications'

const themes: Array<{ id: ThemeMode; label: string }> = [
  { id: 'dark', label: 'Tungi' },
  { id: 'light', label: 'Yorug‘' },
  { id: 'system', label: 'Tizim' },
]

const notificationModes: Array<{ id: NotificationMode; label: string; icon: typeof Bell }> = [
  { id: 'adhan', label: 'Azon', icon: Volume2 },
  { id: 'silent', label: 'Jim', icon: Bell },
  { id: 'none', label: 'O‘chiq', icon: VolumeX },
]

const rateOptions = [0.75, 1, 1.25, 1.5]

const syncLabels: Record<string, string> = {
  local: 'Faqat ushbu qurilmada',
  syncing: 'Bulutdan yuklanmoqda...',
  synced: 'Bulut bilan sinxronlangan',
  pending: 'Saqlanmoqda...',
  error: 'Sinxronlash xatosi',
}

function SwitchRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="switch-row">
      <span>
        <strong>{title}</strong>
        <p>{description}</p>
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="switch-track" aria-hidden="true">
        <span />
      </span>
    </label>
  )
}

export function SettingsPage() {
  const { settings, updateSettings, setLocation, resetSettings, syncStatus, syncError } = useSettings()
  const { user, loading: authLoading, configured, signIn, signUp, signOut } = useAuth()
  const { requestNotifications, testAdhan, stopAdhan } = usePrayer()
  const player = usePlayer()

  const [permission, setPermission] = useState(() => notificationPermission())
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMessage, setAuthMessage] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [testMessage, setTestMessage] = useState<string | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    setPermission(notificationPermission())
    setInstalled(
      window.matchMedia('(display-mode: standalone)').matches ||
        Boolean((navigator as Navigator & { standalone?: boolean }).standalone),
    )
  }, [])

  const updatePlaybackRate = (value: number) => {
    updateSettings({ playbackRate: value })
    player.setRate(value)
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

  const requestGps = () => {
    if (!navigator.geolocation) {
      setGeoError('Brauzeringiz joylashuvni qo‘llab-quvvatlamaydi.')
      return
    }
    setLocating(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          city: 'Mening joylashuvim',
          country: 'GPS orqali aniqlandi',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          source: 'gps',
        })
        setLocating(false)
      },
      () => {
        setLocating(false)
        setGeoError('Joylashuvni aniqlab bo‘lmadi. Shaharni qo‘lda tanlang.')
      },
      { enableHighAccuracy: true, timeout: 15000 },
    )
  }

  const changeMode = async (mode: NotificationMode) => {
    updateSettings({ notificationMode: mode })
    if (mode !== 'none') {
      const result = await requestNotifications()
      setPermission(result)
    }
  }

  const handleTest = async () => {
    setTestMessage(null)
    if (settings.notificationMode === 'none') {
      updateSettings({ notificationMode: 'adhan' })
    }
    const ok = await testAdhan()
    setTestMessage(ok ? 'Azon ijro etilmoqda.' : 'Azonni ijro etib bo‘lmadi.')
  }

  const submitAuth = async (event: FormEvent) => {
    event.preventDefault()
    setAuthError(null)
    setAuthMessage(null)
    if (!email.trim() || password.length < 6) {
      setAuthError('Email kiriting va kamida 6 belgili parol tanlang.')
      return
    }
    setSubmitting(true)
    try {
      if (authMode === 'signup') {
        const result = await signUp(email.trim(), password)
        if (result.error) {
          setAuthError(result.error)
        } else if (result.needsConfirmation) {
          setAuthMessage('Ro‘yxatdan o‘tdingiz. Emailingizga yuborilgan tasdiqlash havolasini bosing.')
        } else {
          setAuthMessage('Hisob yaratildi va tizimga kirdingiz.')
          setPassword('')
        }
      } else {
        const result = await signIn(email.trim(), password)
        if (result.error) setAuthError(result.error)
        else setPassword('')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const savedCity = cities.find(
    (city) =>
      Math.abs(city.lat - settings.location.lat) < 0.02 &&
      Math.abs(city.lon - settings.location.lon) < 0.02,
  )

  const resetAll = () => {
    const confirmed = window.confirm(
      'Barcha sozlamalar, yodlash progressi va saqlangan oyatlar o‘chiriladi. Davom etasizmi?',
    )
    if (!confirmed) return
    resetSettings()
    setTestMessage(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="page settings-page">
      <header className="page-head">
        <div>
          <span className="eyebrow">
            <Palette size={14} /> Sozlamalar
          </span>
          <h1>Ilovani o‘zingizga moslang</h1>
          <p>
            Ko‘rinish, tarjima, joylashuv, bildirishnomalar va akkauntni boshqaring. Barcha
            sozlamalar qurilmada saqlanadi.
          </p>
        </div>
      </header>

      <div className="settings-grid">
        <section className="settings-card">
          <div className="settings-card-head">
            <span className="settings-icon">
              <Sun size={20} />
            </span>
            <div>
              <h2>Ko‘rinish</h2>
              <p>Mavzu va matn alifbosi</p>
            </div>
          </div>

          <div className="setting-block">
            <span className="setting-label">Mavzu</span>
            <div className="segmented wide">
              {themes.map((theme) => (
                <button
                  type="button"
                  key={theme.id}
                  className={settings.theme === theme.id ? 'active' : ''}
                  onClick={() => updateSettings({ theme: theme.id })}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>

          <div className="setting-block">
            <span className="setting-label">
              <Languages size={15} /> Tarjima alifbosi
            </span>
            <div className="segmented wide">
              <button
                type="button"
                className={settings.script === 'latin' ? 'active' : ''}
                onClick={() => updateSettings({ script: 'latin' })}
              >
                Lotin
              </button>
              <button
                type="button"
                className={settings.script === 'cyrillic' ? 'active' : ''}
                onClick={() => updateSettings({ script: 'cyrillic' })}
              >
                Кирилл
              </button>
            </div>
          </div>

          <SwitchRow
            title="Tarjimani ko‘rsatish"
            description="Oyat ostida o‘zbekcha tarjima chiqadi."
            checked={settings.showTranslation}
            onChange={(value) => updateSettings({ showTranslation: value })}
          />
          <SwitchRow
            title="Qiroatga ergashish"
            description="Tinglayotganda faol oyatga avtomatik o‘tish."
            checked={settings.autoScroll}
            onChange={(value) => updateSettings({ autoScroll: value })}
          />
        </section>

        <section className="settings-card">
          <div className="settings-card-head">
            <span className="settings-icon">
              <Volume2 size={20} />
            </span>
            <div>
              <h2>Audio</h2>
              <p>Tezlik va azon ovozi</p>
            </div>
          </div>

          <div className="setting-block">
            <span className="setting-label">Ijro tezligi</span>
            <div className="segmented wide">
              {rateOptions.map((rate) => (
                <button
                  type="button"
                  key={rate}
                  className={settings.playbackRate === rate ? 'active' : ''}
                  onClick={() => updatePlaybackRate(rate)}
                >
                  {rate}×
                </button>
              ))}
            </div>
          </div>

          <div className="setting-block">
            <span className="setting-label">Azon ovozi balandligi</span>
            <div className="volume-row">
              <VolumeX size={16} />
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.adhanVolume}
                onChange={(event) => updateSettings({ adhanVolume: Number(event.target.value) })}
                aria-label="Azon ovozi balandligi"
              />
              <Volume2 size={16} />
              <span>{Math.round(settings.adhanVolume * 100)}%</span>
            </div>
          </div>

          <div className="setting-actions">
            <button type="button" className="btn btn-soft btn-small" onClick={() => void handleTest()}>
              <Play size={15} /> Azonni sinash
            </button>
            <button type="button" className="btn btn-soft btn-small" onClick={stopAdhan}>
              <VolumeX size={15} /> To‘xtatish
            </button>
          </div>
          {testMessage && <p className="inline-note">{testMessage}</p>}
        </section>

        <section className="settings-card">
          <div className="settings-card-head">
            <span className="settings-icon">
              <MapPin size={20} />
            </span>
            <div>
              <h2>Joylashuv va namoz</h2>
              <p>Shahar, hisoblash usuli, mazhab</p>
            </div>
          </div>

          <div className="setting-block">
            <span className="setting-label">Shahar</span>
            <select
              value={savedCity?.id || (settings.location.source === 'gps' ? 'gps' : '')}
              onChange={(event) => chooseCity(event.target.value)}
            >
              <option value="" disabled>
                Shaharni tanlang
              </option>
              {settings.location.source === 'gps' && <option value="gps">Mening joylashuvim</option>}
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name} — {city.country}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-soft btn-small"
              onClick={requestGps}
              disabled={locating}
            >
              {locating ? <Loader2 size={15} className="spin" /> : <LocateFixed size={15} />}
              {locating ? 'Aniqlanmoqda...' : 'GPS orqali aniqlash'}
            </button>
            {geoError && <p className="inline-error">{geoError}</p>}
          </div>

          <div className="setting-block">
            <span className="setting-label">Hisoblash usuli</span>
            <select
              value={settings.calculationMethod}
              onChange={(event) => updateSettings({ calculationMethod: Number(event.target.value) })}
            >
              {calculationMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name} — {method.note}
                </option>
              ))}
            </select>
          </div>

          <div className="setting-block">
            <span className="setting-label">Asr vaqti (mazhab)</span>
            <div className="segmented wide">
              <button
                type="button"
                className={settings.asrSchool === 1 ? 'active' : ''}
                onClick={() => updateSettings({ asrSchool: 1 })}
              >
                Hanafiy
              </button>
              <button
                type="button"
                className={settings.asrSchool === 0 ? 'active' : ''}
                onClick={() => updateSettings({ asrSchool: 0 })}
              >
                Shofeiy / standart
              </button>
            </div>
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-card-head">
            <span className="settings-icon">
              <Bell size={20} />
            </span>
            <div>
              <h2>Bildirishnomalar</h2>
              <p>Namoz vaqti eslatmalari</p>
            </div>
          </div>

          <div className="setting-block">
            <span className="setting-label">Rejim</span>
            <div className="notification-options compact">
              {notificationModes.map((mode) => (
                <button
                  type="button"
                  key={mode.id}
                  className={`notification-option${settings.notificationMode === mode.id ? ' active' : ''}`}
                  onClick={() => void changeMode(mode.id)}
                  aria-pressed={settings.notificationMode === mode.id}
                >
                  <span className="notification-option-icon">
                    <mode.icon size={18} />
                  </span>
                  <strong>{mode.label}</strong>
                  {settings.notificationMode === mode.id && (
                    <span className="notification-check">
                      <Check size={13} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="permission-row">
            <span className={`permission-chip ${permission}`}>
              {permission === 'granted'
                ? 'Brauzer ruxsati berilgan'
                : permission === 'denied'
                  ? 'Ruxsat berilmagan'
                  : permission === 'unsupported'
                    ? 'Qo‘llab-quvvatlanmaydi'
                    : 'Ruxsat so‘ralmagan'}
            </span>
            {permission !== 'granted' && permission !== 'unsupported' && (
              <button
                type="button"
                className="btn btn-gold btn-small"
                onClick={async () => {
                  const result = await requestNotifications()
                  setPermission(result)
                }}
              >
                Ruxsat so‘rash
              </button>
            )}
          </div>

          <p className="notification-limit">
            <Info size={14} /> Brauzer eslatmalari sahifa ochiq turganda ishlaydi. To‘liq fon
            rejimi uchun ilovani telefonga o‘rnating.
          </p>
        </section>

        <section className="settings-card account-card">
          <div className="settings-card-head">
            <span className="settings-icon">
              <UserRound size={20} />
            </span>
            <div>
              <h2>Akkaunt va sinxronlash</h2>
              <p>Progressni qurilmalar orasida saqlash</p>
            </div>
          </div>

          {!configured ? (
            <div className="account-setup">
              <p>
                Bulutli sinxronlash hozircha sozlanmagan. Ilova to‘liq ishlaydi va barcha
                progress qurilmada saqlanadi. Akkauntni yoqish uchun Supabase kalitlarini
                qo‘shing:
              </p>
              <pre>{`VITE_SUPABASE_URL=https://xxxx.supabase.co\nVITE_SUPABASE_ANON_KEY=...`}</pre>
              <p className="muted small">
                Batafsil SQL va sozlash yo‘riqnomasi README faylida. Kalitlar qo‘shilgach,
                saytni qayta yig‘ib joylashtiring.
              </p>
            </div>
          ) : authLoading ? (
            <div className="account-loading">
              <Loader2 size={18} className="spin" /> Akkaunt tekshirilmoqda...
            </div>
          ) : user ? (
            <div className="account-signed">
              <div className="account-identity">
                <span className="account-avatar">
                  {(user.email || 'N').charAt(0).toUpperCase()}
                </span>
                <div>
                  <strong>{user.email}</strong>
                  <span className={`sync-status ${syncStatus}`}>
                    <Cloud size={13} /> {syncLabels[syncStatus]}
                  </span>
                </div>
              </div>
              {syncError && <p className="inline-error">{syncError}</p>}
              <button type="button" className="btn btn-soft btn-small" onClick={() => void signOut()}>
                <LogOut size={15} /> Chiqish
              </button>
            </div>
          ) : (
            <form className="auth-form" onSubmit={submitAuth}>
              <div className="auth-tabs">
                <button
                  type="button"
                  className={authMode === 'signin' ? 'active' : ''}
                  onClick={() => {
                    setAuthMode('signin')
                    setAuthError(null)
                    setAuthMessage(null)
                  }}
                >
                  Kirish
                </button>
                <button
                  type="button"
                  className={authMode === 'signup' ? 'active' : ''}
                  onClick={() => {
                    setAuthMode('signup')
                    setAuthError(null)
                    setAuthMessage(null)
                  }}
                >
                  Ro‘yxatdan o‘tish
                </button>
              </div>
              <label className="auth-field">
                <Mail size={16} />
                <input
                  type="email"
                  placeholder="Email manzilingiz"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              <label className="auth-field">
                <ShieldCheck size={16} />
                <input
                  type="password"
                  placeholder="Parol (kamida 6 belgi)"
                  autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                />
              </label>
              <button type="submit" className="btn btn-gold btn-wide" disabled={submitting}>
                {submitting ? <Loader2 size={16} className="spin" /> : <UserRound size={16} />}
                {authMode === 'signup' ? 'Hisob yaratish' : 'Kirish'}
              </button>
              {authError && <p className="inline-error">{authError}</p>}
              {authMessage && <p className="inline-success">{authMessage}</p>}
              <p className="auth-note">
                Akkauntga kirganingizda yodlash progressi, saqlangan oyatlar va sozlamalar
                xavfsiz bulutga zaxiralanadi.
              </p>
            </form>
          )}
        </section>

        <section className="settings-card">
          <div className="settings-card-head">
            <span className="settings-icon">
              <Smartphone size={20} />
            </span>
            <div>
              <h2>Telefonga o‘rnatish</h2>
              <p>PWA ilova sifatida foydalanish</p>
            </div>
          </div>
          {installed ? (
            <p className="inline-success">
              <Check size={15} /> Nur allaqachon ilova sifatida o‘rnatilgan.
            </p>
          ) : (
            <div className="install-guide">
              <div>
                <Download size={18} />
                <div>
                  <strong>Android (Chrome)</strong>
                  <p>Menyu → «Ilovani o‘rnatish» yoki «Bosh ekranga qo‘shish».</p>
                </div>
              </div>
              <div>
                <Download size={18} />
                <div>
                  <strong>iPhone (Safari)</strong>
                  <p>Ulashish tugmasi → «Bosh ekranga qo‘shish».</p>
                </div>
              </div>
              <div>
                <Download size={18} />
                <div>
                  <strong>Kompyuter</strong>
                  <p>Manzil qatori yonidagi o‘rnatish belgisini bosing.</p>
                </div>
              </div>
            </div>
          )}
          <Link to="/yuklab-olish" className="btn btn-soft btn-small install-apk-link">
            <Download size={15} /> Android APK yuklab olish
          </Link>
        </section>

        <section className="settings-card danger-card">
          <div className="settings-card-head">
            <span className="settings-icon">
              <RotateCcw size={20} />
            </span>
            <div>
              <h2>Ma’lumotlarni tozalash</h2>
              <p>Barcha progressni nolga qaytarish</p>
            </div>
          </div>
          <p>
            Sozlamalar, yodlangan oyatlar, saqlangan oyatlar va oxirgi o‘qilgan joy
            o‘chiriladi. Bu amalni qaytarib bo‘lmaydi.
          </p>
          <button type="button" className="btn btn-danger btn-small" onClick={resetAll}>
            <RotateCcw size={15} /> Hammasini tozalash
          </button>
          <p className="muted small">
            Qur’on matni va audio serverdan yuklanadi, ular o‘chirilmaydi.
          </p>
        </section>
      </div>

      <footer className="settings-footer">
        <div className="footer-brand">
          <strong>Nur</strong>
          <span>Qur’on va namoz yo‘ldoshi · 1.0.0</span>
        </div>
        <p>
          Qur’on matni: Tanzil Uthmani · Tarjima: Muhammad Sodiq Muhammad Yusuf · Qiroat:
          Mishary Rashid Alafasy · Namoz vaqtlari: Aladhan.
        </p>
        <p className="muted small">Ma’lumotlar brauzeringizda saqlanadi.</p>
      </footer>
    </div>
  )
}
