import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../lib/store.jsx'
import { cardForDate } from '../lib/bloom.js'
import Icon from './Icon.jsx'
import { Flower, Listen, Sources, Twinkle } from './ui.jsx'

export const TYPE_STYLE = {
  didYouKnow: { bg: 'from-blush to-peach', icon: 'bulb' },
  myth: { bg: 'from-lav to-blush', icon: 'star' },
  basics: { bg: 'from-lav to-mint', icon: 'flower' },
  comfort: { bg: 'from-peach to-blush', icon: 'heart' },
  care: { bg: 'from-mint to-lav', icon: 'drop' },
  ask: { bg: 'from-lav to-peach', icon: 'steth' },
}

export function useTodaysBloom() {
  const { state, today, update } = useApp()
  const b = state.bloom
  const start = b.start || today
  const card = cardForDate(today, b, state.settings.ageGroup, start)
  useEffect(() => {
    // record the start date and that today's card was shown (the garden grows by one per new day)
    if (!b.start || b.seen[today] !== card.id) {
      update((s) => ({ ...s, bloom: { ...s.bloom, start: s.bloom.start || today, seen: { ...s.bloom.seen, [today]: card.id } } }))
    }
  }, [today, card.id]) // eslint-disable-line
  return card
}

export default function BloomCard({ card, compact = false, headingLevel = 2 }) {
  const { t, L, state, update, discreet, today } = useApp()
  const H = `h${headingLevel}`
  const st = TYPE_STYLE[card.type] || TYPE_STYLE.didYouKnow
  const saved = state.bloom.saved.includes(card.id)
  const quizKey = `${card.id}`
  const guess = state.bloom.quiz?.[quizKey]
  const [flipped, setFlipped] = useState(!!guess)
  useEffect(() => setFlipped(!!state.bloom.quiz?.[quizKey]), [card.id]) // eslint-disable-line
  const isMyth = card.type === 'myth'
  const answerText = L(card.b)

  const choose = (g) => {
    setFlipped(true)
    update((s) => ({ ...s, bloom: { ...s.bloom, quiz: { ...s.bloom.quiz, [quizKey]: g } } }))
  }
  const toggleSave = () => update((s) => ({
    ...s, bloom: { ...s.bloom, saved: saved ? s.bloom.saved.filter((x) => x !== card.id) : [...s.bloom.saved, card.id] },
  }))
  const title = compact ? null : (discreet ? t('bloom.titleDiscreet') : t('bloom.title'))

  return (
    <section aria-label={title || L(card.t)} className={`relative rounded-[2rem] bg-gradient-to-br ${st.bg} p-5 shadow-soft overflow-hidden`}>
      <Twinkle className="absolute top-4 right-16" size={12} />
      <Twinkle className="absolute bottom-16 right-6" size={9} />
      <Flower className="absolute -right-3 -top-3 opacity-80" size={64} petal="rgb(var(--card) / 0.7)" />
      {title && <p className="font-display font-semibold text-lg mb-2 relative">{title}</p>}
      <span className="inline-flex items-center gap-1.5 rounded-full bg-card/80 px-3 py-1 text-sm font-bold relative">
        <Icon name={st.icon} size={16} />{t(`bloom.type.${card.type}`)}
      </span>

      <div className={`flip-card mt-3 relative ${flipped ? 'flipped' : ''}`} style={{ perspective: '1000px' }}>
        <div className="flip-inner">
          <div className="flip-face flip-front" aria-hidden={isMyth && flipped ? true : undefined}>
            <H className="text-[1.45rem] font-bold leading-snug">{L(card.t)}</H>
            {!isMyth && <p className="mt-2 text-[1.05rem]">{answerText}</p>}
            {isMyth && !flipped && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button className="btn bg-card text-plum border-2 border-line" onClick={() => choose('myth')}>{t('bloom.myth')}</button>
                <button className="btn bg-card text-plum border-2 border-line" onClick={() => choose('fact')}>{t('bloom.fact')}</button>
              </div>
            )}
          </div>
          {isMyth && (
            <div className="flip-face flip-back" aria-hidden={!flipped} aria-live="polite">
              <p className="font-display text-lg font-bold">{guess === card.answer ? t('bloom.right') : guess ? t('bloom.wrong') : ''}</p>
              <p className="font-bold">{card.answer === 'myth' ? t('bloom.itsMyth') : t('bloom.itsFact')}</p>
              <p className="mt-1">{answerText}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4 relative">
        <Listen text={() => `${L(card.t)}. ${answerText}`} className="!bg-card/80" />
        <button className="btn !bg-card/80 text-plum" aria-pressed={saved} onClick={toggleSave}>
          <Icon name="heart" fill={saved} size={20} />{saved ? t('bloom.unsave') : t('bloom.save')}
        </button>
        {card.lesson && <Link className="btn !bg-card/80 text-plum" to={`/learn/${card.lesson}`}>{t('bloom.more')}</Link>}
      </div>
      <Sources keys={card.src} className="mt-3 relative" />
      {!compact && <Link to="/blooms" className="inline-block mt-2 font-bold underline underline-offset-4 relative min-h-[44px] pt-2">{t('bloom.past')}</Link>}
    </section>
  )
}
