// Run with: npm test   (plain Node, no test framework needed)
import { analyze } from '../src/lib/cycle.js'
import { evaluateRedflags, veryLowMoodStreak, urgentReason } from '../src/lib/redflags.js'
import { buildDemoLogs } from '../src/data/demo.js'
import { addDays } from '../src/lib/date.js'

const rows = []
const check = (name, expected, actual) => {
  const pass = JSON.stringify(expected) === JSON.stringify(actual)
  rows.push({ test: name, expected: JSON.stringify(expected), actual: JSON.stringify(actual), result: pass ? 'PASS' : 'FAIL' })
}
const fromLengths = (start, lengths, plen = 5) => {
  const logs = {}
  let s = start
  const starts = [s]
  for (const l of lengths) { s = addDays(s, l); starts.push(s) }
  for (const st of starts) for (let k = 0; k < plen; k++) logs[addDays(st, k)] = { period: true, flow: 'medium' }
  return { logs, last: starts[starts.length - 1] }
}

// 1. Regular 28-day cycles
{
  const { logs, last } = fromLengths('2026-01-01', [28, 28, 28, 28, 28, 28])
  const a = analyze(logs, { today: addDays(last, 3) })
  check('28-day: median', 28, a.median)
  check('28-day: range', [addDays(last, 26), addDays(last, 30)], [a.next.from, a.next.to])
  check('28-day: irregular', false, a.irregular)
  check('28-day: ovulation shown', true, !!a.ovulation)
  check('28-day: fertile window = 6 days at least', true, a.fertile && a.fertile.from < a.ovulation.from)
}
// 2. 26, 31, 29, 35, 27, 30
{
  const { logs, last } = fromLengths('2026-01-01', [26, 31, 29, 35, 27, 30])
  const a = analyze(logs, { today: addDays(last, 3) })
  check('mixed: median (29,30 → 30)', 30, a.median)
  check('mixed: variation', 9, a.variation)
  check('mixed: irregular (9 > 7)', true, a.irregular)
  check('mixed: ovulation hidden', null, a.ovulation)
  check('mixed: wide range', [addDays(last, 24), addDays(last, 37)], [a.next.from, a.next.to])
}
// 3. Only 2 logged cycles
{
  const { logs, last } = fromLengths('2026-01-01', [28, 29])
  const a = analyze(logs, { today: addDays(last, 3) })
  check('2 cycles: no prediction', false, a.enough)
  check('2 cycles: starts still needed', 1, a.startsNeeded)
}
// 4. One missed log → 58-day gap
{
  const { logs, last } = fromLengths('2026-01-01', [28, 29, 58, 28, 27])
  const a = analyze(logs, { today: addDays(last, 3) })
  check('58-day gap: asked about', 58, a.suspectGap && a.suspectGap.length)
  check('58-day gap: not counted (median of 28,29,28,27)', 28, a.median)
  const b = analyze(logs, { today: addDays(last, 3), confirmedGaps: [a.suspectGap.start] })
  check('58-day gap: counted after "No, it was really that long"', true, b.irregular)
}
// 5. Local dates: a log at 23:59 stays on its date
{
  const d = new Date(2026, 9, 17, 23, 59)
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  check('late-night log keeps its date', '2026-10-17', iso)
}

// Red flags
const ctx = (today, extra = {}) => ({ today, ageGroup: 'adult', ...extra })
{
  const { logs, last } = fromLengths('2026-01-01', [28, 28], 9)
  const ids = evaluateRedflags(logs, ctx(addDays(last, 3))).map((r) => r.id)
  check('rule: period > 7 days', true, ids.includes('longPeriod'))
}
{
  const logs = { '2026-03-02': { period: true, flow: 'heavy', padHourly: true } }
  check('rule: pad every 1–2 hours', true, evaluateRedflags(logs, ctx('2026-03-05')).some((r) => r.id === 'heavyFlow'))
}
{
  const { logs, last } = fromLengths('2026-01-01', [40, 41, 39])
  check('rule: 3 cycles > 35 (adult)', true, evaluateRedflags(logs, ctx(addDays(last, 3))).some((r) => r.id === 'cycleRange'))
  check('rule: same cycles OK for under-18 (≤45)', false, evaluateRedflags(logs, ctx(addDays(last, 3), { ageGroup: 'under18' })).some((r) => r.id === 'cycleRange'))
}
{
  const { logs, last } = fromLengths('2026-01-01', [40, 30, 41])
  check('rule: not 3 in a row → no card', false, evaluateRedflags(logs, ctx(addDays(last, 3))).some((r) => r.id === 'cycleRange'))
}
{
  const { logs, last } = fromLengths('2026-01-01', [28])
  check('rule: no period for 90 days', true, evaluateRedflags(logs, ctx(addDays(last, 95))).some((r) => r.id === 'noPeriod'))
  check('rule: 90 days paused in pregnancy mode', 0, evaluateRedflags(logs, ctx(addDays(last, 95), { pregnancy: true })).length)
}
{
  const logs = { '2026-03-10': { symptoms: ['bleed_between'] } }
  check('rule: bleeding between periods', true, evaluateRedflags(logs, ctx('2026-03-12')).some((r) => r.id === 'bleedBetween'))
}
{
  const logs = { '2026-03-10': { period: true, flow: 'medium', pain: 8, painkiller: 'no' } }
  check('rule: painkillers don’t help', true, evaluateRedflags(logs, ctx('2026-03-12')).some((r) => r.id === 'pain'))
}
{
  const logs = { '2026-03-10': { period: true, flow: 'heavy' }, '2026-03-11': { period: true, flow: 'medium', symptoms: ['breathless'] } }
  check('rule: heavy + breathless (anaemia)', true, evaluateRedflags(logs, ctx('2026-03-12')).some((r) => r.id === 'anaemia'))
}
check('urgent: sudden severe pain', 'suddenPain', urgentReason({ symptoms: ['severe_sudden_pain'] }))
check('urgent: heavy + dizzy', 'heavyDizzy', urgentReason({ flow: 'heavy', symptoms: ['dizzy'] }))
check('Tele-MANAS: 3 very low days', true, veryLowMoodStreak({ '2026-03-10': { mood: 'verylow' }, '2026-03-11': { mood: 'verylow' }, '2026-03-12': { mood: 'verylow' } }, '2026-03-12'))
check('Tele-MANAS: 2 days is not enough', false, veryLowMoodStreak({ '2026-03-11': { mood: 'verylow' }, '2026-03-12': { mood: 'verylow' } }, '2026-03-12'))

// Demo data
{
  const today = '2026-10-23'
  const logs = buildDemoLogs(today)
  const a = analyze(logs, { today })
  check('demo: prediction shown', true, a.enough)
  check('demo: irregular label', true, a.irregular)
  const cards = evaluateRedflags(logs, { today, ageGroup: 'under18', analysis: a }).map((r) => r.id)
  check('demo: ≥2 doctor cards', true, cards.length >= 2)
  rows.push({ test: 'demo cards', expected: '', actual: cards.join(', '), result: 'INFO' })
}

console.table(rows)
const failed = rows.filter((r) => r.result === 'FAIL').length
console.log(failed ? `${failed} failed` : 'All passed')
process.exit(failed ? 1 : 0)
