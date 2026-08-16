import { defineComponent, defineAsyncComponent, ref, shallowRef, useTemplateRef, computed, watch, markRaw, withAsyncContext, mergeProps, unref, createVNode, resolveDynamicComponent, nextTick, reactive, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderStyle, ssrRenderComponent, ssrRenderList, ssrRenderVNode, ssrRenderTeleport } from 'vue/server-renderer';
import { ae as challengePresetGroupLabels, C as getRequestURL, N as legacyComplementOptions, O as legacyComplementConfig, ad as challengePresetGroupOrder } from '../nitro/nitro.mjs';
import { g as guidedTourCopy } from '../_/guided-tour.mjs';
import { D as DEFAULT_SHARED_CHALLENGE_OPTIONS } from '../_/challenge-defaults.mjs';
import { u as useState } from './state-DjsguMyT.mjs';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faArrowUpFromBracket } from '@fortawesome/free-solid-svg-icons';
import { f as useLanguagePreferences, g as useRoute, m as useRequestEvent, n as navigateTo } from './server.mjs';
import { i as isPassivizableInfinitive } from '../_/passive-voice.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { u as useSiteAnalytics } from './useSiteAnalytics-D1wpWTOZ.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-icjx6oE7.mjs';
import { p as publicAssetsURL } from '../routes/renderer.mjs';
import { a as conjugationTenseOrder } from '../_/conjugation-display.mjs';
import { i as isNearFutureTense } from '../_/near-future.mjs';
import { n as normalizeVerbSearch, m as matchingVerbs } from '../_/verb-search.mjs';
import { c as createLearnerTrackingContext } from './main-BQsdzXuL.mjs';

function challengePresetTrackingTitle(preset) {
  const groupLabel = preset.groupLabel || challengePresetGroupLabels[preset.group] || preset.group;
  return [groupLabel, preset.label].filter(Boolean).join(" | ");
}
function challengePresetTrackingDescription(randomCount) {
  return Number.isInteger(randomCount) && Number(randomCount) > 0 ? `${Number(randomCount)} au hasard` : "Tous les verbes";
}

