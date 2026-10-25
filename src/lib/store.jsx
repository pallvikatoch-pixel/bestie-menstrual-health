import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import * as storage from './storage.js'
import { makeT } from './i18n.js'
import { setDevOffset, todayISO, addDays } from './date.js'
import { DEFAULT_TRACKED } from '../data/symptoms.js'
import { buildDemoState } from '../data/demo.js'
import { analyze } from './cycle.js'
import { evaluateRedflags } from './redflags.js'

export const ONBOARDING_QS = ['lang', 'nickname', 'ageGroup', 'lastPeriod', 'cycleLength', 'symptoms', 'reminders']

export function defaultPub() {
  return { discreet: false, lang: 'en', textSize: 0, contrast: false, locked: false, theme: 'light' }
}
export function defaultState() {
  return {
    version: 1,
    demo: false,
    settings: {
      nickname: '', ageGroup: null, fertilityOn: false, tracked: [...DEFAULT_TRACKED], readAloud: true,
      aiEnabled: false, aiUseSummary: false, aiAsked: false, devOffset: 0, fbNoteSeen: false, usualCycle: null,
    },
    onboarding: { done: false, answered: {}, skipped: {}, nextReminder: null, remindOff: false },
    logs: {},
    confirmedGaps: [],
    dismissed: {},
    reminders: {
      period: { on: false }, checkin: { on: false, time: '20:00' },
      meds: { on: false, name: '', times: ['09:00'] }, custom: { on: false, label: '', time: '18:00' },
      lastFired: {},
    },
    bloom: { seed: Math.floor(Math.random() * 1e9), seen: {}, saved: [], quiz: {} },
    chat: [],
    pregnancy: { on: false, lmp: null },
    lastOpen: null,
  }
}

const Ctx = createContext(null)

export function AppProvider({ children }) {
  const [status, setStatus] = useState('loading') // loading | locked | welcome | ready
  const [pub, setPub] = useState(defaultPub())
  const [state, setState] = useState(null)
  const [toast, setToast] = useState(null)
  const stateRef = useRef(null)
  const prevOpen = useRef(undefined) // last time the app was opened, captured before we update it
  const saveChain = useRef(Promise.resolve())

  useEffect(() => {
    ;(async () => {
      try {
        const p = { ...defaultPub(), ...((await storage.loadPub()) || {}) }
        setPub(p)
        const r = await storage.loadState()
        if (r.status === 'locked') setStatus('locked')
        else if (r.status === 'ok') { adopt(migrate(r.state)); setStatus('ready') }
        else setStatus('welcome')
      } catch (e) {
        console.error(e)
        setStatus('welcome')
      }
    })()
  }, [])

  function migrate(s) {
    const d = defaultState()
    return {
      ...d, ...s,
      settings: { ...d.settings, ...(s.settings || {}) },
      onboarding: { ...d.onboarding, ...(s.onboarding || {}) },
      reminders: { ...d.reminders, ...(s.reminders || {}) },
      bloom: { ...d.bloom, ...(s.bloom || {}) },
      pregnancy: { ...d.pregnancy, ...(s.pregnancy || {}) },
    }
  }
  function adopt(s) {
    if (prevOpen.current === undefined) prevOpen.current = s.lastOpen || null
    setDevOffset(s.settings.devOffset)
    stateRef.current = s
    setState(s)
  }

  // Every write is queued and awaited, and goes to the same store the app reads from.
  const persist = useCallback((s) => {
    saveChain.current = saveChain.current.then(() => storage.saveState(s)).catch((e) => console.error('save failed', e))
    return saveChain.current
  }, [])

  const update = useCallback((fn) => {
    const prev = stateRef.current
    const next = typeof fn === 'function' ? fn(prev) : { ...prev, ...fn }
    setDevOffset(next.settings.devOffset)
    stateRef.current = next
    setState(next)
    return persist(next)
  }, [persist])

  const updatePub = useCallback(async (patch) => {
    setPub((p) => {
      const n = { ...p, ...patch }
      storage.savePub(n).catch((e) => console.error(e))
      return n
    })
  }, [])

  const actions = useMemo(() => ({
    async startFresh() {
      const s = defaultState()
      s.lastOpen = todayISO()
      adopt(s)
      await persist(s)
      setStatus('ready')
    },
    async startDemo() {
      const s = buildDemoState(todayISO(), defaultState())
      s.lastOpen = todayISO()
      adopt(s)
      await persist(s)
      setStatus('ready')
    },
    async removeDemo() {
      const s = defaultState()
      s.onboarding.done = true
      s.lastOpen = todayISO()
      adopt(s)
      await persist(s)
    },
    async unlock(pin) {
      const s = await storage.unlock(pin)
      if (!s) return false
      adopt(migrate(s))
      setStatus('ready')
      return true
    },
    async enableLock(pin) {
      await saveChain.current
      await storage.enableLock(pin, stateRef.current)
      await updatePub({ locked: true })
    },
    async disableLock() {
      await saveChain.current
      await storage.disableLock(stateRef.current)
      await updatePub({ locked: false })
    },
    lockNow() {
      storage.lockNow()
      stateRef.current = null
      setState(null)
      setStatus('locked')
    },
    async deleteEverything() {
      await saveChain.current
      await storage.deleteEverything()
      stateRef.current = null
      setState(null)
      setPub(defaultPub())
      setDevOffset(0)
      setStatus('welcome')
    },
    async importState(obj) {
      const s = migrate(obj)
      adopt(s)
      await persist(s)
      setStatus('ready')
    },
  }), [persist, updatePub])

  const showToast = useCallback((msg, opts = {}) => {
    setToast({ msg, id: Date.now(), ...opts })
  }, [])

  const tt = makeT(pub.lang)
  const today = state ? todayISO() : null
  const analysis = useMemo(
    () => (state ? analyze(state.logs, { today, confirmedGaps: state.confirmedGaps }) : null),
    [state, today],
  )
  const ageGroup = state?.settings.ageGroup
  const fertilityVisible = !!state && (ageGroup === 'adult' || state.settings.fertilityOn)
  const redflags = useMemo(() => {
    if (!state) return []
    return evaluateRedflags(state.logs, {
      today, ageGroup, pregnancy: state.pregnancy.on, confirmedGaps: state.confirmedGaps, analysis,
    })
  }, [state, today, ageGroup, analysis])

  const value = {
    status, pub, state, update, updatePub, actions, today, analysis, redflags, fertilityVisible,
    toast, showToast, clearToast: () => setToast(null), ...tt,
    discreet: pub.discreet,
    prevOpen: prevOpen.current,
    appName: pub.discreet ? tt.t('app.discreetName') : tt.t('app.name'),
    addDays,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useApp = () => useContext(Ctx)
