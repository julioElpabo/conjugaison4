import { defineComponent, computed, ref, reactive, useTemplateRef, withAsyncContext, watch, nextTick, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderClass, ssrRenderStyle, ssrRenderList, ssrIncludeBooleanAttr, ssrRenderComponent, ssrRenderTeleport } from 'vue/server-renderer';
import { a as LearnerErrorDetailMessage } from './VerbConsultationModal-CMZAADK-.mjs';
import { f as useLanguagePreferences, g as useRoute, i as useRequestFetch, h as useState } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { l as learnerSpaceCopy, u as useColorTheme, a as learnerSpaceText } from './useColorTheme-C6CCVHIc.mjs';
import { aG as localizedLearnerErrorMessageForCode, aH as localizedLearnerErrorDomain, aI as localizedLearnerErrorLabel } from '../nitro/nitro.mjs';
import ChatExercise from './ChatExercise-Dz83YYpw.mjs';
import ClassicExercise from './ClassicExercise-KNK29UER.mjs';
import CoachPicker from './CoachPicker-D4L_ObdE.mjs';
import { u as useLearnerProgress, c as createLearnerTrackingContext } from './main-CFD2ahR5.mjs';
import { u as useLearnerAuth } from './useLearnerAuth-tqISusbB.mjs';
import { u as useSiteAnalytics } from './useSiteAnalytics-Bd_7Kr2F.mjs';
import { u as useAsyncData } from './asyncData-CjrHXDLz.mjs';

const APOSTROPHES = /[\u0060\u00b4\u02b9\u02bb\u02bc\u02bd\u02be\u02bf\u055a\u2018\u2019\u201b\u2032\u2035\uff07]/gu;
const FOCUSED_DIFFERENCE_THRESHOLD = 0.45;
function comparisonKey(value) {
  if (/\s/u.test(value)) return " ";
  return value.normalize("NFC").replace(APOSTROPHES, "'").toLocaleLowerCase("fr-CH");
}
function appendPart(parts, text, kind) {
  if (!text) return;
  const previous = parts.at(-1);
  if ((previous == null ? void 0 : previous.kind) === kind) previous.text += text;
  else parts.push({ text, kind });
}
function alignAnswers(learnerAnswer, expectedAnswer) {
  const learner = Array.from(learnerAnswer.normalize("NFC"));
  const expected = Array.from(expectedAnswer.normalize("NFC"));
  const rows = learner.length + 1;
  const columns = expected.length + 1;
  const distances = Array.from({ length: rows }, () => Array(columns).fill(0));
  for (let row2 = 0; row2 < rows; row2 += 1) distances[row2][0] = row2;
  for (let column2 = 0; column2 < columns; column2 += 1) distances[0][column2] = column2;
  for (let row2 = 1; row2 < rows; row2 += 1) {
    for (let column2 = 1; column2 < columns; column2 += 1) {
      const same = comparisonKey(learner[row2 - 1]) === comparisonKey(expected[column2 - 1]);
      distances[row2][column2] = Math.min(
        distances[row2 - 1][column2] + 1,
        distances[row2][column2 - 1] + 1,
        distances[row2 - 1][column2 - 1] + (same ? 0 : 1)
      );
    }
  }
  const operations = [];
  let row = learner.length;
  let column = expected.length;
  while (row > 0 || column > 0) {
    const learnerCharacter = learner[row - 1];
    const expectedCharacter = expected[column - 1];
    const same = row > 0 && column > 0 && comparisonKey(learnerCharacter) === comparisonKey(expectedCharacter);
    if (same && distances[row][column] === distances[row - 1][column - 1]) {
      operations.push({ kind: "same", learner: learnerCharacter, expected: expectedCharacter });
      row -= 1;
      column -= 1;
    } else if (row > 0 && column > 0 && distances[row][column] === distances[row - 1][column - 1] + 1) {
      operations.push({ kind: "replace", learner: learnerCharacter, expected: expectedCharacter });
      row -= 1;
      column -= 1;
    } else if (column > 0 && distances[row][column] === distances[row][column - 1] + 1) {
      operations.push({ kind: "insert", expected: expectedCharacter });
      column -= 1;
    } else {
      operations.push({ kind: "delete", learner: learnerCharacter });
      row -= 1;
    }
  }
  operations.reverse();
  const maximumLength = Math.max(learner.length, expected.length, 1);
  return {
    operations,
    similarity: 1 - distances[learner.length][expected.length] / maximumLength
  };
}
function comparisonFor(learnerAnswer, expectedAnswer) {
  const { operations, similarity } = alignAnswers(learnerAnswer, expectedAnswer);
  const mode = similarity >= FOCUSED_DIFFERENCE_THRESHOLD ? "focused" : "full";
  const learnerParts = [];
  const expectedParts = [];
  if (mode === "full") {
    learnerParts.push({ text: learnerAnswer, kind: "same" });
    expectedParts.push({ text: expectedAnswer, kind: "same" });
  } else {
    for (const operation of operations) {
      if (operation.kind === "same") {
        appendPart(learnerParts, operation.learner, "same");
        appendPart(expectedParts, operation.expected, "same");
      } else if (operation.kind === "replace") {
        appendPart(learnerParts, operation.learner, "changed");
        appendPart(expectedParts, operation.expected, "changed");
      } else if (operation.kind === "delete") {
        appendPart(learnerParts, operation.learner, "extra");
      } else {
        appendPart(expectedParts, operation.expected, "changed");
      }
    }
  }
  return { learnerAnswer, expectedAnswer, learnerParts, expectedParts, mode, similarity };
}
function searchKey(value) {
  return value.normalize("NFC").replace(APOSTROPHES, "'").toLocaleLowerCase("fr-CH");
}
function expandCorrection(comparison, displayExpectedAnswers) {
  if (displayExpectedAnswers.length === 0) return comparison;
  const comparedKey = searchKey(comparison.expectedAnswer);
  for (const displayAnswer of displayExpectedAnswers) {
    const normalizedDisplay = displayAnswer.trim().normalize("NFC");
    const matchIndex = searchKey(normalizedDisplay).indexOf(comparedKey);
    if (matchIndex < 0) continue;
    const expandedParts = [];
    appendPart(expandedParts, normalizedDisplay.slice(0, matchIndex), "same");
    for (const part of comparison.expectedParts) appendPart(expandedParts, part.text, part.kind);
    appendPart(
      expandedParts,
      normalizedDisplay.slice(matchIndex + comparison.expectedAnswer.normalize("NFC").length),
      "same"
    );
    return {
      ...comparison,
      expectedAnswer: normalizedDisplay,
      expectedParts: expandedParts
    };
  }
  const fallback = displayExpectedAnswers[0].trim();
  return {
    ...comparison,
    expectedAnswer: fallback,
    expectedParts: [{ text: fallback, kind: "same" }],
    mode: "full"
  };
}
function buildAnswerComparison(learnerAnswer, expectedAnswers, displayExpectedAnswers = []) {
  const learner = typeof learnerAnswer === "string" ? learnerAnswer.trim() : "";
  const expected = Array.isArray(expectedAnswers) ? expectedAnswers.filter((value) => typeof value === "string" && value.trim().length > 0) : [];
  const displayExpected = Array.isArray(displayExpectedAnswers) ? displayExpectedAnswers.filter((value) => typeof value === "string" && value.trim().length > 0) : [];
  if (!learner || expected.length === 0) return null;
  const comparison = expected.map((value) => comparisonFor(learner, value.trim())).sort((left, right) => right.similarity - left.similarity)[0];
  return expandCorrection(comparison, displayExpected);
}

