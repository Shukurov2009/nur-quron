import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  BookOpenCheck,
  Check,
  Copy,
  Droplets,
  Info,
  ListChecks,
  RotateCcw,
  Sparkles,
  Volume2,
} from 'lucide-react'
import {
  prayerDuas,
  prayerRakats,
  salahSteps,
  wuduSteps,
  type GuideStep,
} from '../data/prayerGuide'
import { PrayerFigure } from '../components/PrayerFigure'
import { readStorage, writeStorage } from '../lib/storage'
import { copyText } from '../lib/utils'
import { speakArabic } from '../lib/speech'

type Tab = 'wudu' | 'salah' | 'duas' | 'rakats'

const tabs: Array<{ id: Tab; label: string; icon: typeof Droplets }> = [
  { id: 'wudu', label: 'Tahorat', icon: Droplets },
  { id: 'salah', label: 'Namoz', icon: BookOpenCheck },
  { id: 'duas', label: 'Duolar', icon: Sparkles },
  { id: 'rakats', label: 'Rakatlar', icon: ListChecks },
]

interface LearnProgress {
  wudu: string[]
  salah: string[]
}

const PROGRESS_KEY = 'nur-learn-progress'

function DuaCard({
  title,
  arabic,
  translit,
  translation,
}: {
  title: string
  arabic: string
  translit: string
  translation: string
}) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    const ok = await copyText(`${arabic}\n\n${translit}\n\n${translation}`)
    if (ok) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    }
  }

  return (
    <article className="dua-card">
      <header>
        <h3>{title}</h3>
        <div className="dua-actions">
          <button
            type="button"
            className="icon-btn small"
            onClick={() => speakArabic(arabic, 0.65)}
            aria-label={`${title}ni eshitish`}
            title="Talaffuzni eshitish"
          >
            <Volume2 size={16} />
          </button>
          <button
            type="button"
            className="icon-btn small"
            onClick={copy}
            aria-label={`${title}ni nusxalash`}
            title="Nusxalash"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </header>
      <p className="dua-arabic" lang="ar" dir="rtl">
        {arabic}
      </p>
      <p className="dua-translit">{translit}</p>
      <p className="dua-translation">{translation}</p>
      {copied && <span className="copied-flag">Nusxalandi</span>}
    </article>
  )
}

