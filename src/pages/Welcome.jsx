import { useApp } from '../lib/store.jsx'
import { LANGS } from '../lib/i18n.js'
import { Bubble, Flower, Twinkle } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'

export default function Welcome() {
  const { t, actions, pub, updatePub } = useApp()
  return (
    <main className="min-h-screen max-w-md lg:max-w-5xl mx-auto px-5 pt-6 pb-10 flex flex-col lg:grid lg:grid-cols-2 lg:gap-x-16 lg:content-center">
      <div className="flex justify-end gap-2 lg:col-span-2" role="group" aria-label={t('set.lang')}>
        {LANGS.map((l) => (
          <button key={l.id} className="chip !min-h-[44px] !px-3 text-sm" aria-pressed={pub.lang === l.id} onClick={() => updatePub({ lang: l.id })} lang={l.id}>{l.name}</button>
        ))}
      </div>

      <div className="relative h-44 lg:h-[26rem] my-4 lg:row-span-4" aria-hidden="true">
        <div className="absolute inset-x-6 top-6 bottom-0 rounded-[3rem] bg-gradient-to-br from-blush via-peach to-lav" />
        <Flower size={96} className="absolute left-1/2 -translate-x-1/2 top-4 lg:top-24 lg:scale-[1.8]" petal="rgb(var(--accent) / 0.75)" />
        <Flower size={44} className="absolute left-10 bottom-4" petal="rgb(var(--card))" />
        <Flower size={34} className="absolute right-12 bottom-8" petal="rgb(var(--card))" center="rgb(var(--lav))" />
        <Twinkle className="absolute right-10 top-4" size={18} />
        <Twinkle className="absolute left-12 top-10" size={12} />
        <Twinkle className="absolute right-24 bottom-2" size={10} />
      </div>

      <Bubble typing className="mb-4"><p className="font-bold">{t('welcome.hello')}</p></Bubble>
      <h1 className="text-[2rem] font-bold leading-tight mb-3">{t('welcome.title')}</h1>
      <p className="text-soft mb-8">{t('welcome.body')}</p>

      <div className="space-y-3 mt-auto">
        <button className="w-full card !p-4 flex items-center gap-4 text-left border-2 border-transparent hover:border-accent transition" onClick={actions.startFresh}>
          <span className="grid place-items-center w-12 h-12 rounded-2xl bg-blush shrink-0"><Icon name="plus" /></span>
          <span><span className="block font-bold text-lg">{t('welcome.fresh')}</span><span className="hint">{t('welcome.freshHint')}</span></span>
        </button>
        <button className="w-full card !p-4 flex items-center gap-4 text-left border-2 border-transparent hover:border-accent transition" onClick={actions.startDemo}>
          <span className="grid place-items-center w-12 h-12 rounded-2xl bg-lav shrink-0"><Icon name="sparkle" /></span>
          <span><span className="block font-bold text-lg">{t('welcome.demo')}</span><span className="hint">{t('welcome.demoHint')}</span></span>
        </button>
      </div>
      <p className="text-center mt-6 flex items-center justify-center gap-2 text-soft font-semibold"><Icon name="shield" size={18} />{t('welcome.privacy')}</p>
    </main>
  )
}
