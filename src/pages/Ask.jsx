import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../lib/store.jsx'
import { FAQ, FAQ_CATEGORIES } from '../content/faq.js'
import { LESSONS, lessonById } from '../content/lessons.js'
import { matchFaq } from '../lib/faqMatch.js'
import { safetyFlags } from '../content/safetyWords.js'
import { CONFIG } from '../config.js'
import Icon from '../components/Icon.jsx'
import { Avatar, Bubble, HelplineCard, Listen, PageHeader, Sources, Toggle, TypingDots, UrgentCard } from '../components/ui.jsx'

const SUGGESTED = ['do-i-have-pcos', 'late-pregnant', 'cramps-help', 'heavy', 'discharge', 'what-pcos']
const faqById = Object.fromEntries(FAQ.map((f) => [f.id, f]))

export default function Ask() {
  const app = useApp()
  const { t, L, lang, state, update, analysis } = app
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)
  const [cat, setCat] = useState(null)
  const [err, setErr] = useState('')
  const endRef = useRef(null)
  const chat = state.chat || []
  const ai = state.settings.aiEnabled
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [chat.length, busy])

  const setSetting = (k, v) => update((s) => ({ ...s, settings: { ...s.settings, [k]: v } }))
  const push = (msgs) => update((s) => ({ ...s, chat: [...(s.chat || []), ...msgs].slice(-60) }))

  const offlineAnswer = (text, flags, note) => {
    const f = matchFaq(text)
    return f ? { role: 'bot', faqId: f.id, flags, note } : { role: 'bot', none: true, flags, note }
  }

  const send = async (text) => {
    const question = (text ?? q).trim()
    if (!question) return
    if (question.length > CONFIG.aiMaxChars) return setErr(t('ask.tooLong', { n: CONFIG.aiMaxChars }))
    setErr('')
    setQ('')
    const flags = safetyFlags(question)
    const userMsg = { role: 'user', text: question }
    if (!ai) { await push([userMsg, offlineAnswer(question, flags)]); return }
    await push([userMsg])
    setBusy(true)
    try {
      const body = {
        question, lang, ageGroup: state.settings.ageGroup || 'unknown',
        history: chat.filter((m) => m.role === 'user' || m.ai).slice(-CONFIG.aiHistoryMessages).map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', text: m.text || '' })),
        lessons: pickLessons(question, lang),
        summary: state.settings.aiUseSummary ? cycleSummary(state, analysis) : null,
      }
      const res = await fetch('/api/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (!data.answer) throw new Error('empty')
      await push([{ role: 'bot', ai: true, text: data.answer, lesson: data.lesson || null, flags: { urgent: flags.urgent || data.flags?.urgent, selfHarm: flags.selfHarm || data.flags?.selfHarm } }])
    } catch (e) {
      console.warn('AI chat unavailable, using offline answers:', e.message)
      await push([offlineAnswer(question, flags, 'offline')])
    } finally { setBusy(false) }
  }

  return (
    <div className="space-y-4">
      <PageHeader title={t('ask.title')} />
      <Bubble><p>{t('ask.intro')}</p></Bubble>

      {!ai && !state.settings.aiAsked && (
        <section className="card border-2 border-lav" aria-labelledby="ai-h">
          <h2 id="ai-h" className="font-bold text-lg">{t('ask.aiCardTitle')}</h2>
          <p className="mb-3">{t('ask.aiCardBody')}</p>
          <div className="flex flex-col gap-2">
            <button className="btn-primary" onClick={() => update((s) => ({ ...s, settings: { ...s.settings, aiEnabled: true, aiAsked: true } }))}>{t('ask.aiOn')}</button>
            <button className="btn-soft" onClick={() => setSetting('aiAsked', true)}>{t('ask.aiNotNow')}</button>
          </div>
        </section>
      )}
      {ai ? (
        <section className="card !py-3">
          <p className="flex gap-2 items-start"><Icon name="shield" size={20} className="shrink-0 mt-1" />{t('ask.aiActive')}</p>
          <Toggle label={t('ask.useSummary')} hint={t('ask.useSummaryHint')} checked={state.settings.aiUseSummary} onChange={(v) => setSetting('aiUseSummary', v)} />
          <button className="btn-ghost !min-h-[44px]" onClick={() => setSetting('aiEnabled', false)}>{t('ask.aiOff')}</button>
        </section>
      ) : <p className="hint flex gap-2"><Icon name="shield" size={18} className="shrink-0 mt-0.5" />{t('ask.offlineNote')}</p>}

      <div className="space-y-4" aria-live="polite">
        {chat.map((m, i) => (m.role === 'user' ? <UserMsg key={i} text={m.text} t={t} /> : <BotMsg key={i} m={m} />))}
        {busy && <div className="flex items-end gap-3"><Avatar /><div className="bg-lav rounded-3xl rounded-bl-md px-4 py-3"><TypingDots label={t('ask.typing')} /></div></div>}
        <div ref={endRef} />
      </div>

      {chat.length === 0 && (
        <section aria-labelledby="sug-h">
          <h2 id="sug-h" className="font-bold mb-2">{t('ask.suggested')}</h2>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED.map((id) => <button key={id} className="chip text-left !min-h-[44px] text-[0.95rem]" onClick={() => send(L(faqById[id].q))}>{L(faqById[id].q)}</button>)}
          </div>
        </section>
      )}

      <form className="sticky bottom-[calc(80px+env(safe-area-inset-bottom,0px))] lg:bottom-6 z-10 card !p-2 flex gap-2 items-end shadow-lift" onSubmit={(e) => { e.preventDefault(); send() }}>
        <label htmlFor="askq" className="sr-only">{t('ask.placeholder')}</label>
        <textarea id="askq" rows={1} className="input !border-0 py-3 resize-none" placeholder={t('ask.placeholder')} value={q} maxLength={CONFIG.aiMaxChars + 50}
          onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          aria-invalid={!!err} aria-describedby={err ? 'ask-err' : undefined} />
        <button className="btn-primary !px-4 shrink-0" disabled={!q.trim() || busy} aria-label={t('ask.send')}><Icon name="send" size={20} /></button>
      </form>
      {err && <p id="ask-err" role="alert" className="text-calm font-semibold">{err}</p>}

      <section aria-labelledby="cat-h">
        <h2 id="cat-h" className="font-bold mb-2">{t('ask.categories')}</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {FAQ_CATEGORIES.map((c) => <button key={c} className="chip !min-h-[44px]" aria-pressed={cat === c} onClick={() => setCat(cat === c ? null : c)}>{t(`ask.cat.${c}`)}</button>)}
        </div>
        {cat && (
          <ul className="space-y-2">
            {FAQ.filter((f) => f.cat === cat).map((f) => (
              <li key={f.id}><button className="card !p-3 w-full text-left font-semibold flex items-center gap-2" onClick={() => send(L(f.q))}><Icon name="chat" size={20} className="shrink-0" />{L(f.q)}</button></li>
            ))}
          </ul>
        )}
      </section>
      {chat.length > 0 && <button className="btn-ghost w-full" onClick={() => update((s) => ({ ...s, chat: [] }))}>{t('ask.clear')}</button>}
    </div>
  )
}

