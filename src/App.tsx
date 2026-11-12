import { lazy, Suspense } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { LoadingBlock } from './components/SectionHeading'

const HomePage = lazy(() => import('./pages/Home').then((module) => ({ default: module.HomePage })))
const SurahsPage = lazy(() =>
  import('./pages/Surahs').then((module) => ({ default: module.SurahsPage })),
)
const ReaderPage = lazy(() =>
  import('./pages/Reader').then((module) => ({ default: module.ReaderPage })),
)
const MemorizePage = lazy(() =>
  import('./pages/Memorize').then((module) => ({ default: module.MemorizePage })),
)
const AlphabetPage = lazy(() =>
  import('./pages/Alphabet').then((module) => ({ default: module.AlphabetPage })),
)
const PrayerTimesPage = lazy(() =>
  import('./pages/PrayerTimes').then((module) => ({ default: module.PrayerTimesPage })),
)
const LearnPrayerPage = lazy(() =>
  import('./pages/LearnPrayer').then((module) => ({ default: module.LearnPrayerPage })),
)
const SettingsPage = lazy(() =>
  import('./pages/Settings').then((module) => ({ default: module.SettingsPage })),
)

function NotFoundPage() {
  return (
    <div className="page not-found-page">
      <span className="eyebrow">404</span>
      <h1>Sahifa topilmadi</h1>
      <p>Bu manzil mavjud emas yoki ko‘chirilgan bo‘lishi mumkin.</p>
      <Link to="/" className="btn btn-gold">
        Bosh sahifaga qaytish
      </Link>
    </div>
  )
}

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="page">
          <LoadingBlock label="Sahifa yuklanmoqda..." />
        </div>
      }
    >
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="quron" element={<SurahsPage />} />
          <Route path="quron/:surah" element={<ReaderPage />} />
          <Route path="yodlash" element={<MemorizePage />} />
          <Route path="alifbo" element={<AlphabetPage />} />
          <Route path="namoz" element={<PrayerTimesPage />} />
          <Route path="namozni-organish" element={<LearnPrayerPage />} />
          <Route path="sozlamalar" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
