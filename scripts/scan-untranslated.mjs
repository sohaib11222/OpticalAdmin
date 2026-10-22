/**
 * Flags user-visible English left in the live admin sources.
 *
 * Heuristic on purpose: it looks at JSX text nodes and at the props that end up
 * in the DOM, and reports anything that looks like prose rather than a key,
 * class name, path or identifier. Review the hits by hand.
 *
 * Run with: node scripts/scan-untranslated.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('../src/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')

// Directories that are not mounted by the live router (template leftovers).
const DEAD = [/^app[\\/]/, /[\\/]routes[\\/]index\.tsx$/, /[\\/]data[\\/]/]

const LIVE_FILES = [
  'App.tsx',
  'main.tsx',
  'context/constants.ts',
  'context/useAuthContext.tsx',
  'helpers/menu.ts',
  'layouts/AdminLayout.tsx',
  'layouts/AuthLayout.tsx',
  'components/LanguageToggle.tsx',
  'components/PageTitle.tsx',
  'components/Preloader.tsx',
  'components/FallbackLoading.tsx',
  'components/layout/Footer.tsx',
  'components/layout/TopNavigationBar/index.tsx',
  'components/layout/VerticalNavigationBar/index.tsx',
  'components/wrappers/AppProvidersWrapper.tsx',
  'components/form/TextFormInput.tsx',
  'components/form/PasswordFormInput.tsx',
  'routes/router.tsx',
]

for (const dir of ['pages/foundation', 'pages/workspace'])
  for (const f of readdirSync(join(ROOT, dir)))
    LIVE_FILES.push(join(dir, f))

// Props whose value is rendered to the user.
const PROPS = /(?:label|placeholder|title|help|aria-label|alt|helpText|emptyLabel)=(?:"([^"]{2,})"|'([^']{2,})'|\{\s*'([^']{2,})'\s*\}|\{\s*"([^"]{2,})"\s*\})/g
// JSX text between tags.
const TEXT = />([^<>{}\n][^<>{}]*[a-zA-Z][^<>{}]*)</g
// Array literals used as table headers.
const ARRAYS = /(?:headers|labels)\s*=\s*\{\[([^\]]+)\]\}/g

const SKIP = [
  /^[a-z0-9._/#-]+$/i,                    // slug, path, class, key
  /^[A-Z]{2,}$/,                          // acronym
  /^(it|en)$/,
  /%[a-z]/,
  /^\d+$/,
  /https?:\/\//,
  /^[A-Za-z]+(\.[A-Za-z]+)+$/,            // dotted identifier
]

function looksEnglish(text) {
  const value = text.trim()
  if (!value || value.length < 3) return false
  if (SKIP.some((re) => re.test(value))) return false
  if (value.includes('"') || value.includes("'")) return false
  // Needs at least two words, or one word of 4+ letters with a capital start.
  const words = value.split(/\s+/)
  if (words.length < 2 && !/^[A-Z][a-z]{3,}/.test(value)) return false
  return /[A-Za-z]{3,}/.test(value)
}

const hits = []
for (const file of LIVE_FILES) {
  const full = join(ROOT, file)
  if (!statSync(full).isFile()) continue
  if (DEAD.some((re) => re.test(file))) continue
  const source = readFileSync(full, 'utf8')
  const lines = source.split(/\r?\n/)

  const record = (line, kind, text) => {
    if (!looksEnglish(text)) return
    hits.push({ file, line, kind, text: text.trim() })
  }

  lines.forEach((line, i) => {
    for (const m of line.matchAll(PROPS)) record(i + 1, 'prop', m[1] ?? m[2] ?? m[3] ?? m[4])
    for (const m of line.matchAll(ARRAYS))
      for (const part of m[1].matchAll(/'([^']+)'|"([^"]+)"/g))
        record(i + 1, 'array', part[1] ?? part[2])
    const text = line.replace(/^\s*</, '').trim()
    for (const m of text.matchAll(TEXT)) record(i + 1, 'text', m[1])
  })
}

const groups = new Map()
for (const h of hits) {
  if (!groups.has(h.file)) groups.set(h.file, [])
  groups.get(h.file).push(h)
}

if (!groups.size) {
  console.log('OK: no untranslated UI strings detected in the live sources')
} else {
  for (const [file, list] of groups) {
    console.log(`\n${file}`)
    for (const h of list) console.log(`  ${String(h.line).padStart(4)}  [${h.kind}] ${h.text}`)
  }
  console.log(`\n${hits.length} hit(s) across ${groups.size} file(s) - review each one`)
}
