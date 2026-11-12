import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export interface Track {
  surah: number
  surahNameUz: string
  surahNameCyr: string
  ayah: number
  text: string
  translation: { latin: string; cyrillic: string }
  audio: string
  audio64?: string
}

interface PlayerContextValue {
  queue: Track[]
  index: number
  currentTrack: Track | null
  isPlaying: boolean
  currentTime: number
  duration: number
  repeatEach: number
  rate: number
  error: string | null
  startQueue: (tracks: Track[], options?: { startIndex?: number; repeatEach?: number }) => void
  playSingle: (track: Track) => void
  toggle: () => void
  next: () => void
  prev: () => void
  seek: (seconds: number) => void
  setRepeatEach: (value: number) => void
  setRate: (value: number) => void
  stop: () => void
  close: () => void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const queueRef = useRef<Track[]>([])
  const indexRef = useRef(0)
  const repeatEachRef = useRef(1)
  const repeatPlayedRef = useRef(0)
  const rateRef = useRef(1)
  const fallbackRef = useRef(false)

  const [queue, setQueue] = useState<Track[]>([])
  const [index, setIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [repeatEach, setRepeatEachState] = useState(1)
  const [rate, setRateState] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const currentTrack = queue[index] ?? null

  const loadTrack = useCallback((nextIndex: number) => {
    const audio = audioRef.current
    const track = queueRef.current[nextIndex]
    if (!audio || !track) return

    fallbackRef.current = false
    repeatPlayedRef.current = 0
    indexRef.current = nextIndex
    setIndex(nextIndex)
    setCurrentTime(0)
    setDuration(0)
    setError(null)

    audio.pause()
    audio.src = track.audio
    audio.playbackRate = rateRef.current
    audio.currentTime = 0
    setIsPlaying(true)

    const play = () => {
      audio.play().catch(() => {
        if (!fallbackRef.current && track.audio64) {
          fallbackRef.current = true
          audio.src = track.audio64
          audio.play().catch(() => {
            setIsPlaying(false)
            setError('Audioni ijro etib bo‘lmadi. Internet aloqasini tekshiring.')
          })
        } else {
          setIsPlaying(false)
          setError('Audioni ijro etib bo‘lmadi. Internet aloqasini tekshiring.')
        }
      })
    }
    play()
  }, [])

  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audioRef.current = audio

    const onTime = () => setCurrentTime(audio.currentTime || 0)
    const onMeta = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => {
      if (!audio.ended) setIsPlaying(false)
    }
    const onEnded = () => {
      const currentQueue = queueRef.current
      const currentIndex = indexRef.current
      const track = currentQueue[currentIndex]
      if (!track) return
      if (repeatPlayedRef.current + 1 < repeatEachRef.current) {
        repeatPlayedRef.current += 1
        audio.currentTime = 0
        audio.play().catch(() => setIsPlaying(false))
        return
      }
      repeatPlayedRef.current = 0
      if (currentIndex + 1 < currentQueue.length) {
        loadTrack(currentIndex + 1)
      } else {
        setIsPlaying(false)
        setCurrentTime(audio.duration || 0)
      }
    }
    const onError = () => {
      const track = queueRef.current[indexRef.current]
      if (!track) return
      if (!fallbackRef.current && track.audio64) {
        fallbackRef.current = true
        audio.src = track.audio64
        audio.play().catch(() => {
          setIsPlaying(false)
          setError('Audioni yuklab bo‘lmadi.')
        })
      } else {
        setIsPlaying(false)
        setError('Audioni yuklab bo‘lmadi. Keyingi oyatga o‘tishingiz mumkin.')
      }
    }

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('durationchange', onMeta)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)

    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('durationchange', onMeta)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
      audio.src = ''
      audioRef.current = null
    }
  }, [loadTrack])

  // Media Session (lock screen / notification controls).
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentTrack) return
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `${currentTrack.surahNameUz} surasi — ${currentTrack.ayah}-oyat`,
        artist: 'Mishary Rashid Alafasy',
        album: "Qur'oni Karim",
        artwork: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      })
    } catch {
      // ignore unsupported metadata
    }
    navigator.mediaSession.setActionHandler('play', () => {
      audioRef.current?.play().catch(() => undefined)
    })
    navigator.mediaSession.setActionHandler('pause', () => audioRef.current?.pause())
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      const previous = Math.max(0, indexRef.current - 1)
      if (previous !== indexRef.current) loadTrack(previous)
    })
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      const next = indexRef.current + 1
      if (next < queueRef.current.length) loadTrack(next)
    })
  }, [currentTrack, loadTrack])

  const startQueue = useCallback(
    (tracks: Track[], options?: { startIndex?: number; repeatEach?: number }) => {
      if (!tracks.length) return
      const startIndex = Math.min(Math.max(0, options?.startIndex ?? 0), tracks.length - 1)
      const repeat = Math.max(1, options?.repeatEach ?? 1)
      queueRef.current = tracks
      setQueue(tracks)
      repeatEachRef.current = repeat
      setRepeatEachState(repeat)
      repeatPlayedRef.current = 0
      loadTrack(startIndex)
    },
    [loadTrack],
  )

  const playSingle = useCallback(
    (track: Track) => {
      queueRef.current = [track]
      setQueue([track])
      repeatEachRef.current = 1
      setRepeatEachState(1)
      loadTrack(0)
    },
    [loadTrack],
  )

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !queueRef.current.length) return
    if (audio.paused) {
      audio.play().catch(() => setError('Audioni ijro etib bo‘lmadi.'))
    } else {
      audio.pause()
    }
  }, [])

  const next = useCallback(() => {
    const nextIndex = indexRef.current + 1
    if (nextIndex < queueRef.current.length) loadTrack(nextIndex)
  }, [loadTrack])

  const prev = useCallback(() => {
    const audio = audioRef.current
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0
      return
    }
    const previous = Math.max(0, indexRef.current - 1)
    if (previous !== indexRef.current) loadTrack(previous)
    else if (audio) audio.currentTime = 0
  }, [loadTrack])

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.min(Math.max(0, seconds), audio.duration || seconds)
    setCurrentTime(audio.currentTime)
  }, [])

  const setRepeatEach = useCallback((value: number) => {
    const safe = Math.max(1, Math.min(20, Math.round(value)))
    repeatEachRef.current = safe
    repeatPlayedRef.current = 0
    setRepeatEachState(safe)
  }, [])

  const setRate = useCallback((value: number) => {
    rateRef.current = value
    setRateState(value)
    if (audioRef.current) audioRef.current.playbackRate = value
  }, [])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    setIsPlaying(false)
  }, [])

  const close = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    }
    queueRef.current = []
    indexRef.current = 0
    setQueue([])
    setIndex(0)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setError(null)
  }, [])

  const value = useMemo<PlayerContextValue>(
    () => ({
      queue,
      index,
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      repeatEach,
      rate,
      error,
      startQueue,
      playSingle,
      toggle,
      next,
      prev,
      seek,
      setRepeatEach,
      setRate,
      stop,
      close,
    }),
    [
      queue,
      index,
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      repeatEach,
      rate,
      error,
      startQueue,
      playSingle,
      toggle,
      next,
      prev,
      seek,
      setRepeatEach,
      setRate,
      stop,
      close,
    ],
  )

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export function usePlayer() {
  const value = useContext(PlayerContext)
  if (!value) throw new Error('usePlayer PlayerProvider ichida ishlatilishi kerak')
  return value
}
