// Reminders are checked whenever the app is open (on load and every 30 seconds).
// There is no server, so they can't fire while the app is fully closed.
import { addDays } from './date.js'

const nowHM = () => {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function dueReminders(state, analysis, today, t, discreet, force = false) {
  const r = state.reminders
  const fired = r.lastFired || {}
  const hm = nowHM()
  const due = []
  const text = (normal) => (discreet ? t('rem.discreetText') : normal)
  if (r.period.on && analysis?.next && !state.pregnancy.on && today >= addDays(analysis.next.from, -2)) {
    const key = `period:${analysis.next.from}`
    if (!fired[key]) due.push({ key, text: text(t('rem.periodText')) })
  }
  if (r.checkin.on && hm >= r.checkin.time && !state.logs[today]) {
    const key = `checkin:${today}`
    if (!fired[key]) due.push({ key, text: text(t('rem.checkinText')) })
  }
  if (r.meds.on) for (const tm of r.meds.times || []) {
    const key = `meds:${today}:${tm}`
    if (hm >= tm && !fired[key]) due.push({ key, text: text(t('rem.medsText', { name: r.meds.name || '' })) })
  }
  if (r.custom.on && r.custom.label && hm >= r.custom.time) {
    const key = `custom:${today}`
    if (!fired[key]) due.push({ key, text: discreet ? t('rem.discreetText') : r.custom.label })
  }
  if (force) due.push({ key: `test:${Date.now()}`, text: text(t('rem.checkinText')) })
  return due
}

export function notify(text, title) {
  try {
    if ('Notification' in window && Notification.permission === 'granted' && document.visibilityState === 'hidden') {
      new Notification(title, { body: text, tag: 'bestie', silent: false })
      return true
    }
  } catch { /* some browsers only allow notifications from a service worker */ }
  return false
}

export async function askPermission() {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission !== 'default') return Notification.permission
  try { return await Notification.requestPermission() } catch { return 'denied' }
}
