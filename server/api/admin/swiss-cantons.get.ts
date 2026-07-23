type Position = [number, number]
type Ring = Position[]
type Polygon = Ring[]
type MultiPolygon = Polygon[]

interface SwissTopoFeature {
  id: number
  geometry?: { type: 'MultiPolygon', coordinates: MultiPolygon }
  properties?: { ak?: string, name?: string }
}

interface SwissTopoResponse {
  features?: SwissTopoFeature[]
  feature?: SwissTopoFeature
}

interface CantonShape {
  code: string
  name: string
  path: string
  viewBox: string
  x: number
  y: number
}

const LAYER = 'ch.swisstopo.swissboundaries3d-kanton-flaeche.fill'
const SWISS_BOUNDS = { minX: 5.8, maxX: 10.7, minY: 45.7, maxY: 47.95 }
const WIDTH = 980
const HEIGHT = 600
let cached: { expiresAt: number, cantons: CantonShape[] } | null = null

function distanceToSegment(point: Position, start: Position, end: Position) {
  const dx = end[0] - start[0]
  const dy = end[1] - start[1]
  if (!dx && !dy) return Math.hypot(point[0] - start[0], point[1] - start[1])
  const ratio = Math.max(0, Math.min(1, ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(point[0] - (start[0] + ratio * dx), point[1] - (start[1] + ratio * dy))
}

function simplify(points: Ring, tolerance = 0.0012): Ring {
  if (points.length <= 4) return points
  const open = points.slice(0, -1)
  const keep = new Set([0, open.length - 1])
  const visit = (start: number, end: number) => {
    let maximum = 0
    let index = -1
    for (let current = start + 1; current < end; current += 1) {
      const distance = distanceToSegment(open[current]!, open[start]!, open[end]!)
      if (distance > maximum) {
        maximum = distance
        index = current
      }
    }
    if (index > start && maximum > tolerance) {
      keep.add(index)
      visit(start, index)
      visit(index, end)
    }
  }
  visit(0, open.length - 1)
  const result = [...keep].sort((left, right) => left - right).map(index => open[index]!)
  return [...result, result[0]!]
}

function project([longitude, latitude]: Position): Position {
  return [
    (longitude - SWISS_BOUNDS.minX) / (SWISS_BOUNDS.maxX - SWISS_BOUNDS.minX) * WIDTH,
    (SWISS_BOUNDS.maxY - latitude) / (SWISS_BOUNDS.maxY - SWISS_BOUNDS.minY) * HEIGHT,
  ]
}

function pathFor(coordinates: MultiPolygon) {
  return coordinates.map(polygon => polygon.map((ring) => {
    const points = simplify(ring).map(project)
    return points.map((point, index) => `${index ? 'L' : 'M'}${point[0].toFixed(1)},${point[1].toFixed(1)}`).join('') + 'Z'
  }).join('')).join('')
}

function boundsFor(coordinates: MultiPolygon) {
  const points = coordinates.flat(2).map(project)
  const xs = points.map(point => point[0])
  const ys = points.map(point => point[1])
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  return { minX, maxX, minY, maxY }
}

function viewBoxFor(coordinates: MultiPolygon) {
  const { minX, maxX, minY, maxY } = boundsFor(coordinates)
  const padding = Math.max(10, Math.max(maxX - minX, maxY - minY) * 0.12)
  return `${(minX - padding).toFixed(1)} ${(minY - padding).toFixed(1)} ${(maxX - minX + padding * 2).toFixed(1)} ${(maxY - minY + padding * 2).toFixed(1)}`
}

async function loadCantons() {
  if (cached && cached.expiresAt > Date.now()) return cached.cantons
  const batches = ['1,2,3,4,5,6,7,8,9,10', '11,12,13,14,15,16,17,18,19,20', '21,22,23,24,25,26']
  const responses = await Promise.all(batches.map(async (ids) => {
    const url = `https://api3.geo.admin.ch/rest/services/ech/MapServer/${LAYER}/${ids}?sr=4326&geometryFormat=geojson&lang=fr`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Lecture swisstopo impossible (${response.status})`)
    return response.json() as Promise<SwissTopoResponse>
  }))
  const features = responses.flatMap(response => response.features || (response.feature ? [response.feature] : []))
  const cantons = features
    .filter(feature => feature.geometry?.type === 'MultiPolygon' && feature.properties?.ak)
    .map((feature) => {
      const bounds = boundsFor(feature.geometry!.coordinates)
      return {
        code: feature.properties!.ak!,
        name: feature.properties?.name || feature.properties!.ak!,
        path: pathFor(feature.geometry!.coordinates),
        viewBox: viewBoxFor(feature.geometry!.coordinates),
        x: Math.round((bounds.minX + bounds.maxX) / 2 * 10) / 10,
        y: Math.round((bounds.minY + bounds.maxY) / 2 * 10) / 10,
      }
    })
  cached = { cantons, expiresAt: Date.now() + 24 * 60 * 60 * 1000 }
  return cantons
}

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  return { viewBox: `0 0 ${WIDTH} ${HEIGHT}`, cantons: await loadCantons() }
})
