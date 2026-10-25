import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './Icon.jsx'
import { useApp } from '../lib/store.jsx'
import { SOURCES } from '../content/sources.js'
import { hasVoice, onVoicesChanged, speak, stopSpeaking } from '../lib/speech.js'

// ---------- Doodles (decorative, hidden from screen readers) ----------
export function Flower({ className = '', petal = 'rgb(var(--blush))', center = 'rgb(var(--peach))', size = 28 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 40 40" className={className}>
      {[0, 72, 144, 216, 288].map((r) => (
        <ellipse key={r} cx="20" cy="10" rx="6.5" ry="9" fill={petal} transform={`rotate(${r} 20 20)`} />
      ))}
      <circle cx="20" cy="20" r="5.5" fill={center} />
    </svg>
  )
}
export function Twinkle({ className = '', size = 14, color = 'rgb(var(--accent) / 0.55)' }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 20 20" className={className}>
      <path d="M10 1c.8 4.6 3.4 7.2 8 8-4.6.8-7.2 3.4-8 8-.8-4.6-3.4-7.2-8-8 4.6-.8 7.2-3.4 8-8z" fill={color} />
    </svg>
  )
}
export function Avatar({ size = 44 }) {
  return (
    <span aria-hidden="true" className="shrink-0 grid place-items-center rounded-full bg-lav" style={{ width: size, height: size }}>
      <Flower size={size * 0.7} petal="rgb(var(--accent) / 0.75)" center="rgb(var(--peach))" />
    </span>
  )
}

