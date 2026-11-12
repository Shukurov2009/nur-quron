import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  GraduationCap,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
} from 'lucide-react'
import type { Surah, SurahMeta } from '../types'
import { loadSurah, loadSurahIndex } from '../lib/quran'
import { useSettings } from '../context/SettingsContext'
import { usePlayer } from '../context/PlayerContext'
import { ErrorBlock, LoadingBlock, SectionHeading } from '../components/SectionHeading'
import { formatDuration } from '../lib/utils'
import { readStorage, writeStorage } from '../lib/storage'

interface MemorizeStep {
  kind: 'intro' | 'chain'
  ayah: number
  repeatNo: number
  cycleFrom: number
  cycleTo: number
}

type EngineStatus = 'idle' | 'playing' | 'paused' | 'waiting' | 'done'

const MAX_RANGE = 20
const pauseOptions = [0, 1000, 2000, 3000]
const repeatOptions = [1, 2, 3, 5]
const rateOptions = [0.75, 1, 1.25]

function buildSteps(start: number, end: number, repeats: number): MemorizeStep[] {
  const steps: MemorizeStep[] = []
  for (let ayah = start; ayah <= end; ayah += 1) {
    for (let repeatNo = 1; repeatNo <= repeats; repeatNo += 1) {
      steps.push({ kind: 'intro', ayah, repeatNo, cycleFrom: start, cycleTo: ayah })
    }
    if (ayah > start) {
      for (let repeatNo = 1; repeatNo <= repeats; repeatNo += 1) {
        for (let item = start; item <= ayah; item += 1) {
          steps.push({
            kind: 'chain',
            ayah: item,
            repeatNo,
            cycleFrom: start,
            cycleTo: ayah,
          })
        }
      }
    }
  }
  return steps
}

