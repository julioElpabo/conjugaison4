import { d as defineEventHandler, b as useRuntimeConfig, a9 as SUPPORTED_LOCALES, aa as listPublishedChallengePublications, u as useDatabase, ab as setHeader, ac as localizePath } from '../nitro/nitro.mjs';
import { M as MODE_TENSE_PATHS } from '../_/mode-tense-pages.mjs';
import { T as TENSE_EXERCISE_PATHS } from '../_/tense-exercise-pages.mjs';
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
  "/exercices-de-conjugaison",
  "/conjugaison-fle",
  "/apprendre",
  "/consulter",
  ...TENSE_EXERCISE_PATHS,
  ...MODE_TENSE_PATHS
];
function escapeXml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}
const sitemap_xml_get = defineEventHandler(async (event) => {
  var _a;
  const config = useRuntimeConfig(event);
  const siteUrl = String(config.public.siteUrl).replace(/\/$/u, "");
  const absoluteUrl = (path, locale) => `${siteUrl}${localizePath(path, locale)}`;
  const staticEntries = PUBLIC_PATHS.flatMap((path) => SUPPORTED_LOCALES.map((locale) => {
    const alternates = [
      ...SUPPORTED_LOCALES.map((alternate) => `<xhtml:link rel="alternate" hreflang="${alternate}" href="${escapeXml(absoluteUrl(path, alternate))}" />`),
      `<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(absoluteUrl(path, "fr"))}" />`
    ].join("");
    return `<url><loc>${escapeXml(absoluteUrl(path, locale))}</loc>${alternates}</url>`;
  })).join("");
  let dynamicEntries = "";
  try {
    const publications = await listPublishedChallengePublications(useDatabase());
    const groups = /* @__PURE__ */ new Map();
    for (const publication of publications) {
      const group = (_a = groups.get(publication.presetId)) != null ? _a : [];
      group.push(publication);
      groups.set(publication.presetId, group);
    }
    dynamicEntries = [...groups.values()].flatMap((group) => {
      var _a2;
      const defaultPublication = (_a2 = group.find((publication) => publication.locale === "fr")) != null ? _a2 : group[0];
      if (!defaultPublication) return [];
      const alternates = group.map((alternate) => `<xhtml:link rel="alternate" hreflang="${alternate.locale}" href="${escapeXml(`${siteUrl}/${alternate.locale}/defis/${alternate.slug}`)}" />`).join("") + `<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(`${siteUrl}/${defaultPublication.locale}/defis/${defaultPublication.slug}`)}" />`;
      return group.map((publication) => `<url><loc>${escapeXml(`${siteUrl}/${publication.locale}/defis/${publication.slug}`)}</loc><lastmod>${escapeXml(publication.updatedAt.slice(0, 10))}</lastmod>${alternates}</url>`);
    }).join("");
  } catch (error) {
    console.error("[sitemap] Impossible de charger les publications de d\xE9fis.", error);
  }
  setHeader(event, "content-type", "application/xml; charset=utf-8");
  setHeader(event, "cache-control", "public, max-age=3600");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${staticEntries}${dynamicEntries}</urlset>`;
});

export { sitemap_xml_get as default };
//# sourceMappingURL=sitemap.xml.get.mjs.map
