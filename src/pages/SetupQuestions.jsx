import { useState } from 'react'
import { useApp, ONBOARDING_QS } from '../lib/store.jsx'
import SetupQuestion from '../components/SetupQuestion.jsx'
import { Empty, PageHeader } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'

export default function SetupQuestions() {
  const { t, state } = useApp()
  const [open, setOpen] = useState(null)
  const ob = state.onboarding
  const unanswered = ONBOARDING_QS.filter((q) => !ob.answered[q])
  if (open) {
    return (
      <div>
        <PageHeader title={t('setup.page.title')} />
        <SetupQuestion q={open} onDone={() => setOpen(null)} onSkip={() => setOpen(null)} />
        <button className="btn-ghost w-full mt-2" onClick={() => setOpen(null)}>{t('common.back')}</button>
      </div>
    )
  }
  return (
    <div>
      <PageHeader title={t('setup.page.title')} back />
      {!unanswered.length && <Empty title={t('setup.page.empty')} />}
      <ul className="space-y-2">
        {ONBOARDING_QS.map((q) => {
          const done = !!ob.answered[q]
          return (
            <li key={q}>
              <button className="card !p-4 w-full flex items-center gap-3 text-left" onClick={() => setOpen(q)}>
                <span className={`grid place-items-center w-10 h-10 rounded-full shrink-0 ${done ? 'bg-mint' : 'bg-peach'}`}>
                  <Icon name={done ? 'check' : 'info'} size={20} />
                </span>
                <span className="flex-1">
                  <span className="block font-bold">{t(`ob.${q}.q`)}</span>
                  <span className="hint">{done ? t('setup.page.answered') : t('setup.page.skipped')}</span>
                </span>
                <Icon name="right" size={20} />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
