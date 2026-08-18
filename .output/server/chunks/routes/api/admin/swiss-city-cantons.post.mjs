import { d as defineEventHandler, r as readBody } from '../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../_/session.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'web-push';
import 'mysql2/promise';
import 'node:fs/promises';
import 'node:url';

const CANTON_CODES = /* @__PURE__ */ new Set([
  "AG",
  "AI",
  "AR",
  "BE",
  "BL",
  "BS",
  "FR",
  "GE",
  "GL",
  "GR",
  "JU",
  "LU",
  "NE",
  "NW",
  "OW",
  "SG",
  "SH",
  "SO",
  "SZ",
  "TG",
  "TI",
  "UR",
  "VD",
  "VS",
  "ZG",
  "ZH"
]);
const cache = /* @__PURE__ */ new Map();
function normalized(value) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").trim().toLowerCase();
}
function cityLocation(result) {
  var _a, _b, _c, _d, _e;
  const detail = ((_a = result.attrs) == null ? void 0 : _a.detail) || "";
  const label = ((_b = result.attrs) == null ? void 0 : _b.label) || "";
  const match = detail.match(/\s([a-z]{2})$/iu) || label.match(/\(([A-Z]{2})\)/u);
  const code = ((_c = match == null ? void 0 : match[1]) == null ? void 0 : _c.toUpperCase()) || "";
  const latitude = Number((_d = result.attrs) == null ? void 0 : _d.lat);
  const longitude = Number((_e = result.attrs) == null ? void 0 : _e.lon);
  return CANTON_CODES.has(code) && Number.isFinite(latitude) && Number.isFinite(longitude) ? { code, latitude, longitude } : null;
}
async function resolveCity(name) {
  var _a;
  const key = normalized(name);
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.location;
  const params = new URLSearchParams({
    searchText: name,
    type: "locations",
    origins: "gg25,zipcode",
    limit: "5",
    sr: "4326"
  });
  const response = await fetch(`https://api3.geo.admin.ch/rest/services/ech/SearchServer?${params}`);
  if (!response.ok) return null;
  const payload = await response.json();
  const location = ((_a = payload.results) == null ? void 0 : _a.map(cityLocation).find(Boolean)) || null;
  cache.set(key, { location, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1e3 });
  return location;
}
const swissCityCantons_post = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const body = await readBody(event);
  const cities = Array.isArray(body == null ? void 0 : body.cities) ? [...new Set(body.cities.filter((city) => typeof city === "string").map((city) => city.trim()).filter((city) => city && city !== "(not set)").slice(0, 100))] : [];
  const entries = await Promise.all(cities.map(async (city) => [city, await resolveCity(city)]));
  return { locations: Object.fromEntries(entries.filter((entry) => Boolean(entry[1]))) };
});

export { swissCityCantons_post as default };
//# sourceMappingURL=swiss-city-cantons.post.mjs.map
