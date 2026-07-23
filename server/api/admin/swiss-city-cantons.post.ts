const CANTON_CODES = new Set([
  'AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR', 'JU', 'LU', 'NE',
  'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG', 'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH',
])
interface CityLocation {
  code: string
  latitude: number
  longitude: number
}

const cache = new Map<string, { location: CityLocation | null, expiresAt: number }>()

interface LocationResult {
  attrs?: { detail?: string, label?: string, lat?: number, lon?: number }
}

function normalized(value: string) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').trim().toLowerCase()
}

function cityLocation(result: LocationResult): CityLocation | null {
  const detail = result.attrs?.detail || ''
  const label = result.attrs?.label || ''
  const match = detail.match(/\s([a-z]{2})$/iu) || label.match(/\(([A-Z]{2})\)/u)
  const code = match?.[1]?.toUpperCase() || ''
  const latitude = Number(result.attrs?.lat)
  const longitude = Number(result.attrs?.lon)
  return CANTON_CODES.has(code) && Number.isFinite(latitude) && Number.isFinite(longitude)
    ? { code, latitude, longitude }
    : null
}

async function resolveCity(name: string) {
  const key = normalized(name)
  const cached = cache.get(key)
  if (cached && cached.expiresAt > Date.now()) return cached.location
  const params = new URLSearchParams({
    searchText: name,
    type: 'locations',
    origins: 'gg25,zipcode',
    limit: '5',
    sr: '4326',
  })
  const response = await fetch(`https://api3.geo.admin.ch/rest/services/ech/SearchServer?${params}`)
  if (!response.ok) return null
  const payload = await response.json() as { results?: LocationResult[] }
  const location = payload.results?.map(cityLocation).find(Boolean) || null
  cache.set(key, { location, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 })
  return location
}

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const body = await readBody<{ cities?: unknown }>(event)
  const cities = Array.isArray(body?.cities)
    ? [...new Set(body.cities
        .filter((city): city is string => typeof city === 'string')
        .map(city => city.trim())
        .filter(city => city && city !== '(not set)')
        .slice(0, 100))]
    : []
  const entries = await Promise.all(cities.map(async city => [city, await resolveCity(city)] as const))
  return { locations: Object.fromEntries(entries.filter((entry): entry is readonly [string, CityLocation] => Boolean(entry[1]))) }
})
