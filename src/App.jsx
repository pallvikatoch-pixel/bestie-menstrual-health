import { useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { useApp } from './lib/store.jsx'
import Layout from './components/Layout.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { Flower } from './components/ui.jsx'
import Welcome from './pages/Welcome.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Lock from './pages/Lock.jsx'
import Today from './pages/Today.jsx'
import Log from './pages/Log.jsx'
import Calendar from './pages/Calendar.jsx'
import Insights from './pages/Insights.jsx'
import Doctor from './pages/Doctor.jsx'
import Visit from './pages/Visit.jsx'
import Learn from './pages/Learn.jsx'
import Lesson from './pages/Lesson.jsx'
import Blooms from './pages/Blooms.jsx'
import FeelBetter from './pages/FeelBetter.jsx'
import Ask from './pages/Ask.jsx'
import Reminders from './pages/Reminders.jsx'
import Pregnancy from './pages/Pregnancy.jsx'
import Settings from './pages/Settings.jsx'
import SetupQuestions from './pages/SetupQuestions.jsx'
import Privacy from './pages/Privacy.jsx'

const FAVICON = {
  normal: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='30' fill='%23F6DDE5'/%3E%3Cg fill='%23B4567A'%3E%3Ccircle cx='32' cy='20' r='9'/%3E%3Ccircle cx='44' cy='30' r='9'/%3E%3Ccircle cx='39' cy='44' r='9'/%3E%3Ccircle cx='25' cy='44' r='9'/%3E%3Ccircle cx='20' cy='30' r='9'/%3E%3C/g%3E%3Ccircle cx='32' cy='33' r='6' fill='%23FBE5D5'/%3E%3C/svg%3E",
  discreet: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect x='12' y='6' width='40' height='52' rx='6' fill='%23E9E2F8'/%3E%3Crect x='12' y='6' width='8' height='52' rx='3' fill='%2364526A'/%3E%3Cpath d='M26 22h18M26 32h18M26 42h12' stroke='%2364526A' stroke-width='4' stroke-linecap='round'/%3E%3C/svg%3E",
}

export default function App() {
  const { status, pub, state, appName } = useApp()
  const loc = useLocation()

  // Apply display settings: language, text size, contrast, name and icon (discreet mode).
  useEffect(() => {
    const h = document.documentElement
    h.lang = pub.lang
    h.classList.remove('ts-1', 'ts-2')
    if (pub.textSize) h.classList.add(`ts-${pub.textSize}`)
    h.classList.toggle('hc', !!pub.contrast)
    // Theme: light pink (default), dark, or match the phone
    if (pub.theme === 'system') h.removeAttribute('data-theme')
    else h.setAttribute('data-theme', pub.theme === 'dark' ? 'dark' : 'light')
    const dark = pub.theme === 'dark' || (pub.theme === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#221A27' : '#FFF5F8')
    document.title = appName
    const link = document.getElementById('favicon')
    if (link) link.href = pub.discreet ? FAVICON.discreet : FAVICON.normal
  }, [pub, appName])

  if (status === 'loading') return <Splash />
  if (status === 'locked') return <Lock />
  if (status === 'welcome') return <Welcome />
  if (state && !state.onboarding.done) return <Onboarding />

  return (
    <Layout>
      <ErrorBoundary resetKey={loc.pathname} lang={pub.lang}>
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/log" element={<Log />} />
          <Route path="/log/:date" element={<Log />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/doctor" element={<Doctor />} />
          <Route path="/visit" element={<Visit />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/:id" element={<Lesson />} />
          <Route path="/blooms" element={<Blooms />} />
          <Route path="/feel-better" element={<FeelBetter />} />
          <Route path="/ask" element={<Ask />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/pregnancy" element={<Pregnancy />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/setup" element={<SetupQuestions />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<Today />} />
        </Routes>
      </ErrorBoundary>
    </Layout>
  )
}

function Splash() {
  const [slow, setSlow] = useState(false)
  useEffect(() => { const id = setTimeout(() => setSlow(true), 400); return () => clearTimeout(id) }, [])
  return (
    <div className="min-h-screen grid place-items-center" role="status" aria-label="Loading">
      {slow && <Flower size={64} className="breathe" petal="rgb(var(--accent) / 0.5)" />}
    </div>
  )
}