const createDefaultPrintOptions = () => ({
  title: "Défi de conjugaison",
  questionSpacingMm: 8,
  titleSpacingMm: 30,
  inclusiveDisplay: false,
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
      includeOnPronoun: shared.includeOnPronoun ?? defaults.includeOnPronoun,
      voiceMode: shared.voiceMode ?? defaults.voiceMode,
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
    includeOnPronoun: challenge.includeOnPronoun,
    voiceMode: challenge.voiceMode,
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
    includeOnPronoun: challenge.includeOnPronoun,
    voiceMode: challenge.voiceMode,
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
    includeOnPronoun: { type: Boolean },
    voiceMode: {},
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
    revealPrefilledOptions: { type: Boolean },
    falcMode: { type: Boolean }
  },
  emits: ["updateQuestionCount", "updateExerciseKind", "updateIdentificationSource", "updateInclusivePronouns", "updateIncludeOnPronoun", "updateVoiceMode", "updateComplementOptions", "prefilledOptionsRevealStart"],
  setup(__props, { emit: __emit }) {
    const { ui } = useLanguagePreferences();
    const props = __props;
    const emit = __emit;
    const complementsOpen = ref(Boolean(props.gridLayout));
    const selectedComplementVerbs = computed(() => (props.complementVerbs ?? []).filter((verb) => Boolean(verb.complementExample)));
    const complementsAvailable = computed(() => props.exerciseKind === "conjugation" && props.voiceMode !== "passive" && selectedComplementVerbs.value.length > 0);
    const passiveAvailable = computed(() => (props.complementVerbs ?? []).some((verb) => !verb.isPronominalForm && isPassivizableInfinitive(verb.infinitif) && verb.complementFunctions?.includes("cod")));
    const codAvailable = computed(() => selectedComplementVerbs.value.some((verb) => verb.complementFunctions?.includes("cod") || verb.complementExample?.functionObject === "cod"));
    const coiAvailable = computed(() => selectedComplementVerbs.value.some((verb) => verb.complementFunctions?.includes("coi") || verb.complementExample?.functionObject === "coi"));
    const codBeforeAvailable = computed(() => selectedComplementVerbs.value.some((verb) => verb.anteposableComplementFunctions?.includes("cod") || Boolean(verb.complementExample?.before)));
    const coiBeforeAvailable = computed(() => selectedComplementVerbs.value.some((verb) => verb.anteposableComplementFunctions?.includes("coi")));
    const idPrefix = computed(() => props.idPrefix ?? "challenge-options");
    const optionsTitleId = computed(() => `${idPrefix.value}-title`);
    const questionCountId = computed(() => `${idPrefix.value}-question-count`);
    const exerciseKindName = computed(() => `${idPrefix.value}-exercise-kind`);
    const voiceModeName = computed(() => `${idPrefix.value}-voice-mode`);
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
    watch(passiveAvailable, (available) => {
      if (!available && props.voiceMode !== "active") emit("updateVoiceMode", "active");
    }, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: ["builder-card options-card", { "options-card--grid": __props.gridLayout, "options-card--revealing": unref(prefilledRevealRunning), "options-card--falc": __props.falcMode }],
        "aria-labelledby": unref(optionsTitleId)
      }, _attrs))} data-v-86bf4490>`);
      if (!__props.falcMode) {
        _push(`<div class="builder-card__header" data-v-86bf4490><div data-v-86bf4490><p class="builder-card__eyebrow" data-v-86bf4490>${ssrInterpolate(__props.eyebrow ?? "Étape 3")}</p><h2${ssrRenderAttr("id", unref(optionsTitleId))} data-v-86bf4490>${ssrInterpolate(unref(ui)("Mes options"))}</h2></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="${ssrRenderClass([{ "options-layout--columns": __props.gridLayout }, "options-layout"])}" data-v-86bf4490><div class="${ssrRenderClass([{ "options-fields--columns": __props.gridLayout }, "options-fields"])}" data-v-86bf4490><div class="options-main-column" data-v-86bf4490><div class="option-group-card option-group-card--questions" data-v-86bf4490><label class="field-stack question-count-field"${ssrRenderAttr("for", unref(questionCountId))} data-v-86bf4490><span data-v-86bf4490>${ssrInterpolate(unref(ui)("Nombre de questions"))}</span><input${ssrRenderAttr("id", unref(questionCountId))} type="number" inputmode="numeric" min="1" max="99" step="1"${ssrRenderAttr("value", unref(displayedQuestionCount))} data-v-86bf4490></label></div>`);
      if (!__props.falcMode) {
        _push(`<fieldset class="option-fieldset option-group-card option-group-card--pronouns" data-v-86bf4490><legend data-v-86bf4490>${ssrInterpolate(unref(ui)("Pronoms"))}</legend><label class="check-row" data-v-86bf4490><input type="checkbox"${ssrIncludeBooleanAttr(__props.inclusivePronouns) ? " checked" : ""} data-v-86bf4490><span data-v-86bf4490>${ssrInterpolate(unref(ui)("Inclure les pronoms"))} <strong data-v-86bf4490>iel / iels</strong><small data-v-86bf4490>${ssrInterpolate(unref(ui)("Ils apparaîtront ponctuellement dans les questions."))}</small></span></label><label class="check-row" data-v-86bf4490><input type="checkbox"${ssrIncludeBooleanAttr(__props.includeOnPronoun) ? " checked" : ""} data-v-86bf4490><span data-v-86bf4490>${ssrInterpolate(unref(ui)("Inclure le pronom"))} <strong data-v-86bf4490>on</strong><small data-v-86bf4490>${ssrInterpolate(unref(ui)("Il apparaîtra ponctuellement dans les questions à la troisième personne du singulier."))}</small></span></label></fieldset>`);
      } else {
        _push(`<!---->`);
      }
      if (!__props.falcMode) {
        _push(`<fieldset class="option-fieldset option-group-card option-group-card--exercise" data-v-86bf4490><legend data-v-86bf4490>${ssrInterpolate(unref(ui)("Type d’exercice"))}</legend><div class="segmented-control" data-v-86bf4490><label data-v-86bf4490><input type="radio"${ssrRenderAttr("name", unref(exerciseKindName))} value="conjugation"${ssrIncludeBooleanAttr(__props.exerciseKind === "conjugation") ? " checked" : ""} data-v-86bf4490><span data-v-86bf4490>${ssrInterpolate(unref(ui)("Conjuguer"))}</span></label><label data-v-86bf4490><input type="radio"${ssrRenderAttr("name", unref(exerciseKindName))} value="tense-identification"${ssrIncludeBooleanAttr(__props.exerciseKind === "tense-identification") ? " checked" : ""} data-v-86bf4490><span data-v-86bf4490>${ssrInterpolate(unref(ui)("Trouver le mode et le temps"))}</span></label></div>`);
        if (__props.exerciseKind === "tense-identification") {
          _push(`<div class="identification-source-panel" data-v-86bf4490><div class="segmented-control segmented-control--stacked" data-v-86bf4490><label data-v-86bf4490><input type="radio"${ssrRenderAttr("name", unref(identificationSourceName))} value="selected-verbs"${ssrIncludeBooleanAttr(__props.identificationSource === "selected-verbs") ? " checked" : ""} data-v-86bf4490><span data-v-86bf4490><strong data-v-86bf4490>${ssrInterpolate(unref(ui)("Avec mes verbes"))}</strong><small data-v-86bf4490>${ssrInterpolate(unref(ui)("Formes conjuguées simples, sans citation."))}</small></span></label><label data-v-86bf4490><input type="radio"${ssrRenderAttr("name", unref(identificationSourceName))} value="literary-corpus"${ssrIncludeBooleanAttr(__props.identificationSource === "literary-corpus") ? " checked" : ""} data-v-86bf4490><span data-v-86bf4490><strong data-v-86bf4490>${ssrInterpolate(unref(ui)("Avec n’importe quel verbe"))}</strong><small data-v-86bf4490>${ssrInterpolate(unref(ui)("Construits avec des phrases littéraires."))}</small></span></label></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</fieldset>`);
      } else {
        _push(`<!---->`);
      }
      if (!__props.falcMode) {
        _push(`<fieldset class="${ssrRenderClass([{ "option-group-card--disabled": __props.exerciseKind !== "conjugation" }, "option-fieldset option-group-card option-group-card--voice voice-mode-fieldset"])}"${ssrIncludeBooleanAttr(__props.exerciseKind !== "conjugation") ? " disabled" : ""} data-v-86bf4490><legend data-v-86bf4490>${ssrInterpolate(unref(ui)("Voix du verbe"))}</legend><div class="segmented-control segmented-control--stacked" data-v-86bf4490><label data-v-86bf4490><input type="radio"${ssrRenderAttr("name", unref(voiceModeName))} value="active"${ssrIncludeBooleanAttr(__props.voiceMode === "active") ? " checked" : ""} data-v-86bf4490><span data-v-86bf4490><strong data-v-86bf4490>${ssrInterpolate(unref(ui)("Active uniquement"))}</strong></span></label><label data-v-86bf4490><input type="radio"${ssrRenderAttr("name", unref(voiceModeName))} value="passive"${ssrIncludeBooleanAttr(__props.voiceMode === "passive") ? " checked" : ""}${ssrIncludeBooleanAttr(!unref(passiveAvailable)) ? " disabled" : ""} data-v-86bf4490><span data-v-86bf4490><strong data-v-86bf4490>${ssrInterpolate(unref(ui)("Passive uniquement"))}</strong><small data-v-86bf4490>${ssrInterpolate(unref(ui)("Le COD devient le sujet de la phrase."))}</small></span></label><label data-v-86bf4490><input type="radio"${ssrRenderAttr("name", unref(voiceModeName))} value="mixed"${ssrIncludeBooleanAttr(__props.voiceMode === "mixed") ? " checked" : ""}${ssrIncludeBooleanAttr(!unref(passiveAvailable)) ? " disabled" : ""} data-v-86bf4490><span data-v-86bf4490><strong data-v-86bf4490>${ssrInterpolate(unref(ui)("Active et passive"))}</strong><small data-v-86bf4490>${ssrInterpolate(unref(ui)("Les deux voix alterneront dans le défi."))}</small></span></label></div>`);
        if (!unref(passiveAvailable)) {
          _push(`<small class="field-hint" data-v-86bf4490>${ssrInterpolate(unref(ui)("Aucun verbe sélectionné ne possède de COD validé."))}</small>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</fieldset>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (!__props.falcMode) {
        _push(`<div data-tour="options-complements" class="${ssrRenderClass([{
          "complement-options--disabled": !unref(complementsAvailable)
        }, "complement-options"])}" data-v-86bf4490>`);
        if (__props.gridLayout) {
          _push(`<h3 class="complement-options__title" data-v-86bf4490>${ssrInterpolate(unref(ui)("Compléments d’objets :"))}</h3>`);
        } else {
          _push(`<!---->`);
        }
        if (__props.gridLayout) {
          _push(`<p class="complement-options__description" data-v-86bf4490>${ssrInterpolate(unref(ui)("Ajoute des compléments d’objets directs ou indirects."))}</p>`);
        } else {
          _push(`<button class="complement-options__trigger" type="button"${ssrIncludeBooleanAttr(!unref(complementsAvailable)) ? " disabled" : ""}${ssrRenderAttr("aria-expanded", unref(complementsOpen))}${ssrRenderAttr("aria-controls", unref(complementPanelId))} data-v-86bf4490><span data-v-86bf4490>${ssrInterpolate(unref(ui)("Compléments d’objets :"))} <small data-v-86bf4490>${ssrInterpolate(unref(ui)("nouveau"))}</small></span><span aria-hidden="true" data-v-86bf4490>${ssrInterpolate(unref(complementsOpen) ? "−" : "+")}</span></button>`);
        }
        if (!unref(complementsAvailable)) {
          _push(`<p class="complement-options__unavailable" data-v-86bf4490>${ssrInterpolate(__props.exerciseKind !== "conjugation" ? unref(ui)("Disponible uniquement pour un exercice de conjugaison.") : __props.voiceMode === "passive" ? unref(ui)("Au passif, le COD devient le sujet : ces options ne s’appliquent pas.") : unref(ui)("Les verbes choisis ne proposent pas de complément."))}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (__props.gridLayout || unref(complementsOpen)) {
          _push(`<fieldset${ssrRenderAttr("id", unref(complementPanelId))} class="complement-options__panel" data-v-86bf4490><legend class="sr-only" data-v-86bf4490>${ssrInterpolate(unref(ui)("Présentation des compléments d’objets"))}</legend><label data-v-86bf4490><input type="checkbox"${ssrIncludeBooleanAttr(!unref(complementsAvailable) || !unref(codAvailable)) ? " disabled" : ""}${ssrIncludeBooleanAttr(unref(displayedComplementOptions).includes("cod-after")) ? " checked" : ""} data-v-86bf4490><span data-v-86bf4490><strong data-v-86bf4490>${ssrInterpolate(unref(ui)("COD placé après"))}</strong></span></label><label data-v-86bf4490><input type="checkbox"${ssrIncludeBooleanAttr(!unref(complementsAvailable) || !unref(codBeforeAvailable)) ? " disabled" : ""}${ssrIncludeBooleanAttr(unref(displayedComplementOptions).includes("cod-before")) ? " checked" : ""} data-v-86bf4490><span data-v-86bf4490><strong data-v-86bf4490>${ssrInterpolate(unref(ui)("COD placé avant"))}</strong></span></label><label data-v-86bf4490><input type="checkbox"${ssrIncludeBooleanAttr(!unref(complementsAvailable) || !unref(coiAvailable)) ? " disabled" : ""}${ssrIncludeBooleanAttr(unref(displayedComplementOptions).includes("coi-after")) ? " checked" : ""} data-v-86bf4490><span data-v-86bf4490><strong data-v-86bf4490>${ssrInterpolate(unref(ui)("COI placé après"))}</strong></span></label><label data-v-86bf4490><input type="checkbox"${ssrIncludeBooleanAttr(!unref(complementsAvailable) || !unref(coiBeforeAvailable)) ? " disabled" : ""}${ssrIncludeBooleanAttr(unref(displayedComplementOptions).includes("coi-before")) ? " checked" : ""} data-v-86bf4490><span data-v-86bf4490><strong data-v-86bf4490>${ssrInterpolate(unref(ui)("COI placé avant"))}</strong></span></label></fieldset>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (!__props.falcMode && __props.gridLayout && (__props.conjugationExampleLoading || unref(hasConjugationExample))) {
        _push(`<div data-tour="options-preview" class="${ssrRenderClass([{ "conjugation-example--wide": __props.exerciseKind === "tense-identification" }, "conjugation-example"])}" aria-live="polite" aria-atomic="true" data-v-86bf4490><div class="conjugation-example__header" data-v-86bf4490><span class="conjugation-example__preview-icon" aria-hidden="true" data-v-86bf4490><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" data-v-86bf4490><path d="M1.5 12s3.8-7 10.5-7 10.5 7 10.5 7-3.8 7-10.5 7S1.5 12 1.5 12Z" data-v-86bf4490></path><circle cx="12" cy="12" r="3" data-v-86bf4490></circle></svg></span><div class="conjugation-example__heading" data-v-86bf4490><span data-v-86bf4490>${ssrInterpolate(unref(ui)("Aperçu d’une question"))}</span></div></div><div class="conjugation-example__screen" data-v-86bf4490>`);
        if (__props.conjugationExampleLoading) {
          _push(`<div class="conjugation-example__loading" role="status" data-v-86bf4490><span class="conjugation-example__spinner" aria-hidden="true" data-v-86bf4490></span><span class="sr-only" data-v-86bf4490>${ssrInterpolate(unref(ui)("Préparation de l’aperçu"))}</span></div>`);
        } else {
          _push(`<div class="conjugation-example__body" data-v-86bf4490>`);
          if (unref(exampleRevealStage) >= 1) {
            _push(`<div class="conjugation-example__question" data-v-86bf4490><span class="conjugation-example__block-label" data-v-86bf4490>${ssrInterpolate(unref(ui)("Exemple de question"))}</span>`);
            if (__props.exerciseKind === "tense-identification" && __props.conjugationInstruction && __props.conjugationQuestion) {
              _push(`<!--[--><p class="conjugation-example__instruction" data-v-86bf4490>${ssrInterpolate(__props.conjugationInstruction)}</p>`);
              if (__props.conjugationLiteraryCitation) {
                _push(`<blockquote class="conjugation-example__citation" data-v-86bf4490><p data-v-86bf4490><span data-v-86bf4490>${ssrInterpolate(__props.conjugationLiteraryCitation.before)}</span><mark data-v-86bf4490>${ssrInterpolate(__props.conjugationLiteraryCitation.target)}</mark><span data-v-86bf4490>${ssrInterpolate(__props.conjugationLiteraryCitation.after)}</span></p><footer data-v-86bf4490>${ssrInterpolate(__props.conjugationLiteraryCitation.author)}, <cite data-v-86bf4490>${ssrInterpolate(__props.conjugationLiteraryCitation.work)}</cite></footer></blockquote>`);
              } else {
                _push(`<p class="conjugation-example__question-line" data-v-86bf4490><span class="conjugation-example__prompt" data-v-86bf4490>${ssrInterpolate(unref(identificationQuestion))}</span></p>`);
              }
              _push(`<!--]-->`);
            } else {
              _push(`<!--[-->`);
              if (__props.conjugationInstruction) {
                _push(`<p class="conjugation-example__instruction" data-v-86bf4490>${ssrInterpolate(__props.conjugationInstruction)}</p>`);
              } else {
                _push(`<!---->`);
              }
              if (__props.conjugationQuestionContext) {
                _push(`<p class="conjugation-example__question-line" data-v-86bf4490><span class="conjugation-example__context" data-v-86bf4490>${ssrInterpolate(__props.conjugationQuestionContext)}</span></p>`);
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
            _push(`<div class="conjugation-example__correction" data-v-86bf4490><span data-v-86bf4490>${ssrInterpolate(unref(ui)("Réponse attendue"))}</span><p data-v-86bf4490>`);
            if (__props.conjugationExampleEmphasis) {
              _push(`<!--[--><span data-v-86bf4490>${ssrInterpolate(__props.conjugationExamplePrefix)}</span><strong data-v-86bf4490>${ssrInterpolate(__props.conjugationExampleEmphasis)}</strong><span data-v-86bf4490>${ssrInterpolate(__props.conjugationExampleSuffix)}</span><!--]-->`);
            } else {
              _push(`<span data-v-86bf4490>${ssrInterpolate(__props.conjugationExample)}</span>`);
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
const ChallengeOptions = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$5, [["__scopeId", "data-v-86bf4490"]]), { __name: "ChallengeOptions" });
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
const _imports_0 = publicAssetsURL("/images/recharger-defi.svg?v=dynamic-code");
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
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
    const copyStatuses = reactive({ code: "", link: "" });
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
          _push2(`<div class="share-methods"><section class="share-method" aria-labelledby="share-code-title"><header><span class="share-method__number" aria-hidden="true">1</span><div><h3 id="share-code-title">${ssrInterpolate(unref(ui)("Sauvegarder le code"))}</h3><p>${ssrInterpolate(unref(ui)("L’élève conserve ce code. Plus tard, il le copie sur la page d’accueil pour retrouver ce défi."))}</p><p class="share-method__tip">${ssrInterpolate(unref(ui)("Idéal pour transmettre le défi par écrit"))}</p></div></header><div class="share-value"><label for="share-code">${ssrInterpolate(unref(ui)("Code à conserver"))}</label><div><input id="share-code"${ssrRenderAttr("value", __props.code)} readonly><button type="button">${ssrInterpolate(unref(ui)("Copier"))}</button></div>`);
          if (unref(copyStatuses).code) {
            _push2(`<p class="share-value__copy-status" role="status">${ssrInterpolate(unref(copyStatuses).code)}</p>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="share-help"><button type="button" class="share-help__trigger" aria-describedby="reload-help-tooltip">${ssrInterpolate(unref(ui)("Comment le recharger plus tard ?"))}</button><div id="reload-help-tooltip" class="share-help__tooltip" role="tooltip"><div class="share-help__preview"><img${ssrRenderAttr("src", _imports_0)}${ssrRenderAttr("alt", unref(ui)("Emplacement du code reçu sur la page d’accueil"))}><span aria-hidden="true">${ssrInterpolate(__props.code)}</span></div><p>Tes élèves colleront le code à cet endroit dans la `);
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
          _push2(`</p></div></div></div></section><section class="share-method" aria-labelledby="share-link-title"><header><span class="share-method__number" aria-hidden="true">2</span><div><h3 id="share-link-title">${ssrInterpolate(unref(ui)("Envoyer le lien direct"))}</h3><p>${ssrInterpolate(unref(ui)("L’élève clique simplement sur ce lien : il arrive directement sur le défi, sans saisir le code."))}</p><p class="share-method__tip">${ssrInterpolate(unref(ui)("Idéal pour transmettre le défi par email"))}</p></div></header><div class="share-value"><label for="share-url">${ssrInterpolate(unref(ui)("Lien à envoyer"))}</label><div><input id="share-url"${ssrRenderAttr("value", __props.url)} readonly><button type="button">${ssrInterpolate(unref(ui)("Copier"))}</button></div>`);
          if (unref(copyStatuses).link) {
            _push2(`<p class="share-value__copy-status" role="status">${ssrInterpolate(unref(copyStatuses).link)}</p>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div></section></div>`);
        } else {
          _push2(`<!---->`);
        }
        if (__props.code) {
          _push2(`<button class="primary-button" type="button">${ssrInterpolate(unref(ui)("Terminé"))}</button>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`</section></div>`);
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/challenge/ShareChallengeDialog.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const ShareChallengeDialog = Object.assign(_sfc_main$3, { __name: "ChallengeShareChallengeDialog" });
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "TensePicker",
  __ssrInlineRender: true,
  props: {
    modes: {},
    tenses: {},
    verbs: {},
    selectedIds: {},
    pastSimplePronouns: {},
    falcMode: { type: Boolean }
  },
  emits: ["toggle", "selectAll", "clear", "updatePastSimplePronouns"],
  setup(__props, { emit: __emit }) {
    const { ui, uiLabel } = useLanguagePreferences();
    const props = __props;
    const selectedSet = computed(() => new Set(props.selectedIds));
    const advancedModesOpen = ref(false);
    const isPastSimple = (tense) => tense.name.toLocaleLowerCase("fr") === "passé simple";
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
    const basicModeNames = /* @__PURE__ */ new Set(["indicatif", "impératif"]);
    const basicGroups = computed(() => groups.value.filter((group) => basicModeNames.has(group.mode.name.toLocaleLowerCase("fr"))));
    const advancedGroups = computed(() => groups.value.filter((group) => !basicModeNames.has(group.mode.name.toLocaleLowerCase("fr"))));
    const visibleGroups = computed(() => props.falcMode ? [...basicGroups.value, ...advancedModesOpen.value ? advancedGroups.value : []] : groups.value);
    watch(() => props.falcMode, () => {
      advancedModesOpen.value = false;
    });
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
      }, _attrs))} data-v-a8ef2690><div class="builder-card__header" data-v-a8ef2690><div data-v-a8ef2690><p class="builder-card__eyebrow" data-v-a8ef2690>${ssrInterpolate(unref(ui)("Étape 2"))}</p><h2 id="tenses-title" data-v-a8ef2690>${ssrInterpolate(unref(ui)("Mes temps"))}</h2></div><span class="count-badge"${ssrRenderAttr("aria-label", `${__props.selectedIds.length} temps sélectionnés`)} data-v-a8ef2690>${ssrInterpolate(__props.selectedIds.length)}</span></div>`);
      if (!__props.falcMode) {
        _push(`<div class="selection-toolbar" data-v-a8ef2690><button class="text-button" type="button" data-v-a8ef2690>${ssrInterpolate(unref(ui)("Tout cocher"))}</button><button class="text-button text-button--danger" type="button" data-v-a8ef2690>${ssrInterpolate(unref(ui)("Tout décocher"))}</button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="tense-groups" data-v-a8ef2690><!--[-->`);
      ssrRenderList(unref(visibleGroups), (group) => {
        _push(`<section class="tense-group" role="group"${ssrRenderAttr("aria-labelledby", `tense-mode-${group.mode.id}`)} data-v-a8ef2690><h3${ssrRenderAttr("id", `tense-mode-${group.mode.id}`)} class="tense-group__title" data-v-a8ef2690>${ssrInterpolate(unref(uiLabel)(group.mode.name))}</h3><div class="${ssrRenderClass([{ "tense-group__columns--single": group.columns.length === 1 }, "tense-group__columns"])}" data-v-a8ef2690><!--[-->`);
        ssrRenderList(group.columns, (column, columnIndex) => {
          _push(`<div class="tense-group__column" data-v-a8ef2690><div class="tense-group__items" data-v-a8ef2690><!--[-->`);
          ssrRenderList(column, (tense) => {
            _push(`<div class="tense-entry" data-v-a8ef2690><div class="tense-row" data-v-a8ef2690><span class="tense-info" data-v-a8ef2690><button type="button"${ssrRenderAttr("aria-label", `${unref(ui)("Voir un exemple :")} ${unref(uiLabel)(tense.name)}`)}${ssrRenderAttr("aria-describedby", `tense-example-${tense.id}`)} data-v-a8ef2690>i</button><span${ssrRenderAttr("id", `tense-example-${tense.id}`)} class="tense-tooltip" role="tooltip" data-v-a8ef2690>`);
            if (unref(examples)[tense.id]) {
              _push(`<!--[-->${ssrInterpolate(unref(ui)("Exemple:"))} <strong data-v-a8ef2690>${ssrInterpolate(unref(examples)[tense.id].emphasis)}</strong>`);
              if (unref(examples)[tense.id].rest) {
                _push(`<!--[-->${ssrInterpolate(unref(examples)[tense.id].rest)}<!--]-->`);
              } else {
                _push(`<!---->`);
              }
              _push(`<!--]-->`);
            } else {
              _push(`<!--[-->${ssrInterpolate(unref(examplesLoading) ? unref(ui)("Chargement…") : unref(ui)("Exemple momentanément indisponible."))}<!--]-->`);
            }
            _push(`</span></span><label class="switch-row" data-v-a8ef2690><input type="checkbox"${ssrIncludeBooleanAttr(unref(selectedSet).has(tense.id)) ? " checked" : ""} data-v-a8ef2690><span class="switch-row__control" aria-hidden="true" data-v-a8ef2690></span><span data-v-a8ef2690>${ssrInterpolate(unref(uiLabel)(tense.name))}</span></label></div>`);
            if (isPastSimple(tense) && unref(selectedSet).has(tense.id)) {
              _push(`<div class="past-simple-option" data-v-a8ef2690><label class="past-simple-option__choice" data-v-a8ef2690><input type="checkbox"${ssrIncludeBooleanAttr(__props.pastSimplePronouns === "third-person-only") ? " checked" : ""} data-v-a8ef2690><span data-v-a8ef2690><strong data-v-a8ef2690>${ssrInterpolate(unref(ui)("Uniquement il / ils"))}</strong></span></label></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          });
          _push(`<!--]--></div></div>`);
        });
        _push(`<!--]--></div>`);
        if (group.trailingTenses.length) {
          _push(`<div class="tense-group__trailing" data-v-a8ef2690><!--[-->`);
          ssrRenderList(group.trailingTenses, (tense) => {
            _push(`<div class="tense-entry" data-v-a8ef2690><div class="tense-row" data-v-a8ef2690><span class="tense-info" data-v-a8ef2690><button type="button"${ssrRenderAttr("aria-label", `${unref(ui)("Voir un exemple :")} ${unref(uiLabel)(tense.name)}`)}${ssrRenderAttr("aria-describedby", `tense-example-${tense.id}`)} data-v-a8ef2690>i</button><span${ssrRenderAttr("id", `tense-example-${tense.id}`)} class="tense-tooltip" role="tooltip" data-v-a8ef2690>`);
            if (unref(examples)[tense.id]) {
              _push(`<!--[-->${ssrInterpolate(unref(ui)("Exemple:"))} <strong data-v-a8ef2690>${ssrInterpolate(unref(examples)[tense.id].emphasis)}</strong>`);
              if (unref(examples)[tense.id].rest) {
                _push(`<!--[-->${ssrInterpolate(unref(examples)[tense.id].rest)}<!--]-->`);
              } else {
                _push(`<!---->`);
              }
              _push(`<!--]-->`);
            } else {
              _push(`<!--[-->${ssrInterpolate(unref(examplesLoading) ? unref(ui)("Chargement…") : unref(ui)("Exemple momentanément indisponible."))}<!--]-->`);
            }
            _push(`</span></span><label class="switch-row" data-v-a8ef2690><input type="checkbox"${ssrIncludeBooleanAttr(unref(selectedSet).has(tense.id)) ? " checked" : ""} data-v-a8ef2690><span class="switch-row__control" aria-hidden="true" data-v-a8ef2690></span><span data-v-a8ef2690>${ssrInterpolate(unref(uiLabel)(tense.name))}</span></label></div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</section>`);
      });
      _push(`<!--]-->`);
      if (__props.falcMode && unref(advancedGroups).length) {
        _push(`<button class="advanced-modes-button" type="button"${ssrRenderAttr("aria-expanded", unref(advancedModesOpen))} data-v-a8ef2690>${ssrInterpolate(unref(advancedModesOpen) ? unref(ui)("Masquer les autres modes") : unref(ui)("Voir les autres modes"))}</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></section>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/challenge/TensePicker.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const TensePicker = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$2, [["__scopeId", "data-v-a8ef2690"]]), { __name: "ChallengeTensePicker" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "VerbPicker",
  __ssrInlineRender: true,
  props: {
    verbs: {},
    selectedIds: {},
    falcMode: { type: Boolean }
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
      }, _attrs))} data-v-053cbca8><div class="builder-card__header" data-v-053cbca8><div data-v-053cbca8><p class="builder-card__eyebrow" data-v-053cbca8>${ssrInterpolate(unref(ui)("Étape 1"))}</p><h2 id="verbs-title" data-v-053cbca8>${ssrInterpolate(unref(ui)("Mes verbes"))}</h2></div><span class="count-badge"${ssrRenderAttr("aria-label", `${__props.selectedIds.length} verbes sélectionnés`)} data-v-053cbca8>${ssrInterpolate(__props.selectedIds.length)}</span></div><div class="verb-search" data-v-053cbca8><label for="verb-search-input" data-v-053cbca8>${ssrInterpolate(unref(ui)("Écris un verbe pour l’ajouter"))}</label><div class="verb-search__control" data-v-053cbca8><input id="verb-search-input"${ssrRenderAttr("value", unref(query))} type="search" autocomplete="off"${ssrRenderAttr("placeholder", unref(ui)("Ex. aller, être, finir…"))}${ssrRenderAttr("aria-expanded", unref(suggestions).length > 0)} aria-controls="verb-suggestions" data-v-053cbca8><button class="icon-button icon-button--add" type="button"${ssrIncludeBooleanAttr(unref(suggestions).length === 0) ? " disabled" : ""}${ssrRenderAttr("aria-label", unref(ui)("Ajouter le premier verbe proposé"))} data-v-053cbca8> + </button></div>`);
      if (unref(suggestions).length > 0) {
        _push(`<ul id="verb-suggestions" class="verb-suggestions" role="listbox"${ssrRenderAttr("aria-label", unref(ui)("Verbes proposés"))} data-v-053cbca8><!--[-->`);
        ssrRenderList(unref(suggestions), (verb) => {
          _push(`<li role="option" data-v-053cbca8><button type="button" data-v-053cbca8><strong data-v-053cbca8>${ssrInterpolate(verb.infinitif)}</strong>`);
          if (verb.isPronominalForm && verb.baseVerbId) {
            _push(`<span data-v-053cbca8>${ssrInterpolate(unref(ui)("forme pronominale générée"))}</span>`);
          } else if (verb.auxiliaire) {
            _push(`<span data-v-053cbca8>${ssrInterpolate(unref(ui)("auxiliaire"))} ${ssrInterpolate(verb.auxiliaire)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</button></li>`);
        });
        _push(`<!--]--></ul>`);
      } else if (unref(query)) {
        _push(`<p class="field-hint" aria-live="polite" data-v-053cbca8> Aucun nouveau verbe ne commence par « ${ssrInterpolate(unref(query))} ». </p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="selection-toolbar" data-v-053cbca8>`);
      if (!__props.falcMode) {
        _push(`<p data-v-053cbca8>${ssrInterpolate(unref(selectedVerbs).length ? unref(ui)("Verbes retenus") : unref(ui)("Aucun verbe sélectionné"))}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(selectedVerbs).length) {
        _push(`<button class="text-button text-button--danger" type="button" data-v-053cbca8>${ssrInterpolate(unref(ui)("Tout supprimer"))}</button>`);
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
        })} data-v-053cbca8>`);
        ssrRenderList(unref(selectedVerbs), (verb) => {
          _push(`<li data-v-053cbca8><span data-v-053cbca8>${ssrInterpolate(verb.infinitif)}</span><button type="button"${ssrRenderAttr("aria-label", unref(ui)("Retirer le verbe {verb}", { verb: verb.infinitif }))} data-v-053cbca8>×</button></li>`);
        });
        _push(`</ul>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/challenge/VerbPicker.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const VerbPicker = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-053cbca8"]]), { __name: "ChallengeVerbPicker" });
function useRequestURL(opts) {
  {
    return getRequestURL(useRequestEvent(), opts);
  }
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "WizardChallengeWorkspace",
  __ssrInlineRender: true,
  props: {
    initialCode: {},
    homeHeading: {}
  },
  async setup(__props) {
    let __temp, __restore;
    const { ui, localePath, interfaceLocale } = useLanguagePreferences();
    const props = __props;
    let classicExercisePromise;
    let chatExercisePromise;
    let coachPickerPromise;
    function loadClassicExercise() {
      classicExercisePromise ??= import('./ClassicExercise-DYlkuERq.mjs').then((module) => module.default).catch((error) => {
        classicExercisePromise = void 0;
        throw error;
      });
      return classicExercisePromise;
    }
    function loadChatExercise() {
      chatExercisePromise ??= import('./ChatExercise-CTpcvR30.mjs').then((module) => module.default).catch((error) => {
        chatExercisePromise = void 0;
        throw error;
      });
      return chatExercisePromise;
    }
    function loadCoachPicker() {
      coachPickerPromise ??= import('./CoachPicker-msF4XpOi.mjs').then((module) => module.default).catch((error) => {
        coachPickerPromise = void 0;
        throw error;
      });
      return coachPickerPromise;
    }
    const ClassicExercise = defineAsyncComponent(loadClassicExercise);
    const ChatExercise = defineAsyncComponent(loadChatExercise);
    const CoachPicker = defineAsyncComponent(loadCoachPicker);
    const {
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
      applySelection,
      applySharedChallenge
    } = useChallengeBuilder();
    const api = useChallengeApi();
    const { track } = useSiteAnalytics();
    const route = useRoute();
    const requestUrl = useRequestURL();
    const wizardInitialized = useState("wizard-challenge-initialized", () => false);
    const homeResetRequested = useState("home-reset-requested", () => false);
    const newChallengeRequested = useState("new-challenge-requested", () => false);
    const guidedTourRequested = useState("guided-tour-requested", () => false);
    const guidedTourDisabled = ref(false);
    useState("wizard-at-home", () => true);
    const falcMode = useState("falc-mode", () => false);
    const currentStep = ref(0);
    const falcHomePanel = ref(null);
    const isPreparingStep4 = ref(false);
    const highlightChallengeLoader = ref(false);
    const presetStage = ref("groups");
    const presetExpanded = ref(false);
    const challengeCode = ref("");
    const codeError = ref("");
    const actionError = ref("");
    const notice = ref("");
    const busyAction = ref(null);
    const activePresetId = ref();
    const sourcePresetId = ref();
    const sourcePresetRandomCount = ref(null);
    const isPrefilledChallenge = ref(false);
    const isPresetVerbEditing = ref(false);
    const questions = ref([]);
    const printQuestions = ref([]);
    const shareCode = ref("");
    const shareTitle = ref("");
    const shareDescription = ref("");
    const shareError = ref("");
    const savedChallengeTitle = ref("");
    const savedChallengeDescription = ref("");
    const exerciseTracking = ref();
    const isExerciseOpen = ref(false);
    const exercisePresentation = ref("classic");
    const isPrintOpen = ref(false);
    const printPreviewComponent = shallowRef(null);
    const isShareOpen = ref(false);
    const isCoachPickerOpen = ref(false);
    const selectedCoach = ref(null);
    useTemplateRef("classic-exercise");
    useTemplateRef("chat-exercise");
    const chatExerciseVerbs = computed(() => {
      if (challenge.value.identificationSource !== "literary-corpus" || challenge.value.exerciseKind !== "tense-identification") return selectedVerbs.value;
      const questionVerbIds = new Set(questions.value.map((question) => Number(question.verbeId)));
      const literaryVerbs = catalogue.value.verbes.filter((verb) => questionVerbIds.has(verb.id));
      return literaryVerbs.length ? literaryVerbs : selectedVerbs.value;
    });
    const identificationTenses = computed(() => {
      const modes = new Map(catalogue.value.modes.map((mode) => [mode.id, mode]));
      return catalogue.value.temps.map((tense) => ({ ...tense, mode: tense.mode || modes.get(tense.modeId) }));
    });
    const isTourWelcomeOpen = useState("guided-tour-welcome-open", () => false);
    const tourWelcomeSource = useState("guided-tour-welcome-source", () => null);
    const tourActive = ref(false);
    const tourSecondaryWizardStep = ref(null);
    const tourWizardIndicatorStyle = ref({});
    const tourCopy = computed(() => guidedTourCopy(interfaceLocale.value));
    const tourLanguageOptions = computed(() => [
      { value: "fr", label: ui("Français"), flag: "🇫🇷" },
      { value: "de", label: ui("Allemand"), flag: "🇩🇪" },
      { value: "en", label: ui("Anglais"), flag: "🇬🇧" },
      { value: "it", label: ui("Italien"), flag: "🇮🇹" },
      { value: "es", label: ui("Espagnol"), flag: "🇪🇸" }
    ]);
    const revealedPresetVerbIds = ref([]);
    const revealedPresetTenseIds = ref([]);
    const presetTenseRevealPending = ref(false);
    const prefilledOptionsRevealPending = ref(false);
    const showLaunchSummary = ref(false);
    const conjugationInstructionRaw = ref("");
    const conjugationQuestionContextRaw = ref("");
    const conjugationQuestionRaw = ref("");
    const conjugationExampleRaw = ref("");
    const conjugationExamplePrefixRaw = ref("");
    const conjugationExampleEmphasisRaw = ref("");
    const conjugationExampleSuffixRaw = ref("");
    const conjugationLiteraryCitationRaw = ref();
    const conjugationExampleLoading = ref(false);
    let conjugationExampleRequest = 0;
    let presetRevealTimers = [];
    watch(isPrintOpen, async (open) => {
      if (!open || printPreviewComponent.value) return;
      printPreviewComponent.value = markRaw((await import('./PrintPreview-Cv3FkiKR.mjs')).default);
    });
    const displayedVerbIds = computed(() => tourActive.value || isPrefilledChallenge.value ? revealedPresetVerbIds.value : challenge.value.verbIds);
    const displayedTenseIds = computed(() => tourActive.value || isPrefilledChallenge.value ? revealedPresetTenseIds.value : challenge.value.tenseIds);
    const displayedSelectedVerbs = computed(() => {
      const displayedIds = new Set(displayedVerbIds.value);
      return selectedVerbs.value.filter((verb) => displayedIds.has(verb.id));
    });
    function cancelPresetReveal() {
      presetRevealTimers.forEach((timer) => clearTimeout(timer));
      presetRevealTimers = [];
    }
    function refreshTourHighlight() {
      if (!tourActive.value) return;
      void nextTick().then(() => {
        requestAnimationFrame(() => {
          if (tourActive.value) ;
        });
      });
    }
    function revealIds(ids, target, duration = 1e3) {
      target.value = [];
      if (!ids.length) return;
      if ((void 0).matchMedia("(prefers-reduced-motion: reduce)").matches) {
        target.value = [...ids];
        refreshTourHighlight();
        return;
      }
      const interval = duration / ids.length;
      ids.forEach((id, index) => {
        presetRevealTimers.push(setTimeout(() => {
          target.value = [...target.value, id];
          refreshTourHighlight();
        }, Math.round(index * interval)));
      });
    }
    function withExampleSubject(value) {
      const subject = challenge.value.inclusivePronouns ? "iel" : challenge.value.includeOnPronoun ? "on" : "il";
      return value.replace(/\b(?:il|elle|iel)\b/iu, (match) => new RegExp("^\\p{Lu}", "u").test(match) ? subject.charAt(0).toLocaleUpperCase("fr") + subject.slice(1) : subject);
    }
    function capitalizeExampleSentence(value) {
      return value.replace(new RegExp("\\p{L}", "u"), (letter) => letter.toLocaleUpperCase("fr"));
    }
    const conjugationInstruction = computed(() => conjugationInstructionRaw.value);
    const conjugationQuestionContext = computed(() => withExampleSubject(conjugationQuestionContextRaw.value));
    const conjugationQuestion = computed(() => capitalizeExampleSentence(withExampleSubject(conjugationQuestionRaw.value)));
    const conjugationExample = computed(() => capitalizeExampleSentence(withExampleSubject(conjugationExampleRaw.value)));
    const conjugationExamplePrefix = computed(() => capitalizeExampleSentence(withExampleSubject(conjugationExamplePrefixRaw.value)));
    const conjugationExampleEmphasis = computed(() => {
      const emphasis = withExampleSubject(conjugationExampleEmphasisRaw.value);
      return conjugationExamplePrefixRaw.value ? emphasis : capitalizeExampleSentence(emphasis);
    });
    const conjugationExampleSuffix = computed(() => withExampleSubject(conjugationExampleSuffixRaw.value));
    function expectedAnswerParts(question) {
      const answer = question?.reponsesPourCorrige[0] ?? "";
      if (!question || !answer) return { prefix: "", emphasis: "", suffix: "" };
      if (!question.conjugaison1) return { prefix: "", emphasis: answer, suffix: "" };
      let start = 0;
      let end = answer.length;
      if (question.complementPosition === "before" && question.complement && answer.startsWith(question.complement)) {
        start = question.complement.length;
        while (/\s/u.test(answer[start] ?? "")) start += 1;
        if (question.relativePronoun && answer.slice(start).startsWith(question.relativePronoun)) {
          start += question.relativePronoun.length;
          while (/\s/u.test(answer[start] ?? "")) start += 1;
        }
      }
      if (question.saisiePrefixe && answer.slice(start).startsWith(question.saisiePrefixe)) {
        start += question.saisiePrefixe.length;
        while (/\s/u.test(answer[start] ?? "")) start += 1;
      }
      if (question.complementPosition === "after" && question.complement) {
        const complementStart = answer.lastIndexOf(question.complement);
        if (complementStart >= start) {
          end = complementStart;
          while (end > start && /\s/u.test(answer[end - 1] ?? "")) end -= 1;
        }
      }
      if (start >= end) return { prefix: "", emphasis: answer, suffix: "" };
      return {
        prefix: answer.slice(0, start),
        emphasis: answer.slice(start, end),
        suffix: answer.slice(end)
      };
    }
    const shareUrl = computed(() => shareCode.value ? new URL(localePath(`/defi/${encodeURIComponent(shareCode.value)}`), requestUrl.origin).toString() : "");
    const stepStatus = computed(() => ({
      verbs: selectedVerbs.value.length,
      tenses: selectedTenses.value.length
    }));
    const activePreset = computed(() => catalogue.value.presets.find((preset) => preset.id === activePresetId.value) ?? null);
    const sourcePreset = computed(() => catalogue.value.presets.find((preset) => preset.id === sourcePresetId.value) ?? null);
    const activePresetGroupLabel = computed(() => activePreset.value ? activePreset.value.groupLabel ?? challengePresetGroupLabels[activePreset.value.group] ?? activePreset.value.group : "");
    const activePresetTitleGroupLabel = computed(() => activePreset.value?.group === "school" ? ui("Niveau scolaire suisse") : activePresetGroupLabel.value);
    const activePresetDisplayTitle = computed(() => activePreset.value ? [activePresetTitleGroupLabel.value, activePreset.value.label].filter(Boolean).join(" | ") : "");
    const showSavedChallengeSummary = computed(() => isPrefilledChallenge.value && Boolean(savedChallengeTitle.value || savedChallengeDescription.value));
    const heroTitle = computed(() => {
      if (currentStep.value === 0) return "TATITOTU";
      if (activePreset.value) return activePresetDisplayTitle.value;
      if (isPrefilledChallenge.value && challengeCode.value) return `Défi ${challengeCode.value}`;
      return ui("Construire mon défi");
    });
    function requestedLandingTense() {
      const requested = Array.isArray(route.query.parcours) ? route.query.parcours[0] : route.query.parcours;
      const tenseByJourney = {
        present: "présent",
        imparfait: "imparfait",
        "passe-compose": "passé composé"
      };
      return requested ? tenseByJourney[requested] : void 0;
    }
    function requestedLandingMode() {
      const requested = Array.isArray(route.query.mode) ? route.query.mode[0] : route.query.mode;
      const modeByJourney = {
        indicatif: "indicatif",
        subjonctif: "subjonctif",
        conditionnel: "conditionnel",
        imperatif: "impératif",
        participe: "participe"
      };
      return requested ? modeByJourney[requested] : void 0;
    }
    function requestedModeTense() {
      const requested = Array.isArray(route.query.temps) ? route.query.temps[0] : route.query.temps;
      if (!requested) return void 0;
      const tenseAliases = {
        "futur simple": "futur",
        "passé première forme": "passé 1",
        "passé deuxième forme": "passé 2",
        "gérondif présent": "présent",
        "gérondif passé": "passé"
      };
      return tenseAliases[requested] ?? requested;
    }
    function requestedLearningIdentification() {
      const requested = Array.isArray(route.query.identifier) ? route.query.identifier[0] : route.query.identifier;
      return requested === "mode-temps";
    }
    const SIMPLE_LEARNING_VERBS = [
      "aimer",
      "parler",
      "regarder",
      "travailler",
      "jouer",
      "demander",
      "donner",
      "habiter",
      "chercher",
      "penser"
    ];
    function commonLearningVerbIds(count = 10) {
      const verbsByInfinitive = new Map(catalogue.value.verbes.map((verb) => [verb.infinitif.toLocaleLowerCase("fr"), verb]));
      return SIMPLE_LEARNING_VERBS.slice(0, count).map((infinitive) => verbsByInfinitive.get(infinitive)?.id).filter((id) => id !== void 0);
    }
    try {
      [__temp, __restore] = withAsyncContext(() => loadCatalogue()), await __temp, __restore();
      if (!wizardInitialized.value) {
        clearVerbs();
        clearTenses();
        wizardInitialized.value = true;
      }
      const landingTense = requestedLandingTense();
      const landingMode = requestedLandingMode();
      const modeTense = requestedModeTense();
      const learningIdentification = requestedLearningIdentification();
      if ((landingTense || landingMode || learningIdentification) && !props.initialCode) {
        const indicative = catalogue.value.modes.find((mode2) => mode2.name.toLocaleLowerCase("fr") === "indicatif");
        const tense = landingTense ? catalogue.value.temps.find((candidate) => candidate.name.toLocaleLowerCase("fr") === landingTense && (!indicative || candidate.modeId === indicative.id)) : void 0;
        const requestedModeName = landingMode === "participe" && String(route.query.temps || "").startsWith("gérondif") ? "gérondif" : landingMode;
        const mode = requestedModeName ? catalogue.value.modes.find((candidate) => candidate.name.toLocaleLowerCase("fr") === requestedModeName) : void 0;
        const selectedModeTense = mode && modeTense ? catalogue.value.temps.find((candidate) => candidate.modeId === mode.id && candidate.name.toLocaleLowerCase("fr") === modeTense) : void 0;
        const tenseIds = learningIdentification ? catalogue.value.temps.map((candidate) => candidate.id) : tense ? [tense.id] : selectedModeTense ? [selectedModeTense.id] : mode ? catalogue.value.temps.filter((candidate) => candidate.modeId === mode.id).map((candidate) => candidate.id) : [];
        if (tenseIds.length) {
          const defaults = createDefaultChallenge();
          challenge.value = {
            ...defaults,
            verbIds: commonLearningVerbIds(),
            tenseIds,
            questionCount: 10,
            exerciseKind: learningIdentification ? "tense-identification" : defaults.exerciseKind,
            identificationSource: learningIdentification ? "literary-corpus" : defaults.identificationSource,
            complementOptions: [...defaults.complementOptions],
            printOptions: { ...defaults.printOptions }
          };
          activePresetId.value = void 0;
          sourcePresetId.value = void 0;
          sourcePresetRandomCount.value = null;
          isPrefilledChallenge.value = true;
          revealedPresetVerbIds.value = [...challenge.value.verbIds];
          revealedPresetTenseIds.value = [...challenge.value.tenseIds];
          currentStep.value = 4;
          showLaunchSummary.value = true;
        }
      }
      if (props.initialCode) {
        challengeCode.value = normalizeChallengeCode(props.initialCode);
        [__temp, __restore] = withAsyncContext(() => restoreChallenge()), await __temp, __restore();
      }
    } catch {
    }
    function logUsage(event) {
      return;
    }
    function complementAnalyticsValue() {
      const options = challenge.value.complementOptions;
      const hasCod = options.some((option) => option.startsWith("cod-"));
      const hasCoi = options.some((option) => option.startsWith("coi-"));
      return hasCod && hasCoi ? "cod-coi" : hasCod ? "cod" : hasCoi ? "coi" : "none";
    }
    function questionCountBand() {
      const count = challenge.value.questionCount;
      return count <= 5 ? "1-5" : count <= 10 ? "6-10" : count <= 20 ? "11-20" : "21+";
    }
    function exerciseUsageMetadata(presentation) {
      return {
        feature: presentation === "chat" ? "exercise.chat" : presentation === "print" ? "print.preview" : "exercise.classic",
        presentation,
        exerciseKind: challenge.value.exerciseKind,
        source: sourcePresetId.value ? "preset" : challengeCode.value ? "code" : "custom",
        voiceMode: challenge.value.voiceMode,
        complements: complementAnalyticsValue(),
        complementPlacement: challenge.value.complementPlacement,
        questionCountBand: questionCountBand(),
        inclusivePronouns: challenge.value.inclusivePronouns,
        includeOnPronoun: challenge.value.includeOnPronoun,
        identificationSource: challenge.value.identificationSource,
        ...sourcePresetId.value ? { preset: sourcePresetId.value } : {}
      };
    }
    function clearMessages() {
      actionError.value = "";
      notice.value = "";
      codeError.value = "";
    }
    function markAsCustom() {
      cancelPresetReveal();
      revealedPresetVerbIds.value = [...challenge.value.verbIds];
      revealedPresetTenseIds.value = [...challenge.value.tenseIds];
      presetTenseRevealPending.value = false;
      prefilledOptionsRevealPending.value = false;
      isPrefilledChallenge.value = false;
      activePresetId.value = void 0;
      clearMessages();
    }
    function goToStep(step) {
      if (isPreparingStep4.value) return;
      if (falcMode.value && step === 4) return;
      showLaunchSummary.value = false;
      if (step === 0) {
        currentStep.value = 0;
        return;
      }
      if (step === 2 && selectedVerbs.value.length === 0) return;
      if ((step === 3 || step === 4) && !isReady.value) return;
      currentStep.value = step;
      if (step === 1 && isPrefilledChallenge.value) {
        cancelPresetReveal();
        revealedPresetVerbIds.value = [];
        nextTick(() => revealIds(challenge.value.verbIds, revealedPresetVerbIds));
      }
      if (step === 2 && isPrefilledChallenge.value) {
        cancelPresetReveal();
        presetTenseRevealPending.value = false;
        revealedPresetTenseIds.value = [];
        nextTick(() => revealIds(challenge.value.tenseIds, revealedPresetTenseIds));
      }
      if (step === 3) void refreshConjugationExample();
    }
    async function startCustomChallenge() {
      restartChallenge();
      goToStep(1);
      await nextTick();
      (void 0).getElementById("verb-search-input")?.focus({ preventScroll: true });
    }
    function applyFalcTenseDefaults() {
      const defaultNames = /* @__PURE__ */ new Set(["présent", "imparfait", "passé composé", "futur", "futur simple"]);
      const indicativeModeIds = new Set(catalogue.value.modes.filter((mode) => mode.name.toLocaleLowerCase("fr") === "indicatif").map((mode) => mode.id));
      challenge.value.tenseIds = catalogue.value.temps.filter((tense) => indicativeModeIds.has(tense.modeId) && defaultNames.has(tense.name.toLocaleLowerCase("fr"))).map((tense) => tense.id);
    }
    function applyFalcExerciseDefaults() {
      challenge.value.exerciseKind = "conjugation";
      challenge.value.voiceMode = "active";
      challenge.value.includeComplements = false;
      challenge.value.complementOptions = [];
    }
    function restartChallenge() {
      cancelPresetReveal();
      clearVerbs();
      clearTenses();
      if (falcMode.value) applyFalcTenseDefaults();
      challenge.value.questionCount = 10;
      challenge.value.exerciseKind = "conjugation";
      challenge.value.pastSimplePronouns = "all";
      challenge.value.inclusivePronouns = false;
      challenge.value.includeOnPronoun = false;
      challenge.value.voiceMode = "active";
      challenge.value.includeComplements = true;
      challenge.value.complementPlacement = "after";
      challenge.value.complementOptions = ["cod-after", "coi-after"];
      if (falcMode.value) applyFalcExerciseDefaults();
      activePresetId.value = void 0;
      sourcePresetId.value = void 0;
      sourcePresetRandomCount.value = null;
      prefilledOptionsRevealPending.value = false;
      isPrefilledChallenge.value = false;
      isPresetVerbEditing.value = false;
      presetExpanded.value = false;
      presetStage.value = "groups";
      challengeCode.value = "";
      codeError.value = "";
      notice.value = "";
      actionError.value = "";
      selectedCoach.value = null;
      questions.value = [];
      printQuestions.value = [];
      shareCode.value = "";
      shareTitle.value = "";
      shareDescription.value = "";
      shareError.value = "";
      savedChallengeTitle.value = "";
      savedChallengeDescription.value = "";
      isExerciseOpen.value = false;
      isPrintOpen.value = false;
      isShareOpen.value = false;
      isCoachPickerOpen.value = false;
      showLaunchSummary.value = false;
      clearMessages();
      goToStep(0);
    }
    function openTourMenu() {
      if (guidedTourDisabled.value || falcMode.value || tourActive.value) return;
      tourWelcomeSource.value = "manual";
      isTourWelcomeOpen.value = true;
    }
    watch(guidedTourRequested, (requested) => {
      if (!requested) return;
      openTourMenu();
      guidedTourRequested.value = false;
    }, { immediate: true });
    watch(homeResetRequested, (requested) => {
      if (!requested) return;
      restartChallenge();
      homeResetRequested.value = false;
    }, { immediate: true });
    watch(newChallengeRequested, (requested) => {
      if (!requested) return;
      newChallengeRequested.value = false;
      void startCustomChallenge();
    }, { immediate: true });
    function shuffledSample(ids, count) {
      const result = [...ids];
      for (let index = result.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
      }
      return result.slice(0, count);
    }
    function selectPreset(preset, randomCount) {
      cancelPresetReveal();
      applySelection({
        verbIds: randomCount ? shuffledSample(preset.verbIds, randomCount) : [...preset.verbIds],
        tenseIds: [...preset.tenseIds],
        questionCount: preset.questionCount
      });
      challenge.value.exerciseKind = preset.exerciseKind;
      challenge.value.identificationSource = preset.identificationSource;
      challenge.value.pastSimplePronouns = preset.pastSimplePronouns;
      challenge.value.inclusivePronouns = preset.inclusivePronouns;
      challenge.value.includeOnPronoun = preset.includeOnPronoun;
      challenge.value.voiceMode = preset.voiceMode;
      challenge.value.includeComplements = preset.includeComplements;
      challenge.value.complementPlacement = preset.complementPlacement;
      challenge.value.complementOptions = preset.complementOptions ?? legacyComplementOptions(preset.includeComplements, preset.complementPlacement);
      activePresetId.value = preset.id;
      sourcePresetId.value = preset.id;
      sourcePresetRandomCount.value = randomCount ?? null;
      savedChallengeTitle.value = "";
      savedChallengeDescription.value = "";
      isPrefilledChallenge.value = true;
      isPresetVerbEditing.value = false;
      revealedPresetVerbIds.value = [];
      revealedPresetTenseIds.value = [];
      presetTenseRevealPending.value = true;
      prefilledOptionsRevealPending.value = true;
      notice.value = "";
      actionError.value = "";
      track("challenge_preset_selected", { preset: preset.id, exerciseKind: preset.exerciseKind });
      goToStep(1);
    }
    async function restoreChallenge() {
      const normalized = normalizeChallengeCode(challengeCode.value);
      if (!/^[A-Z0-9]{2}(?:-[A-Z0-9]{2}){3}$/.test(normalized)) {
        codeError.value = ui("Le code doit ressembler à AB-CD-EF-23.");
        return;
      }
      busyAction.value = "load";
      codeError.value = "";
      actionError.value = "";
      notice.value = "";
      try {
        const restored = await api.loadChallenge(normalized);
        applySharedChallenge(restored);
        savedChallengeTitle.value = restored.title || "";
        savedChallengeDescription.value = restored.description || "";
        prefilledOptionsRevealPending.value = true;
        isPrefilledChallenge.value = true;
        activePresetId.value = void 0;
        sourcePresetId.value = void 0;
        sourcePresetRandomCount.value = null;
        isPresetVerbEditing.value = false;
        challengeCode.value = restored.code;
        notice.value = `Le défi « ${restored.title || restored.code} » est chargé. Tu peux l’utiliser ou le modifier.`;
        goToStep(4);
        logUsage("challenge-load");
      } catch (error) {
        codeError.value = getChallengeErrorMessage(error, ui("Ce code ne correspond à aucun défi."));
      } finally {
        busyAction.value = null;
      }
    }
    function onAddVerb(id) {
      markAsCustom();
      addVerb(id);
    }
    function onRemoveVerb(id) {
      markAsCustom();
      removeVerb(id);
    }
    function onToggleTense(id) {
      markAsCustom();
      toggleTense(id);
    }
    function updateComplementOptions(options) {
      const legacy = legacyComplementConfig(options);
      challenge.value.complementOptions = options;
      challenge.value.includeComplements = legacy.includeComplements;
      challenge.value.complementPlacement = legacy.complementPlacement;
      markAsCustom();
    }
    async function refreshConjugationExample() {
      if (!isReady.value) {
        conjugationInstructionRaw.value = "";
        conjugationQuestionContextRaw.value = "";
        conjugationQuestionRaw.value = "";
        conjugationExampleRaw.value = "";
        conjugationExamplePrefixRaw.value = "";
        conjugationExampleEmphasisRaw.value = "";
        conjugationExampleSuffixRaw.value = "";
        conjugationLiteraryCitationRaw.value = void 0;
        conjugationExampleLoading.value = false;
        return;
      }
      const request = ++conjugationExampleRequest;
      const loadingStartedAt = Date.now();
      conjugationExampleLoading.value = true;
      try {
        const exampleComplementOption = challenge.value.complementOptions.filter((option) => {
          const functionObject = option.slice(0, 3);
          return selectedVerbs.value.some((verb) => {
            const supportsFunction = verb.complementFunctions?.includes(functionObject) || verb.complementExample?.functionObject === functionObject;
            return supportsFunction && (!option.endsWith("-before") || verb.anteposableComplementFunctions?.includes(functionObject) || functionObject === "cod" && Boolean(verb.complementExample?.before));
          });
        }).at(-1);
        const exampleComplementPlacement = exampleComplementOption?.endsWith("-before") ? "before" : "after";
        const needsComplement = challenge.value.exerciseKind === "conjugation" && Boolean(exampleComplementOption);
        const exampleConfig = {
          ...challenge.value,
          questionCount: 50,
          inclusivePronouns: false,
          includeOnPronoun: false,
          voiceMode: challenge.value.voiceMode,
          includeComplements: needsComplement,
          complementPlacement: exampleComplementPlacement,
          complementOptions: exampleComplementOption ? [exampleComplementOption] : []
        };
        const needsAnteposedComplement = challenge.value.exerciseKind === "conjugation" && needsComplement && exampleComplementOption?.endsWith("-before");
        const matchesSelectedComplement = (question) => !needsComplement || question.complementFunction === exampleComplementOption?.slice(0, 3) && (needsAnteposedComplement ? question.complementPosition === "before" && Boolean(question.complement) : question.complementPosition === "after" && Boolean(question.complement));
        const isPreferredExample = (question) => question.pronom === "il" || question.personId === 6;
        const findExample = async (config, attempts = 3, requireSelectedComplement = true) => {
          let fallback;
          for (let attempt = 0; attempt < attempts; attempt += 1) {
            try {
              const generated = await api.generateQuestions(config);
              const candidates = requireSelectedComplement ? generated.filter(matchesSelectedComplement) : generated;
              const found = candidates.find(isPreferredExample);
              if (found) return found;
              fallback ??= candidates[0];
            } catch {
              break;
            }
          }
          return fallback;
        };
        let example = await findExample(exampleConfig);
        const complementVerbIds = selectedVerbs.value.filter((verb) => Boolean(verb.complementExample)).map((verb) => verb.id);
        if (!example && needsComplement && !needsAnteposedComplement && complementVerbIds.length) {
          example = await findExample({
            ...exampleConfig,
            verbIds: complementVerbIds
          }, 4);
        }
        if (!example && needsAnteposedComplement) {
          const fallbackTense = catalogue.value.temps.find((tense) => tense.isCompound && tense.name === "passé composé") ?? catalogue.value.temps.find((tense) => tense.isCompound);
          const anteposableVerbIds = selectedVerbs.value.filter((verb) => Boolean(verb.complementExample?.before)).map((verb) => verb.id);
          if (fallbackTense) {
            example = await findExample({
              ...exampleConfig,
              verbIds: anteposableVerbIds.length ? anteposableVerbIds : exampleConfig.verbIds,
              tenseIds: [fallbackTense.id]
            }, 4);
          }
        }
        if (!example) {
          example = await findExample({
            ...exampleConfig,
            includeComplements: false,
            complementOptions: []
          }, 4, false);
        }
        if (request === conjugationExampleRequest) {
          conjugationInstructionRaw.value = example?.instruction ?? "";
          const subject = example?.pronom ?? "il";
          const modeAndTense = example?.temps && example?.mode ? `${example.temps} (${example.mode})` : "";
          conjugationQuestionContextRaw.value = example ? challenge.value.exerciseKind === "conjugation" ? [subject, example.infinitif, modeAndTense].filter(Boolean).join(" | ") : "" : "";
          const prompt = example?.consigne.split("|")[0]?.trim() ?? "";
          conjugationQuestionRaw.value = prompt === subject ? "" : prompt;
          conjugationExampleRaw.value = example?.reponsesPourCorrige[0] ?? "";
          const expectedParts = expectedAnswerParts(example);
          conjugationExamplePrefixRaw.value = expectedParts.prefix;
          conjugationExampleEmphasisRaw.value = expectedParts.emphasis;
          conjugationExampleSuffixRaw.value = expectedParts.suffix;
          conjugationLiteraryCitationRaw.value = example?.literaryCitation;
        }
      } catch {
        if (request === conjugationExampleRequest) {
          conjugationInstructionRaw.value = "";
          conjugationQuestionContextRaw.value = "";
          conjugationQuestionRaw.value = "";
          conjugationExampleRaw.value = "";
          conjugationExamplePrefixRaw.value = "";
          conjugationExampleEmphasisRaw.value = "";
          conjugationExampleSuffixRaw.value = "";
          conjugationLiteraryCitationRaw.value = void 0;
        }
      } finally {
        const remainingSpinnerTime = 1e3 - (Date.now() - loadingStartedAt);
        if (remainingSpinnerTime > 0) {
          await new Promise((resolve) => setTimeout(resolve, remainingSpinnerTime));
        }
        if (request === conjugationExampleRequest) conjugationExampleLoading.value = false;
      }
    }
    watch(
      [
        () => challenge.value.verbIds.join(","),
        () => challenge.value.tenseIds.join(","),
        () => challenge.value.includeComplements,
        () => challenge.value.complementPlacement,
        () => challenge.value.complementOptions.join(","),
        () => challenge.value.exerciseKind,
        () => challenge.value.identificationSource,
        () => challenge.value.inclusivePronouns,
        () => challenge.value.includeOnPronoun,
        () => challenge.value.voiceMode
      ],
      () => {
        if (currentStep.value === 3) void refreshConjugationExample();
      }
    );
    watch(currentStep, async (step) => {
      return;
    });
    function beginExerciseTracking(presentation) {
      if (tourActive.value) {
        exerciseTracking.value = void 0;
        return;
      }
      const preset = sourcePreset.value;
      exerciseTracking.value = createLearnerTrackingContext({
        challengeLabel: savedChallengeTitle.value || (preset ? challengePresetTrackingTitle(preset) : "") || (challengeCode.value ? `Défi ${challengeCode.value}` : "Défi personnalisé"),
        presentation,
        challenge: {
          description: savedChallengeDescription.value || (preset ? challengePresetTrackingDescription(sourcePresetRandomCount.value) : void 0),
          verbIds: [...challenge.value.verbIds],
          tenseIds: [...challenge.value.tenseIds],
          questionCount: challenge.value.questionCount,
          exerciseKind: challenge.value.exerciseKind,
          identificationSource: challenge.value.identificationSource,
          pastSimplePronouns: challenge.value.pastSimplePronouns,
          inclusivePronouns: challenge.value.inclusivePronouns,
          includeOnPronoun: challenge.value.includeOnPronoun,
          voiceMode: challenge.value.voiceMode,
          includeComplements: challenge.value.includeComplements,
          complementPlacement: challenge.value.complementPlacement,
          complementOptions: [...challenge.value.complementOptions]
        }
      });
    }
    async function prepareExercise(mode) {
      if (!isReady.value) return;
      if (falcMode.value) {
        mode = "classic";
        applyFalcExerciseDefaults();
      }
      if (mode === "chat") {
        track("feature_selected", exerciseUsageMetadata("chat"));
        busyAction.value = "exercise";
        clearMessages();
        try {
          await loadCoachPicker();
          void loadChatExercise();
          isCoachPickerOpen.value = true;
        } catch (error) {
          track("feature_failed", exerciseUsageMetadata("chat"));
          actionError.value = getChallengeErrorMessage(error, ui("Impossible de préparer le questionnaire."));
        } finally {
          busyAction.value = null;
        }
        return;
      }
      track("feature_selected", exerciseUsageMetadata("classic"));
      busyAction.value = "exercise";
      clearMessages();
      try {
        const [generated] = await Promise.all([
          api.generateQuestions(challenge.value),
          loadClassicExercise()
        ]);
        questions.value = generated;
        if (!questions.value.length) throw new Error(ui("Aucune question ne correspond à cette sélection."));
        exercisePresentation.value = "classic";
        beginExerciseTracking("classic");
        isExerciseOpen.value = true;
      } catch (error) {
        track("feature_failed", exerciseUsageMetadata("classic"));
        actionError.value = getChallengeErrorMessage(error, ui("Impossible de préparer le questionnaire."));
      } finally {
        busyAction.value = null;
      }
    }
    watch(falcMode, (enabled) => {
      falcHomePanel.value = null;
      if (!enabled) return;
      isTourWelcomeOpen.value = false;
      if (tourActive.value) ;
      isCoachPickerOpen.value = false;
      isPrintOpen.value = false;
      isShareOpen.value = false;
      if (exercisePresentation.value === "chat") isExerciseOpen.value = false;
      exercisePresentation.value = "classic";
      if (currentStep.value === 4) currentStep.value = 3;
      applyFalcExerciseDefaults();
      if (currentStep.value <= 2) applyFalcTenseDefaults();
    });
    function closeClassicExercise() {
      if (falcMode.value) {
        restartChallenge();
        void navigateTo(localePath("/"));
        return;
      }
      isExerciseOpen.value = false;
    }
    async function launchWithCoach(coach) {
      if (!isReady.value || falcMode.value) return;
      selectedCoach.value = coach;
      track("coach_selected", { coach: coach.id });
      isCoachPickerOpen.value = false;
      busyAction.value = "exercise";
      clearMessages();
      try {
        const [generated] = await Promise.all([
          api.generateQuestions(challenge.value),
          loadChatExercise()
        ]);
        questions.value = generated;
        if (!questions.value.length) throw new Error(ui("Aucune question ne correspond à cette sélection."));
        exercisePresentation.value = "chat";
        beginExerciseTracking("chat");
        isExerciseOpen.value = true;
      } catch (error) {
        track("feature_failed", exerciseUsageMetadata("chat"));
        actionError.value = getChallengeErrorMessage(error, ui("Impossible de préparer le questionnaire."));
      } finally {
        busyAction.value = null;
      }
    }
    async function regenerateChatQuestions() {
      const generated = await api.generateQuestions(challenge.value);
      if (!generated.length) throw new Error(ui("Aucune nouvelle question ne correspond à cette sélection."));
      questions.value = generated;
    }
    async function preparePrint() {
      if (!isReady.value || falcMode.value) return;
      track("feature_selected", exerciseUsageMetadata("print"));
      busyAction.value = "print";
      clearMessages();
      try {
        printQuestions.value = await api.generateQuestions(challenge.value);
        if (!printQuestions.value.length) throw new Error(ui("Aucune question ne correspond à cette sélection."));
        isPrintOpen.value = true;
        track("print_opened", exerciseUsageMetadata("print"));
      } catch (error) {
        actionError.value = getChallengeErrorMessage(error, ui("Impossible de préparer la fiche à imprimer."));
      } finally {
        busyAction.value = null;
      }
    }
    function saveChallenge() {
      if (!isReady.value || falcMode.value) return;
      shareCode.value = "";
      shareError.value = "";
      shareTitle.value = activePreset.value?.label || savedChallengeTitle.value || ui("Défi de conjugaison");
      shareDescription.value = savedChallengeDescription.value;
      isShareOpen.value = true;
    }
    async function createSharedChallenge(title, description) {
      busyAction.value = "save";
      shareError.value = "";
      clearMessages();
      try {
        const result = await api.saveChallenge(challenge.value, title, description);
        shareCode.value = result.code;
        shareTitle.value = title;
        shareDescription.value = description;
        savedChallengeTitle.value = title;
        savedChallengeDescription.value = description;
        logUsage("challenge-save");
      } catch (error) {
        shareError.value = getChallengeErrorMessage(error, ui("Impossible de sauvegarder ce défi."));
      } finally {
        busyAction.value = null;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "wizard-entry-page" }, _attrs))} data-v-57e806f1><div class="challenge-page wizard-page" data-v-57e806f1><header class="wizard-hero" data-v-57e806f1>`);
      if (unref(currentStep) === 0 && !unref(falcMode)) {
        _push(`<p class="wizard-hero__brand" data-v-57e806f1>${ssrInterpolate(unref(heroTitle))}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(currentStep) === 0 && !unref(falcMode)) {
        _push(`<h1 class="wizard-hero__subtitle" data-v-57e806f1>${ssrInterpolate(props.homeHeading || unref(ui)("Exercices de conjugaison française, gratuits et sans publicité"))}</h1>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(currentStep) !== 0 && !unref(falcMode)) {
        _push(`<h1 class="${ssrRenderClass({ "wizard-hero__preset": unref(isPrefilledChallenge) })}" data-v-57e806f1>${ssrInterpolate(unref(heroTitle))}</h1>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(currentStep) === 0 && !unref(falcMode) && !unref(guidedTourDisabled)) {
        _push(`<button class="tour-entry-button" type="button" data-v-57e806f1><span aria-hidden="true" data-v-57e806f1>?</span>${ssrInterpolate(unref(tourCopy).discover)}</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</header><main class="wizard-shell" data-v-57e806f1>`);
      if (unref(catalogueStatus) === "loading") {
        _push(`<div class="page-state" role="status" data-v-57e806f1><span class="loader" aria-hidden="true" data-v-57e806f1></span> ${ssrInterpolate(unref(ui)("Chargement du catalogue de conjugaison…"))}</div>`);
      } else if (unref(catalogueStatus) === "error") {
        _push(`<div class="page-state page-state--error" role="alert" data-v-57e806f1><strong data-v-57e806f1>${ssrInterpolate(unref(ui)("Le catalogue n’a pas pu être chargé."))}</strong><span data-v-57e806f1>${ssrInterpolate(unref(catalogueError))}</span><button class="primary-button" type="button" data-v-57e806f1>${ssrInterpolate(unref(ui)("Réessayer"))}</button></div>`);
      } else {
        _push(`<!--[-->`);
        if (unref(actionError)) {
          _push(`<p class="workspace-message workspace-message--error" role="alert" data-v-57e806f1>${ssrInterpolate(unref(actionError))}</p>`);
        } else if (unref(notice)) {
          _push(`<p class="workspace-message workspace-message--success" aria-live="polite" data-v-57e806f1>${ssrInterpolate(unref(notice))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<section class="${ssrRenderClass([{ "wizard-panel--autocomplete-open": unref(currentStep) === 1 }, "wizard-panel"])}" tabindex="-1" aria-labelledby="wizard-title" data-v-57e806f1><h2 id="wizard-title" class="sr-only" data-v-57e806f1>${ssrInterpolate(unref(ui)("Composer un défi personnalisé"))}</h2>`);
        if (unref(currentStep) !== 0) {
          _push(`<nav class="${ssrRenderClass([{ "wizard-steps--falc": unref(falcMode) }, "wizard-steps"])}" data-tour="wizard-steps"${ssrRenderAttr("aria-label", unref(ui)("Étapes de création du défi"))} data-v-57e806f1><button data-tour-wizard-step="1" class="${ssrRenderClass([{
            "is-active": unref(currentStep) === 1,
            "is-complete": unref(stepStatus).verbs > 0,
            "tour-secondary-focus": unref(tourSecondaryWizardStep) === 1
          }, "wizard-step-tab wizard-step-tab--verbs"])}" type="button" data-v-57e806f1><span data-v-57e806f1>1</span><span data-v-57e806f1><strong data-v-57e806f1>${ssrInterpolate(unref(ui)("Verbes"))}</strong>`);
          if (!unref(falcMode)) {
            _push(`<small data-v-57e806f1>${ssrInterpolate(unref(stepStatus).verbs ? unref(ui)(unref(stepStatus).verbs > 1 ? "{count} choisis" : "{count} choisi", { count: unref(stepStatus).verbs }) : unref(ui)("À choisir"))}</small>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</span></button><span class="wizard-steps__line" aria-hidden="true" data-v-57e806f1></span><button data-tour-wizard-step="2" class="${ssrRenderClass([{
            "is-active": unref(currentStep) === 2,
            "is-complete": unref(stepStatus).tenses > 0,
            "tour-secondary-focus": unref(tourSecondaryWizardStep) === 2
          }, "wizard-step-tab wizard-step-tab--tenses"])}" type="button"${ssrIncludeBooleanAttr(unref(stepStatus).verbs === 0) ? " disabled" : ""} data-v-57e806f1><span data-v-57e806f1>2</span><span data-v-57e806f1><strong data-v-57e806f1><span class="mobile-label-hidden" data-v-57e806f1>${ssrInterpolate(unref(falcMode) ? unref(ui)("Temps") : unref(ui)("Modes et temps"))}</span><span class="mobile-label-only" data-v-57e806f1>${ssrInterpolate(unref(ui)("Temps"))}</span></strong>`);
          if (!unref(falcMode)) {
            _push(`<small data-v-57e806f1>${ssrInterpolate(unref(stepStatus).tenses ? unref(ui)(unref(stepStatus).tenses > 1 ? "{count} choisis" : "{count} choisi", { count: unref(stepStatus).tenses }) : unref(ui)("À choisir"))}</small>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</span></button><span class="wizard-steps__line" aria-hidden="true" data-v-57e806f1></span><button data-tour-wizard-step="3" class="${ssrRenderClass({
            "is-active": unref(currentStep) === 3,
            "is-complete": unref(currentStep) === 4,
            "tour-secondary-focus": unref(tourSecondaryWizardStep) === 3
          })}" type="button"${ssrIncludeBooleanAttr(!unref(isReady)) ? " disabled" : ""} data-v-57e806f1><span data-v-57e806f1>3</span><span data-v-57e806f1><strong data-v-57e806f1>${ssrInterpolate(unref(ui)("Options"))}</strong>`);
          if (!unref(falcMode)) {
            _push(`<small data-v-57e806f1>${ssrInterpolate(unref(ui)("Finaliser le défi"))}</small>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</span></button>`);
          if (!unref(falcMode)) {
            _push(`<span class="wizard-steps__line" aria-hidden="true" data-v-57e806f1></span>`);
          } else {
            _push(`<!---->`);
          }
          if (!unref(falcMode)) {
            _push(`<button data-tour-wizard-step="4" class="${ssrRenderClass({
              "is-active": unref(currentStep) === 4,
              "tour-secondary-focus": unref(tourSecondaryWizardStep) === 4
            })}" type="button"${ssrIncludeBooleanAttr(!unref(isReady) || unref(isPreparingStep4)) ? " disabled" : ""} data-v-57e806f1><span data-v-57e806f1>4</span><span data-v-57e806f1><strong data-v-57e806f1>${ssrInterpolate(unref(ui)("Créer"))}</strong><small data-v-57e806f1>${ssrInterpolate(unref(ui)("Utiliser le défi"))}</small></span></button>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(tourSecondaryWizardStep) !== null) {
            _push(`<span class="tour-wizard-step-indicator" style="${ssrRenderStyle(unref(tourWizardIndicatorStyle))}" aria-hidden="true" data-v-57e806f1></span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</nav>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="${ssrRenderClass([{ "wizard-content--home": unref(currentStep) === 0 }, "wizard-content"])}" data-v-57e806f1>`);
        if (unref(isPreparingStep4)) {
          _push(`<div class="wizard-step-preparing" role="status" aria-live="polite" data-v-57e806f1><span class="loader wizard-step-preparing__spinner" aria-hidden="true" data-v-57e806f1></span><strong data-v-57e806f1>${ssrInterpolate(unref(ui)("Préparation de ton défi…"))}</strong></div>`);
        } else if (unref(currentStep) === 0) {
          _push(`<div class="${ssrRenderClass([{ "wizard-home--falc": unref(falcMode) }, "wizard-home"])}" data-tour="home" data-v-57e806f1>`);
          if (unref(falcMode)) {
            _push(`<!--[-->`);
            if (unref(falcHomePanel) === null) {
              _push(`<div class="falc-home-actions" style="${ssrRenderStyle({ "display": "flex", "flex-direction": "column" })}" data-v-57e806f1><button class="falc-home-action" type="button" data-v-57e806f1>${ssrInterpolate(unref(ui)("J’ai un code"))}</button><button class="falc-home-action" type="button" data-v-57e806f1>${ssrInterpolate(unref(ui)("Choisir un défi"))}</button><button class="falc-home-action falc-home-action--primary" type="button" data-v-57e806f1>${ssrInterpolate(unref(ui)("Créer mon exercice"))}</button></div>`);
            } else if (unref(falcHomePanel) === "code") {
              _push(`<div class="falc-home-panel code-loader" role="search"${ssrRenderAttr("aria-label", unref(ui)("Charger un défi avec son code"))} data-v-57e806f1><button class="falc-panel-back" type="button"${ssrRenderAttr("aria-label", unref(ui)("Retour"))} data-v-57e806f1>←</button><label id="wizard-falc-code-label" for="wizard-falc-code" data-v-57e806f1>${ssrInterpolate(unref(ui)("Écris le code du défi"))}</label><div class="code-loader__control" data-v-57e806f1><div id="wizard-falc-code" class="code-loader__code-entry" role="textbox" contenteditable="plaintext-only" aria-labelledby="wizard-falc-code-label" data-placeholder="AB-CD-EF-23"${ssrRenderAttr("aria-invalid", Boolean(unref(codeError)))} data-v-57e806f1></div><button class="primary-button" type="button"${ssrIncludeBooleanAttr(unref(busyAction) === "load") ? " disabled" : ""} data-v-57e806f1>${ssrInterpolate(unref(busyAction) === "load" ? unref(ui)("Chargement…") : unref(ui)("Ouvrir le défi"))}</button></div>`);
              if (unref(codeError)) {
                _push(`<p class="code-loader__error" role="alert" data-v-57e806f1>${ssrInterpolate(unref(codeError))}</p>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div>`);
            } else {
              _push(`<div class="falc-home-panel" data-v-57e806f1><button class="falc-panel-back" type="button"${ssrRenderAttr("aria-label", unref(ui)("Retour"))} data-v-57e806f1>←</button><h2 data-v-57e806f1>${ssrInterpolate(unref(ui)("Choisis un défi"))}</h2>`);
              _push(ssrRenderComponent(PresetPicker, {
                compact: "",
                presets: unref(catalogue).presets,
                verbs: unref(catalogue).verbes,
                modes: unref(catalogue).modes,
                tenses: unref(catalogue).temps,
                "active-preset-id": unref(activePresetId),
                onSelect: selectPreset,
                onStageChange: ($event) => presetStage.value = $event
              }, null, _parent));
              _push(`</div>`);
            }
            _push(`<!--]-->`);
          } else {
            _push(`<!--[--><div data-tour="code-loader" class="${ssrRenderClass([{ "is-arrival-highlighted": unref(highlightChallengeLoader) }, "code-loader"])}" role="search"${ssrRenderAttr("aria-label", unref(ui)("Charger un défi avec son code"))} data-v-57e806f1><div class="code-loader__heading" data-v-57e806f1><span class="code-loader__icon" aria-hidden="true" data-v-57e806f1><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-57e806f1><path d="M12 3v12" data-v-57e806f1></path><path d="m7 10 5 5 5-5" data-v-57e806f1></path><path d="M5 21h14" data-v-57e806f1></path></svg></span><div data-v-57e806f1><strong data-v-57e806f1>${ssrInterpolate(unref(ui)("Tu as reçu un défi ?"))}</strong><small data-v-57e806f1>${ssrInterpolate(unref(ui)("Colle son code pour le reprendre immédiatement."))}</small></div></div><div class="code-loader__control" data-v-57e806f1><span id="wizard-challenge-code-label" class="sr-only" data-v-57e806f1>${ssrInterpolate(unref(ui)("Code du défi"))}</span><div id="wizard-challenge-code" class="code-loader__code-entry" role="textbox" contenteditable="plaintext-only" aria-labelledby="wizard-challenge-code-label" data-placeholder="AB-CD-EF-23"${ssrRenderAttr("aria-invalid", Boolean(unref(codeError)))} data-v-57e806f1></div><button class="primary-button wizard-home__outline-action" type="button"${ssrIncludeBooleanAttr(unref(catalogueStatus) !== "success" || unref(busyAction) === "load") ? " disabled" : ""} data-v-57e806f1>${ssrInterpolate(unref(busyAction) === "load" ? unref(ui)("Chargement…") : unref(ui)("Charger"))}</button></div>`);
            if (unref(codeError)) {
              _push(`<p class="code-loader__error" role="alert" data-v-57e806f1>${ssrInterpolate(unref(codeError))}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="wizard-home__choices" data-v-57e806f1>`);
            if (!unref(presetExpanded)) {
              _push(`<button class="wizard-home__choice wizard-home__choice--preset is-collapsed" data-tour="presets" type="button" data-v-57e806f1><span class="wizard-home__choice-icon" aria-hidden="true" data-v-57e806f1>★</span><div data-v-57e806f1><h2 data-v-57e806f1>${ssrInterpolate(unref(ui)("Tu veux travailler un de nos défis ?"))}</h2></div><span class="secondary-button wizard-home__outline-action" aria-hidden="true" data-v-57e806f1>${ssrInterpolate(unref(ui)("Découvrir"))}</span></button>`);
            } else {
              _push(`<article data-tour="presets" class="${ssrRenderClass([{ "is-preset-selection": unref(presetStage) === "presets" }, "wizard-home__choice wizard-home__choice--preset"])}" data-v-57e806f1><span class="wizard-home__choice-icon" aria-hidden="true" data-v-57e806f1>★</span><div data-v-57e806f1><h2 data-v-57e806f1>${ssrInterpolate(unref(ui)("Tu veux travailler un de nos défis ?"))}</h2></div>`);
              _push(ssrRenderComponent(PresetPicker, {
                class: "wizard-home__inline-presets",
                compact: "",
                presets: unref(catalogue).presets,
                verbs: unref(catalogue).verbes,
                modes: unref(catalogue).modes,
                tenses: unref(catalogue).temps,
                "active-preset-id": unref(activePresetId),
                onSelect: selectPreset,
                onStageChange: ($event) => presetStage.value = $event
              }, null, _parent));
              _push(`</article>`);
            }
            _push(`<article class="wizard-home__choice wizard-home__choice--custom" data-tour="build-custom" data-v-57e806f1><span class="wizard-home__choice-icon" aria-hidden="true" data-v-57e806f1>✎</span><div data-v-57e806f1><h2 data-v-57e806f1>${ssrInterpolate(unref(ui)("Tu veux construire ton propre défi ?"))}</h2><p data-v-57e806f1>${ssrInterpolate(unref(ui)("Choisis les verbes, les modes, les temps et les options."))}</p></div><button class="${ssrRenderClass([{ "wizard-next-pulse": !unref(highlightChallengeLoader) }, "primary-button"])}" type="button" data-v-57e806f1>${ssrInterpolate(unref(ui)("Construire un nouveau défi →"))}</button></article></div><div class="wizard-home__separator" aria-hidden="true" data-v-57e806f1></div><section class="wizard-home__seo-intro" aria-labelledby="home-features-title" data-v-57e806f1><header data-v-57e806f1><p class="wizard-home__seo-eyebrow" data-v-57e806f1>${ssrInterpolate(unref(ui)("Tout pour progresser"))}</p><h2 id="home-features-title" data-v-57e806f1>${ssrInterpolate(unref(ui)("Des exercices de conjugaison adaptés à tes besoins"))}</h2><p data-v-57e806f1>${ssrInterpolate(unref(ui)("TATITOTU propose des exercices de conjugaison française entièrement gratuits, interactifs et personnalisables, sans publicité."))}</p></header><div class="wizard-home__feature-grid" data-v-57e806f1><article data-v-57e806f1><h3 data-v-57e806f1>${ssrInterpolate(unref(ui)("Pour les élèves"))}</h3><p data-v-57e806f1>${ssrInterpolate(unref(ui)("Choisis les verbes, les modes et les temps que tu souhaites travailler, personnalise les questions, puis commence ton entraînement."))}</p><p data-v-57e806f1>${ssrInterpolate(unref(ui)("Les exercices peuvent être réalisés dans un format classique ou sous la forme d’un dialogue avec un coach virtuel qui t’aide pour chaque question."))}</p></article><article data-v-57e806f1><h3 data-v-57e806f1>${ssrInterpolate(unref(ui)("Pour les enseignants"))}</h3><p data-v-57e806f1>${ssrInterpolate(unref(ui)("Tes propres exercices peuvent être partagés avec tes élèves."))}</p><p data-v-57e806f1>${ssrInterpolate(unref(ui)("Les élèves peuvent aussi te partager leurs bilans pour un meilleur suivi."))}</p><p data-v-57e806f1>${ssrInterpolate(unref(ui)("Tu peux aussi imprimer l’exercice en PDF ou DOCX avec corrigé."))}</p></article><article data-v-57e806f1><h3 data-v-57e806f1>${ssrInterpolate(unref(ui)("Des ressources utiles"))}</h3><p data-v-57e806f1>${ssrInterpolate(unref(ui)("Pour apprendre et réviser, le site propose aussi des explications sur les modes et les temps."))}</p><p data-v-57e806f1>${ssrInterpolate(unref(ui)("Tu peux également consulter la conjugaison complète des verbes français, les règles d’accord du participe passé et les principales difficultés à éviter."))}</p></article></div></section><!--]-->`);
          }
          _push(`</div>`);
        } else if (unref(currentStep) === 1) {
          _push(`<div class="wizard-step wizard-step--selection" aria-labelledby="verbs-title" data-v-57e806f1><div class="wizard-step__actions wizard-step__actions--split" data-v-57e806f1><button class="secondary-button" type="button"${ssrRenderAttr("aria-label", unref(ui)("Étape précédente"))} data-v-57e806f1>${ssrInterpolate(unref(falcMode) ? "←" : unref(ui)("← Nouveau défi"))}</button><div class="wizard-step__controls" data-v-57e806f1><button class="primary-button wizard-step__cta wizard-next-pulse" type="button"${ssrRenderAttr("aria-label", unref(ui)("Étape suivante"))}${ssrIncludeBooleanAttr(!unref(selectedVerbs).length) ? " disabled" : ""} data-v-57e806f1>${ssrInterpolate(unref(falcMode) ? "→" : unref(ui)("Choisir les temps →"))}</button></div></div>`);
          if (unref(activePreset) && !unref(isPresetVerbEditing)) {
            _push(`<div class="wizard-step__intro wizard-step__intro--selection" data-v-57e806f1><h2 id="verbs-title" data-v-57e806f1>${ssrInterpolate(unref(ui)("Verbes du défi"))}</h2></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(activePreset) && !unref(isPresetVerbEditing)) {
            _push(`<section class="preset-verb-overview" data-v-57e806f1><header data-v-57e806f1><div data-v-57e806f1><p data-v-57e806f1>${ssrInterpolate(unref(selectedVerbs).length)} ${ssrInterpolate(unref(selectedVerbs).length === 1 ? unref(ui)("verbe") : unref(ui)("verbes"))} ${ssrInterpolate(unref(selectedVerbs).length === 1 ? unref(ui)("sélectionné") : unref(ui)("sélectionnés"))}</p><button class="preset-verb-overview__edit" type="button" data-v-57e806f1>${ssrInterpolate(unref(ui)("Modifier la liste"))}</button></div></header><ul${ssrRenderAttrs({ name: "preset-verb" })} data-v-57e806f1>`);
            ssrRenderList(unref(displayedSelectedVerbs), (verb) => {
              _push(`<li data-v-57e806f1>${ssrInterpolate(verb.infinitif)}</li>`);
            });
            _push(`</ul></section>`);
          } else {
            _push(`<!--[--><div class="wizard-step__intro wizard-step__intro--selection" data-v-57e806f1><h2 id="verbs-title" data-v-57e806f1>${ssrInterpolate(unref(isPrefilledChallenge) ? unref(ui)("Verbes du défi") : unref(ui)("Choisis les verbes"))}</h2></div>`);
            _push(ssrRenderComponent(VerbPicker, {
              "data-tour": "verbs",
              verbs: unref(catalogue).verbes,
              "selected-ids": unref(displayedVerbIds),
              "falc-mode": unref(falcMode),
              onAdd: onAddVerb,
              onRemove: onRemoveVerb,
              onClear: ($event) => {
                markAsCustom();
                unref(clearVerbs)();
              }
            }, null, _parent));
            _push(`<!--]-->`);
          }
          _push(`<div class="wizard-step__bottom-actions" data-v-57e806f1><button class="primary-button wizard-step__cta wizard-next-pulse" type="button"${ssrRenderAttr("aria-label", unref(ui)("Étape suivante"))}${ssrIncludeBooleanAttr(!unref(selectedVerbs).length) ? " disabled" : ""} data-v-57e806f1>${ssrInterpolate(unref(falcMode) ? "→" : unref(ui)("Choisir les temps →"))}</button></div></div>`);
        } else if (unref(currentStep) === 2) {
          _push(`<div class="wizard-step wizard-step--selection" aria-labelledby="tenses-title" data-v-57e806f1><div class="wizard-step__actions wizard-step__actions--split" data-v-57e806f1><button class="secondary-button" type="button"${ssrRenderAttr("aria-label", unref(ui)("Étape précédente"))} data-v-57e806f1>${ssrInterpolate(unref(falcMode) ? "←" : unref(ui)("← Verbes"))}</button><div class="wizard-step__controls" data-v-57e806f1><button class="primary-button wizard-step__cta wizard-next-pulse" type="button"${ssrRenderAttr("aria-label", unref(ui)("Étape suivante"))}${ssrIncludeBooleanAttr(!unref(selectedTenses).length) ? " disabled" : ""} data-v-57e806f1>${ssrInterpolate(unref(falcMode) ? "→" : unref(ui)("Choisir les options →"))}</button></div></div><div class="wizard-step__intro wizard-step__intro--selection" data-v-57e806f1><h2 data-v-57e806f1>${ssrInterpolate(unref(falcMode) ? unref(ui)("Choisis les temps") : unref(isPrefilledChallenge) ? unref(ui)("Modes et temps") : unref(ui)("Choisis les modes et les temps"))}</h2></div>`);
          _push(ssrRenderComponent(TensePicker, {
            "data-tour": "tenses",
            modes: unref(catalogue).modes,
            tenses: unref(catalogue).temps,
            verbs: unref(selectedVerbs),
            "selected-ids": unref(displayedTenseIds),
            "past-simple-pronouns": unref(challenge).pastSimplePronouns,
            "falc-mode": unref(falcMode),
            onToggle: onToggleTense,
            onSelectAll: ($event) => {
              markAsCustom();
              unref(selectAllTenses)();
            },
            onClear: ($event) => {
              markAsCustom();
              unref(clearTenses)();
              unref(challenge).pastSimplePronouns = "all";
            },
            onUpdatePastSimplePronouns: ($event) => {
              unref(challenge).pastSimplePronouns = $event;
              markAsCustom();
            }
          }, null, _parent));
          _push(`<div class="wizard-step__bottom-actions" data-v-57e806f1><button class="primary-button wizard-step__cta wizard-next-pulse" type="button"${ssrRenderAttr("aria-label", unref(ui)("Étape suivante"))}${ssrIncludeBooleanAttr(!unref(selectedTenses).length) ? " disabled" : ""} data-v-57e806f1>${ssrInterpolate(unref(falcMode) ? "→" : unref(ui)("Choisir les options →"))}</button></div></div>`);
        } else if (unref(currentStep) === 3) {
          _push(`<div class="wizard-step wizard-review" data-v-57e806f1><div class="wizard-step__actions wizard-step__actions--split" data-v-57e806f1><button class="secondary-button" type="button"${ssrRenderAttr("aria-label", unref(ui)("Étape précédente"))} data-v-57e806f1> ← `);
          if (!unref(falcMode)) {
            _push(`<!--[--><span class="mobile-label-hidden" data-v-57e806f1>${ssrInterpolate(unref(ui)("Modes et temps"))}</span><span class="mobile-label-only" data-v-57e806f1>${ssrInterpolate(unref(ui)("Temps"))}</span><!--]-->`);
          } else {
            _push(`<!---->`);
          }
          _push(`</button><div class="wizard-step__controls" data-v-57e806f1><button class="primary-button wizard-step__cta wizard-step__cta--launch wizard-next-pulse" type="button" data-v-57e806f1>${ssrInterpolate(unref(falcMode) ? unref(ui)("Commencer") : unref(ui)("Créer le défi"))}</button></div></div>`);
          if (!unref(falcMode)) {
            _push(`<div class="wizard-step__intro wizard-step__intro--selection" data-v-57e806f1><h2 data-v-57e806f1>${ssrInterpolate(unref(ui)("Options du défi"))}</h2></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(ssrRenderComponent(ChallengeOptions, {
            "data-tour": "options",
            "question-count": unref(challenge).questionCount,
            "exercise-kind": unref(challenge).exerciseKind,
            "identification-source": unref(challenge).identificationSource,
            "inclusive-pronouns": unref(challenge).inclusivePronouns,
            "include-on-pronoun": unref(challenge).includeOnPronoun,
            "voice-mode": unref(challenge).voiceMode,
            "complement-options": unref(challenge).complementOptions,
            "complement-verbs": unref(selectedVerbs),
            "conjugation-instruction": unref(conjugationInstruction),
            "conjugation-question-context": unref(conjugationQuestionContext),
            "conjugation-question": unref(conjugationQuestion),
            "conjugation-example": unref(conjugationExample),
            "conjugation-example-prefix": unref(conjugationExamplePrefix),
            "conjugation-example-emphasis": unref(conjugationExampleEmphasis),
            "conjugation-example-suffix": unref(conjugationExampleSuffix),
            "conjugation-literary-citation": unref(conjugationLiteraryCitationRaw),
            "conjugation-example-loading": unref(conjugationExampleLoading),
            "reveal-prefilled-options": unref(prefilledOptionsRevealPending),
            "grid-layout": !unref(falcMode),
            "falc-mode": unref(falcMode),
            "id-prefix": "wizard-step-options",
            onPrefilledOptionsRevealStart: ($event) => prefilledOptionsRevealPending.value = false,
            onUpdateQuestionCount: ($event) => {
              unref(challenge).questionCount = $event;
              markAsCustom();
            },
            onUpdateExerciseKind: ($event) => {
              unref(challenge).exerciseKind = $event;
              markAsCustom();
            },
            onUpdateIdentificationSource: ($event) => {
              unref(challenge).identificationSource = $event;
              markAsCustom();
            },
            onUpdateInclusivePronouns: ($event) => {
              unref(challenge).inclusivePronouns = $event;
              markAsCustom();
            },
            onUpdateIncludeOnPronoun: ($event) => {
              unref(challenge).includeOnPronoun = $event;
              markAsCustom();
            },
            onUpdateVoiceMode: ($event) => {
              unref(challenge).voiceMode = $event;
              markAsCustom();
            },
            onUpdateComplementOptions: updateComplementOptions
          }, null, _parent));
          if (!unref(falcMode)) {
            _push(`<div class="wizard-step__bottom-actions" data-v-57e806f1><button class="primary-button wizard-step__cta wizard-step__cta--launch wizard-next-pulse" type="button" data-v-57e806f1>${ssrInterpolate(unref(falcMode) ? unref(ui)("Commencer") : unref(ui)("Créer le défi"))}</button></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<div class="wizard-step wizard-launch-step" data-v-57e806f1><div class="wizard-step__actions wizard-step__actions--split" data-v-57e806f1><button class="secondary-button" type="button" data-v-57e806f1>${ssrInterpolate(unref(ui)("← Options"))}</button></div>`);
          if (unref(showLaunchSummary) || unref(showSavedChallengeSummary)) {
            _push(`<section class="launch-summary"${ssrRenderAttr("aria-labelledby", unref(activePreset) || unref(savedChallengeTitle) ? "launch-challenge-title" : void 0)} data-v-57e806f1><div class="launch-summary__heading" data-v-57e806f1><div data-v-57e806f1>`);
            if (unref(activePreset)) {
              _push(`<p class="builder-card__eyebrow" data-v-57e806f1>${ssrInterpolate(unref(activePresetGroupLabel))}</p>`);
            } else {
              _push(`<!---->`);
            }
            if (unref(activePreset) || unref(savedChallengeTitle)) {
              _push(`<h2 id="launch-challenge-title" data-v-57e806f1>${ssrInterpolate(unref(activePreset)?.label || unref(savedChallengeTitle))}</h2>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="launch-summary__counts" data-v-57e806f1><span data-v-57e806f1>${ssrInterpolate(unref(ui)(unref(selectedVerbs).length > 1 ? "{count} verbes" : "{count} verbe", { count: unref(selectedVerbs).length }))}</span><span data-v-57e806f1>${ssrInterpolate(unref(ui)("{count} temps", { count: unref(selectedTenses).length }))}</span></div></div>`);
            if (unref(activePreset)?.description || unref(savedChallengeDescription)) {
              _push(`<p class="launch-summary__description" data-v-57e806f1>${ssrInterpolate(unref(activePreset)?.description || unref(savedChallengeDescription))}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</section>`);
          } else {
            _push(`<!---->`);
          }
          _push(ssrRenderComponent(ChallengeActions, {
            "data-tour": "actions",
            ready: unref(isReady),
            "busy-action": unref(busyAction),
            onExercise: prepareExercise,
            onPrint: preparePrint,
            onSave: saveChallenge
          }, null, _parent));
          _push(`</div>`);
        }
        _push(`</div></section><!--]-->`);
      }
      _push(`</main>`);
      if (unref(isExerciseOpen) && unref(exercisePresentation) === "classic") {
        _push(ssrRenderComponent(unref(ClassicExercise), {
          ref: "classic-exercise",
          questions: unref(questions),
          "exercise-kind": unref(challenge).exerciseKind,
          "identification-tenses": unref(identificationTenses),
          "tracking-context": unref(exerciseTracking),
          "analytics-metadata": exerciseUsageMetadata("classic"),
          onClose: closeClassicExercise
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(isExerciseOpen) && unref(exercisePresentation) === "chat" && unref(selectedCoach)) {
        _push(ssrRenderComponent(unref(ChatExercise), {
          ref: "chat-exercise",
          questions: unref(questions),
          "exercise-kind": unref(challenge).exerciseKind,
          coach: unref(selectedCoach),
          verbs: unref(chatExerciseVerbs),
          tenses: unref(selectedTenses),
          "identification-tenses": unref(identificationTenses),
          "regenerate-questions": regenerateChatQuestions,
          "tracking-context": unref(exerciseTracking),
          "analytics-metadata": exerciseUsageMetadata("chat"),
          "tour-demo": unref(tourActive),
          onChangeCoach: ($event) => selectedCoach.value = $event,
          onClose: ($event) => isExerciseOpen.value = false
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(isCoachPickerOpen) && !unref(falcMode)) {
        _push(ssrRenderComponent(unref(CoachPicker), {
          "tour-demo": unref(tourActive),
          onClose: ($event) => isCoachPickerOpen.value = false,
          onSelect: launchWithCoach
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(isPrintOpen) && !unref(falcMode) && unref(printPreviewComponent)) {
        ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(printPreviewComponent)), {
          questions: unref(printQuestions),
          verbs: unref(selectedVerbs),
          tenses: unref(selectedTenses),
          "exercise-kind": unref(challenge).exerciseKind,
          options: unref(challenge).printOptions,
          "requested-question-count": unref(challenge).questionCount,
          regenerating: unref(busyAction) === "print",
          "analytics-metadata": exerciseUsageMetadata("print"),
          onUpdateOptions: ($event) => unref(challenge).printOptions = $event,
          onRegenerate: preparePrint,
          onClose: ($event) => isPrintOpen.value = false
        }, null), _parent);
      } else {
        _push(`<!---->`);
      }
      if (unref(isShareOpen) && !unref(falcMode)) {
        _push(ssrRenderComponent(ShareChallengeDialog, {
          code: unref(shareCode),
          url: unref(shareUrl),
          busy: unref(busyAction) === "save",
          error: unref(shareError),
          "initial-title": unref(shareTitle),
          "initial-description": unref(shareDescription),
          onClose: ($event) => isShareOpen.value = false,
          onSave: createSharedChallenge
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(isTourWelcomeOpen) && !unref(guidedTourDisabled)) {
          _push2(`<div class="tour-welcome-backdrop" data-v-57e806f1><section class="tour-welcome-dialog" role="dialog" aria-modal="true" aria-labelledby="tour-welcome-title" data-v-57e806f1><div class="tour-welcome-dialog__languages" role="group"${ssrRenderAttr("aria-label", unref(ui)("Langue de l’interface"))} data-v-57e806f1><!--[-->`);
          ssrRenderList(unref(tourLanguageOptions), (option) => {
            _push2(`<button type="button" class="${ssrRenderClass({ "is-active": unref(interfaceLocale) === option.value })}"${ssrRenderAttr("aria-label", option.label)}${ssrRenderAttr("aria-pressed", unref(interfaceLocale) === option.value)}${ssrRenderAttr("title", option.label)} data-v-57e806f1><span aria-hidden="true" data-v-57e806f1>${ssrInterpolate(option.flag)}</span></button>`);
          });
          _push2(`<!--]--></div><button class="tour-welcome-dialog__close" type="button"${ssrRenderAttr("aria-label", unref(tourWelcomeSource) === "reminder" ? unref(ui)("Fermer") : unref(tourCopy).later)} data-v-57e806f1>×</button><span class="tour-welcome-dialog__icon" aria-hidden="true" data-v-57e806f1>?</span><h2 id="tour-welcome-title" data-v-57e806f1>${ssrInterpolate(unref(tourCopy).welcomeTitle)}</h2><p data-v-57e806f1>${ssrInterpolate(unref(tourCopy).welcomeBody)}</p><div class="tour-welcome-dialog__choices" data-v-57e806f1><button type="button" data-v-57e806f1><strong data-v-57e806f1>${ssrInterpolate(unref(tourCopy).quickTitle)}</strong><small data-v-57e806f1>${ssrInterpolate(unref(tourCopy).quickMeta)}</small></button><button type="button" data-v-57e806f1><strong data-v-57e806f1>${ssrInterpolate(unref(tourCopy).fullTitle)}</strong><small data-v-57e806f1>${ssrInterpolate(unref(tourCopy).fullMeta)}</small></button></div><button class="tour-welcome-dialog__later" type="button" data-v-57e806f1>${ssrInterpolate(unref(tourWelcomeSource) === "reminder" ? unref(ui)("Fermer") : unref(tourCopy).later)}</button></section></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/challenge/WizardChallengeWorkspace.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const WizardChallengeWorkspace = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-57e806f1"]]), { __name: "ChallengeWizardChallengeWorkspace" });

export { WizardChallengeWorkspace as W };
//# sourceMappingURL=WizardChallengeWorkspace-Bkyuwywg.mjs.map
