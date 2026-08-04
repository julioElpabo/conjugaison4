import { $ as challengePresetGroupLabels, y as getRequestURL, F as legacyComplementOptions, G as legacyComplementConfig, a6 as challengePresetGroupOrder } from '../nitro/nitro.mjs';
import { D as DEFAULT_SHARED_CHALLENGE_OPTIONS } from '../_/challenge-defaults.mjs';
import { u as useState } from './state-DjsguMyT.mjs';
import { computed, defineComponent, ref, watch, mergeProps, unref, useTemplateRef, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderComponent, ssrRenderTeleport } from 'vue/server-renderer';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faArrowUpFromBracket } from '@fortawesome/free-solid-svg-icons';
import { l as useRequestEvent, f as useLanguagePreferences } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { u as useSiteAnalytics } from './useSiteAnalytics-D1wpWTOZ.mjs';
import { T as TENSE_IDENTIFICATION_INSTRUCTION } from '../_/exercise-instructions.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-icjx6oE7.mjs';
import { p as publicAssetsURL } from '../routes/renderer.mjs';
import { a as conjugationTenseOrder } from '../_/conjugation-display.mjs';
import { i as isNearFutureTense } from '../_/near-future.mjs';
import { n as normalizeVerbSearch, m as matchingVerbs } from '../_/verb-search.mjs';

function challengePresetTrackingTitle(preset) {
  const groupLabel = preset.groupLabel || challengePresetGroupLabels[preset.group] || preset.group;
  return [groupLabel, preset.label].filter(Boolean).join(" | ");
}
function challengePresetTrackingDescription(randomCount) {
  return Number.isInteger(randomCount) && Number(randomCount) > 0 ? `${Number(randomCount)} au hasard` : "Tous les verbes";
}

function estimatedTextLines(value, charactersPerLine) {
  const explicitLines = String(value || "").split(/\r?\n/u);
  return Math.max(1, explicitLines.reduce((total, line) => {
    const normalized = line.replace(/\s+/g, " ").trim();
    return total + Math.max(1, Math.ceil(normalized.length / charactersPerLine));
  }, 0));
}
function exerciseItemHeight(consigne, questionSpacingMm = 8) {
  return 5 + questionSpacingMm + (estimatedTextLines(consigne, 86) - 1) * 5;
}
function correctionItemHeight(consigne, answer) {
  const lines = Math.max(
    estimatedTextLines(consigne, 54),
    estimatedTextLines(answer, 38)
  );
  return 8 + (lines - 1) * 5;
}
function paginateByHeight(items, firstPageCapacity, nextPageCapacity, itemHeight) {
  const pages = [];
  let page = [];
  let used = 0;
  let capacity = firstPageCapacity;
  items.forEach((item, index) => {
    const height = Math.max(1, itemHeight(item));
    if (page.length > 0 && used + height > capacity) {
      pages.push(page);
      page = [];
      used = 0;
      capacity = nextPageCapacity;
    }
    page.push({ item, index });
    used += height;
  });
  if (page.length > 0) pages.push(page);
  return pages;
}

