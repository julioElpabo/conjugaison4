import { j as usePreferenceCookie, c as useState, k as useRequestFetch, f as useNuxtApp } from './server.mjs';
import { u as useLearnerAuth } from './useLearnerAuth-tqISusbB.mjs';

const saveQueues = /* @__PURE__ */ new WeakMap();
function useTenseClassification() {
  const classificationCookie = usePreferenceCookie("tense_classification", void 0);
  const anonymousClassification = () => classificationCookie.value === "modern" ? "modern" : "traditional";
  const classification = useState("tense-classification", anonymousClassification);
  const loadedAccount = useState("tense-classification-account", () => null);
  const revision = useState("tense-classification-revision", () => 0);
  const saveError = useState("tense-classification-save-error", () => false);
  const { user } = useLearnerAuth();
  const requestFetch = useRequestFetch();
  const app = useNuxtApp();
  async function restoreClassification() {
    const accountId = user.value?.id ?? null;
    if (accountId === loadedAccount.value) return;
    loadedAccount.value = accountId;
    classification.value = accountId === null ? anonymousClassification() : "traditional";
    saveError.value = false;
    const requestRevision = ++revision.value;
    if (accountId === null) return;
    try {
      const preferences = await requestFetch("/api/learner/preferences");
      if (user.value?.id === accountId && revision.value === requestRevision) {
        classification.value = preferences.tenseClassification === "modern" ? "modern" : "traditional";
      }
    } catch {
      if (loadedAccount.value === accountId) loadedAccount.value = null;
    }
  }
  async function setClassification(next) {
    classification.value = next;
    saveError.value = false;
    const changeRevision = ++revision.value;
    const accountId = user.value?.id;
    if (!accountId) {
      classificationCookie.value = next;
      return;
    }
    const queued = (saveQueues.get(app) ?? Promise.resolve()).catch(() => {
    }).then(async () => {
      if (user.value?.id !== accountId) return;
      await $fetch("/api/learner/preferences", { method: "PUT", body: { tenseClassification: next } });
    });
    saveQueues.set(app, queued);
    try {
      await queued;
    } catch {
      if (revision.value === changeRevision && user.value?.id === accountId) saveError.value = true;
    }
  }
  return { classification, restoreClassification, setClassification, saveError };
}

export { useTenseClassification as u };
//# sourceMappingURL=useTenseClassification-DcBiWL4X.mjs.map
