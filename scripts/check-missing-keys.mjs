/**
 * Reports `t('...')` / `tOr('...')` calls in the live sources whose key is not
 * in the dictionary, plus string literals that look like they were meant to be
 * keys (a `fields.x`, `status.x` or `module.x` value that was never declared).
 *
 * A missing key does not crash: `t` falls back to English and then to the key
 * itself, which is exactly why this has to be a hard check.
 *
 * Run with: node scripts/check-missing-keys.mjs
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const SRC = new URL('../src/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const LOCALES = join(SRC, 'i18n/locales')

function block(source, name) {
  const start = source.indexOf(`const ${name}`)
  const open = source.indexOf('{', start)
  let depth = 0
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++
    else if (source[i] === '}' && --depth === 0) return source.slice(open + 1, i)
  }
  throw new Error(`unterminated block: ${name}`)
}

const keys = new Set()
for (const file of readdirSync(LOCALES).filter((f) => f.endsWith('.ts')))
  for (const m of block(readFileSync(join(LOCALES, file), 'utf8'), 'en').matchAll(/(^|[\s{,])"([^"]+)"\s*:/g))
    keys.add(m[2])
// Keys resolved outside the locale files.
const server = readFileSync(join(SRC, 'i18n/server-messages.ts'), 'utf8')
for (const m of server.matchAll(/^\s+"([a-z][A-Za-z0-9_.]*)":\s*\{/gm)) keys.add(m[1])

const files = []
for (const dir of ['pages/foundation', 'pages/workspace'])
  for (const f of readdirSync(join(SRC, dir))) files.push(join(dir, f))
files.push(
  'layouts/AuthLayout.tsx',
  'components/LanguageToggle.tsx',
  'components/layout/Footer.tsx',
  'components/layout/TopNavigationBar/index.tsx',
  'components/layout/VerticalNavigationBar/index.tsx',
  'components/form/PasswordFormInput.tsx',
  'routes/router.tsx',
)

const CALL = /\b(?:t|tOr)\(\s*'([a-z][A-Za-z0-9_]*(?:\.[A-Za-z0-9_*]+)+)'/g
// Literal values handed to props that expect a key.
const KEY_PROP = /(?:title|label|help)\s*=\s*"([a-z][A-Za-z0-9_]*(?:\.[A-Za-z0-9_*]+)+)"/g
const FIELD_LABEL = /\blabel:\s*'([a-z][A-Za-z0-9_]*(?:\.[A-Za-z0-9_*]+)+)'/g

let problems = 0
for (const file of files) {
  const lines = readFileSync(join(SRC, file), 'utf8').split(/\r?\n/)
  lines.forEach((line, i) => {
    for (const re of [CALL, KEY_PROP, FIELD_LABEL])
      for (const m of line.matchAll(re)) {
        // A wildcard prefix is resolved per value at runtime, so only the
        // namespace has to exist.
        const key = m[1].endsWith('.*') ? m[1].slice(0, -1) : m[1]
        if (key.startsWith('menu.') || key.startsWith('module.')) continue
        if (keys.has(key)) continue
        problems++
        console.log(`${file}:${i + 1}  missing key  ${m[1]}`)
      }
  })
}

console.log(problems ? `\nFAILED: ${problems} missing key(s)` : `\nOK: every literal key resolves (${keys.size} keys known)`)
process.exit(problems ? 1 : 0)
