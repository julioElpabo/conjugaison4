import { w as withoutIndicativeMode, l as literaryIdentificationCoachHelpBlocks, v as visibleCoachHelpBlocks, d as areOnlyIndicativeTenses, e as localizedCoachVerbDefinition, c as coachHelpQuestionVariables, s as sanitizeCoachHtml, _ as __nuxt_component_0 } from './CoachHelpPanel-BQDuZYVI.mjs';
import { defineComponent, computed, ref, shallowRef, watch, markRaw, useTemplateRef, unref, createVNode, resolveDynamicComponent, nextTick, useSSRContext } from 'vue';
import { ssrRenderTeleport, ssrRenderStyle, ssrRenderClass, ssrRenderAttr, ssrInterpolate, ssrRenderList, ssrRenderComponent, ssrIncludeBooleanAttr, ssrRenderVNode } from 'vue/server-renderer';
import { faStop, faBullhorn, faSpinner, faVolume, faArrowUpFromBracket, faPrint } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { L as LearnerErrorFeedback, S as ShareExerciseSummaryDialog, V as VerbConsultationModal } from './VerbConsultationModal-BGVa9ALM.mjs';
import { aJ as SUBJECT_PRONOUN_PLACEHOLDER, as as conjugationRequiresSubjectPronoun, au as providedSubjunctiveInputPrefix, at as conjugationAnswerPlaceholder, a6 as learnerErrorDetailText } from '../nitro/nitro.mjs';
import { a as createVariedCoachReaction, b as createCoachDialogueState } from '../_/coach-dialogue.mjs';
import { d as buildTargetedConjugationHelp } from '../_/coach-help-audit.mjs';
import { i as identificationFormParts } from '../_/identification-form.mjs';
import { g as useLanguagePreferences } from './server.mjs';
import { u as useSiteAnalytics } from './useSiteAnalytics-Dqt6jAGm.mjs';
import { u as useLearnerProgress } from './main-mlnFKERp.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import '../_/coach.mjs';
import '../_/near-future.mjs';
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
import './useLearnerAuth-CauYcSRJ.mjs';

const AUDIO_READING_ENABLED = false;

const CHAT_BUBBLE_DELAY_MS = 1e3;
const CHAT_INCORRECT_DELAY_MS = 3e3;
const INCORRECT_REACTION_EVENTS = /* @__PURE__ */ new Set(["incorrect", "cod-before", "cod-after", "coi", "encouragement"]);
function chatReactionAllowsMedia(eventType, cooledDown, hasIncorrectMedia) {
  if (!cooledDown || eventType === "encouragement") return false;
  return !INCORRECT_REACTION_EVENTS.has(eventType) || hasIncorrectMedia;
}
function chatMessageHasVisibleContent(message) {
  var _a, _b, _c;
  return Boolean(
    ((_a = message.text) == null ? void 0 : _a.trim()) || message.media || message.answerComparison || message.literaryCitation || message.identificationForm || ((_b = message.spokenAnswer) == null ? void 0 : _b.trim()) || ((_c = message.errorDetails) == null ? void 0 : _c.length)
  );
}

