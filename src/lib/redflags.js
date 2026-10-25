// Checks the logs against the rules in src/data/redflags.js. Pure functions.
import { CONFIG } from '../config.js'
import { REDFLAGS } from '../data/redflags.js'
import { addDays, diffDays } from './date.js'
import { analyze } from './cycle.js'

const isHeavyDay = (l) => !!l && (l.flow === 'heavy' || l.padHourly || l.bigClots)

const checks = {
  longPeriod(logs, a) {
    const long = a.periods.slice(-6).filter((p) => p.length > CONFIG.maxPeriodDays)
    if (!long.length) return null
    return { days: long.flatMap((p) => [p.start, p.end]), periods: long.map((p) => ({ from: p.start, to: p.end, n: p.length })) }
  },
  heavyFlow(logs) {
    const days = Object.keys(logs).filter((d) => logs[d].padHourly || logs[d].bigClots).sort()
    return days.length ? { days } : null
  },
  cycleRange(logs, a, ctx) {
    const teen = ctx.ageGroup === 'under18'
    const lo = teen ? CONFIG.teenCycleMin : CONFIG.adultCycleMin
    const hi = teen ? CONFIG.teenCycleMax : CONFIG.adultCycleMax
    let run = []
    let best = null
    for (const c of a.cycles) {
      if (c.length < lo || c.length > hi) {
        run.push(c)
        if (run.length >= CONFIG.outOfRangeInARow) best = [...run]
      } else run = []
    }
    if (!best) return null
    return { days: best.map((c) => c.start), lo, hi, lengths: best.map((c) => c.length) }
  },
  noPeriod(logs, a, ctx) {
    if (ctx.pregnancy || !a.lastStart) return null
    const gap = diffDays(a.lastStart, ctx.today)
    return gap >= CONFIG.noPeriodDays ? { days: [a.lastStart], gap } : null
  },
  symptomAny(logs, a, ctx, rule) {
    const days = Object.keys(logs).filter((d) => (logs[d].symptoms || []).some((s) => rule.symptoms.includes(s))).sort()
    return days.length ? { days } : null
  },
  pain(logs, a) {
    const stopDays = Object.keys(logs).filter((d) => logs[d].painStops).sort()
    const noHelp = Object.keys(logs).filter((d) => logs[d].painkiller === 'no').sort()
    const periodOf = (d) => [...a.periods].reverse().find((p) => p.start <= d)?.start || d
    const cyclesHit = new Set(stopDays.map(periodOf))
    if (cyclesHit.size >= CONFIG.painStopsCycles || noHelp.length >= CONFIG.painkillerNoHelpDays) {
      return { days: [...new Set([...stopDays, ...noHelp])].sort() }
    }
    return null
  },
  anaemia(logs, a) {
    const tiredSyms = ['tiredness', 'breathless', 'dizzy']
    const hits = []
    for (const p of a.periods) {
      const heavy = p.days.some((d) => isHeavyDay(logs[d]))
      if (!heavy) continue
      for (let d = addDays(p.start, -CONFIG.anaemiaWindowDays); d <= addDays(p.end, CONFIG.anaemiaWindowDays); d = addDays(d, 1)) {
        if ((logs[d]?.symptoms || []).some((s) => tiredSyms.includes(s))) hits.push(d)
      }
    }
    return hits.length ? { days: [...new Set(hits)].sort() } : null
  },
}

export function evaluateRedflags(logs, ctx) {
  // In pregnancy mode, the cycle rules are paused (pregnancy danger signs are shown instead).
  if (ctx.pregnancy) return []
  const a = ctx.analysis || analyze(logs, { today: ctx.today, confirmedGaps: ctx.confirmedGaps })
  const out = []
  for (const rule of REDFLAGS) {
    const r = checks[rule.check](logs, a, ctx, rule)
    if (r) out.push({ ...r, id: rule.id, rule, signature: `${rule.id}:${r.days[r.days.length - 1]}:${r.days.length}` })
  }
  return out
}

// Urgent: shown as "Get medical help now" with 112 and 108.
export function urgentReason(log, { pregnancy } = {}) {
  if (!log) return null
  const s = log.symptoms || []
  if (s.includes('severe_sudden_pain')) return 'suddenPain'
  if (isHeavyDay(log) && s.includes('dizzy')) return 'heavyDizzy'
  if (pregnancy && (log.period || log.flow)) return 'pregnancyBleeding'
  if (pregnancy && log.pain >= 7) return 'pregnancyPain'
  return null
}

// Very low mood on N days in a row → Tele-MANAS.
export function veryLowMoodStreak(logs, today) {
  let n = 0
  for (let d = today; ; d = addDays(d, -1)) {
    if (logs[d]?.mood === 'verylow') n++
    else if (d === today && !logs[d]) continue
    else break
    if (n >= CONFIG.veryLowMoodDaysInARow) return true
  }
  return false
}
