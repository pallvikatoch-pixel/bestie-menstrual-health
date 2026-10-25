// Export (JSON + CSV) and import with validation.
import { isValidISO } from './date.js'

export function download(name, text, type) {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export function exportJSON(state, pub) {
  return JSON.stringify({ app: 'bestie', format: 1, exportedAt: new Date().toISOString(), pub: { ...pub, locked: false }, state }, null, 2)
}
const esc = (v) => {
  const s = v == null ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
export function exportCSV(state) {
  const cols = ['date', 'period', 'flow', 'padHourly', 'bigClots', 'pain', 'painStops', 'painkiller', 'symptoms', 'mood', 'energy', 'sleep', 'meds', 'note', 'cramps_after_stretch']
  const rows = Object.keys(state.logs).sort().map((d) => {
    const l = state.logs[d]
    return [d, l.period ? 'yes' : 'no', l.flow, l.padHourly ? 'yes' : '', l.bigClots ? 'yes' : '', l.pain ?? '', l.painStops ? 'yes' : '', l.painkiller || '',
      (l.symptoms || []).join(' '), l.mood || '', l.energy || '', l.sleep ?? '', l.meds || '', l.note || '', l.afterStretch || ''].map(esc).join(',')
  })
  return [cols.join(','), ...rows].join('\n')
}
export function parseImport(text) {
  const obj = JSON.parse(text)
  if (!obj || obj.app !== 'bestie' || typeof obj.state !== 'object') throw new Error('not a bestie export')
  const s = obj.state
  if (typeof s.logs !== 'object' || Array.isArray(s.logs)) throw new Error('bad logs')
  for (const d of Object.keys(s.logs)) {
    if (!isValidISO(d)) throw new Error(`bad date ${d}`)
    if (typeof s.logs[d] !== 'object') throw new Error('bad log')
  }
  if (!s.settings || typeof s.settings !== 'object') throw new Error('bad settings')
  return { state: s, pub: obj.pub || null }
}
