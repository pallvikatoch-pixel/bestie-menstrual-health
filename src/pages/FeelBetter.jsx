import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../lib/store.jsx'
import { COMFORT, HABITS, ROUTINE_SOURCES, STRETCHES, STRETCH_SECONDS } from '../content/comfort.js'
import { StretchArt } from '../components/Art.jsx'
import Icon from '../components/Icon.jsx'
import { Dialog, Listen, PageHeader, Sources } from '../components/ui.jsx'

const ICONS = { heat: 'heat', bath: 'bath', massage: 'massage', rest: 'rest', drink: 'drinkcup', pill: 'pill', move: 'move', sleep: 'sleep', eat: 'eat', water: 'water', talk: 'talk' }

export default function FeelBetter() {
  const { t, L, state, update } = useApp()
  const [running, setRunning] = useState(false)
  const firstTime = !state.settings.fbNoteSeen
  return (
    <div className="space-y-5">
      <PageHeader title={t('fb.title')} back sub={t('fb.intro')} />

      <Dialog open={firstTime} onClose={() => update((s) => ({ ...s, settings: { ...s.settings, fbNoteSeen: true } }))} title={t('fb.title')}
        actions={<button className="btn-primary" onClick={() => update((s) => ({ ...s, settings: { ...s.settings, fbNoteSeen: true } }))}>{t('fb.gotIt')}</button>}>
        <p>{t('fb.firstNote')}</p>
      </Dialog>

      {running ? <Routine onExit={() => setRunning(false)} /> : (
        <section className="rounded-[2rem] bg-gradient-to-br from-lav to-blush p-5" aria-labelledby="st-h">
          <h2 id="st-h" className="font-display text-2xl font-bold">{t('fb.stretches')}</h2>
          <p className="mb-4">{t('fb.stretchesIntro')}</p>
          <button className="btn-primary w-full mb-4" onClick={() => setRunning(true)}><Icon name="play" size={20} />{t('fb.start')}</button>
          <ul className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {STRETCHES.map((s) => (
              <li key={s.id} className="card !p-4">
                <div className="flex gap-3 items-center mb-2">
                  <span className="w-24 h-16 shrink-0 rounded-2xl bg-cream"><StretchArt id={s.art} /></span>
                  <h3 className="font-bold text-lg">{L(s.name)}</h3>
                </div>
                <ol className="list-decimal pl-5 space-y-0.5">{L(s.steps).map((st, i) => <li key={i}>{st}</li>)}</ol>
                <p className="hint mt-1">{t('fb.hold')}</p>
                <Listen text={() => `${L(s.name)}. ${L(s.steps).join('. ')}`} className="mt-2" />
              </li>
            ))}
          </ul>
          <p className="hint mt-3">{t('fb.routineSource')}</p>
          <Sources keys={ROUTINE_SOURCES} className="mt-1" />
        </section>
      )}

      <CardList title={t('fb.comfort')} items={COMFORT} L={L} />
      <CardList title={t('fb.habits')} items={HABITS} L={L} />

      <div className="card bg-lav/60 flex gap-3">
        <Icon name="steth" className="shrink-0 mt-1" />
        <p>{t('fb.doctorLine')} <Link to="/doctor" className="font-bold underline underline-offset-2">{t('doc.title')}</Link></p>
      </div>
      <p className="hint">{t('common.notMedical')}</p>
    </div>
  )
}

function CardList({ title, items, L }) {
  return (
    <section aria-label={title}>
      <h2 className="text-xl font-bold mb-3">{title}</h2>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((c) => (
          <li key={c.id} className="card !p-4 flex gap-3">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-peach shrink-0"><Icon name={ICONS[c.icon]} /></span>
            <span><span className="block font-bold">{L(c.t)}</span><span className="block">{L(c.b)}</span><Sources keys={c.src} className="mt-1" /></span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Routine({ onExit }) {
  const { t, L, update, today, showToast } = useApp()
  const [i, setI] = useState(0)
  const [left, setLeft] = useState(STRETCH_SECONDS)
  const [paused, setPaused] = useState(false)
  const [done, setDone] = useState(false)
  const s = STRETCHES[i]
  useEffect(() => {
    if (paused || done) return
    const id = setInterval(() => setLeft((x) => x - 1), 1000)
    return () => clearInterval(id)
  }, [paused, done, i])
  useEffect(() => { if (left <= 0) next() }, [left]) // eslint-disable-line
  function next() {
    if (i + 1 >= STRETCHES.length) setDone(true)
    else { setI(i + 1); setLeft(STRETCH_SECONDS) }
  }
  const answer = (v) => {
    update((st) => ({ ...st, logs: { ...st.logs, [today]: { ...(st.logs[today] || {}), afterStretch: v } } }))
    showToast(t('fb.thanks'))
    onExit()
  }
  if (done) {
    return (
      <section className="card text-center" aria-live="polite">
        <h2 className="font-display text-2xl font-bold">{t('fb.endTitle')}</h2>
        <p className="mt-2 mb-4">{t('fb.endQ')}</p>
        <div className="grid grid-cols-3 gap-2">
          {['better', 'same', 'worse'].map((v) => <button key={v} className="chip justify-center" onClick={() => (v === 'worse' ? setDone('worse') : answer(v))}>{t(`fb.${v}`)}</button>)}
        </div>
        {done === 'worse' && (
          <div className="mt-4 text-left rounded-2xl bg-lav/60 p-4">
            <p>{t('fb.doctorLine')}</p>
            <div className="flex flex-col gap-2 mt-3">
              <Link to="/doctor" className="btn-soft">{t('doc.title')}</Link>
              <button className="btn-primary" onClick={() => answer('worse')}>{t('common.done')}</button>
            </div>
          </div>
        )}
      </section>
    )
  }
  return (
    <section className="card text-center" aria-labelledby="run-h">
      <p className="hint">{i + 1} / {STRETCHES.length}</p>
      <h2 id="run-h" className="font-display text-2xl font-bold">{L(s.name)}</h2>
      <div className="relative mx-auto my-4 w-56 h-56 grid place-items-center">
        <div className={`absolute inset-0 rounded-full bg-lav ${paused ? '' : 'breathe'}`} aria-hidden="true" />
        <div className="relative w-40 h-28"><StretchArt id={s.art} /></div>
      </div>
      <p className="font-semibold" aria-hidden="true">{t('fb.breathe')}</p>
      <p className="font-display text-3xl font-bold" aria-live="off">{left}</p>
      <p className="sr-only" aria-live="polite">{left % 10 === 0 ? t('fb.secondsLeft', { n: left }) : ''}</p>
      <ol className="text-left list-decimal pl-5 my-3 space-y-0.5">{L(s.steps).map((st, k) => <li key={k}>{st}</li>)}</ol>
      <div className="grid grid-cols-2 gap-2">
        <button className="btn-soft" onClick={() => setPaused(!paused)}><Icon name={paused ? 'play' : 'pause'} size={20} />{paused ? t('fb.resume') : t('fb.pause')}</button>
        <button className="btn-soft" onClick={next}><Icon name="skip" size={20} />{t('fb.skipStretch')}</button>
      </div>
      <button className="btn-ghost w-full mt-2" onClick={onExit}>{t('common.close')}</button>
    </section>
  )
}
