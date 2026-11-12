import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import {
  ArrowRight,
  Check,
  Eraser,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  X,
} from 'lucide-react'
import { arabicLetters, harakat, readingWords, type ArabicLetter } from '../data/alphabet'
import { useSettings } from '../context/SettingsContext'
import { speakArabic } from '../lib/speech'

type Tab = 'letters' | 'harakat' | 'words' | 'quiz'

const tabs: Array<{ id: Tab; label: string; hint: string }> = [
  { id: 'letters', label: 'Harflar', hint: '28 ta harf' },
  { id: 'harakat', label: 'Harakatlar', hint: 'Unli tovushlar' },
  { id: 'words', label: 'So‘zlar', hint: 'O‘qishga mashq' },
  { id: 'quiz', label: 'Mashq', hint: 'Bilimingizni sinang' },
]

function TracingPad({ letter }: { letter: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawingRef = useRef(false)
  const [dirty, setDirty] = useState(false)

  const context = () => canvasRef.current?.getContext('2d') || null

  const point = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  const start = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const ctx = context()
    if (!ctx) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const { x, y } = point(event)
    drawingRef.current = true
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineWidth = 14
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#d9b96e'
    setDirty(true)
  }

  const move = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    const ctx = context()
    if (!ctx) return
    const { x, y } = point(event)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const end = () => {
    drawingRef.current = false
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = context()
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setDirty(false)
  }

  return (
    <div className="tracing">
      <span className="tracing-guide" aria-hidden="true">
        {letter}
      </span>
      <canvas
        ref={canvasRef}
        width={640}
        height={640}
        className="tracing-canvas"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        onPointerLeave={end}
        aria-label={`${letter} harfini yozish maydoni`}
      />
      <button
        type="button"
        className="tracing-clear"
        onClick={clear}
        disabled={!dirty}
      >
        <Eraser size={15} /> Tozalash
      </button>
      <span className="tracing-hint">Barmoq yoki sichqoncha bilan harfni chizing</span>
    </div>
  )
}

function LetterDetail({
  letter,
  onClose,
  showCyrillic,
}: {
  letter: ArabicLetter
  onClose: () => void
  showCyrillic: boolean
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.classList.add('modal-open')
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.classList.remove('modal-open')
    }
  }, [onClose])

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="letter-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${letter.name} harfi`}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Yopish">
          <X size={18} />
        </button>

        <div className="letter-modal-top">
          <span className="letter-big" lang="ar">
            {letter.letter}
          </span>
          <div>
            <h2>
              {letter.name} <span>{showCyrillic ? letter.nameCyr : letter.sound}</span>
            </h2>
            <p>{letter.hint}</p>
            <div className="letter-pronounce">
              <button
                type="button"
                className="btn btn-gold btn-small"
                onClick={() => speakArabic(letter.letter, 0.6)}
              >
                <Volume2 size={15} /> Talaffuzni eshitish
              </button>
              <span className="letter-connects">
                {letter.connects ? 'Boshqa harflar bilan ulanadi' : 'Keyingi harfga ulanmaydi'}
              </span>
            </div>
          </div>
        </div>

        <div className="forms-block">
          <span className="eyebrow">Harfning to‘rt shakli</span>
          <div className="forms-grid">
            {['Yakka', 'Boshida', 'O‘rtada', 'Oxirida'].map((label, index) => (
              <div className="form-cell" key={label}>
                <span className="form-glyph" lang="ar">
                  {letter.forms[index]}
                </span>
                <small>{label}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="example-block">
          <div>
            <span className="eyebrow">Misolda</span>
            <p className="example-arabic" lang="ar">
              {letter.example}
            </p>
            <span className="example-latin">{letter.exampleLatin}</span>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={() => speakArabic(letter.example, 0.65)}
            aria-label="Misolni eshitish"
          >
            <Volume2 size={18} />
          </button>
        </div>

        <TracingPad letter={letter.letter} />
      </div>
    </div>
  )
}

function buildQuestion(previous?: string) {
  const pool = arabicLetters.filter((letter) => letter.letter !== previous)
  const target = pool[Math.floor(Math.random() * pool.length)]
  const options: ArabicLetter[] = [target]
  while (options.length < 4) {
    const candidate = arabicLetters[Math.floor(Math.random() * arabicLetters.length)]
    const duplicate = options.some(
      (item) =>
        item.letter === candidate.letter ||
        item.name === candidate.name ||
        item.nameCyr === candidate.nameCyr,
    )
    if (!duplicate) options.push(candidate)
  }
  return {
    target,
    options: options.sort(() => Math.random() - 0.5),
  }
}

function AlphabetQuiz({ showCyrillic }: { showCyrillic: boolean }) {
  const [question, setQuestion] = useState(() => buildQuestion())
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)

  const choose = (letter: ArabicLetter) => {
    if (selected) return
    setSelected(letter.letter)
    setTotal((value) => value + 1)
    if (letter.letter === question.target.letter) setScore((value) => value + 1)
  }

  const next = () => {
    setQuestion(buildQuestion(question.target.letter))
    setSelected(null)
  }

  const answeredCorrectly = selected === question.target.letter

  return (
    <div className="quiz-card">
      <div className="quiz-top">
        <span className="eyebrow">
          <Trophy size={13} /> Alifbo mashqi
        </span>
        <span className="quiz-score">
          {score} / {total}
        </span>
      </div>
      <p className="quiz-prompt">Bu qaysi harf?</p>
      <button
        type="button"
        className="quiz-letter"
        lang="ar"
        onClick={() => speakArabic(question.target.letter, 0.6)}
        title="Talaffuzni eshitish"
      >
        {question.target.letter}
      </button>
      <div className="quiz-options">
        {question.options.map((option) => {
          const isTarget = option.letter === question.target.letter
          const isSelected = selected === option.letter
          let status = ''
          if (selected) {
            if (isTarget) status = 'correct'
            else if (isSelected) status = 'wrong'
            else status = 'faded'
          }
          return (
            <button
              type="button"
              key={option.letter}
              className={`quiz-option ${status}`}
              onClick={() => choose(option)}
              disabled={Boolean(selected)}
            >
              {showCyrillic ? option.nameCyr : option.name}
              {selected && isTarget && <Check size={15} />}
            </button>
          )
        })}
      </div>
      {selected && (
        <div className={`quiz-feedback${answeredCorrectly ? ' success' : ' fail'}`}>
          <strong>{answeredCorrectly ? 'To‘g‘ri! Barakalla.' : 'Yana bir urinib ko‘ring.'}</strong>
          <span>
            {question.target.letter} — {question.target.name} ({question.target.sound})
          </span>
          <button type="button" className="btn btn-gold btn-small" onClick={next}>
            Keyingi savol <ArrowRight size={15} />
          </button>
        </div>
      )}
      {!selected && (
        <p className="quiz-tip">
          Harfni bosib talaffuzini eshitishingiz mumkin. To‘g‘ri javobni tanlang.
        </p>
      )}
    </div>
  )
}

