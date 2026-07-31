import { d as defineEventHandler, n as useRuntimeConfig, S as SUPPORTED_LOCALES, R as setHeader, T as localizePath } from '../nitro/nitro.mjs';
import { E as EXERCISE_LANDING_SLUGS } from '../_/exercise-landing-pages.mjs';
import { M as MODE_LANDING_SLUGS } from '../_/mode-landing-pages.mjs';
import { M as MODE_TENSE_PATHS } from '../_/mode-tense-pages.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mysql2/promise';
import 'node:fs/promises';
import 'node:url';

const PUBLIC_PATHS = [
  "/",
  "/apprendre",
  "/consulter",
  ...EXERCISE_LANDING_SLUGS.map((slug) => `/exercices/${slug}`),
  ...MODE_LANDING_SLUGS.map((slug) => `/modes/${slug}`),
  ...MODE_TENSE_PATHS
];
function escapeXml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}
const sitemap_xml_get = defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const siteUrl = String(config.public.siteUrl).replace(/\/$/u, "");
  const absoluteUrl = (path, locale) => `${siteUrl}${localizePath(path, locale)}`;
  const entries = PUBLIC_PATHS.flatMap((path) => SUPPORTED_LOCALES.map((locale) => {
    const alternates = [
      ...SUPPORTED_LOCALES.map((alternate) => `<xhtml:link rel="alternate" hreflang="${alternate}" href="${escapeXml(absoluteUrl(path, alternate))}" />`),
      `<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(absoluteUrl(path, "fr"))}" />`
    ].join("");
    return `<url><loc>${escapeXml(absoluteUrl(path, locale))}</loc>${alternates}</url>`;
  })).join("");
  setHeader(event, "content-type", "application/xml; charset=utf-8");
  setHeader(event, "cache-control", "public, max-age=3600");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries}</urlset>`;
});

export { sitemap_xml_get as default };
//# sourceMappingURL=sitemap.xml.get.mjs.map
