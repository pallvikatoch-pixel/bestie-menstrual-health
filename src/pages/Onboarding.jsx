import { useState } from 'react'
import { useApp, ONBOARDING_QS } from '../lib/store.jsx'
import SetupQuestion from '../components/SetupQuestion.jsx'
import { Bubble, Flower, Twinkle } from '../components/ui.jsx'

export default function Onboarding() {
  const { t, update, today, addDays } = useApp()
  const [step, setStep] = useState(0)
  const [finished, setFinished] = useState(false)
  const total = ONBOARDING_QS.length
  const next = () => (step + 1 >= total ? setFinished(true) : setStep(step + 1))

  const skipAll = () => {
    update((s) => {
      const skipped = { ...s.onboarding.skipped }
      ONBOARDING_QS.forEach((q) => { if (!s.onboarding.answered[q]) skipped[q] = today })
      return { ...s, onboarding: { ...s.onboarding, skipped, done: true, nextReminder: s.onboarding.nextReminder || addDays(today, 7) } }
    })
  }
  const finish = () => update((s) => ({ ...s, onboarding: { ...s.onboarding, done: true } }))

  if (finished) {
    return (
      <main className="min-h-screen max-w-md mx-auto px-5 py-10 flex flex-col justify-center text-center">
        <div className="relative mx-auto mb-4" aria-hidden="true">
          <Flower size={96} petal="rgb(var(--accent) / 0.7)" />
          <Twinkle className="absolute -top-2 -right-3 pop" size={20} />
          <Twinkle className="absolute bottom-0 -left-4 pop" size={14} />
        </div>
        <h1 className="text-3xl font-bold mb-2">{t('ob.finish')}</h1>
        <p className="text-soft mb-8">{t('ob.finishBody')}</p>
        <button className="btn-primary" onClick={finish} autoFocus>{t('common.continue')}</button>
      </main>
    )
  }

  return (
    <main className="min-h-screen max-w-md lg:max-w-xl mx-auto px-5 pt-6 lg:pt-16 pb-10">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1">
          <p className="hint mb-2" aria-live="polite">{t('ob.step', { n: step + 1, total })}</p>
          <div className="h-2 rounded-full bg-line overflow-hidden" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step + 1} aria-label={t('ob.step', { n: step + 1, total })}>
            <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${((step + 1) / total) * 100}%` }} />
          </div>
        </div>
        <button className="btn-ghost" onClick={skipAll}>{t('common.skipAll')}</button>
      </div>
      {step === 0 && <Bubble className="mb-4" tone="peach"><p>{t('ob.intro')}</p></Bubble>}
      <SetupQuestion key={ONBOARDING_QS[step]} q={ONBOARDING_QS[step]} onDone={next} onSkip={next} />
    </main>
  )
}
