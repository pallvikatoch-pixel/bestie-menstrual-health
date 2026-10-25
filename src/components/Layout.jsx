import { useEffect, useState } from 'react'
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { useApp, ONBOARDING_QS } from '../lib/store.jsx'
import Icon from './Icon.jsx'
import { Dialog, Flower, Toast } from './ui.jsx'
import { dueReminders, notify } from '../lib/reminders.js'

const NAV = [
  { to: '/', icon: 'today', key: 'nav.today', end: true },
  { to: '/calendar', icon: 'calendar', key: 'nav.calendar' },
  { to: '/insights', icon: 'chart', key: 'nav.insights' },
  { to: '/learn', icon: 'book', key: 'nav.learn' },
  { to: '/ask', icon: 'chat', key: 'nav.ask' },
]
// Extra links shown only in the desktop sidebar
const SIDE_EXTRA = [
  { to: '/doctor', icon: 'steth', key: 'doc.title' },
  { to: '/feel-better', icon: 'heart', key: 'fb.title' },
  { to: '/reminders', icon: 'bell', key: 'rem.title' },
  { to: '/settings', icon: 'gear', key: 'nav.settings' },
]
// Pages that use the wide desktop layout; the rest stay a comfortable reading width
const WIDE = ['/', '/calendar', '/insights', '/learn', '/blooms', '/feel-better', '/settings', '/doctor']

