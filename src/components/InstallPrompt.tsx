import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'
import { readStorage, writeStorage } from '../lib/storage'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'nur-install-dismissed'

export function InstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(() => Boolean(readStorage(DISMISS_KEY, false)))

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setEvent(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!event || dismissed) return null
  const standalone = window.matchMedia('(display-mode: standalone)').matches
  if (standalone) return null

  const dismiss = () => {
    setDismissed(true)
    writeStorage(DISMISS_KEY, true)
  }

  const install = async () => {
    await event.prompt()
    const choice = await event.userChoice
    if (choice.outcome === 'accepted') setEvent(null)
  }

  return (
    <div className="install-banner">
      <span className="install-icon">
        <Download size={20} />
      </span>
      <div>
        <strong>Nurni telefoningizga o‘rnating</strong>
        <p>Tezroq ochiladi, oflayn o‘qish va bildirishnomalar qulay bo‘ladi.</p>
      </div>
      <button type="button" className="btn btn-gold btn-small" onClick={install}>
        O‘rnatish
      </button>
      <button type="button" className="toast-close" onClick={dismiss} aria-label="Yopish">
        <X size={16} />
      </button>
    </div>
  )
}
