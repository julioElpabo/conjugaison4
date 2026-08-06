import { defineComponent, ref, computed, watch, withAsyncContext, mergeProps, unref, useTemplateRef, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderAttrs, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderClass, ssrRenderTeleport, ssrRenderAttr } from 'vue/server-renderer';
import { G as legacyComplementOptions, H as legacyComplementConfig } from '../nitro/nitro.mjs';
import { u as useChallengeBuilder, a as useRequestURL, g as getChallengeErrorMessage, P as PresetPicker, V as VerbPicker, T as TensePicker, C as ChallengeOptions, b as ChallengeActions, c as PrintPreview, S as ShareChallengeDialog, d as useChallengeApi, e as challengePresetTrackingDescription, f as challengePresetTrackingTitle } from './url-Bv99RUXn.mjs';
import { f as useLanguagePreferences, u as useHead } from './server.mjs';
import { C as ClassicExercise, a as ChatExercise, b as CoachPicker, c as createLearnerTrackingContext } from './CoachPicker--yNAnzlh.mjs';
import { u as useSiteAnalytics } from './useSiteAnalytics-D1wpWTOZ.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mysql2/promise';
import 'node:url';
import 'node:fs/promises';
import '../_/challenge-defaults.mjs';
import './state-DjsguMyT.mjs';
import '@fortawesome/vue-fontawesome';
import '@fortawesome/free-solid-svg-icons';
import '../_/passive-voice.mjs';
import './_plugin-vue_export-helper-1tPrXgE0.mjs';
import './nuxt-link-icjx6oE7.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import '../_/conjugation-display.mjs';
import '../_/near-future.mjs';
import '../_/verb-search.mjs';
import 'vue-router';
import './CoachHelpPanel-CV6-CBeI.mjs';
import '../_/coach.mjs';
import '../_/coach-help-audit.mjs';
import '../_/coach-dialogue.mjs';
import '../_/identification-form.mjs';
import '../_/mode-landing-pages.mjs';
import '../_/mode-tense-pedagogy.mjs';
import './useLearnerAuth-BLt5hOAV.mjs';

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "LoadChallengeDialog",
  __ssrInlineRender: true,
  props: {
    busy: { type: Boolean },
    error: {}
  },
  emits: ["close", "load"],
  setup(__props, { emit: __emit }) {
    const { ui } = useLanguagePreferences();
    const props = __props;
    const code = ref("");
    useTemplateRef("code-input");
    useTemplateRef("load-dialog");
    const localError = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="dialog-backdrop"><section class="app-dialog load-dialog" role="dialog" aria-modal="true" aria-labelledby="load-title" tabindex="-1"><button class="dialog-close" type="button"${ssrRenderAttr("aria-label", unref(ui)("Fermer"))}>×</button><p class="dialog-kicker">${ssrInterpolate(unref(ui)("Défi enregistré"))}</p><h2 id="load-title">${ssrInterpolate(unref(ui)("Charger un défi"))}</h2><p>${ssrInterpolate(unref(ui)("Saisissez ou collez le code reçu. Les tirets sont ajoutés automatiquement."))}</p><form><label class="field-stack" for="challenge-code"><span>${ssrInterpolate(unref(ui)("Code à 8 caractères"))}</span><input id="challenge-code"${ssrRenderAttr("value", unref(code))} type="text" autocomplete="off" autocapitalize="characters" placeholder="AB-CD-EF-23" maxlength="11"></label>`);
        if (unref(localError) || props.error) {
          _push2(`<p class="form-error" role="alert">${ssrInterpolate(unref(localError) || props.error)}</p>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`<div class="dialog-actions"><button class="secondary-button" type="button">${ssrInterpolate(unref(ui)("Annuler"))}</button><button class="primary-button" type="submit"${ssrIncludeBooleanAttr(__props.busy) ? " disabled" : ""}>${ssrInterpolate(__props.busy ? unref(ui)("Chargement…") : unref(ui)("Charger ce défi"))}</button></div></form></section></div>`);
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/challenge/LoadChallengeDialog.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const LoadChallengeDialog = Object.assign(_sfc_main$2, { __name: "ChallengeLoadChallengeDialog" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ChallengeWorkspace",
  __ssrInlineRender: true,
  props: {
    initialCode: {}
  },
  async setup(__props) {
    let __temp, __restore;
    const { ui, localePath } = useLanguagePreferences();
    const props = __props;
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
    const requestUrl = useRequestURL();
    const busyAction = ref(null);
    const actionError = ref("");
    const notice = ref("");
    const loadError = ref("");
    const activePresetId = ref();
    const sourcePresetId = ref();
    const sourcePresetRandomCount = ref(null);
    const questions = ref([]);
    const printQuestions = ref([]);
    const shareCode = ref("");
    const shareTitle = ref("");
    const shareDescription = ref("");
    const shareError = ref("");
    const savedChallengeTitle = ref("");
    const savedChallengeDescription = ref("");
    const isExerciseOpen = ref(false);
    const exercisePresentation = ref("classic");
    const isPrintOpen = ref(false);
    const isShareOpen = ref(false);
    const isLoadOpen = ref(false);
    const isCoachPickerOpen = ref(false);
    const selectedCoach = ref(null);
    const exerciseTracking = ref();
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
    const complementPlacementLabel = computed(() => ({
      after: ui("toujours après"),
      mixed: ui("parfois avant"),
      before: ui("avant si possible")
    })[challenge.value.complementPlacement]);
    function updateComplementOptions(options) {
      const legacy = legacyComplementConfig(options);
      challenge.value.complementOptions = options;
      challenge.value.includeComplements = legacy.includeComplements;
      challenge.value.complementPlacement = legacy.complementPlacement;
      markAsCustom();
    }
    const shareUrl = computed(() => shareCode.value ? new URL(localePath(`/defi/${encodeURIComponent(shareCode.value)}`), requestUrl.origin).toString() : "");
    function logUsage(event) {
      return;
    }
    function exerciseUsageMetadata(presentation) {
      return {
        feature: presentation === "chat" ? "exercise.chat" : "exercise.classic",
        source: sourcePresetId.value ? "preset" : props.initialCode ? "code" : "custom",
        ...sourcePresetId.value ? { preset: sourcePresetId.value } : {}
      };
    }
    const launchFeaturesExposed = ref(false);
    watch(isReady, (ready) => {
      if (!ready || launchFeaturesExposed.value || true) return;
    });
    try {
      [__temp, __restore] = withAsyncContext(() => loadCatalogue()), await __temp, __restore();
    } catch {
    }
    if (props.initialCode && catalogueStatus.value === "success") {
      [__temp, __restore] = withAsyncContext(() => restoreChallenge(props.initialCode, false)), await __temp, __restore();
    }
    function clearMessages() {
      actionError.value = "";
      notice.value = "";
    }
    function markAsCustom() {
      activePresetId.value = void 0;
      clearMessages();
    }
    function shuffledSample(ids, count) {
      const result = [...ids];
      for (let index = result.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
      }
      return result.slice(0, count);
    }
    function selectPreset(preset, randomCount) {
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
      notice.value = randomCount ? `${randomCount} verbes ont été tirés au hasard dans « ${preset.label} ».` : `Le défi « ${preset.label} » est chargé.`;
      actionError.value = "";
      track("challenge_preset_selected", { preset: preset.id, exerciseKind: preset.exerciseKind });
    }
    function beginExerciseTracking(presentation) {
      const preset = catalogue.value.presets.find((candidate) => candidate.id === sourcePresetId.value);
      exerciseTracking.value = createLearnerTrackingContext({
        challengeLabel: savedChallengeTitle.value || (preset ? challengePresetTrackingTitle(preset) : "Défi personnalisé"),
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
      if (!sourcePresetId.value) ;
      if (mode === "chat") {
        track("feature_selected", exerciseUsageMetadata("chat"));
        isCoachPickerOpen.value = true;
        return;
      }
      track("feature_selected", exerciseUsageMetadata("classic"));
      busyAction.value = "exercise";
      clearMessages();
      try {
        questions.value = await api.generateQuestions(challenge.value);
        if (questions.value.length === 0) {
          throw new Error(ui("Aucune question ne correspond à cette sélection."));
        }
        exercisePresentation.value = mode;
        beginExerciseTracking(mode);
        track("exercise_started", exerciseUsageMetadata(mode));
        isExerciseOpen.value = true;
      } catch (error) {
        track("feature_failed", exerciseUsageMetadata("classic"));
        actionError.value = getChallengeErrorMessage(error, ui("Impossible de préparer le questionnaire."));
      } finally {
        busyAction.value = null;
      }
    }
    async function launchWithCoach(coach) {
      if (!isReady.value) return;
      selectedCoach.value = coach;
      track("coach_selected", { coach: coach.id });
      isCoachPickerOpen.value = false;
      busyAction.value = "exercise";
      clearMessages();
      try {
        questions.value = await api.generateQuestions(challenge.value);
        if (!questions.value.length) throw new Error(ui("Aucune question ne correspond à cette sélection."));
        exercisePresentation.value = "chat";
        beginExerciseTracking("chat");
        track("exercise_started", exerciseUsageMetadata("chat"));
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
      if (!isReady.value) return;
      busyAction.value = "print";
      clearMessages();
      try {
        printQuestions.value = await api.generateQuestions(challenge.value);
        if (printQuestions.value.length === 0) {
          throw new Error(ui("Aucune question ne correspond à cette sélection."));
        }
        isPrintOpen.value = true;
        logUsage("print");
      } catch (error) {
        actionError.value = getChallengeErrorMessage(error, ui("Impossible de préparer la fiche à imprimer."));
      } finally {
        busyAction.value = null;
      }
    }
    function saveChallenge() {
      if (!isReady.value) return;
      const activePreset = catalogue.value.presets.find((preset) => preset.id === activePresetId.value);
      shareCode.value = "";
      shareError.value = "";
      shareTitle.value = activePreset?.label || savedChallengeTitle.value || ui("Défi de conjugaison");
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
    async function restoreChallenge(code, closeDialog = true) {
      busyAction.value = "load";
      actionError.value = "";
      loadError.value = "";
      notice.value = "";
      try {
        const restored = await api.loadChallenge(code);
        applySharedChallenge(restored);
        savedChallengeTitle.value = restored.title || "";
        savedChallengeDescription.value = restored.description || "";
        activePresetId.value = void 0;
        sourcePresetId.value = void 0;
        sourcePresetRandomCount.value = null;
        notice.value = `Le défi ${restored.code} est chargé.`;
        logUsage("challenge-load");
        if (closeDialog) isLoadOpen.value = false;
      } catch (error) {
        const message = getChallengeErrorMessage(error, ui("Ce code ne correspond à aucun défi."));
        if (closeDialog) loadError.value = message;
        else actionError.value = message;
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
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "challenge-page" }, _attrs))}><section class="challenge-hero"><p class="challenge-hero__eyebrow">${ssrInterpolate(unref(savedChallengeTitle) ? unref(ui)("Défi partagé") : unref(ui)("Gratuit · sans publicité · personnalisable"))}</p><h1>${ssrInterpolate(unref(savedChallengeTitle) || unref(ui)("Crée ton défi de conjugaison"))}</h1><p class="challenge-hero__shared-description">${ssrInterpolate(unref(savedChallengeDescription) || unref(ui)("Choisis les verbes et les temps à travailler, puis exerce-toi en ligne ou imprime une fiche avec son corrigé."))}</p></section><div class="challenge-shell">`);
      if (unref(catalogueStatus) === "loading") {
        _push(`<div class="page-state" role="status"><span class="loader" aria-hidden="true"></span> ${ssrInterpolate(unref(ui)("Chargement du catalogue de conjugaison…"))}</div>`);
      } else if (unref(catalogueStatus) === "error") {
        _push(`<div class="page-state page-state--error" role="alert"><strong>${ssrInterpolate(unref(ui)("Le catalogue n’a pas pu être chargé."))}</strong><span>${ssrInterpolate(unref(catalogueError))}</span><button class="primary-button" type="button">${ssrInterpolate(unref(ui)("Réessayer"))}</button></div>`);
      } else {
        _push(`<!--[-->`);
        if (unref(actionError)) {
          _push(`<p class="workspace-message workspace-message--error" role="alert">${ssrInterpolate(unref(actionError))}</p>`);
        } else if (unref(notice)) {
          _push(`<p class="workspace-message workspace-message--success" aria-live="polite">${ssrInterpolate(unref(notice))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="challenge-restore"><span>${ssrInterpolate(unref(ui)("Tu as reçu ou enregistré un défi ?"))}</span><button class="text-button" type="button"${ssrIncludeBooleanAttr(Boolean(unref(busyAction))) ? " disabled" : ""}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path></svg> ${ssrInterpolate(unref(ui)("Charger un défi avec son code"))}</button></div>`);
        _push(ssrRenderComponent(PresetPicker, {
          presets: unref(catalogue).presets,
          verbs: unref(catalogue).verbes,
          modes: unref(catalogue).modes,
          tenses: unref(catalogue).temps,
          "active-preset-id": unref(activePresetId),
          onSelect: selectPreset
        }, null, _parent));
        _push(`<div class="builder-grid">`);
        _push(ssrRenderComponent(VerbPicker, {
          verbs: unref(catalogue).verbes,
          "selected-ids": unref(challenge).verbIds,
          onAdd: onAddVerb,
          onRemove: onRemoveVerb,
          onClear: ($event) => {
            markAsCustom();
            unref(clearVerbs)();
          }
        }, null, _parent));
        _push(ssrRenderComponent(TensePicker, {
          modes: unref(catalogue).modes,
          tenses: unref(catalogue).temps,
          verbs: unref(selectedVerbs),
          "selected-ids": unref(challenge).tenseIds,
          onToggle: onToggleTense,
          onSelectAll: ($event) => {
            markAsCustom();
            unref(selectAllTenses)();
          },
          onClear: ($event) => {
            markAsCustom();
            unref(clearTenses)();
          }
        }, null, _parent));
        _push(ssrRenderComponent(ChallengeOptions, {
          "question-count": unref(challenge).questionCount,
          "exercise-kind": unref(challenge).exerciseKind,
          "identification-source": unref(challenge).identificationSource,
          "inclusive-pronouns": unref(challenge).inclusivePronouns,
          "include-on-pronoun": unref(challenge).includeOnPronoun,
          "voice-mode": unref(challenge).voiceMode,
          "complement-options": unref(challenge).complementOptions,
          "complement-verbs": unref(selectedVerbs),
          onUpdateQuestionCount: ($event) => {
            unref(challenge).questionCount = $event;
            markAsCustom();
          },
          onUpdateExerciseKind: ($event) => unref(challenge).exerciseKind = $event,
          onUpdateIdentificationSource: ($event) => unref(challenge).identificationSource = $event,
          onUpdateInclusivePronouns: ($event) => unref(challenge).inclusivePronouns = $event,
          onUpdateIncludeOnPronoun: ($event) => unref(challenge).includeOnPronoun = $event,
          onUpdateVoiceMode: ($event) => unref(challenge).voiceMode = $event,
          onUpdateComplementOptions: updateComplementOptions
        }, null, _parent));
        _push(`</div><div class="${ssrRenderClass([{ "challenge-summary--incomplete": !unref(isReady) }, "challenge-summary"])}" aria-live="polite"><div><p class="builder-card__eyebrow">${ssrInterpolate(unref(ui)("Résumé de ton défi"))}</p>`);
        if (unref(isReady)) {
          _push(`<strong>${ssrInterpolate(unref(selectedVerbs).length)} ${ssrInterpolate(unref(selectedVerbs).length === 1 ? unref(ui)("verbe") : unref(ui)("verbes"))} · ${ssrInterpolate(unref(selectedTenses).length)} ${ssrInterpolate(unref(ui)("temps"))} · ${ssrInterpolate(unref(challenge).questionCount)} ${ssrInterpolate(unref(challenge).questionCount === 1 ? unref(ui)("question") : unref(ui)("questions"))}</strong>`);
        } else {
          _push(`<strong>${ssrInterpolate(unref(ui)("Ton défi n’est pas encore complet"))}</strong>`);
        }
        _push(`</div>`);
        if (!unref(isReady)) {
          _push(`<p>${ssrInterpolate(unref(ui)("Sélectionne au moins un verbe et un temps pour pouvoir le lancer."))}</p>`);
        } else {
          _push(`<p>${ssrInterpolate(unref(challenge).exerciseKind === "conjugation" ? unref(ui)("Conjuguer les formes demandées") : unref(ui)("Trouver le mode et le temps"))} `);
          if (unref(challenge).exerciseKind === "conjugation" && unref(challenge).includeComplements) {
            _push(`<!--[--> · ${ssrInterpolate(unref(ui)("avec compléments,"))} ${ssrInterpolate(unref(complementPlacementLabel))}<!--]-->`);
          } else {
            _push(`<!---->`);
          }
          _push(`</p>`);
        }
        _push(`</div>`);
        _push(ssrRenderComponent(ChallengeActions, {
          class: "challenge-actions--bottom",
          ready: unref(isReady),
          "busy-action": unref(busyAction),
          onExercise: prepareExercise,
          onPrint: preparePrint,
          onSave: saveChallenge
        }, null, _parent));
        _push(`<!--]-->`);
      }
      _push(`</div>`);
      if (unref(isExerciseOpen) && unref(exercisePresentation) === "classic") {
        _push(ssrRenderComponent(ClassicExercise, {
          questions: unref(questions),
          "exercise-kind": unref(challenge).exerciseKind,
          "identification-tenses": unref(identificationTenses),
          "tracking-context": unref(exerciseTracking),
          "analytics-metadata": exerciseUsageMetadata("classic"),
          onClose: ($event) => isExerciseOpen.value = false
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(isExerciseOpen) && unref(exercisePresentation) === "chat" && unref(selectedCoach)) {
        _push(ssrRenderComponent(ChatExercise, {
          questions: unref(questions),
          "exercise-kind": unref(challenge).exerciseKind,
          coach: unref(selectedCoach),
          verbs: unref(chatExerciseVerbs),
          tenses: unref(selectedTenses),
          "identification-tenses": unref(identificationTenses),
          "regenerate-questions": regenerateChatQuestions,
          "tracking-context": unref(exerciseTracking),
          "analytics-metadata": exerciseUsageMetadata("chat"),
          onClose: ($event) => isExerciseOpen.value = false
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(isCoachPickerOpen)) {
        _push(ssrRenderComponent(CoachPicker, {
          onClose: ($event) => isCoachPickerOpen.value = false,
          onSelect: launchWithCoach
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(isPrintOpen)) {
        _push(ssrRenderComponent(PrintPreview, {
          questions: unref(printQuestions),
          verbs: unref(selectedVerbs),
          tenses: unref(selectedTenses),
          "exercise-kind": unref(challenge).exerciseKind,
          options: unref(challenge).printOptions,
          onUpdateOptions: ($event) => unref(challenge).printOptions = $event,
          onClose: ($event) => isPrintOpen.value = false
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(isShareOpen)) {
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
      if (unref(isLoadOpen)) {
        _push(ssrRenderComponent(LoadChallengeDialog, {
          busy: unref(busyAction) === "load",
          error: unref(loadError),
          onClose: ($event) => {
            isLoadOpen.value = false;
            loadError.value = "";
          },
          onLoad: restoreChallenge
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/challenge/ChallengeWorkspace.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const ChallengeWorkspace = Object.assign(_sfc_main$1, { __name: "ChallengeWorkspace" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "accueil",
  __ssrInlineRender: true,
  setup(__props) {
    const { ui } = useLanguagePreferences();
    useHead(() => ({ title: `${ui("Accueil")} · ${ui("Défi de conjugaison")}` }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(ChallengeWorkspace, _attrs, null, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/accueil.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=accueil-x4EAbDYY.mjs.map
