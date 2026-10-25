import { useState } from 'react'
import { useApp } from '../lib/store.jsx'
import { Dialog, Flower } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'

export default function Lock() {
  const { t, actions, discreet } = useApp()
  const [pin, setPin] = useState('')
  const [err, setErr] = useState(false)
  const [busy, setBusy] = useState(false)
  const [forgot, setForgot] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    const ok = await actions.unlock(pin)
    setBusy(false)
    if (!ok) { setErr(true); setPin('') }
  }
  return (
    <main className="min-h-screen max-w-sm mx-auto px-5 flex flex-col justify-center">
      <div className="text-center mb-6">
        {discreet ? <Icon name="diary" size={56} className="mx-auto text-soft" /> : <Flower size={72} className="mx-auto" petal="rgb(var(--accent) / 0.7)" />}
        <h1 className="text-3xl font-bold mt-3">{discreet ? t('lock.titleDiscreet') : t('lock.title')}</h1>
      </div>
      <form onSubmit={submit} className="card space-y-4">
        <label className="label" htmlFor="pin">{t('lock.enter')}</label>
        <input id="pin" className="input text-center text-2xl tracking-[0.5em]" type="password" inputMode="numeric" autoComplete="off"
          value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setErr(false) }} aria-invalid={err} aria-describedby={err ? 'pin-err' : undefined} autoFocus />
        {err && <p id="pin-err" className="text-calm font-semibold" role="alert">{t('lock.wrong')}</p>}
        <button className="btn-primary w-full" disabled={pin.length < 4 || busy}><Icon name="lock" size={20} />{busy ? t('common.loading') : t('lock.unlock')}</button>
      </form>
      <button className="btn-ghost mt-4" onClick={() => setForgot(true)}>{t('lock.forgot')}</button>
      <Dialog open={forgot} onClose={() => setForgot(false)} title={t('lock.forgot')}
        actions={<>
          <button className="btn-outline" onClick={() => actions.deleteEverything()}>{t('lock.reset')}</button>
          <button className="btn-soft" onClick={() => setForgot(false)}>{t('common.cancel')}</button>
        </>}>
        <p>{t('lock.forgotBody')}</p>
      </Dialog>
    </main>
  )
}