// ---------- Bestie speech bubble ----------
export function Bubble({ children, typing = false, className = '', tone = 'lav' }) {
  const [show, setShow] = useState(!typing)
  useEffect(() => {
    if (!typing) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) { setShow(true); return }
    const id = setTimeout(() => setShow(true), 550)
    return () => clearTimeout(id)
  }, [typing])
  const bg = tone === 'peach' ? 'bg-peach' : tone === 'blush' ? 'bg-blush' : 'bg-lav'
  return (
    <div className={`flex items-end gap-3 ${className}`}>
      <Avatar />
      <div className={`${bg} rounded-3xl rounded-bl-md px-4 py-3 max-w-[85%] text-plum`} aria-live="polite">
        {show ? <div className="rise">{children}</div> : <TypingDots />}
      </div>
    </div>
  )
}
export function TypingDots({ label }) {
  return (
    <span className="inline-flex gap-1 py-1" role="status" aria-label={label || '…'}>
      {[0, 1, 2].map((i) => (
        <span key={i} className="dot w-2 h-2 rounded-full bg-plum/60" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </span>
  )
}

// ---------- Layout bits ----------
export function PageHeader({ title, back = false, right = null, sub = null }) {
  const nav = useNavigate()
  const { t } = useApp()
  return (
    <header className="flex items-start gap-2 mb-5">
      {back && (
        <button className="btn-ghost !px-2 -ml-2 no-print" onClick={() => (window.history.length > 1 ? nav(-1) : nav('/'))} aria-label={t('common.back')}>
          <Icon name="left" />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-[1.75rem] font-bold">{title}</h1>
        {sub && <p className="hint mt-1">{sub}</p>}
      </div>
      {right}
    </header>
  )
}

export function Toggle({ checked, onChange, label, hint, disabled }) {
  const id = useId()
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="flex-1 min-w-0">
        <label htmlFor={id} className="font-bold block">{label}</label>
        {hint && <p id={`${id}-h`} className="hint">{hint}</p>}
      </div>
      <button
        id={id} role="switch" aria-checked={!!checked} aria-describedby={hint ? `${id}-h` : undefined}
        disabled={disabled} onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-[60px] h-[34px] rounded-full transition border-2 min-h-[34px] ${checked ? 'bg-accent border-accent' : 'bg-line border-line'}`}
      >
        <span className={`absolute top-[2px] w-[26px] h-[26px] rounded-full bg-card shadow-soft transition-all ${checked ? 'left-[28px]' : 'left-[2px]'}`} />
        <span className="sr-only">{checked ? 'on' : 'off'}</span>
      </button>
    </div>
  )
}

const MIN_REM = { 1: 12, 2: 8, 3: 5.5, 4: 4.4, 5: 3.4 }
// A group of big choice buttons (radio behaviour). options: [{value,label,icon,paths}]
export function Choices({ label, value, onChange, options, columns = 2, hint, size = 'md' }) {
  return (
    <fieldset className="mb-5">
      {label && <legend className="label">{label}</legend>}
      {hint && <p className="hint -mt-1 mb-2">{hint}</p>}
      <div role="radiogroup" className="grid gap-2" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${MIN_REM[columns] || 8}rem, 1fr))` }}>
        {options.map((o) => (
          <button
            key={String(o.value)} role="radio" aria-checked={value === o.value}
            onClick={() => onChange(value === o.value && o.toggle ? null : o.value)}
            className={`chip !px-2 justify-center text-center leading-tight ${size === 'lg' ? 'flex-col py-3 min-h-[76px] text-[0.9rem]' : ''}`}
          >
            {(o.icon || o.paths) && <Icon name={o.icon} paths={o.paths} size={size === 'lg' ? 28 : 22} />}
            <span>{o.label}</span>
          </button>
        ))}
      </div>
    </fieldset>
  )
}

// Multi-select icon buttons
export function MultiChips({ items, selected, onToggle, columns = 3 }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${columns === 2 ? 8.5 : 6.2}rem, 1fr))` }}>
      {items.map((o) => {
        const on = selected.includes(o.value)
        return (
          <button key={o.value} aria-pressed={on} onClick={() => onToggle(o.value)}
            className="chip !px-1.5 flex-col justify-center text-center py-3 min-h-[84px] text-[0.9rem] leading-tight">
            <Icon paths={o.paths} name={o.icon} size={28} />
            <span>{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function Dialog({ open, onClose, title, children, actions }) {
  const ref = useRef(null)
  const id = useId()
  // Keep the latest onClose in a ref. Parents pass a new function on every render (e.g. each keystroke),
  // and if the effect below depended on it, focus would jump back to the first field after every key.
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement
    const el = ref.current
    el?.querySelector('input, textarea, select, button, [href]')?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') closeRef.current?.()
      if (e.key === 'Tab' && el) {
        const f = [...el.querySelectorAll('button, [href], input, textarea, select')].filter((x) => !x.disabled)
        if (!f.length) return
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus() }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); prev?.focus?.() }
  }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-plum/40 p-3 no-print" onClick={onClose}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={id}
        className="card w-full max-w-md rise max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 id={id} className="text-xl font-bold mb-2">{title}</h2>
        <div className="mb-4">{children}</div>
        <div className="flex flex-col gap-2">{actions}</div>
      </div>
    </div>
  )
}

export function Toast() {
  const { toast, clearToast, t } = useApp()
  useEffect(() => {
    if (!toast) return
    const id = setTimeout(clearToast, toast.ms || 3500)
    return () => clearTimeout(id)
  }, [toast]) // eslint-disable-line
  if (!toast) return null
  return (
    <div className="fixed left-0 right-0 lg:left-64 bottom-[calc(88px+env(safe-area-inset-bottom,0px))] lg:bottom-8 z-40 flex justify-center px-4 no-print">
      <div role="status" className="rise card !py-3 !px-4 flex items-center gap-3 max-w-md w-full bg-card border-2 border-line">
        <span className="relative shrink-0"><Flower size={26} petal="rgb(var(--accent) / 0.6)" /><Twinkle className="absolute -top-1 -right-2 pop" /></span>
        <p className="flex-1 font-semibold">{toast.msg}</p>
        <button className="btn-ghost !px-2 !min-h-[40px]" onClick={clearToast} aria-label={t('toast.close')}><Icon name="x" size={20} /></button>
      </div>
    </div>
  )
}

export function Sources({ keys = [], className = '' }) {
  const { t } = useApp()
  const list = keys.map((k) => SOURCES[k]).filter(Boolean)
  if (!list.length) return null
  return (
    <p className={`source ${className}`}>
      {list.length > 1 ? t('common.sources') : t('common.source')}:{' '}
      {list.map((s, i) => (
        <span key={s.url}>
          {i > 0 && '; '}
          <a href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a>
        </span>
      ))}
    </p>
  )
}

export function Listen({ text, className = '' }) {
  const { state, lang, t } = useApp()
  const [ok, setOk] = useState(() => hasVoice(lang))
  const [playing, setPlaying] = useState(false)
  useEffect(() => { setOk(hasVoice(lang)); return onVoicesChanged(() => setOk(hasVoice(lang))) }, [lang])
  useEffect(() => () => stopSpeaking(), [])
  if (!ok || !state?.settings.readAloud) return null
  return (
    <button className={`btn-soft !min-h-[48px] ${className}`} aria-pressed={playing}
      onClick={() => {
        if (playing) { stopSpeaking(); setPlaying(false); return }
        if (speak(typeof text === 'function' ? text() : text, lang, () => setPlaying(false))) setPlaying(true)
      }}>
      <Icon name={playing ? 'stop' : 'speaker'} size={20} />
      {playing ? t('common.stop') : t('common.listen')}
    </button>
  )
}

export function UrgentCard({ reason, info = false }) {
  const { t } = useApp()
  return (
    <section className="rounded-blob border-[3px] border-calm bg-card p-5 shadow-soft" role={info ? 'region' : 'alert'} aria-labelledby="urgent-h">
      <div className="flex items-center gap-3 mb-2">
        <span className="grid place-items-center w-11 h-11 rounded-full bg-lav text-calm"><Icon name="phone" /></span>
        <h2 id="urgent-h" className="text-xl font-bold">{t('urgent.title')}</h2>
      </div>
      {reason && <p className="font-semibold mb-1">{t(`urgent.${reason}`)}</p>}
      {info && (
        <ul className="list-disc pl-5 mb-2 space-y-1">
          <li>{t('urgent.suddenPain')}</li><li>{t('urgent.heavyDizzy')}</li><li>{t('urgent.possiblePregnancy')}</li>
        </ul>
      )}
      <p className="mb-4">{t('urgent.body')}</p>
      <div className="grid grid-cols-2 gap-2">
        <a className="btn-primary" href="tel:108">{t('urgent.call108')}</a>
        <a className="btn-primary" href="tel:112">{t('urgent.call112')}</a>
      </div>
    </section>
  )
}

export function HelplineCard() {
  const { t } = useApp()
  return (
    <section className="rounded-blob bg-lav p-5" role="region" aria-labelledby="mh-h">
      <h2 id="mh-h" className="text-xl font-bold mb-2">{t('mh.title')}</h2>
      <p className="mb-4">{t('mh.body')}</p>
      <a className="btn-primary w-full" href="tel:14416"><Icon name="phone" size={20} />{t('mh.call')}</a>
    </section>
  )
}

export function Empty({ title, body, children }) {
  return (
    <div className="card text-center py-8 relative overflow-hidden">
      <Twinkle className="absolute top-5 left-8" />
      <Twinkle className="absolute top-10 right-10" size={10} />
      <Flower size={56} className="mx-auto mb-3" petal="rgb(var(--blush))" />
      <p className="font-display text-xl font-semibold">{title}</p>
      {body && <p className="hint mt-2">{body}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}
