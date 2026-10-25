import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../lib/store.jsx'
import { fmtDate, isValidISO } from '../lib/date.js'
import { SYMPTOMS, symptomById } from '../data/symptoms.js'
import { urgentReason, veryLowMoodStreak } from '../lib/redflags.js'
import Icon from '../components/Icon.jsx'
import { Choices, Dialog, HelplineCard, MultiChips, PageHeader, UrgentCard } from '../components/ui.jsx'
import { MOODS, MOOD_FACE } from './Today.jsx'

const FLOW_ICON = {
  spotting: ['M12 8c1.5 2 2.5 3.5 2.5 5a2.5 2.5 0 0 1-5 0c0-1.5 1-3 2.5-5z'],
  light: ['M12 5c2.5 3.2 4 5.6 4 7.8a4 4 0 0 1-8 0C8 10.6 9.5 8.2 12 5z'],
  medium: ['M9 5c2 2.6 3.2 4.6 3.2 6.4a3.2 3.2 0 0 1-6.4 0C5.8 9.6 7 7.6 9 5z', 'M15.5 8c2 2.6 3.2 4.6 3.2 6.4a3.2 3.2 0 0 1-6.4 0c0-1.8 1.2-3.8 3.2-6.4z'],
  heavy: ['M7 4c1.8 2.3 2.8 4 2.8 5.6a2.8 2.8 0 0 1-5.6 0C4.2 8 5.2 6.3 7 4z', 'M17 4c1.8 2.3 2.8 4 2.8 5.6a2.8 2.8 0 0 1-5.6 0C14.2 8 15.2 6.3 17 4z', 'M12 11c1.8 2.3 2.8 4 2.8 5.6a2.8 2.8 0 0 1-5.6 0c0-1.6 1-3.3 2.8-5.6z'],
}
const EMPTY = { period: null, flow: null, padHourly: null, bigClots: null, pain: 0, painStops: null, painkiller: null, symptoms: [], mood: null, energy: null, sleep: '', meds: '', note: '' }

