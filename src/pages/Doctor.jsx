import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../lib/store.jsx'
import { fmtDate } from '../lib/date.js'
import { CARE_OPTIONS, UNLOGGABLE, UNLOGGABLE_SOURCES } from '../data/redflags.js'
import Icon from '../components/Icon.jsx'
import { Bubble, PageHeader, Sources, UrgentCard } from '../components/ui.jsx'

export default function Doctor() {
  const { t, lang, state, update, redflags } = useApp()
  const [showHidden, setShowHidden] = useState(false)
  const preg = state.pregnancy.on
  // A dismissed card stays hidden until new logs trigger it again (its signature changes).
  const visible = redflags.filter((r) => showHidden || state.dismissed[r.id] !== r.signature)
  const hiddenCount = redflags.length - redflags.filter((r) => state.dismissed[r.id] !== r.signature).length
  const dismiss = (r) => update((s) => ({ ...s, dismissed: { ...s.dismissed, [r.id]: r.signature } }))

  return (
    <div className="space-y-4">
      <PageHeader title={t('doc.title')} back />
      <Bubble><p>{t('doc.intro')}</p></Bubble>

      {preg && <p className="card">{t('doc.paused')} <Link className="font-bold underline" to="/pregnancy">{t('preg.title')}</Link></p>}

      {!preg && redflags.length === 0 && <div className="card"><p>{t('doc.none')}</p></div>}

      <div className="space-y-4 lg:space-y-0 lg:columns-2 lg:gap-5 cols-2 lg:[&>*]:mb-5">
      {visible.map((r) => (
        <article key={r.id} className="card border-l-[6px] border-calm" aria-labelledby={`rf-${r.id}`}>
          <h2 id={`rf-${r.id}`} className="text-xl font-bold mb-3 flex gap-2"><Icon name="info" className="text-calm shrink-0 mt-1" />{t(`doc.${r.id}.title`)}</h2>
          <h3 className="font-bold">{t('doc.noticed')}</h3>
          <p>{t(`doc.${r.id}.noticed`, { lo: r.lo, hi: r.hi, lengths: (r.lengths || []).join(', '), gap: r.gap })}</p>
          <p className="hint mb-3">{t('doc.days', { days: r.days.map((d) => fmtDate(d, lang)).join(', ') })}</p>
          <h3 className="font-bold">{t('doc.why')}</h3>
          <p className="mb-3">{t(`doc.${r.id}.why`)}</p>
          <h3 className="font-bold">{t('doc.what')}</h3>
          <ul className="space-y-1 mb-3">
            {CARE_OPTIONS.map((c) => (
              <li key={c.id} className="flex gap-2"><Icon name="check" size={18} className="shrink-0 mt-1" />
                <span>{c.url ? <a className="underline underline-offset-2" href={c.url} target="_blank" rel="noopener noreferrer">{t(`care.${c.id}`)}</a> : t(`care.${c.id}`)}</span></li>
            ))}
          </ul>
          <Sources keys={r.rule.sources} />
          <div className="flex flex-wrap gap-2 mt-3">
            <Link to="/visit" className="btn-primary"><Icon name="print" size={20} />{t('doc.prepare')}</Link>
            {state.dismissed[r.id] !== r.signature && <button className="btn-ghost" onClick={() => dismiss(r)}>{t('common.dismiss')}</button>}
          </div>
        </article>
      ))}
      </div>

      {hiddenCount > 0 && !showHidden && (
        <div className="card !py-3 flex flex-wrap items-center gap-2">
          <p className="flex-1 hint">{t('doc.hidden', { n: hiddenCount })}</p>
          <button className="btn-soft" onClick={() => setShowHidden(true)}>{t('doc.showHidden')}</button>
        </div>
      )}

      {redflags.length > 0 || preg ? null : (
        <Link to="/visit" className="btn-soft w-full"><Icon name="print" size={20} />{t('doc.prepare')}</Link>
      )}

      <section className="card" aria-labelledby="unlog-h">
        <h2 id="unlog-h" className="text-xl font-bold mb-1">{t('doc.unloggable')}</h2>
        <p className="mb-2">{t('doc.unloggableIntro')}</p>
        <ul className="space-y-2 mb-3">
          {UNLOGGABLE.map((u) => <li key={u} className="flex gap-2"><Icon name="info" size={18} className="shrink-0 mt-1 text-calm" />{t(`doc.u.${u}`)}</li>)}
        </ul>
        <Sources keys={UNLOGGABLE_SOURCES} />
      </section>

      <UrgentCard info />
    </div>
  )
}
