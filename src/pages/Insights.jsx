import { useApp } from '../lib/store.jsx'
import { fmtDate } from '../lib/date.js'
import { CONFIG } from '../config.js'
import { findPatterns, patternText } from '../lib/insights.js'
import Icon from '../components/Icon.jsx'
import { Empty, PageHeader } from '../components/ui.jsx'

export default function Insights() {
  const { t, lang, state, analysis: a } = useApp()
  const cycles = a.cycles.slice(-CONFIG.cyclesUsed)
  const patterns = findPatterns(state.logs, a)

  if (cycles.length < 1) {
    return (<div><PageHeader title={t('ins.title')} /><Empty title={t('ins.empty')} /></div>)
  }
  const lengths = a.usedCycles.map((c) => c.length)
  const avg = lengths.length ? Math.round(lengths.reduce((x, y) => x + y, 0) / lengths.length) : null
  const min = lengths.length ? Math.min(...lengths) : null
  const max = lengths.length ? Math.max(...lengths) : null

  return (
    <div className="space-y-4">
      <PageHeader title={t('ins.title')} />

      {a.enough && (
        <div className="grid grid-cols-3 gap-2">
          <Stat label={t('ins.average')} value={t('common.days', { n: avg })} />
          <Stat label={t('ins.range')} value={`${min}–${max}`} />
          <Stat label={t('ins.avgPeriod')} value={t('common.days', { n: a.avgPeriod })} />
        </div>
      )}

      <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-[1.6fr_1fr] lg:gap-5 lg:items-start">
      <section className="card" aria-labelledby="hist-h">
        <h2 id="hist-h" className="text-xl font-bold mb-1">{t('ins.history')}</h2>
        <Chart cycles={cycles} avg={avg} t={t} lang={lang} />
        {a.suspectGap && <p className="hint mt-2">{t('gap.title')}</p>}
      </section>

      {a.enough && (
        <section className={`card ${a.irregular ? 'border-2 border-calm' : ''}`} aria-labelledby="reg-h">
          <h2 id="reg-h" className="text-xl font-bold flex items-center gap-2">
            {t('ins.regularity')}: <span className={a.irregular ? 'text-calm' : ''}>{a.irregular ? t('ins.irregular') : t('ins.regular')}</span>
          </h2>
          <p className="mt-1">{a.irregular ? t('ins.irregularBody', { n: a.variation, limit: CONFIG.irregularVariationDays }) : t('ins.regularBody', { n: a.variation })}</p>
          <p className="hint mt-1">{t('ins.basedOn', { n: a.usedCycles.length })}</p>
        </section>
      )}
      </div>

      <section className="card" aria-labelledby="pat-h">
        <h2 id="pat-h" className="text-xl font-bold mb-2">{t('ins.patterns')}</h2>
        {patterns.length ? (
          <ul className="grid gap-3 lg:grid-cols-2">
            {patterns.map((p, i) => (
              <li key={i} className="flex gap-3 rounded-2xl bg-lav/50 p-3">
                <Icon name="sparkle" className="shrink-0 mt-0.5" size={20} />
                <span>{patternText(p, t)} <span className="block hint">{t('ins.patBased', { n: p.total })}</span></span>
              </li>
            ))}
          </ul>
        ) : <p className="hint">{t('ins.patternsEmpty')}</p>}
      </section>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-[1.5rem] bg-card shadow-soft p-3 text-center">
      <p className="font-display text-xl font-bold leading-tight">{value}</p>
      <p className="text-sm text-soft font-semibold leading-tight mt-1">{label}</p>
    </div>
  )
}

// Lightweight inline-SVG bar chart: cycle length (solid) and period length (striped) for each cycle.
function Chart({ cycles, avg, t, lang }) {
  const W = 340, H = 220, padL = 30, padB = 46, padT = 14
  const top = Math.max(45, ...cycles.map((c) => c.length)) + 5
  const y = (v) => padT + (H - padT - padB) * (1 - v / top)
  const slot = (W - padL) / cycles.length
  const bw = Math.min(22, slot / 3)
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[300px] h-auto" role="img" aria-label={t('ins.chartLabel')}>
        <defs>
          <pattern id="stripe" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="rgb(var(--peach))" /><line x1="0" y1="0" x2="0" y2="6" stroke="rgb(var(--accent))" strokeWidth="2.5" />
          </pattern>
        </defs>
        {[0, 15, 30, 45].map((g) => (
          <g key={g}>
            <line x1={padL} x2={W} y1={y(g)} y2={y(g)} stroke="rgb(var(--line))" />
            <text x={padL - 6} y={y(g) + 4} textAnchor="end" fontSize="11" fill="rgb(var(--soft))">{g}</text>
          </g>
        ))}
        {avg && (
          <g>
            <line x1={padL} x2={W} y1={y(avg)} y2={y(avg)} stroke="rgb(var(--calm))" strokeDasharray="5 4" strokeWidth="2" />
            <text x={padL + 4} y={y(avg) - 5} textAnchor="start" fontSize="11" fontWeight="700" fill="rgb(var(--calm))" stroke="rgb(var(--card))" strokeWidth="3" paintOrder="stroke">{t('ins.average')}: {avg}</text>
          </g>
        )}
        {cycles.map((c, i) => {
          const cx = padL + slot * i + slot / 2
          return (
            <g key={c.start}>
              <rect x={cx - bw - 1} y={y(c.length)} width={bw} height={y(0) - y(c.length)} rx="5" fill="rgb(var(--accent))">
                <title>{`${t('ins.cycleLen')}: ${c.length}`}</title>
              </rect>
              <text x={cx - bw / 2 - 1} y={y(c.length) - 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="rgb(var(--plum))">{c.length}</text>
              <rect x={cx + 1} y={y(c.periodLength)} width={bw} height={y(0) - y(c.periodLength)} rx="5" fill="url(#stripe)" stroke="rgb(var(--accent))">
                <title>{`${t('ins.periodLen')}: ${c.periodLength}`}</title>
              </rect>
              <text x={cx + bw / 2 + 1} y={y(c.periodLength) - 4} textAnchor="middle" fontSize="11" fill="rgb(var(--plum))">{c.periodLength}</text>
              <text x={cx} y={H - padB + 16} textAnchor="middle" fontSize="11" fill="rgb(var(--soft))">{fmtDate(c.start, lang)}</text>
            </g>
          )
        })}
        <g transform={`translate(${padL}, ${H - 14})`} fontSize="11" fill="rgb(var(--plum))">
          <rect width="12" height="12" rx="3" fill="rgb(var(--accent))" y="-10" /><text x="17">{t('ins.cycleLen')}</text>
          <rect x="140" width="12" height="12" rx="3" fill="url(#stripe)" stroke="rgb(var(--accent))" y="-10" /><text x="157">{t('ins.periodLen')}</text>
        </g>
      </svg>
      <table className="sr-only">
        <caption>{t('ins.history')}</caption>
        <thead><tr><th>{t('visit.start')}</th><th>{t('ins.cycleLen')}</th><th>{t('ins.periodLen')}</th></tr></thead>
        <tbody>{cycles.map((c) => <tr key={c.start}><td>{fmtDate(c.start, lang)}</td><td>{c.length}</td><td>{c.periodLength}</td></tr>)}</tbody>
      </table>
    </div>
  )
}
