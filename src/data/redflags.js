// "Worth seeing a doctor" rules, as data. Numbers come from src/config.js; the checks are in src/lib/redflags.js.
// Card text lives in src/i18n under doc.<id>.title / doc.<id>.why.
export const SOURCES = {
  nhsHeavy: { name: 'NHS – Heavy periods', url: 'https://www.nhs.uk/conditions/heavy-periods/' },
  nhsIrregular: { name: 'NHS – Irregular periods', url: 'https://www.nhs.uk/conditions/irregular-periods/' },
  nhsMissed: { name: 'NHS – Stopped or missed periods', url: 'https://www.nhs.uk/conditions/stopped-or-missed-periods/' },
  nhsPain: { name: 'NHS – Period pain', url: 'https://www.nhs.uk/conditions/period-pain/' },
  nhsPeriods: { name: 'NHS – Periods', url: 'https://www.nhs.uk/conditions/periods/' },
  nhsAnaemia: { name: 'NHS – Iron deficiency anaemia', url: 'https://www.nhs.uk/conditions/iron-deficiency-anaemia/' },
  acogTeen: { name: 'ACOG – Menstruation in Girls and Adolescents: Using the Menstrual Cycle as a Vital Sign', url: 'https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2015/12/menstruation-in-girls-and-adolescents-using-the-menstrual-cycle-as-a-vital-sign' },
  acogAUB: { name: 'ACOG – Abnormal Uterine Bleeding', url: 'https://www.acog.org/womens-health/faqs/abnormal-uterine-bleeding' },
  acogPain: { name: 'ACOG – Dysmenorrhea: Painful Periods', url: 'https://www.acog.org/womens-health/faqs/dysmenorrhea-painful-periods' },
}

export const REDFLAGS = [
  { id: 'longPeriod', check: 'longPeriod', sources: ['nhsHeavy', 'acogAUB'] },
  { id: 'heavyFlow', check: 'heavyFlow', sources: ['nhsHeavy'] },
  { id: 'cycleRange', check: 'cycleRange', sources: ['nhsIrregular', 'acogTeen'] },
  { id: 'noPeriod', check: 'noPeriod', sources: ['nhsMissed'] },
  { id: 'bleedBetween', check: 'symptomAny', symptoms: ['bleed_between', 'bleed_after_sex'], sources: ['acogAUB', 'nhsPeriods'] },
  { id: 'pain', check: 'pain', sources: ['nhsPain', 'acogPain'] },
  { id: 'anaemia', check: 'anaemia', sources: ['nhsHeavy', 'nhsAnaemia'] },
]

// Signs that logs can't show. Listed on the doctor page for everyone.
export const UNLOGGABLE = ['noPeriodBy15', 'suddenChange', 'afterMenopause']
export const UNLOGGABLE_SOURCES = ['acogTeen', 'nhsIrregular', 'nhsPeriods']

// Where to go. Shown on every card.
export const CARE_OPTIONS = [
  { id: 'phc' },
  { id: 'esanjeevani', url: 'https://esanjeevani.mohfw.gov.in/' },
  { id: 'gynae' },
]
