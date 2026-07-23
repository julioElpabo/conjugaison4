<script setup lang="ts">
import worldMap from '@svg-maps/world'
import type { AnalyticsBreakdownItem } from '../../../shared/types/analytics'

type RegionItem = AnalyticsBreakdownItem & { country?: string }
type CityItem = AnalyticsBreakdownItem & { cityId?: string, country?: string, countryCode?: string, region?: string }
type WorldLocation = { id: string, name: string, path: string }
type CantonShape = { code: string, name: string, path: string, viewBox: string, x: number, y: number }
type CantonResponse = { viewBox: string, cantons: CantonShape[] }
type WorldRegionShape = { id: string, name: string, path: string, viewBox: string, x: number, y: number, longitude: number, latitude: number }
type WorldProjection = {
  crossesDateLine: boolean
  minLongitude: number
  maxMercatorY: number
  scale: number
  offsetX: number
  offsetY: number
}
type WorldRegionResponse = {
  country: string
  source: string
  viewBox: string
  projection: WorldProjection
  regions: WorldRegionShape[]
}
type WorldRegionPoint = Pick<WorldRegionShape, 'id' | 'name' | 'longitude' | 'latitude'>
type WorldRegionPointResponse = { country: string, source: string, regions: WorldRegionPoint[] }
type CityLocation = { code: string, latitude: number, longitude: number }
type WorldCityLocation = { latitude: number, longitude: number }
type MapMarker = {
  id: string
  label: string
  context: string
  value: number
  x: number
  y: number
  kind: 'country' | 'region' | 'city' | 'summary'
  source?: RegionItem | CityItem
  countryCode?: string
  countryCodes?: string[]
}

const props = defineProps<{
  countries: AnalyticsBreakdownItem[]
  regions: RegionItem[]
  cities: CityItem[]
  realtime?: boolean
  notice?: string
}>()

const mapRoot = useTemplateRef<HTMLElement>('map-root')
const selectedCode = ref('')
const selectedRegionLabel = ref('')
const selectedCityLabel = ref('')
const selectedViewBox = ref(worldMap.viewBox)
const selectedPathCenter = ref({ x: 0, y: 0 })
const pathElements = new Map<string, SVGGraphicsElement>()
const countryCenters = ref<Record<string, { x: number, y: number }>>({})
const hoveredMarker = ref<MapMarker | null>(null)
const tooltipPosition = ref({ left: 14, top: 14 })
const cantonMap = ref<CantonResponse | null>(null)
const cantonMapLoading = ref(false)
const cantonMapError = ref('')
const worldRegionMap = ref<WorldRegionResponse | null>(null)
const worldRegionMapLoading = ref(false)
const worldRegionMapError = ref('')
const worldRegionPoints = ref<Record<string, WorldRegionPoint[]>>({})
const cityLocations = ref<Record<string, CityLocation>>({})
const worldCityLocations = ref<Record<string, WorldCityLocation>>({})
const zoomLevel = ref(1)
const animatedViewBox = ref<string | null>(null)
const isZooming = ref(false)
const panOffset = ref({ x: 0, y: 0 })
const isPanning = ref(false)
const didPan = ref(false)
const showLabels = ref(false)
let panStart = { clientX: 0, clientY: 0, x: 0, y: 0, width: 1, height: 1 }
const MIN_ZOOM = 1
const MAX_ZOOM = 5
const ZOOM_STEP = 1.45
const MAP_ASPECT_RATIO = 1.85
const MAX_AUTOMATIC_ZOOM = 4
const ZOOM_ANIMATION_MS = 620
const DETAILED_WORLD_COUNTRIES = new Set([
  'af', 'ao', 'ar', 'au', 'bo', 'br', 'bw', 'ca', 'cf', 'cd', 'cl', 'cm', 'cn', 'co', 'dz', 'eg',
  'es', 'et', 'fr', 'gl', 'id', 'in', 'ir', 'kz', 'ly', 'ma', 'mg', 'ml', 'mn', 'mr', 'mx', 'mm',
  'mz', 'na', 'ne', 'ng', 'pe', 'pk', 'pg', 'ru', 'sa', 'sd', 'so', 'ss', 'td', 'th', 'tm', 'tr',
  'tz', 'ua', 'us', 'uz', 've', 'ye', 'za', 'zm',
])
const WORLD_GEO_BOUNDS = { left: -169.110266, top: 83.600842, right: 190.486279, bottom: -58.508473 }
let worldRegionRequest = 0
let worldCityLocationRequest = 0
const worldRegionPointRequests = new Set<string>()

const countryData = computed(() => new Map(props.countries
  .filter(country => country.code)
  .map(country => [country.code!.toLowerCase(), country])))
const selectedCountry = computed(() => countryData.value.get(selectedCode.value))
const selectedLocation = computed(() => (worldMap.locations as WorldLocation[]).find(location => location.id === selectedCode.value))
const selectedRegions = computed(() => {
  if (!selectedCountry.value) return []
  return props.regions
    .filter(region => region.country === selectedCountry.value?.label && region.label !== '(not set)')
    .sort((left, right) => right.value - left.value)
})
const countryCities = computed(() => {
  if (!selectedCountry.value) return []
  return props.cities
    .filter(city => city.country === selectedCountry.value?.label && city.label !== '(not set)')
    .sort((left, right) => right.value - left.value)
})
const isSwitzerland = computed(() => selectedCode.value === 'ch')
const cantonAliases: Record<string, string[]> = {
  ZH: ['zurich'], BE: ['bern', 'berne'], LU: ['luzern', 'lucerne'], UR: ['uri'], SZ: ['schwyz'],
  OW: ['obwalden'], NW: ['nidwalden'], GL: ['glarus'], ZG: ['zug'], FR: ['fribourg', 'freiburg'],
  SO: ['solothurn', 'soleure'], BS: ['basel stadt', 'basel city', 'bale ville'], BL: ['basel landschaft', 'basel country', 'bale campagne'],
  SH: ['schaffhausen', 'schaffhouse'], AR: ['appenzell ausserrhoden', 'appenzell outer rhodes'], AI: ['appenzell innerrhoden', 'appenzell inner rhodes'],
  SG: ['st gallen', 'saint gall'], GR: ['graubunden', 'grisons'], AG: ['aargau', 'argovie'], TG: ['thurgau', 'thurgovie'],
  TI: ['ticino', 'tessin'], VD: ['vaud'], VS: ['valais', 'wallis'], NE: ['neuchatel'], GE: ['geneva', 'geneve'], JU: ['jura'],
}
const normalizeRegion = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().toLowerCase()
function cityLocationKey(city: CityItem) {
  return [city.countryCode || city.country || '', city.region || '', city.label].join('|')
}
function countryCodeForCity(city: CityItem) {
  if (city.countryCode) return city.countryCode.toUpperCase()
  const country = props.countries.find(item => item.label === city.country)
  return country?.code?.toUpperCase() || ''
}
function regionForWorldShape(shape: WorldRegionShape) {
  const name = normalizeRegion(shape.name)
  return availableRegions.value.find(region => normalizeRegion(region.label) === name)
}
const inferredSwissRegions = computed<RegionItem[]>(() => (cantonMap.value?.cantons || [])
  .map((canton) => {
    const value = countryCities.value
      .filter(city => cityLocations.value[city.label]?.code === canton.code)
      .reduce((sum, city) => sum + city.value, 0)
    return { label: canton.name, country: selectedCountry.value?.label, value }
  })
  .filter(region => region.value > 0)
  .sort((left, right) => right.value - left.value))
const inferredCityRegions = computed<RegionItem[]>(() => {
  const values = new Map<string, number>()
  for (const city of countryCities.value) {
    if (!city.region || city.region === '(not set)') continue
    values.set(city.region, (values.get(city.region) || 0) + city.value)
  }
  return [...values].map(([label, value]) => ({
    label,
    value,
    country: selectedCountry.value?.label,
  })).sort((left, right) => right.value - left.value)
})
const availableRegions = computed(() => (
  selectedRegions.value.length
    ? selectedRegions.value
    : isSwitzerland.value && inferredSwissRegions.value.length
      ? inferredSwissRegions.value
      : inferredCityRegions.value
))
const selectedRegion = computed(() => availableRegions.value.find(region => region.label === selectedRegionLabel.value))
function regionForCanton(canton: CantonShape) {
  const aliases = cantonAliases[canton.code] || [normalizeRegion(canton.name)]
  return availableRegions.value.find(region => aliases.includes(normalizeRegion(region.label)))
}
const selectedCanton = computed(() => cantonMap.value?.cantons.find(canton => regionForCanton(canton)?.label === selectedRegionLabel.value))
const selectedWorldRegion = computed(() => worldRegionMap.value?.regions.find(shape => regionForWorldShape(shape)?.label === selectedRegionLabel.value))
const selectedRegionCities = computed(() => countryCities.value
  .filter(city => city.region === selectedRegionLabel.value || (
    isSwitzerland.value
    && selectedCanton.value
    && cityLocations.value[city.label]?.code === selectedCanton.value.code
  ))
  .sort((left, right) => right.value - left.value))
