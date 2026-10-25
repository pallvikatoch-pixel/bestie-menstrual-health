// Demo profile: Ananya, 17, irregular cycles. 8 months of logs, built relative to today so it always looks current.
// Includes one long cycle (47 days), one long period (9 days), a heavy day with tiredness and dizziness,
// painful periods that stopped her doing things, and low mood/energy before periods.
import { addDays } from '../lib/date.js'

const CYCLE_LENGTHS = [29, 33, 27, 47, 30, 26, 38] // oldest → newest (7 complete cycles, 8 periods)
const PERIOD_LENGTHS = [5, 5, 4, 9, 5, 6, 5, 5]
const FLOWS = ['medium', 'heavy', 'medium', 'light', 'light', 'light', 'light', 'light', 'light']

export function buildDemoLogs(today) {
  const total = CYCLE_LENGTHS.reduce((a, b) => a + b, 0)
  const lastStart = addDays(today, -9)
  let start = addDays(lastStart, -total)
  const starts = [start]
  for (const len of CYCLE_LENGTHS) {
    start = addDays(start, len)
    starts.push(start)
  }
  const logs = {}
  const set = (d, v) => { if (d <= today) logs[d] = { ...(logs[d] || {}), ...v } }

  starts.forEach((s, i) => {
    const plen = PERIOD_LENGTHS[i]
    for (let k = 0; k < plen; k++) {
      const d = addDays(s, k)
      const log = { period: true, flow: FLOWS[k] || 'light', symptoms: [], pain: 0 }
      if (k <= 1) { log.symptoms.push('cramps'); log.pain = k === 0 ? 7 : 5; log.painkiller = 'yes' }
      if (k === 0) log.symptoms.push('back_pain', 'tiredness')
      if (k === 0 && [1, 4, 6].includes(i)) log.painStops = true
      if (i === 5 && k === 1) { log.flow = 'heavy'; log.padHourly = true }
      if (i === 5 && k === 3) log.symptoms.push('dizzy', 'tiredness')
      log.mood = k === 0 ? 'low' : 'okay'
      log.energy = k <= 1 ? 'low' : 'medium'
      log.sleep = 7
      set(d, log)
    }
    // the 5 days before each period (except the first): low energy, mood changes, acne, bloating
    if (i > 0) {
      for (let k = 1; k <= 4; k++) {
        const d = addDays(s, -k)
        set(d, {
          period: false, mood: k <= 2 ? 'low' : 'meh', energy: 'low', sleep: 6,
          symptoms: [k <= 3 ? 'bloating' : 'acne', ...(k === 1 ? ['mood_changes', 'tender_breasts'] : []), ...(k === 2 ? ['acne'] : [])],
        })
      }
    }
    // a couple of ordinary days mid-cycle
    const mid = addDays(s, 12)
    if (i < starts.length - 1) set(mid, { period: false, mood: 'great', energy: 'high', sleep: 8, symptoms: [] })
  })
  set(addDays(starts[3], 20), { period: false, mood: 'okay', energy: 'medium', sleep: 6, symptoms: ['headache'], note: 'Exam week, very tired.' })
  set(addDays(starts[6], 3), { meds: 'Painkiller from the chemist' })
  return logs
}

export function buildDemoState(today, base) {
  return {
    ...base,
    demo: true,
    logs: buildDemoLogs(today),
    settings: { ...base.settings, nickname: 'Ananya', ageGroup: 'under18' },
    onboarding: { ...base.onboarding, done: true, answered: { lang: true, nickname: true, ageGroup: true, lastPeriod: true, cycleLength: true, symptoms: true, reminders: true }, skipped: {} },
  }
}
