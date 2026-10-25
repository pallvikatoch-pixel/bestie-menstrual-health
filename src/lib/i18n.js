import en from '../i18n/en.js'
import hi from '../i18n/hi.js'
const DICTS = { en, hi }
export const LANGS = [
  { id: 'en', name: 'English' },
  { id: 'hi', name: 'हिंदी' },
]
export function makeT(lang) {
  const d = DICTS[lang] || en
  const t = (key, vars) => {
    let s = d[key] ?? en[key] ?? key
    if (vars) for (const k in vars) s = s.split(`{${k}}`).join(vars[k])
    return s
  }
  const L = (obj) => (obj == null ? '' : typeof obj === 'string' ? obj : obj[lang] ?? obj.en)
  return { t, L, lang }
}
