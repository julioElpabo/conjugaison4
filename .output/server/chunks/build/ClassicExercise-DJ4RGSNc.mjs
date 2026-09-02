import { defineComponent, ref, shallowRef, watch, markRaw, useTemplateRef, computed, unref, createVNode, resolveDynamicComponent, nextTick, useSSRContext } from 'vue';
import { ssrRenderTeleport, ssrRenderClass, ssrRenderAttr, ssrInterpolate, ssrRenderList, ssrIncludeBooleanAttr, ssrRenderComponent, ssrRenderVNode } from 'vue/server-renderer';
import { faSpinner, faStop, faVolume, faCirclePlay, faArrowUpFromBracket, faPrint } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { L as LearnerErrorFeedback, S as ShareExerciseSummaryDialog, V as VerbConsultationModal } from './VerbConsultationModal-BL2XCn3o.mjs';
import { i as isModeLandingSlug, m as modeLandingPage } from '../_/mode-landing-pages.mjs';
import { m as modeTensePedagogy } from '../_/mode-tense-pedagogy.mjs';
import { _ as validateConjugationAnswer, $ as validateAnswer, as as conjugationRequiresSubjectPronoun, at as conjugationAnswerPlaceholder, au as providedSubjunctiveInputPrefix, av as getAlternativeCorrections, aw as impossibleSingularEndingReminderMessage, a4 as grammarTenseCode, ax as isFutureSimpleInsteadOfNearFuture, ay as findConjugationConfusions, az as findImpossibleSingularEnding, aA as diagnoseCoachAgreement, aB as diagnoseCoachAnswer, a3 as learnerErrorDetails, aC as mergeLearnerErrorDetails } from '../nitro/nitro.mjs';
import { i as identificationFormParts } from '../_/identification-form.mjs';
import { w as withSentenceTerminalMark, s as sentenceTerminalMark } from '../_/sentence-punctuation.mjs';
import { f as useLanguagePreferences, h as useState } from './server.mjs';
import { u as useSiteAnalytics } from './useSiteAnalytics-Bd_7Kr2F.mjs';
import { u as useLearnerProgress } from './main-DlTU7wez.mjs';
import './_plugin-vue_export-helper-1tPrXgE0.mjs';
import '../_/conjugation-display.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'web-push';
import 'mysql2/promise';
import 'node:fs/promises';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';
import './useLearnerAuth-tqISusbB.mjs';