const selectedRegionVisitorCount = computed(() => (
  selectedRegion.value?.value
  || selectedRegionCities.value.reduce((sum, city) => sum + city.value, 0)
))
const selectedRegionShare = computed(() => {
  const countryTotal = selectedCountry.value?.value || 0
  return countryTotal ? Math.round(selectedRegionVisitorCount.value / countryTotal * 1000) / 10 : 0
})
const selectedCity = computed(() => selectedRegionCities.value.find(city => city.label === selectedCityLabel.value))
const level = computed<'world' | 'country' | 'region' | 'city'>(() => (
  selectedCity.value ? 'city' : selectedRegion.value ? 'region' : selectedCountry.value ? 'country' : 'world'
))
const geographicViewBox = computed(() => {
  if (level.value === 'world') return worldMap.viewBox
  if (level.value === 'country' && isSwitzerland.value && cantonMap.value) return cantonMap.value.viewBox
  if (level.value === 'country' && worldRegionMap.value) return worldRegionMap.value.viewBox
  if (level.value === 'country') return selectedViewBox.value
  if (selectedCanton.value) return selectedCanton.value.viewBox
  if (selectedWorldRegion.value) return selectedWorldRegion.value.viewBox
  return worldMap.viewBox
})
function viewBoxValues(viewBox: unknown): [number, number, number, number] | null {
  const values = String(viewBox).trim().split(/\s+/u).map(Number)
  return values.length === 4 && values.every(value => Number.isFinite(value))
    ? values as [number, number, number, number]
    : null
}

