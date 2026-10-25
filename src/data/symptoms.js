// Symptom list. Each icon is drawn as stroke paths on a 24×24 grid (rendered by components/Icon.jsx).
// Labels live in src/i18n (key: sym.<id>).
export const SYMPTOMS = [
  { id: 'cramps', paths: ['M12 4c-4 0-7 3-7 7 0 5 7 9 7 9s7-4 7-9c0-4-3-7-7-7z', 'M9 10l2 2-2 2', 'M15 10l-2 2 2 2'] },
  { id: 'headache', paths: ['M12 3a7 7 0 0 0-7 7c0 3 2 5 2 7v2h10v-2c0-2 2-4 2-7a7 7 0 0 0-7-7z', 'M9 8l2 2', 'M13 7l1 3', 'M16 9l-1 2'] },
  { id: 'acne', paths: ['M12 3a8 8 0 1 0 0 18 8 8 0 0 0 0-18z', 'M9 9.5h.01', 'M15 9.5h.01', 'M14 15h.01', 'M9 14.5h.01', 'M12 12h.01'] },
  { id: 'bloating', paths: ['M6 8c0-2 2-3 3-3h6c1 0 3 1 3 3v6c0 3-3 5-6 5s-6-2-6-5z', 'M3 11h2', 'M19 11h2'] },
  { id: 'tiredness', paths: ['M4 14a8 8 0 0 0 15 3A8 8 0 0 1 9 5a8 8 0 0 0-5 9z', 'M15 4h4l-4 4h4'] },
  { id: 'mood_changes', paths: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M8 15c1-1 2-1.5 4-1.5s3 .5 4 1.5', 'M9 9.5h.01', 'M15 9.5h.01'] },
  { id: 'trouble_sleeping', paths: ['M4 18h16', 'M5 18v-5h14v5', 'M7 13v-2a2 2 0 0 1 2-2h2', 'M15 4l2 2m0-2l-2 2'] },
  { id: 'back_pain', paths: ['M12 3v18', 'M9 6h6', 'M8 10h8', 'M9 14h6', 'M10 18h4'] },
  { id: 'tender_breasts', paths: ['M4 12c0-3 2-5 4-5s4 2 4 5-2 5-4 5-4-2-4-5z', 'M12 12c0-3 2-5 4-5s4 2 4 5-2 5-4 5-4-2-4-5z'] },
  { id: 'nausea', paths: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M8 16c1.5-1.5 2.5 1.5 4 0s2.5 1.5 4 0', 'M8 10l2 1-2 1', 'M16 10l-2 1 2 1'] },
  { id: 'cravings', paths: ['M6 10h12l-1.5 9h-9z', 'M8 10a4 4 0 0 1 8 0', 'M12 6V3'] },
  { id: 'discharge_change', paths: ['M12 4c3 4 5 7 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10z', 'M10 15a2 2 0 0 0 2 2'] },
  // These four are always offered in the "Something worrying?" part of Log, whatever the user tracks.
  { id: 'dizzy', safety: true, paths: ['M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0', 'M12 6a6 6 0 1 1-6 6', 'M12 3a9 9 0 1 0 9 9'] },
  { id: 'breathless', safety: true, paths: ['M3 9h10a3 3 0 1 0-3-3', 'M3 13h15a3 3 0 1 1-3 3', 'M3 17h6'] },
  { id: 'bleed_between', safety: true, paths: ['M12 4c3 4 5 7 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10z', 'M4 20h16'] },
  { id: 'bleed_after_sex', safety: true, paths: ['M9 5c2 3 3 5 3 7a3 3 0 0 1-6 0c0-2 1-4 3-7z', 'M17 9c1.5 2 2 3 2 4.5a2 2 0 0 1-4 0c0-1.5.5-2.5 2-4.5z'] },
  { id: 'severe_sudden_pain', safety: true, urgent: true, paths: ['M13 2L4 14h7l-1 8 9-12h-7z'] },
]

export const DEFAULT_TRACKED = [
  'cramps', 'headache', 'acne', 'bloating', 'tiredness', 'mood_changes', 'trouble_sleeping', 'back_pain', 'tender_breasts',
]
export const SAFETY_SYMPTOMS = SYMPTOMS.filter((s) => s.safety).map((s) => s.id)
export const symptomById = Object.fromEntries(SYMPTOMS.map((s) => [s.id, s]))