export function AlphabetPage() {
  const { settings } = useSettings()
  const [tab, setTab] = useState<Tab>('letters')
  const [selected, setSelected] = useState<ArabicLetter | null>(null)
  const showCyrillic = settings.script === 'cyrillic'

  const letters = useMemo(() => arabicLetters, [])

  return (
    <div className="page alphabet-page">
      <header className="page-head">
        <div>
          <span className="eyebrow">
            <Sparkles size={14} /> Noldan boshlang
          </span>
          <h1>Arab alifbosi</h1>
          <p>
            Harflarning shakli, tovushi va yozilishini o‘rganing. Hech qanday bilim talab
            qilinmaydi — bugundan boshlang.
          </p>
        </div>
        <div className="page-head-stat">
          <span className="alphabet-stat-glyph" lang="ar">
            أ ب ت
          </span>
          <strong>28 harf</strong>
          <span>o‘ngdan chapga</span>
        </div>
      </header>

      <div className="alphabet-intro">
        <div className="intro-note">
          <strong>Qanday o‘qiladi?</strong>
          <p>
            Arab tili o‘ngdan chapga yoziladi. Harflar so‘z boshida, o‘rtasida va oxirida
            turli shaklga kiradi. Avval harflarni tanib oling, keyin ularni ulashni
            o‘rganasiz.
          </p>
        </div>
        <div className="intro-tip">
          <Volume2 size={20} />
          <div>
            <strong>Talaffuzni eshiting</strong>
            <p>Har bir harf yonidagi tugma orqali audio talaffuzni tinglang va takrorlang.</p>
          </div>
        </div>
      </div>

      <div className="alphabet-tabs" role="tablist" aria-label="Alifbo bo‘limlari">
        {tabs.map((item) => (
          <button
            type="button"
            key={item.id}
            role="tab"
            aria-selected={tab === item.id}
            className={tab === item.id ? 'active' : ''}
            onClick={() => setTab(item.id)}
          >
            <strong>{item.label}</strong>
            <span>{item.hint}</span>
          </button>
        ))}
      </div>

      {tab === 'letters' && (
        <section className="letters-section">
          <div className="letters-grid">
            {letters.map((letter) => (
              <button
                type="button"
                key={letter.letter}
                className="letter-card"
                onClick={() => setSelected(letter)}
              >
                <span className="letter-glyph" lang="ar">
                  {letter.letter}
                </span>
                <span className="letter-name">{showCyrillic ? letter.nameCyr : letter.name}</span>
                <span className="letter-sound">{letter.sound}</span>
                <span className="letter-example" lang="ar" dir="rtl">
                  {letter.example}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {tab === 'harakat' && (
        <section className="harakat-section">
          <div className="harakat-intro">
            <span className="eyebrow">Harakatlar</span>
            <h2>Unli tovushlar va belgilar</h2>
            <p>
              Harakat — harf ustidagi yoki ostidagi kichik belgi. U harf qanday unli bilan
              o‘qilishini ko‘rsatadi. Masalan, «ب» harfi «ba», «bi», «bu» bo‘lib o‘qiladi.
            </p>
          </div>
          <div className="harakat-grid">
            {harakat.map((item) => (
              <button
                type="button"
                key={item.name}
                className="harakat-card"
                onClick={() => speakArabic(item.example, 0.6)}
              >
                <span className="harakat-mark" lang="ar">
                  {item.example}
                </span>
                <span className="harakat-name">{item.name}</span>
                <span className="harakat-sound">{item.sound}</span>
                <p>{item.explanation}</p>
                <span className="harakat-latin">{item.exampleLatin}</span>
              </button>
            ))}
          </div>
          <div className="reading-rules">
            <span className="eyebrow">O‘qish qoidalari</span>
            <div className="rules-grid">
              <div>
                <strong>O‘ngdan chapga</strong>
                <p>Harflar va so‘zlar o‘ng tomondan boshlab chapga qarab o‘qiladi.</p>
              </div>
              <div>
                <strong>Ulanish</strong>
                <p>
                  Ko‘p harflar qo‘shni harflar bilan ulanadi. Alif, dal, zol, ro, zay va vov
                  keyingi harfga ulanmaydi.
                </p>
              </div>
              <div>
                <strong>Cho‘ziq unlilar</strong>
                <p>
                  Alif «a», vov «u», ya esa «i» tovushini cho‘zadi: «bā», «bū», «bī».
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {tab === 'words' && (
        <section className="words-section">
          <div className="harakat-intro">
            <span className="eyebrow">O‘qishga mashq</span>
            <h2>Birinchi so‘zlar</h2>
            <p>
              Harflarni o‘rganib bo‘ldingizmi? Endi eng ko‘p ishlatiladigan diniy so‘z va
              iboralarni o‘qishni mashq qiling.
            </p>
          </div>
          <div className="reading-words-grid">
            {readingWords.map((word) => (
              <button
                type="button"
                key={word.latin}
                className="reading-word-card"
                onClick={() => speakArabic(word.arabic, 0.6)}
              >
                <span className="reading-word-arabic" lang="ar" dir="rtl">
                  {word.arabic}
                </span>
                <span className="reading-word-latin">{word.latin}</span>
                <span className="reading-word-meaning">{word.meaning}</span>
                <span className="reading-word-audio">
                  <Volume2 size={14} /> Tinglash
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {tab === 'quiz' && (
        <section className="quiz-section">
          <div className="quiz-side">
            <span className="eyebrow">Mashq</span>
            <h2>Harflarni mustahkamlang</h2>
            <p>
              O‘yin shaklida harflarni tanib olishni mashq qiling. Har to‘g‘ri javobdan
              so‘ng yangi harf chiqadi.
            </p>
            <div className="quiz-rules">
              <div>
                <span>1</span>
                <p>Harfni ko‘ring va ovozini eshiting.</p>
              </div>
              <div>
                <span>2</span>
                <p>To‘g‘ri nomni to‘rtta variant orasidan tanlang.</p>
              </div>
              <div>
                <span>3</span>
                <p>Har kuni 5 daqiqa mashq qiling — natija tez ko‘rinadi.</p>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-soft btn-small"
              onClick={() => {
                setTab('letters')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              <RotateCcw size={15} /> Harflarni takrorlash
            </button>
          </div>
          <AlphabetQuiz showCyrillic={showCyrillic} />
        </section>
      )}

      {selected && (
        <LetterDetail
          letter={selected}
          onClose={() => setSelected(null)}
          showCyrillic={showCyrillic}
        />
      )}
    </div>
  )
}
