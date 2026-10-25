import { useApp } from '../lib/store.jsx'
import { askPermission } from '../lib/reminders.js'
import Icon from '../components/Icon.jsx'
import { PageHeader, Toggle } from '../components/ui.jsx'

export default function Reminders() {
  const { t, state, update, discreet, showToast } = useApp()
  const r = state.reminders
  const set = (k, patch) => update((s) => ({ ...s, reminders: { ...s.reminders, [k]: { ...s.reminders[k], ...patch } } }))
  const turnOn = async (k, v) => {
    set(k, { on: v })
    if (v) {
      const p = await askPermission()
      if (p !== 'granted') showToast(t('rem.permDenied'))
    }
  }
  const setupOn = !state.onboarding.remindOff
  return (
    <div className="space-y-4">
      <PageHeader title={t('rem.title')} back sub={t('rem.intro')} />
      <p className="card !py-3 bg-lav/60 flex gap-2"><Icon name="info" size={20} className="shrink-0 mt-1" />{t('rem.limit')}</p>

      <section className="card divide-y divide-line">
        <div className="pb-2">
          <Toggle label={discreet ? t('rem.discreetText') : t('rem.period')} hint={t('rem.periodHint')} checked={r.period.on} onChange={(v) => turnOn('period', v)} />
        </div>
        <div className="py-2">
          <Toggle label={t('rem.checkin')} checked={r.checkin.on} onChange={(v) => turnOn('checkin', v)} />
          {r.checkin.on && <TimeInput label={t('rem.time')} value={r.checkin.time} onChange={(v) => set('checkin', { time: v })} />}
        </div>
        <div className="py-2">
          <Toggle label={t('rem.meds')} checked={r.meds.on} onChange={(v) => turnOn('meds', v)} />
          {r.meds.on && (
            <div className="space-y-3 pb-2">
              <div>
                <label className="label" htmlFor="medname">{t('rem.medsName')}</label>
                <input id="medname" className="input" value={r.meds.name} maxLength={40} onChange={(e) => set('meds', { name: e.target.value })} />
              </div>
              {r.meds.times.map((tm, i) => (
                <div key={i} className="flex items-end gap-2">
                  <TimeInput label={`${t('rem.time')} ${i + 1}`} value={tm} onChange={(v) => set('meds', { times: r.meds.times.map((x, j) => (j === i ? v : x)) })} />
                  {r.meds.times.length > 1 && <button className="btn-ghost !px-3" aria-label={t('rem.removeTime', { t: tm })} onClick={() => set('meds', { times: r.meds.times.filter((_, j) => j !== i) })}><Icon name="x" /></button>}
                </div>
              ))}
              {r.meds.times.length < 4 && <button className="btn-soft" onClick={() => set('meds', { times: [...r.meds.times, '21:00'] })}><Icon name="plus" size={20} />{t('rem.addTime')}</button>}
            </div>
          )}
        </div>
        <div className="py-2">
          <Toggle label={t('rem.custom')} checked={r.custom.on} onChange={(v) => turnOn('custom', v)} />
          {r.custom.on && (
            <div className="space-y-3 pb-2">
              <div>
                <label className="label" htmlFor="custlabel">{t('rem.customLabel')}</label>
                <input id="custlabel" className="input" value={r.custom.label} maxLength={60} onChange={(e) => set('custom', { label: e.target.value })} />
              </div>
              <TimeInput label={t('rem.time')} value={r.custom.time} onChange={(v) => set('custom', { time: v })} />
            </div>
          )}
        </div>
        <div className="pt-2">
          <Toggle label={t('rem.setup')} checked={setupOn} onChange={(v) => update((s) => ({ ...s, onboarding: { ...s.onboarding, remindOff: !v } }))} />
        </div>
      </section>
      <button className="btn-soft w-full" onClick={() => window.dispatchEvent(new Event('bestie:test-reminder'))}><Icon name="bell" size={20} />{t('rem.test')}</button>
    </div>
  )
}

function TimeInput({ label, value, onChange }) {
  const id = `t-${label.replace(/\W/g, '')}`
  return (
    <div className="flex-1">
      <label className="label" htmlFor={id}>{label}</label>
      <input id={id} type="time" className="input max-w-[10rem]" value={value} onChange={(e) => e.target.value && onChange(e.target.value)} />
    </div>
  )
}
