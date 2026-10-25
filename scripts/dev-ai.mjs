// Runs `netlify dev` with the AI chat working, on any machine — including Windows accounts
// whose username has a space in it (e.g. "OMKAR PATIL"), where netlify-cli mis-detects its
// own working directory as the home folder and silently fails to find netlify/functions and
// .env. We work around that by loading .env ourselves and passing an explicit absolute
// --functions path, instead of relying on netlify-cli's own (buggy) auto-detection.
import { readFileSync, existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const envPath = path.join(root, '.env')

if (!existsSync(envPath)) {
  console.error('No .env file found at', envPath)
  console.error('Copy .env.example to .env and fill in AI_PROVIDER / GEMINI_API_KEY first.')
  process.exit(1)
}

for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/)
  if (!m || line.trim().startsWith('#')) continue
  const [, key, rawValue] = m
  const value = rawValue.replace(/^["']|["']$/g, '')
  process.env[key] = value
}

const functionsDir = path.join(root, 'netlify', 'functions')
console.log('Starting netlify dev with functions at', functionsDir)

// A quoted, single command string — not an argv array — because `shell: true` on Windows
// concatenates array elements without escaping, which mangles a path containing a space.
const cmd = `npx netlify dev --functions "${functionsDir}"`
const child = spawn(cmd, {
  cwd: root,
  stdio: 'inherit',
  shell: true,
  env: process.env,
})
child.on('exit', (code) => process.exit(code ?? 0))
