import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bookmark,
  BookmarkCheck,
  Copy,
  GraduationCap,
  Pause,
  Play,
  Share2,
} from 'lucide-react'
import type { Ayah, ScriptMode, SurahMeta } from '../types'
import { copyText, shareText } from '../lib/utils'

interface AyahCardProps {
  surah: SurahMeta
  ayah: Ayah
  script: ScriptMode
  active: boolean
  playing: boolean
  bookmarked: boolean
  showTranslation: boolean
  onPlayPause: () => void
  onBookmark: () => void
}

export function AyahCard({
  surah,
  ayah,
  script,
  active,
  playing,
  bookmarked,
  showTranslation,
  onPlayPause,
  onBookmark,
}: AyahCardProps) {
  const [copied, setCopied] = useState(false)
  const translation = script === 'latin' ? ayah.translation.latin : ayah.translation.cyrillic

  const handleCopy = async () => {
    const text = `${ayah.text}\n\n${translation}\n\n(${surah.nameUz}, ${ayah.numberInSurah}-oyat)`
    const ok = await copyText(text)
    if (ok) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    }
  }

  const handleShare = () => {
    shareText(
      `${surah.nameUz} surasi, ${ayah.numberInSurah}-oyat`,
      `${ayah.text}\n\n${translation}\n\n— ${surah.nameUz}, ${ayah.numberInSurah}-oyat`,
    )
  }

  return (
    <article className={`ayah-card${active ? ' active' : ''}`} id={`ayah-${ayah.numberInSurah}`}>
      <header className="ayah-head">
        <span className={`ayah-number${active ? ' active' : ''}`} aria-label={`${ayah.numberInSurah}-oyat`}>
          {active && playing && (
            <span className="playing-bars" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          )}
          {ayah.numberInSurah}
        </span>
        <div className="ayah-meta">
          <span>Juz {ayah.juz}</span>
          <span>Sahifa {ayah.page}</span>
          {ayah.sajda && <span className="sajda-badge">Sajda</span>}
        </div>
        <div className="ayah-head-actions">
          <button
            type="button"
            className={`icon-btn small${active ? ' gold' : ''}`}
            onClick={onPlayPause}
            aria-label={active && playing ? 'To‘xtatish' : 'Oyatni tinglash'}
            title={active && playing ? 'To‘xtatish' : 'Tinglash'}
          >
            {active && playing ? <Pause size={17} /> : <Play size={17} />}
          </button>
          <button
            type="button"
            className={`icon-btn small${bookmarked ? ' gold' : ''}`}
            onClick={onBookmark}
            aria-label={bookmarked ? 'Saqlanganlardan olib tashlash' : 'Saqlash'}
            title={bookmarked ? 'Saqlanganlardan olib tashlash' : 'Saqlash'}
          >
            {bookmarked ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
          </button>
        </div>
      </header>

      <p className="quran-text" lang="ar" dir="rtl">
        {ayah.text}
      </p>

      {showTranslation && (
        <p className="ayah-translation" dir="ltr">
          {translation}
        </p>
      )}

      <footer className="ayah-foot">
        <span className="ayah-ref">
          {surah.nameUz} · {surah.number}:{ayah.numberInSurah}
        </span>
        <div className="ayah-tools">
          <Link
            className="tool-link"
            to={`/yodlash?surah=${surah.number}&start=${ayah.numberInSurah}`}
            title="Shu oyatni yodlash"
          >
            <GraduationCap size={15} /> Yodlash
          </Link>
          <button type="button" className="tool-link" onClick={handleCopy}>
            <Copy size={15} /> {copied ? 'Nusxalandi' : 'Nusxa'}
          </button>
          <button type="button" className="tool-link" onClick={handleShare}>
            <Share2 size={15} /> Ulashish
          </button>
        </div>
      </footer>
    </article>
  )
}