const SIMPLE_TENSE_BLANK = "________________________";
const SUBJECT_PRONOUN_BLANK = SUBJECT_PRONOUN_PLACEHOLDER;
const COMPOUND_TENSE_GAP = "\xA0".repeat(8);
function sentenceCase(value) {
  return value ? `${value.charAt(0).toLocaleUpperCase("fr")}${value.slice(1)}` : value;
}
function normalized(value) {
  return (value || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLocaleLowerCase("fr-CH");
}
function subjunctiveLead(tense) {
  const pastContext = ["imparfait", "plus-que-parfait"].includes(normalized(tense));
  return pastContext ? "Il fallait" : "Il faut";
}
function startsWithVowelSound(value) {
  return /^[aeiouyhéèêëîïôöùûü]|^on\b/iu.test(value.trim());
}
function subjunctiveSubject(question) {
  var _a;
  const pronoun = ((_a = question.pronom) == null ? void 0 : _a.trim()) || "";
  const lead = subjunctiveLead(question.temps);
  if (!pronoun) return `${lead} que`;
  return startsWithVowelSound(pronoun) ? `${lead} qu'${pronoun}` : `${lead} que ${pronoun}`;
}
function contextualizeSubjunctiveTemplate(template, question) {
  var _a;
  const pronoun = ((_a = question.pronom) == null ? void 0 : _a.trim()) || "";
  const contextualSubject = subjunctiveSubject(question);
  if (!pronoun) return `${contextualSubject} ${template}`;
  const lowerTemplate = template.toLocaleLowerCase("fr-CH");
  const candidates = [`que ${pronoun}`, `qu'${pronoun}`, `qu\u2019${pronoun}`, pronoun].sort((left, right) => right.length - left.length);
  const matchedPrefix = candidates.find((candidate) => lowerTemplate.startsWith(candidate.toLocaleLowerCase("fr-CH")));
  return matchedPrefix ? `${contextualSubject}${template.slice(matchedPrefix.length)}` : `${subjunctiveLead(question.temps)} que ${template}`;
}
function expectedAnswerWordCount(question) {
  var _a, _b, _c;
  const displayedForm = (_a = question.conjugaison1) == null ? void 0 : _a.trim();
  if (displayedForm) return displayedForm.split(/\s+/u).length;
  const mode = ((_b = question.mode) == null ? void 0 : _b.trim().toLocaleLowerCase("fr-CH")) || "";
  const tense = ((_c = question.temps) == null ? void 0 : _c.trim().toLocaleLowerCase("fr-CH")) || "";
  if (mode === "g\xE9rondif") return tense === "pass\xE9" ? 3 : 2;
  return question.isCompound ? 2 : 1;
}
function answerBlank(wordCount) {
  if (wordCount <= 1) return SIMPLE_TENSE_BLANK;
  return Array.from({ length: wordCount }, (_, index) => index === wordCount - 1 ? "_______________________" : "____________").join(COMPOUND_TENSE_GAP);
}
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
function templateWithInputPrefix(template, question) {
  var _a, _b;
  const pronoun = ((_a = question.pronom) == null ? void 0 : _a.trim()) || "";
  const inputPrefix = ((_b = question.saisiePrefixe) == null ? void 0 : _b.trim()) || "";
  if (!pronoun || !inputPrefix || normalized(pronoun) === normalized(inputPrefix)) return template;
  return template.replace(
    new RegExp(`^${escapeRegExp(pronoun)}(?=\\s|\u2026|\\.)`, "iu"),
    inputPrefix
  );
}
function withMaskedSubject(sentence, question) {
  var _a, _b;
  if (normalized(question.mode) === "imperatif") return sentence;
  const pronoun = ((_a = question.pronom) == null ? void 0 : _a.trim()) || "";
  const candidates = [
    (_b = question.saisiePrefixe) == null ? void 0 : _b.trim(),
    pronoun && startsWithVowelSound(pronoun) ? `qu'${pronoun}` : pronoun ? `que ${pronoun}` : "",
    pronoun
  ].filter((value) => Boolean(value)).sort((left, right) => right.length - left.length);
  for (const candidate of candidates) {
    const pattern = new RegExp(escapeRegExp(candidate).replace(/[’']/gu, "[\u2019']"), "giu");
    const matches = [...sentence.matchAll(pattern)];
    const match = matches.at(-1);
    if (!match || match.index === void 0) continue;
    const replacement = /^(?:que\s+|qu['’])/iu.test(candidate) ? `que ${SUBJECT_PRONOUN_BLANK}` : SUBJECT_PRONOUN_BLANK;
    return `${sentence.slice(0, match.index)}${replacement}${sentence.slice(match.index + match[0].length)}`;
  }
  return sentence;
}
function coachQuestionBubbles(question, options = {}) {
  var _a, _b;
  const sentenceTemplate = templateWithInputPrefix(
    ((_a = question.consigne.split("|")[0]) == null ? void 0 : _a.trim()) || "",
    question
  );
  const formulaPronoun = question.pronom;
  const answerPronoun = normalized(question.mode) === "imperatif" ? "" : (_b = question.saisiePrefixe) != null ? _b : question.pronom;
  const modeAndTense = [options.omitIndicativeMode ? "" : question.mode, question.temps].filter(Boolean).join(" ");
  const formula = [formulaPronoun, question.infinitif, modeAndTense].filter(Boolean).join(" | ");
  if (!formula) return { formula: question.consigne };
  const answerWordCount = expectedAnswerWordCount(question);
  const blank = answerBlank(answerWordCount);
  const hasBlank = /(?:…|\.{3,})/u.test(sentenceTemplate);
  const normalizedSentenceTemplate = sentenceTemplate.replace(/\s+/gu, " ").trim();
  const blankPrefix = answerPronoun ? COMPOUND_TENSE_GAP : "";
  let sentence = hasBlank ? normalizedSentenceTemplate.replace(/\s*(?:…|\.{3,})/gu, `${blankPrefix}${blank}`).trimStart() : `${answerPronoun || ""}${blankPrefix}${blank}`.trimStart();
  if (normalized(question.mode) === "subjonctif") {
    const alreadyContextualizedRelative = question.complementPosition === "before" && /^(?:c['’]est|ce sont)\b/iu.test(sentence);
    sentence = alreadyContextualizedRelative ? sentence : hasBlank ? contextualizeSubjunctiveTemplate(sentence, question) : `${subjunctiveSubject(question)}${blankPrefix}${blank}`;
  }
  sentence = withMaskedSubject(sentence, question);
  return {
    formula: options.omitIndicativeMode ? withoutIndicativeMode(formula) : formula,
    sentence: sentenceCase(sentence)
  };
}

const CHAT_HELP_REMINDER_DELAY_MS = 3e4;

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ChatExercise",
  __ssrInlineRender: true,
  props: {
    questions: {},
    exerciseKind: {},
    coach: {},
    verbs: {},
    tenses: {},
    identificationTenses: {},
    regenerateQuestions: { type: Function },
    tourDemo: { type: Boolean },
    trackingContext: {},
    learningSupportMode: {},
    requireSuccess: { type: Boolean },
    analyticsMetadata: {}
  },
  emits: ["close", "changeCoach"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const { interfaceLocale, ui, uiLabel } = useLanguagePreferences();
    const props = __props;
    const audioReadingEnabled = AUDIO_READING_ENABLED;
    const coachMessageAudioEnabled = computed(() => props.learningSupportMode === "cif-fle" || props.trackingContext?.challenge.learningSupportMode === "cif-fle");
    const restartCoachMessage = computed(() => ({
      id: -1,
      author: "coach",
      text: ui("Tu veux refaire ce défi ?")
    }));
    const emit = __emit;
    const { track } = useSiteAnalytics();
    useLearnerProgress();
    const exerciseAnalyticsMetadata = computed(() => ({
      ...props.analyticsMetadata,
      presentation: "chat",
      exerciseKind: props.exerciseKind || props.trackingContext?.challenge.exerciseKind || "conjugation",
      coach: props.coach.id
    }));
    function changeCoachFromHelp(coach) {
      track("coach_selected", { coach: coach.id, previousCoach: props.coach.id, source: "help_recommendation" });
      emit("changeCoach", coach);
    }
    const activeExerciseKind = computed(() => props.exerciseKind || props.trackingContext?.challenge.exerciseKind);
    const isModeIdentificationExercise = computed(() => activeExerciseKind.value === "mode-identification");
    const isIdentificationExercise = computed(() => activeExerciseKind.value === "tense-identification" || isModeIdentificationExercise.value);
    const isSmallScreen = ref(false);
    const modeAnswerChoices = computed(() => [
      { value: "indicatif", label: ui("Indicatif") },
      { value: "impératif", label: ui("Impératif") },
      { value: "subjonctif", label: ui("Subjonctif") },
      { value: "conditionnel", label: ui("Conditionnel") },
      { value: "infinitif", label: ui("Infinitif") }
    ]);
    const chatAnswerPlaceholder = computed(() => isSmallScreen.value ? ui("Écris ta réponse") : isModeIdentificationExercise.value ? ui("Écris ta réponse ou clique directement sur le mode correct") : activeExerciseKind.value === "tense-identification" ? ui("Écris ta réponse ou clique directement sur le mode puis sur le temps correct") : helpOpen.value ? ui("Écris ta réponse…") : ui("Écris ta réponse ou « Aide »…"));
    function coachColorHue(hexColor) {
      const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/iu.exec(hexColor.trim());
      if (!match) return 195;
      const [red, green, blue] = match.slice(1).map((value) => Number.parseInt(value, 16) / 255);
      const maximum = Math.max(red, green, blue);
      const minimum = Math.min(red, green, blue);
      const delta = maximum - minimum;
      if (delta === 0) return 195;
      const hue = maximum === red ? (green - blue) / delta % 6 : maximum === green ? (blue - red) / delta + 2 : (red - green) / delta + 4;
      return Math.round((hue * 60 + 360) % 360);
    }
    const coachChatStyle = computed(() => {
      const hue = coachColorHue(props.coach.themeColor);
      return {
        "--coach-color": props.coach.themeColor,
        "--coach-message-bg": `hsl(${hue} 62% 89%)`,
        "--coach-message-border": `hsl(${hue} 50% 76%)`,
        "--coach-message-text": `hsl(${hue} 38% 24%)`,
        "--coach-instruction-accent": `hsl(${hue} 58% 43%)`
      };
    });
    const currentIndex = ref(0);
    const answer = ref("");
    const selectedIdentificationMode = ref("");
    const attempts = ref([]);
    ref([]);
    ref([]);
    const messages = ref([]);
    const visibleMessages = computed(() => messages.value.filter(chatMessageHasVisibleContent));
    const waitingForNext = ref(false);
    ref(CHAT_INCORRECT_DELAY_MS);
    const deliveringFeedback = ref(false);
    const posingQuestion = ref(false);
    const consecutiveCorrectCount = ref(0);
    ref(0);
    ref(false);
    const speechSupported = ref(false);
    const speakingMessageId = ref(null);
    const coachAudioLoadingMessageId = ref(null);
    const coachAudioPlayingMessageId = ref(null);
    const coachAudioErrorMessageId = ref(null);
    const finished = ref(false);
    const finalSummaryPreparing = ref(false);
    const finalSummaryVisible = ref(false);
    const regeneratingQuestions = ref(false);
    ref(false);
    const restartError = ref("");
    const printSummaryOpen = ref(false);
    const printSummaryComponent = shallowRef(null);
    watch(printSummaryOpen, async (open) => {
      if (!open || printSummaryComponent.value) return;
      printSummaryComponent.value = markRaw((await import('./ExerciseSummaryPrintPreview-A9PvqulM.mjs')).default);
    });
    const shareSummaryOpen = ref(false);
    const closeConfirmationOpen = ref(false);
    const consultationVerbId = ref(null);
    const helpOpen = ref(Boolean(props.tourDemo));
    const helpQuestionIndex = ref(null);
    const helpConsultationOfferedQuestions = /* @__PURE__ */ new Set();
    const tourDemoReady = ref(!props.tourDemo);
    const sequence = ref(0);
    const lastMediaQuestion = ref(-100);
    const allowMotion = ref(true);
    const chatSessionId = ref("");
    const exerciseRunId = ref("");
    const input = useTemplateRef("chat-answer");
    useTemplateRef("keep-chat-button");
    const thread = useTemplateRef("chat-thread");
    useTemplateRef("chat-summary");
    useTemplateRef("chat-dialogs");
    let coachQueue = Promise.resolve();
    let lastCoachBubbleAt = 0;
    let dialogueState = createCoachDialogueState();
    let helpReminderTimer = null;
    const currentQuestion = computed(() => props.questions[currentIndex.value]);
    const currentSubjectMustBeTyped = computed(() => Boolean(
      currentQuestion.value && !isIdentificationExercise.value && conjugationRequiresSubjectPronoun(currentQuestion.value)
    ));
    const providedAnswerPrefix = computed(() => currentQuestion.value && !isIdentificationExercise.value ? providedSubjunctiveInputPrefix(currentQuestion.value) : "");
    const currentAnswerPlaceholder = computed(() => currentQuestion.value ? conjugationAnswerPlaceholder(currentQuestion.value) : "");
    const questionNumberOffset = computed(() => props.trackingContext?.questionIndexOffset || 0);
    const displayedQuestionNumber = computed(() => questionNumberOffset.value + currentIndex.value + 1);
    const displayedQuestionCount = computed(() => questionNumberOffset.value ? props.trackingContext?.challenge.questionCount || props.questions.length : props.questions.length);
    const helpQuestion = computed(() => props.questions[helpQuestionIndex.value ?? currentIndex.value]);
    const helpVerb = computed(() => {
      const question = helpQuestion.value;
      if (!question) return void 0;
      return props.verbs.find((verb) => verb.id === question.verbeId) || props.verbs.find((verb) => normalizedInfinitive(verb.infinitif) === normalizedInfinitive(question.infinitif));
    });
    const helpConsultVerbId = computed(() => helpQuestion.value?.verbeId ?? helpVerb.value?.id);
    const helpConsultVerbLabel = computed(() => helpQuestion.value?.infinitif || helpVerb.value?.infinitif || "");
    const helpTense = computed(() => {
      const question = helpQuestion.value;
      if (!question) return void 0;
      return props.tenses.find((tense) => tense.id === question.tenseId) || props.tenses.find((tense) => normalizedInfinitive(tense.name) === normalizedInfinitive(question.temps));
    });
    const usesIdentificationHelp = computed(() => isIdentificationExercise.value);
    const usesAllophoneHelp = computed(() => props.coach.helpApproach === "allophone" && !usesIdentificationHelp.value);
    computed(() => props.coach.helpApproach === "complete" || props.coach.helpApproach === "complete-avec-reponses");
    const usesDelayedAnswerAudio = computed(() => props.coach.helpApproach === "tres-condensee");
    const targetedHelp = computed(() => helpQuestion.value ? buildTargetedConjugationHelp(helpQuestion.value, helpVerb.value, helpTense.value, {
      tense: uiLabel(helpQuestion.value.temps || helpTense.value?.name),
      mode: uiLabel(helpQuestion.value.mode || helpTense.value?.mode?.name)
    }) : null);
    const helpBlocks = computed(() => usesIdentificationHelp.value ? literaryIdentificationCoachHelpBlocks() : visibleCoachHelpBlocks(props.coach.helpApproach, helpQuestion.value));
    const correctCount = computed(() => attempts.value.filter((item) => item.status === "correct" && !item.answerWasHeard).length);
    const score = computed(() => attempts.value.length ? Math.round(correctCount.value / attempts.value.length * 100) : 0);
    const omitIndicativeMode = computed(() => areOnlyIndicativeTenses(props.tenses));
    const attemptSummaries = computed(() => attempts.value.map((attempt, index) => {
      const bubbles = coachQuestionBubbles(attempt.question, {
        omitIndicativeMode: omitIndicativeMode.value
      });
      const formula = omitIndicativeMode.value ? withoutIndicativeMode(bubbles.formula) : bubbles.formula;
      return {
        index: index + 1,
        questionIndex: index,
        status: attempt.status,
        answerWasHeard: attempt.answerWasHeard,
        questionLabel: formula,
        learnerAnswer: attempt.answer,
        expectedAnswer: attempt.question.reponsesPourCorrige.join(` ${ui("ou")} `) || attempt.question.reponses.join(` ${ui("ou")} `),
        errorLabels: attempt.errorLabels || [],
        errorDetails: attempt.errorDetails || [],
        verbId: attempt.question.verbeId,
        verbLabel: attempt.question.infinitif,
        identificationForm: isIdentificationExercise.value && attempt.status === "incorrect" ? identificationFormParts(attempt.question) : null,
        literaryCitation: attempt.question.literaryCitation
      };
    }));
    const hasIncorrectMedia = computed(() => props.coach.assignments.some((assignment) => assignment.isActive && assignment.eventType === "incorrect" && props.coach.media.some((item) => item.id === assignment.mediaId && item.isActive && item.category === "encouragement" && (item.mediaType === "animation" || item.mediaType === "emoji"))));
    function normalizedInfinitive(value) {
      return (value || "").normalize("NFD").replace(new RegExp("\\p{Diacritic}", "gu"), "").trim().toLocaleLowerCase("fr");
    }
    function coachMessageSpeechText(message) {
      if (message.errorDetails?.length) {
        return message.errorDetails.map((detail) => learnerErrorDetailText(detail, interfaceLocale.value)).join(" ");
      }
      if (message.literaryCitation) {
        const citation = message.literaryCitation;
        return `${citation.before}${citation.target}${citation.after}. ${citation.author}, ${citation.work}.`;
      }
      if (message.identificationForm) {
        return `${message.identificationForm.before}${message.identificationForm.target}${message.identificationForm.after}`;
      }
      if (message.answerComparison) {
        const introduction = message.answerComparison.mode === "focused" ? ui("Regarde où ça change :") : ui("Repars de la correction complète :");
        return `${introduction} ${ui("Correction")} : ${message.answerComparison.expectedAnswer}`;
      }
      return message.text || message.media?.altText || "";
    }
    function coachMessageCanBeRead(message) {
      if (message.author !== "coach" || message.mobileHelpHint || message.speechOnly) return false;
      if (message.answerLine) return Boolean(message.speechToken);
      return Boolean(message.speechToken || coachMessageSpeechText(message).trim());
    }
    function answerLineParts(value) {
      return value.split(/(_{2,})/gu).filter(Boolean).map((text) => ({
        text,
        isLine: /^_{2,}$/u.test(text)
      }));
    }
    function openVerbConsultation(id) {
      consultationVerbId.value = id;
      track("chat_conjugation_opened", exerciseAnalyticsMetadata.value);
    }
    const helpScrollTracked = ref(false);
    function trackHelpScroll() {
      if (helpScrollTracked.value) return;
      helpScrollTracked.value = true;
      track("help_scrolled", exerciseAnalyticsMetadata.value);
    }
    function closeVerbConsultation() {
      consultationVerbId.value = null;
    }
    const displayedIdentificationModeChoices = computed(() => modeAnswerChoices.value);
    const selectedModeTenses = computed(() => {
      const tenses = /* @__PURE__ */ new Map();
      for (const tense of props.identificationTenses?.length ? props.identificationTenses : props.tenses) {
        if (normalizedInfinitive(tense.mode?.name) !== normalizedInfinitive(selectedIdentificationMode.value)) continue;
        const key = normalizedInfinitive(tense.name);
        if (key === "futur proche") continue;
        if (!tenses.has(key)) tenses.set(key, {
          ...tense
        });
      }
      return [...tenses.values()];
    });
    const selectedModeTenseRows = computed(() => pairChatTenseChoices(
      selectedIdentificationMode.value,
      selectedModeTenses.value
    ));
    function pairChatTenseChoices(mode, choices) {
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
      const byName = new Map(choices.map((choice) => [normalizedInfinitive(choice.name), choice]));
      const used = /* @__PURE__ */ new Set();
      const rows = [];
      for (const [simpleName, compoundName] of pairsByMode[normalizedInfinitive(mode)] || []) {
        const simple = simpleName ? byName.get(simpleName) || null : null;
        const compound = compoundName ? byName.get(compoundName) || null : null;
        if (!simple && !compound) continue;
        if (simpleName && simple) used.add(simpleName);
        if (compoundName && compound) used.add(compoundName);
        rows.push({ key: `${simpleName || "empty"}:${compoundName || "empty"}`, simple, compound });
      }
      for (const choice of choices) {
        const key = normalizedInfinitive(choice.name);
        if (used.has(key)) continue;
        rows.push({
          key,
          simple: choice.isCompound ? null : choice,
          compound: choice.isCompound ? choice : null
        });
      }
      return rows;
    }
    function compactVerb(verb) {
      return {
        id: verb.id,
        infinitif: verb.infinitif,
        meaning: verb.meaning,
        auxiliaire: verb.auxiliaire,
        participePasse: verb.participePasse,
        groupeConjugaison: verb.groupeConjugaison,
        familleConjugaison: verb.familleConjugaison,
        particularites: verb.particularites
      };
    }
    function compactTense(tense) {
      return {
        id: tense.id,
        name: tense.name,
        code: tense.code,
        modeId: tense.modeId,
        mode: tense.mode,
        isCompound: tense.isCompound,
        selected: tense.selected
      };
    }
    const helpValues = computed(() => helpQuestion.value ? {
      coach: props.coach,
      ...coachHelpQuestionVariables(helpQuestion.value, helpVerb.value, helpTense.value, interfaceLocale.value),
      definition: localizedCoachVerbDefinition(helpVerb.value, interfaceLocale.value) || targetedHelp.value?.meaning || "",
      helpTitle: usesIdentificationHelp.value ? ui("Reconnaître les modes") : targetedHelp.value?.title || "",
      omitIndicativeMode: omitIndicativeMode.value
    } : { coach: props.coach });
    const helpDefinition = computed(() => helpQuestion.value ? localizedCoachVerbDefinition(helpVerb.value, interfaceLocale.value) || targetedHelp.value?.meaning || "" : "");
    const helpFeedbackContext = computed(() => {
      const questionIndex = helpQuestionIndex.value ?? currentIndex.value;
      const question = helpQuestion.value;
      return {
        sessionId: chatSessionId.value,
        exerciseRunId: exerciseRunId.value,
        capturedAt: (/* @__PURE__ */ new Date()).toISOString(),
        coachId: props.coach.id,
        coachName: props.coach.firstName,
        coach: {
          id: props.coach.id,
          slug: props.coach.slug,
          firstName: props.coach.firstName,
          caractereId: props.coach.caractereId,
          caractereName: props.coach.caractereName,
          pedagogicalStyle: props.coach.pedagogicalStyle,
          helpApproach: props.coach.helpApproach,
          themeColor: props.coach.themeColor
        },
        caractereId: props.coach.caractereId,
        caractereName: props.coach.caractereName,
        helpApproach: props.coach.helpApproach,
        helpName: `Aide automatique — ${props.coach.caractereName}`,
        questionNumber: question ? questionNumberOffset.value + questionIndex + 1 : void 0,
        questionIndex: questionNumberOffset.value + questionIndex,
        questionCount: displayedQuestionCount.value,
        verbId: question?.verbeId,
        verb: question?.infinitif,
        tenseId: question?.tenseId,
        tense: question?.temps,
        mode: question?.mode,
        person: question?.pronom || question?.saisiePrefixe,
        expectedAnswer: question?.reponsesPourCorrige.join(` ${ui("ou")} `),
        currentAnswerDraft: answer.value,
        currentQuestion: question || null,
        currentVerb: helpVerb.value || null,
        currentTense: helpTense.value || null,
        exerciseContext: {
          currentIndex: currentIndex.value,
          questionCount: props.questions.length,
          questions: props.questions,
          selectedVerbs: props.verbs.map(compactVerb),
          selectedTenses: props.tenses.map(compactTense),
          omitIndicativeMode: omitIndicativeMode.value,
          score: score.value,
          correctCount: correctCount.value,
          consecutiveCorrectCount: consecutiveCorrectCount.value,
          waitingForNext: waitingForNext.value,
          finished: finished.value
        },
        attempts: attempts.value,
        messages: messages.value
      };
    });
    function showDemoHelp() {
      helpQuestionIndex.value = currentIndex.value;
      helpOpen.value = true;
      scrollThreadToBottom();
    }
    function waitUntilTourReady() {
      if (tourDemoReady.value) return Promise.resolve();
      return new Promise((resolve) => {
        const stop = watch(tourDemoReady, (ready) => {
          if (!ready) return;
          stop();
          resolve();
        });
      });
    }
    function hideDemoHelp() {
      helpOpen.value = false;
      helpQuestionIndex.value = null;
    }
    __expose({ showDemoHelp, hideDemoHelp, waitUntilTourReady });
    function closeHelp() {
      helpOpen.value = false;
      helpQuestionIndex.value = null;
      focusAnswerInput();
    }
    function focusAnswerInput() {
      void nextTick(() => {
        (void 0).requestAnimationFrame(() => input.value?.focus({ preventScroll: true }));
      });
    }
    function scrollThreadToBottom() {
      void nextTick(() => {
        (void 0).requestAnimationFrame(() => {
          (void 0).requestAnimationFrame(() => {
            const container = thread.value;
            container?.scrollTo({
              top: container.scrollHeight,
              behavior: allowMotion.value ? "smooth" : "auto"
            });
          });
        });
      });
    }
    function contextFor(question, hideIdentificationAnswer = false, keepGrammarFrench = false) {
      const reminder = question?.agreementReminder;
      const displayedQuestion = question?.literaryCitation ? `${question.literaryCitation.before}【${question.literaryCitation.target}】${question.literaryCitation.after}` : question?.consigne;
      const instruction = question ? [question.instruction, displayedQuestion].filter(Boolean).join("\n") : void 0;
      const hidesAnswer = hideIdentificationAnswer && isIdentificationExercise.value;
      return {
        instruction: instruction && omitIndicativeMode.value ? withoutIndicativeMode(instruction) : instruction,
        verb: question?.infinitif || reminder?.infinitive,
        complement: reminder?.complement || question?.complement,
        participle: reminder?.participle,
        gender: reminder?.gender === "feminin" ? "féminin" : reminder?.gender === "masculin" ? "masculin" : void 0,
        number: reminder?.number || void 0,
        mode: hidesAnswer ? void 0 : keepGrammarFrench ? question?.mode : uiLabel(question?.mode),
        tense: hidesAnswer ? void 0 : keepGrammarFrench ? question?.temps : uiLabel(question?.temps),
        expectedAnswer: hidesAnswer ? void 0 : question?.reponsesPourCorrige.join(" ou "),
        questionNumber: question ? displayedQuestionNumber.value : void 0
      };
    }
    function wait(milliseconds) {
      return new Promise((resolve) => (void 0).setTimeout(resolve, milliseconds));
    }
    function clearHelpReminderTimer() {
      if (helpReminderTimer === null) return;
      (void 0).clearTimeout(helpReminderTimer);
      helpReminderTimer = null;
    }
    function restartHelpReminderTimer() {
      clearHelpReminderTimer();
      if (waitingForNext.value || posingQuestion.value || finished.value || !currentQuestion.value) return;
      const questionIndex = currentIndex.value;
      helpReminderTimer = (void 0).setTimeout(() => {
        helpReminderTimer = null;
        if (questionIndex !== currentIndex.value || waitingForNext.value || posingQuestion.value || finished.value) return;
        void suggestHelp(true);
      }, CHAT_HELP_REMINDER_DELAY_MS);
    }
    function enqueueCoachBubble(createMessage) {
      coachQueue = coachQueue.then(async () => {
        const remainingDelay = props.tourDemo ? 0 : Math.max(0, CHAT_BUBBLE_DELAY_MS - (Date.now() - lastCoachBubbleAt));
        if (remainingDelay) await wait(remainingDelay);
        messages.value.push({ id: ++sequence.value, author: "coach", ...createMessage() });
        lastCoachBubbleAt = Date.now();
        scrollThreadToBottom();
      });
      return coachQueue;
    }
    async function suggestHelp(offerConsultation = false) {
      const question = currentQuestion.value;
      if (!question || finished.value) return;
      const questionIndex = currentIndex.value;
      if (offerConsultation && helpConsultationOfferedQuestions.has(questionIndex)) {
        helpQuestionIndex.value = null;
        helpOpen.value = true;
        return;
      }
      if (offerConsultation) helpConsultationOfferedQuestions.add(questionIndex);
      helpQuestionIndex.value = null;
      helpOpen.value = true;
      await nextTick();
      if (!offerConsultation) await addCoachReaction("help-announcement", contextFor(question));
      const verbId = question.verbeId ?? helpVerb.value?.id;
      const verbLabel = question.infinitif || helpVerb.value?.infinitif;
      if (offerConsultation && verbId && verbLabel) {
        await enqueueCoachBubble(() => ({
          text: ui("Tu veux consulter la conjugaison du verbe {verb} ?", { verb: verbLabel }),
          consultVerbId: verbId,
          consultVerbLabel: verbLabel
        }));
      }
      const spokenAnswer = question.reponsesPourCorrige[0] || question.reponses[0];
      if (offerConsultation && usesDelayedAnswerAudio.value && speechSupported.value && !isIdentificationExercise.value && spokenAnswer) {
        await enqueueCoachBubble(() => ({
          text: ui("Tu peux aussi écouter la réponse."),
          spokenAnswer,
          questionIndex
        }));
      }
    }
    async function addCoachReaction(eventType, context, tone) {
      const rule = props.coach.rules.find((item) => item.eventType === eventType);
      const cooledDown = currentIndex.value - lastMediaQuestion.value >= (rule?.cooldownQuestions || 0);
      const reaction = createVariedCoachReaction(props.coach, eventType, context, dialogueState, {
        allowMotion: allowMotion.value,
        mediaAllowed: chatReactionAllowsMedia(eventType, cooledDown, hasIncorrectMedia.value)
      });
      const text = omitIndicativeMode.value ? withoutIndicativeMode(reaction.text) : reaction.text;
      if (!text.trim() && !reaction.media) return false;
      if (reaction.media) {
        lastMediaQuestion.value = currentIndex.value;
      }
      await enqueueCoachBubble(() => ({ text, ...{}, ...reaction.media ? { media: reaction.media } : {} }));
      return true;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_CoachHelpPanel = __nuxt_component_0;
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="chat-overlay" data-tour="chat-exercise" style="${ssrRenderStyle(unref(tourDemoReady) ? null : { display: "none" })}" data-v-7b12c1c6><div class="${ssrRenderClass([{ "chat-dialogs--with-help": unref(helpOpen), "chat-dialogs--confirming": unref(closeConfirmationOpen) }, "chat-dialogs"])}" style="${ssrRenderStyle(unref(coachChatStyle))}" role="dialog" aria-modal="true" aria-labelledby="chat-title" tabindex="-1" data-v-7b12c1c6><section class="chat-dialog" data-tour="chat-dialog" role="region" aria-labelledby="chat-title" data-v-7b12c1c6><header class="chat-header" data-v-7b12c1c6><img class="coach-avatar"${ssrRenderAttr("src", __props.coach.avatarPath)} alt="" data-v-7b12c1c6><div class="chat-header__identity" data-v-7b12c1c6><h2 id="chat-title" data-v-7b12c1c6>${ssrInterpolate(__props.coach.firstName)}</h2>`);
        if (__props.coach.likes) {
          _push2(`<p class="chat-header__likes" data-v-7b12c1c6><strong data-v-7b12c1c6>${ssrInterpolate(unref(ui)("Aime :"))}</strong> ${ssrInterpolate(__props.coach.likes)}</p>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`</div><div class="chat-header__actions" data-v-7b12c1c6><button type="button" class="chat-close"${ssrRenderAttr("aria-label", unref(ui)("Quitter le chat"))} data-v-7b12c1c6>×</button></div></header><div class="chat-progress"${ssrRenderAttr("aria-label", unref(ui)("Progression"))} data-v-7b12c1c6><span style="${ssrRenderStyle({ width: `${unref(finished) ? 100 : (unref(questionNumberOffset) + unref(currentIndex)) / unref(displayedQuestionCount) * 100}%` })}" data-v-7b12c1c6></span></div>`);
        if (!unref(finished) && unref(currentQuestion)) {
          _push2(`<div class="chat-instruction" data-v-7b12c1c6><span data-v-7b12c1c6>${ssrInterpolate(unref(ui)("Question {current} sur {total}", { current: unref(displayedQuestionNumber), total: unref(displayedQuestionCount) }))}</span></div>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`<div class="chat-thread" aria-live="polite" data-v-7b12c1c6><!--[-->`);
        ssrRenderList(unref(visibleMessages), (message) => {
          _push2(`<div class="${ssrRenderClass([`chat-message-row--${message.author}`, "chat-message-row"])}" data-v-7b12c1c6><div${ssrRenderAttr("data-chat-message-id", message.id)} class="${ssrRenderClass([[
            `chat-message--${message.author}`,
            message.tone ? `chat-message--${message.tone}` : "",
            { "chat-message--comparison": !!message.answerComparison },
            { "chat-message--identification-question": message.identificationPrompt },
            { "chat-message--instruction": message.instructionPrompt },
            { "chat-message--speech-only": message.speechOnly },
            { "chat-message--mobile-help-hint": message.mobileHelpHint },
            { "chat-message--help-link": message.author === "learner" && message.questionIndex !== void 0 },
            { "is-help-selected": unref(helpOpen) && message.questionIndex !== void 0 && message.questionIndex === unref(helpQuestionIndex) }
          ], "chat-message"])}"${ssrRenderAttr("role", message.author === "learner" && message.questionIndex !== void 0 ? "button" : void 0)}${ssrRenderAttr("tabindex", message.author === "learner" && message.questionIndex !== void 0 ? 0 : void 0)}${ssrRenderAttr("aria-label", message.author === "learner" && message.questionIndex !== void 0 ? unref(ui)("Voir l’aide de la question {number} pour la réponse {answer}", { number: message.questionIndex + 1, answer: message.text }) : void 0)} data-v-7b12c1c6>`);
          if (message.errorDetails?.length) {
            _push2(ssrRenderComponent(LearnerErrorFeedback, {
              details: message.errorDetails
            }, null, _parent));
          } else if (message.literaryCitation) {
            _push2(`<div class="chat-literary-question" data-v-7b12c1c6><blockquote class="chat-literary-citation" data-v-7b12c1c6><p data-v-7b12c1c6><span data-v-7b12c1c6>${ssrInterpolate(message.literaryCitation.before)}</span><mark data-v-7b12c1c6>${ssrInterpolate(message.literaryCitation.target)}</mark><span data-v-7b12c1c6>${ssrInterpolate(message.literaryCitation.after)}</span></p><footer data-v-7b12c1c6>${ssrInterpolate(message.literaryCitation.author)}, <cite data-v-7b12c1c6>${ssrInterpolate(message.literaryCitation.work)}</cite></footer></blockquote></div>`);
          } else if (message.identificationForm) {
            _push2(`<p class="chat-identification-form" data-v-7b12c1c6><span data-v-7b12c1c6>${ssrInterpolate(message.identificationForm.before)}</span><mark data-v-7b12c1c6>${ssrInterpolate(message.identificationForm.target)}</mark><span data-v-7b12c1c6>${ssrInterpolate(message.identificationForm.after)}</span></p>`);
          } else if (message.answerComparison) {
            _push2(`<div class="answer-comparison" data-v-7b12c1c6><strong data-v-7b12c1c6>${ssrInterpolate(message.answerComparison.mode === "focused" ? unref(ui)("Regarde où ça change :") : unref(ui)("Repars de la correction complète :"))}</strong><div class="answer-comparison__line answer-comparison__line--learner" data-v-7b12c1c6><small data-v-7b12c1c6>${ssrInterpolate(unref(ui)("Ta réponse"))}</small><p data-v-7b12c1c6><!--[-->`);
            ssrRenderList(message.answerComparison.learnerParts, (part, partIndex) => {
              _push2(`<span class="${ssrRenderClass(`answer-comparison__part--${part.kind}`)}" data-v-7b12c1c6>${ssrInterpolate(part.text)}</span>`);
            });
            _push2(`<!--]--></p></div><div class="answer-comparison__line answer-comparison__line--expected" data-v-7b12c1c6><small data-v-7b12c1c6>${ssrInterpolate(unref(ui)("Correction"))}</small><p data-v-7b12c1c6><!--[-->`);
            ssrRenderList(message.answerComparison.expectedParts, (part, partIndex) => {
              _push2(`<span class="${ssrRenderClass(`answer-comparison__part--${part.kind}`)}" data-v-7b12c1c6>${ssrInterpolate(part.text)}</span>`);
            });
            _push2(`<!--]--></p></div>`);
            if (message.answerComparison.mode === "full") {
              _push2(`<small class="answer-comparison__guidance" data-v-7b12c1c6>${ssrInterpolate(unref(ui)("Les deux réponses sont très différentes : observe d’abord la construction complète."))}</small>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else if (message.text && message.author === "coach" && message.answerLine) {
            _push2(`<span class="chat-message__text chat-message__text--emphasis" data-v-7b12c1c6><!--[-->`);
            ssrRenderList(answerLineParts(message.text), (part, partIndex) => {
              _push2(`<span class="${ssrRenderClass({ "chat-answer-line": part.isLine })}" data-v-7b12c1c6>${ssrInterpolate(part.text)}</span>`);
            });
            _push2(`<!--]--></span>`);
          } else if (message.text && message.author === "coach") {
            _push2(`<span class="${ssrRenderClass([{ "chat-message__text--emphasis": message.emphasis }, "chat-message__text"])}" data-v-7b12c1c6>${unref(sanitizeCoachHtml)(message.text) ?? ""}</span>`);
          } else if (message.text && message.emphasis) {
            _push2(`<strong data-v-7b12c1c6>${ssrInterpolate(message.text)}</strong>`);
          } else if (message.text) {
            _push2(`<span data-v-7b12c1c6>${ssrInterpolate(message.text)}</span>`);
          } else {
            _push2(`<!---->`);
          }
          if (message.consultVerbId) {
            _push2(`<button type="button" class="chat-consult-verb-link" data-v-7b12c1c6>${ssrInterpolate(unref(ui)("Consulter le verbe"))}</button>`);
          } else {
            _push2(`<!---->`);
          }
          if (unref(audioReadingEnabled) && message.spokenAnswer && unref(speechSupported)) {
            _push2(`<button type="button" class="${ssrRenderClass([{ "chat-hear-answer-button--icon-only": message.speechOnly }, "chat-hear-answer-button"])}"${ssrRenderAttr("aria-label", unref(speakingMessageId) === message.id ? unref(ui)("Arrêter la lecture") : unref(ui)("Entendre la réponse"))}${ssrRenderAttr("aria-pressed", unref(speakingMessageId) === message.id)} data-v-7b12c1c6>`);
            _push2(ssrRenderComponent(unref(FontAwesomeIcon), {
              icon: unref(speakingMessageId) === message.id ? unref(faStop) : unref(faBullhorn),
              "aria-hidden": "true"
            }, null, _parent));
            if (!message.speechOnly) {
              _push2(`<span data-v-7b12c1c6>${ssrInterpolate(unref(speakingMessageId) === message.id ? unref(ui)("Arrêter la lecture") : unref(ui)("Entendre la réponse"))}</span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</button>`);
          } else {
            _push2(`<!---->`);
          }
          if (message.media?.mediaType === "video") {
            _push2(`<video${ssrRenderAttr("src", message.media.filePath)}${ssrRenderAttr("aria-label", message.media.altText)} muted playsinline controls data-v-7b12c1c6></video>`);
          } else if (message.media) {
            _push2(`<img class="${ssrRenderClass({ "chat-media--emoji": message.media.mediaType === "emoji" })}"${ssrRenderAttr("src", message.media.filePath)}${ssrRenderAttr("alt", message.media.altText)} data-v-7b12c1c6>`);
          } else {
            _push2(`<!---->`);
          }
          if (message.identificationPrompt && message.questionIndex === unref(currentIndex)) {
            _push2(`<div class="chat-identification-choices" data-v-7b12c1c6>`);
            if (unref(activeExerciseKind) === "tense-identification" && unref(selectedIdentificationMode)) {
              _push2(`<div class="chat-tense-choice-step" data-v-7b12c1c6><div class="chat-tense-choice-step__header" data-v-7b12c1c6><button type="button" data-v-7b12c1c6>← ${ssrInterpolate(unref(ui)("Modes"))}</button><strong data-v-7b12c1c6>${ssrInterpolate(unref(ui)("Choisis le temps"))}</strong></div><div class="chat-tense-choices" role="group"${ssrRenderAttr("aria-label", unref(ui)("Choisis le temps"))} data-v-7b12c1c6><!--[-->`);
              ssrRenderList(unref(selectedModeTenseRows), (row) => {
                _push2(`<div class="chat-tense-choice-row" data-v-7b12c1c6>`);
                if (row.simple) {
                  _push2(`<button type="button"${ssrIncludeBooleanAttr(unref(waitingForNext) || unref(posingQuestion) || unref(deliveringFeedback)) ? " disabled" : ""} data-v-7b12c1c6>${ssrInterpolate(unref(uiLabel)(row.simple.name))}</button>`);
                } else {
                  _push2(`<span aria-hidden="true" data-v-7b12c1c6></span>`);
                }
                if (row.compound) {
                  _push2(`<button type="button"${ssrIncludeBooleanAttr(unref(waitingForNext) || unref(posingQuestion) || unref(deliveringFeedback)) ? " disabled" : ""} data-v-7b12c1c6>${ssrInterpolate(unref(uiLabel)(row.compound.name))}</button>`);
                } else {
                  _push2(`<span aria-hidden="true" data-v-7b12c1c6></span>`);
                }
                _push2(`</div>`);
              });
              _push2(`<!--]--></div></div>`);
            } else {
              _push2(`<div class="chat-mode-choices" role="group"${ssrRenderAttr("aria-label", unref(ui)("Choisis le mode"))} data-v-7b12c1c6><!--[-->`);
              ssrRenderList(unref(displayedIdentificationModeChoices), (choice) => {
                _push2(`<button type="button"${ssrIncludeBooleanAttr(unref(waitingForNext) || unref(posingQuestion) || unref(deliveringFeedback)) ? " disabled" : ""} data-v-7b12c1c6>${ssrInterpolate(choice.label)}</button>`);
              });
              _push2(`<!--]--></div>`);
            }
            _push2(`</div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div>`);
          if (unref(coachMessageAudioEnabled) && coachMessageCanBeRead(message)) {
            _push2(`<button type="button" class="${ssrRenderClass([{ "is-error": unref(coachAudioErrorMessageId) === message.id }, "chat-message-audio-button"])}"${ssrRenderAttr("aria-label", unref(coachAudioPlayingMessageId) === message.id || unref(coachAudioLoadingMessageId) === message.id ? unref(ui)("Arrêter la lecture") : unref(ui)("Écouter le message du coach"))}${ssrRenderAttr("aria-pressed", unref(coachAudioPlayingMessageId) === message.id)}${ssrRenderAttr("title", unref(coachAudioErrorMessageId) === message.id ? unref(ui)("La lecture audio a échoué. Réessayer.") : void 0)} data-v-7b12c1c6>`);
            _push2(ssrRenderComponent(unref(FontAwesomeIcon), {
              icon: unref(coachAudioLoadingMessageId) === message.id ? unref(faSpinner) : unref(coachAudioPlayingMessageId) === message.id ? unref(faStop) : unref(faVolume),
              spin: unref(coachAudioLoadingMessageId) === message.id,
              "aria-hidden": "true"
            }, null, _parent));
            _push2(`</button>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div>`);
        });
        _push2(`<!--]-->`);
        if (unref(finalSummaryPreparing)) {
          _push2(`<div class="chat-summary-loading" role="status" aria-live="polite" data-v-7b12c1c6><span aria-hidden="true" data-v-7b12c1c6></span><strong data-v-7b12c1c6>${ssrInterpolate(unref(ui)("Création du bilan"))}</strong></div>`);
        } else {
          _push2(`<!---->`);
        }
        if (unref(finalSummaryVisible)) {
          _push2(`<section class="chat-summary-tool" aria-labelledby="chat-summary-title" data-v-7b12c1c6><header data-v-7b12c1c6><div data-v-7b12c1c6><h3 id="chat-summary-title" data-v-7b12c1c6>${ssrInterpolate(unref(ui)("Bilan du défi"))}</h3></div><strong data-v-7b12c1c6>${ssrInterpolate(unref(score))} %</strong></header><ol class="chat-summary-list" data-v-7b12c1c6><!--[-->`);
          ssrRenderList(unref(attemptSummaries), (item) => {
            _push2(`<li class="${ssrRenderClass([`is-${item.answerWasHeard ? "heard" : item.status}`, { "is-help-selected": unref(helpOpen) && item.questionIndex === unref(helpQuestionIndex) }])}" style="${ssrRenderStyle({ "--summary-item-index": `${item.index - 1}` })}" role="button" tabindex="0"${ssrRenderAttr("aria-label", unref(ui)("Voir l’aide de la question {number} : {question}", { number: item.index, question: item.questionLabel }))} data-v-7b12c1c6><span class="chat-summary-list__status" aria-hidden="true" data-v-7b12c1c6>${ssrInterpolate(item.answerWasHeard ? "🔊" : item.status === "correct" ? "✓" : "×")}</span><div data-v-7b12c1c6><strong class="chat-summary-list__question" data-v-7b12c1c6><span data-v-7b12c1c6>${ssrInterpolate(unref(ui)("Question"))} ${ssrInterpolate(item.index)}</span><span data-v-7b12c1c6>${ssrInterpolate(item.questionLabel)}</span></strong>`);
            if (item.identificationForm) {
              _push2(`<blockquote class="chat-summary-list__citation" data-v-7b12c1c6><p data-v-7b12c1c6><span data-v-7b12c1c6>${ssrInterpolate(item.identificationForm.before)}</span><mark data-v-7b12c1c6>${ssrInterpolate(item.identificationForm.target)}</mark><span data-v-7b12c1c6>${ssrInterpolate(item.identificationForm.after)}</span></p>`);
              if (item.literaryCitation) {
                _push2(`<footer data-v-7b12c1c6>${ssrInterpolate(item.literaryCitation.author)}, <cite data-v-7b12c1c6>${ssrInterpolate(item.literaryCitation.work)}</cite></footer>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</blockquote>`);
            } else {
              _push2(`<!---->`);
            }
            if (item.errorDetails.length) {
              _push2(ssrRenderComponent(LearnerErrorFeedback, {
                details: item.errorDetails,
                compact: ""
              }, null, _parent));
            } else {
              _push2(`<!---->`);
            }
            _push2(`<dl data-v-7b12c1c6><div data-v-7b12c1c6><dt data-v-7b12c1c6>${ssrInterpolate(unref(ui)("Réponse donnée"))}</dt><dd data-v-7b12c1c6>${ssrInterpolate(item.learnerAnswer)}</dd></div><div data-v-7b12c1c6><dt data-v-7b12c1c6>${ssrInterpolate(unref(ui)("Bonne réponse"))}</dt><dd data-v-7b12c1c6>${ssrInterpolate(item.expectedAnswer)}</dd></div></dl>`);
            if (item.verbId) {
              _push2(`<button type="button" class="chat-summary-consult-link" data-v-7b12c1c6>${ssrInterpolate(unref(ui)("Consulter le verbe"))}</button>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div></li>`);
          });
          _push2(`<!--]--></ol><footer data-v-7b12c1c6><strong data-v-7b12c1c6>${ssrInterpolate(unref(correctCount))} / ${ssrInterpolate(unref(attempts).length)}</strong><span data-v-7b12c1c6>${ssrInterpolate(unref(correctCount) === 1 ? unref(ui)("réponse juste") : unref(ui)("réponses justes"))}</span></footer></section>`);
        } else {
          _push2(`<!---->`);
        }
        if (unref(finalSummaryVisible)) {
          _push2(`<div class="chat-message-row chat-message-row--coach" data-v-7b12c1c6><div class="chat-message chat-message--coach chat-restart-prompt" data-v-7b12c1c6><span data-v-7b12c1c6>${ssrInterpolate(unref(restartCoachMessage).text)}</span><div class="chat-restart-prompt__actions" data-v-7b12c1c6><button type="button" class="chat-restart-prompt__same"${ssrIncludeBooleanAttr(unref(regeneratingQuestions)) ? " disabled" : ""} data-v-7b12c1c6><span aria-hidden="true" data-v-7b12c1c6>↻</span>${ssrInterpolate(unref(ui)("Avec les mêmes questions"))}</button><button type="button" class="chat-restart-prompt__new"${ssrIncludeBooleanAttr(unref(regeneratingQuestions)) ? " disabled" : ""} data-v-7b12c1c6><span aria-hidden="true" data-v-7b12c1c6>↻</span>${ssrInterpolate(unref(regeneratingQuestions) ? unref(ui)("Préparation…") : unref(ui)("Avec d’autres questions"))}</button><button type="button" class="chat-restart-prompt__share"${ssrIncludeBooleanAttr(unref(regeneratingQuestions)) ? " disabled" : ""} data-v-7b12c1c6><span aria-hidden="true" data-v-7b12c1c6>`);
          _push2(ssrRenderComponent(unref(FontAwesomeIcon), { icon: unref(faArrowUpFromBracket) }, null, _parent));
          _push2(`</span>${ssrInterpolate(unref(ui)("Partager mon bilan"))}</button><button type="button" class="chat-restart-prompt__print"${ssrIncludeBooleanAttr(unref(regeneratingQuestions)) ? " disabled" : ""} data-v-7b12c1c6><span aria-hidden="true" data-v-7b12c1c6>`);
          _push2(ssrRenderComponent(unref(FontAwesomeIcon), { icon: unref(faPrint) }, null, _parent));
          _push2(`</span>${ssrInterpolate(unref(ui)("Imprimer mon bilan"))}</button><button type="button" class="chat-restart-prompt__quit"${ssrIncludeBooleanAttr(unref(regeneratingQuestions)) ? " disabled" : ""} data-v-7b12c1c6>${ssrInterpolate(unref(ui)("Quitter le chat"))}</button></div>`);
          if (unref(restartError)) {
            _push2(`<small class="chat-restart-prompt__error" role="alert" data-v-7b12c1c6>${ssrInterpolate(unref(restartError))}</small>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div>`);
          if (unref(coachMessageAudioEnabled)) {
            _push2(`<button type="button" class="${ssrRenderClass([{ "is-error": unref(coachAudioErrorMessageId) === unref(restartCoachMessage).id }, "chat-message-audio-button"])}"${ssrRenderAttr("aria-label", unref(coachAudioPlayingMessageId) === unref(restartCoachMessage).id || unref(coachAudioLoadingMessageId) === unref(restartCoachMessage).id ? unref(ui)("Arrêter la lecture") : unref(ui)("Écouter le message du coach"))}${ssrRenderAttr("aria-pressed", unref(coachAudioPlayingMessageId) === unref(restartCoachMessage).id)}${ssrRenderAttr("title", unref(coachAudioErrorMessageId) === unref(restartCoachMessage).id ? unref(ui)("La lecture audio a échoué. Réessayer.") : void 0)} data-v-7b12c1c6>`);
            _push2(ssrRenderComponent(unref(FontAwesomeIcon), {
              icon: unref(coachAudioLoadingMessageId) === unref(restartCoachMessage).id ? unref(faSpinner) : unref(coachAudioPlayingMessageId) === unref(restartCoachMessage).id ? unref(faStop) : unref(faVolume),
              spin: unref(coachAudioLoadingMessageId) === unref(restartCoachMessage).id,
              "aria-hidden": "true"
            }, null, _parent));
            _push2(`</button>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`</div>`);
        if (!unref(finished)) {
          _push2(`<form class="chat-composer" data-v-7b12c1c6><div class="${ssrRenderClass([{ "has-prefix": unref(providedAnswerPrefix) }, "chat-answer-control"])}" data-v-7b12c1c6>`);
          if (unref(providedAnswerPrefix)) {
            _push2(`<span class="chat-answer-control__prefix" data-v-7b12c1c6>${ssrInterpolate(unref(providedAnswerPrefix))}</span>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<input id="chat-answer"${ssrRenderAttr("value", unref(answer))} type="text" autocomplete="off"${ssrRenderAttr("aria-label", unref(ui)("Ta réponse"))}${ssrIncludeBooleanAttr(unref(waitingForNext)) ? " disabled" : ""}${ssrRenderAttr("placeholder", unref(currentSubjectMustBeTyped) ? unref(currentAnswerPlaceholder) : unref(chatAnswerPlaceholder))} data-v-7b12c1c6></div><button type="submit"${ssrIncludeBooleanAttr(unref(waitingForNext) || unref(posingQuestion) || unref(deliveringFeedback) || !unref(answer).trim()) ? " disabled" : ""} data-v-7b12c1c6>${ssrInterpolate(unref(posingQuestion) ? unref(ui)("Question…") : unref(deliveringFeedback) ? unref(ui)("Réponse…") : unref(waitingForNext) ? unref(ui)("Suite…") : unref(ui)("Envoyer"))}</button></form>`);
        } else {
          _push2(`<!---->`);
        }
        if (unref(helpOpen) && unref(helpQuestionIndex) !== null) {
          _push2(`<button type="button" class="${ssrRenderClass([{ "chat-latest-help--above-composer": !unref(finished) }, "chat-latest-help"])}"${ssrRenderAttr("aria-label", unref(finished) ? unref(ui)("Revenir à l’aide de la dernière question") : unref(ui)("Revenir à l’aide de la question actuelle"))}${ssrRenderAttr("title", unref(finished) ? unref(ui)("Voir l’aide de la dernière question") : unref(ui)("Voir l’aide de la question actuelle"))} data-v-7b12c1c6><span aria-hidden="true" data-v-7b12c1c6>↓</span></button>`);
        } else {
          _push2(`<!---->`);
        }
        if (unref(closeConfirmationOpen)) {
          _push2(`<div class="chat-close-confirmation" data-v-7b12c1c6><section role="alertdialog" aria-modal="true"${ssrRenderAttr("aria-label", unref(ui)("Quitter le chat ?"))} data-v-7b12c1c6><div class="chat-close-confirmation__actions" data-v-7b12c1c6><button class="secondary-button" type="button" data-v-7b12c1c6>${ssrInterpolate(unref(ui)("Continuer l’exercice"))}</button><button class="primary-button chat-close-confirmation__leave" type="button" data-v-7b12c1c6>${ssrInterpolate(unref(ui)("Quitter"))}</button></div></section></div>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`</section><template>`);
        if (unref(helpOpen) && (unref(targetedHelp) || unref(usesIdentificationHelp))) {
          _push2(ssrRenderComponent(_component_CoachHelpPanel, {
            blocks: unref(helpBlocks),
            values: unref(helpValues),
            "header-title": "{helpTitle}",
            "header-description": "",
            "question-number": (unref(helpQuestionIndex) ?? unref(currentIndex)) + 1,
            "coach-color": __props.coach.themeColor,
            "feedback-context": unref(helpFeedbackContext),
            "include-automatic-orthography": !unref(usesIdentificationHelp) && !unref(usesAllophoneHelp),
            "enable-automatic-audit": !unref(usesIdentificationHelp) && !unref(usesAllophoneHelp),
            "consult-verb-id": unref(helpConsultVerbId),
            "consult-verb-label": unref(helpConsultVerbLabel),
            "allophone-mode": unref(usesAllophoneHelp),
            "allophone-definition": unref(helpDefinition),
            "allophone-tenses": __props.tenses,
            "allophone-coach-id": __props.coach.id,
            "allophone-audio-enabled": unref(coachMessageAudioEnabled),
            onContentScroll: restartHelpReminderTimer,
            onUserScroll: trackHelpScroll,
            onConsultVerb: openVerbConsultation,
            onChangeCoach: changeCoachFromHelp,
            onClose: closeHelp
          }, null, _parent));
        } else {
          _push2(`<!---->`);
        }
        _push2(`</template></div>`);
        if (unref(printSummaryOpen) && unref(printSummaryComponent)) {
          ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(unref(printSummaryComponent)), {
            items: unref(attemptSummaries),
            score: unref(score),
            "correct-count": unref(correctCount),
            verbs: __props.verbs.map((verb) => verb.infinitif),
            tenses: __props.tenses.map((tense) => ({ name: tense.name, mode: tense.mode?.name })),
            onClose: ($event) => printSummaryOpen.value = false
          }, null), _parent);
        } else {
          _push2(`<!---->`);
        }
        if (unref(shareSummaryOpen)) {
          _push2(ssrRenderComponent(ShareExerciseSummaryDialog, {
            presentation: "chat",
            items: unref(attemptSummaries),
            verbs: __props.verbs.map((verb) => verb.infinitif),
            tenses: __props.tenses.map((tense) => ({ name: tense.name, mode: tense.mode?.name })),
            onClose: ($event) => shareSummaryOpen.value = false
          }, null, _parent));
        } else {
          _push2(`<!---->`);
        }
        if (unref(consultationVerbId) !== null) {
          _push2(ssrRenderComponent(VerbConsultationModal, {
            "verb-id": unref(consultationVerbId),
            "header-color": __props.coach.themeColor,
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/exercise/ChatExercise.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ChatExercise = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-7b12c1c6"]]), { __name: "ExerciseChatExercise" });

export { ChatExercise as default };
//# sourceMappingURL=ChatExercise-11R1dKWa.mjs.map
