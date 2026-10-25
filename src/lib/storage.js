// Everything is stored on this device, in IndexedDB. Nothing is sent anywhere.
// Two records:
//   "pub"   – non-health display settings needed before unlocking: { discreet, lang, textSize, contrast, locked }
//   "state" – all health data, either as plain JSON or, with the PIN lock on, as AES-GCM ciphertext.
const DB = 'bestie-db'
const STORE = 'kv'
const ITERATIONS = 600000

function open() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}
async function tx(mode, fn) {
  const db = await open()
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode)
    const store = t.objectStore(STORE)
    const req = fn(store)
    t.oncomplete = () => { db.close(); resolve(req?.result) }
    t.onerror = () => { db.close(); reject(t.error) }
    t.onabort = () => { db.close(); reject(t.error) }
  })
}
export const idbGet = (key) => tx('readonly', (s) => s.get(key))
export const idbSet = (key, val) => tx('readwrite', (s) => s.put(val, key))

// ---------- Encryption (Web Crypto) ----------
const enc = new TextEncoder()
const dec = new TextDecoder()
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)))
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))

export async function deriveKey(pin, saltB64, iterations = ITERATIONS) {
  const base = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: unb64(saltB64), iterations, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'],
  )
}
export function newSalt() { return b64(crypto.getRandomValues(new Uint8Array(16))) }

async function encrypt(key, obj, salt) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(obj)))
  return { v: 1, enc: true, salt, iterations: ITERATIONS, iv: b64(iv), data: b64(ct) }
}
async function decrypt(key, rec) {
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(rec.iv) }, key, unb64(rec.data))
  return JSON.parse(dec.decode(pt))
}

// ---------- Public API ----------
let sessionKey = null // kept only in memory while unlocked
let sessionSalt = null

export async function loadPub() { return (await idbGet('pub')) || null }
export async function savePub(pub) { await idbSet('pub', pub) }

export async function loadState() {
  const rec = await idbGet('state')
  if (!rec) return { status: 'empty' }
  if (rec.enc) return { status: 'locked', record: rec }
  return { status: 'ok', state: rec.plain }
}

export async function unlock(pin) {
  const rec = await idbGet('state')
  const key = await deriveKey(pin, rec.salt, rec.iterations)
  try {
    const state = await decrypt(key, rec)
    sessionKey = key
    sessionSalt = rec.salt
    return state
  } catch {
    return null // wrong PIN: never wipe anything
  }
}

export async function saveState(state) {
  if (sessionKey) await idbSet('state', await encrypt(sessionKey, state, sessionSalt))
  else await idbSet('state', { v: 1, enc: false, plain: state })
}

export async function enableLock(pin, state) {
  const salt = newSalt()
  sessionKey = await deriveKey(pin, salt)
  sessionSalt = salt
  await saveState(state) // overwrites the plain copy: data is never stored twice
}
export async function disableLock(state) {
  sessionKey = null
  sessionSalt = null
  await saveState(state)
}
export function lockNow() { sessionKey = null; sessionSalt = null }
export const isLockedSession = () => !!sessionKey

export async function deleteEverything() {
  sessionKey = null
  sessionSalt = null
  await new Promise((resolve) => {
    const req = indexedDB.deleteDatabase(DB)
    req.onsuccess = req.onerror = req.onblocked = () => resolve()
  })
  try { localStorage.clear() } catch { /* not available */ }
  try { sessionStorage.clear() } catch { /* not available */ }
  try {
    if (window.caches) for (const k of await caches.keys()) await caches.delete(k)
  } catch { /* not available */ }
}
