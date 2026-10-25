import { Link, useNavigate } from 'react-router-dom'
import { useApp, ONBOARDING_QS } from '../lib/store.jsx'
import { fmtDate, fmtRange, diffDays } from '../lib/date.js'
import { urgentReason, veryLowMoodStreak } from '../lib/redflags.js'
import { findPatterns, patternText } from '../lib/insights.js'
import { CONFIG } from '../config.js'
import Icon from '../components/Icon.jsx'
import BloomCard, { useTodaysBloom } from '../components/BloomCard.jsx'
import { Bubble, Flower, HelplineCard, Twinkle, UrgentCard } from '../components/ui.jsx'

const MOODS = ['great', 'okay', 'meh', 'low', 'verylow']
const MOOD_FACE = {
  great: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M8 14c1 2 2.5 3 4 3s3-1 4-3', 'M9 9.5h.01', 'M15 9.5h.01'],
  okay: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M8.5 15c1 1 2 1.3 3.5 1.3s2.5-.3 3.5-1.3', 'M9 9.5h.01', 'M15 9.5h.01'],
  meh: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M8.5 15h7', 'M9 9.5h.01', 'M15 9.5h.01'],
  low: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M8.5 16c1-1 2-1.3 3.5-1.3s2.5.3 3.5 1.3', 'M9 9.5h.01', 'M15 9.5h.01'],
  verylow: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M8 17c1-1.5 2.5-2 4-2s3 .5 4 2', 'M9 9.5h.01', 'M15 9.5h.01', 'M15 12v2'],
}
export { MOODS, MOOD_FACE }

function greeting(t, name, discreet) {
  if (discreet) return t('greet.discreet')
  const h = new Date().getHours()
  const part = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
  return name ? t(`greet.${part}Name`, { name }) : t(`greet.${part}`)
}

