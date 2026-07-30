import { g as useRoute } from './server.mjs';

function useSiteAnalytics() {
  useRoute();
  function track(name, metadata) {
    return;
  }
  return { track };
}

export { useSiteAnalytics as u };
//# sourceMappingURL=useSiteAnalytics-DPlmCjj8.mjs.map
