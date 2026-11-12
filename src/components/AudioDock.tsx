import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import {
  Gauge,
  GraduationCap,
  Pause,
  Play,
  Repeat2,
  SkipBack,
  SkipForward,
  X,
} from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'
import { useSettings } from '../context/SettingsContext'
import { formatDuration } from '../lib/utils'

const repeatOptions = [1, 2, 3, 5, 10]
const rateOptions = [0.75, 1, 1.25, 1.5]

export function AudioDock() {
  const player = usePlayer()
  const { settings } = useSettings()
  const { currentTrack, isPlaying, currentTime, duration, repeatEach, rate, error } = player
  if (!currentTrack) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const translation =
    settings.script === 'latin' ? currentTrack.translation.latin : currentTrack.translation.cyrillic
  const surahName =
    settings.script === 'latin' ? currentTrack.surahNameUz : currentTrack.surahNameCyr

  const cycleRepeat = () => {
    const current = repeatOptions.indexOf(repeatEach)
    player.setRepeatEach(repeatOptions[(current + 1) % repeatOptions.length])
  }
  const cycleRate = () => {
    const current = rateOptions.indexOf(rate)
    player.setRate(rateOptions[(current + 1) % rateOptions.length])
  }

  return (
    <div className="audio-dock" role="region" aria-label="Qur’on audio pleyeri">
      <div className="audio-dock-top">
        <div className="audio-dock-title">
          <span className="audio-orb">
            <span className={isPlaying ? 'pulse-dot playing' : 'pulse-dot'} />
          </span>
          <div>
            <strong>
              {surahName} · {currentTrack.ayah}-oyat
            </strong>
            <p>{translation}</p>
          </div>
        </div>
        <div className="audio-dock-controls">
          <button
            type="button"
            className="dock-icon-btn"
            onClick={player.prev}
            aria-label="Oldingi oyat"
          >
            <SkipBack size={18} />
          </button>
          <button
            type="button"
            className="dock-play-btn"
            onClick={player.toggle}
            aria-label={isPlaying ? 'To‘xtatish' : 'Ijro etish'}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          <button
            type="button"
            className="dock-icon-btn"
            onClick={player.next}
            aria-label="Keyingi oyat"
          >
            <SkipForward size={18} />
          </button>
        </div>
        <div className="audio-dock-extra">
          <button
            type="button"
            className="dock-pill"
            onClick={cycleRepeat}
            title="Joriy oyatni takrorlash"
          >
            <Repeat2 size={14} /> ×{repeatEach}
          </button>
          <button type="button" className="dock-pill" onClick={cycleRate} title="Ijro tezligi">
            <Gauge size={14} /> {rate}×
          </button>
          <Link
            className="dock-icon-btn"
            to={`/yodlash?surah=${currentTrack.surah}&start=${currentTrack.ayah}`}
            title="Shu oyatni yodlash"
            aria-label="Shu oyatni yodlash"
          >
            <GraduationCap size={18} />
          </Link>
          <button
            type="button"
            className="dock-icon-btn close"
            onClick={player.close}
            aria-label="Pleyerni yopish"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      <div className="audio-progress-row">
        <span>{formatDuration(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={Math.max(duration, 0.1)}
          step={0.1}
          value={Math.min(currentTime, duration || 0)}
          onChange={(event) => player.seek(Number(event.target.value))}
          className="range progress-range"
          style={{ '--progress': `${progress}%` } as CSSProperties}
          aria-label="Audio progressi"
        />
        <span>{formatDuration(duration)}</span>
      </div>
      {error && <p className="audio-error">{error}</p>}
    </div>
  )
}
