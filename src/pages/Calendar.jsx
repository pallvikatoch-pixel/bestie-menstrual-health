import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../lib/store.jsx'
import { monthMatrix, parseISO, fmtDate } from '../lib/date.js'
import { isPeriodDay, predictedDays, rangeDays } from '../lib/cycle.js'
import Icon from '../components/Icon.jsx'
import { PageHeader } from '../components/ui.jsx'

export default function Calendar() {
  const { t, lang, state, today, analysis: a, fertilityVisible } = useApp()
  const nav = useNavigate()
  const td = parseISO(today)
  const [ym, setYm] = useState({ y: td.getFullYear(), m: td.getMonth() })
  const cells = monthMatrix(ym.y, ym.m)
  const preg = state.pregnancy.on
  const predicted = preg ? new Set() : predictedDays(a)
  const fertile = !preg && fertilityVisible ? rangeDays(a.fertile) : new Set()
  const monthName = new Date(ym.y, ym.m, 1).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { month: 'long', year: 'numeric' })
  const weekdays = [...Array(7)].map((_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'narrow' }))
  const move = (d) => setYm(({ y, m }) => { const n = new Date(y, m + d, 1); return { y: n.getFullYear(), m: n.getMonth() } })

  return (
    <div>
      <PageHeader title={t('cal.title')} sub={t('cal.tapHint')} />
      <div className="lg:grid lg:grid-cols-[1.7fr_1fr] lg:gap-6 lg:items-start">
      <section className="card !p-3 sm:!p-5 lg:!p-8" aria-labelledby="month-h">
        <div className="flex items-center justify-between mb-3">
          <button className="btn-ghost !px-3" onClick={() => move(-1)} aria-label={t('cal.prev')}><Icon name="left" /></button>
          <h2 id="month-h" className="font-display text-xl font-bold" aria-live="polite">{monthName}</h2>
          <button className="btn-ghost !px-3" onClick={() => move(1)} aria-label={t('cal.next')}><Icon name="right" /></button>
        </div>
        <div className="grid grid-cols-7 text-center text-sm font-bold text-soft mb-1" aria-hidden="true">
          {weekdays.map((w, i) => <span key={i}>{w}</span>)}
        </div>
        <ul className="grid grid-cols-7 gap-y-1" role="list">
          {cells.map((d, i) => {
            if (!d) return <li key={i} aria-hidden="true" />
            const log = state.logs[d]
            const logged = isPeriodDay(log)
            const spot = log?.period && log.flow === 'spotting'
            const pred = !logged && predicted.has(d)
            const fert = !logged && !pred && fertile.has(d)
            const sym = !!(log && ((log.symptoms || []).length || log.mood || log.pain))
            const isToday = d === today
            const future = d > today
            const extra = `${logged ? t('cal.aPeriod') : ''}${pred ? t('cal.aPredicted') : ''}${fert ? t('cal.aFertile') : ''}${sym ? t('cal.aSymptom') : ''}${isToday ? t('cal.aToday') : ''}`
            return (
              <li key={d} className="flex justify-center">
                <button
                  disabled={future}
                  onClick={() => nav(`/log/${d}`)}
                  aria-label={t('cal.dayLabel', { date: fmtDate(d, lang, { day: 'numeric', month: 'long' }), extra })}
                  className={`relative w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 grid place-items-center rounded-full font-bold transition
                    ${logged ? 'bg-accent text-white' : ''}
                    ${pred ? 'border-[2.5px] border-dashed border-accent text-plum' : ''}
                    ${fert ? 'border-2 border-dotted border-calm' : ''}
                    ${spot ? 'bg-blush' : ''}
                    ${isToday && !logged ? 'ring-[3px] ring-plum/70' : ''}
                    ${isToday && logged ? 'ring-[3px] ring-plum/70 ring-offset-2 ring-offset-card' : ''}
                    ${future && !pred && !fert ? 'text-soft/60' : ''}`}
                  style={logged ? { color: 'rgb(var(--card))' } : undefined}
                >
                  {parseISO(d).getDate()}
                  {sym && <span aria-hidden="true" className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${logged ? 'bg-card' : 'bg-calm'}`} />}
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="card mt-4 lg:mt-0" aria-labelledby="leg-h">
        <h2 id="leg-h" className="font-bold mb-3">{t('cal.legend')}</h2>
        <ul className="space-y-3">
          <Legend swatch={<span className="w-8 h-8 rounded-full bg-accent" />} label={t('cal.logged')} />
          {!preg && <Legend swatch={<span className="w-8 h-8 rounded-full border-[2.5px] border-dashed border-accent" />} label={t('cal.predicted')} />}
          {!preg && fertilityVisible && <Legend swatch={<span className="w-8 h-8 rounded-full border-2 border-dotted border-calm" />} label={t('cal.fertile')} />}
          <Legend swatch={<span className="w-8 h-8 rounded-full grid place-items-center"><span className="w-2 h-2 rounded-full bg-calm" /></span>} label={t('cal.symptom')} />
          <Legend swatch={<span className="w-8 h-8 rounded-full ring-[3px] ring-plum/70" />} label={t('cal.today')} />
        </ul>
        {!preg && a.enough && <p className="hint mt-3">{t('today.estimateNote')}</p>}
      </section>
      </div>
    </div>
  )
}
function Legend({ swatch, label }) {
  return <li className="flex items-center gap-3"><span aria-hidden="true" className="shrink-0 flex">{swatch}</span><span>{label}</span></li>
}
