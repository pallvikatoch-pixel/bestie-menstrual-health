import { useApp } from '../lib/store.jsx'
import { fmtDate } from '../lib/date.js'
import { CONFIG } from '../config.js'
import Icon from '../components/Icon.jsx'
import { PageHeader } from '../components/ui.jsx'

// One printable page for a doctor. Built only from the user's own logs; no diagnosis.
export default function Visit() {
  const { t, lang, state, today, analysis: a, redflags, discreet } = useApp()
  const logs = state.logs
  const days = Object.keys(logs).sort()
  const symCount = {}
  let maxPain = 0, stops = 0, nohelp = 0
  const meds = new Set()
  for (const d of days) {
    const l = logs[d]
    ;(l.symptoms || []).forEach((s) => { symCount[s] = (symCount[s] || 0) + 1 })
    if (l.pain > maxPain) maxPain = l.pain
    if (l.painStops) stops++
    if (l.painkiller === 'no') nohelp++
    if (l.meds) meds.add(l.meds)
  }
  const recent = a.periods.slice(-(CONFIG.cyclesUsed + 1))
  const cycleOf = (start) => a.cycles.find((c) => c.start === start)

  return (
    <div>
      <div className="no-print"><PageHeader title={t('visit.title')} back /></div>
      <button className="btn-primary w-full mb-4 no-print" onClick={() => window.print()}><Icon name="print" />{t('visit.print')}</button>
      <article className="card print-page text-[15px] leading-snug">
        <h1 className="text-2xl font-bold">{t('visit.title')}</h1>
        <p className="hint mb-3">{t(discreet ? 'visit.discreetMade' : 'visit.made', { date: fmtDate(today, lang, { day: 'numeric', month: 'long', year: 'numeric' }) })}</p>

        <h2 className="font-bold text-lg mt-2">{t('visit.cycles')}</h2>
        {recent.length ? (
          <table className="w-full text-left border-collapse my-1">
            <thead><tr className="border-b-2 border-line"><th className="py-1 pr-2">{t('visit.start')}</th><th className="py-1 pr-2">{t('visit.periodLen')}</th><th className="py-1">{t('visit.cycleLen')}</th></tr></thead>
            <tbody>
              {recent.map((p) => (
                <tr key={p.start} className="border-b border-line">
                  <td className="py-1 pr-2">{fmtDate(p.start, lang, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="py-1 pr-2">{t('common.days', { n: p.length })}</td>
                  <td className="py-1">{cycleOf(p.start) ? t('common.days', { n: cycleOf(p.start).length }) : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p>{t('visit.none')}</p>}
        {a.enough && <p className="mt-1">{t('ins.average')}: {a.median} · {t('ins.range')}: {a.min}–{a.max} · {a.irregular ? t('ins.irregular') : t('ins.regular')}</p>}

        <h2 className="font-bold text-lg mt-3">{t('visit.symptoms')}</h2>
        <p>{Object.keys(symCount).length ? Object.entries(symCount).sort((x, y) => y[1] - x[1]).map(([s, n]) => `${t(`sym.${s}`)} (${n})`).join(', ') : t('visit.none')}</p>

        <h2 className="font-bold text-lg mt-3">{t('visit.pain')}</h2>
        <p>{t('visit.painSummary', { max: maxPain, stops, nohelp })}</p>

        <h2 className="font-bold text-lg mt-3">{t('visit.meds')}</h2>
        <p>{meds.size ? [...meds].join(', ') : t('visit.none')}</p>

        {redflags.length > 0 && (<>
          <h2 className="font-bold text-lg mt-3">{t('visit.noticed')}</h2>
          <ul className="list-disc pl-5">
            {redflags.map((r) => <li key={r.id}>{t(`doc.${r.id}.title`)} ({r.days.map((d) => fmtDate(d, lang)).join(', ')})</li>)}
          </ul>
        </>)}

        <h2 className="font-bold text-lg mt-3">{t('visit.questions')}</h2>
        <ul className="list-disc pl-5">{['q1', 'q2', 'q3', 'q4'].map((q) => <li key={q}>{t(`visit.${q}`)}</li>)}</ul>
      </article>
    </div>
  )
}
