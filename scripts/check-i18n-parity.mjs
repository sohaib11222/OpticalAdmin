/**
 * Verifies that every locale module declares the same keys in `en` and `it`,
 * and reports keys declared by more than one module (the merge order would
 * otherwise silently decide the winner).
 *
 * Run with: node scripts/check-i18n-parity.mjs
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const LOCALES_DIR = new URL('../src/i18n/locales/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')

function block(source, name) {
  const start = source.indexOf(`const ${name}`)
  if (start === -1) throw new Error(`missing block: ${name}`)
  const open = source.indexOf('{', start)
  let depth = 0
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++
    else if (source[i] === '}' && --depth === 0) return source.slice(open + 1, i)
  }
  throw new Error(`unterminated block: ${name}`)
}

function keys(blockSource) {
  return [...blockSource.matchAll(/(^|[\s{,])(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|'([A-Za-z0-9_.]+)')\s*:/g)].map((m) => m[2] ?? m[3] ?? m[4])
}

const files = readdirSync(LOCALES_DIR).filter((f) => f.endsWith('.ts'))
const seen = new Map()
let totalEn = 0
let totalIt = 0
let problems = 0

for (const file of files) {
  const source = readFileSync(join(LOCALES_DIR, file), 'utf8')
  const en = keys(block(source, 'en'))
  const it = keys(block(source, 'it'))
  totalEn += en.length
  totalIt += it.length

  const onlyEn = en.filter((k) => !it.includes(k))
  const onlyIt = it.filter((k) => !en.includes(k))
  if (onlyEn.length || onlyIt.length) {
    problems++
    console.log(`\n${file}: MISMATCH (en ${en.length} / it ${it.length})`)
    onlyEn.forEach((k) => console.log(`  missing from it: ${k}`))
    onlyIt.forEach((k) => console.log(`  missing from en: ${k}`))
  }
  for (const key of en) {
    if (seen.has(key)) {
      problems++
      console.log(`\nDUPLICATE key "${key}" in ${file} and ${seen.get(key)}`)
    } else seen.set(key, file)
  }
}

console.log(`\nfiles: ${files.length}`)
console.log(`keys:  en ${totalEn} / it ${totalIt} / unique ${seen.size}`)
console.log(problems ? `\nFAILED with ${problems} problem(s)` : '\nOK: parity clean, no duplicates')
process.exit(problems ? 1 : 0)
