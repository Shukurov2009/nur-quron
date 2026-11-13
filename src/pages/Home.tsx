import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  CalendarClock,
  Download,
  GraduationCap,
  Headphones,
  Play,
  Sparkles,
  Star,
} from 'lucide-react'
import type { DailyAyah, SurahMeta } from '../types'
import { loadDailyAyahs, loadSurahIndex } from '../lib/quran'
import { getDailyIndex, formatUzDate } from '../lib/utils'
import { useSettings } from '../context/SettingsContext'
import { usePlayer } from '../context/PlayerContext'
import { usePrayer } from '../context/PrayerContext'
import { NextPrayerCard } from '../components/NextPrayerCard'
import { SurahCard } from '../components/SurahCard'
import { SectionHeading, LoadingBlock, ErrorBlock } from '../components/SectionHeading'
import { InstallPrompt } from '../components/InstallPrompt'

const features = [
  {
    to: '/quron',
    icon: BookOpen,
    title: 'Qur’on',
    text: '114 sura, oyatma-oyat tarjima va Mishary Rashid Alafasy qiroati.',
    accent: 'green',
  },
  {
    to: '/yodlash',
    icon: GraduationCap,
    title: 'Yodlash zanjiri',
    text: '1, 2, 1–2, 3, 1–2–3… Har oyatni avvalgilar bilan birga takrorlang.',
    accent: 'gold',
  },
  {
    to: '/alifbo',
    icon: Sparkles,
    title: 'Alifbodan boshlash',
    text: 'Harf tanimaydiganlar uchun tovush, shakl va mashqlar bilan darslar.',
    accent: 'blue',
  },
  {
    to: '/namoz',
    icon: CalendarClock,
    title: 'Namoz vaqtlari',
    text: 'Joylashuvingizga qarab vaqtlar, azon yoki jim bildirishnoma tanlovi.',
    accent: 'gold',
  },
  {
    to: '/namozni-organish',
    icon: BookOpenCheck,
    title: 'Namoz o‘rganish',
    text: 'Tahorat, namoz harakatlari, duolar — qadam-baqadam qo‘llanma.',
    accent: 'green',
  },
  {
    to: '/quron',
    icon: Headphones,
    title: 'Tinglash',
    text: 'Oyatni takrorlab tinglang, tezlikni o‘zgartiring, o‘qishni davom ettiring.',
    accent: 'blue',
  },
]

