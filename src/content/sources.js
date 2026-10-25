// Every health fact in src/content points to one of these. Check them before a demo: links can move.
import { SOURCES as RF } from '../data/redflags.js'

export const SOURCES = {
  ...RF,
  nhsFertility: { name: 'NHS – Fertility in the menstrual cycle', url: 'https://www.nhs.uk/conditions/periods/fertility-in-the-menstrual-cycle/' },
  nhsStarting: { name: 'NHS – Starting periods', url: 'https://www.nhs.uk/conditions/periods/starting-periods/' },
  nhsPMS: { name: 'NHS – PMS (premenstrual syndrome)', url: 'https://www.nhs.uk/conditions/pre-menstrual-syndrome/' },
  nhsPCOS: { name: 'NHS – Polycystic ovary syndrome', url: 'https://www.nhs.uk/conditions/polycystic-ovary-syndrome-pcos/' },
  nhsPregnancy: { name: 'NHS – Pregnancy', url: 'https://www.nhs.uk/pregnancy/' },
  acogPCOS: { name: 'ACOG – Polycystic Ovary Syndrome (PCOS)', url: 'https://www.acog.org/womens-health/faqs/polycystic-ovary-syndrome-pcos' },
  acogFirst: { name: 'ACOG – Your First Period', url: 'https://www.acog.org/womens-health/faqs/your-first-period' },
  whoPCOS: { name: 'WHO – Polycystic ovary syndrome (fact sheet)', url: 'https://www.who.int/news-room/fact-sheets/detail/polycystic-ovary-syndrome' },
  whoActivity: { name: 'WHO – Physical activity (fact sheet)', url: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity' },
  whoDiet: { name: 'WHO – Healthy diet (fact sheet)', url: 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet' },
  mohfwNHM: { name: 'Ministry of Health and Family Welfare – National Health Mission (Menstrual Hygiene Scheme, JSSK)', url: 'https://nhm.gov.in/' },
  teleManas: { name: 'Tele-MANAS, Ministry of Health and Family Welfare', url: 'https://telemanas.mohfw.gov.in/' },
  eSanjeevani: { name: 'eSanjeevani, Ministry of Health and Family Welfare', url: 'https://esanjeevani.mohfw.gov.in/' },
  fogsi: { name: 'FOGSI – Federation of Obstetric and Gynaecological Societies of India', url: 'https://www.fogsi.org/' },
}
