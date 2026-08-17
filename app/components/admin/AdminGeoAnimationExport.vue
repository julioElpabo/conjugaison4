<script setup lang="ts">
import worldMap from '@svg-maps/world'
import type { AnalyticsGeoTimelinePoint, AnalyticsGeoTimelineResponse } from '../../../shared/types/analytics'
import { getAdminErrorMessage } from '~/composables/useAdminAuth'

type Location = { latitude: number, longitude: number }
type LocatedPoint = AnalyticsGeoTimelinePoint & Location & { key: string }
type CantonShape = { code: string, name: string, path: string }
type CantonResponse = { viewBox: string, cantons: CantonShape[] }
type WorldShape = { id: string, name: string, path: string }
type ViewBox = { x: number, y: number, width: number, height: number }
type Rect = { x: number, y: number, width: number, height: number }

const WIDTH = 1920
const HEIGHT = 1080
const FPS = 30
const ACTIVE_SESSION_MINUTES = 10
const WORLD_BOUNDS = { left: -169.110266, top: 83.600842, right: 190.486279, bottom: -58.508473 }
const WORLD_VIEW: ViewBox = { x: 0, y: 0, width: 1010, height: 666 }
const SWISS_VIEW: ViewBox = { x: 0, y: 0, width: 980, height: 600 }
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const today = localIsoDate(new Date())
const selectedDate = ref(today)
const duration = ref(30)
const loading = ref(false)
const encoding = ref(false)
const progress = ref(0)
const error = ref('')
const timeline = ref<AnalyticsGeoTimelineResponse | null>(null)
const points = ref<LocatedPoint[]>([])
const cantons = ref<CantonResponse | null>(null)
const previewing = ref(false)
const previewProgress = ref(0)
const unresolvedCities = ref(0)
const pathCache = new Map<string, Path2D>()
let previewFrame = 0

const hasData = computed(() => points.value.length > 0)
const statusText = computed(() => {
  if (encoding.value) return `Encodage du MP4… ${Math.round(progress.value * 100)} %`
  if (loading.value) return 'Téléchargement des connexions GA4…'
  if (!timeline.value) return 'Choisissez une date pour préparer l’animation.'
  if (!hasData.value) return 'Aucune connexion géolocalisée pour cette date.'
  return `${timeline.value.sessions.toLocaleString('fr-CH')} connexion${timeline.value.sessions > 1 ? 's' : ''} · ${points.value.length.toLocaleString('fr-CH')} positions chronologiques`
})

function localIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function cityKey(point: Pick<AnalyticsGeoTimelinePoint, 'countryCode' | 'region' | 'city'>) {
  return [point.countryCode, point.region || '', point.city].join('|')
}

function minuteOfDay(value: string) {
  const match = value.match(/T(\d{2}):(\d{2})/u)
  return match ? Number(match[1]) * 60 + Number(match[2]) : 0
}

function mercatorY(latitude: number) {
  const limited = Math.max(-85, Math.min(85, latitude))
  return Math.log(Math.tan(Math.PI / 4 + limited * Math.PI / 360))
}

function projectWorld(longitude: number, latitude: number) {
  let normalizedLongitude = longitude
  if (normalizedLongitude < WORLD_BOUNDS.left) normalizedLongitude += 360
  const top = mercatorY(WORLD_BOUNDS.top)
  const bottom = mercatorY(WORLD_BOUNDS.bottom)
  return {
    x: (normalizedLongitude - WORLD_BOUNDS.left) / (WORLD_BOUNDS.right - WORLD_BOUNDS.left) * WORLD_VIEW.width,
    y: (top - mercatorY(latitude)) / (top - bottom) * WORLD_VIEW.height,
  }
}

function projectSwiss(longitude: number, latitude: number) {
  return {
    x: (longitude - 5.8) / (10.7 - 5.8) * SWISS_VIEW.width,
    y: (47.95 - latitude) / (47.95 - 45.7) * SWISS_VIEW.height,
  }
}

const europeView: ViewBox = (() => {
  const topLeft = projectWorld(-14, 72)
  const bottomRight = projectWorld(55, 34)
  return { x: topLeft.x, y: topLeft.y, width: bottomRight.x - topLeft.x, height: bottomRight.y - topLeft.y }
})()

function path2d(path: string) {
  let parsed = pathCache.get(path)
  if (!parsed) {
    parsed = new Path2D(path)
    pathCache.set(path, parsed)
  }
  return parsed
}