function unresolvedCountryMarkers(viewBox: unknown, resolvedValue: number, id: string): MapMarker[] {
  const remaining = Math.max(0, (selectedCountry.value?.value || 0) - resolvedValue)
  const values = viewBoxValues(viewBox)
  if (!remaining || !values) return []
  const [x, y, width, height] = values
  return [{
    id: `${id}:unresolved`,
    label: 'Localisation non précisée',
    context: selectedCountry.value?.label || 'Pays',
    value: remaining,
    x: x + width / 2,
    y: y + height / 2,
    kind: 'summary',
  }]
}
function fitMarkersViewBox(
  baseViewBox: unknown,
  markers: Array<{ x: number, y: number }>,
  allowSingle = false,
) {
  const base = viewBoxValues(baseViewBox)
  if (!base || !markers.length || (markers.length === 1 && !allowSingle)) return String(baseViewBox)
  const [baseX, baseY, baseWidth, baseHeight] = base
  const xs = markers.map(marker => marker.x)
  const ys = markers.map(marker => marker.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const minimumWidth = baseWidth / MAX_AUTOMATIC_ZOOM
  const minimumHeight = baseHeight / MAX_AUTOMATIC_ZOOM
  let width = Math.max(minimumWidth, (maxX - minX) * 1.45)
  let height = Math.max(minimumHeight, (maxY - minY) * 1.45)
  if (width / height < MAP_ASPECT_RATIO) width = height * MAP_ASPECT_RATIO
  else height = width / MAP_ASPECT_RATIO
  width = Math.min(baseWidth, width)
  height = Math.min(baseHeight, height)
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  const x = Math.min(baseX + baseWidth - width, Math.max(baseX, centerX - width / 2))
  const y = Math.min(baseY + baseHeight - height, Math.max(baseY, centerY - height / 2))
  return `${x} ${y} ${width} ${height}`
}
const defaultViewBox = computed(() => {
  return fitMarkersViewBox(
    geographicViewBox.value,
    visibleMarkers.value,
    level.value === 'city',
  )
})
const activeViewBox = computed(() => {
  const values = viewBoxValues(defaultViewBox.value)
  if (!values) return defaultViewBox.value
  const [x, y, width, height] = values
  const zoomedWidth = width / zoomLevel.value
  const zoomedHeight = height / zoomLevel.value
  const geographic = viewBoxValues(geographicViewBox.value)
  let nextX = x + (width - zoomedWidth) / 2 + panOffset.value.x
  let nextY = y + (height - zoomedHeight) / 2 + panOffset.value.y
  if (geographic) {
    const [baseX, baseY, baseWidth, baseHeight] = geographic
    nextX = Math.min(baseX + baseWidth - zoomedWidth, Math.max(baseX, nextX))
    nextY = Math.min(baseY + baseHeight - zoomedHeight, Math.max(baseY, nextY))
  }
  return [
    nextX,
    nextY,
    zoomedWidth,
    zoomedHeight,
  ].join(' ')
})
const displayViewBox = computed(() => animatedViewBox.value || activeViewBox.value)
const displayZoom = computed(() => {
  const base = viewBoxValues(geographicViewBox.value)
  const displayed = viewBoxValues(displayViewBox.value)
  return base && displayed ? Math.max(1, base[2] / displayed[2]) : 1
})

function worldMercatorY(latitude: number) {
  const limited = Math.max(-85, Math.min(85, latitude))
  return Math.log(Math.tan(Math.PI / 4 + limited * Math.PI / 360))
}

function projectWorldPoint(longitude: number, latitude: number) {
  const [,, width, height] = viewBoxValues(worldMap.viewBox) || [0, 0, 1010, 666]
  let normalizedLongitude = longitude
  if (normalizedLongitude < WORLD_GEO_BOUNDS.left) normalizedLongitude += 360
  const top = worldMercatorY(WORLD_GEO_BOUNDS.top)
  const bottom = worldMercatorY(WORLD_GEO_BOUNDS.bottom)
  return {
    x: (normalizedLongitude - WORLD_GEO_BOUNDS.left) / (WORLD_GEO_BOUNDS.right - WORLD_GEO_BOUNDS.left) * width,
    y: (top - worldMercatorY(latitude)) / (top - bottom) * height,
  }
}

function projectCountryPoint(location: WorldCityLocation) {
  const projection = worldRegionMap.value?.projection
  if (!projection) return null
  let longitude = location.longitude
  if (projection.crossesDateLine && longitude < 0) longitude += 360
  const mercatorY = worldMercatorY(location.latitude) * 180 / Math.PI
  return {
    x: projection.offsetX + (longitude - projection.minLongitude) * projection.scale,
    y: projection.offsetY + (projection.maxMercatorY - mercatorY) * projection.scale,
  }
}

function median(values: number[]) {
  const sorted = [...values].sort((left, right) => left - right)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2
}

function worldPointCenter(points: WorldRegionPoint[]) {
  const projected = points.map(point => projectWorldPoint(point.longitude, point.latitude))
  return projected.length
    ? { x: median(projected.map(point => point.x)), y: median(projected.map(point => point.y)) }
    : undefined
}

function analyticsRegionForPoint(point: WorldRegionPoint, country: string) {
  const name = normalizeRegion(point.name)
  return props.regions.find(region => (
    region.country === country
    && region.label !== '(not set)'
    && normalizeRegion(region.label) === name
  ))
}

const rawWorldMarkers = computed<MapMarker[]>(() => props.countries.flatMap<MapMarker>((country): MapMarker[] => {
  if (!country.code) return []
  const code = country.code.toLowerCase()
  const points = worldRegionPoints.value[code] || []
  if (DETAILED_WORLD_COUNTRIES.has(code)) {
    const cityMarkers = props.cities.flatMap((city): MapMarker[] => {
      if (countryCodeForCity(city).toLowerCase() !== code && city.country !== country.label) return []
      const location = worldCityLocations.value[cityLocationKey(city)]
      if (!location) return []
      const position = projectWorldPoint(location.longitude, location.latitude)
      return [{
        id: `${code}:city:${city.cityId || cityLocationKey(city)}`,
        label: city.label,
        context: city.region || country.label,
        value: city.value,
        x: position.x,
        y: position.y,
        kind: 'country',
        source: city,
        countryCode: code,
      }]
    })
    if (cityMarkers.length) return cityMarkers
  }
  if (DETAILED_WORLD_COUNTRIES.has(code) && points.length) {
    const regionalMarkers = points.flatMap((point) => {
      const region = analyticsRegionForPoint(point, country.label)
      if (!region) return []
      const position = projectWorldPoint(point.longitude, point.latitude)
      return [{
        id: `${code}:${point.id}`,
        label: region.label,
        context: country.label,
        value: region.value,
        x: position.x,
        y: position.y,
        kind: 'country' as const,
        source: region,
        countryCode: code,
      }]
    })
    if (regionalMarkers.length) return regionalMarkers
  }
  const center = worldPointCenter(points) || countryCenters.value[code]
  return center ? [{
    id: code,
    label: country.label,
    context: 'Monde',
    value: country.value,
    x: center.x,
    y: center.y,
    kind: 'country' as const,
    countryCode: code,
    countryCodes: DETAILED_WORLD_COUNTRIES.has(code) ? undefined : [code],
  }] : []
}))

function clusterSmallCountries(markers: MapMarker[]) {
  const fixed = markers.filter(marker => !marker.countryCodes?.length)
  const candidates = markers.filter(marker => marker.countryCodes?.length)
  const groups: MapMarker[][] = []
  const threshold = 30 / zoomLevel.value
  for (const marker of candidates) {
    const nearby = groups.find(group => group.some(item => Math.hypot(item.x - marker.x, item.y - marker.y) < threshold))
    if (nearby) nearby.push(marker)
    else groups.push([marker])
  }
  return fixed.concat(groups.map((group): MapMarker => {
    if (group.length === 1) return group[0]!
    const value = group.reduce((sum, marker) => sum + marker.value, 0)
    const codes = group.flatMap(marker => marker.countryCodes || [])
    return {
      id: `cluster:${codes.sort().join('-')}`,
      label: `${group.length} pays`,
      context: group.map(marker => marker.label).join(', '),
      value,
      x: group.reduce((sum, marker) => sum + marker.x * marker.value, 0) / value,
      y: group.reduce((sum, marker) => sum + marker.y * marker.value, 0) / value,
      kind: 'summary',
      countryCodes: codes,
    }
  }))
}

const worldMarkers = computed<MapMarker[]>(() => clusterSmallCountries(rawWorldMarkers.value))
const countryMarkers = computed<MapMarker[]>(() => {
  if (isSwitzerland.value && cantonMap.value) {
    const locatedCities = countryCities.value.flatMap((city): MapMarker[] => {
      const location = cityLocations.value[city.label]
      if (!location) return []
      const canton = cantonMap.value?.cantons.find(item => item.code === location.code)
      if (!canton) return []
      const region = regionForCanton(canton)
      if (!region) return []
      const point = projectSwissCity(location)
      return [{
        id: `${canton.code}-${city.label}`,
        label: city.label,
        context: canton.name,
        value: city.value,
        x: point.x,
        y: point.y,
        kind: 'region' as const,
        source: region,
      }]
    })
    if (locatedCities.length) {
      const locatedValue = locatedCities.reduce((sum, marker) => sum + marker.value, 0)
      return locatedCities.concat(unresolvedCountryMarkers(cantonMap.value.viewBox, locatedValue, 'ch'))
    }
    const regionalMarkers = cantonMap.value.cantons.flatMap((canton): MapMarker[] => {
      const region = regionForCanton(canton)
      return region ? [{
        id: canton.code,
        label: canton.name,
        context: selectedCountry.value?.label || 'Suisse',
        value: region.value,
        x: canton.x,
        y: canton.y,
        kind: 'region' as const,
        source: region,
      }] : []
    })
    if (regionalMarkers.length) {
      const locatedValue = regionalMarkers.reduce((sum, marker) => sum + marker.value, 0)
      return regionalMarkers.concat(unresolvedCountryMarkers(cantonMap.value.viewBox, locatedValue, 'ch'))
    }
    return unresolvedCountryMarkers(cantonMap.value.viewBox, 0, 'ch')
  }
  if (worldRegionMap.value) {
    const locatedCities = countryCities.value.flatMap((city): MapMarker[] => {
      const location = worldCityLocations.value[cityLocationKey(city)]
      if (!location) return []
      const point = projectCountryPoint(location)
      if (!point) return []
      return [{
        id: `city:${city.cityId || cityLocationKey(city)}`,
        label: city.label,
        context: city.region || selectedCountry.value?.label || '',
        value: city.value,
        x: point.x,
        y: point.y,
        kind: 'summary',
        source: city,
      }]
    })
    if (locatedCities.length) {
      const locatedValue = locatedCities.reduce((sum, marker) => sum + marker.value, 0)
      return locatedCities.concat(unresolvedCountryMarkers(worldRegionMap.value.viewBox, locatedValue, selectedCode.value))
    }
    const regionMarkers = worldRegionMap.value.regions.flatMap((shape): MapMarker[] => {
      const region = regionForWorldShape(shape)
      return region ? [{
        id: shape.id,
        label: shape.name,
        context: selectedCountry.value?.label || '',
        value: region.value,
        x: shape.x,
        y: shape.y,
        kind: 'region' as const,
        source: region,
      }] : []
    })
    if (regionMarkers.length) {
      const locatedValue = regionMarkers.reduce((sum, marker) => sum + marker.value, 0)
      return regionMarkers.concat(unresolvedCountryMarkers(worldRegionMap.value.viewBox, locatedValue, selectedCode.value))
    }
    return unresolvedCountryMarkers(worldRegionMap.value.viewBox, 0, selectedCode.value)
  }
  return selectedCountry.value ? [{
    id: selectedCode.value,
    label: selectedCountry.value.label,
    context: 'Pays',
    value: selectedCountry.value.value,
    x: selectedPathCenter.value.x,
    y: selectedPathCenter.value.y,
    kind: 'summary',
  }] : []
})
function projectSwissCity(location: CityLocation) {
  return {
    x: (location.longitude - 5.8) / (10.7 - 5.8) * 980,
    y: (47.95 - location.latitude) / (47.95 - 45.7) * 600,
  }
}
const regionMarkers = computed<MapMarker[]>(() => {
  if (!isSwitzerland.value) {
    const locatedCities = selectedRegionCities.value.flatMap((city): MapMarker[] => {
      const location = worldCityLocations.value[cityLocationKey(city)]
      if (!location) return []
      const point = projectCountryPoint(location)
      if (!point) return []
      return [{
        id: `city:${city.cityId || cityLocationKey(city)}`,
        label: city.label,
        context: selectedRegion.value?.label || selectedCountry.value?.label || '',
        value: city.value,
        x: point.x,
        y: point.y,
        kind: 'summary',
        source: city,
      }]
    })
    if (locatedCities.length) return locatedCities
    return selectedWorldRegion.value && selectedRegion.value ? [{
      id: selectedWorldRegion.value.id,
      label: selectedWorldRegion.value.name,
      context: selectedCountry.value?.label || '',
      value: selectedRegion.value.value,
      x: selectedWorldRegion.value.x,
      y: selectedWorldRegion.value.y,
      kind: 'summary' as const,
    }] : []
  }
  return selectedRegionCities.value.flatMap((city) => {
    const location = cityLocations.value[city.label]
    if (!location) return []
    const point = projectSwissCity(location)
    return [{
      id: `${location.code}-${city.label}`,
      label: city.label,
      context: selectedRegion.value?.label || selectedCountry.value?.label || '',
      value: city.value,
      x: point.x,
      y: point.y,
      kind: 'city' as const,
      source: city,
    }]
  })
})
const cityMarkers = computed<MapMarker[]>(() => {
  if (!selectedCity.value) return []
  const location = cityLocations.value[selectedCity.value.label]
  if (!location) return []
  const point = projectSwissCity(location)
  return [{
    id: `${location.code}-${selectedCity.value.label}`,
    label: selectedCity.value.label,
    context: selectedRegion.value?.label || selectedCountry.value?.label || '',
    value: selectedCity.value.value,
    x: point.x,
    y: point.y,
    kind: 'summary',
  }]
})
const visibleMarkers = computed(() => (
  level.value === 'world' ? worldMarkers.value
    : level.value === 'country' ? countryMarkers.value
      : level.value === 'region' ? regionMarkers.value
        : cityMarkers.value
))
const maximumMarkerValue = computed(() => Math.max(1, ...visibleMarkers.value.map(marker => marker.value)))
let zoomAnimationFrame = 0

function markerRadius(marker: MapMarker) {
  const ratio = Math.sqrt(marker.value / maximumMarkerValue.value)
  const baseRadius = 11 + ratio * 12
  return baseRadius / displayZoom.value
}

function markerLabelSize() {
  return 17 / displayZoom.value
}

function markerValueSize(marker: MapMarker) {
  const length = marker.value.toLocaleString('fr-CH').length
  return markerRadius(marker) * Math.min(1.05, 2.2 / Math.max(1, length))
}

function markerRank(marker: MapMarker) {
  return [...visibleMarkers.value]
    .sort((left, right) => right.value - left.value)
    .findIndex(item => item.id === marker.id) + 1
}

function markerAnimationDelay(marker: MapMarker) {
  const offset = [...marker.id].reduce((sum, character) => sum + character.codePointAt(0)!, 0) % 12
  return `${offset * -150}ms`
}

function zoomIn() {
  zoomLevel.value = Math.min(MAX_ZOOM, zoomLevel.value * ZOOM_STEP)
}

function zoomOut() {
  zoomLevel.value = Math.max(MIN_ZOOM, zoomLevel.value / ZOOM_STEP)
}

function startPan(event: PointerEvent) {
  if (event.button !== 0 || isZooming.value) return
  const target = event.target as Element | null
  if (target?.closest('.geo-zoom__marker')) return
  const svg = event.currentTarget as SVGSVGElement
  const viewBox = viewBoxValues(displayViewBox.value)
  if (!viewBox) return
  isPanning.value = true
  didPan.value = false
  panStart = {
    clientX: event.clientX,
    clientY: event.clientY,
    x: panOffset.value.x,
    y: panOffset.value.y,
    width: viewBox[2] / Math.max(1, svg.getBoundingClientRect().width),
    height: viewBox[3] / Math.max(1, svg.getBoundingClientRect().height),
  }
}

function movePan(event: PointerEvent) {
  if (!isPanning.value) return
  const deltaX = event.clientX - panStart.clientX
  const deltaY = event.clientY - panStart.clientY
  if (Math.hypot(deltaX, deltaY) > 3 && !didPan.value) {
    didPan.value = true
    const svg = event.currentTarget as SVGSVGElement
    if (!svg.hasPointerCapture(event.pointerId)) svg.setPointerCapture(event.pointerId)
  }
  panOffset.value = {
    x: panStart.x - deltaX * panStart.width,
    y: panStart.y - deltaY * panStart.height,
  }
}

function stopPan(event: PointerEvent) {
  if (!isPanning.value) return
  isPanning.value = false
  const svg = event.currentTarget as SVGSVGElement
  if (svg.hasPointerCapture(event.pointerId)) svg.releasePointerCapture(event.pointerId)
  if (didPan.value) setTimeout(() => { didPan.value = false }, 0)
}

function animateToViewBox(targetViewBox: string) {
  const start = viewBoxValues(displayViewBox.value)
  const target = viewBoxValues(targetViewBox)
  if (!start || !target || globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    animatedViewBox.value = targetViewBox
    return Promise.resolve()
  }
  isZooming.value = true
  hoveredMarker.value = null
  const startedAt = performance.now()
  return new Promise<void>((resolve) => {
    const frame = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / ZOOM_ANIMATION_MS)
      const eased = progress < .5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2
      animatedViewBox.value = start
        .map((value, index) => value + (target[index]! - value) * eased)
        .join(' ')
      if (progress < 1) zoomAnimationFrame = requestAnimationFrame(frame)
      else {
        isZooming.value = false
        resolve()
      }
    }
    zoomAnimationFrame = requestAnimationFrame(frame)
  })
}

