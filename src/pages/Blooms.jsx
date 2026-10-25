import { useApp } from '../lib/store.jsx'
import { dailyById } from '../content/daily.js'
import { fmtDate } from '../lib/date.js'
import BloomCard from '../components/BloomCard.jsx'
import { Flower, PageHeader } from '../components/ui.jsx'

const PETALS = ['rgb(var(--blush))', 'rgb(var(--lav))', 'rgb(var(--peach))', 'rgb(var(--accent) / 0.5)', 'rgb(var(--mint))']

export default function Blooms() {
  const { t, lang, state } = useApp()
  const seen = Object.entries(state.bloom.seen).sort((a, b) => (a[0] < b[0] ? 1 : -1))
  const uniqueIds = [...new Set(seen.map(([, id]) => id))].filter((id) => dailyById[id])
  const n = uniqueIds.length
  const saved = state.bloom.saved.filter((id) => dailyById[id])
  const milestone = n >= 60 ? 'milestone60' : n >= 30 ? 'milestone30' : n >= 7 ? 'milestone7' : null
  return (
    <div className="space-y-5">
      <PageHeader title={t('bloom.pastTitle')} back />
      <section className="card text-center" aria-labelledby="garden-h">
        <h2 id="garden-h" className="font-display text-2xl font-bold">{n === 1 ? t('bloom.garden1') : t('bloom.garden', { n })}</h2>
        {milestone && <p className="mt-1 font-semibold">{t(`bloom.${milestone}`)}</p>}
        <div className="flex flex-wrap justify-center gap-1 mt-4" aria-hidden="true">
          {uniqueIds.map((id, i) => <Flower key={id} size={30} petal={PETALS[i % PETALS.length]} />)}
        </div>
      </section>

      <section aria-labelledby="saved-h">
        <h2 id="saved-h" className="text-xl font-bold mb-3">{t('bloom.saved')}</h2>
        {saved.length ? (
          <div className="grid gap-3 lg:grid-cols-2">{saved.map((id) => <BloomCard key={id} card={dailyById[id]} compact headingLevel={3} />)}</div>
        ) : <p className="hint">{t('bloom.emptySaved')}</p>}
      </section>

      <section aria-labelledby="past-h">
        <h2 id="past-h" className="text-xl font-bold mb-3">{t('bloom.past')}</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          {seen.filter(([, id]) => dailyById[id]).map(([d, id]) => (
            <div key={d}>
              <p className="hint mb-1">{fmtDate(d, lang, { weekday: 'short', day: 'numeric', month: 'short' })}</p>
              <BloomCard card={dailyById[id]} compact headingLevel={3} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
