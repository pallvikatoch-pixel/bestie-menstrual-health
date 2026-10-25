import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../lib/store.jsx'
import { LANGS } from '../lib/i18n.js'
import { SYMPTOMS } from '../data/symptoms.js'
import { hasVoice, onVoicesChanged } from '../lib/speech.js'
import { download, exportCSV, exportJSON, parseImport } from '../lib/exportData.js'
import Icon from '../components/Icon.jsx'
import { Choices, Dialog, MultiChips, PageHeader, Toggle } from '../components/ui.jsx'

export default function Settings() {
  const app = useApp()
  const { t, pub, updatePub, state, update, actions, showToast, lang, today } = app
  const s = state.settings
  const loc = useLocation()
  const [voice, setVoice] = useState(hasVoice(lang))
  const [pinStep, setPinStep] = useState(null) // warn | enter | off
  const [pin1, setPin1] = useState('')
  const [pin2, setPin2] = useState('')
  const [pinErr, setPinErr] = useState('')
  const [delOpen, setDelOpen] = useState(false)
  const [impOpen, setImpOpen] = useState(null)
  const fileRef = useRef(null)
  useEffect(() => { setVoice(hasVoice(lang)); return onVoicesChanged(() => setVoice(hasVoice(lang))) }, [lang])
  useEffect(() => { if (loc.hash === '#tracked') document.getElementById('tracked')?.scrollIntoView() }, [loc.hash])

  const setS = (k, v) => update((st) => ({ ...st, settings: { ...st.settings, [k]: v } }))
  const doExport = (kind) => {
    const stamp = today
    if (kind === 'json') download(`bestie-backup-${stamp}.json`, exportJSON(state, pub), 'application/json')
    else download(`bestie-logs-${stamp}.csv`, exportCSV(state), 'text/csv')
  }
  const onFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const parsed = parseImport(await file.text())
      setImpOpen(parsed)
    } catch (err) {
      console.warn('Import failed:', err.message)
      showToast(t('set.importFail'), { ms: 6000 })
    }
  }
  const savePin = async () => {
    if (!/^\d{4,}$/.test(pin1)) return setPinErr(t('set.pinShort'))
    if (pin1 !== pin2) return setPinErr(t('set.pinMismatch'))
    await actions.enableLock(pin1)
    setPin1(''); setPin2(''); setPinErr(''); setPinStep(null)
    showToast(t('set.pinDone'))
  }

  return (
    <div>
      <PageHeader title={t('set.title')} />
      <div className="space-y-5 lg:space-y-0 lg:columns-2 lg:gap-6 cols-2 lg:[&>*]:mb-6">

      <Section title={t('set.look')}>
        <Choices label={t('set.lang')} value={pub.lang} onChange={(v) => v && updatePub({ lang: v })} options={LANGS.map((l) => ({ value: l.id, label: l.name }))} />
        <Choices label={t('set.theme')} value={pub.theme || 'light'} onChange={(v) => v && updatePub({ theme: v })} columns={3}
          options={[{ value: 'light', label: t('theme.light'), icon: 'flower' }, { value: 'dark', label: t('theme.dark'), icon: 'moon' }, { value: 'system', label: t('theme.system'), icon: 'phone' }]} />
        <Choices label={t('set.textSize')} value={pub.textSize} onChange={(v) => v !== null && updatePub({ textSize: v })} columns={3}
          options={[{ value: 0, label: t('set.textS') }, { value: 1, label: t('set.textM') }, { value: 2, label: t('set.textL') }]} />
        <Toggle label={t('set.contrast')} checked={pub.contrast} onChange={(v) => updatePub({ contrast: v })} />
        <Toggle label={t('set.readAloud')} checked={s.readAloud} onChange={(v) => setS('readAloud', v)} hint={voice ? null : t('set.readAloudNone')} />
      </Section>

      <Section title={t('set.about')}>
        <label className="label" htmlFor="nick">{t('set.nickname')}</label>
        <input id="nick" className="input" maxLength={30} value={s.nickname} onChange={(e) => setS('nickname', e.target.value)} aria-describedby="nick-h" />
        <p id="nick-h" className="hint mb-4 mt-1">{t('set.nicknameHint')}</p>
        <Choices label={t('set.ageGroup')} hint={t('set.ageHint')} value={s.ageGroup} onChange={(v) => update((st) => ({ ...st, settings: { ...st.settings, ageGroup: v }, onboarding: { ...st.onboarding, answered: { ...st.onboarding.answered, ageGroup: !!v } } }))}
          options={[{ value: 'under18', label: t('age.under18'), toggle: true }, { value: 'adult', label: t('age.adult'), toggle: true }]} />
        {s.ageGroup !== 'adult' && <Toggle label={t('set.fertility')} hint={t('set.fertilityHint')} checked={s.fertilityOn} onChange={(v) => setS('fertilityOn', v)} />}
        <h3 id="tracked" className="label mt-4">{t('set.tracked')}</h3>
        <MultiChips selected={s.tracked} onToggle={(id) => setS('tracked', s.tracked.includes(id) ? s.tracked.filter((x) => x !== id) : [...s.tracked, id])}
          items={SYMPTOMS.filter((x) => !x.safety).map((x) => ({ value: x.id, paths: x.paths, label: t(`sym.${x.id}`) }))} />
        <Link to="/setup" className="btn-soft w-full mt-4">{t('set.setupQs')}</Link>
      </Section>

      <Section title={t('set.privacy')}>
        <div className="flex items-start gap-3 py-2">
          <Icon name="lock" className="shrink-0 mt-1" />
          <div className="flex-1">
            <p className="font-bold">{t('set.pin')}: {pub.locked ? t('common.on') : t('common.off')}</p>
            <p className="hint">{pub.locked ? t('set.pinOnBody') : t('set.pinOffBody')}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {pub.locked ? (<>
                <button className="btn-soft" onClick={actions.lockNow}>{t('set.lockNow')}</button>
                <button className="btn-ghost" onClick={() => setPinStep('off')}>{t('set.pinOff')}</button>
              </>) : <button className="btn-soft" onClick={() => setPinStep('warn')}>{t('set.pinSet')}</button>}
            </div>
          </div>
        </div>
        <Toggle label={t('set.discreet')} hint={t('set.discreetHint')} checked={pub.discreet} onChange={(v) => updatePub({ discreet: v })} />
        {pub.discreet && <p className="hint -mt-1 mb-2">{t('set.discreetIcon')}</p>}
        <Toggle label={t('set.ai')} hint={t('set.aiHint')} checked={s.aiEnabled} onChange={(v) => update((st) => ({ ...st, settings: { ...st.settings, aiEnabled: v, aiAsked: true } }))} />
        <Link to="/privacy" className="btn-soft w-full mt-2"><Icon name="shield" size={20} />{t('set.privacyPage')}</Link>
      </Section>

      <Section title={t('set.data')}>
        <p className="hint mb-3 flex gap-2"><Icon name="info" size={18} className="shrink-0 mt-0.5" />{t('set.exportWarn')}</p>
        <div className="grid gap-2">
          <button className="btn-outline" onClick={() => doExport('json')}><Icon name="download" size={20} />{t('set.exportJson')}</button>
          <button className="btn-outline" onClick={() => doExport('csv')}><Icon name="download" size={20} />{t('set.exportCsv')}</button>
          <button className="btn-outline" onClick={() => fileRef.current?.click()}><Icon name="upload" size={20} />{t('set.import')}</button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={onFile} />
          <button className="btn-outline !border-calm text-calm mt-2" onClick={() => setDelOpen(true)}><Icon name="trash" size={20} />{t('set.deleteAll')}</button>
        </div>
      </Section>

      <Section title={t('set.disclaimer')}><p>{t('set.disclaimerBody')}</p></Section>

      <Section title={t('set.dev')}>
        <p className="hint mb-3">{t('set.devHint')}</p>
        {s.devOffset > 0 && <p className="font-semibold mb-2">{t('set.devOffset', { n: s.devOffset })}</p>}
        <div className="grid gap-2">
          <button className="btn-soft" onClick={() => setS('devOffset', (s.devOffset || 0) + 1)}>{t('set.dev1')}</button>
          <button className="btn-soft" onClick={() => setS('devOffset', (s.devOffset || 0) + 7)}>{t('set.dev7')}</button>
          {s.devOffset > 0 && <button className="btn-ghost" onClick={() => setS('devOffset', 0)}>{t('set.devReset')}</button>}
        </div>
      </Section>
      </div>
      <p className="text-center hint mt-5">{t('set.version')}</p>

      {/* PIN dialogs */}
      <Dialog open={pinStep === 'warn'} onClose={() => setPinStep(null)} title={t('set.pinWarnTitle')}
        actions={<>
          <button className="btn-primary" onClick={() => { doExport('json'); setPinStep('enter') }}><Icon name="download" size={20} />{t('set.pinExportFirst')}</button>
          <button className="btn-soft" onClick={() => setPinStep('enter')}>{t('set.pinContinue')}</button>
          <button className="btn-ghost" onClick={() => setPinStep(null)}>{t('common.cancel')}</button>
        </>}>
        <p>{t('set.pinWarn')}</p>
      </Dialog>
      <Dialog open={pinStep === 'enter'} onClose={() => setPinStep(null)} title={t('set.pinSet')}
        actions={<>
          <button className="btn-primary" onClick={savePin}><Icon name="lock" size={20} />{t('common.save')}</button>
          <button className="btn-ghost" onClick={() => setPinStep(null)}>{t('common.cancel')}</button>
        </>}>
        <label className="label" htmlFor="p1">{t('set.pinEnter')}</label>
        <input id="p1" className="input mb-1 tracking-[0.3em]" type="password" inputMode="numeric" autoComplete="new-password" value={pin1} onChange={(e) => { setPin1(e.target.value.replace(/\D/g, '')); setPinErr('') }} />
        <p className="hint mb-3">{t('set.pinStrength')}</p>
        <label className="label" htmlFor="p2">{t('set.pinConfirm')}</label>
        <input id="p2" className="input tracking-[0.3em]" type="password" inputMode="numeric" autoComplete="new-password" value={pin2} onChange={(e) => { setPin2(e.target.value.replace(/\D/g, '')); setPinErr('') }} aria-invalid={!!pinErr} aria-describedby={pinErr ? 'pin-e' : undefined} />
        {pinErr && <p id="pin-e" role="alert" className="text-calm font-semibold mt-2">{pinErr}</p>}
      </Dialog>
      <Dialog open={pinStep === 'off'} onClose={() => setPinStep(null)} title={t('set.pinOff')}
        actions={<>
          <button className="btn-primary" onClick={async () => { await actions.disableLock(); setPinStep(null); showToast(t('set.pinOffDone')) }}>{t('set.pinOff')}</button>
          <button className="btn-ghost" onClick={() => setPinStep(null)}>{t('common.cancel')}</button>
        </>}>
        <p>{t('set.pinOffBody')}</p>
      </Dialog>

      <Dialog open={delOpen} onClose={() => setDelOpen(false)} title={t('set.deleteAll')}
        actions={<>
          <button className="btn-soft" onClick={() => doExport('json')}><Icon name="download" size={20} />{t('set.exportJson')}</button>
          <button className="btn-primary" onClick={async () => { setDelOpen(false); await actions.deleteEverything() }}>{t('set.deleteBtn')}</button>
          <button className="btn-ghost" onClick={() => setDelOpen(false)}>{t('common.cancel')}</button>
        </>}>
        <p>{t('set.deleteConfirm')}</p>
      </Dialog>

      <Dialog open={!!impOpen} onClose={() => setImpOpen(null)} title={t('set.import')}
        actions={<>
          <button className="btn-primary" onClick={async () => {
            const { state: st, pub: p } = impOpen
            setImpOpen(null)
            if (p) await updatePub({ discreet: !!p.discreet, lang: p.lang || pub.lang, textSize: p.textSize || 0, contrast: !!p.contrast, theme: p.theme || 'light' })
            await actions.importState(st)
            showToast(t('set.importOk'))
          }}>{t('common.continue')}</button>
          <button className="btn-ghost" onClick={() => setImpOpen(null)}>{t('common.cancel')}</button>
        </>}>
        <p>{t('set.importConfirm')}</p>
      </Dialog>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="card" aria-label={title}>
      <h2 className="text-xl font-bold mb-3">{title}</h2>
      {children}
    </section>
  )
}
