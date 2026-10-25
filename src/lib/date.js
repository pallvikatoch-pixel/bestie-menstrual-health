// All dates are plain local dates ("2026-10-17"), never UTC timestamps.
const pad = (n) => String(n).padStart(2, '0')

export function toISO(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
export function parseISO(s) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d, 12) // noon avoids DST edge cases
}
export function addDays(iso, n) {
  const d = parseISO(iso)
  d.setDate(d.getDate() + n)
  return toISO(d)
}
export function diffDays(a, b) {
  return Math.round((parseISO(b) - parseISO(a)) / 86400000) // b − a in whole days
}
let offsetDays = 0 // developer "pretend time has passed"
export function setDevOffset(n) { offsetDays = n || 0 }
export function todayISO() { return addDays(toISO(new Date()), offsetDays) }
export function isValidISO(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  return toISO(parseISO(s)) === s
}
export function monthMatrix(year, month) {
  const first = new Date(year, month, 1, 12)
  const startPad = (first.getDay() + 6) % 7 // weeks start Monday
  const days = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < startPad; i++) cells.push(null)
  for (let d = 1; d <= days; d++) cells.push(toISO(new Date(year, month, d, 12)))
  while (cells.length % 7) cells.push(null)
  return cells
}
export function fmtDate(iso, lang = 'en', opts = { day: 'numeric', month: 'short' }) {
  if (!iso) return ''
  return parseISO(iso).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', opts)
}
export function fmtRange(a, b, lang) { return `${fmtDate(a, lang)} – ${fmtDate(b, lang)}` }
