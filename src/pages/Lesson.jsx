import { Link, useParams } from 'react-router-dom'
import { useApp } from '../lib/store.jsx'
import { lessonById } from '../content/lessons.js'
import { LessonArt } from '../components/Art.jsx'
import Icon from '../components/Icon.jsx'
import { Empty, Listen, PageHeader, Sources, Twinkle } from '../components/ui.jsx'

export default function Lesson() {
  const { id } = useParams()
  const { t, L } = useApp()
  const l = lessonById[id]
  if (!l) return <Empty title={t('ask.noAnswer')}><Link className="btn-soft" to="/learn">{t('learn.title')}</Link></Empty>
  const fullText = () => [L(l.title), ...l.sections.map((s) => `${L(s.h)}. ${L(s.p)}`)].join('. ')
  return (
    <article>
      <PageHeader title={L(l.title)} back sub={t('learn.minutes', { n: l.minutes })} />
      <div className="relative rounded-[2rem] bg-gradient-to-br from-blush to-lav h-40 p-4 mb-4">
        <LessonArt id={l.art} />
        <Twinkle className="absolute top-4 right-6" />
      </div>
      <Listen text={fullText} className="mb-4" />
      <div className="space-y-3">
        {l.sections.map((s, i) => (
          <section key={i} className="card">
            <h2 className="text-xl font-bold mb-1">{L(s.h)}</h2>
            <p className="text-[1.05rem]">{L(s.p)}</p>
          </section>
        ))}
      </div>
      <div className="card mt-4 bg-mint/60 flex gap-3 items-start">
        <Icon name="sparkle" className="shrink-0 mt-1" />
        <p className="font-semibold">{t('learn.done')}</p>
      </div>
      <Sources keys={l.sources} className="mt-4" />
      <p className="hint mt-2">{t('common.notMedical')}</p>
      <Link to="/doctor" className="btn-soft w-full mt-4"><Icon name="steth" size={20} />{t('doc.title')}</Link>
    </article>
  )
}