export default function Layout({ children }) {
  const app = useApp()
  const { t, state, update, today, analysis, discreet, appName } = app
  const [banners, setBanners] = useState([])
  const [setupOpen, setSetupOpen] = useState(false)
  const nav = useNavigate()
  const { pathname } = useLocation()
  const wide = WIDE.includes(pathname)

  // Reminders: checked on open and every 30 seconds while the app is open.
  useEffect(() => {
    if (!state) return
    const check = () => {
      const due = dueReminders(state, analysis, today, t, discreet)
      if (!due.length) return
      due.forEach((d) => notify(d.text, appName))
      setBanners((b) => [...b, ...due.filter((d) => !b.some((x) => x.key === d.key))])
      update((s) => ({ ...s, reminders: { ...s.reminders, lastFired: { ...s.reminders.lastFired, ...Object.fromEntries(due.map((d) => [d.key, today])) } } }))
    }
    check()
    const id = setInterval(check, 30000)
    const onTest = () => setBanners((b) => [...b, ...dueReminders(state, analysis, today, t, discreet, true)])
    window.addEventListener('bestie:test-reminder', onTest)
    return () => { clearInterval(id); window.removeEventListener('bestie:test-reminder', onTest) }
  }, [state?.reminders, analysis, today, discreet]) // eslint-disable-line

  // Setup-questions reminder: one week after skipping, at most once a week, until answered or switched off.
  const unanswered = state ? ONBOARDING_QS.filter((q) => !state.onboarding.answered[q]) : []
  const ob = state?.onboarding
  useEffect(() => {
    if (!ob) return
    if (unanswered.length && !ob.remindOff && ob.nextReminder && today >= ob.nextReminder) setSetupOpen(true)
  }, [ob?.nextReminder, ob?.remindOff, today, unanswered.length]) // eslint-disable-line

  // remember when the app was last opened (for the gentle "you're back" message)
  useEffect(() => {
    if (state && state.lastOpen !== today) update((s) => ({ ...s, lastOpen: today }))
  }, [today]) // eslint-disable-line

  const setNext = (patch) => update((s) => ({ ...s, onboarding: { ...s.onboarding, ...patch } }))

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 btn-primary z-50">Skip to content</a>
      <Sidebar t={t} appName={appName} discreet={discreet} flags={app.redflags.length} />
      <header className="lg:hidden sticky top-0 z-30 bg-cream/90 backdrop-blur no-print" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
        <div className="max-w-xl mx-auto px-4 h-16 flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 font-display text-2xl font-bold rounded-xl min-h-[48px]" aria-label={appName}>
            {discreet ? <Icon name="diary" size={28} className="text-soft" /> : <Flower size={30} petal="rgb(var(--accent) / 0.7)" />}
            <span>{appName}</span>
          </Link>
          <span className="flex-1" />
          <Link to="/doctor" className="btn-ghost !px-3" aria-label={t('doc.title')}>
            <span className="relative"><Icon name="steth" />
              {app.redflags.length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-calm border-2 border-cream" aria-hidden="true" />}
            </span>
          </Link>
          <Link to="/settings" className="btn-ghost !px-3" aria-label={t('nav.settings')}><Icon name="gear" /></Link>
        </div>
      </header>

      {banners.length > 0 && (
        <div className="max-w-xl lg:max-w-4xl mx-auto lg:pl-72 lg:pr-8 px-4 space-y-2 mt-2 lg:mt-6 no-print" aria-live="polite">
          {banners.map((b) => (
            <div key={b.key} className="flex items-center gap-3 bg-lav rounded-2xl px-4 py-2">
              <Icon name="bell" size={20} />
              <p className="flex-1"><span className="sr-only">{t('rem.banner')}: </span>{b.text}</p>
              <button className="btn-ghost !px-2" aria-label={t('common.close')} onClick={() => setBanners((x) => x.filter((y) => y.key !== b.key))}><Icon name="x" size={20} /></button>
            </div>
          ))}
        </div>
      )}

      <div className="lg:pl-64">
        <main id="main" className={`max-w-xl mx-auto px-4 pt-4 pb-32 lg:px-10 lg:pt-10 lg:pb-16 ${wide ? 'lg:max-w-6xl' : 'lg:max-w-3xl'}`}>{children}</main>
      </div>

      <nav aria-label={t('nav.main')} className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur border-t border-line no-print"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <ul className="max-w-xl mx-auto grid grid-cols-5">
          {NAV.map((n) => (
            <li key={n.to}>
              <NavLink to={n.to} end={n.end}
                className={({ isActive }) => `flex flex-col items-center justify-center gap-0.5 min-h-[64px] text-[0.8rem] font-bold rounded-2xl ${isActive ? 'text-accent' : 'text-soft'}`}>
                {({ isActive }) => (<>
                  <span className={`grid place-items-center w-12 h-8 rounded-full transition ${isActive ? 'bg-blush' : ''}`}><Icon name={n.icon} size={22} /></span>
                  <span className="leading-tight text-center px-1">{t(n.key)}</span>
                </>)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <Toast />

      <Dialog open={setupOpen} onClose={() => { setSetupOpen(false); setNext({ nextReminder: app.addDays(today, 7) }) }}
        title={discreet ? t('greet.discreet') : t('setup.reminder.title')}
        actions={<>
          <button className="btn-primary" onClick={() => { setSetupOpen(false); setNext({ nextReminder: app.addDays(today, 7) }); nav('/setup') }}>{t('setup.reminder.sure')}</button>
          <button className="btn-soft" onClick={() => { setSetupOpen(false); setNext({ nextReminder: app.addDays(today, 7) }) }}>{t('setup.reminder.later')}</button>
          <button className="btn-ghost" onClick={() => { setSetupOpen(false); setNext({ remindOff: true }) }}>{t('setup.reminder.never')}</button>
        </>}>
        <p>{t('setup.reminder.body')}</p>
      </Dialog>
    </div>
  )
}

// Desktop: a calm left sidebar replaces the top bar and the bottom tabs.
function Sidebar({ t, appName, discreet, flags }) {
  const item = ({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 min-h-[48px] font-bold transition ${isActive ? 'bg-blush text-accent' : 'text-plum hover:bg-blush/50'}`
  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col gap-1 border-r border-line bg-card/70 backdrop-blur px-4 py-6 z-30 no-print" aria-label={t('nav.main')}>
      <Link to="/" className="flex items-center gap-2 font-display text-3xl font-bold px-3 mb-6 rounded-xl min-h-[48px]" aria-label={appName}>
        {discreet ? <Icon name="diary" size={32} className="text-soft" /> : <Flower size={36} petal="rgb(var(--accent) / 0.7)" />}
        <span>{appName}</span>
      </Link>
      <nav aria-label={t('nav.main')}>
        <ul className="space-y-1">
          {NAV.map((n) => <li key={n.to}><NavLink to={n.to} end={n.end} className={item}><Icon name={n.icon} size={22} />{t(n.key)}</NavLink></li>)}
        </ul>
        <hr className="my-4 border-line" />
        <ul className="space-y-1">
          {SIDE_EXTRA.map((n) => (
            <li key={n.to}><NavLink to={n.to} className={item}>
              <span className="relative"><Icon name={n.icon} size={22} />
                {n.to === '/doctor' && flags > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-calm border-2 border-card" aria-hidden="true" />}
              </span>
              <span className="leading-tight">{t(n.key)}</span>
            </NavLink></li>
          ))}
        </ul>
      </nav>
      <p className="mt-auto px-3 text-sm text-soft flex gap-2"><Icon name="shield" size={18} className="shrink-0" />{t('welcome.privacy')}</p>
    </aside>
  )
}
