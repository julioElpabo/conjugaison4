import { MODE_TENSE_PATHS } from '../../shared/data/mode-tense-pages'
import { TENSE_EXERCISE_PATHS } from '../../shared/data/tense-exercise-pages'
import { localeLanguageTag, localizePath, SUPPORTED_LOCALES, type AppLocale } from '../../shared/i18n/locales'
import { listPublishedChallengePublications } from '../services/challenge-publications'

const PUBLIC_PATHS = [
  '/',
  '/exercices-de-conjugaison',
  '/conjugaison-fle',
  '/apprendre',
  '/consulter',
  ...TENSE_EXERCISE_PATHS,
  ...MODE_TENSE_PATHS,
]

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const siteUrl = String(config.public.siteUrl).replace(/\/$/u, '')
  const absoluteUrl = (path: string, locale: AppLocale) => `${siteUrl}${localizePath(path, locale)}`

  const staticEntries = PUBLIC_PATHS.flatMap(path => SUPPORTED_LOCALES.map(locale => {
    const alternates = [
      ...SUPPORTED_LOCALES.map(alternate => (
        `<xhtml:link rel="alternate" hreflang="${localeLanguageTag(alternate)}" href="${escapeXml(absoluteUrl(path, alternate))}" />`
      )),
      `<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(absoluteUrl(path, 'fr'))}" />`,
    ].join('')
    return `<url><loc>${escapeXml(absoluteUrl(path, locale))}</loc>${alternates}</url>`
  })).join('')

  let dynamicEntries = ''
  try {
    const publications = await listPublishedChallengePublications(useDatabase())
    const groups = new Map<number, typeof publications>()
    for (const publication of publications) {
      const group = groups.get(publication.presetId) ?? []
      group.push(publication)
      groups.set(publication.presetId, group)
    }
    dynamicEntries = [...groups.values()].flatMap((group) => {
      const defaultPublication = group.find(publication => publication.locale === 'fr') ?? group[0]
      if (!defaultPublication) return []
      const alternates = group.map(alternate => (
        `<xhtml:link rel="alternate" hreflang="${localeLanguageTag(alternate.locale)}" href="${escapeXml(`${siteUrl}/${alternate.locale}/defis/${alternate.slug}`)}" />`
      )).join('') + `<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(`${siteUrl}/${defaultPublication.locale}/defis/${defaultPublication.slug}`)}" />`
      return group.map(publication => `<url><loc>${escapeXml(`${siteUrl}/${publication.locale}/defis/${publication.slug}`)}</loc><lastmod>${escapeXml(publication.updatedAt.slice(0, 10))}</lastmod>${alternates}</url>`)
    }).join('')
  }
  catch (error) {
    console.error('[sitemap] Impossible de charger les publications de défis.', error)
  }

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=3600')
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${staticEntries}${dynamicEntries}</urlset>`
})