function shuffledQuestionOrder(values, random = Math.random) {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.min(index, Math.max(0, Math.floor(random() * (index + 1))));
    const current = shuffled[index];
    shuffled[index] = shuffled[target];
    shuffled[target] = current;
  }
  if (shuffled.length > 1 && shuffled.every((value, index) => value === values[index])) {
    shuffled.push(shuffled.shift());
  }
  return shuffled;
}

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "HistorySessionSummaryDialog",
  __ssrInlineRender: true,
  props: {
    title: {},
    items: {},
    correctCount: {},
    totalCount: {}
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const { interfaceLocale, ui } = useLanguagePreferences();
    useTemplateRef("history-summary-dialog");
    const incorrectItems = computed(() => props.items.filter((item) => item.status === "incorrect"));
    const correctItems = computed(() => props.items.filter((item) => item.status === "correct"));
    const answerComparison = (item) => buildAnswerComparison(
      item.learnerAnswer,
      item.acceptedAnswers?.length ? item.acceptedAnswers : [item.expectedAnswer],
      item.displayExpectedAnswers?.length ? item.displayExpectedAnswers : [item.expectedAnswer]
    );
    const resultLabel = computed(() => {
      const middle = {
        fr: "réussites sur",
        de: "Erfolge von",
        en: "correct out of",
        it: "risposte corrette su",
        es: "aciertos de"
      }[interfaceLocale.value];
      return `${props.correctCount} ${middle} ${props.totalCount}`;
    });
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="history-summary-overlay" role="presentation" data-v-6eb97d7d><section class="history-summary-dialog" role="dialog" aria-modal="true" aria-labelledby="history-summary-title" data-v-6eb97d7d><header class="history-summary-dialog__header" data-v-6eb97d7d><div data-v-6eb97d7d><span data-v-6eb97d7d>${ssrInterpolate(unref(ui)("Bilan de la séance"))}</span><h2 id="history-summary-title" data-v-6eb97d7d>${ssrInterpolate(__props.title)}</h2><p data-v-6eb97d7d>${ssrInterpolate(unref(resultLabel))}</p></div><button type="button"${ssrRenderAttr("aria-label", unref(ui)("Fermer"))} data-v-6eb97d7d>×</button></header><div class="history-summary-dialog__content" data-v-6eb97d7d>`);
        if (unref(incorrectItems).length) {
          _push2(`<section class="history-summary-section history-summary-section--errors" data-v-6eb97d7d><h3 data-v-6eb97d7d>${ssrInterpolate(unref(ui)("Mes erreurs"))} <span data-v-6eb97d7d>${ssrInterpolate(unref(incorrectItems).length)}</span></h3><ol data-v-6eb97d7d><!--[-->`);
          ssrRenderList(unref(incorrectItems), (item) => {
            _push2(`<li data-v-6eb97d7d><p class="history-summary-item__question" data-v-6eb97d7d>${ssrInterpolate(item.questionLabel)}</p>`);
            if (item.identificationForm) {
              _push2(`<blockquote class="history-summary-item__citation" data-v-6eb97d7d><p data-v-6eb97d7d><span data-v-6eb97d7d>${ssrInterpolate(item.identificationForm.before)}</span><mark data-v-6eb97d7d>${ssrInterpolate(item.identificationForm.target)}</mark><span data-v-6eb97d7d>${ssrInterpolate(item.identificationForm.after)}</span></p>`);
              if (item.literaryCitation) {
                _push2(`<footer data-v-6eb97d7d>${ssrInterpolate(item.literaryCitation.author)}, <cite data-v-6eb97d7d>${ssrInterpolate(item.literaryCitation.work)}</cite></footer>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</blockquote>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<!--[-->`);
            ssrRenderList([answerComparison(item)], (comparison) => {
              _push2(`<div class="history-summary-item__comparison" data-v-6eb97d7d><span class="history-summary-item__answer history-summary-item__answer--learner" data-v-6eb97d7d>`);
              if (item.isIdentification) {
                _push2(`<!--[-->${ssrInterpolate(item.learnerAnswer || "—")}<!--]-->`);
              } else if (comparison) {
                _push2(`<!--[-->`);
                ssrRenderList(comparison.learnerParts, (part, partIndex) => {
                  _push2(`<span class="${ssrRenderClass(`history-summary-item__part--${part.kind}`)}" data-v-6eb97d7d>${ssrInterpolate(part.text)}</span>`);
                });
                _push2(`<!--]-->`);
              } else {
                _push2(`<!--[-->${ssrInterpolate(item.learnerAnswer || "—")}<!--]-->`);
              }
              _push2(`</span><b aria-hidden="true" data-v-6eb97d7d>→</b><strong class="history-summary-item__answer history-summary-item__answer--expected" data-v-6eb97d7d>`);
              if (item.isIdentification) {
                _push2(`<!--[-->${ssrInterpolate(item.expectedAnswer)}<!--]-->`);
              } else if (comparison) {
                _push2(`<!--[-->`);
                ssrRenderList(comparison.expectedParts, (part, partIndex) => {
                  _push2(`<span class="${ssrRenderClass(`history-summary-item__part--${part.kind}`)}" data-v-6eb97d7d>${ssrInterpolate(part.text)}</span>`);
                });
                _push2(`<!--]-->`);
              } else {
                _push2(`<!--[-->${ssrInterpolate(item.expectedAnswer)}<!--]-->`);
              }
              _push2(`</strong></div>`);
            });
            _push2(`<!--]-->`);
            if (item.errorDetails.length) {
              _push2(`<ul class="history-summary-item__reasons" data-v-6eb97d7d><!--[-->`);
              ssrRenderList(item.errorDetails, (detail) => {
                _push2(`<li data-v-6eb97d7d>`);
                _push2(ssrRenderComponent(LearnerErrorDetailMessage, { detail }, null, _parent));
                _push2(`</li>`);
              });
              _push2(`<!--]--></ul>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</li>`);
          });
          _push2(`<!--]--></ol></section>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`<section class="history-summary-section history-summary-section--successes" data-v-6eb97d7d><h3 data-v-6eb97d7d>${ssrInterpolate(unref(ui)("Mes réussites"))} <span data-v-6eb97d7d>${ssrInterpolate(unref(correctItems).length)}</span></h3>`);
        if (unref(correctItems).length) {
          _push2(`<ol data-v-6eb97d7d><!--[-->`);
          ssrRenderList(unref(correctItems), (item) => {
            _push2(`<li data-v-6eb97d7d><p class="history-summary-item__question" data-v-6eb97d7d>${ssrInterpolate(item.questionLabel)}</p><strong class="history-summary-item__correct" data-v-6eb97d7d>${ssrInterpolate(item.expectedAnswer)}</strong></li>`);
          });
          _push2(`<!--]--></ol>`);
        } else {
          _push2(`<p class="history-summary-section__empty" data-v-6eb97d7d>${ssrInterpolate(unref(ui)("Aucune réussite dans cette séance."))}</p>`);
        }
        _push2(`</section></div></section></div>`);
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/learner/HistorySessionSummaryDialog.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0$1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-6eb97d7d"]]), { __name: "LearnerHistorySessionSummaryDialog" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "LearnerSpace",
  __ssrInlineRender: true,
  props: {
    inspectedLearner: { default: void 0 },
    readOnly: { type: Boolean, default: false }
  },
  async setup(__props) {
    let __temp, __restore;
    const props = __props;
    const { user: sessionLearner } = useLearnerAuth();
    const learner = computed(() => props.inspectedLearner || sessionLearner.value);
    const { interfaceLocale, ui } = useLanguagePreferences();
    const copy = computed(() => learnerSpaceCopy(interfaceLocale.value));
    const text = (key, parameters = {}) => learnerSpaceText(copy.value, key, parameters);
    const learnerErrorComparison = (example) => buildAnswerComparison(
      example.learnerAnswer,
      example.acceptedAnswers?.length ? example.acceptedAnswers : example.expectedAnswers,
      example.expectedAnswers
    );
    useColorTheme();
    const { flushProgress } = useLearnerProgress();
    const { track } = useSiteAnalytics();
    const route = useRoute();
    const requestFetch = useRequestFetch();
    const requestedTab = (value) => ["progress", "history", "preferences", "account"].includes(String(value)) ? String(value) : "history";
    const activeTab = ref(requestedTab(route.query.tab));
    const learnerProgress = ref();
    const learnerProgressPending = ref(false);
    const learnerProgressError = ref("");
    const progressExamplesPendingCode = ref();
    const errorChallengePendingCode = ref();
    const errorChallengeErrorCode = ref();
    const progressExplanationOpen = ref(false);
    const challengeTrainings = ref([]);
    const challengeTrainingsPending = ref(false);
    const challengeTrainingsError = ref("");
    const selectedTrainingFingerprint = ref("");
    const selectedTrainingProgress = ref();
    const selectedTrainingProgressPending = ref(false);
    const selectedTrainingProgressError = ref("");
    const hoveredTrainingPointId = ref();
    const reviewQuestions = ref([]);
    const reviewTracking = ref();
    const reviewOpen = ref(false);
    const reviewRequireSuccess = ref(false);
    const exercisePresentation = ref("classic");
    const selectedCoach = ref();
    const coachPickerOpen = ref(false);
    const selectedWork = ref();
    const workMenuFingerprint = ref("");
    const catalogue = ref();
    const identificationTenses = computed(() => {
      const data = catalogue.value;
      if (!data) return [];
      const modes = new Map(data.modes.map((mode) => [mode.id, mode]));
      return data.temps.map((tense) => ({ ...tense, mode: tense.mode || modes.get(tense.modeId) }));
    });
    const challengeStarting = ref();
    const challengeStartError = ref("");
    const preferencesSaving = ref(false);
    const preferencesSaved = ref(false);
    const preferencesError = ref("");
    const accountDialog = ref();
    const accountActionPending = ref(false);
    const accountActionError = ref("");
    const resultsDeleted = ref(false);
    const passwordForm = reactive({
      currentPassword: "",
      newPassword: "",
      confirmation: ""
    });
    const passwordChanging = ref(false);
    const passwordChanged = ref(false);
    const passwordError = ref("");
    const dashboardLoadingMore = ref(false);
    const historySummary = ref();
    const historySummaryTitle = computed(() => historySummary.value ? challengeDisplayLabel(historySummary.value.challenge) : "");
    const historySummaryPendingId = ref();
    const historySummaryError = ref();
    const finishMenuChallengeId = ref();
    const siteHeaderHeight = ref(68);
    const challengeLoader = useTemplateRef("challenge-loader");
    let challengeObserver = null;
    let trainingProgressRequest = 0;
    const randomCoachAvatar = useState("challenge-random-coach-avatar", () => "");
    const workMenuLeft = ref(0);
    const exposedUsageFeatures = /* @__PURE__ */ new Set();
    function exposeUsageFeature(feature) {
      if (props.readOnly || exposedUsageFeatures.has(feature)) return;
      exposedUsageFeatures.add(feature);
    }
    function learnerTabFeature(tab) {
      if (tab === "challenges") return "learner.training";
      if (tab === "progress") return "learner.progress";
      if (tab === "history") return "learner.history";
      if (tab === "preferences") return "learner.preferences";
      return "learner.account";
    }
    function selectedWorkFeature() {
      const scope = selectedWork.value?.scope;
      if (scope === "remaining") return "learner.finish";
      if (scope === "same") return "learner.relaunch.same";
      if (scope === "random") return "learner.relaunch.random";
      if (scope === "incorrect") return "learner.errors.session";
      if (scope === "all-incorrect") return "learner.errors.challenge";
      if (scope === "targeted") return "learner.errors.targeted";
      return "";
    }
    const reviewAnalyticsMetadata = computed(() => ({
      feature: selectedWorkFeature(),
      scope: selectedWork.value?.scope || "",
      item: selectedWork.value?.analyticsItem || ""
    }));
    function learnerApi(path, query = {}) {
      const parameters = new URLSearchParams();
      for (const [key, value] of Object.entries(query)) parameters.set(key, String(value));
      if (props.inspectedLearner?.id) parameters.set("adminLearnerId", String(props.inspectedLearner.id));
      const suffix = parameters.size ? `?${parameters.toString()}` : "";
      return `/api/learner/${path}${suffix}`;
    }
    const dashboardKey = `learner-dashboard-${learner.value?.id || "anonymous"}`;
    const preferencesKey = `learner-preferences-${learner.value?.id || "anonymous"}`;
    const stickyTabsStyle = computed(() => ({
      "--learner-tabs-sticky-top": `${siteHeaderHeight.value}px`
    }));
    const { data: dashboard, pending: dashboardPending } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      dashboardKey,
      () => requestFetch(learnerApi("dashboard", {
        offset: 0,
        limit: 6
      })),
      "$td6NN2Pp1N"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const { data: storedPreferences } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      preferencesKey,
      () => requestFetch(learnerApi("preferences")),
      "$YpHflEna1t"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const preferredLocale = ref(storedPreferences.value?.interfaceLocale || interfaceLocale.value);
    const preferredTheme = ref(storedPreferences.value?.colorTheme || "light");
    const localeOptions = computed(() => [
      { value: "fr", label: ui("Français"), flag: "🇫🇷" },
      { value: "de", label: ui("Allemand"), flag: "🇩🇪" },
      { value: "en", label: ui("Anglais"), flag: "🇬🇧" },
      { value: "it", label: ui("Italien"), flag: "🇮🇹" },
      { value: "es", label: ui("Espagnol"), flag: "🇪🇸" }
    ]);
    watch(
      [activeTab, () => dashboard.value?.hasMore],
      () => nextTick(observeChallengeLoader)
    );
    watch(activeTab, (tab) => {
      const feature = learnerTabFeature(tab);
      exposeUsageFeature(feature);
      if (tab === "progress") void loadLearnerProgress();
      if (tab === "challenges") void loadChallengeTrainings();
    });
    watch(() => dashboard.value?.challenges, (challenges) => {
      if (props.readOnly || !challenges?.length) return;
      exposeUsageFeature("learner.summary");
      if (challenges.some((challenge) => !challengeIsComplete(challenge))) exposeUsageFeature("learner.finish");
      if (challenges.some((challenge) => challengeIsComplete(challenge))) {
        exposeUsageFeature("learner.relaunch.same");
        exposeUsageFeature("learner.relaunch.random");
      }
      if (challenges.some((challenge) => challenge.unresolvedCount > 0)) exposeUsageFeature("learner.errors.session");
      if (challenges.some((challenge) => challenge.allUnresolvedCount > 0)) exposeUsageFeature("learner.errors.challenge");
    }, { immediate: true });
    watch(interfaceLocale, () => {
      if (activeTab.value === "progress") void loadLearnerProgress(true);
      if (activeTab.value === "challenges") void loadChallengeTrainings(true);
    });
    watch(
      [() => route.query.tab, () => route.hash],
      async ([tab]) => {
        activeTab.value = requestedTab(tab);
        if (activeTab.value === "account" && route.hash === "#change-password") {
          await nextTick();
          (void 0).getElementById("change-password")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    );
    const displayUsername = computed(() => {
      const username = learner.value?.username || "";
      return username ? username.charAt(0).toLocaleUpperCase("fr-CH") + username.slice(1) : "";
    });
    const challengeDays = computed(() => {
      const groups = [];
      const challenges = dashboard.value?.challenges || [];
      for (const challenge of challenges) {
        const key = challengeDayKey(challenge.lastActivityAt);
        const current = groups.at(-1);
        if (current?.key === key) current.challenges.push(challenge);
        else groups.push({
          key,
          label: challengeDayLabel(challenge.lastActivityAt),
          challenges: [challenge]
        });
      }
      return groups;
    });
    const historyHasMore = computed(() => Boolean(dashboard.value?.hasMore));
    function firstUnansweredQuestionIndex(challenge) {
      const answered = new Set(challenge.answeredQuestionIndexes);
      for (let index = 0; index < challenge.challenge.questionCount; index += 1) {
        if (!answered.has(index)) return index;
      }
      return challenge.challenge.questionCount;
    }
    function challengeIsComplete(challenge) {
      return firstUnansweredQuestionIndex(challenge) >= challenge.challenge.questionCount;
    }
    function challengeQuestionResult(challenge, index) {
      return challenge.questionResults.find((result) => result.index === index);
    }
    function challengeProgressLabel(challenge) {
      return ui("{answered} questions répondues sur {total}", {
        answered: challenge.questionResults.length,
        total: challenge.challenge.questionCount
      });
    }
    function challengeExerciseKindLabel(challenge) {
      return challenge.challenge.exerciseKind === "tense-identification" ? ui("Trouver le mode et les temps") : "";
    }
    function challengeDisplayLabel(challenge) {
      return challenge.challenge.identificationSource === "literary-corpus" ? ui("Phrases littéraires") : challenge.label;
    }
    function challengeQuestionLabel(challenge, index) {
      const result = challengeQuestionResult(challenge, index);
      if (!result) return `${ui("Question")} ${index + 1} · ${ui("Pas encore répondue")}`;
      if (result.status === "incorrect") {
        return `${ui("Question")} ${index + 1} · ${ui("Réponse fausse")}`;
      }
      return `${ui("Question")} ${index + 1} · ${result.attemptNumber === 2 ? ui("Réussie au deuxième essai") : ui("Réussie au premier essai")}`;
    }
    const selectedTraining = computed(() => challengeTrainings.value.find(
      (training) => training.fingerprint === selectedTrainingFingerprint.value
    ));
    const trainingChartCoordinates = computed(() => {
      const points = selectedTrainingProgress.value?.points || [];
      if (!points.length) return [];
      const left = 42;
      const right = 624;
      const top = 16;
      const bottom = 156;
      const timestamps = points.map((point) => new Date(point.occurredAt).getTime());
      const first = timestamps[0];
      const last = timestamps.at(-1);
      return points.map((point, index) => ({
        x: first === last ? (left + right) / 2 : left + (timestamps[index] - first) / (last - first) * (right - left),
        y: bottom - point.successPercent / 100 * (bottom - top),
        point
      }));
    });
    const trainingChartPolyline = computed(() => trainingChartCoordinates.value.map((coordinate) => `${coordinate.x},${coordinate.y}`).join(" "));
    const hoveredTrainingCoordinate = computed(() => trainingChartCoordinates.value.find(
      (coordinate) => coordinate.point.id === hoveredTrainingPointId.value
    ));
    const trainingSessions = computed(() => [...selectedTrainingProgress.value?.sessions || []].sort((left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime()));
    const allTrainingErrorQuestions = computed(() => trainingSessions.value.flatMap((session) => session.errors.map((error) => error.question).filter((question) => Boolean(question))));
    function trainingDateLabel(value, includeTime = false) {
      return new Intl.DateTimeFormat(interfaceLocale.value, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        ...includeTime ? { hour: "2-digit", minute: "2-digit" } : {},
        timeZone: "Europe/Zurich"
      }).format(new Date(value));
    }
    function trainingSuccessColor(rate) {
      const normalized = Math.max(0, Math.min(100, rate)) / 100;
      const red = { red: 239, green: 103, blue: 96 };
      const yellow = { red: 214, green: 163, blue: 62 };
      const green = { red: 58, green: 166, blue: 111 };
      const start = normalized <= 0.5 ? red : yellow;
      const end = normalized <= 0.5 ? yellow : green;
      const ratio = normalized <= 0.5 ? normalized * 2 : (normalized - 0.5) * 2;
      const channel = (from, to) => Math.round(from + (to - from) * ratio);
      return `rgb(${channel(start.red, end.red)} ${channel(start.green, end.green)} ${channel(start.blue, end.blue)})`;
    }
    function trainingPointRadius(totalCount) {
      const totals = trainingChartCoordinates.value.map((coordinate) => coordinate.point.totalCount);
      const minimum = Math.min(...totals);
      const maximum = Math.max(...totals);
      const minimumRadius = 7;
      const maximumRadius = 18;
      if (!totals.length || minimum === maximum) return (minimumRadius + maximumRadius) / 2;
      const normalized = (Math.sqrt(Math.max(minimum, totalCount)) - Math.sqrt(minimum)) / (Math.sqrt(maximum) - Math.sqrt(minimum));
      return minimumRadius + Math.max(0, Math.min(1, normalized)) * (maximumRadius - minimumRadius);
    }
    async function loadChallengeTrainings(force = false) {
      if (challengeTrainingsPending.value || challengeTrainings.value.length && !force) return;
      challengeTrainingsPending.value = true;
      challengeTrainingsError.value = "";
      try {
        const response = await $fetch(learnerApi("challenge-trainings"), {
          credentials: "same-origin"
        });
        challengeTrainings.value = response.trainings;
        const selectedStillExists = response.trainings.some(
          (training) => training.fingerprint === selectedTrainingFingerprint.value
        );
        if (!selectedStillExists) selectedTrainingFingerprint.value = response.trainings[0]?.fingerprint || "";
        if (selectedTrainingFingerprint.value) await loadTrainingProgress(selectedTrainingFingerprint.value);
      } catch {
        challengeTrainingsError.value = copy.value.trainingsLoadError;
      } finally {
        challengeTrainingsPending.value = false;
      }
    }
    async function loadTrainingProgress(fingerprint) {
      const request = ++trainingProgressRequest;
      selectedTrainingProgressPending.value = true;
      selectedTrainingProgressError.value = "";
      try {
        const summary = await $fetch(learnerApi("challenge-progress", {
          fingerprint,
          locale: interfaceLocale.value
        }), {
          credentials: "same-origin"
        });
        if (request === trainingProgressRequest) selectedTrainingProgress.value = summary;
      } catch {
        if (request === trainingProgressRequest) {
          selectedTrainingProgress.value = void 0;
          selectedTrainingProgressError.value = copy.value.challengeProgressLoadError;
        }
      } finally {
        if (request === trainingProgressRequest) selectedTrainingProgressPending.value = false;
      }
    }
    function trainingSessionId(sessionId) {
      return `training-session-${sessionId}`;
    }
    function challengeDateParts(value) {
      return new Intl.DateTimeFormat(interfaceLocale.value, {
        timeZone: "Europe/Zurich",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }).formatToParts(new Date(value));
    }
    function challengeDayKey(value) {
      const parts = new Intl.DateTimeFormat("fr-CH", {
        timeZone: "Europe/Zurich",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).formatToParts(new Date(value));
      const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
      return `${values.year}-${values.month}-${values.day}`;
    }
    function challengeDayLabel(value) {
      const values = Object.fromEntries(challengeDateParts(value).map((part) => [part.type, part.value]));
      return `${values.weekday} ${values.day} ${values.month} ${values.year}`;
    }
    function formattedChallengeTime(value) {
      return new Intl.DateTimeFormat(interfaceLocale.value, {
        timeZone: "Europe/Zurich",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(value));
    }
    function challengeErrorsLabel(count) {
      if (interfaceLocale.value === "de") return `${count} Fehler`;
      if (interfaceLocale.value === "en") return `${count} ${count === 1 ? "mistake" : "mistakes"}`;
      if (interfaceLocale.value === "it") return `${count} ${count === 1 ? "errore" : "errori"}`;
      if (interfaceLocale.value === "es") return `${count} ${count === 1 ? "error" : "errores"}`;
      return `${count} ${count === 1 ? "erreur" : "erreurs"}`;
    }
    function pluralLabel(count, forms) {
      const [one, many] = forms[interfaceLocale.value];
      return `${count} ${count === 1 ? one : many}`;
    }
    function resultCountLabel(correct, incorrect) {
      const correctText = pluralLabel(correct, {
        fr: ["réussite", "réussites"],
        de: ["Erfolg", "Erfolge"],
        en: ["success", "successes"],
        it: ["risposta corretta", "risposte corrette"],
        es: ["acierto", "aciertos"]
      });
      const incorrectText = pluralLabel(incorrect, {
        fr: ["erreur", "erreurs"],
        de: ["Fehler", "Fehler"],
        en: ["mistake", "mistakes"],
        it: ["errore", "errori"],
        es: ["error", "errores"]
      });
      return `${correctText} · ${incorrectText}`;
    }
    function trainingCountLabel(count) {
      return pluralLabel(count, {
        fr: ["entraînement", "entraînements"],
        de: ["Training", "Trainings"],
        en: ["practice session", "practice sessions"],
        it: ["allenamento", "allenamenti"],
        es: ["entrenamiento", "entrenamientos"]
      });
    }
    function occurrenceCountLabel(count) {
      return pluralLabel(count, {
        fr: ["occurrence", "occurrences"],
        de: ["Sitzung", "Sitzungen"],
        en: ["session", "sessions"],
        it: ["sessione", "sessioni"],
        es: ["sesión", "sesiones"]
      });
    }
    function questionCountLabel(count) {
      return pluralLabel(count, {
        fr: ["question", "questions"],
        de: ["Frage", "Fragen"],
        en: ["question", "questions"],
        it: ["domanda", "domande"],
        es: ["pregunta", "preguntas"]
      });
    }
    function successPercentLabel(rate) {
      const suffix = { fr: "de réussite", de: "Erfolg", en: "success", it: "di successo", es: "de aciertos" }[interfaceLocale.value];
      return `${rate}% ${suffix}`;
    }
    function successEvolutionLabel(label) {
      const prefix = {
        fr: "Évolution du pourcentage de réussite pour",
        de: "Entwicklung der Erfolgsquote für",
        en: "Success rate over time for",
        it: "Evoluzione della percentuale di successo per",
        es: "Evolución del porcentaje de aciertos para"
      }[interfaceLocale.value];
      return `${prefix} ${label}`;
    }
    function trainingPointLabel(point) {
      const ending = {
        fr: "Voir les erreurs de cette session.",
        de: "Fehler dieser Sitzung anzeigen.",
        en: "View the mistakes from this session.",
        it: "Vedi gli errori di questa sessione.",
        es: "Ver los errores de esta sesión."
      }[interfaceLocale.value];
      return `${trainingDateLabel(point.occurredAt, true)}: ${successPercentLabel(point.successPercent)}. ${ending}`;
    }
    function responseSummaryLabel(correct, incorrect) {
      return resultCountLabel(correct, incorrect);
    }
    function questionsOutOfLabel(answered, total) {
      const middle = { fr: "questions sur", de: "Fragen von", en: "questions out of", it: "domande su", es: "preguntas de" }[interfaceLocale.value];
      return `${answered} ${middle} ${total}`;
    }
    function localizedTrainingReportTitle(title) {
      if (!title || interfaceLocale.value === "fr") return title;
      if (title === learnerSpaceCopy("fr").trainChallengeErrors) return copy.value.trainChallengeErrors;
      const frenchPrefix = "Entraînement des erreurs du ";
      if (title.startsWith(frenchPrefix)) {
        const suffix = title.slice(frenchPrefix.length);
        const prefix = {
          de: "Fehlertraining vom ",
          en: "Mistake practice from ",
          it: "Allenamento sugli errori del ",
          es: "Entrenamiento de errores del "
        }[interfaceLocale.value];
        return `${prefix}${suffix}`;
      }
      return title;
    }
    function trainQuestionsLabel(count) {
      if (interfaceLocale.value === "fr") {
        return count === 1 ? "Entraîner cette question" : `Entraîner ces ${count} questions`;
      }
      const prefix = { fr: "Entraîner ces", de: "Diese", en: "Practise these", it: "Allenare queste", es: "Practicar estas" }[interfaceLocale.value];
      const suffix = interfaceLocale.value === "de" ? count === 1 ? "Frage trainieren" : "Fragen trainieren" : questionCountLabel(count).replace(String(count), "").trim();
      return interfaceLocale.value === "de" ? `${prefix} ${count} ${suffix}` : `${prefix} ${count} ${suffix}`;
    }
    function sessionResultLabel(correct, total) {
      const middle = { fr: "réussites sur", de: "Erfolge von", en: "successes out of", it: "risposte corrette su", es: "aciertos de" }[interfaceLocale.value];
      return `${correct} ${middle} ${total}`;
    }
    function errorEvolutionLabel(label) {
      const prefix = {
        fr: "Évolution du taux d’erreurs pour",
        de: "Entwicklung der Fehlerquote für",
        en: "Error rate over time for",
        it: "Evoluzione della percentuale di errori per",
        es: "Evolución del porcentaje de errores para"
      }[interfaceLocale.value];
      return `${prefix} ${label}`;
    }
    function chartPointLabel(rate, errors, opportunities) {
      const values = {
        fr: `${rate}% de fautes, ${errors} sur ${opportunities} occasions testées`,
        de: `${rate}% Fehler, ${errors} von ${opportunities} geprüften Gelegenheiten`,
        en: `${rate}% mistakes, ${errors} out of ${opportunities} tested opportunities`,
        it: `${rate}% di errori, ${errors} su ${opportunities} occasioni verificate`,
        es: `${rate}% de errores, ${errors} de ${opportunities} ocasiones evaluadas`
      };
      return values[interfaceLocale.value];
    }
    function totalOpportunitiesLabel(count) {
      const values = {
        fr: `${count} occasion${count === 1 ? "" : "s"} réellement testée${count === 1 ? "" : "s"} au total`,
        de: `${count} tatsächlich geprüfte ${count === 1 ? "Gelegenheit" : "Gelegenheiten"} insgesamt`,
        en: `${count} ${count === 1 ? "opportunity" : "opportunities"} actually tested in total`,
        it: `${count} ${count === 1 ? "occasione realmente verificata" : "occasioni realmente verificate"} in totale`,
        es: `${count} ${count === 1 ? "ocasión realmente evaluada" : "ocasiones realmente evaluadas"} en total`
      };
      return values[interfaceLocale.value];
    }
    function affectedChallengesLabel(count) {
      const values = {
        fr: `${count === 1 ? "défi concerné" : "défis concernés"}`,
        de: count === 1 ? "betroffene Übung" : "betroffene Übungen",
        en: count === 1 ? "challenge concerned" : "challenges concerned",
        it: count === 1 ? "esercizio interessato" : "esercizi interessati",
        es: count === 1 ? "ejercicio relacionado" : "ejercicios relacionados"
      };
      return values[interfaceLocale.value];
    }
    function progressCardDomain(card) {
      return localizedLearnerErrorDomain(card.domain, interfaceLocale.value);
    }
    function progressCardLabel(card) {
      return localizedLearnerErrorLabel(card.code, card.label, interfaceLocale.value);
    }
    function progressCardAdvice(card) {
      return localizedLearnerErrorMessageForCode(card.code, card.advice, interfaceLocale.value);
    }
    function progressExamplesLabel(card) {
      const shown = Math.min(card.examples.length, card.totalErrors);
      const total = card.totalErrors;
      if (interfaceLocale.value === "de") {
        return shown < total ? `${shown} meiner ${total} Fehler anzeigen` : `Meine ${total} ${total === 1 ? "Fehler" : "Fehler"} anzeigen`;
      }
      if (interfaceLocale.value === "en") {
        return shown < total ? `View ${shown} of my ${total} mistakes` : `View my ${total} ${total === 1 ? "mistake" : "mistakes"}`;
      }
      if (interfaceLocale.value === "it") {
        return shown < total ? `Vedi ${shown} dei miei ${total} errori` : `Vedi i miei ${total} ${total === 1 ? "errore" : "errori"}`;
      }
      if (interfaceLocale.value === "es") {
        return shown < total ? `Ver ${shown} de mis ${total} errores` : `Ver mis ${total} ${total === 1 ? "error" : "errores"}`;
      }
      return shown < total ? `Voir ${shown} de mes ${total} erreurs` : `Voir mes ${total} ${total === 1 ? "erreur" : "erreurs"}`;
    }
    function errorChallengeButtonLabel(card) {
      return `${copy.value.launchErrorChallenge} → ${progressCardLabel(card)}`;
    }
    function errorChallengeIsAvailable(card) {
      return card.code !== "morphology.ending" && card.code !== "person.other_form";
    }
    async function loadLearnerProgress(force = false) {
      if (learnerProgressPending.value || learnerProgress.value && !force) return;
      learnerProgressPending.value = true;
      learnerProgressError.value = "";
      try {
        learnerProgress.value = await $fetch(learnerApi("progress", {
          locale: interfaceLocale.value
        }), {
          credentials: "same-origin"
        });
        if (learnerProgress.value.cards.some(errorChallengeIsAvailable)) {
          exposeUsageFeature("learner.errors.targeted");
        }
      } catch {
        learnerProgressError.value = copy.value.progressLoadError;
      } finally {
        learnerProgressPending.value = false;
      }
    }
    function progressTrendLabel(card) {
      if (card.isStale) return copy.value.retest;
      if (card.trend === "improving") {
        const count = Math.abs(card.trendDelta || 0);
        return interfaceLocale.value === "de" ? `${count} Fehlerpunkte weniger` : interfaceLocale.value === "en" ? `${count} fewer error points` : interfaceLocale.value === "it" ? `${count} punti di errore in meno` : interfaceLocale.value === "es" ? `${count} puntos de error menos` : `${count} points d’erreur en moins`;
      }
      if (card.trend === "worsening") {
        const count = Math.abs(card.trendDelta || 0);
        return interfaceLocale.value === "de" ? `${count} Fehlerpunkte mehr` : interfaceLocale.value === "en" ? `${count} more error points` : interfaceLocale.value === "it" ? `${count} punti di errore in più` : interfaceLocale.value === "es" ? `${count} puntos de error más` : `${count} points d’erreur en plus`;
      }
      if (card.trend === "stable") return copy.value.stableRate;
      return copy.value.tooFewComparable;
    }
    function progressLastTestLabel(card) {
      if (card.daysSinceLastTest === 0) return copy.value.testedToday;
      if (card.daysSinceLastTest === 1) return copy.value.testedYesterday;
      const count = card.daysSinceLastTest;
      return interfaceLocale.value === "de" ? `Vor ${count} Tagen getestet` : interfaceLocale.value === "en" ? `Tested ${count} days ago` : interfaceLocale.value === "it" ? `Verificato ${count} giorni fa` : interfaceLocale.value === "es" ? `Evaluado hace ${count} días` : `Testé il y a ${count} jours`;
    }
    function progressDateLabel(value) {
      return new Intl.DateTimeFormat(interfaceLocale.value, {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Europe/Zurich"
      }).format(/* @__PURE__ */ new Date(`${value}T12:00:00Z`));
    }
    function progressRate(errorRate) {
      return errorRate;
    }
    function progressCurrentRate(card) {
      return progressRate(card.currentRate);
    }
    function progressChartCoordinates(card) {
      const points = card.points;
      if (!points.length) return [];
      const left = 42;
      const right = 624;
      const top = 16;
      const bottom = 156;
      return points.map((point, index) => ({
        x: points.length === 1 ? (left + right) / 2 : left + index / (points.length - 1) * (right - left),
        y: bottom - progressRate(point.errorRate) / 100 * (bottom - top),
        point,
        rate: progressRate(point.errorRate)
      }));
    }
    function progressMetricColor(rate) {
      const riskRate = rate;
      const green = { red: 58, green: 166, blue: 111 };
      const yellow = { red: 214, green: 163, blue: 62 };
      const red = { red: 239, green: 103, blue: 96 };
      const start = riskRate <= 10 ? green : yellow;
      const end = riskRate <= 10 ? yellow : red;
      const ratio = riskRate <= 10 ? Math.max(0, riskRate) / 10 : Math.min(10, riskRate - 10) / 10;
      const channel = (from, to) => Math.round(from + (to - from) * ratio);
      return `rgb(${channel(start.red, end.red)} ${channel(start.green, end.green)} ${channel(start.blue, end.blue)})`;
    }
    function progressGradientId(card) {
      return `progress-rate-errors-${card.code.replaceAll(".", "-")}`;
    }
    function progressCardId(card) {
      return `progress-card-${card.code.replaceAll(".", "-")}`;
    }
    function progressChartSegments(card) {
      const coordinates = progressChartCoordinates(card);
      const segments = [];
      for (const coordinate of coordinates) {
        const current = segments.at(-1);
        const previous = current?.at(-1);
        const gap = previous ? (Date.parse(`${coordinate.point.date}T00:00:00Z`) - Date.parse(`${previous.point.date}T00:00:00Z`)) / 864e5 : 0;
        if (!current || gap > 45) segments.push([coordinate]);
        else current.push(coordinate);
      }
      return segments;
    }
    async function questionsForSelectedWork() {
      const work = selectedWork.value;
      if (!work) return [];
      if (work.scope === "targeted") return shuffledQuestionOrder(work.targetQuestions || []);
      if (work.scope === "remaining") {
        const firstUnanswered = firstUnansweredQuestionIndex(work.challenge);
        const remainingCount = Math.max(0, work.challenge.challenge.questionCount - firstUnanswered);
        if (!remainingCount) return [];
        const plannedQuestions = work.challenge.exactQuestions.slice(firstUnanswered, firstUnanswered + remainingCount);
        if (plannedQuestions.length === remainingCount) return plannedQuestions;
        return await $fetch("/api/questionnaires", {
          method: "POST",
          body: {
            ...work.challenge.challenge,
            questionCount: remainingCount
          }
        });
      }
      if (work.scope === "same" || work.scope === "random") {
        if (work.challenge.exactQuestions.length) {
          return work.scope === "random" ? shuffledQuestionOrder(work.challenge.exactQuestions) : [...work.challenge.exactQuestions];
        }
        const preserved = [...work.challenge.retryQuestions].slice(0, work.challenge.challenge.questionCount);
        const missingCount = Math.max(0, work.challenge.challenge.questionCount - preserved.length);
        if (!missingCount) {
          return work.scope === "random" ? shuffledQuestionOrder(preserved) : preserved;
        }
        const generated = await $fetch("/api/questionnaires", {
          method: "POST",
          body: {
            ...work.challenge.challenge,
            questionCount: missingCount
          }
        });
        const questions = [...preserved, ...generated].slice(0, work.challenge.challenge.questionCount);
        return work.scope === "random" ? shuffledQuestionOrder(questions) : questions;
      }
      if (work.scope === "incorrect") return shuffledQuestionOrder(work.challenge.retryQuestions);
      if (work.scope === "all-incorrect") return shuffledQuestionOrder(work.challenge.allRetryQuestions);
      return await $fetch("/api/questionnaires", {
        method: "POST",
        body: work.challenge.challenge
      });
    }
    async function ensureCatalogue() {
      if (catalogue.value) return catalogue.value;
      catalogue.value = await $fetch("/api/catalogue");
      return catalogue.value;
    }
    function challengeVerbs(challenge) {
      const ids = /* @__PURE__ */ new Set([
        ...challenge.challenge.verbIds,
        ...reviewQuestions.value.map((question) => Number(question.verbeId)).filter((id) => id > 0)
      ]);
      return catalogue.value?.verbes.filter((verb) => ids.has(verb.id)) || [];
    }
    function challengeTenses(challenge) {
      const ids = new Set(challenge.challenge.tenseIds);
      const modes = new Map(catalogue.value?.modes.map((mode) => [mode.id, mode]) || []);
      return (catalogue.value?.temps.filter((tense) => ids.has(tense.id)) || []).map((tense) => ({ ...tense, mode: tense.mode || modes.get(tense.modeId) }));
    }
    async function launchSelectedWork(presentation, coach) {
      const work = selectedWork.value;
      if (!work || challengeStarting.value) return false;
      challengeStarting.value = String(work.challenge.id);
      challengeStartError.value = "";
      const analyticsFeature = selectedWorkFeature();
      if (analyticsFeature) {
        track("feature_selected", {
          feature: analyticsFeature,
          scope: work.scope,
          item: work.analyticsItem || ""
        });
      }
      try {
        if (presentation === "chat") await ensureCatalogue();
        const {
          trainingReportTitle: _trainingReportTitle,
          ...standardChallenge
        } = work.challenge.challenge;
        reviewQuestions.value = await questionsForSelectedWork();
        if (!reviewQuestions.value.length) throw new Error("Aucune question disponible");
        const isErrorReview = work.scope === "incorrect" || work.scope === "all-incorrect";
        const isReviewSession = isErrorReview || work.scope === "remaining" && work.challenge.isReview;
        const trackedChallenge = work.scope === "targeted" ? work.challenge.challenge : {
          ...standardChallenge,
          ...isErrorReview ? { questionCount: reviewQuestions.value.length } : {}
        };
        reviewRequireSuccess.value = work.scope === "incorrect" || work.scope === "all-incorrect" || work.scope === "targeted" || work.scope === "remaining" && work.challenge.isReview;
        exercisePresentation.value = presentation;
        selectedCoach.value = coach;
        reviewTracking.value = createLearnerTrackingContext({
          challengeFingerprint: work.challenge.fingerprint,
          challengeLabel: work.challenge.label,
          challenge: trackedChallenge,
          presentation,
          isReview: isReviewSession
        });
        if (work.scope === "remaining") {
          reviewTracking.value.runId = work.challenge.clientRunId;
          reviewTracking.value.questionIndexOffset = firstUnansweredQuestionIndex(work.challenge);
        }
        workMenuFingerprint.value = "";
        finishMenuChallengeId.value = void 0;
        reviewOpen.value = true;
        return true;
      } catch {
        if (analyticsFeature) {
          track("feature_failed", {
            feature: analyticsFeature,
            scope: work.scope,
            item: work.analyticsItem || ""
          });
        }
        challengeStartError.value = copy.value.prepareError;
        return false;
      } finally {
        challengeStarting.value = void 0;
      }
    }
    async function launchWithCoach(coach) {
      const launched = await launchSelectedWork("chat", coach);
      if (launched) coachPickerOpen.value = false;
    }
    async function regenerateChatQuestions() {
      reviewQuestions.value = await questionsForSelectedWork();
    }
    function observeChallengeLoader() {
      challengeObserver?.disconnect();
      challengeObserver = null;
      const canLoad = activeTab.value === "history" ? historyHasMore.value : Boolean(dashboard.value?.hasMore);
      if (!["challenges", "history"].includes(activeTab.value) || !canLoad || !challengeLoader.value) return;
      challengeObserver = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        void loadMoreChallenges();
      }, { rootMargin: "160px 0px" });
      challengeObserver.observe(challengeLoader.value);
    }
    async function loadMoreChallenges() {
      if (dashboardLoadingMore.value || !dashboard.value?.hasMore) return;
      dashboardLoadingMore.value = true;
      try {
        const page = await $fetch(learnerApi("dashboard", {
          offset: dashboard.value.nextOffset,
          limit: 6
        }), {
          credentials: "same-origin"
        });
        const known = new Set(dashboard.value.challenges.map((challenge) => challenge.id));
        dashboard.value = {
          ...page,
          challenges: [
            ...dashboard.value.challenges,
            ...page.challenges.filter((challenge) => !known.has(challenge.id))
          ]
        };
      } finally {
        dashboardLoadingMore.value = false;
      }
    }
    async function refreshVisibleChallenges() {
      const visibleCount = Math.max(6, dashboard.value?.challenges.length || 0);
      dashboard.value = await $fetch(learnerApi("dashboard", {
        offset: 0,
        limit: visibleCount
      }), {
        credentials: "same-origin"
      });
      await nextTick();
      observeChallengeLoader();
    }
    async function closeReview() {
      reviewOpen.value = false;
      await flushProgress();
      const refreshTrainings = activeTab.value === "challenges" ? loadChallengeTrainings(true) : Promise.resolve();
      await Promise.all([
        refreshVisibleChallenges(),
        refreshTrainings,
        learnerProgress.value ? loadLearnerProgress(true) : Promise.resolve()
      ]);
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LearnerHistorySessionSummaryDialog = __nuxt_component_0$1;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["learner-space", { "learner-space--dark": unref(preferredTheme) === "dark" }]
      }, _attrs))} data-v-f10c3218><header class="learner-space__hero" data-v-f10c3218><div data-v-f10c3218><h1 data-v-f10c3218>${ssrInterpolate(unref(copy).hello)} ${ssrInterpolate(unref(displayUsername))}</h1></div><nav class="learner-space__hero-actions"${ssrRenderAttr("aria-label", unref(copy).personalSettings)} data-v-f10c3218><button class="${ssrRenderClass({ "is-active": unref(activeTab) === "preferences" })}" type="button" data-v-f10c3218>${ssrInterpolate(unref(copy).preferences)}</button><button class="${ssrRenderClass({ "is-active": unref(activeTab) === "account" })}" type="button" data-v-f10c3218>${ssrInterpolate(unref(copy).account)}</button></nav></header><nav class="learner-tabs" style="${ssrRenderStyle(unref(stickyTabsStyle))}"${ssrRenderAttr("aria-label", unref(copy).spaceSections)} data-v-f10c3218><button class="${ssrRenderClass([{ "is-active": unref(activeTab) === "history" }, "learner-tabs__primary"])}" type="button" data-v-f10c3218><span aria-hidden="true" data-v-f10c3218>✦</span> ${ssrInterpolate(unref(copy).history)}</button><button class="${ssrRenderClass({ "is-active": unref(activeTab) === "progress" })}" type="button" data-v-f10c3218>${ssrInterpolate(unref(copy).commonErrors)}</button></nav>`);
      if (unref(activeTab) === "challenges" || unref(activeTab) === "history") {
        _push(`<section class="learner-panel" aria-labelledby="challenges-title" data-v-f10c3218><div class="learner-panel__heading" data-v-f10c3218><div data-v-f10c3218><p class="learner-eyebrow" data-v-f10c3218>${ssrInterpolate(unref(activeTab) === "history" ? unref(copy).findActivities : unref(copy).resumeAndConsolidate)}</p><h2 id="challenges-title" data-v-f10c3218>${ssrInterpolate(unref(activeTab) === "history" ? unref(copy).history : unref(copy).improve)}</h2></div></div><aside class="learner-section-intro" data-v-f10c3218><strong data-v-f10c3218>${ssrInterpolate(unref(activeTab) === "history" ? unref(copy).reviewJourney : unref(copy).chooseTraining)}</strong>`);
        if (unref(activeTab) === "history") {
          _push(`<p data-v-f10c3218>${ssrInterpolate(unref(copy).historyIntro)}</p>`);
        } else {
          _push(`<p data-v-f10c3218>${ssrInterpolate(unref(copy).improveIntro)}</p>`);
        }
        _push(`</aside>`);
        if (unref(activeTab) === "history") {
          _push(`<!--[-->`);
          if (unref(dashboardPending)) {
            _push(`<p class="learner-empty" data-v-f10c3218>${ssrInterpolate(unref(copy).loadingChallenges)}</p>`);
          } else if (unref(dashboard)?.challenges.length) {
            _push(`<!--[--><ol class="challenge-history"${ssrRenderAttr("aria-label", unref(copy).challengeHistory)} data-v-f10c3218><!--[-->`);
            ssrRenderList(unref(challengeDays), (day) => {
              _push(`<li class="challenge-history__day" data-v-f10c3218><time class="challenge-history__date"${ssrRenderAttr("datetime", day.key)} data-v-f10c3218>${ssrInterpolate(day.label)}</time><ol class="challenge-history__day-list" data-v-f10c3218><!--[-->`);
              ssrRenderList(day.challenges, (challenge, challengeIndex) => {
                _push(`<li class="${ssrRenderClass({
                  "is-left": challengeIndex % 2 === 0,
                  "is-right": challengeIndex % 2 !== 0,
                  "is-work-menu-open": unref(selectedWork)?.challenge.id === challenge.id && unref(workMenuFingerprint)
                })}" data-v-f10c3218><span class="challenge-history__dot" aria-hidden="true" data-v-f10c3218></span><article class="${ssrRenderClass([{ "challenge-card--perfect": challengeIsComplete(challenge) && challenge.incorrectCount === 0 }, "challenge-card"])}" data-v-f10c3218><div class="challenge-card__top" data-v-f10c3218><div class="challenge-card__heading" data-v-f10c3218><h3 data-v-f10c3218>${ssrInterpolate(challengeDisplayLabel(challenge))}</h3>`);
                if (challengeExerciseKindLabel(challenge)) {
                  _push(`<p class="challenge-card__exercise-kind" data-v-f10c3218>${ssrInterpolate(challengeExerciseKindLabel(challenge))}</p>`);
                } else {
                  _push(`<!---->`);
                }
                _push(`</div><span data-v-f10c3218>${ssrInterpolate(formattedChallengeTime(challenge.lastActivityAt))}</span></div>`);
                if (challenge.description && challenge.incorrectCount > 0) {
                  _push(`<div class="challenge-card__description" data-v-f10c3218><p data-v-f10c3218>${ssrInterpolate(challenge.description)}</p></div>`);
                } else {
                  _push(`<!---->`);
                }
                _push(`<div class="challenge-card__question-progress" role="img"${ssrRenderAttr("aria-label", challengeProgressLabel(challenge))} data-v-f10c3218><!--[-->`);
                ssrRenderList(challenge.challenge.questionCount, (index) => {
                  _push(`<span${ssrRenderAttr("title", challengeQuestionLabel(challenge, index - 1))} class="${ssrRenderClass({
                    "is-correct": challengeQuestionResult(challenge, index - 1)?.status === "correct" && challengeQuestionResult(challenge, index - 1)?.attemptNumber !== 2,
                    "is-correct-retry": challengeQuestionResult(challenge, index - 1)?.status === "correct" && challengeQuestionResult(challenge, index - 1)?.attemptNumber === 2,
                    "is-incorrect": challengeQuestionResult(challenge, index - 1)?.status === "incorrect"
                  })}" data-v-f10c3218></span>`);
                });
                _push(`<!--]--></div><div class="${ssrRenderClass([{
                  "has-single-action": __props.readOnly || challengeIsComplete(challenge)
                }, "challenge-card__primary-actions"])}" data-v-f10c3218>`);
                if (!__props.readOnly && !challengeIsComplete(challenge)) {
                  _push(`<div class="challenge-finish" data-v-f10c3218><button type="button" class="challenge-card__finish-session"${ssrRenderAttr("aria-expanded", unref(finishMenuChallengeId) === challenge.id)} data-v-f10c3218><span class="review-button__scope-icon" aria-hidden="true" data-v-f10c3218><svg viewBox="0 0 24 24" data-v-f10c3218><path d="M8 5v14l11-7z" data-v-f10c3218></path></svg></span><span class="review-button__scope-copy" data-v-f10c3218><strong data-v-f10c3218>${ssrInterpolate(unref(ui)("Terminer la séance"))}</strong><small data-v-f10c3218>${ssrInterpolate(unref(ui)("Reprendre à la prochaine question"))}</small></span></button>`);
                  if (unref(finishMenuChallengeId) === challenge.id) {
                    _push(`<div class="challenge-presentation-menu" role="group"${ssrRenderAttr("aria-label", unref(copy).choosePresentation)} data-v-f10c3218><button class="action-button action-button--primary" type="button"${ssrIncludeBooleanAttr(Boolean(unref(challengeStarting))) ? " disabled" : ""} data-v-f10c3218><span class="action-button__icon" aria-hidden="true" data-v-f10c3218>●</span><span data-v-f10c3218><strong data-v-f10c3218>${ssrInterpolate(unref(copy).classic)}</strong></span></button><button class="action-button action-button--chat" type="button"${ssrIncludeBooleanAttr(Boolean(unref(challengeStarting))) ? " disabled" : ""} data-v-f10c3218><span class="action-button__icon" aria-hidden="true" data-v-f10c3218>`);
                    if (unref(randomCoachAvatar)) {
                      _push(`<img${ssrRenderAttr("src", unref(randomCoachAvatar))} alt="" data-v-f10c3218>`);
                    } else {
                      _push(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" data-v-f10c3218><circle cx="12" cy="8" r="4" data-v-f10c3218></circle><path d="M4.5 21a7.5 7.5 0 0 1 15 0" data-v-f10c3218></path></svg>`);
                    }
                    _push(`</span><span data-v-f10c3218><strong data-v-f10c3218>${ssrInterpolate(unref(copy).withCoach)}</strong></span></button></div>`);
                  } else {
                    _push(`<!---->`);
                  }
                  _push(`</div>`);
                } else {
                  _push(`<!---->`);
                }
                _push(`<button type="button" class="review-button review-button--summary"${ssrIncludeBooleanAttr(unref(historySummaryPendingId) === challenge.id) ? " disabled" : ""} data-v-f10c3218><span class="review-button__scope-icon" aria-hidden="true" data-v-f10c3218><svg viewBox="0 0 24 24" data-v-f10c3218><path d="M6 3h9l3 3v15H6zM9 10h6M9 14h6M9 18h4" data-v-f10c3218></path></svg></span><span class="review-button__scope-copy" data-v-f10c3218><strong data-v-f10c3218>${ssrInterpolate(unref(copy).viewSummary)}</strong><small data-v-f10c3218>${ssrInterpolate(unref(copy).summaryHint)}</small></span></button></div>`);
                if (unref(historySummaryError)?.challengeId === challenge.id) {
                  _push(`<p class="preferences-error" role="alert" data-v-f10c3218>${ssrInterpolate(unref(historySummaryError).message)}</p>`);
                } else {
                  _push(`<!---->`);
                }
                if (!__props.readOnly) {
                  _push(`<div class="challenge-work" data-v-f10c3218>`);
                  if (challengeIsComplete(challenge)) {
                    _push(`<div class="challenge-work__group" data-v-f10c3218><header class="challenge-work__heading" data-v-f10c3218><strong data-v-f10c3218>${ssrInterpolate(unref(copy).retrainChallenge)}</strong></header><div data-v-f10c3218><button type="button" class="review-button review-button--choice"${ssrIncludeBooleanAttr(Boolean(unref(challengeStarting))) ? " disabled" : ""}${ssrRenderAttr("title", challenge.exactQuestions.length ? unref(copy).sameDraw : unref(copy).oldDraw)}${ssrRenderAttr("aria-expanded", unref(workMenuFingerprint) === `${challenge.id}-same`)} data-v-f10c3218><svg viewBox="0 0 24 24" aria-hidden="true" data-v-f10c3218><path d="M7 7h10M7 12h10M7 17h10M4 7h.01M4 12h.01M4 17h.01" data-v-f10c3218></path></svg><span data-v-f10c3218>${ssrInterpolate(unref(copy).sameOrder)}</span></button><button type="button" class="review-button review-button--choice"${ssrIncludeBooleanAttr(Boolean(unref(challengeStarting))) ? " disabled" : ""}${ssrRenderAttr("aria-expanded", unref(workMenuFingerprint) === `${challenge.id}-random`)} data-v-f10c3218><svg viewBox="0 0 24 24" aria-hidden="true" data-v-f10c3218><path d="M4 7h3c4 0 6 10 10 10h3M17 4l3 3-3 3M4 17h3c1.7 0 3-1.7 4.2-3.7M16 7h4M17 14l3 3-3 3" data-v-f10c3218></path></svg><span data-v-f10c3218>${ssrInterpolate(unref(copy).randomOrder)}</span></button></div></div>`);
                  } else {
                    _push(`<!---->`);
                  }
                  if (challenge.unresolvedCount > 0) {
                    _push(`<div class="challenge-work__group" data-v-f10c3218><header class="challenge-work__heading" data-v-f10c3218><strong data-v-f10c3218>${ssrInterpolate(unref(copy).retrainErrors)}</strong></header><div data-v-f10c3218>`);
                    if (challenge.unresolvedCount > 0) {
                      _push(`<button type="button" class="review-button review-button--error-scope"${ssrIncludeBooleanAttr(Boolean(unref(challengeStarting))) ? " disabled" : ""}${ssrRenderAttr("aria-expanded", unref(workMenuFingerprint) === `${challenge.id}-incorrect`)} data-v-f10c3218><span class="review-button__scope-icon" aria-hidden="true" data-v-f10c3218><svg viewBox="0 0 24 24" data-v-f10c3218><rect x="5" y="3" width="14" height="18" rx="3" data-v-f10c3218></rect><path d="M9 8h6M9 12h6M9 16h4" data-v-f10c3218></path></svg></span><span class="review-button__scope-copy" data-v-f10c3218><strong data-v-f10c3218>${ssrInterpolate(unref(copy).errorsThisSession)}</strong><small data-v-f10c3218>${ssrInterpolate(challengeErrorsLabel(challenge.unresolvedCount))}</small></span></button>`);
                    } else {
                      _push(`<!---->`);
                    }
                    if (challenge.allUnresolvedCount > 0) {
                      _push(`<button type="button" class="review-button review-button--error-scope"${ssrIncludeBooleanAttr(Boolean(unref(challengeStarting))) ? " disabled" : ""}${ssrRenderAttr("aria-expanded", unref(workMenuFingerprint) === `${challenge.id}-all-incorrect`)} data-v-f10c3218><span class="review-button__scope-icon" aria-hidden="true" data-v-f10c3218><svg viewBox="0 0 24 24" data-v-f10c3218><rect x="7" y="3" width="12" height="16" rx="3" data-v-f10c3218></rect><path d="M5 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1M10 8h6M10 12h6" data-v-f10c3218></path></svg></span><span class="review-button__scope-copy" data-v-f10c3218><strong data-v-f10c3218>${ssrInterpolate(unref(copy).errorsWholeChallenge)}</strong><small data-v-f10c3218>${ssrInterpolate(challengeErrorsLabel(challenge.allUnresolvedCount))}</small></span></button>`);
                    } else {
                      _push(`<!---->`);
                    }
                    _push(`</div></div>`);
                  } else {
                    _push(`<!---->`);
                  }
                  if (unref(selectedWork)?.challenge.id === challenge.id && unref(workMenuFingerprint)) {
                    _push(`<div class="challenge-presentation-menu" style="${ssrRenderStyle({ left: `${unref(workMenuLeft)}px` })}" role="group"${ssrRenderAttr("aria-label", unref(copy).choosePresentation)} data-v-f10c3218><button class="action-button action-button--primary" type="button"${ssrIncludeBooleanAttr(Boolean(unref(challengeStarting))) ? " disabled" : ""} data-v-f10c3218><span class="action-button__icon" aria-hidden="true" data-v-f10c3218>●</span><span data-v-f10c3218><strong data-v-f10c3218>${ssrInterpolate(unref(copy).classic)}</strong></span></button><button class="action-button action-button--chat" type="button"${ssrIncludeBooleanAttr(Boolean(unref(challengeStarting))) ? " disabled" : ""} data-v-f10c3218><span class="action-button__icon" aria-hidden="true" data-v-f10c3218>`);
                    if (unref(randomCoachAvatar)) {
                      _push(`<img${ssrRenderAttr("src", unref(randomCoachAvatar))} alt="" data-v-f10c3218>`);
                    } else {
                      _push(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" data-v-f10c3218><circle cx="12" cy="8" r="4" data-v-f10c3218></circle><path d="M4.5 21a7.5 7.5 0 0 1 15 0" data-v-f10c3218></path></svg>`);
                    }
                    _push(`</span><span data-v-f10c3218><strong data-v-f10c3218>${ssrInterpolate(unref(copy).withCoach)}</strong></span></button></div>`);
                  } else {
                    _push(`<!---->`);
                  }
                  _push(`</div>`);
                } else {
                  _push(`<!---->`);
                }
                _push(`</article></li>`);
              });
              _push(`<!--]--></ol></li>`);
            });
            _push(`<!--]--></ol>`);
            if (unref(challengeStartError)) {
              _push(`<p class="preferences-error" role="alert" data-v-f10c3218>${ssrInterpolate(unref(challengeStartError))}</p>`);
            } else {
              _push(`<!---->`);
            }
            if (unref(historyHasMore)) {
              _push(`<div class="challenge-loader-sentinel" aria-hidden="true" data-v-f10c3218></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<!--]-->`);
          } else {
            _push(`<div class="learner-empty" data-v-f10c3218><strong data-v-f10c3218>${ssrInterpolate(unref(copy).noChallenge)}</strong><span data-v-f10c3218>${ssrInterpolate(unref(copy).futureAnswers)}</span></div>`);
          }
          _push(`<!--]-->`);
        } else {
          _push(`<!--[-->`);
          if (unref(challengeTrainingsError)) {
            _push(`<p class="preferences-error" role="alert" data-v-f10c3218>${ssrInterpolate(unref(challengeTrainingsError))}</p>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(challengeTrainingsPending) && !unref(challengeTrainings).length) {
            _push(`<p class="learner-empty" data-v-f10c3218>${ssrInterpolate(unref(copy).groupingTrainings)}</p>`);
          } else if (unref(challengeTrainings).length) {
            _push(`<div class="challenge-training-layout" data-v-f10c3218><nav class="challenge-training-list"${ssrRenderAttr("aria-label", unref(copy).trainedChallenges)} data-v-f10c3218><!--[-->`);
            ssrRenderList(unref(challengeTrainings), (training) => {
              _push(`<button type="button" class="${ssrRenderClass({ "is-active": unref(selectedTrainingFingerprint) === training.fingerprint })}"${ssrRenderAttr("aria-current", unref(selectedTrainingFingerprint) === training.fingerprint ? "true" : void 0)} data-v-f10c3218><span data-v-f10c3218>${ssrInterpolate(training.label)}</span><small data-v-f10c3218>${ssrInterpolate(trainingDateLabel(training.lastTrainedAt))}</small><b data-v-f10c3218>${ssrInterpolate(trainingCountLabel(training.sessionCount))} · ${ssrInterpolate(training.latestSuccessPercent)}% </b></button>`);
            });
            _push(`<!--]--></nav><section class="challenge-training-analysis" aria-live="polite" data-v-f10c3218>`);
            if (unref(selectedTraining)) {
              _push(`<header data-v-f10c3218><div data-v-f10c3218><p data-v-f10c3218>${ssrInterpolate(unref(copy).successEvolution)}</p><h3 data-v-f10c3218>${ssrInterpolate(unref(selectedTraining).label)}</h3></div></header>`);
            } else {
              _push(`<!---->`);
            }
            if (unref(selectedTrainingProgressError)) {
              _push(`<p class="preferences-error" role="alert" data-v-f10c3218>${ssrInterpolate(unref(selectedTrainingProgressError))}</p>`);
            } else if (unref(selectedTrainingProgressPending)) {
              _push(`<div class="challenge-training-state" data-v-f10c3218>${ssrInterpolate(unref(copy).calculatingProgress)}</div>`);
            } else if (unref(selectedTrainingProgress)?.points.length) {
              _push(`<!--[--><div class="challenge-training-chart" data-v-f10c3218><div class="challenge-training-chart__plot" data-v-f10c3218><svg viewBox="0 0 640 190" role="img"${ssrRenderAttr("aria-label", successEvolutionLabel(unref(selectedTraining)?.label || ""))} data-v-f10c3218><defs data-v-f10c3218><linearGradient id="training-success-gradient" x1="0" y1="156" x2="0" y2="16" gradientUnits="userSpaceOnUse" data-v-f10c3218><stop offset="0%" stop-color="#ef6760" data-v-f10c3218></stop><stop offset="50%" stop-color="#d6a33e" data-v-f10c3218></stop><stop offset="100%" stop-color="#3aa66f" data-v-f10c3218></stop></linearGradient></defs><g class="challenge-training-chart__grid" data-v-f10c3218><line x1="42" x2="624" y1="16" y2="16" data-v-f10c3218></line><line x1="42" x2="624" y1="86" y2="86" data-v-f10c3218></line><line x1="42" x2="624" y1="156" y2="156" data-v-f10c3218></line></g>`);
              if (unref(trainingChartCoordinates).length > 1) {
                _push(`<polyline${ssrRenderAttr("points", unref(trainingChartPolyline))} data-v-f10c3218></polyline>`);
              } else {
                _push(`<!---->`);
              }
              _push(`<!--[-->`);
              ssrRenderList(unref(trainingChartCoordinates), (coordinate) => {
                _push(`<circle${ssrRenderAttr("cx", coordinate.x)}${ssrRenderAttr("cy", coordinate.y)} style="${ssrRenderStyle({ stroke: trainingSuccessColor(coordinate.point.successPercent) })}" class="${ssrRenderClass({ "is-active": unref(hoveredTrainingPointId) === coordinate.point.id })}" role="button" tabindex="0"${ssrRenderAttr("aria-label", trainingPointLabel(coordinate.point))}${ssrRenderAttr("r", trainingPointRadius(coordinate.point.totalCount) + (unref(hoveredTrainingPointId) === coordinate.point.id ? 2 : 0))} data-v-f10c3218></circle>`);
              });
              _push(`<!--]--><!--[-->`);
              ssrRenderList(unref(trainingChartCoordinates), (coordinate) => {
                _push(`<text class="challenge-training-chart__point-count"${ssrRenderAttr("x", coordinate.x)}${ssrRenderAttr("y", coordinate.y)} aria-hidden="true" data-v-f10c3218>${ssrInterpolate(coordinate.point.totalCount)}</text>`);
              });
              _push(`<!--]--></svg>`);
              if (unref(hoveredTrainingCoordinate)) {
                _push(`<div class="challenge-training-chart__tooltip" style="${ssrRenderStyle({
                  left: `${Math.max(18, Math.min(82, unref(hoveredTrainingCoordinate).x / 640 * 100))}%`,
                  top: `${unref(hoveredTrainingCoordinate).y / 190 * 100}%`
                })}" role="tooltip" data-v-f10c3218><strong data-v-f10c3218>${ssrInterpolate(successPercentLabel(unref(hoveredTrainingCoordinate).point.successPercent))}</strong><span data-v-f10c3218>${ssrInterpolate(trainingDateLabel(unref(hoveredTrainingCoordinate).point.occurredAt, true))}</span><small data-v-f10c3218>${ssrInterpolate(unref(hoveredTrainingCoordinate).point.correctCount)}/${ssrInterpolate(unref(hoveredTrainingCoordinate).point.totalCount)} ${ssrInterpolate(responseSummaryLabel(unref(hoveredTrainingCoordinate).point.correctCount, unref(hoveredTrainingCoordinate).point.incorrectCount))}</small><b data-v-f10c3218>${ssrInterpolate(unref(copy).clickSession)}</b></div>`);
              } else {
                _push(`<!---->`);
              }
              _push(`<div class="challenge-training-chart__rate-axis" aria-hidden="true" data-v-f10c3218><span class="is-high" data-v-f10c3218>100%</span><span class="is-middle" data-v-f10c3218>50%</span><span class="is-low" data-v-f10c3218>0%</span></div><div class="challenge-training-chart__date-axis" aria-hidden="true" data-v-f10c3218><span data-v-f10c3218>${ssrInterpolate(trainingDateLabel(unref(selectedTrainingProgress).points[0].occurredAt))}</span><span data-v-f10c3218>${ssrInterpolate(trainingDateLabel(unref(selectedTrainingProgress).points.at(-1).occurredAt))}</span></div></div><footer data-v-f10c3218><span data-v-f10c3218>${ssrInterpolate(occurrenceCountLabel(unref(selectedTrainingProgress).points.length))}</span></footer></div><section class="challenge-training-achievement"${ssrRenderAttr("aria-label", unref(copy).achievementLabel)} data-v-f10c3218><div data-v-f10c3218><span data-v-f10c3218>${ssrInterpolate(unref(copy).bestResult)}</span><strong data-v-f10c3218><span class="challenge-training-achievement__rate" data-v-f10c3218>${ssrInterpolate(successPercentLabel(unref(selectedTrainingProgress).achievement.bestSuccessPercent))}</span><small data-v-f10c3218>${ssrInterpolate(unref(selectedTrainingProgress).achievement.bestAnsweredQuestionCount)} ${ssrInterpolate(questionsOutOfLabel(unref(selectedTrainingProgress).achievement.bestAnsweredQuestionCount, unref(selectedTrainingProgress).achievement.questionCount))}</small></strong></div><div class="${ssrRenderClass([{ "is-achieved": unref(selectedTrainingProgress).achievement.completedWithoutError }, "challenge-training-achievement__complete"])}" data-v-f10c3218><span class="challenge-training-achievement__check" role="img"${ssrRenderAttr("aria-label", unref(selectedTrainingProgress).achievement.completedWithoutError ? unref(copy).completeSuccess : unref(copy).notCompleteSuccess)}${ssrRenderAttr("aria-disabled", !unref(selectedTrainingProgress).achievement.completedWithoutError)} data-v-f10c3218>✓</span><p data-v-f10c3218><strong data-v-f10c3218>${ssrInterpolate(unref(copy).exerciseCompleted)}</strong><span data-v-f10c3218>(${ssrInterpolate(questionCountLabel(unref(selectedTrainingProgress).achievement.questionCount))})</span></p></div></section>`);
              if (!__props.readOnly) {
                _push(`<div class="challenge-work challenge-training-all-work" data-v-f10c3218><button type="button" class="challenge-training-all-work__button"${ssrIncludeBooleanAttr(!unref(allTrainingErrorQuestions).length || Boolean(unref(challengeStarting))) ? " disabled" : ""}${ssrRenderAttr("aria-expanded", unref(workMenuFingerprint) === "training-all")} data-v-f10c3218>${ssrInterpolate(unref(copy).practiseChallengeErrors)}</button>`);
                if (unref(workMenuFingerprint) === "training-all") {
                  _push(`<div class="challenge-presentation-menu" style="${ssrRenderStyle({ left: `${unref(workMenuLeft)}px` })}" role="group"${ssrRenderAttr("aria-label", unref(copy).choosePresentation)} data-v-f10c3218><button class="action-button action-button--primary" type="button"${ssrIncludeBooleanAttr(Boolean(unref(challengeStarting))) ? " disabled" : ""} data-v-f10c3218><span class="action-button__icon" aria-hidden="true" data-v-f10c3218>●</span><span data-v-f10c3218><strong data-v-f10c3218>${ssrInterpolate(unref(copy).classic)}</strong></span></button><button class="action-button action-button--chat" type="button"${ssrIncludeBooleanAttr(Boolean(unref(challengeStarting))) ? " disabled" : ""} data-v-f10c3218><span class="action-button__icon" aria-hidden="true" data-v-f10c3218>`);
                  if (unref(randomCoachAvatar)) {
                    _push(`<img${ssrRenderAttr("src", unref(randomCoachAvatar))} alt="" data-v-f10c3218>`);
                  } else {
                    _push(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" data-v-f10c3218><circle cx="12" cy="8" r="4" data-v-f10c3218></circle><path d="M4.5 21a7.5 7.5 0 0 1 15 0" data-v-f10c3218></path></svg>`);
                  }
                  _push(`</span><span data-v-f10c3218><strong data-v-f10c3218>${ssrInterpolate(unref(copy).withCoach)}</strong></span></button></div>`);
                } else {
                  _push(`<!---->`);
                }
                _push(`</div>`);
              } else {
                _push(`<!---->`);
              }
              _push(`<section class="challenge-training-sessions" aria-labelledby="training-sessions-title" data-v-f10c3218><header data-v-f10c3218><div data-v-f10c3218><p data-v-f10c3218>${ssrInterpolate(unref(copy).newestFirst)}</p><h4 id="training-sessions-title" data-v-f10c3218>${ssrInterpolate(unref(copy).errorsBySession)}</h4></div><span data-v-f10c3218>${ssrInterpolate(occurrenceCountLabel(unref(trainingSessions).length))}</span></header><div class="challenge-training-sessions__list" data-v-f10c3218><!--[-->`);
              ssrRenderList(unref(trainingSessions), (session) => {
                _push(`<article${ssrRenderAttr("id", trainingSessionId(session.id))} tabindex="-1" data-v-f10c3218>`);
                if (session.errors.length && !__props.readOnly) {
                  _push(`<div class="challenge-work challenge-training-session__work" data-v-f10c3218><button type="button"${ssrIncludeBooleanAttr(Boolean(unref(challengeStarting))) ? " disabled" : ""}${ssrRenderAttr("aria-expanded", unref(workMenuFingerprint) === `training-session-work-${session.id}`)} data-v-f10c3218>${ssrInterpolate(trainQuestionsLabel(session.errors.length))}</button>`);
                  if (unref(workMenuFingerprint) === `training-session-work-${session.id}`) {
                    _push(`<div class="challenge-presentation-menu" style="${ssrRenderStyle({ left: `${unref(workMenuLeft)}px` })}" role="group"${ssrRenderAttr("aria-label", unref(copy).choosePresentation)} data-v-f10c3218><button class="action-button action-button--primary" type="button"${ssrIncludeBooleanAttr(Boolean(unref(challengeStarting))) ? " disabled" : ""} data-v-f10c3218><span class="action-button__icon" aria-hidden="true" data-v-f10c3218>●</span><span data-v-f10c3218><strong data-v-f10c3218>${ssrInterpolate(unref(copy).classic)}</strong></span></button><button class="action-button action-button--chat" type="button"${ssrIncludeBooleanAttr(Boolean(unref(challengeStarting))) ? " disabled" : ""} data-v-f10c3218><span class="action-button__icon" aria-hidden="true" data-v-f10c3218>`);
                    if (unref(randomCoachAvatar)) {
                      _push(`<img${ssrRenderAttr("src", unref(randomCoachAvatar))} alt="" data-v-f10c3218>`);
                    } else {
                      _push(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" data-v-f10c3218><circle cx="12" cy="8" r="4" data-v-f10c3218></circle><path d="M4.5 21a7.5 7.5 0 0 1 15 0" data-v-f10c3218></path></svg>`);
                    }
                    _push(`</span><span data-v-f10c3218><strong data-v-f10c3218>${ssrInterpolate(unref(copy).withCoach)}</strong></span></button></div>`);
                  } else {
                    _push(`<!---->`);
                  }
                  _push(`</div>`);
                } else {
                  _push(`<!---->`);
                }
                _push(`<header data-v-f10c3218><div data-v-f10c3218>`);
                if (session.title) {
                  _push(`<h5 data-v-f10c3218>${ssrInterpolate(localizedTrainingReportTitle(session.title))}</h5>`);
                } else {
                  _push(`<!---->`);
                }
                _push(`<time${ssrRenderAttr("datetime", session.occurredAt)} data-v-f10c3218>${ssrInterpolate(trainingDateLabel(session.occurredAt, true))}</time><span data-v-f10c3218>${ssrInterpolate(sessionResultLabel(session.correctCount, session.totalCount))}</span></div><strong style="${ssrRenderStyle({ color: trainingSuccessColor(session.successPercent) })}" data-v-f10c3218>${ssrInterpolate(session.successPercent)}% </strong></header>`);
                if (session.errors.length) {
                  _push(`<ol data-v-f10c3218><!--[-->`);
                  ssrRenderList(session.errors, (error) => {
                    _push(`<li data-v-f10c3218><span data-v-f10c3218>${ssrInterpolate([error.infinitive, error.mode, error.tense, error.person].filter(Boolean).join(" · "))}</span><div data-v-f10c3218><span class="challenge-training-error__answer" data-v-f10c3218>${ssrInterpolate(error.learnerAnswer)}</span><span aria-hidden="true" data-v-f10c3218>→</span><strong data-v-f10c3218>${ssrInterpolate(error.expectedAnswers.join(` ${unref(ui)("ou")} `) || unref(copy).unavailableAnswer)}</strong></div><!--[-->`);
                    ssrRenderList(error.explanations, (explanation) => {
                      _push(`<p class="challenge-training-error__explanation" data-v-f10c3218>${ssrInterpolate(explanation)}</p>`);
                    });
                    _push(`<!--]--></li>`);
                  });
                  _push(`<!--]--></ol>`);
                } else {
                  _push(`<p class="challenge-training-session__perfect" data-v-f10c3218>${ssrInterpolate(unref(copy).noSessionError)}</p>`);
                }
                _push(`</article>`);
              });
              _push(`<!--]--></div></section><!--]-->`);
            } else {
              _push(`<div class="challenge-training-state" data-v-f10c3218>${ssrInterpolate(unref(copy).noUsableOccurrence)}</div>`);
            }
            _push(`</section></div>`);
          } else if (!unref(challengeTrainingsPending)) {
            _push(`<div class="learner-empty" data-v-f10c3218><strong data-v-f10c3218>${ssrInterpolate(unref(copy).noTraining)}</strong><span data-v-f10c3218>${ssrInterpolate(unref(copy).noTrainingHint)}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--]-->`);
        }
        _push(`</section>`);
      } else if (unref(activeTab) === "progress") {
        _push(`<section class="learner-panel" aria-labelledby="progress-title" data-v-f10c3218><div class="learner-panel__heading learner-panel__heading--progress" data-v-f10c3218><div data-v-f10c3218><p class="learner-eyebrow" data-v-f10c3218>${ssrInterpolate(unref(copy).measureProgress)}</p><h2 id="progress-title" data-v-f10c3218>${ssrInterpolate(unref(copy).commonErrors)}</h2></div><div class="progress-explanation" data-v-f10c3218><button type="button" class="progress-explanation__button"${ssrRenderAttr("aria-label", unref(copy).progressCalculation)} aria-controls="progress-explanation-tooltip"${ssrRenderAttr("aria-expanded", unref(progressExplanationOpen))}${ssrRenderAttr("aria-describedby", unref(progressExplanationOpen) ? "progress-explanation-tooltip" : void 0)} data-v-f10c3218><span aria-hidden="true" data-v-f10c3218>i</span></button>`);
        if (unref(progressExplanationOpen)) {
          _push(`<div id="progress-explanation-tooltip" class="progress-explanation__tooltip" role="tooltip" data-v-f10c3218><strong data-v-f10c3218>${ssrInterpolate(unref(copy).compareRates)}</strong><p data-v-f10c3218>${ssrInterpolate(text("progressExplanation", { count: unref(learnerProgress)?.opportunityWindow || 10 }))}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><aside class="learner-section-intro" data-v-f10c3218><strong data-v-f10c3218>${ssrInterpolate(unref(copy).errorsOverTime)}</strong><p data-v-f10c3218>${ssrInterpolate(unref(copy).errorsIntro)}</p></aside>`);
        if (unref(learnerProgressError)) {
          _push(`<p class="preferences-error" role="alert" data-v-f10c3218>${ssrInterpolate(unref(learnerProgressError))}</p>`);
        } else if (unref(learnerProgressPending) && !unref(learnerProgress)) {
          _push(`<p class="learner-empty" data-v-f10c3218>${ssrInterpolate(unref(copy).analysingProgress)}</p>`);
        } else if (unref(learnerProgress)?.cards.length) {
          _push(`<div class="error-progress-list" data-v-f10c3218><!--[-->`);
          ssrRenderList(unref(learnerProgress).cards, (card, cardIndex) => {
            _push(`<article${ssrRenderAttr("id", progressCardId(card))} class="${ssrRenderClass([[
              `is-${card.trend}`,
              "is-errors",
              { "is-stale": card.isStale }
            ], "error-progress-card"])}" tabindex="-1" data-v-f10c3218><header class="error-progress-card__heading" data-v-f10c3218><div data-v-f10c3218><span data-v-f10c3218>${ssrInterpolate(progressCardDomain(card))}</span><h3 data-v-f10c3218>${ssrInterpolate(progressCardLabel(card))}</h3><p data-v-f10c3218>${ssrInterpolate(progressCardAdvice(card))}</p></div><div class="error-progress-card__badges" data-v-f10c3218><div class="error-progress-card__affected" data-v-f10c3218><strong data-v-f10c3218>${ssrInterpolate(card.affectedChallengeCount)}</strong><span data-v-f10c3218>${ssrInterpolate(affectedChallengesLabel(card.affectedChallengeCount))}</span></div><div class="error-progress-card__rate" data-v-f10c3218><strong data-v-f10c3218>${ssrInterpolate(progressCurrentRate(card))}%</strong><span data-v-f10c3218>${ssrInterpolate(unref(copy).errorRate)}</span></div></div></header><div class="error-progress-card__status" data-v-f10c3218><strong data-v-f10c3218>${ssrInterpolate(progressTrendLabel(card))}</strong><span class="${ssrRenderClass({ "is-warning": card.isStale })}" data-v-f10c3218>${ssrInterpolate(progressLastTestLabel(card))}</span></div>`);
            if (card.points.length) {
              _push(`<div class="error-progress-chart" data-v-f10c3218><div class="error-progress-chart__plot" data-v-f10c3218><svg viewBox="0 0 640 190" role="img"${ssrRenderAttr("aria-label", errorEvolutionLabel(progressCardLabel(card)))} data-v-f10c3218><defs data-v-f10c3218><linearGradient${ssrRenderAttr("id", progressGradientId(card))} x1="0" y1="156" x2="0" y2="16" gradientUnits="userSpaceOnUse" data-v-f10c3218><stop offset="0%" stop-color="#3aa66f" data-v-f10c3218></stop><stop offset="10%" stop-color="#d6a33e" data-v-f10c3218></stop><stop offset="20%" stop-color="#ef6760" data-v-f10c3218></stop><stop offset="100%" stop-color="#ef6760" data-v-f10c3218></stop></linearGradient></defs><g class="error-progress-chart__grid" data-v-f10c3218><line x1="42" x2="624" y1="16" y2="16" data-v-f10c3218></line><line x1="42" x2="624" y1="86" y2="86" data-v-f10c3218></line><line x1="42" x2="624" y1="156" y2="156" data-v-f10c3218></line></g><!--[-->`);
              ssrRenderList(progressChartSegments(card), (segment, segmentIndex) => {
                _push(`<polyline${ssrRenderAttr("points", segment.map((coordinate) => `${coordinate.x},${coordinate.y}`).join(" "))} style="${ssrRenderStyle({ stroke: `url(#${progressGradientId(card)})` })}" data-v-f10c3218></polyline>`);
              });
              _push(`<!--]--><!--[-->`);
              ssrRenderList(progressChartCoordinates(card), (coordinate, coordinateIndex) => {
                _push(`<circle${ssrRenderAttr("cx", coordinate.x)}${ssrRenderAttr("cy", coordinate.y)} style="${ssrRenderStyle({ stroke: progressMetricColor(coordinate.rate) })}" r="5" data-v-f10c3218><title data-v-f10c3218>${ssrInterpolate(progressDateLabel(coordinate.point.date))} : ${ssrInterpolate(chartPointLabel(coordinate.rate, coordinate.point.errors, coordinate.point.opportunities))}</title></circle>`);
              });
              _push(`<!--]--></svg><div class="error-progress-chart__rate-axis is-errors" aria-hidden="true" data-v-f10c3218><span class="is-high" data-v-f10c3218>100%</span><span class="is-middle" data-v-f10c3218>50%</span><span class="is-low" data-v-f10c3218>0%</span></div><div class="error-progress-chart__date-axis" aria-hidden="true" data-v-f10c3218><span data-v-f10c3218>${ssrInterpolate(progressDateLabel(card.points[0].date))}</span><span data-v-f10c3218>${ssrInterpolate(progressDateLabel(card.points.at(-1).date))}</span></div></div><div class="error-progress-chart__legend" data-v-f10c3218><span data-v-f10c3218>${ssrInterpolate(unref(copy).fewerErrorsBelow)}</span><span data-v-f10c3218>${ssrInterpolate(totalOpportunitiesLabel(card.totalOpportunities))}</span></div></div>`);
            } else {
              _push(`<div class="error-progress-card__insufficient" data-v-f10c3218>${ssrInterpolate(text("reliableCurve", { count: unref(learnerProgress).minimumEvidence }))}</div>`);
            }
            if (card.examples.length) {
              _push(`<details class="error-progress-examples"${ssrIncludeBooleanAttr(cardIndex === 0) ? " open" : ""} data-v-f10c3218><summary data-v-f10c3218><span class="error-progress-examples__label" data-v-f10c3218><span class="error-progress-examples__chevron" aria-hidden="true" data-v-f10c3218></span> ${ssrInterpolate(progressExamplesLabel(card))}</span></summary><ol data-v-f10c3218><!--[-->`);
              ssrRenderList(card.examples, (example) => {
                _push(`<li data-v-f10c3218><dl data-v-f10c3218><div data-v-f10c3218><dt data-v-f10c3218>${ssrInterpolate(unref(copy).question)}</dt><dd data-v-f10c3218>${ssrInterpolate(example.question)}</dd></div><!--[-->`);
                ssrRenderList([learnerErrorComparison(example)], (comparison) => {
                  _push(`<!--[-->`);
                  if (comparison) {
                    _push(`<div class="error-progress-comparison-row error-progress-comparison-row--learner" data-v-f10c3218><dt data-v-f10c3218>${ssrInterpolate(unref(ui)("Ta réponse"))}</dt><dd class="error-progress-comparison__answer error-progress-comparison__answer--learner" data-v-f10c3218><!--[-->`);
                    ssrRenderList(comparison.learnerParts, (part, partIndex) => {
                      _push(`<span class="${ssrRenderClass(`error-progress-comparison__part--${part.kind}`)}" data-v-f10c3218>${ssrInterpolate(part.text)}</span>`);
                    });
                    _push(`<!--]--></dd></div>`);
                  } else {
                    _push(`<!---->`);
                  }
                  if (comparison) {
                    _push(`<div class="error-progress-comparison-row error-progress-comparison-row--expected" data-v-f10c3218><dt data-v-f10c3218>${ssrInterpolate(unref(copy).correction)}</dt><dd class="error-progress-comparison__answer error-progress-comparison__answer--expected" data-v-f10c3218><!--[-->`);
                    ssrRenderList(comparison.expectedParts, (part, partIndex) => {
                      _push(`<span class="${ssrRenderClass(`error-progress-comparison__part--${part.kind}`)}" data-v-f10c3218>${ssrInterpolate(part.text)}</span>`);
                    });
                    _push(`<!--]--></dd></div>`);
                  } else {
                    _push(`<!--[--><div data-v-f10c3218><dt data-v-f10c3218>${ssrInterpolate(unref(copy).yourError)}</dt><dd class="error-progress-examples__wrong" data-v-f10c3218>${ssrInterpolate(example.learnerAnswer || unref(copy).noAnswer)}</dd></div><div data-v-f10c3218><dt data-v-f10c3218>${ssrInterpolate(unref(copy).correction)}</dt><dd class="error-progress-examples__correct" data-v-f10c3218>${ssrInterpolate(example.expectedAnswers.join(` ${unref(ui)("ou")} `) || unref(copy).unavailableAnswer)}</dd></div><!--]-->`);
                  }
                  _push(`<!--]-->`);
                });
                _push(`<!--]--><div data-v-f10c3218><dt data-v-f10c3218>${ssrInterpolate(unref(copy).reason)}</dt><dd data-v-f10c3218>`);
                if (example.errorDetail) {
                  _push(ssrRenderComponent(LearnerErrorDetailMessage, {
                    detail: example.errorDetail
                  }, null, _parent));
                } else {
                  _push(`<!--[-->${ssrInterpolate(unref(localizedLearnerErrorMessageForCode)(card.code, example.reason, unref(interfaceLocale)))}<!--]-->`);
                }
                _push(`</dd></div></dl></li>`);
              });
              _push(`<!--]--></ol>`);
              if (card.hasMoreExamples) {
                _push(`<div class="error-progress-examples__more" data-v-f10c3218><button type="button"${ssrIncludeBooleanAttr(unref(progressExamplesPendingCode) === card.code) ? " disabled" : ""} data-v-f10c3218>${ssrInterpolate(unref(progressExamplesPendingCode) === card.code ? unref(copy).loadingMoreErrors : unref(copy).seeMore)}</button></div>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</details>`);
            } else {
              _push(`<!---->`);
            }
            if (!__props.readOnly && errorChallengeIsAvailable(card)) {
              _push(`<button type="button" class="error-progress-card__challenge"${ssrIncludeBooleanAttr(Boolean(unref(errorChallengePendingCode)) || Boolean(unref(challengeStarting))) ? " disabled" : ""} data-v-f10c3218><span aria-hidden="true" data-v-f10c3218>▶</span><strong data-v-f10c3218>${ssrInterpolate(unref(errorChallengePendingCode) === card.code ? unref(copy).preparingErrorChallenge : errorChallengeButtonLabel(card))}</strong><small data-v-f10c3218>${ssrInterpolate(unref(copy).tenQuestionChallenge)}</small></button>`);
            } else {
              _push(`<!---->`);
            }
            if (unref(errorChallengeErrorCode) === card.code) {
              _push(`<p class="preferences-error" role="alert" data-v-f10c3218>${ssrInterpolate(unref(copy).prepareError)}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</article>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="learner-empty" data-v-f10c3218><strong data-v-f10c3218>${ssrInterpolate(unref(copy).insufficientData)}</strong><span data-v-f10c3218>${ssrInterpolate(unref(copy).futureErrorTypes)}</span></div>`);
        }
        _push(`</section>`);
      } else if (unref(activeTab) === "preferences") {
        _push(`<section class="learner-panel" aria-labelledby="preferences-title" data-v-f10c3218><div class="learner-panel__heading" data-v-f10c3218><div data-v-f10c3218><p class="learner-eyebrow" data-v-f10c3218>${ssrInterpolate(unref(copy).adaptInterface)}</p><h2 id="preferences-title" data-v-f10c3218>${ssrInterpolate(unref(copy).preferences)}</h2></div>`);
        if (unref(preferencesSaved)) {
          _push(`<span class="preferences-saved" data-v-f10c3218>${ssrInterpolate(unref(copy).saved)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (unref(preferencesError)) {
          _push(`<p class="preferences-error" role="alert" data-v-f10c3218>${ssrInterpolate(unref(preferencesError))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="preference-block" data-v-f10c3218><div data-v-f10c3218><h3 data-v-f10c3218>${ssrInterpolate(unref(copy).language)}</h3><p data-v-f10c3218>${ssrInterpolate(unref(copy).languageHint)}</p></div><div class="locale-choices" role="group"${ssrRenderAttr("aria-label", unref(copy).preferredLanguage)} data-v-f10c3218><!--[-->`);
        ssrRenderList(unref(localeOptions), (option) => {
          _push(`<button type="button" class="${ssrRenderClass({ "is-active": unref(preferredLocale) === option.value })}"${ssrIncludeBooleanAttr(__props.readOnly || unref(preferencesSaving)) ? " disabled" : ""} data-v-f10c3218><span aria-hidden="true" data-v-f10c3218>${ssrInterpolate(option.flag)}</span>${ssrInterpolate(option.label)}</button>`);
        });
        _push(`<!--]--></div></div><div class="preference-block" data-v-f10c3218><div data-v-f10c3218><h3 data-v-f10c3218>${ssrInterpolate(unref(copy).appearance)}</h3><p data-v-f10c3218>${ssrInterpolate(unref(copy).appearanceHint)}</p></div><div class="theme-choices" role="group"${ssrRenderAttr("aria-label", unref(copy).preferredAppearance)} data-v-f10c3218><button type="button" class="${ssrRenderClass({ "is-active": unref(preferredTheme) === "light" })}"${ssrIncludeBooleanAttr(__props.readOnly || unref(preferencesSaving)) ? " disabled" : ""} data-v-f10c3218><span aria-hidden="true" data-v-f10c3218>☀️</span> ${ssrInterpolate(unref(copy).light)}</button><button type="button" class="${ssrRenderClass({ "is-active": unref(preferredTheme) === "dark" })}"${ssrIncludeBooleanAttr(__props.readOnly || unref(preferencesSaving)) ? " disabled" : ""} data-v-f10c3218><span aria-hidden="true" data-v-f10c3218>🌙</span> ${ssrInterpolate(unref(copy).dark)}</button></div></div></section>`);
      } else {
        _push(`<section class="learner-panel account-panel" aria-labelledby="account-title" data-v-f10c3218><div class="learner-panel__heading" data-v-f10c3218><div data-v-f10c3218><p class="learner-eyebrow" data-v-f10c3218>${ssrInterpolate(unref(copy).dataSimply)}</p><h2 id="account-title" data-v-f10c3218>${ssrInterpolate(unref(copy).account)}</h2></div></div><div class="account-privacy" data-v-f10c3218><span aria-hidden="true" data-v-f10c3218>◌</span><div data-v-f10c3218><h3 data-v-f10c3218>${ssrInterpolate(unref(copy).privateAccount)}</h3><p data-v-f10c3218>${ssrInterpolate(text("privacy", { username: unref(displayUsername) }))}</p></div></div>`);
        if (unref(resultsDeleted)) {
          _push(`<p class="account-success" role="status" data-v-f10c3218>${ssrInterpolate(unref(copy).resultsDeleted)}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (!__props.readOnly) {
          _push(`<form id="change-password" class="account-password" data-v-f10c3218><div data-v-f10c3218><h3 data-v-f10c3218>${ssrInterpolate(unref(copy).changePassword)}</h3><p id="password-help" data-v-f10c3218>${ssrInterpolate(unref(copy).passwordHint)}</p></div><div class="account-password__fields" data-v-f10c3218><label class="is-current" data-v-f10c3218><span data-v-f10c3218>${ssrInterpolate(unref(copy).currentPassword)}</span><input${ssrRenderAttr("value", unref(passwordForm).currentPassword)} type="password" name="current-password" autocomplete="current-password" maxlength="200" required data-v-f10c3218></label><label data-v-f10c3218><span data-v-f10c3218>${ssrInterpolate(unref(copy).newPassword)}</span><input${ssrRenderAttr("value", unref(passwordForm).newPassword)} type="password" name="new-password" autocomplete="new-password" minlength="10" maxlength="200" aria-describedby="password-help" required data-v-f10c3218></label><label data-v-f10c3218><span data-v-f10c3218>${ssrInterpolate(unref(copy).confirmPassword)}</span><input${ssrRenderAttr("value", unref(passwordForm).confirmation)} type="password" name="new-password-confirmation" autocomplete="new-password" minlength="10" maxlength="200" required data-v-f10c3218></label></div>`);
          if (unref(passwordError)) {
            _push(`<p class="preferences-error" role="alert" data-v-f10c3218>${ssrInterpolate(unref(passwordError))}</p>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(passwordChanged)) {
            _push(`<p class="account-success" role="status" data-v-f10c3218>${ssrInterpolate(unref(copy).passwordChanged)}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<button type="submit" class="account-button account-button--primary"${ssrIncludeBooleanAttr(unref(passwordChanging)) ? " disabled" : ""} data-v-f10c3218>${ssrInterpolate(unref(passwordChanging) ? unref(copy).changing : unref(copy).changePasswordButton)}</button></form>`);
        } else {
          _push(`<!---->`);
        }
        if (!__props.readOnly) {
          _push(`<div class="account-actions" data-v-f10c3218><article data-v-f10c3218><div data-v-f10c3218><h3 data-v-f10c3218>${ssrInterpolate(unref(copy).deleteResults)}</h3><p data-v-f10c3218>${ssrInterpolate(unref(copy).deleteResultsHint)}</p></div><button type="button" class="account-button account-button--warning" data-v-f10c3218>${ssrInterpolate(unref(copy).deleteResults)}</button></article><article data-v-f10c3218><div data-v-f10c3218><h3 data-v-f10c3218>${ssrInterpolate(unref(copy).deleteAccount)}</h3><p data-v-f10c3218>${ssrInterpolate(text("deleteAccountHint", { username: unref(displayUsername) }))}</p></div><button type="button" class="account-button account-button--danger" data-v-f10c3218>${ssrInterpolate(unref(copy).deleteAccount)}</button></article></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</section>`);
      }
      if (unref(reviewOpen) && unref(reviewTracking) && unref(exercisePresentation) === "classic") {
        _push(ssrRenderComponent(ClassicExercise, {
          questions: unref(reviewQuestions),
          "exercise-kind": unref(reviewTracking).challenge.exerciseKind,
          "identification-tenses": unref(identificationTenses),
          "tracking-context": unref(reviewTracking),
          "require-success": unref(reviewRequireSuccess),
          "analytics-metadata": unref(reviewAnalyticsMetadata),
          onChangeCoach: ($event) => selectedCoach.value = $event,
          onClose: closeReview
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(reviewOpen) && unref(reviewTracking) && unref(exercisePresentation) === "chat" && unref(selectedCoach) && unref(selectedWork)) {
        _push(ssrRenderComponent(ChatExercise, {
          questions: unref(reviewQuestions),
          "exercise-kind": unref(reviewTracking).challenge.exerciseKind,
          coach: unref(selectedCoach),
          verbs: challengeVerbs(unref(selectedWork).challenge),
          tenses: challengeTenses(unref(selectedWork).challenge),
          "identification-tenses": unref(identificationTenses),
          "regenerate-questions": regenerateChatQuestions,
          "tracking-context": unref(reviewTracking),
          "learning-support-mode": unref(reviewTracking).challenge.learningSupportMode || "normal",
          "require-success": unref(reviewRequireSuccess),
          "analytics-metadata": unref(reviewAnalyticsMetadata),
          onClose: closeReview
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(coachPickerOpen)) {
        _push(ssrRenderComponent(CoachPicker, {
          "selection-pending": Boolean(unref(challengeStarting)),
          "selection-error": unref(challengeStartError),
          "learning-support-mode": unref(selectedWork)?.challenge.challenge.learningSupportMode || "normal",
          onClose: ($event) => coachPickerOpen.value = false,
          onSelect: launchWithCoach
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(historySummary)) {
        _push(ssrRenderComponent(_component_LearnerHistorySessionSummaryDialog, {
          title: unref(historySummaryTitle),
          items: unref(historySummary).report.items,
          "correct-count": unref(historySummary).challenge.correctCount,
          "total-count": unref(historySummary).challenge.correctCount + unref(historySummary).challenge.incorrectCount,
          onClose: ($event) => historySummary.value = void 0
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(accountDialog)) {
          _push2(`<div class="account-dialog-backdrop" role="presentation" data-v-f10c3218><section class="account-dialog" role="alertdialog" aria-modal="true" aria-labelledby="account-dialog-title" aria-describedby="account-dialog-description" data-v-f10c3218><button class="account-dialog__close" type="button"${ssrRenderAttr("aria-label", unref(copy).close)} autofocus${ssrIncludeBooleanAttr(unref(accountActionPending)) ? " disabled" : ""} data-v-f10c3218> × </button><span class="account-dialog__icon" aria-hidden="true" data-v-f10c3218>!</span><h2 id="account-dialog-title" data-v-f10c3218>${ssrInterpolate(unref(accountDialog) === "results" ? unref(copy).deleteAllResultsQuestion : unref(copy).deleteAccountQuestion)}</h2><p id="account-dialog-description" data-v-f10c3218>${ssrInterpolate(unref(accountDialog) === "results" ? text("deleteResultsDialog", { username: unref(displayUsername) }) : text("deleteAccountDialog", { username: unref(displayUsername) }))}</p>`);
          if (unref(accountActionError)) {
            _push2(`<p class="preferences-error" role="alert" data-v-f10c3218>${ssrInterpolate(unref(accountActionError))}</p>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="account-dialog__actions" data-v-f10c3218><button type="button"${ssrIncludeBooleanAttr(unref(accountActionPending)) ? " disabled" : ""} data-v-f10c3218>${ssrInterpolate(unref(copy).cancel)}</button><button type="button" class="is-danger"${ssrIncludeBooleanAttr(unref(accountActionPending)) ? " disabled" : ""} data-v-f10c3218>${ssrInterpolate(unref(accountActionPending) ? unref(copy).deleting : unref(accountDialog) === "results" ? unref(copy).confirmDeleteResults : unref(copy).confirmDeleteAccount)}</button></div></section></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/learner/LearnerSpace.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-f10c3218"]]), { __name: "LearnerSpace" });

export { __nuxt_component_0 as _ };
//# sourceMappingURL=LearnerSpace-CbKxnZI1.mjs.map