function registerPath(code: string, element: unknown) {
  if (typeof SVGGraphicsElement === 'undefined') return
  if (element instanceof SVGGraphicsElement) pathElements.set(code, element)
  else pathElements.delete(code)
}

function measureCountryCenters() {
  const centers: Record<string, { x: number, y: number }> = {}
  for (const [code, element] of pathElements) {
    try {
      const box = element.getBBox()
      centers[code] = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
    }
    catch {
      // Un tracé non mesurable est simplement ignoré.
    }
  }
  countryCenters.value = centers
}

onMounted(() => {
  void nextTick(measureCountryCenters)
  void loadVisibleWorldRegionPoints()
  void loadWorldCityLocations()
})
onBeforeUnmount(() => cancelAnimationFrame(zoomAnimationFrame))
watch(
  () => props.countries.map(country => country.code).filter(Boolean).join(','),
  () => { if (import.meta.client) void loadVisibleWorldRegionPoints() },
)
watch(
  () => props.cities.slice(0, 5_000).map(cityLocationKey).join(','),
  () => { if (import.meta.client) void loadWorldCityLocations() },
)
watch(level, () => {
  zoomLevel.value = MIN_ZOOM
  panOffset.value = { x: 0, y: 0 }
})

function moveTooltip(event: MouseEvent) {
  const root = mapRoot.value
  if (!root) return
  const box = root.getBoundingClientRect()
  tooltipPosition.value = {
    left: Math.min(Math.max(8, event.clientX - box.left + 18), Math.max(8, box.width - 310)),
    top: Math.min(Math.max(8, event.clientY - box.top + 18), Math.max(8, box.height - 105)),
  }
}

function showMarker(marker: MapMarker, event?: MouseEvent) {
  hoveredMarker.value = marker
  if (event) moveTooltip(event)
}

async function loadSwissCantons() {
  if (cantonMap.value || cantonMapLoading.value) return
  cantonMapLoading.value = true
  cantonMapError.value = ''
  try {
    cantonMap.value = await $fetch<CantonResponse>('/api/admin/swiss-cantons')
  }
  catch {
    cantonMapError.value = 'La carte cantonale officielle est momentanément indisponible.'
  }
  finally {
    cantonMapLoading.value = false
  }
}

async function loadSwissCityLocations(requestedCities?: string[]) {
  const cities = requestedCities || countryCities.value.map(city => city.label)
  if (!cities.length) return
  try {
    const response = await $fetch<{ locations: Record<string, CityLocation> }>('/api/admin/swiss-city-cantons', {
      method: 'POST',
      body: { cities },
    })
    cityLocations.value = { ...cityLocations.value, ...response.locations }
  }
  catch {
    // La carte reste utilisable au niveau du pays.
  }
}

async function loadWorldCityLocations() {
  const cities = props.cities
    .slice(0, 5_000)
    .map(city => ({
      key: cityLocationKey(city),
      label: city.label,
      countryCode: countryCodeForCity(city),
    }))
    .filter(city => city.countryCode && !worldCityLocations.value[city.key])
  if (!cities.length) return
  const request = ++worldCityLocationRequest
  try {
    const response = await $fetch<{ locations: Record<string, WorldCityLocation> }>('/api/admin/city-locations', {
      method: 'POST',
      body: { cities },
      timeout: 30_000,
    })
    if (request === worldCityLocationRequest) {
      worldCityLocations.value = { ...worldCityLocations.value, ...response.locations }
    }
  }
  catch {
    // Le centre de la région reste utilisé lorsqu'une ville ne peut pas être localisée.
  }
}

async function loadWorldRegions(code: string, name: string) {
  const request = ++worldRegionRequest
  worldRegionMapLoading.value = true
  worldRegionMapError.value = ''
  worldRegionMap.value = null
  try {
    const response = await $fetch<WorldRegionResponse>('/api/admin/world-regions', {
      query: { code, name },
      timeout: 45_000,
    })
    if (request === worldRegionRequest) worldRegionMap.value = response
  }
  catch {
    if (request === worldRegionRequest) worldRegionMapError.value = 'Le découpage régional de ce pays est momentanément indisponible.'
  }
  finally {
    if (request === worldRegionRequest) worldRegionMapLoading.value = false
  }
}