function UserMsg({ text, t }) {
  return (
    <div className="flex justify-end">
      <p className="bg-blush rounded-3xl rounded-br-md px-4 py-3 max-w-[85%]"><span className="sr-only">{t('ask.you')}: </span>{text}</p>
    </div>
  )
}

function BotMsg({ m }) {
  const { t, L } = useApp()
  const f = m.faqId ? faqById[m.faqId] : null
  const text = f ? L(f.a) : m.none ? t('ask.noAnswer') : m.text
  const lesson = f?.lesson || m.lesson
  return (
    <div className="space-y-3">
      <div className="flex items-end gap-3">
        <Avatar />
        <div className="bg-lav rounded-3xl rounded-bl-md px-4 py-3 max-w-[85%] space-y-2">
          <span className="sr-only">{t('ask.bestie')}: </span>
          {m.note === 'offline' && <p className="font-semibold">{t('ask.offline')}</p>}
          {f && <p className="font-bold">{L(f.q)}</p>}
          <p className="whitespace-pre-line">{text}</p>
          {f?.worry && <p className="font-semibold">{t('ask.worryLine')} <Link to="/doctor" className="underline underline-offset-2 font-bold">{t('doc.title')}</Link></p>}
          {lesson && lessonById[lesson] && <p><Link to={`/learn/${lesson}`} className="underline underline-offset-2">{t('ask.fromLesson', { name: L(lessonById[lesson].title) })}</Link></p>}
          {f && <Sources keys={f.sources} />}
          {(m.ai || f) && <p className="text-sm text-soft">{t('common.notMedical')}</p>}
          <Listen text={text} className="!bg-card/70 !min-h-[44px]" />
        </div>
      </div>
      {m.flags?.urgent && <UrgentCard />}
      {m.flags?.selfHarm && <HelplineCard />}
    </div>
  )
}

// Send only the lessons relevant to the question (by simple keyword overlap), to keep the request small.
function pickLessons(question, lang) {
  const words = question.toLowerCase().split(/\W+/).filter((w) => w.length > 3)
  const scored = LESSONS.map((l) => {
    const text = [l.title.en, l.title.hi, ...l.sections.map((s) => `${s.h.en} ${s.p.en}`)].join(' ').toLowerCase()
    return { l, score: words.filter((w) => text.includes(w)).length }
  }).sort((a, b) => b.score - a.score).slice(0, 2)
  return scored.map(({ l }) => ({ id: l.id, title: l.title[lang] || l.title.en, text: l.sections.map((s) => `${s.h.en}: ${s.p.en}`).join('\n') }))
}

// Optional, off by default: no name, no notes, no exact daily logs.
function cycleSummary(state, a) {
  if (!a?.lastStart) return null
  const prev = a.periods.length > 1 ? a.periods[a.periods.length - 2].start : null
  const syms = new Set()
  if (prev) for (const [d, l] of Object.entries(state.logs)) if (d >= prev && d < a.lastStart) (l.symptoms || []).forEach((s) => syms.add(s))
  return { averageCycleDays: a.median, regular: a.enough ? !a.irregular : null, lastPeriodStart: a.lastStart, lastCycleSymptoms: [...syms] }
}
