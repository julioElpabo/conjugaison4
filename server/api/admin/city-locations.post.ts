// Le paquet n'expose pas de déclarations TypeScript.
// @ts-expect-error all-the-cities est un module CommonJS sans types.
import cities from 'all-the-cities'

interface CityRequest {
  key?: unknown
  label?: unknown
  countryCode?: unknown
}

interface CityRecord {
  name: string
  altName?: string
  country: string
  population: number
  loc: { coordinates: [number, number] }
}

let cityIndex: Map<string, CityRecord[]> | null = null

function normalized(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[’']/gu, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .toLowerCase()
}

function indexKey(countryCode: string, name: string) {
  return `${countryCode.toUpperCase()}:${normalized(name)}`
}

function citiesByName() {
  if (cityIndex) return cityIndex
  const index = new Map<string, CityRecord[]>()
  for (const city of cities as CityRecord[]) {
    const names = new Set([city.name, ...(city.altName || '').split(',')].filter(Boolean))
    for (const name of names) {
      const key = indexKey(city.country, name)
      const matches = index.get(key) || []
      matches.push(city)
      index.set(key, matches)
    }
  }
  for (const matches of index.values()) {
    matches.sort((left, right) => right.population - left.population)
  }
  cityIndex = index
  return index
}

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const body = await readBody<{ cities?: CityRequest[] }>(event)
  const requested = Array.isArray(body?.cities) ? body.cities.slice(0, 5_000) : []
  const index = citiesByName()
  const locations: Record<string, { latitude: number, longitude: number }> = {}

  for (const item of requested) {
    const key = typeof item.key === 'string' ? item.key.slice(0, 500) : ''
    const label = typeof item.label === 'string' ? item.label.slice(0, 200) : ''
    const countryCode = typeof item.countryCode === 'string' ? item.countryCode.slice(0, 2).toUpperCase() : ''
    if (!key || !label || !/^[A-Z]{2}$/u.test(countryCode) || label === '(not set)') continue
    const city = index.get(indexKey(countryCode, label))?.[0]
    const longitude = Number(city?.loc.coordinates[0])
    const latitude = Number(city?.loc.coordinates[1])
    if (Number.isFinite(longitude) && Number.isFinite(latitude)) locations[key] = { latitude, longitude }
  }

  return { locations }
})