export default function Log() {
  const { t, lang, state, update, today, showToast } = useApp()
  const params = useParams()
  const nav = useNavigate()
  const date = params.date && isValidISO(params.date) ? params.date : today
  const [f, setF] = useState(() => ({ ...EMPTY, ...(state.logs[date] || {}) }))
  const [dateErr, setDateErr] = useState('')
  const [after, setAfter] = useState(null) // { urgent, lowMood } shown after saving
  const [confirmDel, setConfirmDel] = useState(false)
  useEffect(() => { setF({ ...EMPTY, ...(state.logs[date] || {}) }); setAfter(null) }, [date]) // eslint-disable-line

  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))
  const toggleSym = (id) => setF((x) => ({ ...x, symptoms: x.symptoms.includes(id) ? x.symptoms.filter((s) => s !== id) : [...x.symptoms, id] }))
  const heavy = f.period && f.flow === 'heavy'
  const tracked = state.settings.tracked.filter((id) => symptomById[id])
  const safety = SYMPTOMS.filter((s) => s.safety)

  const changeDate = (d) => {
    if (!isValidISO(d)) return setDateErr(t('ob.dateError'))
    if (d > today) return setDateErr(t('log.futureError'))
    setDateErr('')
    nav(`/log/${d}`, { replace: true })
  }

  const save = async () => {
    const clean = {}
    for (const [k, v] of Object.entries(f)) {
      if (v === null || v === '' || (Array.isArray(v) && !v.length)) continue
      clean[k] = v
    }
    if (!clean.period) { delete clean.flow; delete clean.padHourly; delete clean.bigClots }
    if (clean.flow !== 'heavy') { delete clean.padHourly; delete clean.bigClots }
    if (!clean.pain) { delete clean.painStops; delete clean.painkiller }
    if (clean.sleep !== undefined) clean.sleep = Math.max(0, Math.min(24, Number(clean.sleep) || 0))
    if (clean.note) clean.note = clean.note.slice(0, 280)
    let nextLogs
    await update((s) => {
      const logs = { ...s.logs }
      if (Object.keys(clean).length) logs[date] = clean
      else delete logs[date]
      nextLogs = logs
      return { ...s, logs }
    })
    const urgent = urgentReason(clean, { pregnancy: state.pregnancy.on })
    const lowMood = veryLowMoodStreak(nextLogs, today)
    const msgs = [t('log.saved1'), t('log.saved2'), t('log.saved3')]
    showToast(msgs[Object.keys(nextLogs).length % 3])
    if (urgent || lowMood) { setAfter({ urgent, lowMood }); window.scrollTo({ top: 0, behavior: 'smooth' }) }
    else nav('/')
  }
  const del = async () => {
    await update((s) => { const logs = { ...s.logs }; delete logs[date]; return { ...s, logs } })
    setConfirmDel(false)
    showToast(t('log.deleted'))
    nav('/')
  }

  return (
    <div>
      <PageHeader title={t('log.title')} back sub={t('log.for', { date: fmtDate(date, lang, { weekday: 'long', day: 'numeric', month: 'long' }) })} />

      {after && (
        <div className="space-y-3 mb-5">
          {after.urgent && <UrgentCard reason={after.urgent} />}
          {after.lowMood && <HelplineCard />}
          <Link to="/" className="btn-soft w-full">{t('nav.today')}</Link>
        </div>
      )}

      <div className="mb-5">
        <label className="label" htmlFor="logdate">{t('log.changeDate')}</label>
        <input id="logdate" type="date" className="input" value={date} max={today} onChange={(e) => changeDate(e.target.value)}
          aria-invalid={!!dateErr} aria-describedby={dateErr ? 'date-err' : undefined} />
        {dateErr && <p id="date-err" role="alert" className="text-calm font-semibold mt-2">{dateErr}</p>}
      </div>

      <section className="card mb-4" aria-labelledby="p-h">
        <h2 id="p-h" className="sr-only">{t('log.periodQ')}</h2>
        <Choices label={t('log.periodQ')} value={f.period} onChange={(v) => set('period', v)}
          options={[{ value: true, label: t('log.periodYes'), icon: 'drop' }, { value: false, label: t('log.periodNo'), icon: 'x' }]} />
        {f.period && (
          <Choices label={t('log.flow')} value={f.flow} onChange={(v) => set('flow', v)} columns={4} size="lg"
            options={['spotting', 'light', 'medium', 'heavy'].map((x) => ({ value: x, label: t(`flow.${x}`), paths: FLOW_ICON[x] }))} />
        )}
        {heavy && (
          <div className="rounded-2xl bg-lav/60 p-4">
            <p className="font-semibold mb-3">{t('log.heavyIntro')}</p>
            <YesNo label={t('log.padHourly')} value={f.padHourly} onChange={(v) => set('padHourly', v)} t={t} />
            <YesNo label={t('log.bigClots')} value={f.bigClots} onChange={(v) => set('bigClots', v)} t={t} />
          </div>
        )}
      </section>

      <section className="card mb-4" aria-labelledby="pain-h">
        <h2 id="pain-h" className="label text-lg">{t('log.pain')}</h2>
        <div className="flex items-center gap-3">
          <input type="range" min="0" max="10" step="1" value={f.pain || 0} onChange={(e) => set('pain', Number(e.target.value))}
            className="flex-1 accent-[rgb(var(--accent))] h-12" aria-label={t('log.pain')} aria-valuetext={f.pain ? t('log.painValue', { n: f.pain }) : t('log.painNone')} />
          <span className="font-display text-2xl font-bold w-16 text-right" aria-hidden="true">{f.pain || 0}/10</span>
        </div>
        <p className="hint">{f.pain ? t('log.painValue', { n: f.pain }) : t('log.painNone')}</p>
        {f.pain > 0 && (
          <div className="mt-3 space-y-3">
            <YesNo label={t('log.painStops')} value={f.painStops} onChange={(v) => set('painStops', v)} t={t} />
            <Choices label={t('log.painkiller')} value={f.painkiller} onChange={(v) => set('painkiller', v)} columns={3}
              options={[{ value: 'yes', label: t('common.yes'), toggle: true }, { value: 'no', label: t('common.no'), toggle: true }, { value: 'na', label: t('log.painkillerNA'), toggle: true }]} />
          </div>
        )}
      </section>

      <section className="card mb-4" aria-labelledby="sym-h">
        <h2 id="sym-h" className="label text-lg">{t('log.symptoms')}</h2>
        <MultiChips items={tracked.map((id) => ({ value: id, paths: symptomById[id].paths, label: t(`sym.${id}`) }))} selected={f.symptoms} onToggle={toggleSym} />
        <Link to="/settings#tracked" className="inline-block hint underline underline-offset-4 mt-3 min-h-[44px] pt-2">{t('log.symptomsEdit')}</Link>
        <details className="mt-3 rounded-2xl bg-cream p-3" open={f.symptoms.some((s) => symptomById[s]?.safety)}>
          <summary className="font-bold cursor-pointer min-h-[44px] flex items-center">{t('log.worrying')}</summary>
          <p className="hint mb-3">{t('log.worryingHint')}</p>
          <MultiChips columns={2} items={safety.map((s) => ({ value: s.id, paths: s.paths, label: t(`sym.${s.id}`) }))} selected={f.symptoms} onToggle={toggleSym} />
        </details>
      </section>

      <section className="card mb-4" aria-labelledby="mood-h2">
        <h2 id="mood-h2" className="sr-only">{t('mood.label')}</h2>
        <Choices label={t('mood.label')} value={f.mood} onChange={(v) => set('mood', v)} columns={5} size="lg"
          options={MOODS.map((m) => ({ value: m, label: t(`mood.${m}`), paths: MOOD_FACE[m], toggle: true }))} />
        <Choices label={t('energy.label')} value={f.energy} onChange={(v) => set('energy', v)} columns={3}
          options={['high', 'medium', 'low'].map((e) => ({ value: e, label: t(`energy.${e}`), icon: e === 'low' ? 'moon' : e === 'high' ? 'sparkle' : 'leaf', toggle: true }))} />
        <label className="label" htmlFor="sleep">{t('log.sleep')}</label>
        <div className="flex items-center gap-3 mb-4">
          <input id="sleep" type="number" inputMode="decimal" min="0" max="24" step="0.5" className="input max-w-[7rem]" value={f.sleep} onChange={(e) => set('sleep', e.target.value)} />
          <span>{t('log.sleepHours', { n: '' }).trim()}</span>
        </div>
        <label className="label" htmlFor="meds">{t('log.meds')} <span className="hint font-normal">({t('common.optional')})</span></label>
        <input id="meds" className="input mb-4" value={f.meds} maxLength={80} placeholder={t('log.medsPlaceholder')} onChange={(e) => set('meds', e.target.value)} />
        <label className="label" htmlFor="note">{t('log.note')} <span className="hint font-normal">({t('common.optional')})</span></label>
        <textarea id="note" className="input py-3 min-h-[96px]" maxLength={280} value={f.note} placeholder={t('log.notePlaceholder')} onChange={(e) => set('note', e.target.value)} />
      </section>

      <div className="sticky bottom-[calc(80px+env(safe-area-inset-bottom,0px))] lg:bottom-6 z-10 pt-2">
        <button className="btn-primary w-full text-lg shadow-lift" onClick={save}><Icon name="check" />{t('log.save')}</button>
      </div>
      {state.logs[date] && (
        <button className="btn-ghost w-full mt-3" onClick={() => setConfirmDel(true)}><Icon name="trash" size={20} />{t('log.delete')}</button>
      )}

      <Dialog open={confirmDel} onClose={() => setConfirmDel(false)} title={t('log.delete')}
        actions={<><button className="btn-primary" onClick={del}>{t('common.delete')}</button><button className="btn-soft" onClick={() => setConfirmDel(false)}>{t('common.cancel')}</button></>}>
        <p>{t('log.deleteConfirm')}</p>
      </Dialog>
    </div>
  )
}

function YesNo({ label, value, onChange, t }) {
  return (
    <Choices label={label} value={value} onChange={onChange} columns={2}
      options={[{ value: true, label: t('common.yes'), toggle: true }, { value: false, label: t('common.no'), toggle: true }]} />
  )
}
