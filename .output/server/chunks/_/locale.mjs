import { i as getQuery, k as getCookie, x as getHeader, n as normalizeLocale } from '../nitro/nitro.mjs';

function requestedLocale(event, queryKey, cookieKey) {
  var _a;
  const query = getQuery(event)[queryKey];
  const cookie = getCookie(event, cookieKey);
  const header = (_a = getHeader(event, "accept-language")) == null ? void 0 : _a.split(",")[0];
  return normalizeLocale(query || cookie || header || "fr");
}
function explanationLocaleForEvent(event) {
  return requestedLocale(event, "explanationLocale", "explanation_locale");
}

export { explanationLocaleForEvent as e };
//# sourceMappingURL=locale.mjs.map
