import { useState } from 'react'
import { useApp } from '../lib/store.jsx'
import { LANGS } from '../lib/i18n.js'
import { SYMPTOMS } from '../data/symptoms.js'
import { isValidISO } from '../lib/date.js'
import { askPermission } from '../lib/reminders.js'
import { Bubble, Choices, MultiChips, Toggle } from './ui.jsx'

// Saves an answer to one setup question. Skipped answers are never treated as answers.
export function useSetupAnswers() {
  const { update, updatePub, today, addDays, showToast, t } = useApp()
  const markAnswered = (q) => (s) => {
    const skipped = { ...s.onboarding.skipped }
    delete skipped[q]
    return { ...s, onboarding: { ...s.onboarding, answered: { ...s.onboarding.answered, [q]: true }, skipped } }
  }
  return {
    answer: async (q, v) => {
      if (q === 'lang') await updatePub({ lang: v })
      await update((s0) => {
        let s = markAnswered(q)(s0)
        if (q === 'nickname') s = { ...s, settings: { ...s.settings, nickname: v.trim().slice(0, 30) } }
        if (q === 'ageGroup') s = { ...s, settings: { ...s.settings, ageGroup: v } }
        if (q === 'cycleLength') s = { ...s, settings: { ...s.settings, usualCycle: v } }
        if (q === 'symptoms') s = { ...s, settings: { ...s.settings, tracked: v } }
        if (q === 'lastPeriod') s = { ...s, logs: { ...s.logs, [v]: { ...(s.logs[v] || {}), period: true, flow: s.logs[v]?.flow || 'medium' } } }
        if (q === 'reminders') s = { ...s, reminders: { ...s.reminders, checkin: { ...s.reminders.checkin, on: v.checkin }, period: { ...s.reminders.period, on: v.period } } }
        return s
      })
    },
    skip: (q) => {
      update((s) => ({
        ...s,
        onboarding: {
          ...s.onboarding,
          skipped: { ...s.onboarding.skipped, [q]: today },
          nextReminder: s.onboarding.nextReminder || addDays(today, 7),
        },
      }))
      showToast(t('ob.skipped'))
    },
  }
}

export default function SetupQuestion({ q, onDone, onSkip, showSkip = true }) {
  const { t, pub, state, today, discreet } = useApp()
  const { answer, skip } = useSetupAnswers()
  const [val, setVal] = useState(() => initial(q, state, pub))
  const [err, setErr] = useState('')

  const submit = async () => {
    if (q === 'lastPeriod' && (!isValidISO(val) || val > today)) return setErr(t('ob.dateError'))
    if (q === 'cycleLength') {
      const n = Number(val)
      if (!Number.isInteger(n) || n < 15 || n > 90) return setErr(t('ob.lengthError'))
      await answer(q, n)
    } else if (q === 'reminders') {
      if (val.checkin || val.period) await askPermission()
      await answer(q, val)
    } else await answer(q, val)
    onDone?.()
  }
  const doSkip = () => { skip(q); onSkip?.() }

  const canSave = q === 'ageGroup' ? !!val : q === 'lang' ? !!val : q === 'lastPeriod' ? !!val : q === 'cycleLength' ? String(val).length > 0 : true

  return (
    <div>
      <Bubble typing key={q} className="mb-5">
        <p className="font-bold text-lg">{t(`ob.${q}.q`)}</p>
        <p className="text-[0.95rem] mt-1">{t(`ob.${q}.why`)}</p>
      </Bubble>

      <div className="card mb-4">
        {q === 'lang' && (
          <Choices value={val} onChange={setVal} options={LANGS.map((l) => ({ value: l.id, label: l.name }))} label={t('set.lang')} />
        )}
        {q === 'nickname' && (
          <>
            <label className="label" htmlFor="nick">{t('set.nickname')} <span className="hint font-normal">({t('common.optional')})</span></label>
            <input id="nick" className="input" maxLength={30} value={val} placeholder={t('ob.nickname.placeholder')} onChange={(e) => setVal(e.target.value)} autoComplete="off" />
          </>
        )}
        {q === 'ageGroup' && (
          <Choices value={val} onChange={setVal} label={t('set.ageGroup')} options={[{ value: 'under18', label: t('age.under18') }, { value: 'adult', label: t('age.adult') }]} />
        )}
        {q === 'lastPeriod' && (
          <>
            <label className="label" htmlFor="lp">{t('ob.lastPeriod.q')}</label>
            <input id="lp" type="date" className="input" max={today} value={val} onChange={(e) => { setVal(e.target.value); setErr('') }} aria-invalid={!!err} aria-describedby={err ? 'q-err' : undefined} />
          </>
        )}
        {q === 'cycleLength' && (
          <>
            <label className="label" htmlFor="cl">{t('ob.cycleLength.q')}</label>
            <div className="flex items-center gap-3">
              <input id="cl" type="number" inputMode="numeric" min="15" max="90" className="input max-w-[8rem]" placeholder={t('ob.cycleLength.placeholder')}
                value={val} onChange={(e) => { setVal(e.target.value); setErr('') }} aria-invalid={!!err} aria-describedby={err ? 'q-err' : undefined} />
              <span>{t('ob.cycleLength.unit')}</span>
            </div>
          </>
        )}
        {q === 'symptoms' && (
          <MultiChips columns={3} selected={val}
            items={SYMPTOMS.filter((s) => !s.safety).map((s) => ({ value: s.id, paths: s.paths, label: t(`sym.${s.id}`) }))}
            onToggle={(id) => setVal((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]))} />
        )}
        {q === 'reminders' && (
          <>
            <Toggle label={t('ob.reminders.checkin')} checked={val.checkin} onChange={(v) => setVal((x) => ({ ...x, checkin: v }))} />
            <Toggle label={discreet ? t('rem.discreetText') : t('ob.reminders.period')} checked={val.period} onChange={(v) => setVal((x) => ({ ...x, period: v }))} />
          </>
        )}
        {err && <p id="q-err" role="alert" className="text-calm font-semibold mt-3">{err}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <button className="btn-primary" onClick={submit} disabled={!canSave}>{t('common.continue')}</button>
        {showSkip && <button className="btn-soft" onClick={doSkip}>{t('common.skip')}</button>}
      </div>
    </div>
  )
}

function initial(q, state, pub) {
  const s = state?.settings || {}
  switch (q) {
    case 'lang': return pub.lang
    case 'nickname': return s.nickname || ''
    case 'ageGroup': return s.ageGroup || null
    case 'lastPeriod': return ''
    case 'cycleLength': return s.usualCycle ? String(s.usualCycle) : ''
    case 'symptoms': return s.tracked || []
    case 'reminders': return { checkin: !!state?.reminders.checkin.on, period: !!state?.reminders.period.on }
    default: return ''
  }
}
