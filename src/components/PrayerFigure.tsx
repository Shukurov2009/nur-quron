import type { GuideStep } from '../data/prayerGuide'

export function PrayerFigure({ variant = 'qiyam' }: { variant?: GuideStep['figure'] }) {
  return (
    <div className={`prayer-figure figure-${variant}`} aria-hidden="true">
      <svg viewBox="0 0 180 180" role="img">
        <defs>
          <linearGradient id="figure-glow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity=".16" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle cx="90" cy="90" r="76" fill="url(#figure-glow)" />
        <path
          d="M30 148h120M42 148c0-10 22-18 48-18s48 8 48 18"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".25"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d="M48 146h84" stroke="currentColor" strokeOpacity=".45" strokeWidth="3" strokeLinecap="round" />
        <g fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
          {variant === 'takbir' && (
            <>
              <circle cx="90" cy="46" r="12" fill="currentColor" fillOpacity=".16" />
              <path d="M90 59v48M90 69l-22-18M90 69l22-18M90 107l-13 36M90 107l13 36" />
              <path d="M70 65l-8-12M110 65l8-12" />
            </>
          )}
          {variant === 'qiyam' && (
            <>
              <circle cx="90" cy="46" r="12" fill="currentColor" fillOpacity=".16" />
              <path d="M90 59v48M90 73c-9 2-16 7-18 14M90 73c9 2 16 7 18 14M90 107l-13 36M90 107l13 36" />
              <path d="M72 88c12 7 24 7 36 0" strokeOpacity=".55" />
            </>
          )}
          {variant === 'qavma' && (
            <>
              <circle cx="90" cy="46" r="12" fill="currentColor" fillOpacity=".16" />
              <path d="M90 59v48M90 62l-19 26M90 62l19 26M90 107l-13 36M90 107l13 36" />
            </>
          )}
          {variant === 'ruku' && (
            <>
              <circle cx="123" cy="79" r="12" fill="currentColor" fillOpacity=".16" />
              <path d="M112 85c-12 2-26 6-36 17M76 102v-24M76 102l-12 36M76 102l10 37" />
              <path d="M76 93l36-8M76 82l36 8" />
            </>
          )}
          {variant === 'sujud' && (
            <>
              <circle cx="118" cy="116" r="11" fill="currentColor" fillOpacity=".16" />
              <path d="M108 118c-12 2-26 6-36 14M72 132v-24M72 132l-12 12M72 132l12 12" />
              <path d="M72 118l38 2M72 108l38-2" />
            </>
          )}
          {variant === 'jalsa' && (
            <>
              <circle cx="88" cy="54" r="12" fill="currentColor" fillOpacity=".16" />
              <path d="M88 67v40M88 78l-20 17M88 78l20 17M88 107c-15 7-26 16-30 27M88 107c14 7 24 16 28 27" />
            </>
          )}
          {variant === 'tashahhud' && (
            <>
              <circle cx="88" cy="54" r="12" fill="currentColor" fillOpacity=".16" />
              <path d="M88 67v40M88 78l-20 17M88 78l19 12M88 107c-15 7-26 16-30 27M88 107c14 7 24 16 28 27" />
              <path d="M107 90l4-17" strokeOpacity=".9" />
            </>
          )}
          {variant === 'salam' && (
            <>
              <circle cx="88" cy="54" r="12" fill="currentColor" fillOpacity=".16" />
              <path d="M88 67v40M88 78l-20 17M88 78l20 17M88 107c-15 7-26 16-30 27M88 107c14 7 24 16 28 27" />
              <path d="M78 50c-5-2-9-2-13 1M98 50c5-2 9-2 13 1" strokeOpacity=".45" />
            </>
          )}
        </g>
        {variant === 'sujud' && (
          <path d="M104 126h38" stroke="currentColor" strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" />
        )}
      </svg>
    </div>
  )
}
