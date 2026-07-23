import countries from 'i18n-iso-countries'

type Position = [number, number]
type Ring = Position[]
type Polygon = Ring[]
type MultiPolygon = Polygon[]

interface BoundaryMetadata {
  boundaryName: string
  boundaryISO: string
  simplifiedGeometryGeoJSON: string
}

interface BoundaryFeature {
  properties?: { shapeName?: string, shapeISO?: string, shapeID?: string }
  geometry?: {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: Polygon | MultiPolygon
  }
}

interface RegionShape {
  id: string
  name: string
  path: string
  viewBox: string
  x: number
  y: number
  longitude: number
  latitude: number
}

interface ProjectionMetadata {
  crossesDateLine: boolean
  minLongitude: number
  maxMercatorY: number
  scale: number
  offsetX: number
  offsetY: number
}

const WIDTH = 1000
const HEIGHT = 600
const METADATA_URL = 'https://www.geoboundaries.org/api/current/gbOpen/ALL/ADM1/'
let metadataCache: { expiresAt: number, rows: BoundaryMetadata[] } | null = null
const countryCache = new Map<string, {
  expiresAt: number
  regions: RegionShape[]
  projection: ProjectionMetadata
}>()

function normalized(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .toLowerCase()
}

async function metadata() {
  if (metadataCache && metadataCache.expiresAt > Date.now()) return metadataCache.rows
  const response = await fetch(METADATA_URL, { signal: AbortSignal.timeout(12_000) })
  if (!response.ok) throw new Error(`Métadonnées geoBoundaries indisponibles (${response.status})`)
  const rows = await response.json() as BoundaryMetadata[]
  metadataCache = { rows, expiresAt: Date.now() + 24 * 60 * 60 * 1000 }
  return rows
}

function coordinates(feature: BoundaryFeature): MultiPolygon {
  if (!feature.geometry) return []
  return feature.geometry.type === 'Polygon'
    ? [feature.geometry.coordinates as Polygon]
    : feature.geometry.coordinates as MultiPolygon
}

function allPoints(features: BoundaryFeature[]) {
  return features.flatMap(feature => coordinates(feature).flat(2))
}

function mercatorY(latitude: number) {
  const limited = Math.max(-85, Math.min(85, latitude))
  return Math.log(Math.tan(Math.PI / 4 + limited * Math.PI / 360)) * 180 / Math.PI
}

function projection(features: BoundaryFeature[]) {
  const points = allPoints(features)
  const longitudes = points.map(point => point[0])
  const crossesDateLine = Math.max(...longitudes) - Math.min(...longitudes) > 180
  const longitude = (value: number) => crossesDateLine && value < 0 ? value + 360 : value
  const xs = longitudes.map(longitude)
  const ys = points.map(point => mercatorY(point[1]))
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const spanX = Math.max(.0001, maxX - minX)
  const spanY = Math.max(.0001, maxY - minY)
  const scale = Math.min((WIDTH - 40) / spanX, (HEIGHT - 40) / spanY)
  const renderedWidth = spanX * scale
  const renderedHeight = spanY * scale
  const offsetX = (WIDTH - renderedWidth) / 2
  const offsetY = (HEIGHT - renderedHeight) / 2
  return {
    project: (point: Position): Position => [
      offsetX + (longitude(point[0]) - minX) * scale,
      offsetY + (maxY - mercatorY(point[1])) * scale,
    ],
    metadata: {
      crossesDateLine,
      minLongitude: minX,
      maxMercatorY: maxY,
      scale,
      offsetX,
      offsetY,
    } satisfies ProjectionMetadata,
  }
}

function geographicCenter(polygons: MultiPolygon) {
  const points = polygons.flat(2)
  const longitudes = points.map(point => point[0])
  const crossesDateLine = Math.max(...longitudes) - Math.min(...longitudes) > 180
  const normalizedLongitudes = longitudes.map(value => crossesDateLine && value < 0 ? value + 360 : value)
  let longitude = (Math.min(...normalizedLongitudes) + Math.max(...normalizedLongitudes)) / 2
  if (longitude > 180) longitude -= 360
  const latitudes = points.map(point => point[1])
  return {
    longitude,
    latitude: (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
  }
}

function shapeBounds(polygons: MultiPolygon, project: (point: Position) => Position) {
  const points = polygons.flat(2).map(project)
  const xs = points.map(point => point[0])
  const ys = points.map(point => point[1])
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  }
}

