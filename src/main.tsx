import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import { PlayerProvider } from './context/PlayerContext'
import { PrayerProvider } from './context/PrayerContext'
import './styles.css'

registerSW({ immediate: true })

const root = document.getElementById('root')
if (!root) throw new Error('Root element topilmadi')

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <PlayerProvider>
            <PrayerProvider>
              <App />
            </PrayerProvider>
          </PlayerProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