async function loadWorldRegionPoints(code: string, name: string) {
  if (worldRegionPoints.value[code] || worldRegionPointRequests.has(code)) return
  worldRegionPointRequests.add(code)
  try {
    const response = await $fetch<WorldRegionPointResponse>('/api/admin/world-regions', {
      query: { code, name, centroids: 1 },
      timeout: 45_000,
    })
    worldRegionPoints.value = { ...worldRegionPoints.value, [code]: response.regions }
  }
  catch {
    // Le marqueur national mesuré sur la carte reste disponible.
  }
}

async function loadVisibleWorldRegionPoints() {
  const countriesToLoad = props.countries.filter(country => (
    country.code && DETAILED_WORLD_COUNTRIES.has(country.code.toLowerCase())
  ))
  await Promise.allSettled(countriesToLoad.map(country => (
    loadWorldRegionPoints(country.code!.toLowerCase(), country.label)
  )))
}

async function selectCountry(code: string) {
  if (isZooming.value) return
  const normalizedCode = code.toLowerCase()
  const country = countryData.value.get(normalizedCode)
  if (!country) return
  const path = pathElements.get(normalizedCode)
  if (path) {
    const box = path.getBBox()
    const padding = Math.max(5, Math.max(box.width, box.height) * .16)
    selectedViewBox.value = `${box.x - padding} ${box.y - padding} ${Math.max(10, box.width + padding * 2)} ${Math.max(10, box.height + padding * 2)}`
    selectedPathCenter.value = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  }
  if (normalizedCode === 'ch') {
    worldRegionRequest += 1
    worldRegionMap.value = null
    worldRegionMapLoading.value = false
    worldRegionMapError.value = ''
    void loadSwissCantons()
    void loadSwissCityLocations(props.cities
      .filter(city => city.country === country.label && city.label !== '(not set)')
      .map(city => city.label))
  }
  else {
    void loadWorldRegions(normalizedCode, country.label)
  }
  await animateToViewBox(String(selectedViewBox.value))
  selectedCode.value = normalizedCode
  selectedRegionLabel.value = ''
  selectedCityLabel.value = ''
  hoveredMarker.value = null
  animatedViewBox.value = null
}

function activateCountry(code: string) {
  if (!didPan.value) void selectCountry(code)
}

async function selectRegion(region: RegionItem) {
  if (isZooming.value) return
  const canton = cantonMap.value?.cantons.find(item => regionForCanton(item)?.label === region.label)
  if (canton) {
    const markers = countryCities.value.flatMap((city) => {
      const location = cityLocations.value[city.label]
      if (!location || (city.region !== region.label && location.code !== canton.code)) return []
      return [projectSwissCity(location)]
    })
    await animateToViewBox(fitMarkersViewBox(canton.viewBox, markers))
  }
  else {
    const shape = worldRegionMap.value?.regions.find(item => regionForWorldShape(item)?.label === region.label)
    if (shape) await animateToViewBox(shape.viewBox)
  }
  selectedRegionLabel.value = region.label
  selectedCityLabel.value = ''
  hoveredMarker.value = null
  animatedViewBox.value = null
}

function activateCanton(canton: CantonShape) {
  if (didPan.value) return
  const region = regionForCanton(canton)
  if (region) void selectRegion(region)
}

function activateWorldRegion(shape: WorldRegionShape) {
  if (didPan.value) return
  const region = regionForWorldShape(shape)
  if (region) void selectRegion(region)
}

async function selectCity(city: CityItem) {
  if (isZooming.value) return
  const location = cityLocations.value[city.label]
  if (location && selectedCanton.value) {
    await animateToViewBox(fitMarkersViewBox(
      selectedCanton.value.viewBox,
      [projectSwissCity(location)],
      true,
    ))
  }
  selectedCityLabel.value = city.label
  hoveredMarker.value = null
  animatedViewBox.value = null
}

function activateMarker(marker: MapMarker, event?: MouseEvent) {
  if (marker.kind === 'country') void selectCountry(marker.countryCode || marker.id)
  if (marker.kind === 'region' && marker.source) void selectRegion(marker.source as RegionItem)
  if (marker.kind === 'city' && marker.source) void selectCity(marker.source as CityItem)
  if (marker.kind === 'summary' && level.value === 'world' && (marker.countryCodes?.length || 0) > 1) {
    const values = viewBoxValues(defaultViewBox.value)
    if (values) {
      const [x, y, width, height] = values
      const nextZoom = Math.min(MAX_ZOOM, zoomLevel.value * 1.8)
      zoomLevel.value = nextZoom
      panOffset.value = {
        x: marker.x - (x + width / 2),
        y: marker.y - (y + height / 2),
      }
    }
    hoveredMarker.value = null
  }
  else if (marker.kind === 'summary') showMarker(marker, event)
}

function goWorld() {
  selectedCode.value = ''
  selectedRegionLabel.value = ''
  selectedCityLabel.value = ''
  hoveredMarker.value = null
}

function goCountry() {
  selectedRegionLabel.value = ''
  selectedCityLabel.value = ''
  hoveredMarker.value = null
}

function goRegion() {
  selectedCityLabel.value = ''
  hoveredMarker.value = null
}
</script>