export function HomePage() {
  const { settings, setLastRead } = useSettings()
  const player = usePlayer()
  const { today } = usePrayer()
  const [surahs, setSurahs] = useState<SurahMeta[]>([])
  const [daily, setDaily] = useState<DailyAyah | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    Promise.all([loadSurahIndex(), loadDailyAyahs()])
      .then(([index, dailyAyahs]) => {
        if (!alive) return
        setSurahs(index)
        setDaily(dailyAyahs[getDailyIndex(dailyAyahs.length)])
      })
      .catch((reason) => {
        if (alive) setError(String(reason?.message || reason))
      })
    return () => {
      alive = false
    }
  }, [])

  const memorizedCount = useMemo(
    () =>
      Object.values(settings.memorization).reduce(
        (sum, record) => sum + (record.completed?.length || 0),
        0,
      ),
    [settings.memorization],
  )
  const memorizedPercent = Math.min(100, (memorizedCount / 6236) * 100)
  const continueSurah = settings.lastRead
    ? surahs.find((surah) => surah.number === settings.lastRead?.surah)
    : null
  const dailySurah = daily ? surahs.find((surah) => surah.number === daily.surah) : null

  const playDaily = () => {
    if (!daily || !dailySurah) return
    setLastRead(daily.surah, daily.ayah)
    player.startQueue(
      [
        {
          surah: daily.surah,
          surahNameUz: daily.surahNameUz,
          surahNameCyr: daily.surahNameCyr,
          ayah: daily.ayah,
          text: daily.arabic,
          translation: daily.translation,
          audio: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${getDailyGlobalNumber(daily, surahs)}.mp3`,
        },
      ],
      { startIndex: 0 },
    )
  }

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-pattern" aria-hidden="true" />
        <div className="hero-copy">
          <span className="hero-badge">
            <Star size={14} /> Bismillahir-rohmanir-rohim
          </span>
          <p className="hero-arabic" lang="ar" dir="rtl">
            وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا
          </p>
          <h1>
            Qalbingizga <span>nur</span> olib keladigan yo‘ldosh.
          </h1>
          <p className="hero-sub">
            Qur’onni o‘qing, tinglang va oyatma-oyat yodlang. Alifbo, namoz vaqtlari va namoz
            o‘rganish — barchasi bir joyda.
          </p>
          <div className="hero-actions">
            <Link to="/quron" className="btn btn-gold">
              Qur’onni ochish <ArrowRight size={17} />
            </Link>
            <Link to="/yodlash" className="btn btn-ghost">
              <GraduationCap size={17} /> Yodlashni boshlash
            </Link>
          </div>
          <div className="hero-stats">
            <div>
              <strong>114</strong>
              <span>sura</span>
            </div>
            <div>
              <strong>6 236</strong>
              <span>oyat</span>
            </div>
            <div>
              <strong>{memorizedCount}</strong>
              <span>yodlangan oyat</span>
            </div>
          </div>
        </div>
        <div className="hero-side">
          <div className="hero-date">
            <span>{today?.hijri || 'Hijriy taqvim'}</span>
            <small>{formatUzDate(new Date())}</small>
          </div>
          <NextPrayerCard />
          <Link to="/namoz" className="hero-qibla">
            <span className="qibla-arrow">➤</span>
            <span>
              <small>Qibla yo‘nalishi</small>
              <strong>Makka tomon</strong>
            </span>
          </Link>
        </div>
      </section>

      <InstallPrompt />

      <Link to="/yuklab-olish" className="apk-banner">
        <span className="apk-banner-icon">
          <Download size={22} />
        </span>
        <div>
          <span className="eyebrow">Android APK</span>
          <strong>Nur ilovasini telefonga yuklab oling</strong>
          <p>To‘g‘ridan-to‘g‘ri o‘rnatish — brauzer menyusisiz, to‘liq ekranda ishlaydi.</p>
        </div>
        <span className="apk-banner-action">
          Yuklab olish <ArrowRight size={16} />
        </span>
      </Link>

      {continueSurah && settings.lastRead && (
        <Link
          to={`/quron/${continueSurah.number}#ayah-${settings.lastRead.ayah}`}
          className="continue-card"
        >
          <span className="continue-icon">
            <BookOpen size={22} />
          </span>
          <div>
            <span className="eyebrow">O‘qishni davom ettirish</span>
            <strong>
              {settings.script === 'latin' ? continueSurah.nameUz : continueSurah.nameCyr} ·{' '}
              {settings.lastRead.ayah}-oyat
            </strong>
          </div>
          <ArrowRight size={20} />
        </Link>
      )}

      <div className="home-grid">
        <section className="daily-card">
          <SectionHeading
            eyebrow="Har kunga bir oyat"
            title="Bugungi oyat"
            action={
              daily && (
                <Link to={`/quron/${daily.surah}`} className="text-link">
                  Surani o‘qish <ArrowRight size={14} />
                </Link>
              )
            }
          />
          {daily ? (
            <div className="daily-body">
              <p className="quran-text daily-arabic" lang="ar" dir="rtl">
                {daily.arabic}
              </p>
              <p className="daily-translation" dir="ltr">
                {settings.script === 'latin' ? daily.translation.latin : daily.translation.cyrillic}
              </p>
              <div className="daily-footer">
                <span>
                  {settings.script === 'latin' ? daily.surahNameUz : daily.surahNameCyr} ·{' '}
                  {daily.ayah}-oyat
                </span>
                <button type="button" className="btn btn-soft btn-small" onClick={playDaily}>
                  <Play size={15} /> Tinglash
                </button>
              </div>
            </div>
          ) : (
            <div className="daily-body">
              <span className="skeleton-line" />
              <span className="skeleton-line medium" />
              <span className="skeleton-line short" />
            </div>
          )}
        </section>

        <section className="progress-card">
          <SectionHeading eyebrow="Yodlash" title="Sizning yo‘lingiz" />
          <div className="progress-ring-wrap">
            <div
              className="big-progress-ring"
              style={{ '--value': `${memorizedPercent}%` } as CSSProperties}
            >
              <div>
                <strong>{memorizedCount}</strong>
                <span>oyat</span>
              </div>
            </div>
            <div>
              <p className="progress-caption">6 236 oyatdan</p>
              <p className="muted">
                Har kuni kichik qadam — katta natija. Yodlash zanjiri oyatlarni bog‘lab yodlashga
                yordam beradi.
              </p>
              <Link to="/yodlash" className="btn btn-gold btn-small">
                Davom etish <ArrowRight size={15} />
              </Link>
            </div>
          </div>
          <div className="mini-stats">
            <div>
              <strong>{settings.bookmarks.length}</strong>
              <span>saqlangan oyat</span>
            </div>
            <div>
              <strong>{Object.keys(settings.memorization).length}</strong>
              <span>boshlangan sura</span>
            </div>
            <div>
              <strong>{memorizedPercent.toFixed(1)}%</strong>
              <span>umumiy progress</span>
            </div>
          </div>
        </section>
      </div>

      <section className="features-section">
        <SectionHeading
          eyebrow="Bir ilovada"
          title="Nur sizga nimalar beradi?"
          subtitle="O‘qish, tinglash, yodlash va namoz — barchasi uyg‘unlashgan."
        />
        <div className="feature-grid">
          {features.map((feature) => (
            <Link to={feature.to} className={`feature-card accent-${feature.accent}`} key={feature.title}>
              <span className="feature-icon">
                <feature.icon size={22} />
              </span>
              <strong>{feature.title}</strong>
              <p>{feature.text}</p>
              <span className="feature-arrow">
                <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="surahs-preview">
        <SectionHeading
          eyebrow="Qur’oni Karim"
          title="Suralar"
          subtitle="O‘qishni xohlagan surangizni tanlang."
          action={
            <Link to="/quron" className="text-link">
              Barcha 114 sura <ArrowRight size={14} />
            </Link>
          }
        />
        {error ? (
          <ErrorBlock message={error} />
        ) : surahs.length ? (
          <div className="surah-grid">
            {surahs.slice(0, 6).map((surah) => (
              <SurahCard key={surah.number} surah={surah} script={settings.script} />
            ))}
          </div>
        ) : (
          <LoadingBlock label="Suralar yuklanmoqda..." />
        )}
      </section>

      <section className="home-quote">
        <span className="quote-mark">“</span>
        <p>
          «Sizlarning eng yaxshingiz Qur’onni o‘rganuvchi va o‘rgatuvchidir.»
        </p>
        <small>Buxoriy rivoyati</small>
      </section>
    </div>
  )
}

// Daily ayah needs its global ayah number for the audio CDN. The data file stores
// surah/ayah; compute the global number from the generated index.
function getDailyGlobalNumber(daily: DailyAyah, surahs: SurahMeta[]) {
  let total = 0
  for (const surah of surahs) {
    if (surah.number === daily.surah) return total + daily.ayah
    total += surah.ayahCount
  }
  return daily.ayah
}
