// Daily Bloom: the card is chosen by the local date, going through a shuffled order seeded once,
// so every card is seen before any repeats.
import { DAILY } from '../content/daily.js'
import { diffDays } from './date.js'

function shuffled(arr, seed) {
  const a = [...arr]
  let s = seed >>> 0
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 }
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}
export function eligibleCards(ageGroup) {
  return DAILY.filter((c) => c.age === 'all' || ageGroup === 'adult')
}
export function cardForDate(date, bloom, ageGroup, startDate) {
  const list = shuffled(eligibleCards(ageGroup), bloom.seed)
  const idx = Math.max(0, diffDays(startDate || date, date))
  return list[idx % list.length]
}
