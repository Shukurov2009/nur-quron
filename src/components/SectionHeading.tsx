import type { ReactNode } from 'react'

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function LoadingBlock({ label = 'Yuklanmoqda...' }: { label?: string }) {
  return (
    <div className="loading-block">
      <span className="loader" />
      <p>{label}</p>
    </div>
  )
}

export function ErrorBlock({
  title = 'Xatolik yuz berdi',
  message,
  onRetry,
}: {
  title?: string
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="error-block">
      <strong>{title}</strong>
      {message && <p>{message}</p>}
      {onRetry && (
        <button type="button" className="btn btn-soft" onClick={onRetry}>
          Qayta urinish
        </button>
      )}
    </div>
  )
}
