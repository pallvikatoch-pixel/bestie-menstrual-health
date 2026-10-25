// Keyword matching for Ask (offline). Scores each FAQ by keyword hits; longer keywords count more.
import { FAQ } from '../content/faq.js'
const norm = (s) => (s || '').toLowerCase().normalize('NFC').replace(/[?!.,"“”’']/g, ' ').replace(/\s+/g, ' ').trim()

export function matchFaq(query) {
  const q = ` ${norm(query)} `
  if (q.trim().length < 2) return null
  let best = null
  let bestScore = 0
  for (const f of FAQ) {
    let score = 0
    for (const k of f.kw) {
      const kk = norm(k)
      if (!kk) continue
      if (q.includes(` ${kk} `) || (kk.length > 3 && q.includes(kk))) score += kk.split(' ').length * 2 + kk.length / 10
    }
    for (const lang of ['en', 'hi']) if (norm(f.q[lang]) === norm(query)) score += 100
    if (score > bestScore) { bestScore = score; best = f }
  }
  return bestScore >= 2 ? best : null
}
