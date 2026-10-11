#!/usr/bin/env node
/**
 * Builds one .hibiki.zip per scene definition in scenes/.
 *
 * Audio is downloaded into dl/ (cached between runs), trimmed where a clip
 * is meant as a one-shot effect, and bundled under sounds/<category>/ next to
 * the hibiki-scene.json manifest and a CREDITS.txt. CREDITS.md at the repo
 * root is regenerated from the same data.
 *
 * Requires: node 20+, curl, ffmpeg.
 * Usage:    npm install && npm run build
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import AdmZip from 'adm-zip'

const ROOT = resolve(import.meta.dirname, '..')
const SCENES_DIR = join(ROOT, 'scenes')
const DL = join(ROOT, 'dl')
const OUT = join(ROOT, 'out')
const UA = 'hibiki-scene-packs builder (https://github.com/PhyberApex/hibiki-scene-packs)'

const OGA = 'https://opengameart.org/sites/default/files/'
const DIRECT_DOWNLOADS = {
  'https://opengameart.org/content/medieval-exploration': `${OGA}Exploration_0.mp3`,
  'https://opengameart.org/content/dungeon-ambience': `${OGA}dungeon002_0.ogg`,
  'https://opengameart.org/content/loopable-dungeon-ambience': `${OGA}dungeon_ambient_1_0.ogg`,
  'https://opengameart.org/content/medieval-battle': `${OGA}battle_8.mp3`,
  'https://opengameart.org/content/medieval-kings-feast': `${OGA}Kings_Feast_0.mp3`,
  'https://opengameart.org/content/eternal-sleep': `${OGA}10_eternal_sleep.ogg`,
  'https://opengameart.org/content/dark-cavern-ambient': `${OGA}dark_cavern_ambient_002.ogg`,
  'https://opengameart.org/content/merchants-and-sea-salt': `${OGA}audio_preview/merchants_and_sea_salt.wav.ogg`,
  'https://opengameart.org/content/pirates-libertaires': `${OGA}Komiku_-_12_-_Pirates_libertaires_0.mp3`,
  'https://opengameart.org/content/medieval-market-day': `${OGA}Loop_Market_Day_0.mp3`,
}

/** Seconds to keep for long recordings that are used as one-shot effects. */
const TRIM_SECONDS = {
  'sword-clash': 4,
  'thunder-strike': 12,
  'coins': 4,
  'town-bell': 10,
  'funeral-bell': 12,
}

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const authorOf = source => source.name.split(' by ').pop().replace(/\(.*$/, '').trim()

function fetchText(url) {
  return execFileSync('curl', ['-sL', '-A', UA, url], { maxBuffer: 50e6 }).toString()
}

function fetchFile(url, dest) {
  if (!existsSync(dest))
    execFileSync('curl', ['-sL', '-A', UA, '-o', dest, url])
}

/** Freesound originals need a login; the HQ MP3 preview (128 kbps) is public and plenty for Discord voice. */
function resolveDownloadUrl(sourceUrl) {
  if (DIRECT_DOWNLOADS[sourceUrl])
    return DIRECT_DOWNLOADS[sourceUrl]
  if (sourceUrl.includes('freesound.org')) {
    const match = fetchText(sourceUrl).match(/https:\/\/cdn\.freesound\.org\/previews\/[^"']*-hq\.mp3/)
    if (!match)
      throw new Error(`No public preview found for ${sourceUrl}`)
    return match[0]
  }
  throw new Error(`No download rule for ${sourceUrl}`)
}

function trimToOneShot(input, output, seconds) {
  if (existsSync(output))
    return
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', input, '-t', String(seconds), '-af', `afade=t=out:st=${seconds - 1}:d=1`, '-codec:a', 'libmp3lame', '-q:a', '2', output])
}

const audioCache = new Map()
function resolveAudio(track) {
  const filename = `${slug(track.soundName)}-${slug(authorOf(track.source))}`
  if (audioCache.has(filename))
    return audioCache.get(filename)
  const url = resolveDownloadUrl(track.source.url)
  const raw = join(DL, `${filename}${extname(new URL(url).pathname) || '.mp3'}`)
  console.log(`  ↓ ${filename}  <-  ${url}`)
  fetchFile(url, raw)
  const trim = TRIM_SECONDS[slug(track.soundName)]
  const final = trim ? join(DL, `${filename}-trim.mp3`) : raw
  if (trim)
    trimToOneShot(raw, final, trim)
  const result = { path: final, filename: `${filename}${extname(final)}` }
  audioCache.set(filename, result)
  return result
}

function toPackageItem(track, category, zip, credits) {
  const audio = resolveAudio(track)
  zip.addLocalFile(audio.path, `sounds/${category}`, audio.filename)
  credits.push(`${track.soundName}: ${track.source.name}\n  ${track.source.url}\n  ${track.source.note}\n`)
  const item = { soundName: track.soundName, volume: track.volume, bundled: true, bundledPath: `sounds/${category}/${audio.filename}` }
  if (track.enabled !== undefined)
    item.enabled = track.enabled
  if (track.loop !== undefined)
    item.loop = track.loop
  item.source = track.source
  return item
}

function buildPack(entry) {
  console.log(`\n== ${entry.name}`)
  const zip = new AdmZip()
  const credits = [`${entry.name} — Hibiki scene pack`, '', 'All audio is CC0 unless stated otherwise below.', '']
  const manifest = {
    formatVersion: 1,
    name: entry.slug,
    displayName: entry.name,
    description: entry.description,
    author: entry.author,
    version: entry.version,
    tags: entry.tags,
    category: entry.category,
    license: entry.license,
    homepage: 'https://github.com/PhyberApex/hibiki-scene-packs',
    scene: {
      music: entry.scene.music.map(t => toPackageItem(t, 'music', zip, credits)),
      ambience: entry.scene.ambience.map(t => toPackageItem(t, 'ambience', zip, credits)),
      effects: entry.scene.effects.map(t => toPackageItem(t, 'effects', zip, credits)),
    },
  }
  zip.addFile('hibiki-scene.json', Buffer.from(JSON.stringify(manifest, null, 2)))
  zip.addFile('CREDITS.txt', Buffer.from(credits.join('\n')))
  const target = join(OUT, `${entry.slug}.hibiki.zip`)
  zip.writeZip(target)
  console.log(`  → ${target}`)
}

function writeCreditsMarkdown(entries) {
  const lines = ['# Credits', '', 'Every track bundled in the packs, with its source and license. All audio is CC0 unless noted otherwise.', '']
  for (const entry of entries) {
    lines.push(`## ${entry.name}`, '', '| Track | Source | License and notes |', '|---|---|---|')
    for (const category of ['music', 'ambience', 'effects']) {
      for (const t of entry.scene[category]) {
        const license = t.source.note.match(/^[^.:]*(?:\.\d+)?/)[0]
        lines.push(`| ${t.soundName} | [${t.source.name}](${t.source.url}) | ${license} |`)
      }
    }
    lines.push('')
  }
  writeFileSync(join(ROOT, 'CREDITS.md'), `${lines.join('\n')}\n`)
}

mkdirSync(DL, { recursive: true })
mkdirSync(OUT, { recursive: true })
const entries = readdirSync(SCENES_DIR)
  .filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(readFileSync(join(SCENES_DIR, f), 'utf-8')))
  .sort((a, b) => a.name.localeCompare(b.name))
for (const entry of entries)
  buildPack(entry)
writeCreditsMarkdown(entries)
console.log(`\nBuilt ${entries.length} pack(s).`)
