// Bestie AI chat endpoint (Vercel serverless function at /api/ask).
// Keeps nothing: no logs of messages, no database. The API key comes from an environment variable.
import { systemPrompt } from './systemPrompt.js'
import { safetyFlags } from './safetyWords.js'

const MAX_CHARS = 500
const HELP = {
  en: { urgent: 'If this is happening now: please get medical help straight away. Call 108 or 112.', selfHarm: 'You don’t have to go through this alone. Tele-MANAS is free and open day and night: 14416.' },
  hi: { urgent: 'अगर अभी ऐसा हो रहा है, तो कृपया तुरंत डॉक्टरी मदद लो. 108 या 112 पर कॉल करो.', selfHarm: 'तुम्हें यह अकेले नहीं सहना है. टेली-मानस मुफ़्त है और दिन-रात खुला है: 14416.' },
}

// Tiny in-memory rate limit per visitor (resets when the function instance restarts; nothing is stored).
const hits = new Map()
function limited(ip) {
  const now = Date.now()
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60000)
  arr.push(now)
  hits.set(ip, arr)
  return arr.length > 10
}

async function callModel(system, messages) {
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase()
  if (provider === 'anthropic') {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5', max_tokens: 500, system, messages: messages.map((m) => ({ role: m.role, content: m.text })) }),
    })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error?.message || r.status)
    return d.content.map((c) => c.text || '').join('')
  }
  if (provider === 'openai') {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', max_tokens: 500, messages: [{ role: 'system', content: system }, ...messages.map((m) => ({ role: m.role, content: m.text }))] }),
    })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error?.message || r.status)
    return d.choices[0].message.content
  }
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.text }] })),
      generationConfig: { maxOutputTokens: 500, temperature: 0.4 },
    }),
  })
  const d = await r.json()
  if (!r.ok) throw new Error(d.error?.message || r.status)
  return d.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || ''
}

export async function handleAsk(body, ip = 'x') {
  const question = String(body?.question || '').slice(0, MAX_CHARS + 1)
  if (!question.trim() || question.length > MAX_CHARS) return { status: 400, json: { error: 'question missing or too long' } }
  if (limited(ip)) return { status: 429, json: { error: 'too many requests' } }
  const lang = body.lang === 'hi' ? 'hi' : 'en'
  const ageGroup = ['under18', 'adult'].includes(body.ageGroup) ? body.ageGroup : 'unknown'
  const history = Array.isArray(body.history) ? body.history.slice(-6).map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', text: String(m.text || '').slice(0, 1200) })) : []
  // The last history item is the current question (the app pushes it first); avoid sending it twice.
  if (history.length && history[history.length - 1].role === 'user' && history[history.length - 1].text === question) history.pop()
  const lessons = Array.isArray(body.lessons) ? body.lessons.slice(0, 3) : []
  const s = body.summary && typeof body.summary === 'object' ? {
    averageCycleDays: Number(body.summary.averageCycleDays) || null,
    regular: typeof body.summary.regular === 'boolean' ? body.summary.regular : null,
    lastPeriodStart: /^\d{4}-\d{2}-\d{2}$/.test(body.summary.lastPeriodStart) ? body.summary.lastPeriodStart : null,
    lastCycleSymptoms: Array.isArray(body.summary.lastCycleSymptoms) ? body.summary.lastCycleSymptoms.slice(0, 20).map(String) : [],
  } : null

  const raw = await callModel(systemPrompt({ lang, ageGroup, lessons, summary: s }), [...history, { role: 'user', text: question }])
  let lesson = null
  let answer = raw.replace(/LESSON:\s*([a-z-]+|none)\s*$/i, (_, id) => { lesson = id === 'none' ? null : id; return '' }).trim()

  // Safety net: whatever the model said, urgent and self-harm messages always get the right help line.
  const flags = safetyFlags(question)
  if (flags.urgent && !/108|112/.test(answer)) answer += `\n\n${HELP[lang].urgent}`
  if (flags.selfHarm && !/14416/.test(answer)) answer += `\n\n${HELP[lang].selfHarm}`
  return { status: 200, json: { answer, lesson, flags } }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  try {
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || 'x'
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const out = await handleAsk(body, ip)
    res.status(out.status).json(out.json)
  } catch (e) {
    console.error('ask failed:', e.message) // no message content is logged
    res.status(502).json({ error: 'AI unavailable' })
  }
}
