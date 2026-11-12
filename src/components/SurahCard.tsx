import { Link } from 'react-router-dom'
import { GraduationCap, Play } from 'lucide-react'
import type { ScriptMode, SurahMeta } from '../types'

export function SurahCard({ surah, script }: { surah: SurahMeta; script: ScriptMode }) {
  const name = script === 'latin' ? surah.nameUz : surah.nameCyr
  return (
    <article className="surah-card">
      <Link to={`/quron/${surah.number}`} className="surah-main" aria-label={`${name} surasini o‘qish`}>
        <span className="surah-number">
          <span>{surah.number}</span>
        </span>
        <span className="surah-info">
          <span className="surah-name-row">
            <strong>{name}</strong>
            <span className="surah-arabic" lang="ar">
              {surah.nameArabic}
            </span>
          </span>
          <span className="surah-meta">
            <span>{surah.ayahCount} oyat</span>
            <span className="dot" />
            <span>{surah.revelation}</span>
            <span className="dot" />
            <span>{surah.nameEnglish}</span>
          </span>
        </span>
      </Link>
      <div className="surah-actions">
        <Link
          to={`/quron/${surah.number}?play=1`}
          className="surah-action"
          title="Surahni tinglash"
          aria-label={`${name} surasini tinglash`}
        >
          <Play size={17} />
        </Link>
        <Link
          to={`/yodlash?surah=${surah.number}`}
          className="surah-action"
          title="Yodlash rejimi"
          aria-label={`${name} surasini yodlash`}
        >
          <GraduationCap size={18} />
        </Link>
      </div>
    </article>
  )
}
