// All cycle maths in one place. Pure functions, no React, so they can be tested (tests/run.mjs).
import { CONFIG } from '../config.js'
import { addDays, diffDays } from './date.js'

export const isPeriodDay = (log) => !!(log && log.period && log.flow !== 'spotting')

// Periods = runs of period days. Days separated by a short empty gap count as one period.
export function getPeriods(logs) {
  const days = Object.keys(logs || {}).filter((d) => isPeriodDay(logs[d])).sort()
  const periods = []
  for (const d of days) {
    const last = periods[periods.length - 1]
    if (last && diffDays(last.end, d) <= CONFIG.minPeriodGapDays + 1) {
      last.end = d
      last.days.push(d)
    } else {
      periods.push({ start: d, end: d, days: [d] })
    }
  }
  for (const p of periods) p.length = diffDays(p.start, p.end) + 1
  return periods
}

// Cycle = first day of one period to first day of the next. The current, unfinished cycle is never included.
export function getCycles(periods) {
  const cycles = []
  for (let i = 0; i < periods.length - 1; i++) {
    cycles.push({
      start: periods[i].start,
      next: periods[i + 1].start,
      length: diffDays(periods[i].start, periods[i + 1].start),
      periodLength: periods[i].length,
    })
  }
  return cycles
}

export function median(nums) {
  if (!nums.length) return null
  const s = [...nums].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2)
}

// A gap far longer than usual might be a forgotten log. We ask before counting it.
export function findSuspectGaps(cycles, confirmedGaps = []) {
  const suspects = []
  cycles.forEach((c, i) => {
    if (confirmedGaps.includes(c.start)) return
    const others = cycles.filter((_, j) => j !== i).map((x) => x.length)
    if (others.length < 2) return
    const base = median(others)
    if (c.length >= CONFIG.longGapMinDays && c.length >= base * CONFIG.longGapFactor) suspects.push(c)
  })
  return suspects
}

export function analyze(logs, { today, confirmedGaps = [] } = {}) {
  const periods = getPeriods(logs)
  const allCycles = getCycles(periods)
  const suspects = findSuspectGaps(allCycles, confirmedGaps)
  const counted = allCycles.filter((c) => !suspects.includes(c))
  const used = counted.slice(-CONFIG.cyclesUsed)
  const lastPeriod = periods[periods.length - 1] || null
  const lastStart = lastPeriod ? lastPeriod.start : null

  const res = {
    periods, cycles: allCycles, usedCycles: used, suspectGap: suspects[suspects.length - 1] || null,
    lastPeriod, lastStart, enough: false,
    startsNeeded: Math.max(0, CONFIG.minCyclesForPrediction + 1 - periods.length),
    cycleDay: lastStart && today ? diffDays(lastStart, today) + 1 : null,
    median: null, min: null, max: null, variation: null, irregular: false,
    next: null, ovulation: null, fertile: null, ovHiddenReason: 'notEnough',
    phase: 'unknown', late: false, avgPeriod: null,
  }
  if (periods.length) {
    const lens = periods.slice(-CONFIG.cyclesUsed).map((p) => p.length)
    res.avgPeriod = Math.round(lens.reduce((a, b) => a + b, 0) / lens.length)
  }
  if (used.length >= CONFIG.minCyclesForPrediction && lastStart) {
    const lengths = used.map((c) => c.length)
    res.enough = true
    res.median = median(lengths)
    res.min = Math.min(...lengths)
    res.max = Math.max(...lengths)
    res.variation = res.max - res.min
    res.irregular = res.variation > CONFIG.irregularVariationDays
    if (res.irregular) {
      res.next = {
        from: addDays(lastStart, res.min - CONFIG.irregularPaddingDays),
        to: addDays(lastStart, res.max + CONFIG.irregularPaddingDays),
        mid: addDays(lastStart, res.median),
      }
      res.ovHiddenReason = 'irregular'
    } else {
      const spread = Math.max(CONFIG.minRangeDays, Math.ceil(res.variation / 2))
      res.next = {
        from: addDays(lastStart, res.median - spread),
        to: addDays(lastStart, res.median + spread),
        mid: addDays(lastStart, res.median),
      }
      // Ovulation ≈ 14 days before the next period, as a range. Fertile window = 5 days before + that day.
      const ovFrom = addDays(res.next.from, -CONFIG.lutealDays)
      const ovTo = addDays(res.next.to, -CONFIG.lutealDays)
      res.ovulation = { from: ovFrom, to: ovTo }
      res.fertile = { from: addDays(ovFrom, -CONFIG.fertileDaysBefore), to: ovTo }
      res.ovHiddenReason = null
    }
  }
  if (today && lastPeriod) {
    if (logs[today] && isPeriodDay(logs[today])) res.phase = 'period'
    else if (diffDays(lastPeriod.end, today) <= 0) res.phase = 'period'
    else if (res.next && today > res.next.to) { res.phase = 'late'; res.late = true }
    else if (res.ovulation) {
      if (today < res.ovulation.from) res.phase = 'follicular'
      else if (today <= res.ovulation.to) res.phase = 'ovulation'
      else res.phase = 'luteal'
    } else if (res.next && today >= addDays(res.next.from, -CONFIG.preDays)) res.phase = 'pre'
    else res.phase = 'between'
  }
  return res
}

// Predicted period days for the calendar (drawn differently from logged days).
export function predictedDays(a) {
  if (!a.next) return new Set()
  const s = new Set()
  for (let d = a.next.from; d <= a.next.to; d = addDays(d, 1)) s.add(d)
  return s
}
export function rangeDays(r) {
  const s = new Set()
  if (!r) return s
  for (let d = r.from; d <= r.to; d = addDays(d, 1)) s.add(d)
  return s
}
