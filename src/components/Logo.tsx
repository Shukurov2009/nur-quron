export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="logo">
      <span className="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 48 48" width="34" height="34">
          <path
            d="M31.8 8.6a17.6 17.6 0 1 0 0 30.8 19.8 19.8 0 1 1 0-30.8Z"
            fill="currentColor"
          />
          <path
            d="m38.2 7 1.3 3.6 3.7 1.3-3.7 1.3-1.3 3.6-1.3-3.6-3.7-1.3 3.7-1.3L38.2 7Z"
            fill="currentColor"
            opacity=".8"
          />
        </svg>
      </span>
      {!compact && (
        <span className="logo-text">
          <strong>Nur</strong>
          <small>Qur’on yo‘ldoshi</small>
        </span>
      )}
    </div>
  )
}
