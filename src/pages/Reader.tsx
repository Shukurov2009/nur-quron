import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Headphones,
  Languages,
  Pause,
  Play,
  Sparkles,
} from 'lucide-react'
import type { Surah } from '../types'
import { loadSurah, loadSurahIndex } from '../lib/quran'
import { useSettings } from '../context/SettingsContext'
import { usePlayer, type Track } from '../context/PlayerContext'
import { AyahCard } from '../components/AyahCard'
import { ErrorBlock, LoadingBlock } from '../components/SectionHeading'
import { formatUzDate } from '../lib/utils'

export function ReaderPage() {
  const { surah: surahParam } = useParams()
  const surahNumber = Number(surahParam)
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { settings, updateSettings, setLastRead, toggleBookmark, isBookmarked } = useSettings()
  const player = usePlayer()
  const [surah, setSurah] = useState<Surah | null>(null)
  const [surahCount, setSurahCount] = useState(114)
  const [error, setError] = useState<string | null>(null)
  const autoPlayedRef = useRef<number | null>(null)
  const lastScrolledRef = useRef<string | null>(null)

  useEffect(() => {
    let alive = true
    setSurah(null)
    setError(null)
    autoPlayedRef.current = null
    lastScrolledRef.current = null
    Promise.all([loadSurah(surahNumber), loadSurahIndex()])
      .then(([loaded, index]) => {
        if (!alive) return
        setSurah(loaded)
        setSurahCount(index.length)
      })
      .catch((reason) => {
        if (alive) setError(String(reason?.message || reason))
      })
    return () => {
      alive = false
    }
  }, [surahNumber])

  const tracks = useMemo<Track[]>(() => {
    if (!surah) return []
    return surah.ayahs.map((ayah) => ({
      surah: surah.number,
      surahNameUz: surah.nameUz,
      surahNameCyr: surah.nameCyr,
      ayah: ayah.numberInSurah,
      text: ayah.text,
      translation: ayah.translation,
      audio: ayah.audio,
      audio64: ayah.audio64,
    }))
  }, [surah])

  const currentTrack = player.currentTrack
  const activeAyah =
    currentTrack && currentTrack.surah === surah?.number ? currentTrack.ayah : null

  useEffect(() => {
    if (activeAyah) setLastRead(surahNumber, activeAyah)
  }, [activeAyah, surahNumber, setLastRead])

  // Scroll to the hash target after the surah has rendered.
  useEffect(() => {
    if (!surah) return
    const hash = location.hash
    if (hash) {
      const timer = window.setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 120)
      return () => window.clearTimeout(timer)
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    return undefined
  }, [surah, location.hash])

  // Auto-play when opened from a "listen" button.
  useEffect(() => {
    if (!surah || !tracks.length) return
    if (searchParams.get('play') !== '1') return
    if (autoPlayedRef.current === surah.number) return
    autoPlayedRef.current = surah.number
    player.startQueue(tracks, { startIndex: 0 })
    const next = new URLSearchParams(searchParams)
    next.delete('play')
    setSearchParams(next, { replace: true })
  }, [surah, tracks, searchParams, setSearchParams, player])

  // Follow the recitation.
  useEffect(() => {
    if (!activeAyah || !player.isPlaying || !settings.autoScroll) return
    const key = `${surahNumber}:${activeAyah}`
    if (lastScrolledRef.current === key) return
    lastScrolledRef.current = key
    const element = document.getElementById(`ayah-${activeAyah}`)
    if (!element) return
    const rect = element.getBoundingClientRect()
    if (rect.top < 90 || rect.bottom > window.innerHeight - 180) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [activeAyah, player.isPlaying, settings.autoScroll, surahNumber])

  const handlePlayAll = () => {
    if (!tracks.length) return
    const isCurrent = player.currentTrack?.surah === surahNumber
    if (isCurrent) {
      player.toggle()
    } else {
      player.startQueue(tracks, { startIndex: 0 })
    }
  }

  const handlePlayAyah = (index: number) => {
    const isCurrent = player.currentTrack?.surah === surahNumber && player.currentTrack?.ayah === index + 1
    if (isCurrent) {
      player.toggle()
    } else {
      player.startQueue(tracks, { startIndex: index })
    }
  }

  if (error) {
    return (
      <div className="page">
        <ErrorBlock
          title="Surani yuklab bo‘lmadi"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  if (!surah) {
    return (
      <div className="page reader-page">
        <LoadingBlock label="Sura yuklanmoqda..." />
      </div>
    )
  }

  const isPlayingThis = player.currentTrack?.surah === surah.number && player.isPlaying
  const showBismillah = surah.number !== 1 && surah.number !== 9

  return (
    <div className="page reader-page">
      <div className="reader-topbar">
        <Link to="/quron" className="back-link">
          <ArrowLeft size={17} /> Suralar
        </Link>
        <div className="reader-topbar-actions">
          <button
            type="button"
            className="btn btn-soft btn-small"
            onClick={() => updateSettings({ showTranslation: !settings.showTranslation })}
            aria-pressed={settings.showTranslation}
          >
            <Languages size={15} /> Tarjima {settings.showTranslation ? 'yoniq' : 'o‘chiq'}
          </button>
          <Link to={`/yodlash?surah=${surah.number}`} className="btn btn-soft btn-small">
            <GraduationCap size={16} /> Yodlash
          </Link>
        </div>
      </div>

      <header className="surah-hero">
        <div className="surah-hero-ornament" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="eyebrow">
          {surah.revelation} · {surah.ayahCount} oyat
        </span>
        <h1>{settings.script === 'latin' ? surah.nameUz : surah.nameCyr}</h1>
        <p className="surah-hero-arabic" lang="ar" dir="rtl">
          {surah.nameArabic}
        </p>
        <p className="surah-hero-sub">
          {surah.englishNameTranslation} · {formatUzDate(new Date())}
        </p>
        <div className="surah-hero-actions">
          <button type="button" className="btn btn-gold" onClick={handlePlayAll}>
            {isPlayingThis ? <Pause size={17} /> : <Play size={17} />}
            {isPlayingThis ? 'To‘xtatish' : 'Surahni tinglash'}
          </button>
          <Link to={`/yodlash?surah=${surah.number}`} className="btn btn-ghost">
            <Sparkles size={16} /> Zanjir bilan yodlash
          </Link>
        </div>
        <div className="surah-hero-meta">
          <span>
            <Headphones size={14} /> Mishary Rashid Alafasy
          </span>
          <span>Muhammad Sodiq tarjimasi</span>
          <span>{surah.number}-sura</span>
        </div>
      </header>

      {showBismillah && (
        <div className="bismillah">
          <p lang="ar" dir="rtl">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
          <span>Mehribon va rahmli Allohning nomi bilan</span>
        </div>
      )}

      <div className="ayah-list">
        {surah.ayahs.map((ayah, index) => {
          const playing =
            player.currentTrack?.surah === surah.number &&
            player.currentTrack?.ayah === ayah.numberInSurah &&
            player.isPlaying
          return (
            <AyahCard
              key={ayah.number}
              surah={surah}
              ayah={ayah}
              script={settings.script}
              active={activeAyah === ayah.numberInSurah}
              playing={playing}
              bookmarked={isBookmarked(surah.number, ayah.numberInSurah)}
              showTranslation={settings.showTranslation}
              onPlayPause={() => handlePlayAyah(index)}
              onBookmark={() => toggleBookmark(surah.number, ayah.numberInSurah)}
            />
          )
        })}
      </div>

      <nav className="surah-pager">
        {surah.number > 1 ? (
          <Link to={`/quron/${surah.number - 1}`} className="pager-link">
            <ArrowLeft size={17} />
            <span>
              <small>Oldingi sura</small>
              <strong>{surah.number - 1}-sura</strong>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {surah.number < surahCount && (
          <Link to={`/quron/${surah.number + 1}`} className="pager-link next">
            <span>
              <small>Keyingi sura</small>
              <strong>{surah.number + 1}-sura</strong>
            </span>
            <ArrowRight size={17} />
          </Link>
        )}
      </nav>
    </div>
  )
}
