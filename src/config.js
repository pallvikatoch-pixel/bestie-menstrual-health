// Every number the health rules use lives here, so it can be checked and changed in one place.
export const CONFIG = {
  // Predictions (src/lib/cycle.js)
  cyclesUsed: 6,                 // use the last 6 complete cycles
  minCyclesForPrediction: 3,     // fewer than 3 complete cycles (4 logged period starts) → no prediction
  minRangeDays: 2,               // estimate range is at least ±2 days
  irregularVariationDays: 7,     // FIGO 2018: normal variation is ≤7–9 days depending on age; we use the stricter 7
  irregularPaddingDays: 2,       // extra days added on each side of the range for irregular cycles
  lutealDays: 14,                // ovulation ≈ 14 days before the next period (NHS)
  fertileDaysBefore: 5,          // fertile window = 5 days before ovulation + ovulation day (NHS)
  longGapFactor: 1.6,            // a gap ≥ 1.6 × usual length …
  longGapMinDays: 50,            // … and ≥ 50 days → ask "Did you forget to log a period?"
  minPeriodGapDays: 2,           // period days separated by ≤ 2 empty days are treated as the same period

  // When to see a doctor (src/data/redflags.js)
  maxPeriodDays: 7,              // NHS heavy periods / ACOG
  adultCycleMin: 21,             // NHS: cycles usually 21–35 days in adults (ACOG)
  adultCycleMax: 35,
  teenCycleMin: 21,              // ACOG Committee Opinion 651: 21–45 days in adolescents
  teenCycleMax: 45,
  outOfRangeInARow: 3,           // three cycles in a row
  noPeriodDays: 90,              // no period for 90 days (when not pregnant)
  painStopsCycles: 2,            // pain that stops daily life in 2+ different periods
  painkillerNoHelpDays: 1,       // pain not helped by painkillers, even once
  anaemiaWindowDays: 3,          // tiredness / breathlessness / dizziness within 3 days of a heavy period

  // Mood (Tele-MANAS)
  veryLowMoodDaysInARow: 3,

  // Insights
  patternMinCycles: 3,           // show a pattern only after it appears in 3 cycles
  preDays: 5,                    // "in the 5 days before your period"

  // Pregnancy (NHS: due date ≈ 280 days from the first day of the last period)
  pregnancyDays: 280,
  movementWeek: 28,

  // Onboarding reminder
  setupReminderDays: 7,

  // AI chat
  aiMaxChars: 500,
  aiHistoryMessages: 6,
}
