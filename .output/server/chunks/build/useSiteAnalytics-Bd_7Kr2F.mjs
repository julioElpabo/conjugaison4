import { g as useRoute, f as useLanguagePreferences, h as useState } from './server.mjs';

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
//# sourceMappingURL=useSiteAnalytics-Bd_7Kr2F.mjs.map
