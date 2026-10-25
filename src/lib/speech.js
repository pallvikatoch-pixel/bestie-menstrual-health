// Read aloud with on-device voices only (localService === true), so nothing leaves the phone.
const LANG_CODES = { en: ['en-IN', 'en-GB', 'en-US', 'en'], hi: ['hi-IN', 'hi'] }
let cached = []
function load() {
  if (!('speechSynthesis' in window)) return []
  cached = window.speechSynthesis.getVoices().filter((v) => v.localService)
  return cached
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  load()
  window.speechSynthesis.onvoiceschanged = () => { load(); listeners.forEach((f) => f()) }
}
const listeners = new Set()
export function onVoicesChanged(f) { listeners.add(f); return () => listeners.delete(f) }
export function voiceFor(lang) {
  const voices = cached.length ? cached : load()
  for (const code of LANG_CODES[lang] || [lang]) {
    const v = voices.find((x) => x.lang.toLowerCase().replace('_', '-').startsWith(code.toLowerCase()))
    if (v) return v
  }
  return null
}
export const hasVoice = (lang) => !!voiceFor(lang)
export function speak(text, lang, onEnd) {
  const v = voiceFor(lang)
  if (!v) return false
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.voice = v
  u.lang = v.lang
  u.rate = 0.95
  u.onend = onEnd
  u.onerror = onEnd
  window.speechSynthesis.speak(u)
  return true
}
export function stopSpeaking() { if ('speechSynthesis' in window) window.speechSynthesis.cancel() }