function pathFor(polygons: MultiPolygon, project: (point: Position) => Position) {
  return polygons.map(polygon => polygon.map((ring) => {
    const projected = ring.map(project)
    const simplified: Position[] = projected.length ? [projected[0]!] : []
    for (let index = 1; index < projected.length - 1; index += 1) {
      const point = projected[index]!
      const previous = simplified[simplified.length - 1]!
      if (Math.hypot(point[0] - previous[0], point[1] - previous[1]) >= .55) simplified.push(point)
    }
    if (projected.length > 1) simplified.push(projected[projected.length - 1]!)
    return simplified.map(([x, y], index) => {
    return `${index ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`
    }).join('') + 'Z'
  }).join('')).join('')
}

function viewBoxFor(bounds: ReturnType<typeof shapeBounds>) {
  const width = bounds.maxX - bounds.minX
  const height = bounds.maxY - bounds.minY
  const padding = Math.max(8, Math.max(width, height) * .14)
  return `${bounds.minX - padding} ${bounds.minY - padding} ${width + padding * 2} ${height + padding * 2}`
}

async function loadCountryRegions(row: BoundaryMetadata) {
  const cached = countryCache.get(row.boundaryISO)
  if (cached && cached.expiresAt > Date.now()) return cached
  const response = await fetch(row.simplifiedGeometryGeoJSON, { signal: AbortSignal.timeout(30_000) })
  if (!response.ok) throw new Error(`Découpage régional indisponible (${response.status})`)
  const payload = await response.json() as { features?: BoundaryFeature[] }
  const features = (payload.features || []).filter(feature => coordinates(feature).length)
  if (!features.length) throw new Error('Aucune région disponible dans le découpage reçu.')
  const { project, metadata: projectionMetadata } = projection(features)
  const regions = features.map((feature, index) => {
    const polygons = coordinates(feature)
    const bounds = shapeBounds(polygons, project)
    const center = geographicCenter(polygons)
    return {
      id: feature.properties?.shapeID || feature.properties?.shapeISO || `${row.boundaryISO}-${index}`,
      name: feature.properties?.shapeName || feature.properties?.shapeISO || `Région ${index + 1}`,
      path: pathFor(polygons, project),
      viewBox: viewBoxFor(bounds),
      x: (bounds.minX + bounds.maxX) / 2,
      y: (bounds.minY + bounds.maxY) / 2,
      longitude: center.longitude,
      latitude: center.latitude,
    }
  })
  const result = { regions, projection: projectionMetadata, expiresAt: Date.now() + 24 * 60 * 60 * 1000 }
  countryCache.set(row.boundaryISO, result)
  return result
}

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const query = getQuery(event)
  const code = String(query.code || '').trim().toUpperCase()
  const requestedName = String(query.name || '').trim()
  const centroidsOnly = String(query.centroids || '') === '1'
  if (!/^[A-Z]{2}$/u.test(code)) {
    throw createError({ statusCode: 400, statusMessage: 'Code pays invalide.' })
  }

  const displayName = new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || ''
  const alpha3 = countries.alpha2ToAlpha3(code) || (code === 'XK' ? 'XKX' : '')
  const names = new Set([requestedName, displayName].map(normalized).filter(Boolean))
  const rows = await metadata()
  const row = rows.find(item => item.boundaryISO === alpha3)
    || rows.find(item => names.has(normalized(item.boundaryName)))
  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Découpage régional indisponible pour ce pays.' })
  }

  const result = await loadCountryRegions(row)
  return {
    country: row.boundaryName,
    source: 'geoBoundaries',
    viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
    projection: centroidsOnly ? undefined : result.projection,
    regions: centroidsOnly
      ? result.regions.map(({ id, name, longitude, latitude }) => ({ id, name, longitude, latitude }))
      : result.regions,
  }
})
