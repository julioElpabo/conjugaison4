import { d as defineEventHandler, a as getQuery, c as createError } from '../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../_/session.mjs';
import countries from 'i18n-iso-countries';
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

const WIDTH = 1e3;
const HEIGHT = 600;
const METADATA_URL = "https://www.geoboundaries.org/api/current/gbOpen/ALL/ADM1/";
let metadataCache = null;
const countryCache = /* @__PURE__ */ new Map();
function normalized(value) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim().toLowerCase();
}
async function metadata() {
  if (metadataCache && metadataCache.expiresAt > Date.now()) return metadataCache.rows;
  const response = await fetch(METADATA_URL, { signal: AbortSignal.timeout(12e3) });
  if (!response.ok) throw new Error(`M\xE9tadonn\xE9es geoBoundaries indisponibles (${response.status})`);
  const rows = await response.json();
  metadataCache = { rows, expiresAt: Date.now() + 24 * 60 * 60 * 1e3 };
  return rows;
}
function coordinates(feature) {
  if (!feature.geometry) return [];
  return feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;
}
function allPoints(features) {
  return features.flatMap((feature) => coordinates(feature).flat(2));
}
function mercatorY(latitude) {
  const limited = Math.max(-85, Math.min(85, latitude));
  return Math.log(Math.tan(Math.PI / 4 + limited * Math.PI / 360)) * 180 / Math.PI;
}
function projection(features) {
  const points = allPoints(features);
  const longitudes = points.map((point) => point[0]);
  const crossesDateLine = Math.max(...longitudes) - Math.min(...longitudes) > 180;
  const longitude = (value) => crossesDateLine && value < 0 ? value + 360 : value;
  const xs = longitudes.map(longitude);
  const ys = points.map((point) => mercatorY(point[1]));
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = Math.max(1e-4, maxX - minX);
  const spanY = Math.max(1e-4, maxY - minY);
  const scale = Math.min((WIDTH - 40) / spanX, (HEIGHT - 40) / spanY);
  const renderedWidth = spanX * scale;
  const renderedHeight = spanY * scale;
  const offsetX = (WIDTH - renderedWidth) / 2;
  const offsetY = (HEIGHT - renderedHeight) / 2;
  return {
    project: (point) => [
      offsetX + (longitude(point[0]) - minX) * scale,
      offsetY + (maxY - mercatorY(point[1])) * scale
    ],
    metadata: {
      crossesDateLine,
      minLongitude: minX,
      maxMercatorY: maxY,
      scale,
      offsetX,
      offsetY
    }
  };
}
function geographicCenter(polygons) {
  const points = polygons.flat(2);
  const longitudes = points.map((point) => point[0]);
  const crossesDateLine = Math.max(...longitudes) - Math.min(...longitudes) > 180;
  const normalizedLongitudes = longitudes.map((value) => crossesDateLine && value < 0 ? value + 360 : value);
  let longitude = (Math.min(...normalizedLongitudes) + Math.max(...normalizedLongitudes)) / 2;
  if (longitude > 180) longitude -= 360;
  const latitudes = points.map((point) => point[1]);
  return {
    longitude,
    latitude: (Math.min(...latitudes) + Math.max(...latitudes)) / 2
  };
}
function shapeBounds(polygons, project) {
  const points = polygons.flat(2).map(project);
  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys)
  };
}
function pathFor(polygons, project) {
  return polygons.map((polygon) => polygon.map((ring) => {
    const projected = ring.map(project);
    const simplified = projected.length ? [projected[0]] : [];
    for (let index = 1; index < projected.length - 1; index += 1) {
      const point = projected[index];
      const previous = simplified[simplified.length - 1];
      if (Math.hypot(point[0] - previous[0], point[1] - previous[1]) >= 0.55) simplified.push(point);
    }
    if (projected.length > 1) simplified.push(projected[projected.length - 1]);
    return simplified.map(([x, y], index) => {
      return `${index ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join("") + "Z";
  }).join("")).join("");
}
function viewBoxFor(bounds) {
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  const padding = Math.max(8, Math.max(width, height) * 0.14);
  return `${bounds.minX - padding} ${bounds.minY - padding} ${width + padding * 2} ${height + padding * 2}`;
}
async function loadCountryRegions(row) {
  const cached = countryCache.get(row.boundaryISO);
  if (cached && cached.expiresAt > Date.now()) return cached;
  const response = await fetch(row.simplifiedGeometryGeoJSON, { signal: AbortSignal.timeout(3e4) });
  if (!response.ok) throw new Error(`D\xE9coupage r\xE9gional indisponible (${response.status})`);
  const payload = await response.json();
  const features = (payload.features || []).filter((feature) => coordinates(feature).length);
  if (!features.length) throw new Error("Aucune r\xE9gion disponible dans le d\xE9coupage re\xE7u.");
  const { project, metadata: projectionMetadata } = projection(features);
  const regions = features.map((feature, index) => {
    var _a, _b, _c, _d;
    const polygons = coordinates(feature);
    const bounds = shapeBounds(polygons, project);
    const center = geographicCenter(polygons);
    return {
      id: ((_a = feature.properties) == null ? void 0 : _a.shapeID) || ((_b = feature.properties) == null ? void 0 : _b.shapeISO) || `${row.boundaryISO}-${index}`,
      name: ((_c = feature.properties) == null ? void 0 : _c.shapeName) || ((_d = feature.properties) == null ? void 0 : _d.shapeISO) || `R\xE9gion ${index + 1}`,
      path: pathFor(polygons, project),
      viewBox: viewBoxFor(bounds),
      x: (bounds.minX + bounds.maxX) / 2,
      y: (bounds.minY + bounds.maxY) / 2,
      longitude: center.longitude,
      latitude: center.latitude
    };
  });
  const result = { regions, projection: projectionMetadata, expiresAt: Date.now() + 24 * 60 * 60 * 1e3 };
  countryCache.set(row.boundaryISO, result);
  return result;
}
const worldRegions_get = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const query = getQuery(event);
  const code = String(query.code || "").trim().toUpperCase();
  const requestedName = String(query.name || "").trim();
  const centroidsOnly = String(query.centroids || "") === "1";
  if (!/^[A-Z]{2}$/u.test(code)) {
    throw createError({ statusCode: 400, statusMessage: "Code pays invalide." });
  }
  const displayName = new Intl.DisplayNames(["en"], { type: "region" }).of(code) || "";
  const alpha3 = countries.alpha2ToAlpha3(code) || (code === "XK" ? "XKX" : "");
  const names = new Set([requestedName, displayName].map(normalized).filter(Boolean));
  const rows = await metadata();
  const row = rows.find((item) => item.boundaryISO === alpha3) || rows.find((item) => names.has(normalized(item.boundaryName)));
  if (!row) {
    throw createError({ statusCode: 404, statusMessage: "D\xE9coupage r\xE9gional indisponible pour ce pays." });
  }
  const result = await loadCountryRegions(row);
  return {
    country: row.boundaryName,
    source: "geoBoundaries",
    viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
    projection: centroidsOnly ? void 0 : result.projection,
    regions: centroidsOnly ? result.regions.map(({ id, name, longitude, latitude }) => ({ id, name, longitude, latitude })) : result.regions
  };
});

export { worldRegions_get as default };
//# sourceMappingURL=world-regions.get.mjs.map
