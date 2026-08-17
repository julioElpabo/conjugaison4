import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const timelineApi = await readFile(new URL('../server/utils/google-analytics.ts', import.meta.url), 'utf8')
const endpoint = await readFile(new URL('../server/api/admin/analytics-geo-timeline.get.ts', import.meta.url), 'utf8')
const component = await readFile(new URL('../app/components/admin/AdminGeoAnimationExport.vue', import.meta.url), 'utf8')
const charts = await readFile(new URL('../app/pages/admin/charts.vue', import.meta.url), 'utf8')

test('prépare une chronologie GA4 des débuts de session par minute et par ville', () => {
  assert.match(timelineApi, /dateHourMinute.*cityId.*city.*region.*countryId.*country/su)
  assert.match(timelineApi, /fieldName:\s*'eventName'.*value:\s*'session_start'/su)
  assert.match(timelineApi, /limit:\s*250_000/u)
  assert.match(endpoint, /requireAdministrator\(event\)/u)
  assert.match(endpoint, /date > today/u)
})

test('anime les trois cartes et produit un MP4 H.264 téléchargeable', () => {
  assert.match(component, /'Monde'.*'Europe centrale'.*'Suisse'/su)
  assert.match(component, /VideoEncoder\.isConfigSupported/u)
  assert.match(component, /codec:\s*'avc1\.420028'/u)
  assert.match(component, /new Blob\(\[target\.buffer\], \{ type: 'video\/mp4' \}\)/u)
  assert.match(component, /link\.download = `connexions-tatitotu-\$\{selectedDate\.value\}\.mp4`/u)
  assert.match(charts, /<AdminGeoAnimationExport/u)
})

test('permet de déplacer la tête de lecture de la timeline', () => {
  assert.match(component, /v-model\.number="previewProgress"[\s\S]*type="range"/u)
  assert.match(component, /@input="scrubPreview"/u)
  assert.match(component, /function scrubPreview\(\)[\s\S]*stopPreview\(\)[\s\S]*renderFrame\(previewProgress\.value\)/u)
})

test('identifie explicitement les horaires comme heure suisse', () => {
  assert.match(component, /HEURE SUISSE/u)
  assert.match(component, /Heure suisse.*displayTime\(previewProgress\)/u)
})

test('prolonge systématiquement la timeline jusqu’à 23 h 59', () => {
  assert.match(component, /function timelineMinute[\s\S]*const last = 23 \* 60 \+ 59[\s\S]*last - first/u)
  assert.match(component, /displayTime\(1\)/u)
})

test('estime une présence de dix minutes sans cumul journalier', () => {
  assert.match(component, /const ACTIVE_SESSION_MINUTES = 10/u)
  assert.match(component, /ageMinutes < 0 \|\| ageMinutes >= ACTIVE_SESSION_MINUTES/u)
  assert.match(component, /function estimatedActiveSessions/u)
  assert.doesNotMatch(component, /function reachedSessions/u)
  assert.match(component, /présence estimée.*ACTIVE_SESSION_MINUTES/u)
})