function mapTransform(view: ViewBox, rect: Rect) {
  const scale = Math.min(rect.width / view.width, rect.height / view.height)
  return {
    scale,
    x: rect.x + (rect.width - view.width * scale) / 2 - view.x * scale,
    y: rect.y + (rect.height - view.height * scale) / 2 - view.y * scale,
  }
}

function drawPaths(context: CanvasRenderingContext2D, paths: string[], view: ViewBox, rect: Rect) {
  const transform = mapTransform(view, rect)
  context.save()
  context.beginPath()
  context.rect(rect.x, rect.y, rect.width, rect.height)
  context.clip()
  context.translate(transform.x, transform.y)
  context.scale(transform.scale, transform.scale)
  context.fillStyle = '#101d22'
  context.strokeStyle = '#426d68'
  context.lineWidth = 0.85 / transform.scale
  for (const path of paths) {
    const shape = path2d(path)
    context.fill(shape, 'evenodd')
    context.stroke(shape)
  }
  context.restore()
}

function drawMarker(context: CanvasRenderingContext2D, x: number, y: number, sessions: number, ageMinutes: number) {
  const recent = Math.max(0, 1 - ageMinutes / ACTIVE_SESSION_MINUTES)
  const baseRadius = 2.8 + Math.min(8, Math.sqrt(sessions) * 2.1)
  const pulse = recent ? 1 + Math.sin(recent * Math.PI * 5) * 0.18 : 1
  const radius = baseRadius * pulse
  context.save()
  context.globalCompositeOperation = 'lighter'
  context.shadowColor = '#55edff'
  context.shadowBlur = recent ? 26 : 10
  context.globalAlpha = recent ? 0.92 : 0.4
  context.fillStyle = '#48eaff'
  context.beginPath()
  context.arc(x, y, radius, 0, Math.PI * 2)
  context.fill()
  if (recent > 0) {
    context.globalAlpha = recent * 0.34
    context.lineWidth = 2
    context.strokeStyle = '#bffaff'
    context.beginPath()
    context.arc(x, y, radius + (1 - recent) * 22 + 4, 0, Math.PI * 2)
    context.stroke()
  }
  context.restore()
}

function roundedRect(context: CanvasRenderingContext2D, rect: Rect, radius: number) {
  context.beginPath()
  context.roundRect(rect.x, rect.y, rect.width, rect.height, radius)
}

function drawPanel(context: CanvasRenderingContext2D, rect: Rect, title: string, subtitle: string, view: ViewBox, mapPaths: string[], visible: (point: LocatedPoint) => boolean, projection: (point: LocatedPoint) => { x: number, y: number }, normalizedProgress: number) {
  context.save()
  roundedRect(context, rect, 22)
  context.fillStyle = '#030b0f'
  context.fill()
  context.strokeStyle = '#27454d'
  context.lineWidth = 2
  context.stroke()

  context.fillStyle = '#a8e9f1'
  context.font = '800 28px system-ui, -apple-system, sans-serif'
  context.fillText(title, rect.x + 24, rect.y + 38)
  context.fillStyle = '#688c94'
  context.font = '650 15px system-ui, -apple-system, sans-serif'
  context.fillText(subtitle, rect.x + 24, rect.y + 64)

  const mapRect = { x: rect.x + 13, y: rect.y + 82, width: rect.width - 26, height: rect.height - 98 }
  drawPaths(context, mapPaths, view, mapRect)
  const transform = mapTransform(view, mapRect)
  const currentMinute = timelineMinute(normalizedProgress)
  const activeLocations = new Map<string, { point: LocatedPoint, sessions: number, ageMinutes: number }>()
  for (const point of points.value) {
    if (!visible(point)) continue
    const ageMinutes = currentMinute - minuteOfDay(point.minute)
    if (ageMinutes < 0 || ageMinutes >= ACTIVE_SESSION_MINUTES) continue
    const active = activeLocations.get(point.key)
    if (active) {
      active.sessions += point.sessions
      active.ageMinutes = Math.min(active.ageMinutes, ageMinutes)
    }
    else activeLocations.set(point.key, { point, sessions: point.sessions, ageMinutes })
  }
  for (const active of activeLocations.values()) {
    const point = active.point
    const projected = projection(point)
    drawMarker(
      context,
      transform.x + projected.x * transform.scale,
      transform.y + projected.y * transform.scale,
      active.sessions,
      active.ageMinutes,
    )
  }
  context.restore()
}