function evaluateExerciseAnswer(answer, question, retryAlreadyOffered, requireSubjectPronoun = false) {
  const result = requireSubjectPronoun ? validateConjugationAnswer(answer, question) : validateAnswer(answer, question.reponses);
  const missingSubjectPronoun = result.reason === "missing-subject-pronoun";
  return {
    result,
    missingSubjectPronoun,
    shouldRetry: !result.isCorrect && !missingSubjectPronoun && !retryAlreadyOffered
  };
}

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ClassicExercise",
  __ssrInlineRender: true,
  props: {
    questions: {},
    exerciseKind: {},
    identificationTenses: {},
    trackingContext: {},
    requireSuccess: { type: Boolean },
    analyticsMetadata: {}
  },
  emits: ["close"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const { interfaceLocale, ui, uiLabel } = useLanguagePreferences();
    const falcMode = useState("falc-mode", () => false);
    const props = __props;
    const { track } = useSiteAnalytics();
    const { recordAttempt } = useLearnerProgress();
    const currentIndex = ref(0);
    const answer = ref("");
    const selectedIdentificationMode = ref("");
    const lastIncorrectIdentificationAnswer = ref("");
    const isSmallScreen = ref(false);
    const feedback = ref("idle");
    const answerHeardBeforeSubmission = ref(false);
    const audioLoadingKey = ref("");
    const audioError = ref("");
    const speakingKey = ref("");
    let currentAudio = null;
    let currentAudioUrl = "";
    const retryAlreadyOffered = ref(false);
    const retryMessageVisible = ref(false);
    const missingPronounMessageVisible = ref(false);
    const futureSimpleConfusion = ref(false);
    const conjugationConfusions = ref([]);
    const impossibleSingularEnding = ref(null);
    const agreementError = ref(false);
    const auxiliaryError = ref();
    const attempts = ref([]);
    const pendingErrorLabels = ref([]);
    const pendingErrorDetails = ref([]);
    const detectedErrorDetails = ref([]);
    const isFinished = ref(false);
    const printSummaryOpen = ref(false);
    const printSummaryComponent = shallowRef(null);
    function complementSentenceTerminalMark(question) {
      return question.complementFunction === "cod" || question.complementFunction === "coi" ? sentenceTerminalMark(question.mode) : "";
    }
    watch(printSummaryOpen, async (open) => {
      if (!open || printSummaryComponent.value) return;
      printSummaryComponent.value = markRaw((await import('./ExerciseSummaryPrintPreview-Bb0LNU-I.mjs')).default);
    });
    const shareSummaryOpen = ref(false);
    const closeConfirmationOpen = ref(false);
    const consultationVerbId = ref(null);
    const answerInput = useTemplateRef("answer-input");
    useTemplateRef("keep-exercise-button");
    useTemplateRef("exercise-dialog");
    const exerciseAnalyticsMetadata = computed(() => ({
      ...props.analyticsMetadata,
      presentation: "classic",
      exerciseKind: props.exerciseKind
    }));
    const currentQuestion = computed(() => props.questions[currentIndex.value]);
    const falcOnlyIndicative = computed(() => props.questions.length > 0 && props.questions.every((question) => normalizedGrammarChoice(question.mode) === "indicatif"));
    const falcQuestionPrompt = computed(() => {
      const question = currentQuestion.value;
      if (!question) return "";
      const tense = uiLabel(question.temps || "");
      const tenseAndMode = falcOnlyIndicative.value || !question.mode ? tense : `${tense} (${uiLabel(question.mode)})`;
      return [question.pronom, question.infinitif, tenseAndMode].filter(Boolean).join(" | ");
    });
    const currentSubjectMustBeTyped = computed(() => Boolean(
      currentQuestion.value && props.exerciseKind === "conjugation" && conjugationRequiresSubjectPronoun(currentQuestion.value)
    ));
    const currentAnswerPlaceholder = computed(() => currentQuestion.value ? conjugationAnswerPlaceholder(currentQuestion.value) : "");
    const providedAnswerPrefix = computed(() => currentQuestion.value && props.exerciseKind === "conjugation" ? providedSubjunctiveInputPrefix(currentQuestion.value) : "");
    const isModeIdentificationExercise = computed(() => props.exerciseKind === "mode-identification");
    const isTenseIdentificationExercise = computed(() => props.exerciseKind === "tense-identification");
    const isIdentificationExercise = computed(() => isModeIdentificationExercise.value || isTenseIdentificationExercise.value);
    const currentIdentificationFormParts = computed(() => currentQuestion.value && isIdentificationExercise.value ? identificationFormParts(currentQuestion.value) : null);
    const fixedModeChoices = computed(() => [
      { value: "indicatif", label: ui("Indicatif") },
      { value: "impératif", label: ui("Impératif") },
      { value: "subjonctif", label: ui("Subjonctif") },
      { value: "conditionnel", label: ui("Conditionnel") },
      { value: "infinitif", label: ui("Infinitif") }
    ]);
    const displayedModeChoices = computed(() => fixedModeChoices.value);
    const selectedModeTenseChoices = computed(() => {
      const tenses = /* @__PURE__ */ new Map();
      const sources = props.identificationTenses?.length ? props.identificationTenses.map((tense) => ({ id: tense.id, mode: tense.mode?.name, tense: tense.name, isCompound: tense.isCompound, selected: tense.selected })) : props.questions.map((question) => ({ id: question.tenseId, mode: question.mode, tense: question.temps, isCompound: Boolean(question.isCompound), selected: true }));
      for (const source of sources) {
        if (normalizedGrammarChoice(source.mode) !== normalizedGrammarChoice(selectedIdentificationMode.value)) continue;
        const name = source.tense?.trim();
        if (!name) continue;
        const key = normalizedGrammarChoice(name);
        if (key === "futur proche") continue;
        if (!tenses.has(key)) tenses.set(key, {
          name,
          label: uiLabel(name),
          isCompound: source.isCompound
        });
      }
      return [...tenses.values()].sort((left, right) => left.label.localeCompare(right.label, "fr"));
    });
    const selectedModeTenseRows = computed(() => pairClassicTenseChoices(
      selectedIdentificationMode.value,
      selectedModeTenseChoices.value
    ));
    const answerPlaceholder = computed(() => isIdentificationExercise.value && isSmallScreen.value ? ui("Écris ta réponse") : isModeIdentificationExercise.value ? ui("Écris ta réponse ou clique directement sur le mode correct") : isTenseIdentificationExercise.value ? ui("Écris ta réponse ou clique directement sur le mode puis sur le temps correct") : "");
    const questionNumberOffset = computed(() => props.trackingContext?.questionIndexOffset || 0);
    const displayedQuestionNumber = computed(() => questionNumberOffset.value + currentIndex.value + 1);
    const displayedQuestionCount = computed(() => questionNumberOffset.value ? props.trackingContext?.challenge.questionCount || props.questions.length : props.questions.length);
    const correctCount = computed(() => attempts.value.filter((attempt) => attempt.status === "correct" && !attempt.answerWasHeard).length);
    const scorePercent = computed(() => attempts.value.length ? Math.round(correctCount.value / attempts.value.length * 100) : 0);
    function displayedCorrectionAnswer(question, expectedAnswer) {
      return question.complementFunction === "cod" || question.complementFunction === "coi" ? withSentenceTerminalMark(expectedAnswer, question.mode) : expectedAnswer;
    }
    const correction = computed(() => currentQuestion.value ? currentQuestion.value.reponsesPourCorrige.map((answer2) => displayedCorrectionAnswer(currentQuestion.value, answer2)).join(` ${ui("ou")} `) : "");
    const correctionPunctuation = computed(() => /[.!?…]$/u.test(correction.value) ? "" : ".");
    const alternativeCorrections = computed(() => currentQuestion.value ? getAlternativeCorrections(answer.value, currentQuestion.value.reponsesPourCorrige) : []);
    const alternativeText = computed(() => alternativeCorrections.value.join(` ${ui("ou")} `));
    const alternativePunctuation = computed(() => /[.!?]$/u.test(alternativeText.value) ? "" : ".");
    const agreementReminder = computed(() => currentQuestion.value?.agreementReminder);
    const conjugationConfusionText = computed(() => {
      const question = currentQuestion.value;
      const confusion = conjugationConfusions.value[0];
      if (!question || !confusion) return "";
      return ui(
        "Ta forme est correcte pour le mode {sourceMode}, au temps {sourceTense}. Ici, il fallait le mode {targetMode}, au temps {targetTense}.",
        {
          sourceMode: uiLabel(confusion.mode),
          sourceTense: uiLabel(confusion.tense),
          targetMode: uiLabel(question.mode),
          targetTense: uiLabel(question.temps)
        }
      );
    });
    const impossibleSingularEndingText = computed(() => impossibleSingularEnding.value ? ui(impossibleSingularEndingReminderMessage(impossibleSingularEnding.value)) : "");
    const agreementFeatures = computed(() => {
      const reminder = agreementReminder.value;
      if (!reminder?.gender || !reminder.number) return "";
      return `${uiLabel(reminder.gender === "feminin" ? "féminin" : "masculin")} ${uiLabel(reminder.number)}`;
    });
    const indirectRecognition = computed(() => {
      const preposition = agreementReminder.value?.preposition || "à";
      return `${agreementReminder.value?.infinitive} ${preposition} qui ? / ${preposition} quoi ?`;
    });
    const agreementExplanation = computed(() => {
      const reminder = agreementReminder.value;
      if (!reminder) return agreementError.value ? ui("Le participe passé n’a pas le bon accord. Compare sa terminaison avec la correction.") : "";
      const values = {
        complement: reminder.complement,
        verb: reminder.infinitive,
        participle: reminder.participle,
        features: agreementFeatures.value ? `, ${agreementFeatures.value}` : ""
      };
      if (reminder.kind === "cod-before") return feedback.value === "correct" ? ui("C’est juste : le COD « {complement} » est placé avant le verbe « {verb} ». Avec avoir, le participe passé s’accorde donc avec ce COD{features} : « {participle} ».", values) : ui("Ici, le COD « {complement} » est placé avant le verbe « {verb} ». Avec avoir, il commande l’accord du participe passé{features} : « {participle} ».", values);
      if (reminder.kind === "cod-after") return feedback.value === "correct" ? ui("C’est juste : le COD « {complement} » est placé après le verbe « {verb} ». Avec avoir, on n’accorde pas le participe passé avec un COD placé après : il reste « {participle} ».", values) : ui("Ici, le COD « {complement} » est placé après le verbe « {verb} ». Il ne commande donc aucun accord : le participe passé reste « {participle} ».", values);
      return feedback.value === "correct" ? ui("C’est juste : « {complement} » n’est pas un COD, mais un COI du verbe « {verb} ». Un COI ne commande jamais l’accord du participe passé employé avec avoir : il reste « {participle} ».", values) : ui("Attention : « {complement} » n’est pas un COD, mais un COI du verbe « {verb} ». Il ne faut pas accorder le participe avec ce complément : il reste « {participle} ».", values);
    });
    const auxiliaryErrorText = computed(() => {
      const error = auxiliaryError.value;
      const question = currentQuestion.value;
      if (!error || !question) return "";
      return ui(
        "L’auxiliaire « {learnerAuxiliary} » ne convient pas. Avec {person} au {tense}, il fallait « {expectedAuxiliary} ».",
        {
          learnerAuxiliary: error.learner,
          expectedAuxiliary: error.expected,
          person: question.pronom || question.saisiePrefixe || ui("cette personne"),
          tense: uiLabel(question.temps)
        }
      );
    });
    const identificationChoiceHelpMessages = computed(() => {
      const question = currentQuestion.value;
      const submittedAnswer = normalizedGrammarChoice(lastIncorrectIdentificationAnswer.value);
      if (!isIdentificationExercise.value || !question || !submittedAnswer) return [];
      const selectedMode = displayedModeChoices.value.find((choice) => submittedAnswer.includes(normalizedGrammarChoice(choice.value)))?.value || "";
      if (!selectedMode) return [];
      const messages = [];
      const selectedModeSlug = normalizedGrammarChoice(selectedMode);
      if (normalizedGrammarChoice(selectedMode) !== normalizedGrammarChoice(question.mode) && isModeLandingSlug(selectedModeSlug)) {
        const modeHelp = modeLandingPage(selectedModeSlug, interfaceLocale.value);
        messages.push(`${uiLabel(selectedMode)} : ${modeHelp.purpose}`);
      }
      if (!isTenseIdentificationExercise.value) return messages;
      const tenseSources = props.identificationTenses?.length ? props.identificationTenses.map((tense) => ({ mode: tense.mode?.name, name: tense.name })) : props.questions.map((item) => ({ mode: item.mode, name: item.temps }));
      const selectedTense = tenseSources.filter((tense) => normalizedGrammarChoice(tense.mode) === selectedModeSlug && tense.name).sort((left, right) => normalizedGrammarChoice(right.name).length - normalizedGrammarChoice(left.name).length).find((tense) => submittedAnswer.includes(normalizedGrammarChoice(tense.name)))?.name || "";
      if (!selectedTense || grammarTenseCode(selectedTense) === grammarTenseCode(question.temps)) return messages;
      const tenseSlugByCode = {
        present: "present",
        "near-future": "futur-proche",
        imperfect: "imparfait",
        future: "futur-simple",
        "simple-past": "passe-simple",
        "compound-past": "passe-compose",
        "future-perfect": "futur-anterieur",
        pluperfect: "plus-que-parfait",
        "past-anterior": "passe-anterieur",
        past: "passe",
        "past-first-form": "passe-premiere-forme",
        "past-second-form": "passe-deuxieme-forme"
      };
      const tenseCode = grammarTenseCode(selectedTense);
      const tenseSlug = tenseCode ? tenseSlugByCode[tenseCode] : void 0;
      const tenseHelp = isModeLandingSlug(selectedModeSlug) && tenseSlug ? modeTensePedagogy(selectedModeSlug, tenseSlug) : void 0;
      if (tenseHelp) messages.push(`${uiLabel(selectedTense)} — ${uiLabel(selectedMode)} : ${tenseHelp.summary}`);
      return messages;
    });
    const retryGuidanceMessages = computed(() => {
      if (isIdentificationExercise.value) return identificationChoiceHelpMessages.value;
      const messages = [];
      if (futureSimpleConfusion.value) {
        messages.push(ui("Ta conjugaison est correcte au futur simple, mais la question demande le futur proche. Au futur simple, le verbe est conjugué en un seul mot (« tu mangeras »). Au futur proche, on utilise « aller » au présent suivi de l’infinitif (« tu vas manger »)."));
      }
      if (conjugationConfusionText.value) messages.push(conjugationConfusionText.value);
      if (impossibleSingularEndingText.value) messages.push(impossibleSingularEndingText.value);
      if (auxiliaryErrorText.value) messages.push(auxiliaryErrorText.value);
      if (agreementError.value && agreementExplanation.value) messages.push(agreementExplanation.value);
      return messages;
    });
    const agreementRecognition = computed(() => {
      const reminder = agreementReminder.value;
      if (!reminder) return "";
      return reminder.kind === "coi" ? ui("Pour reconnaître le COI, repère sa préposition et pose la question « {question} ».", { question: indirectRecognition.value }) : ui("Pour reconnaître le COD, pose « {verb} qui ? » ou « {verb} quoi ? ». Il répond sans préposition.", { verb: reminder.infinitive });
    });
    const titleMessage = computed(() => {
      if (scorePercent.value >= 90) return ui("Excellent !");
      if (scorePercent.value >= 60) return ui("Bravo !");
      if (scorePercent.value >= 40) return ui("Bel effort !");
      return ui("Continue, tu progresses !");
    });
    const summaryItems = computed(() => attempts.value.map((attempt, index) => ({
      index: index + 1,
      status: attempt.status,
      questionLabel: attempt.question.consigne,
      learnerAnswer: attempt.answer,
      expectedAnswer: attempt.question.reponsesPourCorrige.join(` ${ui("ou")} `) || attempt.question.reponses.join(` ${ui("ou")} `),
      errorLabels: attempt.errorLabels || [],
      errorDetails: attempt.errorDetails || [],
      attemptNumber: attempt.attemptNumber
    })));
    const incorrectSummaryForms = computed(() => attempts.value.map((attempt) => isIdentificationExercise.value && attempt.status === "incorrect" ? identificationFormParts(attempt.question) : null));
    const summaryVerbs = computed(() => [...new Set(props.questions.flatMap((question) => question.infinitif ? [question.infinitif] : []))]);
    const summaryTenses = computed(() => {
      const seen = /* @__PURE__ */ new Set();
      return props.questions.flatMap((question) => {
        const key = `${question.mode || ""}\0${question.temps || ""}`;
        if (!question.temps || seen.has(key)) return [];
        seen.add(key);
        return [{ name: question.temps, mode: question.mode }];
      });
    });
    function mergeErrorLabels(...groups) {
      return [...new Set(groups.flat())];
    }
    function normalizedGrammarChoice(value) {
      return (value || "").normalize("NFD").replace(new RegExp("\\p{Diacritic}", "gu"), "").trim().toLocaleLowerCase("fr");
    }
    function stopSpeech() {
      currentAudio?.pause();
      currentAudio = null;
      if (currentAudioUrl) URL.revokeObjectURL(currentAudioUrl);
      currentAudioUrl = "";
      audioLoadingKey.value = "";
      speakingKey.value = "";
    }
    function closeVerbConsultation() {
      consultationVerbId.value = null;
    }
    function pairClassicTenseChoices(mode, choices) {
      const normalizedMode = normalizedGrammarChoice(mode);
      const pairsByMode = {
        indicatif: [
          ["present", "passe compose"],
          ["imparfait", "plus-que-parfait"],
          ["passe simple", "passe anterieur"],
          ["futur", "futur anterieur"]
        ],
        imperatif: [["present", "passe"]],
        subjonctif: [
          ["present", "passe"],
          ["imparfait", "plus-que-parfait"]
        ],
        conditionnel: [
          ["present", "passe 1"],
          [null, "passe 2"]
        ]
      };
      const byName = new Map(choices.map((choice) => [normalizedGrammarChoice(choice.name), choice]));
      const used = /* @__PURE__ */ new Set();
      const rows = [];
      for (const [simpleName, compoundName] of pairsByMode[normalizedMode] || []) {
        const simple = simpleName ? byName.get(simpleName) || null : null;
        const compound = compoundName ? byName.get(compoundName) || null : null;
        if (!simple && !compound) continue;
        if (simpleName && simple) used.add(simpleName);
        if (compoundName && compound) used.add(compoundName);
        rows.push({ key: `${simpleName || "empty"}:${compoundName || "empty"}`, simple, compound });
      }
      for (const choice of choices) {
        const key = normalizedGrammarChoice(choice.name);
        if (used.has(key)) continue;
        rows.push({
          key,
          simple: choice.isCompound ? null : choice,
          compound: choice.isCompound ? choice : null
        });
      }
      return rows;
    }
    function submitAnswer() {
      const question = currentQuestion.value;
      if (!question || feedback.value !== "idle" || !answer.value.trim()) {
        return;
      }
      const { result, shouldRetry, missingSubjectPronoun } = evaluateExerciseAnswer(
        answer.value,
        question,
        falcMode.value || retryAlreadyOffered.value,
        !isIdentificationExercise.value
      );
      if (missingSubjectPronoun && !falcMode.value) {
        missingPronounMessageVisible.value = true;
        retryMessageVisible.value = false;
        detectedErrorDetails.value = [];
        nextTick(() => {
          answerInput.value?.focus();
          answerInput.value?.select();
        });
        return;
      }
      missingPronounMessageVisible.value = false;
      lastIncorrectIdentificationAnswer.value = isIdentificationExercise.value && !result.isCorrect ? answer.value : "";
      const usedFutureSimple = !isIdentificationExercise.value && !result.isCorrect && isFutureSimpleInsteadOfNearFuture(answer.value, question);
      const otherConjugations = isIdentificationExercise.value || result.isCorrect ? [] : findConjugationConfusions(answer.value, question);
      const impossibleEnding = isIdentificationExercise.value || result.isCorrect ? null : findImpossibleSingularEnding(answer.value, question);
      const hasAgreementError = !isIdentificationExercise.value && !result.isCorrect && Boolean(diagnoseCoachAgreement(answer.value, question));
      const diagnostic = isIdentificationExercise.value ? null : diagnoseCoachAnswer(answer.value, question, result.isCorrect);
      const currentErrorDetails = result.isCorrect || isIdentificationExercise.value ? [] : learnerErrorDetails(answer.value, question);
      const detectedAuxiliaryError = currentErrorDetails.some((detail) => detail.code === "compound.auxiliary") && diagnostic?.errorKind === "auxiliary" && diagnostic.learnerAuxiliary && diagnostic.expectedAuxiliary ? { learner: diagnostic.learnerAuxiliary, expected: diagnostic.expectedAuxiliary } : void 0;
      const currentErrorLabels = currentErrorDetails.map((detail) => detail.label);
      const attemptErrorLabels = mergeErrorLabels(pendingErrorLabels.value, currentErrorLabels);
      const attemptErrorDetails = mergeLearnerErrorDetails(pendingErrorDetails.value, currentErrorDetails);
      detectedErrorDetails.value = attemptErrorDetails;
      const trackedAttempt = {
        question,
        answer: answer.value,
        status: result.isCorrect ? "correct" : "incorrect",
        attemptNumber: retryAlreadyOffered.value ? 2 : 1,
        ...answerHeardBeforeSubmission.value ? { answerWasHeard: true } : {},
        ...result.matchedAnswer ? { matchedAnswer: result.matchedAnswer } : {},
        ...attemptErrorLabels.length ? { errorLabels: attemptErrorLabels } : {},
        ...attemptErrorDetails.length ? { errorDetails: attemptErrorDetails } : {}
      };
      track("answer_submitted", exerciseAnalyticsMetadata.value);
      void recordAttempt(
        props.trackingContext,
        trackedAttempt,
        currentIndex.value
      );
      if (shouldRetry) {
        track("answer_retry", exerciseAnalyticsMetadata.value);
        retryAlreadyOffered.value = true;
        retryMessageVisible.value = true;
        futureSimpleConfusion.value = usedFutureSimple;
        conjugationConfusions.value = otherConjugations;
        impossibleSingularEnding.value = impossibleEnding;
        agreementError.value = hasAgreementError;
        auxiliaryError.value = detectedAuxiliaryError;
        pendingErrorLabels.value = attemptErrorLabels;
        pendingErrorDetails.value = attemptErrorDetails;
        nextTick(() => {
          answerInput.value?.focus();
          answerInput.value?.select();
        });
        return;
      }
      retryMessageVisible.value = false;
      futureSimpleConfusion.value = usedFutureSimple;
      conjugationConfusions.value = otherConjugations;
      impossibleSingularEnding.value = impossibleEnding;
      agreementError.value = hasAgreementError;
      auxiliaryError.value = detectedAuxiliaryError;
      feedback.value = result.isCorrect ? "correct" : "incorrect";
      if (result.isCorrect) track("answer_correct", exerciseAnalyticsMetadata.value);
      if (props.requireSuccess) attempts.value[currentIndex.value] = trackedAttempt;
      else attempts.value.push(trackedAttempt);
    }
    function showDemoCorrection() {
      if (feedback.value !== "idle") return;
      answer.value = currentQuestion.value?.reponses[0] ?? currentQuestion.value?.reponsesPourCorrige[0] ?? "";
      submitAnswer();
    }
    function showTourProgress() {
      stopSpeech();
      if (props.questions.length < 6) return;
      currentIndex.value = 5;
      answer.value = "";
      selectedIdentificationMode.value = "";
      lastIncorrectIdentificationAnswer.value = "";
      feedback.value = "idle";
      retryAlreadyOffered.value = false;
      answerHeardBeforeSubmission.value = false;
      retryMessageVisible.value = false;
      missingPronounMessageVisible.value = false;
      futureSimpleConfusion.value = false;
      conjugationConfusions.value = [];
      impossibleSingularEnding.value = null;
      agreementError.value = false;
      auxiliaryError.value = void 0;
      pendingErrorLabels.value = [];
      pendingErrorDetails.value = [];
      detectedErrorDetails.value = [];
      attempts.value = props.questions.slice(0, 5).map((question, index) => ({
        question,
        answer: index === 1 || index === 4 ? "réponse à revoir" : question.reponsesPourCorrige[0] ?? question.reponses[0] ?? "",
        status: index === 1 || index === 4 ? "incorrect" : "correct",
        attemptNumber: index === 3 ? 2 : 1
      }));
      nextTick(() => answerInput.value?.focus({ preventScroll: true }));
    }
    __expose({ showDemoCorrection, showTourProgress });
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="exercise-overlay" data-tour="classic-exercise"><section class="${ssrRenderClass([{ "exercise-dialog--falc": unref(falcMode) }, "exercise-dialog"])}" role="dialog" aria-modal="true"${ssrRenderAttr("aria-label", unref(falcMode) ? unref(ui)("Exercice de conjugaison") : void 0)}${ssrRenderAttr("aria-labelledby", unref(falcMode) ? void 0 : "exercise-title")} tabindex="-1"><header class="${ssrRenderClass([{ "exercise-header--falc": unref(falcMode) }, "exercise-header"])}">`);
        if (!unref(falcMode)) {
          _push2(`<div><p class="dialog-kicker">${ssrInterpolate(unref(ui)("Questionnaire"))}</p><h2 id="exercise-title">${ssrInterpolate(unref(isFinished) ? unref(ui)("Résultats") : unref(ui)("Question {current} sur {total}", { current: unref(displayedQuestionNumber), total: unref(displayedQuestionCount) }))}</h2></div>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`<div class="exercise-header__actions"><button class="dialog-close" type="button"${ssrRenderAttr("aria-label", unref(ui)("Quitter l’exercice"))}>×</button></div></header><div class="exercise-progress"${ssrRenderAttr("aria-label", unref(ui)("Progression du questionnaire"))}><!--[-->`);
        ssrRenderList(__props.questions, (_, index) => {
          _push2(`<span class="${ssrRenderClass({
            "is-current": !unref(isFinished) && index === unref(currentIndex),
            "is-correct": unref(attempts)[index]?.status === "correct" && unref(attempts)[index]?.attemptNumber !== 2,
            "is-correct-retry": unref(attempts)[index]?.status === "correct" && unref(attempts)[index]?.attemptNumber === 2,
            "is-incorrect": unref(attempts)[index]?.status === "incorrect"
          })}"></span>`);
        });
        _push2(`<!--]--></div>`);
        if (!unref(isFinished) && unref(currentQuestion)) {
          _push2(`<div class="exercise-question">`);
          if (__props.exerciseKind === "tense-identification" || __props.exerciseKind === "mode-identification") {
            _push2(`<p class="question-instruction">${ssrInterpolate(unref(currentQuestion).instruction)}</p>`);
          } else {
            _push2(`<!---->`);
          }
          if (unref(falcMode) && __props.exerciseKind === "conjugation") {
            _push2(`<!--[--><p class="falc-question-prompt">${ssrInterpolate(unref(falcQuestionPrompt))}</p><form class="falc-answer-form"><div class="${ssrRenderClass([{ "has-prefix": unref(providedAnswerPrefix) }, "prefixed-answer-control"])}">`);
            if (unref(providedAnswerPrefix)) {
              _push2(`<span class="prefixed-answer-control__prefix">${ssrInterpolate(unref(providedAnswerPrefix))}</span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<input id="exercise-answer"${ssrRenderAttr("value", unref(answer))} type="text" autocomplete="off"${ssrRenderAttr("placeholder", unref(currentSubjectMustBeTyped) ? unref(currentAnswerPlaceholder) : void 0)}${ssrRenderAttr("aria-label", unref(ui)("Forme conjuguée de {verb}", { verb: unref(currentQuestion).infinitif || "" }))}${ssrIncludeBooleanAttr(unref(feedback) !== "idle") ? " disabled" : ""} class="${ssrRenderClass({ "is-valid": unref(feedback) === "correct", "is-invalid": unref(feedback) === "incorrect", "is-being-read": unref(speakingKey) === "current-feedback" })}"${ssrRenderAttr("aria-invalid", unref(feedback) === "incorrect")}${ssrRenderAttr("aria-describedby", unref(feedback) !== "idle" ? "answer-feedback" : void 0)}></div>`);
            if (unref(feedback) === "idle") {
              _push2(`<button class="primary-button" type="submit"${ssrIncludeBooleanAttr(!unref(answer).trim()) ? " disabled" : ""}>${ssrInterpolate(unref(ui)("Vérifier"))}</button>`);
            } else {
              _push2(`<button class="primary-button" type="submit">${ssrInterpolate(unref(currentIndex) === __props.questions.length - 1 ? unref(ui)("Voir mes résultats") : unref(ui)("Question suivante"))}</button>`);
            }
            _push2(`</form><!--]-->`);
          } else if (__props.exerciseKind === "conjugation" && unref(currentQuestion).complement) {
            _push2(`<!--[--><p class="question-context"${ssrRenderAttr("aria-label", unref(ui)("Contexte grammatical"))}><span>Verbe : <strong>${ssrInterpolate(unref(currentQuestion).infinitif)}</strong></span><i aria-hidden="true">|</i><span>Mode : <strong>${ssrInterpolate(unref(currentQuestion).mode)}</strong></span><i aria-hidden="true">|</i><span>Temps : <strong>${ssrInterpolate(unref(currentQuestion).temps)}</strong></span>`);
            if (unref(currentQuestion).pronom) {
              _push2(`<!--[--><i aria-hidden="true">|</i><span>Personne : <strong>${ssrInterpolate(unref(currentQuestion).pronom)}</strong></span><!--]-->`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</p><form class="${ssrRenderClass([{ "is-awaiting-retry": unref(retryMessageVisible) || unref(missingPronounMessageVisible) }, "completion-form"])}"><label class="completion-form__label" for="exercise-answer">${ssrInterpolate(unref(ui)("Ta réponse"))}</label><div class="completion-sentence">`);
            if (unref(currentQuestion).complementPosition === "before") {
              _push2(`<span>${ssrInterpolate(unref(currentQuestion).complement)}</span>`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(currentQuestion).saisiePrefixe && !unref(currentSubjectMustBeTyped)) {
              _push2(`<span class="completion-sentence__prefix">${ssrInterpolate(unref(currentQuestion).saisiePrefixe)}</span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="${ssrRenderClass([{ "has-prefix": unref(providedAnswerPrefix) }, "prefixed-answer-control prefixed-answer-control--completion"])}">`);
            if (unref(providedAnswerPrefix)) {
              _push2(`<span class="prefixed-answer-control__prefix">${ssrInterpolate(unref(providedAnswerPrefix))}</span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<input id="exercise-answer"${ssrRenderAttr("value", unref(answer))} type="text" autocomplete="off"${ssrRenderAttr("placeholder", unref(currentSubjectMustBeTyped) ? unref(currentAnswerPlaceholder) : void 0)}${ssrRenderAttr("aria-label", unref(ui)("Forme conjuguée de {verb}", { verb: unref(currentQuestion).infinitif || "" }))}${ssrIncludeBooleanAttr(unref(feedback) !== "idle") ? " disabled" : ""} class="${ssrRenderClass({
              "is-valid": unref(feedback) === "correct",
              "is-invalid": unref(feedback) === "incorrect" || unref(retryMessageVisible),
              "is-being-read": unref(speakingKey) === "current-feedback"
            })}"${ssrRenderAttr("aria-invalid", unref(feedback) === "incorrect" || unref(retryMessageVisible))}${ssrRenderAttr("aria-describedby", unref(feedback) !== "idle" ? "answer-feedback" : unref(missingPronounMessageVisible) ? "answer-missing-pronoun" : unref(retryMessageVisible) ? "answer-retry" : void 0)}>`);
            if (unref(currentQuestion).complementPosition === "before") {
              _push2(`<span class="completion-sentence__terminal-mark">${ssrInterpolate(complementSentenceTerminalMark(unref(currentQuestion)))}</span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
            if (unref(currentQuestion).complementPosition !== "before") {
              _push2(`<span>${ssrInterpolate(unref(currentQuestion).complement)}${ssrInterpolate(complementSentenceTerminalMark(unref(currentQuestion)))}</span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
            if (unref(feedback) === "idle") {
              _push2(`<button class="primary-button" type="submit"${ssrIncludeBooleanAttr(!unref(answer).trim()) ? " disabled" : ""}>${ssrInterpolate(unref(ui)("Vérifier"))}</button>`);
            } else {
              _push2(`<button class="primary-button" type="submit">${ssrInterpolate(unref(currentIndex) === __props.questions.length - 1 ? unref(ui)("Voir mes résultats") : unref(ui)("Question suivante"))}</button>`);
            }
            _push2(`</form>`);
            if (unref(missingPronounMessageVisible)) {
              _push2(`<div id="answer-missing-pronoun" class="answer-retry answer-retry--missing-pronoun" role="status" aria-live="polite"><span class="answer-retry__icon" aria-hidden="true">i</span><div><strong>${ssrInterpolate(unref(ui)("Il manque le pronom"))}</strong></div></div>`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(retryMessageVisible)) {
              _push2(`<div id="answer-retry" class="answer-retry" role="status" aria-live="polite"><span class="answer-retry__icon" aria-hidden="true">↻</span><div><strong>${ssrInterpolate(unref(ui)("Pas encore. Essaie une deuxième fois."))}</strong></div></div>`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(retryMessageVisible) && unref(retryGuidanceMessages).length) {
              _push2(`<aside class="answer-retry-hint"><strong>${ssrInterpolate(unref(ui)("Un indice pour t’aider"))}</strong><!--[-->`);
              ssrRenderList(unref(retryGuidanceMessages), (message) => {
                _push2(`<p>${ssrInterpolate(message)}</p>`);
              });
              _push2(`<!--]--></aside>`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(retryMessageVisible) && unref(detectedErrorDetails).length) {
              _push2(ssrRenderComponent(LearnerErrorFeedback, { details: unref(detectedErrorDetails) }, null, _parent));
            } else {
              _push2(`<!---->`);
            }
            _push2(`<!--]-->`);
          } else if (unref(currentIdentificationFormParts)) {
            _push2(`<div class="literary-question"><p class="question-text"><span>${ssrInterpolate(unref(currentIdentificationFormParts).before)}</span><mark>${ssrInterpolate(unref(currentIdentificationFormParts).target)}</mark><span>${ssrInterpolate(unref(currentIdentificationFormParts).after)}</span></p>`);
            if (unref(currentQuestion).literaryCitation) {
              _push2(`<small>${ssrInterpolate(unref(currentQuestion).literaryCitation.author)}, <cite>${ssrInterpolate(unref(currentQuestion).literaryCitation.work)}</cite></small>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            _push2(`<p class="question-text">${ssrInterpolate(unref(currentQuestion).consigne)}</p>`);
          }
          if (__props.exerciseKind === "conjugation" && unref(currentQuestion).speech?.questionToken) {
            _push2(`<button class="question-speech-button" type="button"${ssrIncludeBooleanAttr(unref(audioLoadingKey) === "question") ? " disabled" : ""}${ssrRenderAttr("aria-label", unref(audioLoadingKey) === "question" ? unref(ui)("Chargement de l’audio…") : unref(speakingKey) === "question" ? unref(ui)("Arrêter la lecture") : unref(ui)("Écouter la question"))}${ssrRenderAttr("title", unref(audioLoadingKey) === "question" ? unref(ui)("Chargement de l’audio…") : unref(speakingKey) === "question" ? unref(ui)("Arrêter la lecture") : unref(ui)("Écouter la question"))}${ssrRenderAttr("aria-pressed", unref(speakingKey) === "question")}${ssrRenderAttr("aria-busy", unref(audioLoadingKey) === "question")}>`);
            _push2(ssrRenderComponent(unref(FontAwesomeIcon), {
              icon: unref(audioLoadingKey) === "question" ? unref(faSpinner) : unref(speakingKey) === "question" ? unref(faStop) : unref(faVolume),
              spin: unref(audioLoadingKey) === "question",
              "aria-hidden": "true"
            }, null, _parent));
            _push2(`</button>`);
          } else {
            _push2(`<!---->`);
          }
          if (unref(isIdentificationExercise)) {
            _push2(`<div class="classic-identification-choices">`);
            if (unref(isTenseIdentificationExercise) && unref(selectedIdentificationMode)) {
              _push2(`<div class="classic-tense-choice-step"><div class="classic-tense-choice-step__header"><button type="button"${ssrIncludeBooleanAttr(unref(feedback) !== "idle") ? " disabled" : ""}>← ${ssrInterpolate(unref(ui)("Modes"))}</button><strong>${ssrInterpolate(unref(ui)("Choisis le temps"))}</strong></div><div class="classic-tense-choices" role="group"${ssrRenderAttr("aria-label", unref(ui)("Choisis le temps"))}><!--[-->`);
              ssrRenderList(unref(selectedModeTenseRows), (row) => {
                _push2(`<div class="classic-tense-choice-row">`);
                if (row.simple) {
                  _push2(`<button type="button"${ssrIncludeBooleanAttr(unref(feedback) !== "idle") ? " disabled" : ""}>${ssrInterpolate(row.simple.label)}</button>`);
                } else {
                  _push2(`<span aria-hidden="true"></span>`);
                }
                if (row.compound) {
                  _push2(`<button type="button"${ssrIncludeBooleanAttr(unref(feedback) !== "idle") ? " disabled" : ""}>${ssrInterpolate(row.compound.label)}</button>`);
                } else {
                  _push2(`<span aria-hidden="true"></span>`);
                }
                _push2(`</div>`);
              });
              _push2(`<!--]--></div></div>`);
            } else {
              _push2(`<div class="classic-mode-choices" role="group"${ssrRenderAttr("aria-label", unref(ui)("Choisis le mode"))}><!--[-->`);
              ssrRenderList(unref(displayedModeChoices), (choice) => {
                _push2(`<button type="button"${ssrIncludeBooleanAttr(unref(feedback) !== "idle") ? " disabled" : ""}>${ssrInterpolate(choice.label)}</button>`);
              });
              _push2(`<!--]--></div>`);
            }
            _push2(`</div>`);
          } else {
            _push2(`<!---->`);
          }
          if (!unref(falcMode) && !(__props.exerciseKind === "conjugation" && unref(currentQuestion).complement)) {
            _push2(`<form class="${ssrRenderClass([{ "is-awaiting-retry": unref(retryMessageVisible) || unref(missingPronounMessageVisible) }, "answer-form"])}"><label for="exercise-answer">${ssrInterpolate(unref(ui)("Ta réponse"))}</label><div class="answer-form__row"><div class="${ssrRenderClass([{ "has-prefix": unref(providedAnswerPrefix) }, "prefixed-answer-control"])}">`);
            if (unref(providedAnswerPrefix)) {
              _push2(`<span class="prefixed-answer-control__prefix">${ssrInterpolate(unref(providedAnswerPrefix))}</span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<input id="exercise-answer"${ssrRenderAttr("value", unref(answer))} type="text" autocomplete="off"${ssrRenderAttr("placeholder", unref(currentSubjectMustBeTyped) ? unref(currentAnswerPlaceholder) : unref(answerPlaceholder))}${ssrIncludeBooleanAttr(unref(feedback) !== "idle") ? " disabled" : ""} class="${ssrRenderClass({
              "is-valid": unref(feedback) === "correct",
              "is-invalid": unref(feedback) === "incorrect" || unref(retryMessageVisible),
              "is-being-read": unref(speakingKey) === "current-feedback"
            })}"${ssrRenderAttr("aria-invalid", unref(feedback) === "incorrect" || unref(retryMessageVisible))}${ssrRenderAttr("aria-describedby", unref(feedback) !== "idle" ? "answer-feedback" : unref(missingPronounMessageVisible) ? "answer-missing-pronoun" : unref(retryMessageVisible) ? "answer-retry" : void 0)}></div>`);
            if (unref(feedback) === "idle") {
              _push2(`<button class="primary-button" type="submit"${ssrIncludeBooleanAttr(!unref(answer).trim()) ? " disabled" : ""}>${ssrInterpolate(unref(ui)("Vérifier"))}</button>`);
            } else {
              _push2(`<button class="primary-button" type="submit">${ssrInterpolate(unref(currentIndex) === __props.questions.length - 1 ? unref(ui)("Voir mes résultats") : unref(ui)("Question suivante"))}</button>`);
            }
            _push2(`</div></form>`);
          } else {
            _push2(`<!---->`);
          }
          if (__props.exerciseKind === "conjugation" && unref(currentQuestion).speech?.answerToken) {
            _push2(`<div class="answer-listen-row"><span>${ssrInterpolate(unref(ui)("Entendre la réponse"))}</span><button type="button"${ssrIncludeBooleanAttr(unref(audioLoadingKey) === "answer") ? " disabled" : ""}${ssrRenderAttr("aria-label", unref(audioLoadingKey) === "answer" ? unref(ui)("Chargement de l’audio…") : unref(speakingKey) === "answer" ? unref(ui)("Arrêter la lecture") : unref(ui)("Entendre la réponse"))}${ssrRenderAttr("title", unref(audioLoadingKey) === "answer" ? unref(ui)("Chargement de l’audio…") : unref(speakingKey) === "answer" ? unref(ui)("Arrêter la lecture") : unref(ui)("Entendre la réponse"))}${ssrRenderAttr("aria-pressed", unref(speakingKey) === "answer")}${ssrRenderAttr("aria-busy", unref(audioLoadingKey) === "answer")}>`);
            _push2(ssrRenderComponent(unref(FontAwesomeIcon), {
              icon: unref(audioLoadingKey) === "answer" ? unref(faSpinner) : unref(speakingKey) === "answer" ? unref(faStop) : unref(faCirclePlay),
              spin: unref(audioLoadingKey) === "answer",
              "aria-hidden": "true"
            }, null, _parent));
            _push2(`</button></div>`);
          } else {
            _push2(`<!---->`);
          }
          if (unref(audioError)) {
            _push2(`<p class="audio-error" role="status">${ssrInterpolate(unref(audioError))}</p>`);
          } else {
            _push2(`<!---->`);
          }
          if (unref(missingPronounMessageVisible) && !(__props.exerciseKind === "conjugation" && unref(currentQuestion).complement)) {
            _push2(`<div id="answer-missing-pronoun" class="answer-retry answer-retry--missing-pronoun" role="status" aria-live="polite"><span class="answer-retry__icon" aria-hidden="true">i</span><div><strong>${ssrInterpolate(unref(ui)("Il manque le pronom"))}</strong></div></div>`);
          } else {
            _push2(`<!---->`);
          }
          if (unref(retryMessageVisible) && !(__props.exerciseKind === "conjugation" && unref(currentQuestion).complement)) {
            _push2(`<div id="answer-retry" class="answer-retry" role="status" aria-live="polite"><span class="answer-retry__icon" aria-hidden="true">↻</span><div><strong>${ssrInterpolate(unref(ui)("Pas encore. Essaie une deuxième fois."))}</strong></div></div>`);
          } else {
            _push2(`<!---->`);
          }
          if (unref(retryMessageVisible) && unref(retryGuidanceMessages).length && !(__props.exerciseKind === "conjugation" && unref(currentQuestion).complement)) {
            _push2(`<aside class="answer-retry-hint"><strong>${ssrInterpolate(unref(ui)("Un indice pour t’aider"))}</strong><!--[-->`);
            ssrRenderList(unref(retryGuidanceMessages), (message) => {
              _push2(`<p>${ssrInterpolate(message)}</p>`);
            });
            _push2(`<!--]--></aside>`);
          } else {
            _push2(`<!---->`);
          }
          if (unref(retryMessageVisible) && unref(detectedErrorDetails).length && !(__props.exerciseKind === "conjugation" && unref(currentQuestion).complement)) {
            _push2(ssrRenderComponent(LearnerErrorFeedback, { details: unref(detectedErrorDetails) }, null, _parent));
          } else {
            _push2(`<!---->`);
          }
          if (unref(feedback) !== "idle") {
            _push2(`<div id="answer-feedback" data-tour="classic-correction" class="${ssrRenderClass([`answer-feedback--${unref(feedback)}`, "answer-feedback"])}" aria-live="polite">`);
            if (unref(falcMode)) {
              _push2(`<!--[-->`);
              if (unref(feedback) === "correct") {
                _push2(`<strong class="falc-feedback-correct"><span aria-hidden="true">✓</span> ${ssrInterpolate(unref(ui)("Juste !"))}</strong>`);
              } else {
                _push2(`<!--[--><strong>${ssrInterpolate(unref(ui)("Faux."))}</strong><p>${ssrInterpolate(unref(ui)("Bonne réponse :"))} <strong class="${ssrRenderClass({ "spoken-text-active": unref(speakingKey) === "current-feedback" })}">${ssrInterpolate(unref(correction))}</strong></p><!--]-->`);
              }
              _push2(`<!--]-->`);
            } else {
              _push2(`<!--[--><strong>${ssrInterpolate(unref(feedback) === "correct" ? unref(ui)("Bravo, c’est juste !") : unref(ui)("Pas tout à fait."))}</strong>`);
              if (unref(feedback) === "incorrect") {
                _push2(`<p>${ssrInterpolate(unref(ui)("La réponse attendue était :"))} <strong class="${ssrRenderClass({ "spoken-text-active": unref(speakingKey) === "current-feedback" })}">${ssrInterpolate(unref(correction))}</strong>${ssrInterpolate(unref(correctionPunctuation))}</p>`);
              } else if (unref(alternativeCorrections).length) {
                _push2(`<p>${ssrInterpolate(unref(ui)("On peut aussi répondre :"))} <strong>${ssrInterpolate(unref(alternativeText))}</strong>${ssrInterpolate(unref(alternativePunctuation))}</p>`);
              } else {
                _push2(`<p>${ssrInterpolate(unref(ui)("Tu peux passer à la question suivante."))}</p>`);
              }
              _push2(`<!--]-->`);
            }
            if (!unref(falcMode) && unref(detectedErrorDetails).length) {
              _push2(ssrRenderComponent(LearnerErrorFeedback, { details: unref(detectedErrorDetails) }, null, _parent));
            } else {
              _push2(`<!---->`);
            }
            if (!unref(falcMode) && unref(futureSimpleConfusion)) {
              _push2(`<aside class="grammar-reminder"><strong>${ssrInterpolate(unref(ui)("Futur proche ou futur simple ?"))}</strong><p>${ssrInterpolate(unref(ui)("Ta conjugaison est correcte au futur simple, mais la question demande le futur proche. Au futur simple, le verbe est conjugué en un seul mot (« tu mangeras »). Au futur proche, on utilise « aller » au présent suivi de l’infinitif (« tu vas manger »)."))}</p></aside>`);
            } else if (!unref(falcMode) && unref(conjugationConfusionText)) {
              _push2(`<aside class="grammar-reminder"><strong>${ssrInterpolate(unref(ui)("Attention au temps et au mode"))}</strong><p>${ssrInterpolate(unref(conjugationConfusionText))}</p></aside>`);
            } else {
              _push2(`<!---->`);
            }
            if (!unref(falcMode) && unref(impossibleSingularEndingText)) {
              _push2(`<aside class="grammar-reminder"><strong>${ssrInterpolate(unref(ui)("Attention à la personne"))}</strong><p>${ssrInterpolate(unref(impossibleSingularEndingText))}</p></aside>`);
            } else {
              _push2(`<!---->`);
            }
            if (!unref(falcMode) && unref(auxiliaryErrorText)) {
              _push2(`<aside class="grammar-reminder"><strong>${ssrInterpolate(unref(ui)("Attention à l’auxiliaire"))}</strong><p>${ssrInterpolate(unref(auxiliaryErrorText))}</p></aside>`);
            } else {
              _push2(`<!---->`);
            }
            if (!unref(falcMode) && (unref(agreementReminder) || unref(agreementError))) {
              _push2(`<aside class="grammar-reminder"><strong>${ssrInterpolate(unref(ui)("Rappel de la règle"))}</strong><p>${ssrInterpolate(unref(agreementExplanation))}</p><small>${ssrInterpolate(unref(agreementRecognition))}</small></aside>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div>`);
        } else {
          _push2(`<div class="exercise-results"><div class="results-hero"><p>${ssrInterpolate(unref(titleMessage))}</p><strong>${ssrInterpolate(unref(scorePercent))}%</strong><span>${ssrInterpolate(unref(ui)(unref(correctCount) > 1 ? "{correct} bonnes réponses sur {total}" : "{correct} bonne réponse sur {total}", { correct: unref(correctCount), total: unref(attempts).length }))}</span></div><div class="results-table-wrap"><table class="results-table"><caption>${ssrInterpolate(unref(ui)("Récapitulatif des réponses"))}</caption><thead><tr><th scope="col">${ssrInterpolate(unref(ui)("Question"))}</th><th scope="col">${ssrInterpolate(unref(ui)("Ta réponse"))}</th><th scope="col">${ssrInterpolate(unref(ui)("Correction"))}</th><th scope="col">${ssrInterpolate(unref(ui)("Résultat"))}</th></tr></thead><tbody><!--[-->`);
          ssrRenderList(unref(attempts), (attempt, index) => {
            _push2(`<tr><td>`);
            if (unref(incorrectSummaryForms)[index]) {
              _push2(`<blockquote class="result-identification-citation"><p><span>${ssrInterpolate(unref(incorrectSummaryForms)[index]?.before)}</span><mark>${ssrInterpolate(unref(incorrectSummaryForms)[index]?.target)}</mark><span>${ssrInterpolate(unref(incorrectSummaryForms)[index]?.after)}</span></p>`);
              if (attempt.question.literaryCitation) {
                _push2(`<footer>${ssrInterpolate(attempt.question.literaryCitation.author)}, <cite>${ssrInterpolate(attempt.question.literaryCitation.work)}</cite></footer>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</blockquote>`);
            } else {
              _push2(`<span>${ssrInterpolate(attempt.question.consigne)}</span>`);
            }
            if (attempt.errorDetails?.length) {
              _push2(ssrRenderComponent(LearnerErrorFeedback, {
                details: attempt.errorDetails,
                compact: ""
              }, null, _parent));
            } else {
              _push2(`<!---->`);
            }
            if (attempt.question.verbeId) {
              _push2(`<button type="button" class="result-consult-verb">${ssrInterpolate(unref(ui)("Consulter le verbe"))}</button>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</td><td>${ssrInterpolate(attempt.answer)}</td><td><div class="result-spoken-answers"><!--[-->`);
            ssrRenderList(attempt.question.reponsesPourCorrige.length ? attempt.question.reponsesPourCorrige : attempt.question.reponses, (expectedAnswer) => {
              _push2(`<div>${ssrInterpolate(displayedCorrectionAnswer(attempt.question, expectedAnswer))}</div>`);
            });
            _push2(`<!--]--></div></td><td><span class="${ssrRenderClass({
              "result-heard": attempt.answerWasHeard,
              "result-good": !attempt.answerWasHeard && attempt.status === "correct" && attempt.attemptNumber !== 2,
              "result-good--retry": !attempt.answerWasHeard && attempt.status === "correct" && attempt.attemptNumber === 2,
              "result-bad": !attempt.answerWasHeard && attempt.status === "incorrect"
            })}"${ssrRenderAttr("aria-label", attempt.answerWasHeard ? unref(ui)("Réponse entendue") : attempt.status === "correct" && attempt.attemptNumber === 2 ? unref(ui)("Juste au deuxième essai") : void 0)}>${ssrInterpolate(attempt.answerWasHeard ? unref(ui)("Réponse entendue") : attempt.status === "correct" ? unref(ui)("Juste") : unref(ui)("À revoir"))}</span></td></tr>`);
          });
          _push2(`<!--]--></tbody></table></div><div class="dialog-actions exercise-results__actions">`);
          if (!unref(falcMode)) {
            _push2(`<button class="secondary-button exercise-result-action" type="button"><span aria-hidden="true">`);
            _push2(ssrRenderComponent(unref(FontAwesomeIcon), { icon: unref(faArrowUpFromBracket) }, null, _parent));
            _push2(`</span>${ssrInterpolate(unref(ui)("Partager mon bilan"))}</button>`);
          } else {
            _push2(`<!---->`);
          }
          if (!unref(falcMode)) {
            _push2(`<button class="secondary-button exercise-result-action" type="button"><span aria-hidden="true">`);
            _push2(ssrRenderComponent(unref(FontAwesomeIcon), { icon: unref(faPrint) }, null, _parent));
            _push2(`</span>${ssrInterpolate(unref(ui)("Imprimer mon bilan"))}</button>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<button class="primary-button exercise-result-action" type="button"><span aria-hidden="true">↻</span>${ssrInterpolate(unref(ui)("Recommencer"))}</button><button class="secondary-button exercise-results__close" type="button">${ssrInterpolate(unref(ui)("Fermer"))}</button></div></div>`);
        }
        if (unref(closeConfirmationOpen)) {
          _push2(`<div class="exercise-close-confirmation"><section role="alertdialog" aria-modal="true"${ssrRenderAttr("aria-label", unref(ui)("Quitter l’exercice"))}><div class="exercise-close-confirmation__actions"><button class="secondary-button" type="button">${ssrInterpolate(unref(ui)("Continuer l’exercice"))}</button><button class="primary-button exercise-close-confirmation__leave" type="button">${ssrInterpolate(unref(ui)("Quitter"))}</button></div></section></div>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`</section>`);
        if (unref(printSummaryOpen) && unref(printSummaryComponent)) {
          ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(unref(printSummaryComponent)), {
            items: unref(summaryItems),
            score: unref(scorePercent),
            "correct-count": unref(correctCount),
            verbs: unref(summaryVerbs),
            tenses: unref(summaryTenses),
            onClose: ($event) => printSummaryOpen.value = false
          }, null), _parent);
        } else {
          _push2(`<!---->`);
        }
        if (unref(shareSummaryOpen)) {
          _push2(ssrRenderComponent(ShareExerciseSummaryDialog, {
            presentation: "classic",
            items: unref(summaryItems),
            verbs: unref(summaryVerbs),
            tenses: unref(summaryTenses),
            onClose: ($event) => shareSummaryOpen.value = false
          }, null, _parent));
        } else {
          _push2(`<!---->`);
        }
        if (unref(consultationVerbId) !== null) {
          _push2(ssrRenderComponent(VerbConsultationModal, {
            "verb-id": unref(consultationVerbId),
            onClose: closeVerbConsultation
          }, null, _parent));
        } else {
          _push2(`<!---->`);
        }
        _push2(`</div>`);
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/exercise/ClassicExercise.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ClassicExercise = Object.assign(_sfc_main, { __name: "ExerciseClassicExercise" });

export { ClassicExercise as default };
//# sourceMappingURL=ClassicExercise-DJ4RGSNc.mjs.map