export function MemorizePage() {
  const [searchParams] = useSearchParams()
  const { settings, markMemorized, setLastRead } = useSettings()
  const globalPlayer = usePlayer()
  const [surahIndex, setSurahIndex] = useState<SurahMeta[]>([])
  const [selectedSurah, setSelectedSurah] = useState(() => {
    const value = Number(searchParams.get('surah'))
    return Number.isInteger(value) && value >= 1 && value <= 114 ? value : 1
  })
  const [surahData, setSurahData] = useState<Surah | null>(null)
  const [rangeStart, setRangeStart] = useState(() => {
    const value = Number(searchParams.get('start'))
    return Number.isInteger(value) && value >= 1 ? value : 1
  })
  const [rangeEnd, setRangeEnd] = useState(() => {
    const start = Number(searchParams.get('start')) || 1
    return start + 4
  })
  const [repeats, setRepeats] = useState(3)
  const [pauseMs, setPauseMs] = useState(1000)
  const [rate, setRate] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<EngineStatus>('idle')
  const [stepIndex, setStepIndex] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [engineError, setEngineError] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const ayahMapRef = useRef<Map<number, Surah['ayahs'][number]>>(new Map())
  const stepsRef = useRef<MemorizeStep[]>([])
  const stepIndexRef = useRef(0)
  const pauseMsRef = useRef(pauseMs)
  const rateRef = useRef(rate)
  const pauseTimerRef = useRef<number | null>(null)
  const advanceRef = useRef<() => void>(() => undefined)
  const playStepRef = useRef<(index: number) => void>(() => undefined)
  const statusRef = useRef<EngineStatus>('idle')

  statusRef.current = status

  useEffect(() => {
    let alive = true
    loadSurahIndex()
      .then((index) => {
        if (!alive) return
        setSurahIndex(index)
        const meta = index.find((item) => item.number === selectedSurah)
        if (meta) {
          setRangeStart((start) => Math.min(Math.max(1, start), meta.ayahCount))
          setRangeEnd((end) => Math.min(Math.max(1, Math.min(end, startRange(meta.ayahCount, end))), meta.ayahCount))
        }
      })
      .catch((reason) => alive && setError(String(reason?.message || reason)))
    return () => {
      alive = false
    }
  }, [selectedSurah])

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    loadSurah(selectedSurah)
      .then((data) => {
        if (!alive) return
        setSurahData(data)
        const map = new Map<number, Surah['ayahs'][number]>()
        data.ayahs.forEach((ayah) => map.set(ayah.numberInSurah, ayah))
        ayahMapRef.current = map
        setRangeStart((value) => Math.min(Math.max(1, value), data.ayahCount))
        setRangeEnd((value) => Math.min(Math.max(1, value), data.ayahCount))
        setLoading(false)
      })
      .catch((reason) => {
        if (!alive) return
        setError(String(reason?.message || reason))
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [selectedSurah])

  useEffect(() => {
    if (!surahData) return
    setRangeStart((value) => Math.min(value, surahData.ayahCount))
    setRangeEnd((value) => {
      const clampedStart = Math.min(rangeStart, surahData.ayahCount)
      return Math.min(Math.max(value, clampedStart), surahData.ayahCount, clampedStart + MAX_RANGE - 1)
    })
  }, [surahData, rangeStart])

  const steps = useMemo(
    () => buildSteps(rangeStart, Math.max(rangeStart, rangeEnd), repeats),
    [rangeStart, rangeEnd, repeats],
  )
  stepsRef.current = steps

  useEffect(() => {
    pauseMsRef.current = pauseMs
  }, [pauseMs])
  useEffect(() => {
    rateRef.current = rate
    if (audioRef.current) audioRef.current.playbackRate = rate
  }, [rate])

  const clearPauseTimer = useCallback(() => {
    if (pauseTimerRef.current !== null) {
      window.clearTimeout(pauseTimerRef.current)
      pauseTimerRef.current = null
    }
  }, [])

  const stopEngine = useCallback(() => {
    clearPauseTimer()
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    }
    stepIndexRef.current = 0
    setStepIndex(0)
    setStatus('idle')
    setCurrentTime(0)
    setDuration(0)
    setEngineError(null)
  }, [clearPauseTimer])

  // Reset the engine whenever the chain changes.
  useEffect(() => {
    stopEngine()
  }, [steps, stopEngine])

  const playStep = useCallback(
    (index: number) => {
      const audio = audioRef.current
      const step = stepsRef.current[index]
      if (!audio || !step) return
      const ayah = ayahMapRef.current.get(step.ayah)
      if (!ayah) return
      clearPauseTimer()
      stepIndexRef.current = index
      setStepIndex(index)
      setEngineError(null)
      setCurrentTime(0)
      setDuration(0)
      audio.pause()
      audio.src = ayah.audio
      audio.playbackRate = rateRef.current
      audio.currentTime = 0
      setStatus('playing')
      setLastRead(selectedSurah, step.ayah)
      let triedFallback = false
      const play = () => {
        audio.play().catch(() => {
          if (!triedFallback && ayah.audio64) {
            triedFallback = true
            audio.src = ayah.audio64
            audio.play().catch(() => {
              setStatus('paused')
              setEngineError('Audioni ijro etib bo‘lmadi. Keyingi bosqichga o‘tishingiz mumkin.')
            })
          } else {
            setStatus('paused')
            setEngineError('Audioni ijro etib bo‘lmadi. Keyingi bosqichga o‘tishingiz mumkin.')
          }
        })
      }
      play()
    },
    [clearPauseTimer, selectedSurah, setLastRead],
  )
  playStepRef.current = playStep

  const advance = useCallback(() => {
    const nextIndex = stepIndexRef.current + 1
    if (nextIndex >= stepsRef.current.length) {
      setStatus('done')
      setStepIndex(stepsRef.current.length)
      stepIndexRef.current = stepsRef.current.length
      return
    }
    if (pauseMsRef.current > 0) {
      setStatus('waiting')
      pauseTimerRef.current = window.setTimeout(() => {
        playStepRef.current(nextIndex)
      }, pauseMsRef.current)
    } else {
      playStepRef.current(nextIndex)
    }
  }, [])
  advanceRef.current = advance

  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'auto'
    audioRef.current = audio
    const onTime = () => setCurrentTime(audio.currentTime || 0)
    const onMeta = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
    const onEnded = () => advanceRef.current()
    const onPlay = () => setStatus((current) => (current === 'waiting' ? current : 'playing'))
    const onPause = () => {
      if (!audio.ended && statusRef.current === 'playing') setStatus('paused')
    }
    const onError = () => setEngineError('Audio yuklanmadi. Internetni tekshiring.')
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('durationchange', onMeta)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('error', onError)
    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('durationchange', onMeta)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('error', onError)
      audio.src = ''
      audioRef.current = null
      clearPauseTimer()
    }
  }, [clearPauseTimer])

  useEffect(() => {
    writeStorage('nur-memorize-last', {
      surah: selectedSurah,
      start: rangeStart,
      end: rangeEnd,
      repeats,
    })
  }, [selectedSurah, rangeStart, rangeEnd, repeats])

  const currentStep = steps[stepIndex] || null
  const currentAyah = currentStep ? ayahMapRef.current.get(currentStep.ayah) : null
  const meta = surahIndex.find((item) => item.number === selectedSurah)
  const completed = settings.memorization[String(selectedSurah)]?.completed || []
  const totalSteps = steps.length
  const progress = totalSteps ? Math.min(100, (stepIndex / totalSteps) * 100) : 0

  const start = () => {
    if (!steps.length) return
    globalPlayer.stop()
    if (status === 'done' || stepIndex >= steps.length) {
      stepIndexRef.current = 0
      setStepIndex(0)
    }
    setStatus('playing')
    playStep(stepIndexRef.current >= steps.length ? 0 : stepIndexRef.current)
  }

  const pause = () => {
    clearPauseTimer()
    audioRef.current?.pause()
    setStatus('paused')
  }

  const resume = () => {
    const audio = audioRef.current
    if (status === 'waiting' || !audio?.src) {
      playStep(stepIndexRef.current)
      return
    }
    audio.play().catch(() => playStep(stepIndexRef.current))
  }

  const toggle = () => {
    if (status === 'playing' || status === 'waiting') pause()
    else if (status === 'paused') resume()
    else start()
  }

  const goPrev = () => {
    if (!steps.length) return
    playStep(Math.max(0, stepIndexRef.current - 1))
  }
  const goNext = () => {
    if (!steps.length) return
    playStep(Math.min(steps.length - 1, stepIndexRef.current + 1))
  }

  const changeSurah = (value: number) => {
    stopEngine()
    setSelectedSurah(value)
    setRangeStart(1)
    setRangeEnd(5)
  }

  const changeStart = (value: number) => {
    setRangeStart(value)
    setRangeEnd((end) => Math.min(Math.max(end, value), value + MAX_RANGE - 1))
  }

  const changeEnd = (value: number) => {
    setRangeEnd(value)
    if (value - rangeStart > MAX_RANGE - 1) setRangeStart(value - MAX_RANGE + 1)
  }

  const markRange = () => {
    if (!surahData) return
    const ayahs = []
    for (let ayah = rangeStart; ayah <= Math.max(rangeStart, rangeEnd); ayah += 1) ayahs.push(ayah)
    markMemorized(selectedSurah, ayahs, { start: rangeStart, end: rangeEnd, repeats })
  }

  const isRangeDone = (() => {
    for (let ayah = rangeStart; ayah <= Math.max(rangeStart, rangeEnd); ayah += 1) {
      if (!completed.includes(ayah)) return false
    }
    return true
  })()

  const nextChunk = () => {
    if (!surahData) return
    const nextStart = Math.min(rangeEnd + 1, surahData.ayahCount)
    setRangeStart(nextStart)
    setRangeEnd(Math.min(nextStart + 4, surahData.ayahCount))
    stopEngine()
  }

  return (
    <div className="page memorize-page">
      <header className="page-head">
        <div>
          <span className="eyebrow">
            <GraduationCap size={14} /> Yodlash zanjiri
          </span>
          <h1>Oyatma-oyat yodlash</h1>
          <p>
            Har bir yangi oyatni bir necha marta takrorlang, so‘ng avvalgi oyatlar bilan
            qo‘shib, zanjir hosil qiling. 1 → 2 → 1·2 → 3 → 1·2·3…
          </p>
        </div>
        <div className="page-head-stat">
          <GraduationCap size={32} />
          <strong>{Object.values(settings.memorization).reduce((n, r) => n + r.completed.length, 0)}</strong>
          <span>yodlangan oyat</span>
        </div>
      </header>

      {error ? (
        <ErrorBlock message={error} onRetry={() => window.location.reload()} />
      ) : loading || !surahData || !meta ? (
        <LoadingBlock label="Sura yuklanmoqda..." />
      ) : (
        <>
          <div className="memorize-layout">
            <section className="memorize-panel">
              <div className="panel-heading">
                <span className="eyebrow">Sessiya sozlamalari</span>
                <h2>Zanjirni tuzing</h2>
              </div>

              <label className="field">
                <span>Sura</span>
                <select value={selectedSurah} onChange={(event) => changeSurah(Number(event.target.value))}>
                  {surahIndex.map((item) => (
                    <option value={item.number} key={item.number}>
                      {item.number}. {settings.script === 'latin' ? item.nameUz : item.nameCyr} ({item.ayahCount} oyat)
                    </option>
                  ))}
                </select>
              </label>

              <div className="field-row">
                <label className="field">
                  <span>Boshlanish</span>
                  <select value={rangeStart} onChange={(event) => changeStart(Number(event.target.value))}>
                    {surahData.ayahs.map((ayah) => (
                      <option key={ayah.numberInSurah} value={ayah.numberInSurah}>
                        {ayah.numberInSurah}-oyat
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Tugash</span>
                  <select
                    value={Math.min(rangeEnd, surahData.ayahCount)}
                    onChange={(event) => changeEnd(Number(event.target.value))}
                  >
                    {surahData.ayahs
                      .filter((ayah) => ayah.numberInSurah >= rangeStart)
                      .slice(0, MAX_RANGE)
                      .map((ayah) => (
                        <option key={ayah.numberInSurah} value={ayah.numberInSurah}>
                          {ayah.numberInSurah}-oyat
                        </option>
                      ))}
                  </select>
                </label>
              </div>

              <label className="field">
                <span>Har bir bo‘lak necha marta takrorlansin?</span>
                <div className="choice-row">
                  {repeatOptions.map((value) => (
                    <button
                      type="button"
                      key={value}
                      className={repeats === value ? 'choice active' : 'choice'}
                      onClick={() => setRepeats(value)}
                    >
                      {value}×
                    </button>
                  ))}
                </div>
              </label>

              <div className="field-row">
                <label className="field">
                  <span>Oraliq pauza</span>
                  <select value={pauseMs} onChange={(event) => setPauseMs(Number(event.target.value))}>
                    {pauseOptions.map((value) => (
                      <option key={value} value={value}>
                        {value === 0 ? 'Pauzasiz' : `${value / 1000} soniya`}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Tezlik</span>
                  <select value={rate} onChange={(event) => setRate(Number(event.target.value))}>
                    {rateOptions.map((value) => (
                      <option key={value} value={value}>
                        {value}×
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="range-summary">
                <div>
                  <span>Tanlangan</span>
                  <strong>
                    {rangeStart}–{Math.min(rangeEnd, surahData.ayahCount)}-oyatlar
                  </strong>
                </div>
                <div>
                  <span>Jami ijro</span>
                  <strong>{totalSteps} marta</strong>
                </div>
                <div>
                  <span>Taxminiy zanjir</span>
                  <strong>{Math.min(rangeEnd, surahData.ayahCount) - rangeStart + 1} oyat</strong>
                </div>
              </div>

              <button type="button" className="btn btn-gold btn-wide" onClick={start}>
                <Play size={18} /> Zanjirni boshlash
              </button>
              <p className="panel-note">
                Maslahat: bir sessiyada 5–10 oyat bilan boshlang. Har kuni davom ettirsangiz,
                sura o‘z-o‘zidan yod bo‘ladi.
              </p>
            </section>

            <section className="memorize-stage">
              <div className="stage-top">
                <span className="eyebrow">
                  {status === 'done' ? 'Tayyor' : 'Hozirgi bosqich'}
                </span>
                <span className="stage-counter">
                  {Math.min(stepIndex + (status === 'done' ? 0 : 1), totalSteps)} / {totalSteps}
                </span>
              </div>

              {status === 'done' ? (
                <div className="stage-done">
                  <span className="done-check">
                    <Check size={30} />
                  </span>
                  <h2>Zanjir yakunlandi!</h2>
                  <p>
                    {rangeStart}–{Math.min(rangeEnd, surahData.ayahCount)}-oyatlar zanjiri tugadi.
                    Endi ularni mustahkamlash uchun yana bir bor takrorlashingiz mumkin.
                  </p>
                  <div className="stage-done-actions">
                    <button type="button" className="btn btn-gold" onClick={start}>
                      <RotateCcw size={16} /> Yana takrorlash
                    </button>
                    {!isRangeDone && (
                      <button type="button" className="btn btn-soft" onClick={markRange}>
                        <Check size={16} /> Yodladim
                      </button>
                    )}
                    {rangeEnd < surahData.ayahCount && (
                      <button type="button" className="btn btn-ghost" onClick={nextChunk}>
                        Keyingi 5 oyat <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="stage-current">
                    <div className="stage-badge">
                      {currentStep?.kind === 'chain' ? 'Zanjir' : 'Yangi oyat'}
                      <small>
                        {currentStep?.repeatNo}/{repeats} takror
                      </small>
                    </div>
                    <div className="stage-arabic quran-text" lang="ar" dir="rtl">
                      {currentAyah?.text || '—'}
                    </div>
                    <p className="stage-translation">
                      {currentAyah
                        ? settings.script === 'latin'
                          ? currentAyah.translation.latin
                          : currentAyah.translation.cyrillic
                        : 'Ijro etish uchun “Zanjirni boshlash” tugmasini bosing.'}
                    </p>
                    <div className="stage-ref">
                      {meta.nameUz} · {currentStep?.ayah ?? rangeStart}-oyat
                      {currentStep?.kind === 'chain' && currentStep && (
                        <span>
                          {' '}
                          · {currentStep.cycleFrom}–{currentStep.cycleTo} zanjiri
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="stage-progress">
                    <div className="stage-progress-bar">
                      <span style={{ width: `${progress}%` }} />
                    </div>
                    <div className="stage-controls">
                      <button type="button" className="icon-btn" onClick={goPrev} aria-label="Oldingi bosqich">
                        <ChevronLeft size={20} />
                      </button>
                      <button type="button" className="stage-play" onClick={toggle}>
                        {status === 'playing' ? <Pause size={24} /> : <Play size={24} />}
                      </button>
                      <button type="button" className="icon-btn" onClick={goNext} aria-label="Keyingi bosqich">
                        <ChevronRight size={20} />
                      </button>
                      <button type="button" className="btn btn-soft btn-small" onClick={stopEngine}>
                        <RotateCcw size={15} /> Boshidan
                      </button>
                    </div>
                    <div className="stage-time">
                      <span>{formatDuration(currentTime)}</span>
                      <span>{formatDuration(duration)}</span>
                    </div>
                    {engineError && <p className="engine-error">{engineError}</p>}
                  </div>
                </>
              )}

              <div className="chain-visual">
                <span className="eyebrow">Zanjir xaritasi</span>
                <div className="chain-chips">
                  {Array.from(
                    { length: Math.min(rangeEnd, surahData.ayahCount) - rangeStart + 1 },
                    (_, index) => rangeStart + index,
                  ).map((ayah) => {
                    const isCurrent = currentStep?.ayah === ayah
                    const isDone = completed.includes(ayah)
                    return (
                      <span
                        key={ayah}
                        className={`chain-chip${isCurrent ? ' active' : ''}${isDone ? ' done' : ''}`}
                      >
                        {ayah}
                        {isDone && <Check size={11} />}
                      </span>
                    )
                  })}
                </div>
                <p className="chain-explain">
                  {currentStep?.kind === 'chain'
                    ? `${currentStep.cycleFrom}–${currentStep.cycleTo} oyatlar ketma-ket o‘qilmoqda.`
                    : `${currentStep?.ayah ?? rangeStart}-oyat alohida takrorlanmoqda.`}
                </p>
              </div>
            </section>
          </div>

          <div className="memorize-bottom">
            <section className="zanjir-help">
              <SectionHeading
                eyebrow="Qanday ishlaydi?"
                title="Zanjir usuli"
                subtitle="Misol: 1, 2, 1·2, 3, 1·2·3, 4, 1·2·3·4"
              />
              <div className="zanjir-steps">
                {[rangeStart, rangeStart + 1, rangeStart + 2, rangeStart + 3]
                  .filter((value) => value <= Math.min(rangeEnd, surahData.ayahCount))
                  .map((ayah, index) => (
                    <div className="zanjir-step" key={ayah}>
                      <strong>{ayah}-oyat</strong>
                      <span>
                        {index === 0
                          ? `${ayah} × ${repeats}`
                          : `${ayah} × ${repeats} → ${rangeStart}–${ayah} × ${repeats}`}
                      </span>
                    </div>
                  ))}
              </div>
              <p className="muted">
                Har bir yangi oyat avval alohida, keyin oldingi oyatlar bilan birga takrorlanadi.
                Shunday qilib, miya oyatlarni bir-biriga bog‘lab eslab qoladi.
              </p>
            </section>

            <section className="range-progress-card">
              <SectionHeading eyebrow="Bu oraliq" title="Yodlanish holati" />
              <div className="range-progress">
                <div className="range-progress-bar">
                  <span style={{ width: `${(completed.filter((a) => a >= rangeStart && a <= rangeEnd).length / Math.max(1, rangeEnd - rangeStart + 1)) * 100}%` }} />
                </div>
                <strong>
                  {completed.filter((a) => a >= rangeStart && a <= rangeEnd).length} /{' '}
                  {Math.max(1, rangeEnd - rangeStart + 1)} oyat
                </strong>
              </div>
              <div className="range-actions">
                <button
                  type="button"
                  className={`btn ${isRangeDone ? 'btn-soft' : 'btn-gold'} btn-small`}
                  onClick={markRange}
                  disabled={isRangeDone}
                >
                  <Check size={15} /> {isRangeDone ? 'Yodlangan' : 'Yodladim'}
                </button>
                {rangeEnd < surahData.ayahCount && (
                  <button type="button" className="btn btn-soft btn-small" onClick={nextChunk}>
                    Keyingi 5 oyat <ChevronRight size={15} />
                  </button>
                )}
              </div>
              <p className="muted small">
                Progress akkauntingizga bog‘langanda barcha qurilmalarda saqlanadi.
              </p>
            </section>
          </div>
        </>
      )}
    </div>
  )
}

function startRange(ayahCount: number, end: number) {
  return Math.min(Math.max(1, end), ayahCount)
}
