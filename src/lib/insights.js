// Symptom patterns across cycles. A pattern is shown only once it appears in at least 3 cycles.
import { CONFIG } from '../config.js'
import { addDays } from './date.js'

export function findPatterns(logs, analysis) {
  const cycles = analysis.cycles.slice(-CONFIG.cyclesUsed)
  const total = cycles.length
  if (total < CONFIG.patternMinCycles) return []
  const startCounts = {}
  const preCounts = {}
  let lowEnergyPre = 0
  let lowMoodPre = 0
  for (const c of cycles) {
    // first days of the next period (days 1–2 of each period that closes a cycle)
    const startSyms = new Set()
    for (let k = 0; k < 2; k++) (logs[addDays(c.next, k)]?.symptoms || []).forEach((s) => startSyms.add(s))
    startSyms.forEach((s) => { startCounts[s] = (startCounts[s] || 0) + 1 })
    // the N days before the next period
    const preSyms = new Set()
    let energyLow = false
    let moodLow = false
    for (let k = 1; k <= CONFIG.preDays; k++) {
      const l = logs[addDays(c.next, -k)]
      if (!l) continue
      ;(l.symptoms || []).forEach((s) => preSyms.add(s))
      if (l.energy === 'low') energyLow = true
      if (l.mood === 'low' || l.mood === 'verylow') moodLow = true
    }
    preSyms.forEach((s) => { preCounts[s] = (preCounts[s] || 0) + 1 })
    if (energyLow) lowEnergyPre++
    if (moodLow) lowMoodPre++
  }
  const out = []
  for (const [s, n] of Object.entries(startCounts)) if (n >= CONFIG.patternMinCycles) out.push({ kind: 'start', sym: s, n, total })
  for (const [s, n] of Object.entries(preCounts)) if (n >= CONFIG.patternMinCycles && !startCounts[s]) out.push({ kind: 'pre', sym: s, n, total })
  if (lowEnergyPre >= CONFIG.patternMinCycles) out.push({ kind: 'energy', n: lowEnergyPre, total })
  if (lowMoodPre >= CONFIG.patternMinCycles) out.push({ kind: 'mood', n: lowMoodPre, total })
  // safety symptoms are never presented as a "pattern"; they go to the doctor page
  return out.filter((p) => !['bleed_between', 'bleed_after_sex', 'severe_sudden_pain', 'dizzy', 'breathless'].includes(p.sym)).sort((a, b) => b.n - a.n)
}

export function patternText(p, t) {
  const d = CONFIG.preDays
  if (p.kind === 'start') return t('ins.patStart', { sym: t(`sym.${p.sym}`), n: p.n, total: p.total })
  if (p.kind === 'pre') return t('ins.patPre', { sym: t(`sym.${p.sym}`), n: p.n, total: p.total, d })
  if (p.kind === 'energy') return t('ins.patEnergy', { n: p.n, total: p.total, d })
  return t('ins.patMood', { n: p.n, total: p.total, d })
}
