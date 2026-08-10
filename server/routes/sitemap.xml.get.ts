import { MODE_TENSE_PATHS } from '../../shared/data/mode-tense-pages'
import { localizePath, SUPPORTED_LOCALES, type AppLocale } from '../../shared/i18n/locales'

const PUBLIC_PATHS = [
  '/',
  '/exercices-de-conjugaison',
  '/apprendre',
  '/consulter',
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

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const siteUrl = String(config.public.siteUrl).replace(/\/$/u, '')
  const absoluteUrl = (path: string, locale: AppLocale) => `${siteUrl}${localizePath(path, locale)}`

  const entries = PUBLIC_PATHS.flatMap(path => SUPPORTED_LOCALES.map(locale => {
    const alternates = [
      ...SUPPORTED_LOCALES.map(alternate => (
        `<xhtml:link rel="alternate" hreflang="${alternate}" href="${escapeXml(absoluteUrl(path, alternate))}" />`
      )),
      `<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(absoluteUrl(path, 'fr'))}" />`,
    ].join('')
    return `<url><loc>${escapeXml(absoluteUrl(path, locale))}</loc>${alternates}</url>`
  })).join('')

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=3600')
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries}</urlset>`
})
