import { defineComponent, ref, useTemplateRef, computed, withAsyncContext, watch, mergeProps, unref, nextTick, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderStyle, ssrRenderComponent, ssrRenderList, ssrRenderTeleport } from 'vue/server-renderer';
import { a8 as challengePresetGroupLabels, M as legacyComplementOptions, N as legacyComplementConfig } from '../nitro/nitro.mjs';
import { u as useChallengeBuilder, a as useRequestURL, n as normalizeChallengeCode, g as getChallengeErrorMessage, P as PresetPicker, V as VerbPicker, T as TensePicker, C as ChallengeOptions, b as ChallengeActions, c as PrintPreview, S as ShareChallengeDialog, d as useChallengeApi, e as challengePresetTrackingDescription, f as challengePresetTrackingTitle } from './url-DnfIvmml.mjs';
import { g as guidedTourCopy } from '../_/guided-tour.mjs';
import { C as ClassicExercise, a as ChatExercise, b as CoachPicker, c as createLearnerTrackingContext } from './CoachPicker-BQ8k9oRK.mjs';
import { f as useLanguagePreferences, g as useRoute } from './server.mjs';
import { u as useSiteAnalytics } from './useSiteAnalytics-D1wpWTOZ.mjs';
import { u as useState } from './state-DjsguMyT.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "WizardChallengeWorkspace",
  __ssrInlineRender: true,
  props: {
    initialCode: {}
  },
  async setup(__props) {
    let __temp, __restore;
    const { ui, localePath, interfaceLocale } = useLanguagePreferences();
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
    const route = useRoute();
    const requestUrl = useRequestURL();
    const wizardInitialized = useState("wizard-challenge-initialized", () => false);
    const homeResetRequested = useState("home-reset-requested", () => false);
    const newChallengeRequested = useState("new-challenge-requested", () => false);
    const guidedTourRequested = useState("guided-tour-requested", () => false);
    useState("wizard-at-home", () => true);
    const currentStep = ref(0);
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
      if ((landingTense || landingMode) && !props.initialCode) {
        const indicative = catalogue.value.modes.find((mode2) => mode2.name.toLocaleLowerCase("fr") === "indicatif");
        const tense = landingTense ? catalogue.value.temps.find((candidate) => candidate.name.toLocaleLowerCase("fr") === landingTense && (!indicative || candidate.modeId === indicative.id)) : void 0;
        const requestedModeName = landingMode === "participe" && String(route.query.temps || "").startsWith("gérondif") ? "gérondif" : landingMode;
        const mode = requestedModeName ? catalogue.value.modes.find((candidate) => candidate.name.toLocaleLowerCase("fr") === requestedModeName) : void 0;
        const selectedModeTense = mode && modeTense ? catalogue.value.temps.find((candidate) => candidate.modeId === mode.id && candidate.name.toLocaleLowerCase("fr") === modeTense) : void 0;
        const tenseIds = tense ? [tense.id] : selectedModeTense ? [selectedModeTense.id] : mode ? catalogue.value.temps.filter((candidate) => candidate.modeId === mode.id).map((candidate) => candidate.id) : [];
        if (tenseIds.length) {
          clearVerbs();
          applySelection({ verbIds: [], tenseIds, questionCount: 10 });
          activePresetId.value = void 0;
          sourcePresetId.value = void 0;
          sourcePresetRandomCount.value = null;
          isPrefilledChallenge.value = false;
          currentStep.value = 1;
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
    function exerciseUsageMetadata(presentation) {
      return {
        feature: presentation === "chat" ? "exercise.chat" : "exercise.classic",
        source: sourcePresetId.value ? "preset" : challengeCode.value ? "code" : "custom",
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
    function restartChallenge() {
      cancelPresetReveal();
      clearVerbs();
      clearTenses();
      challenge.value.questionCount = 10;
      challenge.value.exerciseKind = "conjugation";
      challenge.value.pastSimplePronouns = "all";
      challenge.value.inclusivePronouns = false;
      challenge.value.includeOnPronoun = false;
      challenge.value.voiceMode = "active";
      challenge.value.includeComplements = true;
      challenge.value.complementPlacement = "after";
      challenge.value.complementOptions = ["cod-after", "coi-after"];
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
      if (tourActive.value) return;
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
    watch(currentStep, async () => {
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
        if (!questions.value.length) throw new Error(ui("Aucune question ne correspond à cette sélection."));
        exercisePresentation.value = "classic";
        beginExerciseTracking("classic");
        track("exercise_started", exerciseUsageMetadata("classic"));
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
      track("feature_selected", {
        feature: "print.preview",
        source: sourcePresetId.value ? "preset" : challengeCode.value ? "code" : "custom"
      });
      busyAction.value = "print";
      clearMessages();
      try {
        printQuestions.value = await api.generateQuestions(challenge.value);
        if (!printQuestions.value.length) throw new Error(ui("Aucune question ne correspond à cette sélection."));
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
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "wizard-entry-page" }, _attrs))} data-v-74c11b9f><div class="challenge-page wizard-page" data-v-74c11b9f><header class="wizard-hero" data-v-74c11b9f><h1 class="${ssrRenderClass({ "wizard-hero__brand": unref(currentStep) === 0, "wizard-hero__preset": unref(currentStep) !== 0 && unref(isPrefilledChallenge) })}" data-v-74c11b9f>${ssrInterpolate(unref(heroTitle))}</h1>`);
      if (unref(currentStep) === 0) {
        _push(`<p class="wizard-hero__subtitle" data-v-74c11b9f>${ssrInterpolate(unref(ui)("Exercices de conjugaison française, gratuits et sans publicité"))}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(currentStep) === 0) {
        _push(`<button class="tour-entry-button" type="button" data-v-74c11b9f><span aria-hidden="true" data-v-74c11b9f>?</span>${ssrInterpolate(unref(tourCopy).discover)}</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</header><main class="wizard-shell" data-v-74c11b9f>`);
      if (unref(catalogueStatus) === "loading") {
        _push(`<div class="page-state" role="status" data-v-74c11b9f><span class="loader" aria-hidden="true" data-v-74c11b9f></span> ${ssrInterpolate(unref(ui)("Chargement du catalogue de conjugaison…"))}</div>`);
      } else if (unref(catalogueStatus) === "error") {
        _push(`<div class="page-state page-state--error" role="alert" data-v-74c11b9f><strong data-v-74c11b9f>${ssrInterpolate(unref(ui)("Le catalogue n’a pas pu être chargé."))}</strong><span data-v-74c11b9f>${ssrInterpolate(unref(catalogueError))}</span><button class="primary-button" type="button" data-v-74c11b9f>${ssrInterpolate(unref(ui)("Réessayer"))}</button></div>`);
      } else {
        _push(`<!--[-->`);
        if (unref(actionError)) {
          _push(`<p class="workspace-message workspace-message--error" role="alert" data-v-74c11b9f>${ssrInterpolate(unref(actionError))}</p>`);
        } else if (unref(notice)) {
          _push(`<p class="workspace-message workspace-message--success" aria-live="polite" data-v-74c11b9f>${ssrInterpolate(unref(notice))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<section class="${ssrRenderClass([{ "wizard-panel--autocomplete-open": unref(currentStep) === 1 }, "wizard-panel"])}" tabindex="-1" aria-labelledby="wizard-title" data-v-74c11b9f><h2 id="wizard-title" class="sr-only" data-v-74c11b9f>${ssrInterpolate(unref(ui)("Composer un défi personnalisé"))}</h2>`);
        if (unref(currentStep) !== 0) {
          _push(`<nav class="wizard-steps" data-tour="wizard-steps"${ssrRenderAttr("aria-label", unref(ui)("Étapes de création du défi"))} data-v-74c11b9f><button data-tour-wizard-step="1" class="${ssrRenderClass([{
            "is-active": unref(currentStep) === 1,
            "is-complete": unref(stepStatus).verbs > 0,
            "tour-secondary-focus": unref(tourSecondaryWizardStep) === 1
          }, "wizard-step-tab wizard-step-tab--verbs"])}" type="button" data-v-74c11b9f><span data-v-74c11b9f>1</span><span data-v-74c11b9f><strong data-v-74c11b9f>${ssrInterpolate(unref(ui)("Verbes"))}</strong><small data-v-74c11b9f>${ssrInterpolate(unref(stepStatus).verbs ? unref(ui)(unref(stepStatus).verbs > 1 ? "{count} choisis" : "{count} choisi", { count: unref(stepStatus).verbs }) : unref(ui)("À choisir"))}</small></span></button><span class="wizard-steps__line" aria-hidden="true" data-v-74c11b9f></span><button data-tour-wizard-step="2" class="${ssrRenderClass([{
            "is-active": unref(currentStep) === 2,
            "is-complete": unref(stepStatus).tenses > 0,
            "tour-secondary-focus": unref(tourSecondaryWizardStep) === 2
          }, "wizard-step-tab wizard-step-tab--tenses"])}" type="button"${ssrIncludeBooleanAttr(unref(stepStatus).verbs === 0) ? " disabled" : ""} data-v-74c11b9f><span data-v-74c11b9f>2</span><span data-v-74c11b9f><strong data-v-74c11b9f><span class="mobile-label-hidden" data-v-74c11b9f>${ssrInterpolate(unref(ui)("Modes et temps"))}</span><span class="mobile-label-only" data-v-74c11b9f>${ssrInterpolate(unref(ui)("Temps"))}</span></strong><small data-v-74c11b9f>${ssrInterpolate(unref(stepStatus).tenses ? unref(ui)(unref(stepStatus).tenses > 1 ? "{count} choisis" : "{count} choisi", { count: unref(stepStatus).tenses }) : unref(ui)("À choisir"))}</small></span></button><span class="wizard-steps__line" aria-hidden="true" data-v-74c11b9f></span><button data-tour-wizard-step="3" class="${ssrRenderClass({
            "is-active": unref(currentStep) === 3,
            "is-complete": unref(currentStep) === 4,
            "tour-secondary-focus": unref(tourSecondaryWizardStep) === 3
          })}" type="button"${ssrIncludeBooleanAttr(!unref(isReady)) ? " disabled" : ""} data-v-74c11b9f><span data-v-74c11b9f>3</span><span data-v-74c11b9f><strong data-v-74c11b9f>${ssrInterpolate(unref(ui)("Options"))}</strong><small data-v-74c11b9f>${ssrInterpolate(unref(ui)("Finaliser le défi"))}</small></span></button><span class="wizard-steps__line" aria-hidden="true" data-v-74c11b9f></span><button data-tour-wizard-step="4" class="${ssrRenderClass({
            "is-active": unref(currentStep) === 4,
            "tour-secondary-focus": unref(tourSecondaryWizardStep) === 4
          })}" type="button"${ssrIncludeBooleanAttr(!unref(isReady) || unref(isPreparingStep4)) ? " disabled" : ""} data-v-74c11b9f><span data-v-74c11b9f>4</span><span data-v-74c11b9f><strong data-v-74c11b9f>${ssrInterpolate(unref(ui)("Créer"))}</strong><small data-v-74c11b9f>${ssrInterpolate(unref(ui)("Utiliser le défi"))}</small></span></button>`);
          if (unref(tourSecondaryWizardStep) !== null) {
            _push(`<span class="tour-wizard-step-indicator" style="${ssrRenderStyle(unref(tourWizardIndicatorStyle))}" aria-hidden="true" data-v-74c11b9f></span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</nav>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="${ssrRenderClass([{ "wizard-content--home": unref(currentStep) === 0 }, "wizard-content"])}" data-v-74c11b9f>`);
        if (unref(isPreparingStep4)) {
          _push(`<div class="wizard-step-preparing" role="status" aria-live="polite" data-v-74c11b9f><span class="loader wizard-step-preparing__spinner" aria-hidden="true" data-v-74c11b9f></span><strong data-v-74c11b9f>${ssrInterpolate(unref(ui)("Préparation de ton défi…"))}</strong></div>`);
        } else if (unref(currentStep) === 0) {
          _push(`<div class="wizard-home" data-tour="home" data-v-74c11b9f><div data-tour="code-loader" class="${ssrRenderClass([{ "is-arrival-highlighted": unref(highlightChallengeLoader) }, "code-loader"])}" role="search"${ssrRenderAttr("aria-label", unref(ui)("Charger un défi avec son code"))} data-v-74c11b9f><div class="code-loader__heading" data-v-74c11b9f><span class="code-loader__icon" aria-hidden="true" data-v-74c11b9f><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-74c11b9f><path d="M12 3v12" data-v-74c11b9f></path><path d="m7 10 5 5 5-5" data-v-74c11b9f></path><path d="M5 21h14" data-v-74c11b9f></path></svg></span><div data-v-74c11b9f><strong data-v-74c11b9f>${ssrInterpolate(unref(ui)("Tu as reçu un défi ?"))}</strong><small data-v-74c11b9f>${ssrInterpolate(unref(ui)("Colle son code pour le reprendre immédiatement."))}</small></div></div><div class="code-loader__control" data-v-74c11b9f><span id="wizard-challenge-code-label" class="sr-only" data-v-74c11b9f>${ssrInterpolate(unref(ui)("Code du défi"))}</span><div id="wizard-challenge-code" class="code-loader__code-entry" role="textbox" contenteditable="plaintext-only" aria-labelledby="wizard-challenge-code-label" data-placeholder="AB-CD-EF-23"${ssrRenderAttr("aria-invalid", Boolean(unref(codeError)))} data-v-74c11b9f></div><button class="primary-button wizard-home__outline-action" type="button"${ssrIncludeBooleanAttr(unref(catalogueStatus) !== "success" || unref(busyAction) === "load") ? " disabled" : ""} data-v-74c11b9f>${ssrInterpolate(unref(busyAction) === "load" ? unref(ui)("Chargement…") : unref(ui)("Charger"))}</button></div>`);
          if (unref(codeError)) {
            _push(`<p class="code-loader__error" role="alert" data-v-74c11b9f>${ssrInterpolate(unref(codeError))}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="wizard-home__choices" data-v-74c11b9f>`);
          if (!unref(presetExpanded)) {
            _push(`<button class="wizard-home__choice wizard-home__choice--preset is-collapsed" data-tour="presets" type="button" data-v-74c11b9f><span class="wizard-home__choice-icon" aria-hidden="true" data-v-74c11b9f>★</span><div data-v-74c11b9f><h2 data-v-74c11b9f>${ssrInterpolate(unref(ui)("Tu veux travailler un de nos défis ?"))}</h2></div><span class="secondary-button wizard-home__outline-action" aria-hidden="true" data-v-74c11b9f>${ssrInterpolate(unref(ui)("Découvrir"))}</span></button>`);
          } else {
            _push(`<article data-tour="presets" class="${ssrRenderClass([{ "is-preset-selection": unref(presetStage) === "presets" }, "wizard-home__choice wizard-home__choice--preset"])}" data-v-74c11b9f><span class="wizard-home__choice-icon" aria-hidden="true" data-v-74c11b9f>★</span><div data-v-74c11b9f><h2 data-v-74c11b9f>${ssrInterpolate(unref(ui)("Tu veux travailler un de nos défis ?"))}</h2></div>`);
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
          _push(`<article class="wizard-home__choice wizard-home__choice--custom" data-tour="build-custom" data-v-74c11b9f><span class="wizard-home__choice-icon" aria-hidden="true" data-v-74c11b9f>✎</span><div data-v-74c11b9f><h2 data-v-74c11b9f>${ssrInterpolate(unref(ui)("Tu veux construire ton propre défi ?"))}</h2><p data-v-74c11b9f>${ssrInterpolate(unref(ui)("Choisis les verbes, les modes, les temps et les options."))}</p></div><button class="${ssrRenderClass([{ "wizard-next-pulse": !unref(highlightChallengeLoader) }, "primary-button"])}" type="button" data-v-74c11b9f>${ssrInterpolate(unref(ui)("Construire un nouveau défi →"))}</button></article></div></div>`);
        } else if (unref(currentStep) === 1) {
          _push(`<div class="wizard-step wizard-step--selection" aria-labelledby="verbs-title" data-v-74c11b9f><div class="wizard-step__actions wizard-step__actions--split" data-v-74c11b9f><button class="secondary-button" type="button" data-v-74c11b9f>${ssrInterpolate(unref(ui)("← Nouveau défi"))}</button><div class="wizard-step__controls" data-v-74c11b9f><button class="primary-button wizard-step__cta wizard-next-pulse" type="button"${ssrIncludeBooleanAttr(!unref(selectedVerbs).length) ? " disabled" : ""} data-v-74c11b9f>${ssrInterpolate(unref(ui)("Choisir les temps →"))}</button></div></div>`);
          if (unref(activePreset) && !unref(isPresetVerbEditing)) {
            _push(`<div class="wizard-step__intro wizard-step__intro--selection" data-v-74c11b9f><h2 id="verbs-title" data-v-74c11b9f>${ssrInterpolate(unref(ui)("Verbes du défi"))}</h2></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(activePreset) && !unref(isPresetVerbEditing)) {
            _push(`<section class="preset-verb-overview" data-v-74c11b9f><header data-v-74c11b9f><div data-v-74c11b9f><p data-v-74c11b9f>${ssrInterpolate(unref(selectedVerbs).length)} ${ssrInterpolate(unref(selectedVerbs).length === 1 ? unref(ui)("verbe") : unref(ui)("verbes"))} ${ssrInterpolate(unref(selectedVerbs).length === 1 ? unref(ui)("sélectionné") : unref(ui)("sélectionnés"))}</p><button class="preset-verb-overview__edit" type="button" data-v-74c11b9f>${ssrInterpolate(unref(ui)("Modifier la liste"))}</button></div></header><ul${ssrRenderAttrs({ name: "preset-verb" })} data-v-74c11b9f>`);
            ssrRenderList(unref(displayedSelectedVerbs), (verb) => {
              _push(`<li data-v-74c11b9f>${ssrInterpolate(verb.infinitif)}</li>`);
            });
            _push(`</ul></section>`);
          } else {
            _push(`<!--[--><div class="wizard-step__intro wizard-step__intro--selection" data-v-74c11b9f><h2 id="verbs-title" data-v-74c11b9f>${ssrInterpolate(unref(isPrefilledChallenge) ? unref(ui)("Verbes du défi") : unref(ui)("Choisis les verbes"))}</h2></div>`);
            _push(ssrRenderComponent(VerbPicker, {
              "data-tour": "verbs",
              verbs: unref(catalogue).verbes,
              "selected-ids": unref(displayedVerbIds),
              onAdd: onAddVerb,
              onRemove: onRemoveVerb,
              onClear: ($event) => {
                markAsCustom();
                unref(clearVerbs)();
              }
            }, null, _parent));
            _push(`<!--]-->`);
          }
          _push(`<div class="wizard-step__bottom-actions" data-v-74c11b9f><button class="primary-button wizard-step__cta wizard-next-pulse" type="button"${ssrIncludeBooleanAttr(!unref(selectedVerbs).length) ? " disabled" : ""} data-v-74c11b9f>${ssrInterpolate(unref(ui)("Choisir les temps →"))}</button></div></div>`);
        } else if (unref(currentStep) === 2) {
          _push(`<div class="wizard-step wizard-step--selection" aria-labelledby="tenses-title" data-v-74c11b9f><div class="wizard-step__actions wizard-step__actions--split" data-v-74c11b9f><button class="secondary-button" type="button" data-v-74c11b9f>${ssrInterpolate(unref(ui)("← Verbes"))}</button><div class="wizard-step__controls" data-v-74c11b9f><button class="primary-button wizard-step__cta wizard-next-pulse" type="button"${ssrIncludeBooleanAttr(!unref(selectedTenses).length) ? " disabled" : ""} data-v-74c11b9f>${ssrInterpolate(unref(ui)("Choisir les options →"))}</button></div></div><div class="wizard-step__intro wizard-step__intro--selection" data-v-74c11b9f><h2 data-v-74c11b9f>${ssrInterpolate(unref(isPrefilledChallenge) ? unref(ui)("Modes et temps") : unref(ui)("Choisis les modes et les temps"))}</h2></div>`);
          _push(ssrRenderComponent(TensePicker, {
            "data-tour": "tenses",
            modes: unref(catalogue).modes,
            tenses: unref(catalogue).temps,
            verbs: unref(selectedVerbs),
            "selected-ids": unref(displayedTenseIds),
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
          _push(`<div class="wizard-step__bottom-actions" data-v-74c11b9f><button class="primary-button wizard-step__cta wizard-next-pulse" type="button"${ssrIncludeBooleanAttr(!unref(selectedTenses).length) ? " disabled" : ""} data-v-74c11b9f>${ssrInterpolate(unref(ui)("Choisir les options →"))}</button></div></div>`);
        } else if (unref(currentStep) === 3) {
          _push(`<div class="wizard-step wizard-review" data-v-74c11b9f><div class="wizard-step__actions wizard-step__actions--split" data-v-74c11b9f><button class="secondary-button" type="button" data-v-74c11b9f> ← <span class="mobile-label-hidden" data-v-74c11b9f>${ssrInterpolate(unref(ui)("Modes et temps"))}</span><span class="mobile-label-only" data-v-74c11b9f>${ssrInterpolate(unref(ui)("Temps"))}</span></button><div class="wizard-step__controls" data-v-74c11b9f><button class="primary-button wizard-step__cta wizard-step__cta--launch wizard-next-pulse" type="button" data-v-74c11b9f>${ssrInterpolate(unref(ui)("Créer le défi"))}</button></div></div><div class="wizard-step__intro wizard-step__intro--selection" data-v-74c11b9f><h2 data-v-74c11b9f>${ssrInterpolate(unref(ui)("Options du défi"))}</h2></div>`);
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
            "grid-layout": "",
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
          _push(`<div class="wizard-step__bottom-actions" data-v-74c11b9f><button class="primary-button wizard-step__cta wizard-step__cta--launch wizard-next-pulse" type="button" data-v-74c11b9f>${ssrInterpolate(unref(ui)("Créer le défi"))}</button></div></div>`);
        } else {
          _push(`<div class="wizard-step wizard-launch-step" data-v-74c11b9f><div class="wizard-step__actions wizard-step__actions--split" data-v-74c11b9f><button class="secondary-button" type="button" data-v-74c11b9f>${ssrInterpolate(unref(ui)("← Options"))}</button></div>`);
          if (unref(showLaunchSummary) || unref(showSavedChallengeSummary)) {
            _push(`<section class="launch-summary"${ssrRenderAttr("aria-labelledby", unref(activePreset) || unref(savedChallengeTitle) ? "launch-challenge-title" : void 0)} data-v-74c11b9f><div class="launch-summary__heading" data-v-74c11b9f><div data-v-74c11b9f>`);
            if (unref(activePreset)) {
              _push(`<p class="builder-card__eyebrow" data-v-74c11b9f>${ssrInterpolate(unref(activePresetGroupLabel))}</p>`);
            } else {
              _push(`<!---->`);
            }
            if (unref(activePreset) || unref(savedChallengeTitle)) {
              _push(`<h2 id="launch-challenge-title" data-v-74c11b9f>${ssrInterpolate(unref(activePreset)?.label || unref(savedChallengeTitle))}</h2>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="launch-summary__counts" data-v-74c11b9f><span data-v-74c11b9f>${ssrInterpolate(unref(ui)(unref(selectedVerbs).length > 1 ? "{count} verbes" : "{count} verbe", { count: unref(selectedVerbs).length }))}</span><span data-v-74c11b9f>${ssrInterpolate(unref(ui)("{count} temps", { count: unref(selectedTenses).length }))}</span></div></div>`);
            if (unref(activePreset)?.description || unref(savedChallengeDescription)) {
              _push(`<p class="launch-summary__description" data-v-74c11b9f>${ssrInterpolate(unref(activePreset)?.description || unref(savedChallengeDescription))}</p>`);
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
        _push(ssrRenderComponent(ClassicExercise, {
          ref: "classic-exercise",
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
          onClose: ($event) => isExerciseOpen.value = false
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(isCoachPickerOpen)) {
        _push(ssrRenderComponent(CoachPicker, {
          "tour-demo": unref(tourActive),
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
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(isTourWelcomeOpen)) {
          _push2(`<div class="tour-welcome-backdrop" data-v-74c11b9f><section class="tour-welcome-dialog" role="dialog" aria-modal="true" aria-labelledby="tour-welcome-title" data-v-74c11b9f><div class="tour-welcome-dialog__languages" role="group"${ssrRenderAttr("aria-label", unref(ui)("Langue de l’interface"))} data-v-74c11b9f><!--[-->`);
          ssrRenderList(unref(tourLanguageOptions), (option) => {
            _push2(`<button type="button" class="${ssrRenderClass({ "is-active": unref(interfaceLocale) === option.value })}"${ssrRenderAttr("aria-label", option.label)}${ssrRenderAttr("aria-pressed", unref(interfaceLocale) === option.value)}${ssrRenderAttr("title", option.label)} data-v-74c11b9f><span aria-hidden="true" data-v-74c11b9f>${ssrInterpolate(option.flag)}</span></button>`);
          });
          _push2(`<!--]--></div><button class="tour-welcome-dialog__close" type="button"${ssrRenderAttr("aria-label", unref(tourWelcomeSource) === "reminder" ? unref(ui)("Fermer") : unref(tourCopy).later)} data-v-74c11b9f>×</button><span class="tour-welcome-dialog__icon" aria-hidden="true" data-v-74c11b9f>?</span><h2 id="tour-welcome-title" data-v-74c11b9f>${ssrInterpolate(unref(tourCopy).welcomeTitle)}</h2><p data-v-74c11b9f>${ssrInterpolate(unref(tourCopy).welcomeBody)}</p><div class="tour-welcome-dialog__choices" data-v-74c11b9f><button type="button" data-v-74c11b9f><strong data-v-74c11b9f>${ssrInterpolate(unref(tourCopy).quickTitle)}</strong><small data-v-74c11b9f>${ssrInterpolate(unref(tourCopy).quickMeta)}</small></button><button type="button" data-v-74c11b9f><strong data-v-74c11b9f>${ssrInterpolate(unref(tourCopy).fullTitle)}</strong><small data-v-74c11b9f>${ssrInterpolate(unref(tourCopy).fullMeta)}</small></button></div><button class="tour-welcome-dialog__later" type="button" data-v-74c11b9f>${ssrInterpolate(unref(tourWelcomeSource) === "reminder" ? unref(ui)("Fermer") : unref(tourCopy).later)}</button></section></div>`);
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
const WizardChallengeWorkspace = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-74c11b9f"]]), { __name: "ChallengeWizardChallengeWorkspace" });

export { WizardChallengeWorkspace as W };
//# sourceMappingURL=WizardChallengeWorkspace-C5Ol95c8.mjs.map
