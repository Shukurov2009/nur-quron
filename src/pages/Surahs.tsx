import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Search, SlidersHorizontal } from 'lucide-react'
import type { SurahMeta } from '../types'
import { loadSurahIndex } from '../lib/quran'
import { useSettings } from '../context/SettingsContext'
import { SurahCard } from '../components/SurahCard'
import { ErrorBlock, LoadingBlock } from '../components/SectionHeading'

type Filter = 'all' | 'Makkiy' | 'Madaniy'

export function SurahsPage() {
  const { settings } = useSettings()
  const [surahs, setSurahs] = useState<SurahMeta[]>([])
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    let alive = true
    loadSurahIndex()
      .then((index) => alive && setSurahs(index))
      .catch((reason) => alive && setError(String(reason?.message || reason)))
    return () => {
      alive = false
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase()
    return surahs.filter((surah) => {
      if (filter !== 'all' && surah.revelation !== filter) return false
      if (!q) return true
      return [
        surah.nameUz,
        surah.nameCyr,
        surah.nameArabic,
        surah.nameEnglish,
        String(surah.number),
      ].some((value) => value.toLocaleLowerCase().includes(q))
    })
  }, [surahs, query, filter])

  const bookmarked = useMemo(
    () =>
      settings.bookmarks
        .map((bookmark) => ({
          ...bookmark,
          surah: surahs.find((item) => item.number === bookmark.surah),
        }))
        .filter((item) => item.surah)
        .slice(0, 5),
    [settings.bookmarks, surahs],
  )

  return (
    <div className="page surahs-page">
      <header className="page-head">
        <div>
          <span className="eyebrow">Qur’oni Karim</span>
          <h1>114 sura, 6 236 oyat</h1>
          <p>
            Mishary Rashid Alafasy qiroati, o‘zbekcha tarjima va har bir oyat uchun yodlash
            rejimi.
          </p>
        </div>
        <div className="page-head-stat">
          <BookOpenGlyph />
          <strong>Qur’on</strong>
          <span>o‘qish · tinglash · yodlash</span>
        </div>
      </header>

      {bookmarked.length > 0 && (
        <section className="bookmarks-strip">
          <span className="eyebrow">
            <Bookmark size={13} /> Saqlangan oyatlar
          </span>
          <div className="bookmark-links">
            {bookmarked.map((item) => (
              <Link
                key={`${item.surah?.number}-${item.ayah}`}
                to={`/quron/${item.surah?.number}#ayah-${item.ayah}`}
                className="bookmark-chip"
              >
                {settings.script === 'latin' ? item.surah?.nameUz : item.surah?.nameCyr} ·{' '}
                {item.ayah}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="filter-bar">
        <label className="search-field">
          <Search size={17} />
          <input
            type="search"
            placeholder="Sura nomi yoki raqami..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="segmented">
          <span className="segmented-label">
            <SlidersHorizontal size={14} />
          </span>
          {(['all', 'Makkiy', 'Madaniy'] as Filter[]).map((value) => (
            <button
              key={value}
              type="button"
              className={filter === value ? 'active' : ''}
              onClick={() => setFilter(value)}
            >
              {value === 'all' ? 'Barchasi' : value}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <ErrorBlock message={error} />
      ) : !surahs.length ? (
        <LoadingBlock label="Suralar yuklanmoqda..." />
      ) : filtered.length ? (
        <>
          <p className="result-count">{filtered.length} sura topildi</p>
          <div className="surah-grid wide">
            {filtered.map((surah) => (
              <SurahCard key={surah.number} surah={surah} script={settings.script} />
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <Search size={28} />
          <strong>Hech narsa topilmadi</strong>
          <p>Boshqa nom yoki raqam bilan qidirib ko‘ring.</p>
        </div>
      )}
    </div>
  )
}

function BookOpenGlyph() {
  return (
    <svg viewBox="0 0 64 64" width="48" height="48" aria-hidden="true">
      <path
        d="M32 16c-7-5-16-5-22-2v34c7-2 16-1 22 4 6-5 15-6 22-4V14c-6-3-15-3-22 2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M32 17v35M13 23c5-1 10 0 14 2M13 30c5-1 10 0 14 2M51 23c-5-1-10 0-14 2M51 30c-5-1-10 0-14 2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity=".55" />
    </svg>
  )
}