<template>
  <div ref="map-root" class="geo-zoom">
    <nav class="geo-zoom__breadcrumb" aria-label="Navigation géographique">
      <button type="button" :aria-current="level === 'world' ? 'page' : undefined" @click="goWorld">Monde</button>
      <template v-if="selectedCountry">
        <span aria-hidden="true">›</span>
        <button type="button" :aria-current="level === 'country' ? 'page' : undefined" @click="goCountry">{{ selectedCountry.label }}</button>
      </template>
      <template v-if="selectedRegion">
        <span aria-hidden="true">›</span>
        <button type="button" :aria-current="level === 'region' ? 'page' : undefined" @click="goRegion">{{ selectedRegion.label }}</button>
      </template>
      <template v-if="selectedCity">
        <span aria-hidden="true">›</span>
        <button type="button" aria-current="page">{{ selectedCity.label }}</button>
      </template>
    </nav>

    <div class="geo-zoom__canvas" :class="{ 'is-zooming': isZooming }">
      <div class="geo-zoom__controls" aria-label="Contrôles de zoom">
        <button type="button" aria-label="Zoomer" title="Zoomer" :disabled="isZooming || zoomLevel >= MAX_ZOOM" @click="zoomIn">+</button>
        <button type="button" aria-label="Dézoomer" title="Dézoomer" :disabled="isZooming || zoomLevel <= MIN_ZOOM" @click="zoomOut">−</button>
      </div>
      <div class="geo-zoom__display-controls">
        <button
          type="button"
          class="geo-zoom__display-toggle"
          :aria-pressed="showLabels"
          @click="showLabels = !showLabels"
        >
          {{ showLabels ? 'Masquer les légendes' : 'Afficher les légendes' }}
        </button>
      </div>

      <svg
        v-if="level === 'world'"
        :viewBox="displayViewBox"
        :class="{ 'is-panning': isPanning }"
        role="img"
        aria-label="Carte mondiale des visiteurs"
        @pointerdown="startPan"
        @pointermove="movePan"
        @pointerup="stopPan"
        @pointercancel="stopPan"
      >
        <path
          v-for="location in worldMap.locations"
          :key="location.id"
          :ref="element => registerPath(location.id, element)"
          :d="location.path"
          class="geo-zoom__area"
          :class="{ 'has-data': countryData.has(location.id) }"
          :tabindex="countryData.has(location.id) ? 0 : undefined"
          :role="countryData.has(location.id) ? 'button' : undefined"
          :aria-label="countryData.has(location.id) ? `Zoomer sur ${countryData.get(location.id)?.label}` : undefined"
          @click="countryData.has(location.id) && activateCountry(location.id)"
          @keydown.enter.prevent="countryData.has(location.id) && activateCountry(location.id)"
        />
        <circle
          v-for="marker in worldMarkers"
          :key="marker.id"
          class="geo-zoom__marker"
          :cx="marker.x"
          :cy="marker.y"
          :r="markerRadius(marker)"
          :style="{ animationDelay: markerAnimationDelay(marker) }"
          tabindex="0"
          role="button"
          :aria-label="`${marker.label} : ${marker.value} visiteurs`"
          @mouseenter="showMarker(marker, $event)"
          @mousemove="showMarker(marker, $event)"
          @mouseleave="hoveredMarker = null"
          @focus="showMarker(marker)"
          @blur="hoveredMarker = null"
          @click="activateMarker(marker, $event)"
          @keydown.enter.prevent="activateMarker(marker)"
        />
        <text
          v-for="marker in worldMarkers"
          :key="`value-${marker.id}`"
          class="geo-zoom__marker-value"
          :x="marker.x"
          :y="marker.y"
          :font-size="markerValueSize(marker)"
        >{{ marker.value.toLocaleString('fr-CH') }}</text>
        <text
          v-for="marker in worldMarkers"
          :visibility="showLabels ? 'visible' : 'hidden'"
          :key="`label-${marker.id}`"
          class="geo-zoom__label"
          :x="marker.x + markerRadius(marker) * 1.3"
          :y="marker.y + markerLabelSize() * .35"
          :font-size="markerLabelSize()"
        >{{ marker.label }}</text>
      </svg>

      <svg
        v-else-if="level === 'country' && isSwitzerland && cantonMap"
        :viewBox="displayViewBox"
        :class="{ 'is-panning': isPanning }"
        role="img"
        aria-label="Carte des cantons suisses"
        @pointerdown="startPan"
        @pointermove="movePan"
        @pointerup="stopPan"
        @pointercancel="stopPan"
      >
        <path
          v-for="canton in cantonMap.cantons"
          :key="canton.code"
          :d="canton.path"
          class="geo-zoom__area"
          :class="{ 'has-data': regionForCanton(canton) }"
          fill-rule="evenodd"
          :tabindex="regionForCanton(canton) ? 0 : undefined"
          :role="regionForCanton(canton) ? 'button' : undefined"
          :aria-label="regionForCanton(canton) ? `Zoomer sur ${regionForCanton(canton)!.label}` : undefined"
          @click="activateCanton(canton)"
          @keydown.enter.prevent="activateCanton(canton)"
        />
        <circle
          v-for="marker in countryMarkers"
          :key="marker.id"
          class="geo-zoom__marker"
          :cx="marker.x"
          :cy="marker.y"
          :r="markerRadius(marker)"
          :style="{ animationDelay: markerAnimationDelay(marker) }"
          tabindex="0"
          role="button"
          :aria-label="`${marker.label} : ${marker.value} visiteurs`"
          @mouseenter="showMarker(marker, $event)"
          @mousemove="showMarker(marker, $event)"
          @mouseleave="hoveredMarker = null"
          @focus="showMarker(marker)"
          @blur="hoveredMarker = null"
          @click="activateMarker(marker, $event)"
          @keydown.enter.prevent="activateMarker(marker)"
        />
        <text
          v-for="marker in countryMarkers"
          :key="`value-${marker.id}`"
          class="geo-zoom__marker-value"
          :x="marker.x"
          :y="marker.y"
          :font-size="markerValueSize(marker)"
        >{{ marker.value.toLocaleString('fr-CH') }}</text>
        <text
          v-for="marker in countryMarkers"
          :visibility="showLabels ? 'visible' : 'hidden'"
          :key="`label-${marker.id}`"
          class="geo-zoom__label"
          :x="marker.x + markerRadius(marker) * 1.3"
          :y="marker.y + markerLabelSize() * .35"
          :font-size="markerLabelSize()"
        >{{ marker.label }}</text>
      </svg>

      <svg
        v-else-if="level === 'country' && worldRegionMap"
        :viewBox="displayViewBox"
        :class="{ 'is-panning': isPanning }"
        role="img"
        :aria-label="`Carte des régions de ${selectedCountry?.label}`"
        @pointerdown="startPan"
        @pointermove="movePan"
        @pointerup="stopPan"
        @pointercancel="stopPan"
      >
        <path
          v-for="region in worldRegionMap.regions"
          :key="region.id"
          :d="region.path"
          class="geo-zoom__area"
          :class="{ 'has-data': regionForWorldShape(region) }"
          fill-rule="evenodd"
          :tabindex="regionForWorldShape(region) ? 0 : undefined"
          :role="regionForWorldShape(region) ? 'button' : undefined"
          :aria-label="regionForWorldShape(region) ? `Zoomer sur ${regionForWorldShape(region)!.label}` : undefined"
          @click="activateWorldRegion(region)"
          @keydown.enter.prevent="activateWorldRegion(region)"
        />
        <circle
          v-for="marker in countryMarkers"
          :key="marker.id"
          class="geo-zoom__marker"
          :cx="marker.x"
          :cy="marker.y"
          :r="markerRadius(marker)"
          :style="{ animationDelay: markerAnimationDelay(marker) }"
          tabindex="0"
          role="button"
          :aria-label="`${marker.label} : ${marker.value} visiteurs`"
          @mouseenter="showMarker(marker, $event)"
          @mousemove="showMarker(marker, $event)"
          @mouseleave="hoveredMarker = null"
          @focus="showMarker(marker)"
          @blur="hoveredMarker = null"
          @click="activateMarker(marker, $event)"
          @keydown.enter.prevent="activateMarker(marker)"
        />
        <text
          v-for="marker in countryMarkers"
          :key="`value-${marker.id}`"
          class="geo-zoom__marker-value"
          :x="marker.x"
          :y="marker.y"
          :font-size="markerValueSize(marker)"
        >{{ marker.value.toLocaleString('fr-CH') }}</text>
        <text
          v-for="marker in countryMarkers"
          :visibility="showLabels ? 'visible' : 'hidden'"
          :key="`label-${marker.id}`"
          class="geo-zoom__label"
          :x="marker.x + markerRadius(marker) * 1.3"
          :y="marker.y + markerLabelSize() * .35"
          :font-size="markerLabelSize()"
        >{{ marker.label }}</text>
      </svg>

      <svg
        v-else-if="level === 'country' && selectedLocation"
        :viewBox="displayViewBox"
        :class="{ 'is-panning': isPanning }"
        role="img"
        :aria-label="`Carte de ${selectedCountry?.label}`"
        @pointerdown="startPan"
        @pointermove="movePan"
        @pointerup="stopPan"
        @pointercancel="stopPan"
      >
        <path :d="selectedLocation.path" class="geo-zoom__area" />
        <circle
          v-for="marker in countryMarkers"
          :key="marker.id"
          class="geo-zoom__marker"
          :cx="marker.x"
          :cy="marker.y"
          :r="markerRadius(marker)"
          :style="{ animationDelay: markerAnimationDelay(marker) }"
          tabindex="0"
          role="button"
          :aria-label="`${marker.label} : ${marker.value} visiteurs`"
          @mouseenter="showMarker(marker, $event)"
          @mousemove="showMarker(marker, $event)"
          @mouseleave="hoveredMarker = null"
          @focus="showMarker(marker)"
          @blur="hoveredMarker = null"
          @click="activateMarker(marker, $event)"
          @keydown.enter.prevent="activateMarker(marker)"
        />
        <text
          v-for="marker in countryMarkers"
          :key="`value-${marker.id}`"
          class="geo-zoom__marker-value"
          :x="marker.x"
          :y="marker.y"
          :font-size="markerValueSize(marker)"
        >{{ marker.value.toLocaleString('fr-CH') }}</text>
        <text
          v-for="marker in countryMarkers"
          :visibility="showLabels ? 'visible' : 'hidden'"
          :key="`label-${marker.id}`"
          class="geo-zoom__label"
          :x="marker.x + markerRadius(marker) * 1.3"
          :y="marker.y + markerLabelSize() * .35"
          :font-size="markerLabelSize()"
        >{{ marker.label }}</text>
      </svg>

      <svg
        v-else-if="level === 'region' && selectedWorldRegion"
        :viewBox="displayViewBox"
        :class="{ 'is-panning': isPanning }"
        role="img"
        :aria-label="`Carte de ${selectedRegion?.label}`"
        @pointerdown="startPan"
        @pointermove="movePan"
        @pointerup="stopPan"
        @pointercancel="stopPan"
      >
        <path :d="selectedWorldRegion.path" class="geo-zoom__area" fill-rule="evenodd" />
        <circle
          v-for="marker in regionMarkers"
          :key="marker.id"
          class="geo-zoom__marker"
          :cx="marker.x"
          :cy="marker.y"
          :r="markerRadius(marker)"
          :style="{ animationDelay: markerAnimationDelay(marker) }"
          tabindex="0"
          role="button"
          :aria-label="`${marker.label} : ${marker.value} visiteurs`"
          @mouseenter="showMarker(marker, $event)"
          @mousemove="showMarker(marker, $event)"
          @mouseleave="hoveredMarker = null"
          @focus="showMarker(marker)"
          @blur="hoveredMarker = null"
          @click="activateMarker(marker, $event)"
          @keydown.enter.prevent="activateMarker(marker)"
        />
        <text
          v-for="marker in regionMarkers"
          :key="`value-${marker.id}`"
          class="geo-zoom__marker-value"
          :x="marker.x"
          :y="marker.y"
          :font-size="markerValueSize(marker)"
        >{{ marker.value.toLocaleString('fr-CH') }}</text>
        <text
          v-for="marker in regionMarkers"
          :visibility="showLabels ? 'visible' : 'hidden'"
          :key="`label-${marker.id}`"
          class="geo-zoom__label"
          :x="marker.x + markerRadius(marker) * 1.3"
          :y="marker.y + markerLabelSize() * .35"
          :font-size="markerLabelSize()"
        >{{ marker.label }}</text>
      </svg>

      <svg
        v-else-if="(level === 'region' || level === 'city') && selectedCanton"
        :viewBox="displayViewBox"
        :class="{ 'is-panning': isPanning }"
        role="img"
        :aria-label="`Carte de ${selectedRegion?.label}`"
        @pointerdown="startPan"
        @pointermove="movePan"
        @pointerup="stopPan"
        @pointercancel="stopPan"
      >
        <path :d="selectedCanton.path" class="geo-zoom__area" fill-rule="evenodd" />
        <circle
          v-for="marker in visibleMarkers"
          :key="marker.id"
          class="geo-zoom__marker"
          :cx="marker.x"
          :cy="marker.y"
          :r="markerRadius(marker)"
          :style="{ animationDelay: markerAnimationDelay(marker) }"
          :tabindex="marker.kind === 'city' ? 0 : undefined"
          :role="marker.kind === 'city' ? 'button' : undefined"
          :aria-label="`${marker.label} : ${marker.value} visiteurs`"
          @mouseenter="showMarker(marker, $event)"
          @mousemove="showMarker(marker, $event)"
          @mouseleave="hoveredMarker = null"
          @focus="showMarker(marker)"
          @blur="hoveredMarker = null"
          @click="activateMarker(marker, $event)"
          @keydown.enter.prevent="activateMarker(marker)"
        />
        <text
          v-for="marker in visibleMarkers"
          :key="`value-${marker.id}`"
          class="geo-zoom__marker-value"
          :x="marker.x"
          :y="marker.y"
          :font-size="markerValueSize(marker)"
        >{{ marker.value.toLocaleString('fr-CH') }}</text>
        <text
          v-for="marker in visibleMarkers"
          :visibility="showLabels ? 'visible' : 'hidden'"
          :key="`label-${marker.id}`"
          class="geo-zoom__label"
          :x="marker.x + markerRadius(marker) * 1.3"
          :y="marker.y + markerLabelSize() * .35"
          :font-size="markerLabelSize()"
        >{{ marker.label }}</text>
      </svg>

      <div v-if="cantonMapLoading || worldRegionMapLoading" class="geo-zoom__loader" aria-label="Chargement de la carte" />
      <p v-else-if="cantonMapError && isSwitzerland" class="geo-zoom__empty">{{ cantonMapError }}</p>
      <p v-else-if="worldRegionMapError && !isSwitzerland" class="geo-zoom__empty">{{ worldRegionMapError }}</p>
      <p v-else-if="!countries.length" class="geo-zoom__empty">{{ notice || 'Aucune visite géolocalisée sur cette période.' }}</p>

      <aside v-if="level === 'region' && selectedRegion" class="geo-zoom__region-details">
        <div class="geo-zoom__region-heading">
          <div>
            <small>Région</small>
            <strong>{{ selectedRegion.label }}</strong>
          </div>
          <b>{{ selectedRegionVisitorCount.toLocaleString('fr-CH') }}</b>
        </div>
        <dl>
          <div>
            <dt>{{ realtime ? 'Visiteurs actifs' : 'Visiteurs' }}</dt>
            <dd>{{ selectedRegionVisitorCount.toLocaleString('fr-CH') }}</dd>
          </div>
          <div>
            <dt>Part du pays</dt>
            <dd>{{ selectedRegionShare.toLocaleString('fr-CH') }} %</dd>
          </div>
          <div>
            <dt>Villes détectées</dt>
            <dd>{{ selectedRegionCities.length }}</dd>
          </div>
        </dl>
        <ol v-if="selectedRegionCities.length">
          <li v-for="city in selectedRegionCities.slice(0, 8)" :key="cityLocationKey(city)">
            <span>{{ city.label }}</span>
            <strong>{{ city.value.toLocaleString('fr-CH') }}</strong>
          </li>
        </ol>
        <p v-else>GA4 ne fournit pas de ville plus précise pour ces visites.</p>
      </aside>
    </div>

    <div v-if="hoveredMarker" class="geo-zoom__tooltip" :style="tooltipPosition" aria-live="polite">
      <span class="geo-zoom__tooltip-rank">N° {{ markerRank(hoveredMarker) }}</span>
      <strong>{{ hoveredMarker.label }}</strong>
      <b>{{ hoveredMarker.value.toLocaleString('fr-CH') }}</b>
      <small>{{ hoveredMarker.context }} · visiteur{{ hoveredMarker.value > 1 ? 's' : '' }}</small>
    </div>
  </div>

  <small class="geo-zoom__credit">
    Fond mondial : <a href="https://github.com/VictorCazanave/svg-maps/tree/master/packages/world" target="_blank" rel="noopener">SVG Maps – World</a>, licence <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>.
    Contours et coordonnées suisses : <a href="https://www.swisstopo.admin.ch/fr/modele-du-pays-swissboundaries3d" target="_blank" rel="noopener">Office fédéral de topographie swisstopo</a>.
    Régions mondiales : <a href="https://www.geoboundaries.org/" target="_blank" rel="noopener">geoBoundaries</a>, licence CC BY 4.0.
  </small>
