import { Moon, Sun } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { settings, setTheme } = useSettings()
  const isDark =
    settings.theme === 'dark' ||
    (settings.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  return (
    <button
      type="button"
      className={compact ? 'icon-btn' : 'icon-btn labeled'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Yorug‘ rejimga o‘tish' : 'Tungi rejimga o‘tish'}
      title={isDark ? 'Yorug‘ rejim' : 'Tungi rejim'}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
      {!compact && <span>{isDark ? 'Yorug‘' : 'Tungi'}</span>}
    </button>
  )
}
