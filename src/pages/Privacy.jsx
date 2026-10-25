import { useApp } from '../lib/store.jsx'
import Icon from '../components/Icon.jsx'
import { PageHeader, Sources } from '../components/ui.jsx'

export default function Privacy() {
  const { t } = useApp()
  return (
    <div className="space-y-4">
      <PageHeader title={t('priv.title')} back />
      <section className="card space-y-3">
        {['p1', 'p2', 'p3', 'p4'].map((k, i) => (
          <p key={k} className="flex gap-3"><Icon name={['shield', 'lock', 'lock', 'chat'][i]} className="shrink-0 mt-1" />{t(`priv.${k}`)}</p>
        ))}
      </section>
      <section className="card bg-peach/60">
        <h2 className="text-xl font-bold mb-2">{t('priv.limits')}</h2>
        <ul className="space-y-2">{['l1', 'l2', 'l3', 'l4'].map((k) => <li key={k} className="flex gap-2"><Icon name="info" size={18} className="shrink-0 mt-1" />{t(`priv.${k}`)}</li>)}</ul>
      </section>
      <section className="card">
        <h2 className="text-xl font-bold mb-2">{t('set.disclaimer')}</h2>
        <p className="mb-2">{t('set.disclaimerBody')}</p>
        <Sources keys={['nhsPeriods', 'acogTeen', 'whoPCOS', 'mohfwNHM', 'fogsi']} />
      </section>
    </div>
  )
}
