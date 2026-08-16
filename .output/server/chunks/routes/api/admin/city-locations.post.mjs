import { d as defineEventHandler, r as readBody } from '../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../_/session.mjs';
import cities from 'all-the-cities';
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

let cityIndex = null;
function normalized(value) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").replace(/[’']/gu, " ").replace(/[^\p{L}\p{N}]+/gu, " ").trim().toLowerCase();
}
function indexKey(countryCode, name) {
  return `${countryCode.toUpperCase()}:${normalized(name)}`;
}
function citiesByName() {
  if (cityIndex) return cityIndex;
  const index = /* @__PURE__ */ new Map();
  for (const city of cities) {
    const names = new Set([city.name, ...(city.altName || "").split(",")].filter(Boolean));
    for (const name of names) {
      const key = indexKey(city.country, name);
      const matches = index.get(key) || [];
      matches.push(city);
      index.set(key, matches);
    }
  }
  for (const matches of index.values()) {
    matches.sort((left, right) => right.population - left.population);
  }
  cityIndex = index;
  return index;
}
const cityLocations_post = defineEventHandler(async (event) => {
  var _a;
  requireAdministrator(event);
  const body = await readBody(event);
  const requested = Array.isArray(body == null ? void 0 : body.cities) ? body.cities.slice(0, 5e3) : [];
  const index = citiesByName();
  const locations = {};
  for (const item of requested) {
    const key = typeof item.key === "string" ? item.key.slice(0, 500) : "";
    const label = typeof item.label === "string" ? item.label.slice(0, 200) : "";
    const countryCode = typeof item.countryCode === "string" ? item.countryCode.slice(0, 2).toUpperCase() : "";
    if (!key || !label || !/^[A-Z]{2}$/u.test(countryCode) || label === "(not set)") continue;
    const city = (_a = index.get(indexKey(countryCode, label))) == null ? void 0 : _a[0];
    const longitude = Number(city == null ? void 0 : city.loc.coordinates[0]);
    const latitude = Number(city == null ? void 0 : city.loc.coordinates[1]);
    if (Number.isFinite(longitude) && Number.isFinite(latitude)) locations[key] = { latitude, longitude };
  }
  return { locations };
});

export { cityLocations_post as default };
//# sourceMappingURL=city-locations.post.mjs.map