</template>

<style scoped>
.geo-zoom{position:relative;min-width:0;margin-top:16px;overflow:hidden;border:1px solid var(--admin-border);border-radius:16px;background:linear-gradient(160deg,#edf8fa,#dceff2)}.geo-zoom__breadcrumb{display:flex;min-height:52px;padding:9px 13px;align-items:center;gap:7px;border-bottom:1px solid var(--admin-border);background:var(--admin-surface,#fff)}.geo-zoom__breadcrumb button{padding:6px 9px;border:0;border-radius:8px;color:var(--admin-blue);background:transparent;cursor:pointer;font:inherit;font-weight:800}.geo-zoom__breadcrumb button:hover,.geo-zoom__breadcrumb button:focus-visible{background:#e5f3f6;outline:none}.geo-zoom__breadcrumb button[aria-current='page']{color:var(--admin-navy);background:#edf5f6}.geo-zoom__breadcrumb span{color:var(--admin-muted)}.geo-zoom__canvas{position:relative;display:grid;min-height:520px;place-items:center}.geo-zoom__canvas>svg{display:block;width:100%;height:520px;padding:20px}.geo-zoom__controls{position:absolute;z-index:4;top:14px;right:14px;display:grid;overflow:hidden;border:1px solid #b7ccd2;border-radius:9px;background:#fff;box-shadow:0 3px 12px rgb(18 63 75 / 16%)}.geo-zoom__controls button{display:grid;width:38px;height:38px;padding:0;place-items:center;color:#173f4b;background:#fff;border:0;font:700 1.45rem/1 sans-serif;cursor:pointer}.geo-zoom__controls button+button{border-top:1px solid #d3e0e3}.geo-zoom__controls button:hover:not(:disabled),.geo-zoom__controls button:focus-visible{z-index:1;color:#fff;background:#087f98;outline:none}.geo-zoom__controls button:disabled{color:#aab8bc;cursor:not-allowed;background:#f3f6f7}.geo-zoom__area{fill:#d8e7e9;stroke:#fff;stroke-width:1;vector-effect:non-scaling-stroke;transition:fill .15s ease}.geo-zoom__area:focus{outline:none}.geo-zoom__area.has-data{cursor:pointer}.geo-zoom__area.has-data:hover,.geo-zoom__area.has-data:focus{fill:#c4dde1;stroke:#087f98;stroke-width:3}.geo-zoom__marker{fill:#087f98;fill-opacity:.78;stroke:#fff;stroke-width:2.5;vector-effect:non-scaling-stroke;cursor:pointer;transform-box:fill-box;transform-origin:center;animation:geo-marker-pulse 1.8s ease-in-out infinite;transition:fill .15s ease,fill-opacity .15s ease,stroke-width .15s ease}.geo-zoom__marker:hover,.geo-zoom__marker:focus{fill:#005f76;fill-opacity:.95;stroke-width:4;outline:none;animation-play-state:paused;transform:scale(1.08)}.geo-zoom__tooltip{position:absolute;z-index:10;display:grid;min-width:165px;padding:9px 12px;gap:2px;border-radius:9px;color:#fff;background:rgb(9 43 52 / 95%);box-shadow:0 5px 18px rgb(0 0 0 / 18%);pointer-events:none}.geo-zoom__tooltip span,.geo-zoom__tooltip b{font-size:.77rem}.geo-zoom__loader{width:34px;height:34px;border:4px solid #b8dce2;border-top-color:#087f98;border-radius:50%;animation:geo-spin .8s linear infinite}.geo-zoom__empty{margin:0;padding:20px;color:var(--admin-muted);text-align:center}.geo-zoom__credit{display:block;margin:6px 2px 0;color:var(--admin-muted);font-size:.66rem;text-align:right}.geo-zoom__credit a{color:inherit}@keyframes geo-spin{to{transform:rotate(360deg)}}@keyframes geo-marker-pulse{0%,100%{transform:scale(.9);fill-opacity:.68;stroke-opacity:.72}50%{transform:scale(1.12);fill-opacity:.95;stroke-opacity:1}}:global(:root[data-theme='dark']) .geo-zoom{background:linear-gradient(160deg,#203a42,#172b31)}:global(:root[data-theme='dark']) .geo-zoom__breadcrumb{background:#1a2c31}:global(:root[data-theme='dark']) .geo-zoom__breadcrumb button:hover,:global(:root[data-theme='dark']) .geo-zoom__breadcrumb button:focus-visible,:global(:root[data-theme='dark']) .geo-zoom__breadcrumb button[aria-current='page']{background:#294149}:global(:root[data-theme='dark']) .geo-zoom__controls{border-color:#49646c;background:#1b3036}:global(:root[data-theme='dark']) .geo-zoom__controls button{color:#d7edf1;background:#1b3036}:global(:root[data-theme='dark']) .geo-zoom__controls button+button{border-color:#49646c}:global(:root[data-theme='dark']) .geo-zoom__controls button:hover:not(:disabled),:global(:root[data-theme='dark']) .geo-zoom__controls button:focus-visible{color:#fff;background:#087f98}:global(:root[data-theme='dark']) .geo-zoom__controls button:disabled{color:#63777c;background:#15272c}:global(:root[data-theme='dark']) .geo-zoom__area{fill:#31484e;stroke:#17292e}
.geo-zoom__canvas.is-zooming{cursor:progress}.geo-zoom__canvas.is-zooming>svg{pointer-events:none}
.geo-zoom__canvas>svg{cursor:grab;touch-action:none;user-select:none}.geo-zoom__canvas>svg.is-panning{cursor:grabbing}.geo-zoom__display-controls{position:absolute;z-index:4;right:14px;bottom:14px;display:grid;justify-items:end;gap:8px}.geo-zoom__display-toggle{padding:9px 12px;border:1px solid #b7ccd2;border-radius:9px;color:#173f4b;background:#fff;box-shadow:0 3px 12px rgb(18 63 75 / 16%);font:inherit;font-size:.78rem;font-weight:800;cursor:pointer}.geo-zoom__display-toggle:hover,.geo-zoom__display-toggle:focus-visible{color:#fff;background:#087f98;outline:none}.geo-zoom__marker-value{fill:#fff;stroke:#05657a;stroke-width:.7px;paint-order:stroke;vector-effect:non-scaling-stroke;text-anchor:middle;dominant-baseline:central;font-weight:850;pointer-events:none}.geo-zoom__label{fill:#2d3439;stroke:#edf8fa;stroke-width:3px;paint-order:stroke;stroke-linejoin:round;vector-effect:non-scaling-stroke;font-weight:750;letter-spacing:-.02em;pointer-events:none}.geo-zoom__tooltip{grid-template-columns:auto minmax(0,1fr) auto;min-width:290px;padding:16px 18px;align-items:baseline;gap:5px 12px;border:1px solid #d5dce0;border-radius:14px;color:#20262b;background:#fff;box-shadow:0 8px 24px rgb(17 36 43 / 22%)}.geo-zoom__tooltip strong{overflow:hidden;font-size:1rem;text-overflow:ellipsis;white-space:nowrap}.geo-zoom__tooltip b{font-size:1rem}.geo-zoom__tooltip-rank{font-size:.88rem;font-weight:800;white-space:nowrap}.geo-zoom__tooltip small{grid-column:2/-1;color:#607078;font-size:.72rem;font-weight:650}:global(:root[data-theme='dark']) .geo-zoom__display-toggle{border-color:#49646c;color:#d7edf1;background:#1b3036}:global(:root[data-theme='dark']) .geo-zoom__display-toggle:hover,:global(:root[data-theme='dark']) .geo-zoom__display-toggle:focus-visible{color:#fff;background:#087f98}:global(:root[data-theme='dark']) .geo-zoom__label{fill:#e7f0f2;stroke:#203a42}:global(:root[data-theme='dark']) .geo-zoom__tooltip{border-color:#71848a;color:#17292e;background:#f7fbfc}
.geo-zoom__region-details{position:absolute;z-index:5;left:14px;bottom:14px;display:grid;width:min(320px,calc(100% - 28px));max-height:calc(100% - 28px);padding:15px;gap:11px;overflow:auto;border:1px solid #b7ccd2;border-radius:13px;color:#173f4b;background:rgb(255 255 255 / 96%);box-shadow:0 7px 24px rgb(18 63 75 / 20%)}.geo-zoom__region-heading{display:flex;align-items:center;justify-content:space-between;gap:12px}.geo-zoom__region-heading>div{display:grid}.geo-zoom__region-heading small{color:#66808a;font-size:.68rem;font-weight:850;text-transform:uppercase;letter-spacing:.06em}.geo-zoom__region-heading strong{font-size:1.05rem}.geo-zoom__region-heading>b{font-size:1.7rem;color:#087f98}.geo-zoom__region-details dl,.geo-zoom__region-details ol{margin:0}.geo-zoom__region-details dl{display:grid;gap:5px}.geo-zoom__region-details dl>div,.geo-zoom__region-details li{display:flex;align-items:center;justify-content:space-between;gap:12px}.geo-zoom__region-details dl>div{padding:5px 0;border-bottom:1px solid #e0eaed}.geo-zoom__region-details dt{color:#5b737c}.geo-zoom__region-details dd{margin:0;font-weight:850}.geo-zoom__region-details ol{display:grid;padding:0;list-style:none}.geo-zoom__region-details li{padding:6px 0;border-bottom:1px solid #e7eef0}.geo-zoom__region-details li:last-child{border:0}.geo-zoom__region-details p{margin:0;color:#5b737c;font-size:.78rem}:global(:root[data-theme='dark']) .geo-zoom__region-details{border-color:#49646c;color:#d7edf1;background:rgb(27 48 54 / 96%)}:global(:root[data-theme='dark']) .geo-zoom__region-details small,:global(:root[data-theme='dark']) .geo-zoom__region-details dt,:global(:root[data-theme='dark']) .geo-zoom__region-details p{color:#aac0c6}:global(:root[data-theme='dark']) .geo-zoom__region-details dl>div,:global(:root[data-theme='dark']) .geo-zoom__region-details li{border-color:#3d5860}
@media(prefers-reduced-motion:reduce){.geo-zoom__marker{animation:none}.geo-zoom__marker:hover,.geo-zoom__marker:focus{transform:none}}
@media(max-width:650px){.geo-zoom__canvas,.geo-zoom__canvas>svg{min-height:410px;height:410px}.geo-zoom__canvas>svg{padding:8px}.geo-zoom__breadcrumb{overflow-x:auto;white-space:nowrap}}
</style>