const ANSWER_DOTS = ".................................";
const GERUND_ANSWER_DOTS = "......................................";
const LONG_COMPLETION_SUFFIX_LENGTH = 32;
function withSubjunctiveCue(sentence, question) {
  var _a;
  if (((_a = question.mode) == null ? void 0 : _a.trim().toLocaleLowerCase("fr-CH")) !== "subjonctif" || question.complementPosition === "before" || /^(?:que|qu['’])\s*/iu.test(sentence)) return sentence;
  return `que ${sentence}`.replace(/^que (i(?:l|ls|el|els)|elle?s?|on)\b/iu, "qu'$1");
}
function completionParts(sentence, question) {
  var _a;
  const promptedSentence = withSubjunctiveCue(sentence.trim(), question);
  const [prefix = "", ...suffixParts] = promptedSentence.split("\u2026");
  const rawSuffix = suffixParts.join("\u2026").trim();
  const isImperative = ((_a = question.mode) == null ? void 0 : _a.trim().toLocaleLowerCase("fr-CH")) === "imp\xE9ratif";
  const suffix = isImperative && !rawSuffix.endsWith("!") ? `${rawSuffix}${rawSuffix ? " " : ""}!` : rawSuffix;
  const completionPrefix = question.complementPosition !== "before" && question.saisiePrefixe !== void 0 ? question.saisiePrefixe.trim() : prefix.trim();
  const dots = ANSWER_DOTS;
  const suffixOnNextLine = suffix.length > LONG_COMPLETION_SUFFIX_LENGTH;
  const blankWidthPercent = suffixOnNextLine ? Math.max(32, Math.min(58, 72 - Math.round(suffix.length * 0.65))) : 100;
  return {
    completionPrefix,
    completionSuffix: suffix,
    fillBlank: promptedSentence.includes("\u2026") || suffixParts.length === 0,
    suffixOnNextLine,
    blankWidthPercent,
    completion: [completionPrefix, dots, suffix].filter(Boolean).join(" ")
  };
}
function printableQuestionParts(question, exerciseKind) {
  var _a, _b;
  if (exerciseKind === "tense-identification") {
    const sentence2 = question.literaryCitation ? `${question.literaryCitation.before}\u3010${question.literaryCitation.target}\u3011${question.literaryCitation.after} \u2014 ${question.literaryCitation.author}, ${question.literaryCitation.work}` : question.consigne;
    return {
      label: "",
      completion: sentence2,
      completionPrefix: sentence2,
      completionSuffix: "",
      fillBlank: false,
      suffixOnNextLine: false,
      blankWidthPercent: 100
    };
  }
  if (((_a = question.mode) == null ? void 0 : _a.trim().toLocaleLowerCase("fr-CH")) === "g\xE9rondif") {
    const infinitive2 = question.infinitif || question.titre;
    const tenseAndMode2 = [question.temps, `(${question.mode})`].filter(Boolean).join(" ");
    return {
      label: `${infinitive2} | ${tenseAndMode2} :`,
      completion: `en ${GERUND_ANSWER_DOTS}`,
      completionPrefix: "en",
      completionSuffix: "",
      fillBlank: true,
      suffixOnNextLine: false,
      blankWidthPercent: 100
    };
  }
  if (((_b = question.mode) == null ? void 0 : _b.trim().toLocaleLowerCase("fr-CH")) === "participe") {
    const infinitive2 = question.infinitif || question.titre;
    const tenseAndMode2 = [question.temps, `(${question.mode})`].filter(Boolean).join(" ");
    return {
      label: `${infinitive2} | ${tenseAndMode2} :`,
      completion: ANSWER_DOTS,
      completionPrefix: "",
      completionSuffix: "",
      fillBlank: true,
      suffixOnNextLine: false,
      blankWidthPercent: 100
    };
  }
  const parts = question.consigne.split("|").map((part) => part.trim());
  if (parts.length < 3) {
    return {
      label: "",
      completion: question.consigne,
      completionPrefix: question.consigne,
      completionSuffix: "",
      fillBlank: false,
      suffixOnNextLine: false,
      blankWidthPercent: 100
    };
  }
  const sentence = parts.slice(0, -2).join(" | ");
  const infinitive = parts.at(-2) || question.infinitif || "";
  const tenseAndMode = parts.at(-1) || [question.temps, question.mode ? `(${question.mode})` : ""].filter(Boolean).join(" ");
  const completion = completionParts(sentence, question);
  return {
    label: `${infinitive} | ${tenseAndMode} :`,
    ...completion
  };
}
function printableQuestion(question, exerciseKind) {
  const parts = printableQuestionParts(question, exerciseKind);
  return [parts.label, parts.completion].filter(Boolean).join(" ");
}
function printableCorrectionAnswers(question) {
  const answers = [...new Set(question.reponsesPourCorrige.map((answer) => answer.trim()).filter(Boolean))];
  if (question.isCompound && answers.length > 1) return answers.slice(0, 1);
  return answers;
}
function printableCorrectionLabel(question, exerciseKind) {
  var _a;
  if (["g\xE9rondif", "participe"].includes(((_a = question.mode) == null ? void 0 : _a.trim().toLocaleLowerCase("fr-CH")) || "")) return question.consigne;
  const parts = printableQuestionParts(question, exerciseKind);
  return parts.label || parts.completion;
}
function printableCorrectionText(question) {
  return printableCorrectionAnswers(question).join("\n");
}

const createDefaultPrintOptions = () => ({
  title: "Défi de conjugaison",
  questionSpacingMm: 8,
  titleSpacingMm: 30,
  showGrade: true,
  showVerbs: false,
  showTenses: false,
  showFirstName: true,
  showLastName: true,
  showDate: true,
  showRandomNumber: true
});
const createDefaultChallenge = () => ({
  verbIds: [1, 2, 3, 4],
  tenseIds: [1, 3, 4, 5],
  questionCount: 10,
  ...DEFAULT_SHARED_CHALLENGE_OPTIONS,
  complementOptions: [...DEFAULT_SHARED_CHALLENGE_OPTIONS.complementOptions],
  printOptions: createDefaultPrintOptions()
});
function useChallengeBuilder() {
  const catalogue = useState("challenge-catalogue", () => ({
    verbes: [],
    modes: [],
    temps: [],
    presets: []
  }));
  const challenge = useState("challenge-config", createDefaultChallenge);
  const catalogueStatus = useState("challenge-catalogue-status", () => "idle");
  const catalogueError = useState("challenge-catalogue-error", () => "");
  const selectedVerbs = computed(() => {
    const byId = new Map(catalogue.value.verbes.map((verb) => [verb.id, verb]));
    return challenge.value.verbIds.map((id) => byId.get(id)).filter((verb) => Boolean(verb));
  });
  const selectedTenses = computed(() => {
    const byId = new Map(catalogue.value.temps.map((tense) => [tense.id, tense]));
    const modesById = new Map(catalogue.value.modes.map((mode) => [mode.id, mode]));
    return challenge.value.tenseIds.map((id) => byId.get(id)).filter((tense) => Boolean(tense)).map((tense) => ({ ...tense, mode: tense.mode || modesById.get(tense.modeId) }));
  });
  const isReady = computed(() => challenge.value.verbIds.length > 0 && challenge.value.tenseIds.length > 0 && challenge.value.questionCount > 0);
  function defaultTenseIds() {
    const indicative = catalogue.value.modes.find((mode) => mode.name.toLocaleLowerCase("fr") === "indicatif");
    if (!indicative) return [1, 3, 4, 5];
    const defaultNames = /* @__PURE__ */ new Set(["présent", "futur proche", "imparfait", "passé composé", "futur", "futur simple"]);
    return catalogue.value.temps.filter((tense) => tense.modeId === indicative.id && defaultNames.has(tense.name.toLocaleLowerCase("fr"))).map((tense) => tense.id);
  }
  async function loadCatalogue(force = false) {
    const hasTenseExamples = catalogue.value.temps.length > 0 && catalogue.value.temps.every((tense) => Boolean(tense.example?.trim()));
    if (!force && catalogueStatus.value === "success" && hasTenseExamples) {
      return catalogue.value;
    }
    catalogueStatus.value = "loading";
    catalogueError.value = "";
    try {
      const response = await $fetch("/api/catalogue");
      catalogue.value = {
        verbes: [...response.verbes].sort((a, b) => a.infinitif.localeCompare(b.infinitif, "fr")),
        modes: [...response.modes].sort((a, b) => a.order - b.order || a.id - b.id),
        temps: [...response.temps],
        presets: [...response.presets]
      };
      const validVerbIds = new Set(catalogue.value.verbes.map((verb) => verb.id));
      const validTenseIds = new Set(catalogue.value.temps.map((tense) => tense.id));
      const defaultSelectedTenses = defaultTenseIds();
      challenge.value.verbIds = challenge.value.verbIds.filter((id) => validVerbIds.has(id));
      challenge.value.tenseIds = challenge.value.tenseIds.filter((id) => validTenseIds.has(id));
      if (challenge.value.verbIds.length === 0) {
        challenge.value.verbIds = catalogue.value.verbes.slice(0, 4).map((verb) => verb.id);
      }
      if (challenge.value.tenseIds.length === 0) {
        challenge.value.tenseIds = defaultSelectedTenses.length > 0 ? defaultSelectedTenses : catalogue.value.temps.slice(0, 1).map((tense) => tense.id);
      }
      catalogueStatus.value = "success";
      return catalogue.value;
    } catch (error) {
      catalogueStatus.value = "error";
      catalogueError.value = getChallengeErrorMessage(error, "Impossible de charger le catalogue.");
      throw error;
    }
  }
  function addVerb(id) {
    if (!challenge.value.verbIds.includes(id)) {
      challenge.value.verbIds = [...challenge.value.verbIds, id];
    }
  }
  function removeVerb(id) {
    challenge.value.verbIds = challenge.value.verbIds.filter((verbId) => verbId !== id);
  }
  function clearVerbs() {
    challenge.value.verbIds = [];
  }
  function toggleTense(id) {
    challenge.value.tenseIds = challenge.value.tenseIds.includes(id) ? challenge.value.tenseIds.filter((tenseId) => tenseId !== id) : [...challenge.value.tenseIds, id];
  }
  function selectAllTenses() {
    challenge.value.tenseIds = catalogue.value.temps.map((tense) => tense.id);
  }
  function clearTenses() {
    challenge.value.tenseIds = [];
  }
  function selectDefaultTenses() {
    challenge.value.tenseIds = defaultTenseIds();
  }
  function applySelection(selection) {
    const validVerbIds = new Set(catalogue.value.verbes.map((verb) => verb.id));
    const validTenseIds = new Set(catalogue.value.temps.map((tense) => tense.id));
    challenge.value = {
      ...challenge.value,
      verbIds: selection.verbIds.filter((id) => validVerbIds.has(id)),
      tenseIds: selection.tenseIds.filter((id) => validTenseIds.has(id)),
      questionCount: selection.questionCount
    };
  }
  function applySharedChallenge(shared) {
    const defaults = createDefaultChallenge();
    applySelection(shared);
    const complementOptions = shared.complementOptions ?? (shared.includeComplements === void 0 ? [...defaults.complementOptions] : legacyComplementOptions(shared.includeComplements, shared.complementPlacement ?? "after"));
    const legacy = legacyComplementConfig(complementOptions);
    challenge.value = {
      ...challenge.value,
      exerciseKind: shared.exerciseKind ?? defaults.exerciseKind,
      identificationSource: shared.identificationSource ?? defaults.identificationSource,
      literaryRegister: shared.literaryRegister ?? defaults.literaryRegister,
      pastSimplePronouns: shared.pastSimplePronouns ?? defaults.pastSimplePronouns,
      inclusivePronouns: shared.inclusivePronouns ?? defaults.inclusivePronouns,
      includeComplements: legacy.includeComplements,
      complementPlacement: legacy.complementPlacement,
      complementOptions,
      printOptions: {
        ...defaults.printOptions,
        ...shared.printOptions ?? {}
      }
    };
  }
  return {
    catalogue,
    challenge,
    catalogueStatus,
    catalogueError,
    selectedVerbs,
    selectedTenses,
    isReady,
    loadCatalogue,
    addVerb,
    removeVerb,
    clearVerbs,
    toggleTense,
    selectAllTenses,
    clearTenses,
    selectDefaultTenses,
    applySelection,
    applySharedChallenge
  };
}
function getChallengeErrorMessage(error, fallback = "Une erreur est survenue.") {
  if (error && typeof error === "object") {
    const candidate = error;
    return candidate.data?.statusMessage || candidate.data?.message || candidate.statusMessage || candidate.message || fallback;
  }
  return fallback;
}
function toQuestionnaireRequest(challenge) {
  return {
    verbIds: [...challenge.verbIds],
    tenseIds: [...challenge.tenseIds],
    questionCount: challenge.questionCount,
    exerciseKind: challenge.exerciseKind,
    identificationSource: challenge.identificationSource ?? "selected-verbs",
    literaryRegister: challenge.literaryRegister ?? "all",
    pastSimplePronouns: challenge.pastSimplePronouns,
    inclusivePronouns: challenge.inclusivePronouns,
    includeComplements: challenge.includeComplements,
    complementPlacement: challenge.complementPlacement,
    complementOptions: [...challenge.complementOptions]
  };
}
function normalizeChallengeCode(value) {
  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (compact.length === 8) {
    return compact.match(/.{1,2}/g)?.join("-") ?? compact;
  }
  return value.trim().toUpperCase();
}
function toSharedChallengeRequest(challenge, title, description) {
  return {
    version: 1,
    ...title === void 0 ? {} : { title: title.trim() },
    ...description?.trim() ? { description: description.trim() } : {},
    verbIds: [...challenge.verbIds],
    tenseIds: [...challenge.tenseIds],
    questionCount: challenge.questionCount,
    exerciseKind: challenge.exerciseKind,
    identificationSource: challenge.identificationSource ?? "selected-verbs",
    literaryRegister: challenge.literaryRegister ?? "all",
    pastSimplePronouns: challenge.pastSimplePronouns,
    inclusivePronouns: challenge.inclusivePronouns,
    includeComplements: challenge.includeComplements,
    complementPlacement: challenge.complementPlacement,
    complementOptions: [...challenge.complementOptions],
    printOptions: { ...challenge.printOptions }
  };
}
function useChallengeApi() {
  async function generateQuestions(challenge) {
    return await $fetch("/api/questionnaires", {
      method: "POST",
      body: toQuestionnaireRequest(challenge)
    });
  }
  async function saveChallenge(challenge, title, description = "") {
    return await $fetch("/api/defis", {
      method: "POST",
      body: toSharedChallengeRequest(challenge, title, description)
    });
  }
  async function loadChallenge(rawCode) {
    const code = normalizeChallengeCode(rawCode);
    return await $fetch(`/api/defis/${encodeURIComponent(code)}`);
  }
  return {
    generateQuestions,
    saveChallenge,
    loadChallenge
  };
}
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "ChallengeActions",
  __ssrInlineRender: true,
  props: {
    ready: { type: Boolean },
    busyAction: {}
  },
  emits: ["exercise", "print", "save"],
  setup(__props, { emit: __emit }) {
    const { ui } = useLanguagePreferences();
    const randomCoachAvatar = useState("challenge-random-coach-avatar", () => "");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: "challenge-launch",
        "aria-labelledby": "launch-title"
      }, _attrs))}><div class="challenge-launch__heading"><div><p class="builder-card__eyebrow">${ssrInterpolate(unref(ui)("Ton défi est prêt"))}</p><h2 id="launch-title">${ssrInterpolate(unref(ui)("Comment veux-tu l’utiliser ?"))}</h2></div></div><div class="challenge-actions"${ssrRenderAttr("aria-label", unref(ui)("Lancer le défi"))}><button class="action-button action-button--primary" data-tour="action-classic" type="button"${ssrIncludeBooleanAttr(!__props.ready || Boolean(__props.busyAction)) ? " disabled" : ""}><span class="action-button__icon" aria-hidden="true">●</span><span><strong>${ssrInterpolate(__props.busyAction === "exercise" ? unref(ui)("Préparation…") : unref(ui)("Classique"))}</strong><small>${ssrInterpolate(unref(ui)("Questions et correction immédiate"))}</small></span></button><button class="action-button action-button--chat" data-tour="action-coach" type="button"${ssrIncludeBooleanAttr(!__props.ready || Boolean(__props.busyAction)) ? " disabled" : ""}><span class="action-button__icon" aria-hidden="true">`);
      if (unref(randomCoachAvatar)) {
        _push(`<img${ssrRenderAttr("src", unref(randomCoachAvatar))} alt="">`);
      } else {
        _push(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M4.5 21a7.5 7.5 0 0 1 15 0"></path></svg>`);
      }
      _push(`</span><span><strong>${ssrInterpolate(__props.busyAction === "exercise" ? unref(ui)("Préparation…") : unref(ui)("Avec un coach"))}</strong><small>${ssrInterpolate(unref(ui)("Dialogue virtuel avec une aide pas à pas"))}</small></span></button><button class="action-button action-button--print" data-tour="action-print" type="button"${ssrIncludeBooleanAttr(!__props.ready || Boolean(__props.busyAction)) ? " disabled" : ""}><span class="action-button__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><path d="M6 14h12v7H6z"></path><path d="M18 12h.01"></path></svg></span><span><strong>${ssrInterpolate(__props.busyAction === "print" ? unref(ui)("Préparation…") : unref(ui)("Imprimer"))}</strong><small>${ssrInterpolate(unref(ui)("Les questions et le corrigé"))}</small></span></button><button class="action-button action-button--share" data-tour="action-share" type="button"${ssrIncludeBooleanAttr(!__props.ready || Boolean(__props.busyAction)) ? " disabled" : ""}><span class="action-button__icon" aria-hidden="true">`);
      _push(ssrRenderComponent(unref(FontAwesomeIcon), { icon: unref(faArrowUpFromBracket) }, null, _parent));
      _push(`</span><span><strong>${ssrInterpolate(__props.busyAction === "save" ? unref(ui)("Sauvegarde…") : unref(ui)("Partager"))}</strong><small>${ssrInterpolate(unref(ui)("Partager ce défi avec d’autres personnes"))}</small></span></button></div></section>`);
    };
  }
});
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/challenge/ChallengeActions.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const ChallengeActions = Object.assign(_sfc_main$6, { __name: "ChallengeActions" });
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "ChallengeOptions",
  __ssrInlineRender: true,
  props: {
    questionCount: {},
    exerciseKind: {},
    identificationSource: {},
    inclusivePronouns: { type: Boolean },
    complementOptions: {},
    complementVerbs: {},
    eyebrow: {},
    idPrefix: {},
    gridLayout: { type: Boolean },
    conjugationInstruction: {},
    conjugationQuestionContext: {},
    conjugationQuestion: {},
    conjugationExample: {},
    conjugationExamplePrefix: {},
    conjugationExampleEmphasis: {},
    conjugationExampleSuffix: {},
    conjugationLiteraryCitation: {},
    conjugationExampleLoading: { type: Boolean },
    revealPrefilledOptions: { type: Boolean }
  },
  emits: ["updateQuestionCount", "updateExerciseKind", "updateIdentificationSource", "updateInclusivePronouns", "updateComplementOptions", "prefilledOptionsRevealStart"],
  setup(__props, { emit: __emit }) {
    const { ui } = useLanguagePreferences();
    const props = __props;
    const complementsOpen = ref(Boolean(props.gridLayout));
    const selectedComplementVerbs = computed(() => (props.complementVerbs ?? []).filter((verb) => Boolean(verb.complementExample)));
    const complementsAvailable = computed(() => props.exerciseKind === "conjugation" && selectedComplementVerbs.value.length > 0);
    const codAvailable = computed(() => selectedComplementVerbs.value.some((verb) => verb.complementFunctions?.includes("cod") || verb.complementExample?.functionObject === "cod"));
    const coiAvailable = computed(() => selectedComplementVerbs.value.some((verb) => verb.complementFunctions?.includes("coi") || verb.complementExample?.functionObject === "coi"));
    const codBeforeAvailable = computed(() => selectedComplementVerbs.value.some((verb) => verb.anteposableComplementFunctions?.includes("cod") || Boolean(verb.complementExample?.before)));
    const coiBeforeAvailable = computed(() => selectedComplementVerbs.value.some((verb) => verb.anteposableComplementFunctions?.includes("coi")));
    const idPrefix = computed(() => props.idPrefix ?? "challenge-options");
    const optionsTitleId = computed(() => `${idPrefix.value}-title`);
    const questionCountId = computed(() => `${idPrefix.value}-question-count`);
    const exerciseKindName = computed(() => `${idPrefix.value}-exercise-kind`);
    const identificationSourceName = computed(() => `${idPrefix.value}-identification-source`);
    const complementPanelId = computed(() => `${idPrefix.value}-complement-panel`);
    const hasConjugationExample = computed(() => Boolean(
      (props.conjugationInstruction || props.conjugationQuestionContext || props.conjugationQuestion) && props.conjugationExample
    ));
    const identificationQuestion = computed(() => {
      const question = props.conjugationQuestion?.trim() ?? "";
      return question && !/[.!?]$/u.test(question) ? `${question}.` : question;
    });
    const exampleRevealStage = ref(0);
    const exampleRevealTimers = [];
    const displayedQuestionCount = ref(props.questionCount);
    const displayedComplementOptions = ref([...props.complementOptions]);
    const prefilledRevealRunning = ref(false);
    ref(null);
    function clearExampleRevealTimers() {
      while (exampleRevealTimers.length) clearTimeout(exampleRevealTimers.pop());
    }
    watch(
      () => props.conjugationExampleLoading,
      (loading) => {
        clearExampleRevealTimers();
        exampleRevealStage.value = 0;
        if (loading) return;
        exampleRevealTimers.push(
          setTimeout(() => {
            exampleRevealStage.value = 1;
          }, 80),
          setTimeout(() => {
            exampleRevealStage.value = 2;
          }, 280)
        );
      },
      { immediate: true }
    );
    watch(() => props.questionCount, (value) => {
      if (!prefilledRevealRunning.value) displayedQuestionCount.value = value;
    });
    watch(() => props.complementOptions, (value) => {
      if (!prefilledRevealRunning.value) displayedComplementOptions.value = [...value];
    }, { deep: true });
    watch(() => props.revealPrefilledOptions, (reveal) => {
    });
    watch(complementsAvailable, (available) => {
      if (!available) complementsOpen.value = false;
      else if (props.gridLayout) complementsOpen.value = true;
    }, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: ["builder-card options-card", { "options-card--grid": __props.gridLayout, "options-card--revealing": unref(prefilledRevealRunning) }],
        "aria-labelledby": unref(optionsTitleId)
      }, _attrs))} data-v-a4b4faf2><div class="builder-card__header" data-v-a4b4faf2><div data-v-a4b4faf2><p class="builder-card__eyebrow" data-v-a4b4faf2>${ssrInterpolate(__props.eyebrow ?? "Étape 3")}</p><h2${ssrRenderAttr("id", unref(optionsTitleId))} data-v-a4b4faf2>${ssrInterpolate(unref(ui)("Mes options"))}</h2></div></div><div class="${ssrRenderClass([{ "options-layout--columns": __props.gridLayout }, "options-layout"])}" data-v-a4b4faf2><div class="${ssrRenderClass([{ "options-fields--columns": __props.gridLayout }, "options-fields"])}" data-v-a4b4faf2><div class="options-main-column" data-v-a4b4faf2><label class="field-stack question-count-field"${ssrRenderAttr("for", unref(questionCountId))} data-v-a4b4faf2><span data-v-a4b4faf2>${ssrInterpolate(unref(ui)("Nombre de questions"))}</span><input${ssrRenderAttr("id", unref(questionCountId))} type="number" inputmode="numeric" min="1" max="99" step="1"${ssrRenderAttr("value", unref(displayedQuestionCount))} data-v-a4b4faf2></label><label class="check-row" data-v-a4b4faf2><input type="checkbox"${ssrIncludeBooleanAttr(__props.inclusivePronouns) ? " checked" : ""} data-v-a4b4faf2><span data-v-a4b4faf2>${ssrInterpolate(unref(ui)("Inclure les pronoms"))} <strong data-v-a4b4faf2>iel / iels</strong><small data-v-a4b4faf2>${ssrInterpolate(unref(ui)("Ils apparaîtront ponctuellement dans les questions."))}</small></span></label><fieldset class="option-fieldset" data-v-a4b4faf2><legend data-v-a4b4faf2>${ssrInterpolate(unref(ui)("Type d’exercice"))}</legend><div class="segmented-control" data-v-a4b4faf2><label data-v-a4b4faf2><input type="radio"${ssrRenderAttr("name", unref(exerciseKindName))} value="conjugation"${ssrIncludeBooleanAttr(__props.exerciseKind === "conjugation") ? " checked" : ""} data-v-a4b4faf2><span data-v-a4b4faf2>${ssrInterpolate(unref(ui)("Conjuguer"))}</span></label><label data-v-a4b4faf2><input type="radio"${ssrRenderAttr("name", unref(exerciseKindName))} value="tense-identification"${ssrIncludeBooleanAttr(__props.exerciseKind === "tense-identification") ? " checked" : ""} data-v-a4b4faf2><span data-v-a4b4faf2>${ssrInterpolate(unref(ui)("Trouver le mode et le temps"))}</span></label></div></fieldset>`);
      if (__props.exerciseKind === "tense-identification") {
        _push(`<fieldset class="option-fieldset identification-source-fieldset" data-v-a4b4faf2><legend class="sr-only" data-v-a4b4faf2>Choix des verbes</legend><div class="segmented-control segmented-control--stacked" data-v-a4b4faf2><label data-v-a4b4faf2><input type="radio"${ssrRenderAttr("name", unref(identificationSourceName))} value="selected-verbs"${ssrIncludeBooleanAttr(__props.identificationSource === "selected-verbs") ? " checked" : ""} data-v-a4b4faf2><span data-v-a4b4faf2><strong data-v-a4b4faf2>Avec mes verbes</strong><small data-v-a4b4faf2>Formes conjuguées simples, sans citation.</small></span></label><label data-v-a4b4faf2><input type="radio"${ssrRenderAttr("name", unref(identificationSourceName))} value="literary-corpus"${ssrIncludeBooleanAttr(__props.identificationSource === "literary-corpus") ? " checked" : ""} data-v-a4b4faf2><span data-v-a4b4faf2><strong data-v-a4b4faf2>Avec n’importe quel verbe</strong><small data-v-a4b4faf2>Construits avec des phrases littéraires</small></span></label></div></fieldset>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div data-tour="options-complements" class="${ssrRenderClass([{
        "complement-options--disabled": !unref(complementsAvailable),
        "complement-options--hidden": __props.gridLayout && __props.exerciseKind === "tense-identification"
      }, "complement-options"])}"${ssrRenderAttr("aria-hidden", __props.gridLayout && __props.exerciseKind === "tense-identification" ? "true" : void 0)} data-v-a4b4faf2>`);
      if (__props.gridLayout) {
        _push(`<h3 class="complement-options__title" data-v-a4b4faf2>${ssrInterpolate(unref(ui)("Compléments d’objets :"))}</h3>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.gridLayout) {
        _push(`<p class="complement-options__description" data-v-a4b4faf2>${ssrInterpolate(unref(ui)("Ajoute des compléments d’objets directs ou indirects."))}</p>`);
      } else {
        _push(`<button class="complement-options__trigger" type="button"${ssrIncludeBooleanAttr(!unref(complementsAvailable)) ? " disabled" : ""}${ssrRenderAttr("aria-expanded", unref(complementsOpen))}${ssrRenderAttr("aria-controls", unref(complementPanelId))} data-v-a4b4faf2><span data-v-a4b4faf2>${ssrInterpolate(unref(ui)("Compléments d’objets :"))} <small data-v-a4b4faf2>${ssrInterpolate(unref(ui)("nouveau"))}</small></span><span aria-hidden="true" data-v-a4b4faf2>${ssrInterpolate(unref(complementsOpen) ? "−" : "+")}</span></button>`);
      }
      if (!unref(complementsAvailable)) {
        _push(`<p class="complement-options__unavailable" data-v-a4b4faf2>${ssrInterpolate(__props.exerciseKind !== "conjugation" ? "Disponible uniquement pour un exercice de conjugaison." : "Les verbes choisis ne proposent pas de complément.")}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.gridLayout || unref(complementsOpen)) {
        _push(`<fieldset${ssrRenderAttr("id", unref(complementPanelId))} class="complement-options__panel" data-v-a4b4faf2><legend class="sr-only" data-v-a4b4faf2>${ssrInterpolate(unref(ui)("Présentation des compléments d’objets"))}</legend><label data-v-a4b4faf2><input type="checkbox"${ssrIncludeBooleanAttr(!unref(complementsAvailable) || !unref(codAvailable)) ? " disabled" : ""}${ssrIncludeBooleanAttr(unref(displayedComplementOptions).includes("cod-after")) ? " checked" : ""} data-v-a4b4faf2><span data-v-a4b4faf2><strong data-v-a4b4faf2>${ssrInterpolate(unref(ui)("COD placé après"))}</strong></span></label><label data-v-a4b4faf2><input type="checkbox"${ssrIncludeBooleanAttr(!unref(complementsAvailable) || !unref(codBeforeAvailable)) ? " disabled" : ""}${ssrIncludeBooleanAttr(unref(displayedComplementOptions).includes("cod-before")) ? " checked" : ""} data-v-a4b4faf2><span data-v-a4b4faf2><strong data-v-a4b4faf2>${ssrInterpolate(unref(ui)("COD placé avant"))}</strong></span></label><label data-v-a4b4faf2><input type="checkbox"${ssrIncludeBooleanAttr(!unref(complementsAvailable) || !unref(coiAvailable)) ? " disabled" : ""}${ssrIncludeBooleanAttr(unref(displayedComplementOptions).includes("coi-after")) ? " checked" : ""} data-v-a4b4faf2><span data-v-a4b4faf2><strong data-v-a4b4faf2>${ssrInterpolate(unref(ui)("COI placé après"))}</strong></span></label><label data-v-a4b4faf2><input type="checkbox"${ssrIncludeBooleanAttr(!unref(complementsAvailable) || !unref(coiBeforeAvailable)) ? " disabled" : ""}${ssrIncludeBooleanAttr(unref(displayedComplementOptions).includes("coi-before")) ? " checked" : ""} data-v-a4b4faf2><span data-v-a4b4faf2><strong data-v-a4b4faf2>${ssrInterpolate(unref(ui)("COI placé avant"))}</strong></span></label></fieldset>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (__props.gridLayout && (__props.conjugationExampleLoading || unref(hasConjugationExample))) {
        _push(`<div data-tour="options-preview" class="${ssrRenderClass([{ "conjugation-example--wide": __props.exerciseKind === "tense-identification" }, "conjugation-example"])}" aria-live="polite" aria-atomic="true" data-v-a4b4faf2><div class="conjugation-example__header" data-v-a4b4faf2><span class="conjugation-example__preview-icon" aria-hidden="true" data-v-a4b4faf2><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" data-v-a4b4faf2><path d="M1.5 12s3.8-7 10.5-7 10.5 7 10.5 7-3.8 7-10.5 7S1.5 12 1.5 12Z" data-v-a4b4faf2></path><circle cx="12" cy="12" r="3" data-v-a4b4faf2></circle></svg></span><div class="conjugation-example__heading" data-v-a4b4faf2><span data-v-a4b4faf2>${ssrInterpolate(unref(ui)("Aperçu d’une question"))}</span></div></div><div class="conjugation-example__screen" data-v-a4b4faf2>`);
        if (__props.conjugationExampleLoading) {
          _push(`<div class="conjugation-example__loading" role="status" data-v-a4b4faf2><span class="conjugation-example__spinner" aria-hidden="true" data-v-a4b4faf2></span><span class="sr-only" data-v-a4b4faf2>${ssrInterpolate(unref(ui)("Préparation de l’aperçu"))}</span></div>`);
        } else {
          _push(`<div class="conjugation-example__body" data-v-a4b4faf2>`);
          if (unref(exampleRevealStage) >= 1) {
            _push(`<div class="conjugation-example__question" data-v-a4b4faf2><span class="conjugation-example__block-label" data-v-a4b4faf2>${ssrInterpolate(unref(ui)("Exemple de question"))}</span>`);
            if (__props.exerciseKind === "tense-identification" && __props.conjugationInstruction && __props.conjugationQuestion) {
              _push(`<!--[--><p class="conjugation-example__instruction" data-v-a4b4faf2>${ssrInterpolate(__props.conjugationInstruction)}</p>`);
              if (__props.conjugationLiteraryCitation) {
                _push(`<blockquote class="conjugation-example__citation" data-v-a4b4faf2><p data-v-a4b4faf2><span data-v-a4b4faf2>${ssrInterpolate(__props.conjugationLiteraryCitation.before)}</span><mark data-v-a4b4faf2>${ssrInterpolate(__props.conjugationLiteraryCitation.target)}</mark><span data-v-a4b4faf2>${ssrInterpolate(__props.conjugationLiteraryCitation.after)}</span></p><footer data-v-a4b4faf2>${ssrInterpolate(__props.conjugationLiteraryCitation.author)}, <cite data-v-a4b4faf2>${ssrInterpolate(__props.conjugationLiteraryCitation.work)}</cite></footer></blockquote>`);
              } else {
                _push(`<p class="conjugation-example__question-line" data-v-a4b4faf2><span class="conjugation-example__prompt" data-v-a4b4faf2>${ssrInterpolate(unref(identificationQuestion))}</span></p>`);
              }
              _push(`<!--]-->`);
            } else {
              _push(`<!--[-->`);
              if (__props.conjugationInstruction) {
                _push(`<p class="conjugation-example__instruction" data-v-a4b4faf2>${ssrInterpolate(__props.conjugationInstruction)}</p>`);
              } else {
                _push(`<!---->`);
              }
              if (__props.conjugationQuestionContext) {
                _push(`<p class="conjugation-example__question-line" data-v-a4b4faf2><span class="conjugation-example__context" data-v-a4b4faf2>${ssrInterpolate(__props.conjugationQuestionContext)}</span></p>`);
              } else {
                _push(`<!---->`);
              }
              _push(`<!--]-->`);
            }
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(exampleRevealStage) >= 2) {
            _push(`<div class="conjugation-example__correction" data-v-a4b4faf2><span data-v-a4b4faf2>${ssrInterpolate(unref(ui)("Réponse attendue"))}</span><p data-v-a4b4faf2>`);
            if (__props.conjugationExampleEmphasis) {
              _push(`<!--[--><span data-v-a4b4faf2>${ssrInterpolate(__props.conjugationExamplePrefix)}</span><strong data-v-a4b4faf2>${ssrInterpolate(__props.conjugationExampleEmphasis)}</strong><span data-v-a4b4faf2>${ssrInterpolate(__props.conjugationExampleSuffix)}</span><!--]-->`);
            } else {
              _push(`<span data-v-a4b4faf2>${ssrInterpolate(__props.conjugationExample)}</span>`);
            }
            _push(`</p></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></section>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/challenge/ChallengeOptions.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const ChallengeOptions = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$5, [["__scopeId", "data-v-a4b4faf2"]]), { __name: "ChallengeOptions" });
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "PresetPicker",
  __ssrInlineRender: true,
  props: {
    presets: {},
    activePresetId: {},
    compact: { type: Boolean },
    verbs: {},
    modes: {},
    tenses: {}
  },
  emits: ["select", "stageChange"],
  setup(__props, { emit: __emit }) {
    const { ui, uiLabel } = useLanguagePreferences();
    useSiteAnalytics();
    const props = __props;
    const groupedPresets = computed(() => {
      const groups = /* @__PURE__ */ new Map();
      props.presets.forEach((preset) => {
        const current = groups.get(preset.group) ?? [];
        current.push(preset);
        groups.set(preset.group, current);
      });
      return [...groups.entries()].map(([id, presets]) => ({
        id,
        label: presets[0]?.groupLabel ?? challengePresetGroupLabels[id] ?? id,
        order: presets[0]?.groupOrder ?? challengePresetGroupOrder.indexOf(id),
        presets
      })).sort((left, right) => left.order - right.order || left.label.localeCompare(right.label, "fr"));
    });
    const activeGroupId = ref("school");
    const activeGroup = computed(() => groupedPresets.value.find((group) => group.id === activeGroupId.value) ?? groupedPresets.value[0]);
    const mobilePresetId = ref("");
    computed(() => props.presets.find((preset) => preset.id === mobilePresetId.value));
    const compactGroupId = ref(null);
    const selectedCompactPresetId = ref(null);
    const compactGroup = computed(() => groupedPresets.value.find((group) => group.id === compactGroupId.value));
    const selectedCompactPreset = computed(() => props.presets.find((preset) => preset.id === selectedCompactPresetId.value));
    ref(null);
    const hoveredInfoPresetId = ref(null);
    const pinnedInfoPresetId = ref(null);
    const verbNameById = computed(() => new Map((props.verbs ?? []).map((verb) => [verb.id, verb.infinitif])));
    const tenseById = computed(() => new Map((props.tenses ?? []).map((tense) => [tense.id, tense])));
    const modeById = computed(() => new Map((props.modes ?? []).map((mode) => [mode.id, mode])));
    function infoIsOpen(presetId) {
      return hoveredInfoPresetId.value === presetId || pinnedInfoPresetId.value === presetId;
    }
    function infoVerbNames(preset) {
      return preset.verbIds.slice(0, 12).map((id) => verbNameById.value.get(id) ?? `Verbe ${id}`);
    }
    function infoTenseGroups(preset) {
      const groups = /* @__PURE__ */ new Map();
      for (const id of preset.tenseIds) {
        const tense = tenseById.value.get(id);
        if (!tense) continue;
        const mode = modeById.value.get(tense.modeId);
        const group = groups.get(tense.modeId) ?? {
          mode: uiLabel(mode?.name ?? tense.mode?.name ?? ui("Autres temps")),
          order: mode?.order ?? tense.mode?.order ?? Number.MAX_SAFE_INTEGER,
          tenses: []
        };
        group.tenses.push(uiLabel(tense.name));
        groups.set(tense.modeId, group);
      }
      return [...groups.values()].sort((left, right) => left.order - right.order || left.mode.localeCompare(right.mode, "fr"));
    }
    function exposePresets(presets) {
      return;
    }
    watch([() => props.compact, activeGroup, compactGroup], ([compact, currentGroup, currentCompactGroup]) => {
      if (compact) {
        if (currentCompactGroup) exposePresets(currentCompactGroup.presets);
        return;
      }
      if (currentGroup) exposePresets(currentGroup.presets);
    }, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: ["preset-panel", { "preset-panel--compact": __props.compact }],
        "aria-labelledby": __props.compact ? void 0 : "presets-title",
        "aria-label": __props.compact ? "Défis prêts à l’emploi" : void 0
      }, _attrs))} data-v-405192b2>`);
      if (__props.compact) {
        _push(`<div class="preset-browser" data-v-405192b2><div class="preset-browser__scroll" data-v-405192b2><div class="preset-browser__columns" data-v-405192b2><section class="preset-browser__column" data-browser-column="1" aria-labelledby="preset-browser-groups" data-v-405192b2><h3 id="preset-browser-groups" data-v-405192b2>${ssrInterpolate(unref(ui)("Catégories"))}</h3><div class="preset-browser__list" data-v-405192b2><!--[-->`);
        ssrRenderList(unref(groupedPresets), (group) => {
          _push(`<button type="button" class="${ssrRenderClass({ "is-selected": unref(compactGroupId) === group.id })}"${ssrRenderAttr("aria-pressed", unref(compactGroupId) === group.id)} data-v-405192b2><span data-v-405192b2>${ssrInterpolate(group.label)}</span><span class="preset-browser__chevron" aria-hidden="true" data-v-405192b2>›</span></button>`);
        });
        _push(`<!--]--></div></section>`);
        if (unref(compactGroup)) {
          _push(`<section class="preset-browser__column" data-browser-column="2"${ssrRenderAttr("aria-label", `Défis de ${unref(compactGroup).label}`)} data-v-405192b2><div class="preset-browser__list" data-v-405192b2><!--[-->`);
          ssrRenderList(unref(compactGroup).presets, (preset) => {
            _push(`<div class="preset-browser__preset-row" data-v-405192b2><div class="preset-browser__info" data-preset-info data-v-405192b2><button class="preset-browser__info-button" type="button"${ssrRenderAttr("aria-expanded", infoIsOpen(preset.id))}${ssrRenderAttr("aria-controls", `preset-info-${preset.id}`)}${ssrRenderAttr("aria-label", `Informations sur ${preset.label}`)} data-v-405192b2>i</button>`);
            if (infoIsOpen(preset.id)) {
              _push(`<section${ssrRenderAttr("id", `preset-info-${preset.id}`)} class="preset-browser__tooltip" aria-live="polite" data-v-405192b2><header data-v-405192b2><strong data-v-405192b2>${ssrInterpolate(preset.label)}</strong><span data-v-405192b2>${ssrInterpolate(preset.questionCount)} ${ssrInterpolate(unref(ui)("questions"))}</span></header><div class="preset-browser__tooltip-section" data-v-405192b2><h4 data-v-405192b2>${ssrInterpolate(unref(ui)("Verbes"))}</h4><div class="preset-browser__verb-badges" data-v-405192b2><!--[-->`);
              ssrRenderList(infoVerbNames(preset), (verb) => {
                _push(`<span data-v-405192b2>${ssrInterpolate(verb)}</span>`);
              });
              _push(`<!--]--></div>`);
              if (preset.verbIds.length > 12) {
                _push(`<p class="preset-browser__other-verbs" data-v-405192b2>+ ${ssrInterpolate(preset.verbIds.length - 12)} ${ssrInterpolate(unref(ui)("autres verbes"))}</p>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div><div class="preset-browser__tooltip-section" data-v-405192b2><h4 data-v-405192b2>${ssrInterpolate(unref(ui)("Temps"))}</h4><dl data-v-405192b2><!--[-->`);
              ssrRenderList(infoTenseGroups(preset), (group) => {
                _push(`<div data-v-405192b2><dt data-v-405192b2>${ssrInterpolate(group.mode)}</dt><dd data-v-405192b2>${ssrInterpolate(group.tenses.join(", "))}</dd></div>`);
              });
              _push(`<!--]--></dl></div></section>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><button type="button" class="${ssrRenderClass([{ "is-selected": unref(selectedCompactPresetId) === preset.id || __props.activePresetId === preset.id }, "preset-browser__preset-button"])}"${ssrRenderAttr("aria-pressed", unref(selectedCompactPresetId) === preset.id)} data-v-405192b2><span data-v-405192b2><strong data-v-405192b2>${ssrInterpolate(preset.label)}</strong></span><span class="preset-browser__chevron" aria-hidden="true" data-v-405192b2>›</span></button></div>`);
          });
          _push(`<!--]--></div></section>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(selectedCompactPreset)) {
          _push(`<section class="preset-browser__column preset-browser__column--quantity" data-browser-column="3"${ssrRenderAttr("aria-label", unref(ui)("Choisir le nombre de verbes"))} data-v-405192b2><div class="preset-browser__list" data-v-405192b2><button type="button" data-v-405192b2><span data-v-405192b2><strong data-v-405192b2>${ssrInterpolate(unref(ui)("Tous les verbes"))}</strong></span><span class="preset-browser__count" data-v-405192b2>${ssrInterpolate(unref(selectedCompactPreset).verbIds.length)}</span><span class="preset-browser__launch" aria-hidden="true" data-v-405192b2>→</span></button><span class="preset-browser__quantity-separator" aria-hidden="true" data-v-405192b2></span>`);
          if (unref(selectedCompactPreset).verbIds.length >= 1 && unref(selectedCompactPreset).verbIds.length < 5) {
            _push(`<button type="button" data-v-405192b2><span data-v-405192b2><strong data-v-405192b2>${ssrInterpolate(unref(ui)("1 au hasard"))}</strong></span><span class="preset-browser__count" data-v-405192b2>1</span><span class="preset-browser__launch" aria-hidden="true" data-v-405192b2>→</span></button>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(selectedCompactPreset).verbIds.length >= 2 && unref(selectedCompactPreset).verbIds.length < 5) {
            _push(`<button type="button" data-v-405192b2><span data-v-405192b2><strong data-v-405192b2>${ssrInterpolate(unref(ui)("2 au hasard"))}</strong></span><span class="preset-browser__count" data-v-405192b2>2</span><span class="preset-browser__launch" aria-hidden="true" data-v-405192b2>→</span></button>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(selectedCompactPreset).verbIds.length >= 3) {
            _push(`<button type="button" data-v-405192b2><span data-v-405192b2><strong data-v-405192b2>${ssrInterpolate(unref(ui)("3 au hasard"))}</strong></span><span class="preset-browser__count" data-v-405192b2>3</span><span class="preset-browser__launch" aria-hidden="true" data-v-405192b2>→</span></button>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(selectedCompactPreset).verbIds.length >= 5) {
            _push(`<button type="button" data-v-405192b2><span data-v-405192b2><strong data-v-405192b2>${ssrInterpolate(unref(ui)("5 au hasard"))}</strong></span><span class="preset-browser__count" data-v-405192b2>5</span><span class="preset-browser__launch" aria-hidden="true" data-v-405192b2>→</span></button>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(selectedCompactPreset).verbIds.length >= 10) {
            _push(`<button type="button" data-v-405192b2><span data-v-405192b2><strong data-v-405192b2>${ssrInterpolate(unref(ui)("10 au hasard"))}</strong></span><span class="preset-browser__count" data-v-405192b2>10</span><span class="preset-browser__launch" aria-hidden="true" data-v-405192b2>→</span></button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></section>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div>`);
      } else {
        _push(`<!--[--><div class="preset-panel__intro" data-v-405192b2><div data-v-405192b2><p class="builder-card__eyebrow" data-v-405192b2>${ssrInterpolate(unref(ui)("Pour démarrer rapidement"))}</p><h2 id="presets-title" data-v-405192b2>${ssrInterpolate(unref(ui)("Défis prêts à l’emploi"))}</h2></div><p data-v-405192b2>${ssrInterpolate(unref(ui)("Choisissez un niveau ou une famille de verbes, puis ajustez librement la sélection."))}</p></div><label class="preset-mobile-select" data-v-405192b2><span data-v-405192b2>${ssrInterpolate(unref(ui)("Choisir un défi prêt à l’emploi"))}</span><select${ssrRenderAttr("value", __props.activePresetId ?? unref(mobilePresetId))} data-v-405192b2><option value="" data-v-405192b2>${ssrInterpolate(unref(ui)("Choisir un niveau ou un entraînement…"))}</option><!--[-->`);
        ssrRenderList(unref(groupedPresets), (group) => {
          _push(`<optgroup${ssrRenderAttr("label", group.label)} data-v-405192b2><!--[-->`);
          ssrRenderList(group.presets, (preset) => {
            _push(`<option${ssrRenderAttr("value", preset.id)} data-v-405192b2>${ssrInterpolate(preset.label)} — ${ssrInterpolate(preset.verbIds.length)} ${ssrInterpolate(unref(ui)("verbes"))}</option>`);
          });
          _push(`<!--]--></optgroup>`);
        });
        _push(`<!--]--></select></label><div class="preset-groups" role="tablist"${ssrRenderAttr("aria-label", unref(ui)("Catégories de défis"))} data-v-405192b2><!--[-->`);
        ssrRenderList(unref(groupedPresets), (group, index) => {
          _push(`<button${ssrRenderAttr("id", `preset-tab-${group.id}`)} class="${ssrRenderClass([{ "preset-group-button--active": unref(activeGroup)?.id === group.id }, "preset-group-button"])}" type="button" role="tab"${ssrRenderAttr("aria-selected", unref(activeGroup)?.id === group.id)}${ssrRenderAttr("aria-controls", `preset-content-${group.id}`)}${ssrRenderAttr("tabindex", unref(activeGroup)?.id === group.id ? 0 : -1)} data-v-405192b2>${ssrInterpolate(group.label)}</button>`);
        });
        _push(`<!--]--></div>`);
        if (unref(activeGroup)) {
          _push(`<div${ssrRenderAttr("id", `preset-content-${unref(activeGroup).id}`)} class="preset-list" role="tabpanel"${ssrRenderAttr("aria-labelledby", `preset-tab-${unref(activeGroup).id}`)} data-v-405192b2><!--[-->`);
          ssrRenderList(unref(activeGroup).presets, (preset) => {
            _push(`<article class="${ssrRenderClass([{ "preset-card--active": __props.activePresetId === preset.id }, "preset-card"])}" data-v-405192b2><button type="button" data-v-405192b2><strong data-v-405192b2>${ssrInterpolate(preset.label)}</strong><span data-v-405192b2>${ssrInterpolate(preset.description)}</span><small data-v-405192b2>${ssrInterpolate(preset.verbIds.length)} verbes · ${ssrInterpolate(preset.questionCount)} ${ssrInterpolate(unref(ui)("questions"))}</small></button>`);
            if (preset.verbIds.length > 5) {
              _push(`<div class="preset-card__random" data-v-405192b2>${ssrInterpolate(unref(ui)("Au hasard :"))} <button type="button" data-v-405192b2>1</button><button type="button" data-v-405192b2>5</button><button type="button" data-v-405192b2>10</button></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</article>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/challenge/PresetPicker.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const PresetPicker = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$4, [["__scopeId", "data-v-405192b2"]]), { __name: "ChallengePresetPicker" });
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "PrintPreview",
  __ssrInlineRender: true,
  props: {
    questions: {},
    verbs: {},
    tenses: {},
    exerciseKind: {},
    options: {}
  },
  emits: ["close", "updateOptions"],
  setup(__props, { emit: __emit }) {
    const { ui, uiLabel } = useLanguagePreferences();
    const props = __props;
    useSiteAnalytics();
    const sheetNumber = Math.floor(Math.random() * 9e3) + 1e3;
    useTemplateRef("print-dialog");
    const isPdfBusy = ref(false);
    const isWordBusy = ref(false);
    const isPdfPreviewBusy = ref(true);
    const isPdfPreviewFrameReady = ref(false);
    const pdfPreviewUrl = ref("");
    const pdfPreviewError = ref("");
    let pdfPreviewGeneration = 0;
    let pdfPreviewTimer;
    function boundedOption(value, fallback, minimum, maximum) {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? Math.min(maximum, Math.max(minimum, parsed)) : fallback;
    }
    const questionSpacingMm = computed(() => boundedOption(props.options.questionSpacingMm, 8, 2, 15));
    const titleSpacingMm = computed(() => boundedOption(props.options.titleSpacingMm, 30, 8, 30));
    const isTenseIdentification = computed(() => props.exerciseKind === "tense-identification");
    const identificationAnswerHeightMm = computed(() => 8 + Math.max(0, 5 - questionSpacingMm.value));
    const exerciseFirstPageCapacity = computed(() => {
      let capacity = 226;
      if (props.options.showFirstName || props.options.showLastName || props.options.showDate) {
        capacity -= Math.max(0, titleSpacingMm.value - 1);
      }
      if (props.options.showVerbs) capacity -= 8;
      if (props.options.showTenses) capacity -= 8;
      if (isTenseIdentification.value) capacity -= 19;
      return capacity;
    });
    const exercisePages = computed(() => paginateByHeight(
      props.questions,
      exerciseFirstPageCapacity.value,
      220,
      (question) => {
        const printable = printableQuestionParts(question, props.exerciseKind);
        return exerciseItemHeight(printableQuestion(question, props.exerciseKind), questionSpacingMm.value) + (printable.suffixOnNextLine ? 6 : 0) + (isTenseIdentification.value ? identificationAnswerHeightMm.value : 0) + (question.literaryCitation ? 4 : 0);
      }
    ));
    const correctionPages = computed(() => paginateByHeight(
      props.questions,
      205,
      220,
      (question) => isTenseIdentification.value ? correctionItemHeight("", printableCorrectionText(question)) : correctionItemHeight(printableCorrectionLabel(question, props.exerciseKind), printableCorrectionText(question))
    ));
    function pdfSafe(value) {
      return String(value ?? "").replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/…/g, "...").replace(/–|—/g, "-").replace(/【/g, "[").replace(/】/g, "]");
    }
    function capitalizePrintLine(value) {
      return String(value ?? "").replace(
        new RegExp("^(\\s*)(\\p{L})", "u"),
        (_match, spacing, letter) => `${spacing}${letter.toLocaleUpperCase("fr-CH")}`
      );
    }
    function capitalizePrintText(value) {
      return String(value ?? "").split("\n").map(capitalizePrintLine).join("\n");
    }
    async function buildPdf() {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      const pageWidth = 210;
      const pageHeight = 297;
      const left = 17;
      const right = 193;
      const title = pdfSafe(props.options.title || ui("Défi de conjugaison"));
      const identifier = props.options.showRandomNumber ? ` n° ${sheetNumber}` : "";
      let pageCount = 0;
      function addPage() {
        if (pageCount > 0) pdf.addPage("a4", "portrait");
        pageCount += 1;
      }
      function drawFooter() {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(105, 105, 105);
        pdf.text("conjugaison.tatitotu.ch", pageWidth / 2, pageHeight - 8, { align: "center" });
        pdf.setTextColor(20, 20, 20);
      }
      function drawExerciseHeader(continuation) {
        if (continuation) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8.5);
          pdf.setTextColor(90, 90, 90);
          pdf.text(`${title}${identifier}`, pageWidth / 2, 12, { align: "center" });
          pdf.setTextColor(20, 20, 20);
          return 32;
        }
        let y = 18;
        const identity = [
          props.options.showFirstName ? `${ui("Prénom")} : ____________________` : "",
          props.options.showLastName ? `${ui("Nom")} : ____________________` : "",
          props.options.showDate ? `${ui("Date")} : ______________` : ""
        ].filter(Boolean);
        if (identity.length) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8.5);
          pdf.text(pdfSafe(identity.join("     ")), left, y);
          y += titleSpacingMm.value;
        }
        if (props.options.showGrade) {
          pdf.setDrawColor(40, 40, 40);
          pdf.rect(right - 17, 15, 17, 17);
        }
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(17);
        const heading = `${title}${identifier}`;
        const titleLines = pdf.splitTextToSize(heading.toUpperCase(), 150);
        pdf.text(titleLines, left, y + 8);
        y += titleLines.length * 7 + 10;
        pdf.setFontSize(9);
        if (props.options.showVerbs) {
          const lines = pdf.splitTextToSize(`Verbes : ${pdfSafe(props.verbs.map((verb) => verb.infinitif).join(", "))}`, 176);
          pdf.text(lines, left, y);
          y += lines.length * 4.5 + 2;
        }
        if (props.options.showTenses) {
          const lines = pdf.splitTextToSize(`${ui("Temps :")} ${pdfSafe(props.tenses.map((tense) => uiLabel(tense.name)).join(", "))}`, 176);
          pdf.text(lines, left, y);
          y += lines.length * 4.5 + 2;
        }
        if (isTenseIdentification.value) {
          pdf.setDrawColor(120, 120, 120);
          pdf.rect(left, y, 176, 10);
          pdf.text(TENSE_IDENTIFICATION_INSTRUCTION, left + 3, y + 6);
          y += 21;
        }
        return y + 2;
      }
      function drawCorrectionHeader(continuation) {
        if (continuation) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8.5);
          pdf.setTextColor(90, 90, 90);
          pdf.text(`${title} - corrigé${identifier}`, pageWidth / 2, 12, { align: "center" });
          pdf.setTextColor(20, 20, 20);
          return 32;
        }
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(17);
        pdf.setTextColor(20, 20, 20);
        pdf.text(`${ui("CORRIGÉ")}${identifier}`, left, 26);
        return 38;
      }
      function pdfLiteraryCitation(question, width) {
        const citation = question.literaryCitation;
        if (!citation) return null;
        const before = pdfSafe(citation.before).replace(/\s+/gu, " ");
        const target = pdfSafe(citation.target).replace(/\s+/gu, " ");
        const after = pdfSafe(citation.after).replace(/\s+/gu, " ");
        const text = capitalizePrintLine(`${before}${target}${after}`);
        const source = pdfSafe(`- ${citation.author}, ${citation.work}`);
        const targetStart = before.length;
        const targetEnd = targetStart + target.length;
        let cursor = 0;
        const lines = pdf.splitTextToSize(text, width).map((line) => {
          const located = text.indexOf(line, cursor);
          const start = located >= 0 ? located : cursor;
          cursor = start + line.length;
          return { text: line, start };
        });
        const previousSize = pdf.getFontSize();
        const previousStyle = pdf.getFont().fontStyle;
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(8.3);
        const sourceLines = pdf.splitTextToSize(source, width);
        pdf.setFont("helvetica", previousStyle);
        pdf.setFontSize(previousSize);
        return {
          lines,
          sourceLines,
          targetStart,
          targetEnd,
          height: lines.length * 5 + sourceLines.length * 4
        };
      }
      function drawPdfLiteraryCitation(citation, x, y) {
        citation.lines.forEach((line, lineIndex) => {
          const baseline = y + lineIndex * 5;
          pdf.text(line.text, x, baseline);
          const overlapStart = Math.max(line.start, citation.targetStart);
          const overlapEnd = Math.min(line.start + line.text.length, citation.targetEnd);
          if (overlapEnd <= overlapStart) return;
          const prefix = line.text.slice(0, overlapStart - line.start);
          const underlined = line.text.slice(overlapStart - line.start, overlapEnd - line.start);
          const underlineStart = x + pdf.getTextWidth(prefix);
          pdf.setDrawColor(25, 25, 25);
          pdf.setLineWidth(0.25);
          pdf.line(underlineStart, baseline + 0.8, underlineStart + pdf.getTextWidth(underlined), baseline + 0.8);
        });
        const previousSize = pdf.getFontSize();
        const previousStyle = pdf.getFont().fontStyle;
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(8.3);
        pdf.setTextColor(90, 90, 90);
        citation.sourceLines.forEach((line, lineIndex) => {
          pdf.text(line, x, y + citation.lines.length * 5 + lineIndex * 4);
        });
        pdf.setTextColor(20, 20, 20);
        pdf.setFont("helvetica", previousStyle);
        pdf.setFontSize(previousSize);
      }
      function drawExercisePage(page, continuation) {
        addPage();
        let y = drawExerciseHeader(continuation);
        pdf.setFontSize(10.5);
        page.forEach(({ item: question, index }) => {
          const prefix = `${index + 1}. `;
          const printable = printableQuestionParts(question, props.exerciseKind);
          pdf.setFont("helvetica", "normal");
          const labelLines = pdf.splitTextToSize(pdfSafe(capitalizePrintLine(printable.label)), 68);
          const completionWidth = printable.label ? 96 : 169;
          const literaryCitation = pdfLiteraryCitation(question, completionWidth);
          const completionLines = literaryCitation ? [...literaryCitation.lines.map((line) => line.text), ...literaryCitation.sourceLines] : printable.fillBlank ? [pdfSafe(capitalizePrintLine(printable.completion))] : pdf.splitTextToSize(pdfSafe(capitalizePrintLine(printable.completion)), completionWidth);
          const completionX = printable.label ? 96 : left + 7;
          const before = pdfSafe(capitalizePrintLine(printable.completionPrefix));
          const after = pdfSafe(printable.completionSuffix);
          const lineStart = completionX + (before ? pdf.getTextWidth(before) + 2 : 0);
          const availableLineEnd = right - (!printable.suffixOnNextLine && after ? pdf.getTextWidth(after) + 2 : 0);
          const lineEnd = printable.suffixOnNextLine ? completionX + completionWidth * (printable.blankWidthPercent / 100) : availableLineEnd;
          let firstSuffixLine = "";
          let remainingSuffixLines = [];
          if (printable.suffixOnNextLine && after) {
            const suffixStart = lineEnd + 2;
            const firstLineWidth = Math.max(0, right - suffixStart);
            const words = after.split(/\s+/u).filter(Boolean);
            const firstLineWords = [];
            while (words.length) {
              const candidate = [...firstLineWords, words[0]].join(" ");
              if (firstLineWords.length && pdf.getTextWidth(candidate) > firstLineWidth) break;
              if (!firstLineWords.length && pdf.getTextWidth(candidate) > firstLineWidth) break;
              firstLineWords.push(words.shift());
            }
            firstSuffixLine = firstLineWords.join(" ");
            remainingSuffixLines = words.length ? pdf.splitTextToSize(words.join(" "), completionWidth) : [];
          }
          const completionLineCount = printable.suffixOnNextLine ? 1 + remainingSuffixLines.length : completionLines.length;
          const lineCount = Math.max(labelLines.length, completionLineCount);
          pdf.text(prefix, left, y);
          if (printable.label) pdf.text(labelLines, left + 7, y);
          if (printable.fillBlank) {
            if (before) pdf.text(before, completionX, y);
            if (after && !printable.suffixOnNextLine) pdf.text(after, right, y, { align: "right" });
            if (lineEnd > lineStart) {
              pdf.setLineDashPattern([0.7, 0.7], 0);
              pdf.setDrawColor(55, 55, 55);
              pdf.line(lineStart, y + 0.8, lineEnd, y + 0.8);
              pdf.setLineDashPattern([], 0);
            }
            if (printable.suffixOnNextLine) {
              if (firstSuffixLine) pdf.text(firstSuffixLine, lineEnd + 2, y);
              remainingSuffixLines.forEach((line, lineIndex) => {
                pdf.text(line, completionX, y + 5 + lineIndex * 5);
              });
            }
          } else if (literaryCitation) {
            drawPdfLiteraryCitation(literaryCitation, completionX, y);
          } else {
            pdf.text(completionLines, completionX, y);
          }
          if (isTenseIdentification.value) {
            const questionHeight = literaryCitation ? literaryCitation.height : lineCount * 5;
            const answerY = y + questionHeight + 2;
            const modeLabel = pdfSafe(ui("Mode :"));
            const tenseLabel = pdfSafe(ui("Temps :"));
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(9.5);
            pdf.setTextColor(70, 70, 70);
            pdf.text(modeLabel, left + 7, answerY);
            pdf.text(tenseLabel, 108, answerY);
            pdf.setLineDashPattern([0.65, 0.65], 0);
            pdf.setDrawColor(105, 105, 105);
            pdf.line(left + 7 + pdf.getTextWidth(modeLabel) + 2, answerY + 0.7, 101, answerY + 0.7);
            pdf.line(108 + pdf.getTextWidth(tenseLabel) + 2, answerY + 0.7, right, answerY + 0.7);
            pdf.setLineDashPattern([], 0);
            pdf.setTextColor(20, 20, 20);
            pdf.setFontSize(10.5);
            y += questionHeight + 8 + Math.max(5, questionSpacingMm.value);
          } else {
            y += Math.max(5 + questionSpacingMm.value, lineCount * 5 + questionSpacingMm.value);
          }
        });
        drawFooter();
      }
      function drawCorrectionPage(page, continuation) {
        addPage();
        let y = drawCorrectionHeader(continuation);
        pdf.setFontSize(9.5);
        page.forEach(({ item: question, index }) => {
          const answer = printableCorrectionAnswers(question).flatMap((value) => pdf.splitTextToSize(
            pdfSafe(capitalizePrintText(value)),
            isTenseIdentification.value ? 169 : 82
          ));
          const answerHeight = answer.length * 5;
          if (isTenseIdentification.value) {
            const rowHeight2 = Math.max(9, answerHeight + 4);
            const textY = y + Math.max(0, (rowHeight2 - answerHeight) / 2);
            pdf.setFont("helvetica", "normal");
            pdf.text(`${index + 1}.`, left, textY, { baseline: "top" });
            pdf.setFont("helvetica", "bold");
            pdf.text(answer, left + 10, textY, { baseline: "top" });
            pdf.setDrawColor(225, 225, 225);
            pdf.line(left, y + rowHeight2, right, y + rowHeight2);
            y += rowHeight2;
            return;
          }
          const prompt = pdf.splitTextToSize(
            pdfSafe(capitalizePrintLine(printableCorrectionLabel(question, props.exerciseKind))),
            79
          );
          const promptHeight = prompt.length * 5;
          const rowHeight = Math.max(8, Math.max(promptHeight, answerHeight) + 3);
          const numberY = y + Math.max(0, (rowHeight - 5) / 2);
          const promptY = y + Math.max(0, (rowHeight - promptHeight) / 2);
          const answerY = y + Math.max(0, (rowHeight - answerHeight) / 2);
          pdf.setFont("helvetica", "normal");
          pdf.text(`${index + 1}.`, left, numberY, { baseline: "top" });
          pdf.text(prompt, left + 7, promptY, { baseline: "top" });
          pdf.setFont("helvetica", "bold");
          pdf.text(answer, 106, answerY, { baseline: "top" });
          pdf.setDrawColor(220, 220, 220);
          pdf.line(left, y + rowHeight, right, y + rowHeight);
          y += rowHeight;
        });
        drawFooter();
      }
      exercisePages.value.forEach((page, index) => drawExercisePage(page, index > 0));
      correctionPages.value.forEach((page, index) => drawCorrectionPage(page, index > 0));
      return pdf;
    }
    function revokePdfPreviewUrl() {
      if (!pdfPreviewUrl.value) return;
      URL.revokeObjectURL(pdfPreviewUrl.value);
      pdfPreviewUrl.value = "";
    }
    async function refreshPdfPreview() {
      const generation = ++pdfPreviewGeneration;
      isPdfPreviewBusy.value = true;
      isPdfPreviewFrameReady.value = false;
      pdfPreviewError.value = "";
      try {
        const pdf = await buildPdf();
        const blob = pdf.output("blob");
        if (generation !== pdfPreviewGeneration) return;
        revokePdfPreviewUrl();
        pdfPreviewUrl.value = URL.createObjectURL(blob);
      } catch (error) {
        if (generation !== pdfPreviewGeneration) return;
        console.error(ui("Impossible de générer l’aperçu PDF."), error);
        pdfPreviewError.value = ui("L’aperçu PDF n’a pas pu être créé.");
      } finally {
        if (generation === pdfPreviewGeneration) isPdfPreviewBusy.value = false;
      }
    }
    function schedulePdfPreview() {
      if (pdfPreviewTimer) clearTimeout(pdfPreviewTimer);
      pdfPreviewTimer = setTimeout(() => {
        pdfPreviewTimer = void 0;
        void refreshPdfPreview();
      }, 250);
    }
    watch(
      () => ({
        questions: props.questions,
        verbs: props.verbs,
        tenses: props.tenses,
        exerciseKind: props.exerciseKind,
        options: props.options
      }),
      schedulePdfPreview,
      { deep: true }
    );
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="print-overlay" data-tour="print-preview" role="dialog" aria-modal="true" aria-labelledby="print-preview-title" tabindex="-1"><div class="print-toolbar no-print"><div><strong id="print-preview-title">${ssrInterpolate(unref(ui)("Aperçu avant impression"))}</strong></div><div><button class="secondary-button" type="button">${ssrInterpolate(unref(ui)("Fermer"))}</button><button class="secondary-button" type="button"${ssrIncludeBooleanAttr(unref(isWordBusy)) ? " disabled" : ""}>${ssrInterpolate(unref(isWordBusy) ? "Création du fichier Word…" : "Télécharger au format Word")}</button><button class="primary-button" type="button"${ssrIncludeBooleanAttr(unref(isPdfBusy)) ? " disabled" : ""}>${ssrInterpolate(unref(isPdfBusy) ? "Création du PDF…" : "Télécharger le PDF")}</button></div></div><div class="print-preview-layout"><aside class="print-settings no-print" data-tour="print-settings" aria-labelledby="print-settings-title"><div class="print-settings__heading"><p>${ssrInterpolate(unref(ui)("Personnalisation"))}</p><h2 id="print-settings-title">${ssrInterpolate(unref(ui)("Options de la fiche"))}</h2><span>${ssrInterpolate(unref(ui)("Les changements apparaissent immédiatement dans l’aperçu."))}</span></div><label class="print-settings__field" for="preview-print-title"><span>${ssrInterpolate(unref(ui)("Titre de la fiche"))}</span><input id="preview-print-title" type="text"${ssrRenderAttr("value", __props.options.title)}></label><fieldset class="print-settings__group"><legend>${ssrInterpolate(unref(ui)("Mise en page"))}</legend><label class="print-settings__number-field" for="preview-title-spacing"><span>${ssrInterpolate(unref(ui)("Espace avant le titre"))}</span><span><input id="preview-title-spacing" type="number" min="8" max="30" step="1"${ssrRenderAttr("value", unref(titleSpacingMm))}> mm </span></label><label class="print-settings__number-field" for="preview-question-spacing"><span>${ssrInterpolate(unref(ui)("Espacement entre les questions"))}</span><span><input id="preview-question-spacing" type="number" min="2" max="15" step="0.5"${ssrRenderAttr("value", unref(questionSpacingMm))}> mm </span></label></fieldset><fieldset class="print-settings__group"><legend>${ssrInterpolate(unref(ui)("Informations de l’élève"))}</legend><label><input type="checkbox"${ssrIncludeBooleanAttr(__props.options.showFirstName) ? " checked" : ""}><span>${ssrInterpolate(unref(ui)("Prénom"))}</span></label><label><input type="checkbox"${ssrIncludeBooleanAttr(__props.options.showLastName) ? " checked" : ""}><span>${ssrInterpolate(unref(ui)("Nom"))}</span></label><label><input type="checkbox"${ssrIncludeBooleanAttr(__props.options.showDate) ? " checked" : ""}><span>${ssrInterpolate(unref(ui)("Date"))}</span></label><label><input type="checkbox"${ssrIncludeBooleanAttr(__props.options.showGrade) ? " checked" : ""}><span>${ssrInterpolate(unref(ui)("Espace pour la note"))}</span></label></fieldset><fieldset class="print-settings__group"><legend>${ssrInterpolate(unref(ui)("Contenu affiché"))}</legend><label><input type="checkbox"${ssrIncludeBooleanAttr(__props.options.showVerbs) ? " checked" : ""}><span>${ssrInterpolate(unref(ui)("Liste des verbes"))}</span></label><label><input type="checkbox"${ssrIncludeBooleanAttr(__props.options.showTenses) ? " checked" : ""}><span>${ssrInterpolate(unref(ui)("Liste des temps"))}</span></label><label><input type="checkbox"${ssrIncludeBooleanAttr(__props.options.showRandomNumber) ? " checked" : ""}><span>${ssrInterpolate(unref(ui)("Numéro questionnaire/corrigé"))}</span></label></fieldset></aside><main class="print-document print-document--pdf">`);
        if (unref(pdfPreviewUrl)) {
          _push2(`<iframe class="pdf-preview-frame"${ssrRenderAttr("src", `${unref(pdfPreviewUrl)}#view=FitH&toolbar=1&navpanes=0`)}${ssrRenderAttr("title", unref(ui)("Aperçu exact de la fiche PDF et de son corrigé"))}></iframe>`);
        } else {
          _push2(`<!---->`);
        }
        if (!unref(pdfPreviewError) && (unref(isPdfPreviewBusy) || !unref(isPdfPreviewFrameReady))) {
          _push2(`<div class="pdf-preview-state" role="status" aria-live="polite"><span class="pdf-preview-spinner" aria-hidden="true"></span><strong>${ssrInterpolate(unref(ui)("Création de l’aperçu PDF…"))}</strong><span>${ssrInterpolate(unref(ui)("La fiche et le corrigé sont mis en page."))}</span></div>`);
        } else {
          _push2(`<!---->`);
        }
        if (unref(pdfPreviewError)) {
          _push2(`<div class="pdf-preview-state pdf-preview-state--error" role="alert"><strong>${ssrInterpolate(unref(pdfPreviewError))}</strong><button class="secondary-button" type="button">${ssrInterpolate(unref(ui)("Réessayer"))}</button></div>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`</main></div></div>`);
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/challenge/PrintPreview.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const PrintPreview = Object.assign(_sfc_main$3, { __name: "ChallengePrintPreview" });
const _imports_0 = publicAssetsURL("/images/recharger-defi.svg?v=dynamic-code");
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "ShareChallengeDialog",
  __ssrInlineRender: true,
  props: {
    code: {},
    url: {},
    busy: { type: Boolean },
    error: {},
    initialTitle: {},
    initialDescription: {}
  },
  emits: ["close", "save"],
  setup(__props, { emit: __emit }) {
    const { ui, localePath } = useLanguagePreferences();
    const props = __props;
    const copyStatus = ref("");
    const challengeTitle = ref(props.initialTitle?.trim() || ui("Défi de conjugaison"));
    const challengeDescription = ref(props.initialDescription?.trim() || "");
    useTemplateRef("close-button");
    useTemplateRef("share-dialog");
    const normalizedTitle = computed(() => challengeTitle.value.trim());
    const normalizedDescription = computed(() => challengeDescription.value.trim());
    const titleIsValid = computed(() => normalizedTitle.value.length >= 1 && normalizedTitle.value.length <= 80);
    function highlightChallengeLoaderOnHome() {
      try {
        sessionStorage.setItem("highlight-home-challenge-loader", "1");
      } catch {
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="dialog-backdrop"><section class="app-dialog share-dialog" data-tour="share-dialog" role="dialog" aria-modal="true" aria-labelledby="share-title" tabindex="-1"><button class="dialog-close" type="button"${ssrRenderAttr("aria-label", unref(ui)("Fermer"))}> × </button><p class="dialog-kicker">${ssrInterpolate(__props.code ? unref(ui)("Défi sauvegardé") : unref(ui)("Défi prêt à être partagé"))}</p><h2 id="share-title">${ssrInterpolate(unref(ui)("Votre défi est prêt à être partagé"))}</h2><form class="share-title-form"><label for="share-challenge-title">${ssrInterpolate(unref(ui)("Titre du défi"))}</label><div><input id="share-challenge-title"${ssrRenderAttr("value", unref(challengeTitle))} type="text" maxlength="80"${ssrIncludeBooleanAttr(Boolean(__props.code)) ? " readonly" : ""}${ssrRenderAttr("aria-invalid", !unref(titleIsValid))}${ssrRenderAttr("aria-describedby", __props.error ? "share-title-error" : void 0)} required autofocus>`);
        if (!__props.code) {
          _push2(`<button class="primary-button" type="submit"${ssrIncludeBooleanAttr(__props.busy || !unref(titleIsValid)) ? " disabled" : ""}>${ssrInterpolate(__props.busy ? unref(ui)("Création…") : unref(ui)("Créer le code"))}</button>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`</div><small>${ssrInterpolate(unref(normalizedTitle).length)}/80</small><label for="share-challenge-description">${ssrInterpolate(unref(ui)("Description du défi"))}</label><textarea id="share-challenge-description" rows="4" maxlength="1000"${ssrIncludeBooleanAttr(Boolean(__props.code)) ? " readonly" : ""}${ssrRenderAttr("aria-describedby", __props.error ? "share-title-error share-description-help" : "share-description-help")}>${ssrInterpolate(unref(challengeDescription))}</textarea><small id="share-description-help" class="share-title-form__description-help">${ssrInterpolate(unref(ui)("Facultatif : une description à l’attention des personnes qui découvriront ce défi"))} · ${ssrInterpolate(unref(normalizedDescription).length)}/1000 </small>`);
        if (__props.error) {
          _push2(`<p id="share-title-error" class="form-error" role="alert">${ssrInterpolate(__props.error)}</p>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`</form>`);
        if (__props.code) {
          _push2(`<p>${ssrInterpolate(unref(ui)("Deux possibilités permettent à vos élèves de retrouver ce défi."))}</p>`);
        } else {
          _push2(`<!---->`);
        }
        if (__props.code) {
          _push2(`<div class="share-methods"><section class="share-method" aria-labelledby="share-code-title"><header><span class="share-method__number" aria-hidden="true">1</span><div><h3 id="share-code-title">${ssrInterpolate(unref(ui)("Sauvegarder le code"))}</h3><p>${ssrInterpolate(unref(ui)("L’élève conserve ce code. Plus tard, il le copie sur la page d’accueil pour retrouver ce défi."))}</p><p class="share-method__tip">${ssrInterpolate(unref(ui)("Idéal pour transmettre le défi par écrit"))}</p></div></header><div class="share-value"><label for="share-code">${ssrInterpolate(unref(ui)("Code à conserver"))}</label><div><input id="share-code"${ssrRenderAttr("value", __props.code)} readonly><button type="button">${ssrInterpolate(unref(ui)("Copier"))}</button></div><div class="share-help"><button type="button" class="share-help__trigger" aria-describedby="reload-help-tooltip">${ssrInterpolate(unref(ui)("Comment le recharger plus tard ?"))}</button><div id="reload-help-tooltip" class="share-help__tooltip" role="tooltip"><div class="share-help__preview"><img${ssrRenderAttr("src", _imports_0)}${ssrRenderAttr("alt", unref(ui)("Emplacement du code reçu sur la page d’accueil"))}><span aria-hidden="true">${ssrInterpolate(__props.code)}</span></div><p>Tes élèves colleront le code à cet endroit dans la `);
          _push2(ssrRenderComponent(_component_NuxtLink, {
            to: unref(localePath)("/"),
            onClick: highlightChallengeLoaderOnHome
          }, {
            default: withCtx((_, _push3, _parent2, _scopeId) => {
              if (_push3) {
                _push3(`${ssrInterpolate(unref(ui)("page d’accueil"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(ui)("page d’accueil")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push2(`</p></div></div></div></section><section class="share-method" aria-labelledby="share-link-title"><header><span class="share-method__number" aria-hidden="true">2</span><div><h3 id="share-link-title">${ssrInterpolate(unref(ui)("Envoyer le lien direct"))}</h3><p>${ssrInterpolate(unref(ui)("L’élève clique simplement sur ce lien : il arrive directement sur le défi, sans saisir le code."))}</p><p class="share-method__tip">${ssrInterpolate(unref(ui)("Idéal pour transmettre le défi par email"))}</p></div></header><div class="share-value"><label for="share-url">${ssrInterpolate(unref(ui)("Lien à envoyer"))}</label><div><input id="share-url"${ssrRenderAttr("value", __props.url)} readonly><button type="button">${ssrInterpolate(unref(ui)("Copier"))}</button></div></div></section></div>`);
        } else {
          _push2(`<!---->`);
        }
        if (__props.code) {
          _push2(`<!--[--><p class="copy-status" aria-live="polite">${ssrInterpolate(unref(copyStatus))}</p><button class="primary-button" type="button">${ssrInterpolate(unref(ui)("Terminé"))}</button><!--]-->`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`</section></div>`);
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/challenge/ShareChallengeDialog.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const ShareChallengeDialog = Object.assign(_sfc_main$2, { __name: "ChallengeShareChallengeDialog" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "TensePicker",
  __ssrInlineRender: true,
  props: {
    modes: {},
    tenses: {},
    verbs: {},
    selectedIds: {}
  },
  emits: ["toggle", "selectAll", "clear"],
  setup(__props, { emit: __emit }) {
    const { ui, uiLabel } = useLanguagePreferences();
    const props = __props;
    const selectedSet = computed(() => new Set(props.selectedIds));
    const examples = ref({});
    const examplesLoading = ref(false);
    const exampleVerbs = computed(() => {
      const withCod = props.verbs.filter((verb) => verb.complementExample?.functionObject === "cod");
      return withCod.length ? withCod : props.verbs;
    });
    const exampleRequestKey = computed(() => `${exampleVerbs.value.map((verb) => verb.id).join(",")}|${props.tenses.map((tense) => tense.id).join(",")}`);
    const groups = computed(() => props.modes.map((mode) => {
      const tenses = props.tenses.filter((tense) => tense.modeId === mode.id).sort((left, right) => conjugationTenseOrder(mode.name, left.name) - conjugationTenseOrder(mode.name, right.name) || left.id - right.id);
      const trailingTenses = tenses.filter((tense) => isNearFutureTense(tense));
      const columnTenses = tenses.filter((tense) => !isNearFutureTense(tense));
      return {
        mode,
        tenses,
        columns: [
          columnTenses.filter((tense) => !tense.isCompound),
          columnTenses.filter((tense) => tense.isCompound)
        ].filter((column) => column.length > 0),
        trailingTenses
      };
    }).filter((group) => group.tenses.length > 0));
    let exampleRequest = 0;
    async function loadExamples() {
      const request = ++exampleRequest;
      examples.value = {};
      if (!exampleVerbs.value.length || !props.tenses.length) return;
      examplesLoading.value = true;
      try {
        const response = await $fetch("/api/tense-examples", {
          method: "POST",
          body: {
            verbIds: exampleVerbs.value.map((verb) => verb.id),
            tenseIds: props.tenses.map((tense) => tense.id)
          }
        });
        if (request === exampleRequest) examples.value = response.examples;
      } catch {
        if (request === exampleRequest) examples.value = {};
      } finally {
        if (request === exampleRequest) examplesLoading.value = false;
      }
    }
    watch(exampleRequestKey, () => void loadExamples());
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: "builder-card tense-picker",
        "aria-labelledby": "tenses-title"
      }, _attrs))} data-v-ee3658cb><div class="builder-card__header" data-v-ee3658cb><div data-v-ee3658cb><p class="builder-card__eyebrow" data-v-ee3658cb>${ssrInterpolate(unref(ui)("Étape 2"))}</p><h2 id="tenses-title" data-v-ee3658cb>${ssrInterpolate(unref(ui)("Mes temps"))}</h2></div><span class="count-badge"${ssrRenderAttr("aria-label", `${__props.selectedIds.length} temps sélectionnés`)} data-v-ee3658cb>${ssrInterpolate(__props.selectedIds.length)}</span></div><div class="selection-toolbar" data-v-ee3658cb><button class="text-button" type="button" data-v-ee3658cb>${ssrInterpolate(unref(ui)("Tout cocher"))}</button><button class="text-button text-button--danger" type="button" data-v-ee3658cb>${ssrInterpolate(unref(ui)("Tout décocher"))}</button></div><div class="tense-groups" data-v-ee3658cb><!--[-->`);
      ssrRenderList(unref(groups), (group) => {
        _push(`<section class="tense-group" role="group"${ssrRenderAttr("aria-labelledby", `tense-mode-${group.mode.id}`)} data-v-ee3658cb><h3${ssrRenderAttr("id", `tense-mode-${group.mode.id}`)} class="tense-group__title" data-v-ee3658cb>${ssrInterpolate(unref(uiLabel)(group.mode.name))}</h3><div class="${ssrRenderClass([{ "tense-group__columns--single": group.columns.length === 1 }, "tense-group__columns"])}" data-v-ee3658cb><!--[-->`);
        ssrRenderList(group.columns, (column, columnIndex) => {
          _push(`<div class="tense-group__column" data-v-ee3658cb><div class="tense-group__items" data-v-ee3658cb><!--[-->`);
          ssrRenderList(column, (tense) => {
            _push(`<div class="tense-entry" data-v-ee3658cb><div class="tense-row" data-v-ee3658cb><span class="tense-info" data-v-ee3658cb><button type="button"${ssrRenderAttr("aria-label", `${unref(ui)("Voir un exemple :")} ${unref(uiLabel)(tense.name)}`)}${ssrRenderAttr("aria-describedby", `tense-example-${tense.id}`)} data-v-ee3658cb>i</button><span${ssrRenderAttr("id", `tense-example-${tense.id}`)} class="tense-tooltip" role="tooltip" data-v-ee3658cb>`);
            if (unref(examples)[tense.id]) {
              _push(`<!--[-->${ssrInterpolate(unref(ui)("Exemple:"))} <strong data-v-ee3658cb>${ssrInterpolate(unref(examples)[tense.id].emphasis)}</strong>`);
              if (unref(examples)[tense.id].rest) {
                _push(`<!--[-->${ssrInterpolate(unref(examples)[tense.id].rest)}<!--]-->`);
              } else {
                _push(`<!---->`);
              }
              _push(`<!--]-->`);
            } else {
              _push(`<!--[-->${ssrInterpolate(unref(examplesLoading) ? unref(ui)("Chargement…") : unref(ui)("Exemple momentanément indisponible."))}<!--]-->`);
            }
            _push(`</span></span><label class="switch-row" data-v-ee3658cb><input type="checkbox"${ssrIncludeBooleanAttr(unref(selectedSet).has(tense.id)) ? " checked" : ""} data-v-ee3658cb><span class="switch-row__control" aria-hidden="true" data-v-ee3658cb></span><span data-v-ee3658cb>${ssrInterpolate(unref(uiLabel)(tense.name))}</span></label></div></div>`);
          });
          _push(`<!--]--></div></div>`);
        });
        _push(`<!--]--></div>`);
        if (group.trailingTenses.length) {
          _push(`<div class="tense-group__trailing" data-v-ee3658cb><!--[-->`);
          ssrRenderList(group.trailingTenses, (tense) => {
            _push(`<div class="tense-entry" data-v-ee3658cb><div class="tense-row" data-v-ee3658cb><span class="tense-info" data-v-ee3658cb><button type="button"${ssrRenderAttr("aria-label", `${unref(ui)("Voir un exemple :")} ${unref(uiLabel)(tense.name)}`)}${ssrRenderAttr("aria-describedby", `tense-example-${tense.id}`)} data-v-ee3658cb>i</button><span${ssrRenderAttr("id", `tense-example-${tense.id}`)} class="tense-tooltip" role="tooltip" data-v-ee3658cb>`);
            if (unref(examples)[tense.id]) {
              _push(`<!--[-->${ssrInterpolate(unref(ui)("Exemple:"))} <strong data-v-ee3658cb>${ssrInterpolate(unref(examples)[tense.id].emphasis)}</strong>`);
              if (unref(examples)[tense.id].rest) {
                _push(`<!--[-->${ssrInterpolate(unref(examples)[tense.id].rest)}<!--]-->`);
              } else {
                _push(`<!---->`);
              }
              _push(`<!--]-->`);
            } else {
              _push(`<!--[-->${ssrInterpolate(unref(examplesLoading) ? unref(ui)("Chargement…") : unref(ui)("Exemple momentanément indisponible."))}<!--]-->`);
            }
            _push(`</span></span><label class="switch-row" data-v-ee3658cb><input type="checkbox"${ssrIncludeBooleanAttr(unref(selectedSet).has(tense.id)) ? " checked" : ""} data-v-ee3658cb><span class="switch-row__control" aria-hidden="true" data-v-ee3658cb></span><span data-v-ee3658cb>${ssrInterpolate(unref(uiLabel)(tense.name))}</span></label></div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</section>`);
      });
      _push(`<!--]--></div></section>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/challenge/TensePicker.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const TensePicker = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-ee3658cb"]]), { __name: "ChallengeTensePicker" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "VerbPicker",
  __ssrInlineRender: true,
  props: {
    verbs: {},
    selectedIds: {}
  },
  emits: ["add", "remove", "clear"],
  setup(__props, { emit: __emit }) {
    const { ui } = useLanguagePreferences();
    const props = __props;
    const query = ref("");
    useTemplateRef("verb-input");
    const selectedIdSet = computed(() => new Set(props.selectedIds));
    const selectedVerbs = computed(() => {
      const byId = new Map(props.verbs.map((verb) => [verb.id, verb]));
      return props.selectedIds.map((id) => byId.get(id)).filter((verb) => Boolean(verb));
    });
    const selectedChipScale = computed(() => {
      const count = selectedVerbs.value.length;
      if (count <= 3) return 1.35;
      return Math.max(1, 1.35 - (count - 3) / 20);
    });
    const selectedChipStyle = computed(() => {
      const scale = selectedChipScale.value;
      const mobileScale = 1 + (scale - 1) * 0.55;
      return {
        "--selected-chip-gap": `${7 * scale}px`,
        "--selected-chip-inner-gap": `${6 * scale}px`,
        "--selected-chip-padding-block": `${7 * scale}px`,
        "--selected-chip-padding-end": `${8 * scale}px`,
        "--selected-chip-padding-start": `${11 * scale}px`,
        "--selected-chip-font-size": `${0.87 * scale}rem`,
        "--selected-chip-button-size": `${21 * scale}px`,
        "--selected-chip-button-font-size": `${scale}rem`,
        "--selected-chip-mobile-gap": `${7 * mobileScale}px`,
        "--selected-chip-mobile-inner-gap": `${6 * mobileScale}px`,
        "--selected-chip-mobile-padding-block": `${7 * mobileScale}px`,
        "--selected-chip-mobile-padding-end": `${8 * mobileScale}px`,
        "--selected-chip-mobile-padding-start": `${11 * mobileScale}px`,
        "--selected-chip-mobile-font-size": `${0.87 * mobileScale}rem`,
        "--selected-chip-mobile-button-size": `${21 * mobileScale}px`,
        "--selected-chip-mobile-button-font-size": `${mobileScale}rem`
      };
    });
    const suggestions = computed(() => {
      const needle = normalizeVerbSearch(query.value);
      if (!needle) {
        return [];
      }
      return matchingVerbs(
        props.verbs.filter((verb) => !selectedIdSet.value.has(verb.id)),
        query.value
      ).slice(0, 8);
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: "builder-card verb-picker",
        "aria-labelledby": "verbs-title"
      }, _attrs))} data-v-f03191bf><div class="builder-card__header" data-v-f03191bf><div data-v-f03191bf><p class="builder-card__eyebrow" data-v-f03191bf>${ssrInterpolate(unref(ui)("Étape 1"))}</p><h2 id="verbs-title" data-v-f03191bf>${ssrInterpolate(unref(ui)("Mes verbes"))}</h2></div><span class="count-badge"${ssrRenderAttr("aria-label", `${__props.selectedIds.length} verbes sélectionnés`)} data-v-f03191bf>${ssrInterpolate(__props.selectedIds.length)}</span></div><div class="verb-search" data-v-f03191bf><label for="verb-search-input" data-v-f03191bf>${ssrInterpolate(unref(ui)("Ajouter un verbe"))}</label><div class="verb-search__control" data-v-f03191bf><input id="verb-search-input"${ssrRenderAttr("value", unref(query))} type="search" autocomplete="off"${ssrRenderAttr("placeholder", unref(ui)("Ex. aller, être, finir…"))}${ssrRenderAttr("aria-expanded", unref(suggestions).length > 0)} aria-controls="verb-suggestions" data-v-f03191bf><button class="icon-button icon-button--add" type="button"${ssrIncludeBooleanAttr(unref(suggestions).length === 0) ? " disabled" : ""}${ssrRenderAttr("aria-label", unref(ui)("Ajouter le premier verbe proposé"))} data-v-f03191bf> + </button></div>`);
      if (unref(suggestions).length > 0) {
        _push(`<ul id="verb-suggestions" class="verb-suggestions" role="listbox"${ssrRenderAttr("aria-label", unref(ui)("Verbes proposés"))} data-v-f03191bf><!--[-->`);
        ssrRenderList(unref(suggestions), (verb) => {
          _push(`<li role="option" data-v-f03191bf><button type="button" data-v-f03191bf><strong data-v-f03191bf>${ssrInterpolate(verb.infinitif)}</strong>`);
          if (verb.isPronominalForm && verb.baseVerbId) {
            _push(`<span data-v-f03191bf>${ssrInterpolate(unref(ui)("forme pronominale générée"))}</span>`);
          } else if (verb.auxiliaire) {
            _push(`<span data-v-f03191bf>${ssrInterpolate(unref(ui)("auxiliaire"))} ${ssrInterpolate(verb.auxiliaire)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</button></li>`);
        });
        _push(`<!--]--></ul>`);
      } else if (unref(query)) {
        _push(`<p class="field-hint" aria-live="polite" data-v-f03191bf> Aucun nouveau verbe ne commence par « ${ssrInterpolate(unref(query))} ». </p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="selection-toolbar" data-v-f03191bf><p data-v-f03191bf>${ssrInterpolate(unref(selectedVerbs).length ? unref(ui)("Verbes retenus") : unref(ui)("Aucun verbe sélectionné"))}</p>`);
      if (unref(selectedVerbs).length) {
        _push(`<button class="text-button text-button--danger" type="button" data-v-f03191bf>${ssrInterpolate(unref(ui)("Tout supprimer"))}</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(selectedVerbs).length) {
        _push(`<ul${ssrRenderAttrs({
          name: "verb-chip",
          class: "selected-chips selected-chips--adaptive",
          style: unref(selectedChipStyle),
          "aria-label": unref(ui)("Verbes sélectionnés")
        })} data-v-f03191bf>`);
        ssrRenderList(unref(selectedVerbs), (verb) => {
          _push(`<li data-v-f03191bf><span data-v-f03191bf>${ssrInterpolate(verb.infinitif)}</span><button type="button"${ssrRenderAttr("aria-label", unref(ui)("Retirer le verbe {verb}", { verb: verb.infinitif }))} data-v-f03191bf>×</button></li>`);
        });
        _push(`</ul>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/challenge/VerbPicker.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const VerbPicker = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-f03191bf"]]), { __name: "ChallengeVerbPicker" });
function useRequestURL(opts) {
  {
    return getRequestURL(useRequestEvent(), opts);
  }
}

export { ChallengeOptions as C, PresetPicker as P, ShareChallengeDialog as S, TensePicker as T, VerbPicker as V, useRequestURL as a, ChallengeActions as b, PrintPreview as c, useChallengeApi as d, challengePresetTrackingDescription as e, challengePresetTrackingTitle as f, getChallengeErrorMessage as g, normalizeChallengeCode as n, useChallengeBuilder as u };
//# sourceMappingURL=url-BUv6UcaM.mjs.map