function GuideList({
  steps,
  done,
  onToggle,
}: {
  steps: GuideStep[]
  done: string[]
  onToggle: (id: string) => void
}) {
  return (
    <ol className="guide-steps">
      {steps.map((step, index) => {
        const isDone = done.includes(step.id)
        return (
          <li key={step.id} className={`guide-step${isDone ? ' done' : ''}`}>
            <div className="guide-step-number">{isDone ? <Check size={17} /> : index + 1}</div>
            <div className="guide-step-body">
              <div className="guide-step-head">
                <div>
                  <h3>{step.title}</h3>
                  {step.subtitle && <span>{step.subtitle}</span>}
                </div>
                {step.count && <span className="step-count">{step.count}</span>}
              </div>
              <p>{step.body}</p>
              {step.arabic && (
                <div className="step-dua">
                  <p className="step-arabic" lang="ar" dir="rtl">
                    {step.arabic}
                  </p>
                  {step.translit && <p className="step-translit">{step.translit}</p>}
                  {step.translation && <p className="step-translation">{step.translation}</p>}
                  <button
                    type="button"
                    className="btn btn-soft btn-small"
                    onClick={() => speakArabic(step.arabic || '', 0.65)}
                  >
                    <Volume2 size={14} /> Tinglash
                  </button>
                </div>
              )}
              {step.tip && (
                <p className="step-tip">
                  <Info size={14} /> {step.tip}
                </p>
              )}
              <button
                type="button"
                className={`step-check${isDone ? ' done' : ''}`}
                onClick={() => onToggle(step.id)}
              >
                <Check size={15} /> {isDone ? 'O‘rganildi' : 'O‘rganildi deb belgilash'}
              </button>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function LearnPrayerPage() {
  const [tab, setTab] = useState<Tab>('wudu')
  const [progress, setProgress] = useState<LearnProgress>(() =>
    readStorage<LearnProgress>(PROGRESS_KEY, { wudu: [], salah: [] }),
  )

  const toggle = (section: keyof LearnProgress, id: string) => {
    setProgress((current) => {
      const list = current[section]
      const next = list.includes(id) ? list.filter((item) => item !== id) : [...list, id]
      const value = { ...current, [section]: next }
      writeStorage(PROGRESS_KEY, value)
      return value
    })
  }

  const resetProgress = () => {
    const value = { wudu: [], salah: [] }
    setProgress(value)
    writeStorage(PROGRESS_KEY, value)
  }

  const wuduPercent = useMemo(
    () => Math.round((progress.wudu.length / wuduSteps.length) * 100),
    [progress.wudu.length],
  )
  const salahPercent = useMemo(
    () => Math.round((progress.salah.length / salahSteps.length) * 100),
    [progress.salah.length],
  )

  return (
    <div className="page learn-page">
      <header className="page-head">
        <div>
          <span className="eyebrow">
            <BookOpenCheck size={14} /> Qadam-baqadam
          </span>
          <h1>Namozni o‘rganish</h1>
          <p>
            Tahoratdan boshlab namozning har bir harakatigacha — sodda tushuntirish, arabcha
            matn, talaffuz va tarjima bilan.
          </p>
        </div>
        <div className="page-head-stat">
          <Droplets size={32} />
          <strong>
            {progress.wudu.length + progress.salah.length} / {wuduSteps.length + salahSteps.length}
          </strong>
          <span>o‘rganilgan qadam</span>
        </div>
      </header>

      <div className="alphabet-tabs learn-tabs" role="tablist" aria-label="Namoz o‘rganish bo‘limlari">
        {tabs.map((item) => (
          <button
            type="button"
            key={item.id}
            role="tab"
            aria-selected={tab === item.id}
            className={tab === item.id ? 'active' : ''}
            onClick={() => setTab(item.id)}
          >
            <item.icon size={18} />
            <strong>{item.label}</strong>
          </button>
        ))}
      </div>

      {tab === 'wudu' && (
        <section className="wudu-section">
          <div className="learn-intro">
            <div>
              <span className="eyebrow">Tahorat</span>
              <h2>Namozning kaliti — poklik</h2>
              <p>
                Namozga turishdan oldin tahorat olish kerak. Tahorat — yuz, qo‘l, bosh va
                oyoqlarni belgilangan tartibda yuvish. Quyidagi qadamlarni ketma-ket bajaring.
              </p>
            </div>
            <div className="learn-progress">
              <div className="learn-progress-ring" style={{ '--value': `${wuduPercent}%` } as CSSProperties}>
                <strong>{wuduPercent}%</strong>
              </div>
              <span>tahorat qadamlari</span>
            </div>
          </div>

          <div className="learn-note">
            <Info size={18} />
            <p>
              Suv tejash — sunnat. Har bir a’zoni 3 martadan ko‘p yuvish kerak emas. Suv
              bo‘lmasa yoki ishlatish mumkin bo‘lmasa, tayammum qilinadi.
            </p>
          </div>

          <GuideList
            steps={wuduSteps}
            done={progress.wudu}
            onToggle={(id) => toggle('wudu', id)}
          />

          <div className="learn-actions-row">
            <button type="button" className="btn btn-soft btn-small" onClick={resetProgress}>
              <RotateCcw size={15} /> Progressni tozalash
            </button>
            <button type="button" className="btn btn-gold btn-small" onClick={() => setTab('salah')}>
              Namozga o‘tish <Check size={15} />
            </button>
          </div>
        </section>
      )}

      {tab === 'salah' && (
        <section className="salah-section">
          <div className="learn-intro">
            <div>
              <span className="eyebrow">Namoz</span>
              <h2>Namoz qanday o‘qiladi?</h2>
              <p>
                Namoz — qiyam, ruku, sajda va o‘tirishlardan iborat ibodat. Quyida bir
                rakatning asosiy harakatlari va o‘qiladigan duolar keltirilgan.
              </p>
            </div>
            <div className="learn-progress">
              <div className="learn-progress-ring" style={{ '--value': `${salahPercent}%` } as CSSProperties}>
                <strong>{salahPercent}%</strong>
              </div>
              <span>namoz qadamlari</span>
            </div>
          </div>

          <div className="learn-note gold">
            <Sparkles size={18} />
            <p>
              Yangi boshlovchi uchun maslahat: avval harakatlarni sekin o‘rganing, keyin
              duolarni qo‘shing. Kamida Fotiha va Tashahhudni yodlab oling.
            </p>
          </div>

          <div className="salah-steps">
            {salahSteps.map((step, index) => {
              const isDone = progress.salah.includes(step.id)
              return (
                <article className={`salah-step${isDone ? ' done' : ''}`} key={step.id}>
                  <div className="salah-step-visual">
                    <span className="salah-step-number">{index + 1}</span>
                    <PrayerFigure variant={step.figure} />
                  </div>
                  <div className="salah-step-content">
                    <div className="guide-step-head">
                      <div>
                        <h3>{step.title}</h3>
                        {step.subtitle && <span>{step.subtitle}</span>}
                      </div>
                      {step.count && <span className="step-count">{step.count}</span>}
                    </div>
                    <p>{step.body}</p>
                    {step.arabic && (
                      <div className="step-dua">
                        <p className="step-arabic" lang="ar" dir="rtl">
                          {step.arabic}
                        </p>
                        {step.translit && <p className="step-translit">{step.translit}</p>}
                        {step.translation && (
                          <p className="step-translation">{step.translation}</p>
                        )}
                        <button
                          type="button"
                          className="btn btn-soft btn-small"
                          onClick={() => speakArabic(step.arabic || '', 0.65)}
                        >
                          <Volume2 size={14} /> Tinglash
                        </button>
                      </div>
                    )}
                    {step.tip && (
                      <p className="step-tip">
                        <Info size={14} /> {step.tip}
                      </p>
                    )}
                    <button
                      type="button"
                      className={`step-check${isDone ? ' done' : ''}`}
                      onClick={() => toggle('salah', step.id)}
                    >
                      <Check size={15} /> {isDone ? 'O‘rganildi' : 'O‘rganildi deb belgilash'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>

          <div className="learn-actions-row">
            <button type="button" className="btn btn-soft btn-small" onClick={resetProgress}>
              <RotateCcw size={15} /> Progressni tozalash
            </button>
            <button type="button" className="btn btn-gold btn-small" onClick={() => setTab('duas')}>
              Duolarni o‘rganish <Check size={15} />
            </button>
          </div>
        </section>
      )}

      {tab === 'duas' && (
        <section className="duas-section">
          <div className="learn-intro">
            <div>
              <span className="eyebrow">Duolar</span>
              <h2>Namozda o‘qiladigan duolar</h2>
              <p>
                Arabcha matn, o‘zbekcha talaffuz va ma’no. Har bir duoni tinglab, bo‘g‘inlab
                takrorlang.
              </p>
            </div>
          </div>
          <div className="duas-grid">
            {prayerDuas.map((dua) => (
              <DuaCard key={dua.title} {...dua} />
            ))}
          </div>
          <div className="learn-note">
            <Info size={18} />
            <p>
              Talaffuz yozuvi yordamchi maqsadda. To‘g‘ri tajvidni ustoz yoki ishonchli
              audio orqali o‘rganish tavsiya etiladi.
            </p>
          </div>
        </section>
      )}

      {tab === 'rakats' && (
        <section className="rakats-section">
          <div className="learn-intro">
            <div>
              <span className="eyebrow">Rakatlar</span>
              <h2>Besh vaqt namoz</h2>
              <p>
                Har bir namozning farz va sunnat rakatlari. Farz — Alloh buyurgan majburiy
                qism, sunnat — Payg‘ambarimiz o‘qigan qo‘shimcha ibodat.
              </p>
            </div>
          </div>

          <div className="rakat-grid">
            {prayerRakats.map((prayer) => (
              <article className="rakat-card" key={prayer.name}>
                <span className="rakat-time">{prayer.time}</span>
                <h3>{prayer.name}</h3>
                <div className="rakat-numbers">
                  <div>
                    <strong>{prayer.farz}</strong>
                    <span>farz rakat</span>
                  </div>
                  <div>
                    <strong>{prayer.sunnat.split(' ')[0]}</strong>
                    <span>sunnat rakat</span>
                  </div>
                </div>
                <p>{prayer.sunnat}</p>
                <small>{prayer.note}</small>
              </article>
            ))}
          </div>

          <div className="rakat-info-grid">
            <div>
              <strong>Farz namozlar</strong>
              <p>
                Bomdod 2, Peshin 4, Asr 4, Shom 3, Xufton 4 rakat farz. Har bir farz
                jamoat bilan o‘qilsa, savobi ko‘p bo‘ladi.
              </p>
            </div>
            <div>
              <strong>Vitr namozi</strong>
              <p>
                Xufton namozidan keyin 3 rakat vitr o‘qiladi. Vitr vojib hisoblanadi va
                kechiktirmasdan ado etiladi.
              </p>
            </div>
            <div>
              <strong>Juma namozi</strong>
              <p>
                Juma kuni Peshin namozi o‘rniga 2 rakat juma namozi jamoat bilan o‘qiladi.
                Imom xutba o‘qiydi.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
