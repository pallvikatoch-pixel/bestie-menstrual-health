import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../lib/store.jsx'
import { addDays, diffDays, fmtDate, isValidISO } from '../lib/date.js'
import { CONFIG } from '../config.js'
import { PREG_SOURCES, PREG_WEEKS } from '../content/pregnancy.js'
import Icon from '../components/Icon.jsx'
import { Dialog, PageHeader, Sources } from '../components/ui.jsx'

const DANGER = ['bleeding', 'pain', 'headache', 'swelling', 'fever', 'fluid', 'movement']

export default function Pregnancy() {
  const { t, L, lang, state, update, today, fertilityVisible, analysis } = useApp()
  const p = state.pregnancy
  const [confirmed, setConfirmed] = useState(false)
  const [lmp, setLmp] = useState(analysis.lastStart || '')
  const [err, setErr] = useState('')
  const [offOpen, setOffOpen] = useState(false)

  if (!fertilityVisible && !p.on) {
    return (<div><PageHeader title={t('preg.title')} back /><div className="card"><p>{t('preg.ageNote')}</p><Link to="/settings" className="btn-soft mt-3">{t('nav.settings')}</Link></div></div>)
  }

  if (!p.on) {
    const turnOn = () => {
      const days = isValidISO(lmp) ? diffDays(lmp, today) : -1
      if (!isValidISO(lmp) || lmp > today || days > 42 * 7) return setErr(t('preg.dateError'))
      update((s) => ({ ...s, pregnancy: { on: true, lmp } }))
    }
    return (
      <div className="space-y-4">
        <PageHeader title={t('preg.title')} back />
        <div className="card space-y-4">
          <p>{t('preg.offIntro')}</p>
          <fieldset>
            <legend className="label">{t('preg.confirmQ')}</legend>
            <div className="grid grid-cols-2 gap-2">
              <button className="chip justify-center" role="radio" aria-checked={confirmed} onClick={() => setConfirmed(true)}>{t('common.yes')}</button>
              <button className="chip justify-center" role="radio" aria-checked={!confirmed} onClick={() => setConfirmed(false)}>{t('common.notSure')}</button>
            </div>
          </fieldset>
          {confirmed && (
            <>
              <div>
                <label className="label" htmlFor="lmp">{t('preg.lmp')}</label>
                <input id="lmp" type="date" className="input" max={today} value={lmp} onChange={(e) => { setLmp(e.target.value); setErr('') }} aria-invalid={!!err} aria-describedby={err ? 'lmp-err' : undefined} />
                {err && <p id="lmp-err" role="alert" className="text-calm font-semibold mt-2">{err}</p>}
              </div>
              <button className="btn-primary w-full" onClick={turnOn}>{t('preg.turnOn')}</button>
            </>
          )}
        </div>
        <Danger t={t} />
      </div>
    )
  }

  const days = diffDays(p.lmp, today)
  const week = Math.floor(days / 7) + 1
  const due = addDays(p.lmp, CONFIG.pregnancyDays)
  const info = PREG_WEEKS.find((w) => week >= w.from && week <= w.to) || PREG_WEEKS[PREG_WEEKS.length - 1]
  return (
    <div className="space-y-4">
      <PageHeader title={t('preg.title')} back />
      <section className="rounded-[2rem] bg-gradient-to-br from-lav to-blush p-6">
        <p className="font-display"><span className="block text-5xl font-bold">{t('preg.week', { n: week })}</span><span className="text-lg font-semibold">{t('preg.weekLabel')}</span></p>
        <p className="mt-3 font-bold">{t('preg.due', { date: fmtDate(due, lang, { day: 'numeric', month: 'long', year: 'numeric' }) })} <span className="text-sm rounded-full bg-card/80 px-2 py-0.5">{t('common.estimate')}</span></p>
        <p className="hint !text-plum mt-1">{t('preg.dueNote')}</p>
      </section>
      <section className="card">
        <h2 className="text-xl font-bold mb-1">{t('preg.thisWeek')}</h2>
        <p>{L(info)}</p>
        <Sources keys={info.src} className="mt-2" />
      </section>
      <section className="card">
        <h2 className="text-xl font-bold mb-1 flex gap-2 items-center"><Icon name="calendar" />{t('preg.checkups')}</h2>
        <p>{t('preg.checkupsBody')}</p>
        <Link to="/reminders" className="inline-block font-bold underline underline-offset-4 mt-1 min-h-[44px] pt-2">{t('today.reminders')}</Link>
      </section>
      <Danger t={t} />
      <Sources keys={PREG_SOURCES} />
      <button className="btn-ghost w-full" onClick={() => setOffOpen(true)}>{t('preg.off')}</button>
      <Dialog open={offOpen} onClose={() => setOffOpen(false)} title={t('preg.off')}
        actions={<>
          <button className="btn-primary" onClick={() => { update((s) => ({ ...s, pregnancy: { on: false, lmp: null } })); setOffOpen(false) }}>{t('preg.offConfirmBtn')}</button>
          <button className="btn-soft" onClick={() => setOffOpen(false)}>{t('common.cancel')}</button>
        </>}>
        <p>{t('preg.offConfirm')}</p>
      </Dialog>
    </div>
  )
}

function Danger({ t }) {
  return (
    <section className="rounded-blob border-[3px] border-calm bg-card p-5" aria-labelledby="danger-h">
      <h2 id="danger-h" className="text-xl font-bold mb-1">{t('preg.danger')}</h2>
      <p className="mb-2">{t('preg.dangerIntro')}</p>
      <ul className="space-y-1 mb-4">{DANGER.map((d) => <li key={d} className="flex gap-2"><Icon name="info" size={18} className="shrink-0 mt-1 text-calm" />{t(`preg.d.${d}`)}</li>)}</ul>
      <div className="grid grid-cols-2 gap-2">
        <a className="btn-primary" href="tel:108">{t('urgent.call108')}</a>
        <a className="btn-primary" href="tel:112">{t('urgent.call112')}</a>
      </div>
      <Sources keys={['nhsPregnancy']} className="mt-3" />
    </section>
  )
}