export default function Today() {
  const app = useApp()
  const { t, lang, state, update, today, analysis: a, redflags, fertilityVisible, discreet, actions, showToast, addDays } = app
  const nav = useNavigate()
  const log = state.logs[today]
  const urgent = urgentReason(log, { pregnancy: state.pregnancy.on })
  const lowMood = veryLowMoodStreak(state.logs, today)
  const patterns = findPatterns(state.logs, a)
  const bloom = useTodaysBloom()
  const unanswered = ONBOARDING_QS.filter((q) => !state.onboarding.answered[q])
  const preg = state.pregnancy.on
  const yesterday = addDays(today, -1)
  const lastLog = Object.keys(state.logs).sort().pop()
  const showMissed = !!lastLog && lastLog < yesterday && diffDays(lastLog, today) <= 7 && !state.logs[yesterday]
  const back = app.prevOpen && diffDays(app.prevOpen, today) >= 14

  const setMood = (m) => {
    update((s) => ({ ...s, logs: { ...s.logs, [today]: { ...(s.logs[today] || {}), mood: m } } }))
    if (m !== 'low' && m !== 'verylow') showToast(t('log.saved3'))
  }
  const confirmGap = () => update((s) => ({ ...s, confirmedGaps: [...s.confirmedGaps, a.suspectGap.start] }))

  return (
    <div className="space-y-5">
      {state.demo && (
        <div className="flex items-center gap-2 rounded-2xl bg-peach px-4 py-2">
          <Icon name="sparkle" size={18} /><span className="font-bold flex-1">{t('today.demoBadge')}</span>
          <button className="btn-ghost !min-h-[44px] !px-2 underline" onClick={async () => { await actions.removeDemo(); showToast(t('today.demoRemoved')) }}>{t('today.demoRemove')}</button>
        </div>
      )}

      <section aria-labelledby="greet">
        <h1 id="greet" className="text-[1.9rem] font-bold">{greeting(t, state.settings.nickname, discreet)}</h1>
        {back && <p className="text-soft mt-1">{t('greet.back')}</p>}
      </section>

      {urgent && <UrgentCard reason={urgent} />}
      {lowMood && <HelplineCard />}

      {a.suspectGap && !preg && (
        <section className="card border-2 border-lav" aria-labelledby="gap-h">
          <h2 id="gap-h" className="text-xl font-bold mb-1">{t('gap.title')}</h2>
          <p className="mb-3">{t('gap.body', { n: a.suspectGap.length, date: fmtDate(a.suspectGap.start, lang) })}</p>
          <div className="flex flex-col gap-2">
            <button className="btn-primary" onClick={() => nav('/calendar')}>{t('gap.yes')}</button>
            <button className="btn-soft" onClick={confirmGap}>{t('gap.no')}</button>
          </div>
        </section>
      )}

      <div className="space-y-5 lg:space-y-0 lg:grid lg:grid-cols-[1.1fr_1fr] lg:gap-6 lg:items-start">
      <div className="space-y-5">
      {/* Cycle hero */}
      {preg ? (
        <Link to="/pregnancy" className="block card bg-gradient-to-br from-lav to-blush">
          <p className="font-display text-2xl font-bold flex items-center gap-2"><Icon name="baby" />{t('today.pregnancy')}</p>
          <p className="mt-1">{t('preg.paused')}</p>
        </Link>
      ) : (
        <section aria-labelledby="cyc-h" className="relative rounded-[2rem] bg-card shadow-soft p-6 overflow-hidden">
          <div aria-hidden="true" className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-blush/70" />
          <Twinkle className="absolute right-8 top-6" />
          {a.lastStart ? (
            <div className="relative">
              <h2 id="cyc-h" className="font-display">
                <span className="block text-[3.2rem] leading-none font-bold">{t('today.cycleDay', { n: a.cycleDay })}</span>
                <span className="block text-lg font-semibold text-soft mt-1">{t('today.cycleDayLabel')}</span>
              </h2>
              <p className="mt-3 text-[1.05rem] max-w-[32ch]">{t(`phase.${a.phase}`)}</p>
            </div>
          ) : (
            <div className="relative">
              <h2 id="cyc-h" className="font-display text-2xl font-bold">{t('today.noData')}</h2>
              <p className="mt-2 text-soft">{t('today.noDataBody')}</p>
            </div>
          )}
          <Link to={`/log/${today}`} className="btn-primary w-full mt-5 relative text-lg">
            <Icon name="plus" />{log ? t('today.logBtnDone') : t('today.logBtn')}
          </Link>
        </section>
      )}

      {showMissed && (
        <Bubble tone="peach">
          <p>{t('log.missedYesterday')}</p>
          <Link to={`/log/${yesterday}`} className="inline-block font-bold underline underline-offset-4 mt-1 min-h-[44px] pt-2">{t('log.addYesterday')}</Link>
        </Bubble>
      )}

      {/* Next period estimate */}
      {!preg && (
        <section className="card" aria-labelledby="next-h">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h2 id="next-h" className="text-xl font-bold">{discreet ? t('today.nextDiscreet') : t('today.next')}</h2>
            <span className="text-sm font-bold rounded-full bg-lav px-2.5 py-0.5">{t('common.estimate')}</span>
            {a.irregular && <span className="text-sm font-bold rounded-full border-2 border-calm text-calm px-2.5 py-0.5">{t('today.irregular')}</span>}
          </div>
          {a.enough ? (
            <>
              <p className="text-2xl font-display font-bold">{fmtRange(a.next.from, a.next.to, lang)}</p>
              <p className="hint">{t('today.estimateNote')}</p>
              {a.irregular && (
                <div className="mt-3 rounded-2xl bg-lav/60 p-3">
                  <p>{t('today.irregularBody')}</p>
                  <Link to="/doctor" className="inline-block font-bold underline underline-offset-4 mt-1 min-h-[44px] pt-2">{t('today.irregularCta')}</Link>
                </div>
              )}
              {a.late && (
                <div className="mt-3 rounded-2xl bg-peach/70 p-3">
                  <p>{t('today.late')}</p>
                  <Link to="/learn/late" className="inline-block font-bold underline underline-offset-4 mt-1 min-h-[44px] pt-2">{t('today.lateCta')}</Link>
                </div>
              )}
            </>
          ) : (
            <p>{a.startsNeeded === 1 ? t('today.needMoreOne') : t('today.needMore', { n: Math.max(1, a.startsNeeded || (CONFIG.minCyclesForPrediction + 1)) })}</p>
          )}

          {fertilityVisible && a.enough && (
            <div className="mt-4 pt-4 border-t border-line">
              {a.ovulation ? (
                <>
                  <p><span className="font-bold">{t('today.ovulation')}:</span> {fmtRange(a.ovulation.from, a.ovulation.to, lang)}</p>
                  <p><span className="font-bold">{t('today.fertile')}:</span> {fmtRange(a.fertile.from, a.fertile.to, lang)}</p>
                  <p className="mt-2 font-semibold flex gap-2"><Icon name="info" size={20} className="shrink-0 mt-0.5" />{t('today.ovNote')}</p>
                </>
              ) : (
                <p className="hint">{t('today.ovHiddenIrregular')}</p>
              )}
            </div>
          )}
        </section>
      )}

      {/* Quick check-in */}
      <section className="card" aria-labelledby="mood-h">
        <h2 id="mood-h" className="text-xl font-bold mb-3">{t('greet.feeling')}</h2>
        <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(3.4rem, 1fr))' }} role="radiogroup" aria-label={t('mood.label')}>
          {MOODS.map((m) => (
            <button key={m} role="radio" aria-checked={log?.mood === m} onClick={() => setMood(m)}
              className="chip !px-1 flex-col !min-h-[76px] justify-center text-[0.8rem] leading-tight text-center">
              <Icon paths={MOOD_FACE[m]} size={28} />{t(`mood.${m}`)}
            </button>
          ))}
        </div>
        {(log?.mood === 'low' || log?.mood === 'verylow') && (
          <div className="mt-3">
            <Bubble><p>{t('mood.lowFollow')}</p><Link to={`/log/${today}`} className="inline-block font-bold underline underline-offset-4 min-h-[44px] pt-2">{t('log.note')}</Link></Bubble>
          </div>
        )}
      </section>

      </div>
      <div className="space-y-5">
      {patterns.length > 0 && !preg && (
        <section className="card bg-gradient-to-br from-card to-lav/50" aria-labelledby="ins-h">
          <h2 id="ins-h" className="font-display text-lg font-semibold flex items-center gap-2"><Icon name="sparkle" size={20} />{t('today.insight')}</h2>
          <p className="mt-1 text-[1.05rem]">{patternText(patterns[0], t)}</p>
          <Link to="/insights" className="inline-block font-bold underline underline-offset-4 mt-1 min-h-[44px] pt-2">{t('nav.insights')}</Link>
        </section>
      )}

      {unanswered.length > 0 && (
        <section className="card flex items-center gap-4" aria-labelledby="setup-h">
          <Flower size={44} petal="rgb(var(--peach))" center="rgb(var(--accent) / 0.6)" />
          <div className="flex-1">
            <h2 id="setup-h" className="font-bold text-lg">{t('setup.card.title')}</h2>
            <p className="hint">{t('setup.card.body', { n: unanswered.length })}</p>
          </div>
          <Link to="/setup" className="btn-soft !px-4">{t('setup.card.cta')}</Link>
        </section>
      )}

      <BloomCard card={bloom} />

      <nav aria-label="Shortcuts" className="grid grid-cols-2 gap-3">
        <Tile to="/doctor" icon="steth" label={t('today.doctorTile')} sub={redflags.length ? t('today.doctorTileCount', { n: redflags.length }) : null} tone="bg-lav" />
        <Tile to="/feel-better" icon="heart" label={t('today.feelBetter')} tone="bg-blush" />
        <Tile to="/reminders" icon="bell" label={t('today.reminders')} tone="bg-peach" />
        {fertilityVisible && <Tile to="/pregnancy" icon="baby" label={t('today.pregnancy')} tone="bg-mint" />}
      </nav>
      </div>
      </div>
    </div>
  )
}

function Tile({ to, icon, label, sub, tone }) {
  return (
    <Link to={to} className={`${tone} rounded-[1.5rem] p-4 min-h-[96px] flex flex-col justify-between`}>
      <Icon name={icon} />
      <span><span className="block font-bold leading-tight">{label}</span>{sub && <span className="text-sm font-semibold text-calm">{sub}</span>}</span>
    </Link>
  )
}
