import { Languages } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'

export function ScriptToggle({ compact = false }: { compact?: boolean }) {
  const { settings, updateSettings } = useSettings()
  const isLatin = settings.script === 'latin'
  return (
    <button
      type="button"
      className={compact ? 'icon-btn' : 'icon-btn labeled'}
      onClick={() =>
        updateSettings({ script: settings.script === 'latin' ? 'cyrillic' : 'latin' })
      }
      title={isLatin ? 'Кириллча таржимага ўтиш' : 'Lotin tarjimasiga o‘tish'}
      aria-label="Tarjima alifbosini almashtirish"
    >
      <Languages size={18} />
      {!compact && <span>{isLatin ? 'Lotin' : 'Кирил'}</span>}
    </button>
  )
}
