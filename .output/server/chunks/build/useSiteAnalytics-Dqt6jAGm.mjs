import { h as useRoute, g as useLanguagePreferences, f as useState } from './server.mjs';

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
//# sourceMappingURL=useSiteAnalytics-Dqt6jAGm.mjs.map
