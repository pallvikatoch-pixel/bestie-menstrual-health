import { Link } from 'react-router-dom'
import { useApp } from '../lib/store.jsx'
import { LESSONS } from '../content/lessons.js'
import { LessonArt } from '../components/Art.jsx'
import BloomCard, { useTodaysBloom } from '../components/BloomCard.jsx'
import Icon from '../components/Icon.jsx'
import { PageHeader } from '../components/ui.jsx'

const TONES = ['bg-blush', 'bg-lav', 'bg-peach', 'bg-mint']

export default function Learn() {
  const { t, L, state } = useApp()
  const bloom = useTodaysBloom()
  const young = state.settings.ageGroup !== 'adult'
  // younger readers see "My first period" first
  const lessons = [...LESSONS].sort((a, b) => (young ? (b.young ? 1 : 0) - (a.young ? 1 : 0) : 0))
  return (
    <div className="space-y-5">
      <PageHeader title={t('learn.title')} sub={t('learn.intro')} />
      <div className="space-y-5 lg:space-y-0 lg:grid lg:grid-cols-[1.4fr_1fr] lg:gap-6 lg:items-start">
      <BloomCard card={bloom} />
      <Link to="/feel-better" className="flex items-center gap-4 rounded-[1.75rem] bg-gradient-to-r from-peach to-blush p-4">
        <span className="grid place-items-center w-12 h-12 rounded-2xl bg-card/70"><Icon name="heart" /></span>
        <span className="flex-1"><span className="block font-display text-xl font-bold">{t('fb.title')}</span><span className="text-[0.95rem]">{t('fb.intro')}</span></span>
        <Icon name="right" />
      </Link>
      </div>
      <section aria-labelledby="les-h">
        <h2 id="les-h" className="text-xl font-bold mb-3">{t('learn.lessons')}</h2>
        <ul className="grid gap-3 lg:grid-cols-2">
          {lessons.map((l, i) => (
            <li key={l.id}>
              <Link to={`/learn/${l.id}`} className="flex items-center gap-4 card !p-3">
                <span className={`${TONES[i % TONES.length]} rounded-2xl w-24 h-20 shrink-0 p-1`}><LessonArt id={l.art} /></span>
                <span className="flex-1 min-w-0">
                  <span className="block font-bold text-[1.05rem] leading-snug">{L(l.title)}</span>
                  <span className="block hint leading-snug">{L(l.summary)}</span>
                  <span className="block text-sm font-semibold text-soft mt-1">{t('learn.minutes', { n: l.minutes })}{l.young ? ` · ${t('learn.youngerTag')}` : ''}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
