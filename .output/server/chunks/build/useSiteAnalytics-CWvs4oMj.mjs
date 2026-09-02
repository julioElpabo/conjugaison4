import { g as useRoute, f as useLanguagePreferences, h as useState, k as useCookie } from './server.mjs';
import { a as ANALYTICS_CONSENT_COOKIE_NAME, A as ANALYTICS_CONSENT_ACCEPTED, b as ANALYTICS_CONSENT_REFUSED } from '../_/analytics-consent.mjs';

function consentFromCookie(value) {
  if (value === ANALYTICS_CONSENT_ACCEPTED) return "accepted";
  if (value === ANALYTICS_CONSENT_REFUSED) return "refused";
  return null;
}
function useAnalyticsConsent() {
  const cookie = useCookie(ANALYTICS_CONSENT_COOKIE_NAME, {
    default: () => null,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: true
  });
  const consent = useState("analytics-consent", () => consentFromCookie(cookie.value));
  const preferencesOpen = useState("analytics-preferences-open", () => false);
  function choose(value) {
    consent.value = value;
    cookie.value = value === "accepted" ? ANALYTICS_CONSENT_ACCEPTED : ANALYTICS_CONSENT_REFUSED;
    preferencesOpen.value = false;
  }
  function openPreferences() {
    preferencesOpen.value = true;
  }
  return { consent, preferencesOpen, choose, openPreferences };
}
function useSiteAnalytics() {
  useRoute();
  useLanguagePreferences();
  useAnalyticsConsent();
  useState("analytics-used-language-locales", () => []);
  function track(name, metadata) {
    return;
  }
  return { track };
}

export { useAnalyticsConsent as a, useSiteAnalytics as u };
//# sourceMappingURL=useSiteAnalytics-CWvs4oMj.mjs.map
