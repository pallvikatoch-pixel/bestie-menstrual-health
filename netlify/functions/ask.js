// Netlify version of the same endpoint (netlify.toml routes /api/ask here).
import { handleAsk } from '../../api/ask.js'
export default async (req) => {
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'POST only' }), { status: 405 })
  try {
    const out = await handleAsk(await req.json(), req.headers.get('x-nf-client-connection-ip') || 'x')
    return new Response(JSON.stringify(out.json), { status: out.status, headers: { 'content-type': 'application/json' } })
  } catch (e) {
    console.error('ask failed:', e.message)
    return new Response(JSON.stringify({ error: 'AI unavailable' }), { status: 502 })
  }
}