function timelineMinute(normalizedProgress: number) {
  if (!points.value.length) return 0
  const first = minuteOfDay(points.value[0]!.minute)
  const last = 23 * 60 + 59
  return Math.round(first + (last - first) * normalizedProgress)
}

function displayTime(normalizedProgress: number) {
  if (!points.value.length) return '—'
  const minute = timelineMinute(normalizedProgress)
  return `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`
}

function estimatedActiveSessions(normalizedProgress: number) {
  const currentMinute = timelineMinute(normalizedProgress)
  return points.value.reduce((sum, point) => {
    const ageMinutes = currentMinute - minuteOfDay(point.minute)
    return ageMinutes >= 0 && ageMinutes < ACTIVE_SESSION_MINUTES ? sum + point.sessions : sum
  }, 0)
}

function renderFrame(normalizedProgress: number) {
  const target = canvas.value
  if (!target) return
  const context = target.getContext('2d')
  if (!context) return
  const worldPaths = (worldMap.locations as WorldShape[]).map(location => location.path)
  const cantonPaths = cantons.value?.cantons.map(canton => canton.path) || []
  const panelGap = 18
  const panelWidth = (WIDTH - 80 - panelGap * 2) / 3
  const panelY = 178
  const panelHeight = 760

  context.clearRect(0, 0, WIDTH, HEIGHT)
  const background = context.createLinearGradient(0, 0, WIDTH, HEIGHT)
  background.addColorStop(0, '#102228')
  background.addColorStop(0.55, '#071317')
  background.addColorStop(1, '#02080b')
  context.fillStyle = background
  context.fillRect(0, 0, WIDTH, HEIGHT)

  context.fillStyle = '#d0f5fa'
  context.font = '850 43px system-ui, -apple-system, sans-serif'
  context.fillText('Connexions à TatiToTu', 40, 62)
  context.fillStyle = '#7ba5ad'
  context.font = '650 20px system-ui, -apple-system, sans-serif'
  context.fillText(new Intl.DateTimeFormat('fr-CH', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${selectedDate.value}T12:00:00Z`)), 42, 96)

  context.textAlign = 'right'
  context.fillStyle = '#7ba5ad'
  context.font = '800 15px system-ui, -apple-system, sans-serif'
  context.fillText('HEURE SUISSE', WIDTH - 42, 26)
  context.fillStyle = '#66efff'
  context.font = '850 42px ui-monospace, SFMono-Regular, Menlo, monospace'
  context.fillText(displayTime(normalizedProgress), WIDTH - 42, 62)
  context.fillStyle = '#91b7be'
  context.font = '750 18px system-ui, -apple-system, sans-serif'
  const count = estimatedActiveSessions(normalizedProgress)
  context.fillText(`${count.toLocaleString('fr-CH')} active${count > 1 ? 's' : ''} estimée${count > 1 ? 's' : ''}`, WIDTH - 42, 96)
  context.textAlign = 'left'

  drawPanel(context, { x: 40, y: panelY, width: panelWidth, height: panelHeight }, 'Monde', 'Toutes les connexions', WORLD_VIEW, worldPaths, () => true, point => projectWorld(point.longitude, point.latitude), normalizedProgress)
  drawPanel(context, { x: 40 + panelWidth + panelGap, y: panelY, width: panelWidth, height: panelHeight }, 'Europe centrale', 'Zoom régional', europeView, worldPaths, point => point.longitude >= -14 && point.longitude <= 55 && point.latitude >= 34 && point.latitude <= 72, point => projectWorld(point.longitude, point.latitude), normalizedProgress)
  drawPanel(context, { x: 40 + (panelWidth + panelGap) * 2, y: panelY, width: panelWidth, height: panelHeight }, 'Suisse', 'Détail cantonal', SWISS_VIEW, cantonPaths, point => point.countryCode === 'CH', point => projectSwiss(point.longitude, point.latitude), normalizedProgress)

  const progressRect = { x: 40, y: 985, width: WIDTH - 80, height: 9 }
  roundedRect(context, progressRect, 5)
  context.fillStyle = '#173139'
  context.fill()
  roundedRect(context, { ...progressRect, width: Math.max(9, progressRect.width * normalizedProgress) }, 5)
  context.fillStyle = '#43dff2'
  context.shadowColor = '#43dff2'
  context.shadowBlur = 14
  context.fill()
  context.shadowBlur = 0
  context.fillStyle = '#658991'
  context.font = '600 15px system-ui, -apple-system, sans-serif'
  context.fillText(`Source : Google Analytics 4 · présence estimée ${ACTIVE_SESSION_MINUTES} min · localisation approximative`, 42, 1030)
  context.textAlign = 'right'
  context.fillText('tatitotu.ch', WIDTH - 42, 1030)
  context.textAlign = 'left'
}

async function loadTimeline() {
  loading.value = true
  error.value = ''
  stopPreview()
  try {
    const data = await $fetch<AnalyticsGeoTimelineResponse>('/api/admin/analytics-geo-timeline', {
      credentials: 'same-origin',
      query: { date: selectedDate.value },
      timeout: 45_000,
    })
    timeline.value = data
    if (!data.configured) throw new Error(data.notice || 'Google Analytics n’est pas configuré.')

    const uniqueCities = [...new Map(data.points.map(point => [cityKey(point), point])).entries()]
    const swissCities = [...new Set(data.points.filter(point => point.countryCode === 'CH').map(point => point.city))]
    const emptySwissLocations: { locations: Record<string, Location & { code: string }> } = { locations: {} }
    const [locationResponse, cantonResponse, swissResponse] = await Promise.all([
      $fetch<{ locations: Record<string, Location> }>('/api/admin/city-locations', {
        method: 'POST', credentials: 'same-origin', timeout: 30_000,
        body: { cities: uniqueCities.map(([key, point]) => ({ key, label: point.city, countryCode: point.countryCode })) },
      }),
      $fetch<CantonResponse>('/api/admin/swiss-cantons', { credentials: 'same-origin', timeout: 30_000 }),
      swissCities.length
        ? $fetch<{ locations: Record<string, Location & { code: string }> }>('/api/admin/swiss-city-cantons', { method: 'POST', credentials: 'same-origin', timeout: 30_000, body: { cities: swissCities } })
        : Promise.resolve(emptySwissLocations),
    ])
    cantons.value = cantonResponse
    points.value = data.points.flatMap((point): LocatedPoint[] => {
      const key = cityKey(point)
      const location = point.countryCode === 'CH' ? swissResponse.locations[point.city] || locationResponse.locations[key] : locationResponse.locations[key]
      if (!location) return []
      return [{ ...point, ...location, key }]
    })
    unresolvedCities.value = uniqueCities.length - new Set(points.value.map(point => point.key)).size
    previewProgress.value = 0
    await nextTick()
    renderFrame(0)
  }
  catch (caught) {
    error.value = getAdminErrorMessage(caught, 'Impossible de préparer les données de cette animation.')
    points.value = []
    await nextTick()
    renderFrame(0)
  }
  finally {
    loading.value = false
  }
}

function stopPreview() {
  previewing.value = false
  if (previewFrame) cancelAnimationFrame(previewFrame)
  previewFrame = 0
}

function scrubPreview() {
  stopPreview()
  renderFrame(previewProgress.value)
}

function playPreview() {
  if (!hasData.value || previewing.value) return
  previewing.value = true
  const startedAt = performance.now()
  const previewDuration = Math.min(12, duration.value) * 1000
  const tick = (now: number) => {
    const value = Math.min(1, (now - startedAt) / previewDuration)
    previewProgress.value = value
    renderFrame(value)
    if (value < 1 && previewing.value) previewFrame = requestAnimationFrame(tick)
    else previewing.value = false
  }
  previewFrame = requestAnimationFrame(tick)
}

async function encodeMp4() {
  if (!timeline.value || timeline.value.date !== selectedDate.value) await loadTimeline()
  if (!hasData.value || encoding.value) return
  if (typeof VideoEncoder === 'undefined' || typeof VideoFrame === 'undefined') {
    error.value = 'Ce navigateur ne peut pas encoder le MP4. Utilisez une version récente de Chrome, Edge ou Safari.'
    return
  }
  stopPreview()
  encoding.value = true
  progress.value = 0
  error.value = ''
  try {
    const videoConfig: VideoEncoderConfig = { codec: 'avc1.420028', width: WIDTH, height: HEIGHT, bitrate: 8_000_000, framerate: FPS }
    const support = await VideoEncoder.isConfigSupported(videoConfig)
    if (!support.supported) throw new Error('L’encodeur vidéo H.264 n’est pas disponible dans ce navigateur.')
    const { ArrayBufferTarget, Muxer } = await import('mp4-muxer')
    const target = new ArrayBufferTarget()
    const muxer = new Muxer({
      target,
      video: { codec: 'avc', width: WIDTH, height: HEIGHT, frameRate: FPS },
      fastStart: 'in-memory',
    })
    let encoderError: Error | null = null
    const encoder = new VideoEncoder({
      output: (chunk, metadata) => muxer.addVideoChunk(chunk, metadata),
      error: caught => { encoderError = caught },
    })
    encoder.configure(support.config || videoConfig)
    const totalFrames = Math.round(duration.value * FPS)
    const activeFrames = Math.max(1, totalFrames - FPS)
    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex += 1) {
      const frameProgress = Math.min(1, frameIndex / activeFrames)
      renderFrame(frameProgress)
      const frame = new VideoFrame(canvas.value!, { timestamp: Math.round(frameIndex * 1_000_000 / FPS), duration: Math.round(1_000_000 / FPS) })
      encoder.encode(frame, { keyFrame: frameIndex % (FPS * 2) === 0 })
      frame.close()
      if (encoder.encodeQueueSize > 12) await encoder.flush()
      if (encoderError) throw encoderError
      progress.value = (frameIndex + 1) / totalFrames
      if (frameIndex % 10 === 0) await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    }
    await encoder.flush()
    encoder.close()
    if (encoderError) throw encoderError
    muxer.finalize()
    const blob = new Blob([target.buffer], { type: 'video/mp4' })
    previewProgress.value = 1
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `connexions-tatitotu-${selectedDate.value}.mp4`
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }
  catch (caught) {
    error.value = caught instanceof Error ? caught.message : 'La création du MP4 a échoué.'
  }
  finally {
    encoding.value = false
  }
}

watch(selectedDate, () => {
  timeline.value = null
  points.value = []
  error.value = ''
  stopPreview()
  nextTick(() => renderFrame(0))
})

onMounted(() => {
  renderFrame(0)
})
onBeforeUnmount(stopPreview)
</script>

<template>
  <section class="geo-export admin-card" aria-labelledby="geo-export-title">
    <header class="geo-export__heading">
      <div>
        <p>Animation géographique</p>
        <h2 id="geo-export-title">Créer la vidéo des connexions</h2>
        <span>Les trois cartes s’animent de la première à la dernière connexion du jour.</span>
      </div>
      <div class="geo-export__fields">
        <label><span>Date</span><input v-model="selectedDate" type="date" :max="today" :disabled="loading || encoding"></label>
        <label><span>Durée</span><select v-model.number="duration" :disabled="encoding"><option :value="15">15 secondes</option><option :value="30">30 secondes</option><option :value="45">45 secondes</option></select></label>
      </div>
    </header>

    <div class="geo-export__preview">
      <canvas ref="canvas" :width="WIDTH" :height="HEIGHT" aria-label="Aperçu de l’animation des connexions" />
      <div v-if="loading || encoding" class="geo-export__overlay" role="status"><span class="admin-spinner"/><strong>{{ statusText }}</strong></div>
    </div>

    <div class="geo-export__timeline">
      <span>{{ hasData ? displayTime(0) : '—' }}</span>
      <label>
        <span class="sr-only">Position dans l’animation</span>
        <input
          v-model.number="previewProgress"
          type="range"
          min="0"
          max="1"
          step="0.001"
          :disabled="!hasData || loading || encoding"
          :aria-valuetext="hasData ? `Heure suisse ${displayTime(previewProgress)} · ${estimatedActiveSessions(previewProgress)} connexions actives estimées` : 'Aucune donnée'"
          @input="scrubPreview"
        >
      </label>
      <strong>{{ hasData ? `Heure suisse ${displayTime(previewProgress)}` : '—' }}</strong>
      <span>{{ hasData ? displayTime(1) : '—' }}</span>
    </div>

    <div class="geo-export__status">
      <p><strong>{{ statusText }}</strong><small v-if="timeline?.timeZone">Fuseau GA4 : {{ timeline.timeZone }}</small></p>
      <p v-if="timeline?.notice" class="geo-export__notice">{{ timeline.notice }}</p>
      <p v-if="hasData" class="geo-export__notice">Chaque connexion reste visible pendant 10 minutes, puis disparaît. Il s’agit d’une estimation fondée sur la durée moyenne du site, et non d’une déconnexion mesurée.</p>
      <p v-if="unresolvedCities" class="geo-export__notice">{{ unresolvedCities }} ville{{ unresolvedCities > 1 ? 's n’ont' : ' n’a' }} pas pu être placée{{ unresolvedCities > 1 ? 's' : '' }} sur la carte.</p>
      <p v-if="error" class="admin-notice admin-notice--error" role="alert">{{ error }}</p>
    </div>

    <footer class="geo-export__actions">
      <button class="admin-button admin-button--secondary" type="button" :disabled="loading || encoding" @click="loadTimeline">Charger les données GA4</button>
      <button class="admin-button admin-button--secondary" type="button" :disabled="!hasData || loading || encoding || previewing" @click="playPreview">{{ previewing ? 'Lecture…' : 'Voir l’animation' }}</button>
      <button class="admin-button" type="button" :disabled="loading || encoding" @click="encodeMp4">{{ encoding ? `Création… ${Math.round(progress * 100)} %` : 'Créer et télécharger le MP4' }}</button>
    </footer>
  </section>
</template>

<style scoped>
.geo-export{display:grid;padding:18px;gap:16px;box-shadow:none}.geo-export__heading{display:flex;align-items:end;justify-content:space-between;gap:24px}.geo-export__heading p{margin:0 0 4px;color:#08758b;font-size:.68rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.geo-export__heading h2{margin:0;color:var(--admin-navy);font-size:clamp(1.25rem,3vw,1.75rem)}.geo-export__heading>div>span{display:block;margin-top:5px;color:var(--admin-muted);font-size:.78rem}.geo-export__fields{display:flex;align-items:end;gap:9px}.geo-export__fields label{display:grid;gap:4px}.geo-export__fields label span{color:var(--admin-muted);font-size:.62rem;font-weight:850;text-transform:uppercase}.geo-export__fields input,.geo-export__fields select{min-height:38px;padding:7px 10px;color:#173f4a;border:1px solid #bdd2d7;border-radius:9px;background:#fff;font:inherit;font-size:.76rem}.geo-export__preview{position:relative;overflow:hidden;border:1px solid #29474f;border-radius:15px;background:#061014}.geo-export__preview canvas{display:block;width:100%;height:auto;aspect-ratio:16/9}.geo-export__overlay{position:absolute;inset:0;display:grid;place-items:center;align-content:center;gap:12px;color:#d7f8fb;background:rgb(2 10 13 / 76%);backdrop-filter:blur(3px)}.geo-export__overlay strong{font-size:.82rem}.geo-export__timeline{display:grid;grid-template-columns:auto minmax(120px,1fr) minmax(150px,auto) auto;align-items:center;gap:10px;color:var(--admin-muted);font:750 .7rem ui-monospace,SFMono-Regular,Menlo,monospace}.geo-export__timeline label{display:grid}.geo-export__timeline input{width:100%;height:24px;margin:0;accent-color:#087f98;cursor:grab}.geo-export__timeline input:active{cursor:grabbing}.geo-export__timeline input:disabled{cursor:not-allowed;opacity:.45}.geo-export__timeline strong{padding:5px 7px;border-radius:7px;color:#d9fbff;background:#08758b;text-align:center;white-space:nowrap}.geo-export__status{display:grid;gap:6px}.geo-export__status p{margin:0}.geo-export__status>p:first-child{display:flex;align-items:center;justify-content:space-between;gap:12px;color:var(--admin-navy);font-size:.8rem}.geo-export__status small,.geo-export__notice{color:var(--admin-muted);font-size:.7rem}.geo-export__actions{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:9px}.geo-export__actions .admin-button:last-child{min-width:220px}.sr-only{position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}:global(:root[data-theme='dark']) .geo-export__fields input,:global(:root[data-theme='dark']) .geo-export__fields select{color:#d7edf1;border-color:#49646c;background:#13262c}@media(max-width:760px){.geo-export__heading{align-items:stretch;flex-direction:column}.geo-export__fields{display:grid;grid-template-columns:1fr 1fr}.geo-export__fields input,.geo-export__fields select{width:100%}.geo-export__timeline{grid-template-columns:auto minmax(80px,1fr) auto}.geo-export__timeline strong{display:none}.geo-export__actions{display:grid}.geo-export__actions .admin-button{width:100%}.geo-export__status>p:first-child{align-items:flex-start;flex-direction:column}}
</style>
