import { g as useRoute, f as useLanguagePreferences } from './server.mjs';
import { u as useState } from './state-DjsguMyT.mjs';

function useSiteAnalytics() {
  useRoute();
  useLanguagePreferences();
  useState("analytics-used-language-locales", () => []);
  function track(name, metadata) {
    return;
  }
  return { track };
}

export { useSiteAnalytics as u };
//# sourceMappingURL=useSiteAnalytics-D1wpWTOZ.mjs.map
