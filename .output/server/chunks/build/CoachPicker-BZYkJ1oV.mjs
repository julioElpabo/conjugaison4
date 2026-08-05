import { w as withoutIndicativeMode, l as literaryIdentificationCoachHelpBlocks, v as visibleCoachHelpBlocks, d as areOnlyIndicativeTenses, e as localizedCoachVerbDefinition, c as coachHelpQuestionVariables, s as sanitizeCoachHtml, _ as __nuxt_component_0$1 } from './CoachHelpPanel-CV6-CBeI.mjs';
import { defineComponent, ref, computed, unref, useTemplateRef, nextTick, watch, mergeProps, useSSRContext } from 'vue';
import { ssrRenderTeleport, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderList, ssrRenderClass, ssrRenderStyle, ssrRenderComponent, ssrRenderAttrs } from 'vue/server-renderer';
import { J as validateAnswer, aq as getAlternativeCorrections, ar as impossibleSingularEndingReminderMessage, O as grammarTenseCode, as as localizedLearnerErrorMessage, at as isFutureSimpleInsteadOfNearFuture, au as findConjugationConfusions, av as findImpossibleSingularEnding, aw as diagnoseCoachAgreement, ax as diagnoseCoachAnswer, N as learnerErrorDetails, ay as mergeLearnerErrorDetails, az as learnerErrorInsteadOf } from '../nitro/nitro.mjs';
import { a as createVariedCoachReaction, b as createCoachDialogueState } from '../_/coach-dialogue.mjs';
import { c as coachHelpProfile, j as buildTargetedConjugationHelp } from '../_/coach-help-audit.mjs';
import { i as identificationFormParts } from '../_/identification-form.mjs';
import { f as useLanguagePreferences } from './server.mjs';
import { u as useSiteAnalytics } from './useSiteAnalytics-D1wpWTOZ.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { i as isModeLandingSlug, m as modeLandingPage } from '../_/mode-landing-pages.mjs';
import { m as modeTensePedagogy } from '../_/mode-tense-pedagogy.mjs';
import { u as useLearnerAuth } from './useLearnerAuth-BLt5hOAV.mjs';
import { a as COACH_HELP_ENGINE_KEYS } from '../_/coach.mjs';

const CHAT_BUBBLE_DELAY_MS = 1e3;
const CHAT_INCORRECT_DELAY_MS = 3e3;
const INCORRECT_REACTION_EVENTS = /* @__PURE__ */ new Set(["incorrect", "cod-before", "cod-after", "coi", "encouragement"]);
function chatReactionAllowsMedia(eventType, cooledDown, hasIncorrectMedia) {
  if (!cooledDown || eventType === "encouragement") return false;
  return !INCORRECT_REACTION_EVENTS.has(eventType) || hasIncorrectMedia;
}
function chatMessageHasVisibleContent(message) {
  var _a, _b;
  return Boolean(
    ((_a = message.text) == null ? void 0 : _a.trim()) || message.media || message.answerComparison || message.literaryCitation || message.identificationForm || ((_b = message.errorDetails) == null ? void 0 : _b.length)
  );
}

const SIMPLE_TENSE_BLANK = "........................";
const COMPOUND_TENSE_GAP = "\xA0\xA0\xA0\xA0";
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
  return Array.from({ length: wordCount }, (_, index) => index === wordCount - 1 ? "......................." : "............").join(COMPOUND_TENSE_GAP);
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
function coachQuestionBubbles(question, options = {}) {
  var _a, _b;
  const sentenceTemplate = templateWithInputPrefix(
    ((_a = question.consigne.split("|")[0]) == null ? void 0 : _a.trim()) || "",
    question
  );
  const formulaPronoun = question.pronom;
  const answerPronoun = normalized(question.mode) === "imperatif" ? "" : (_b = question.saisiePrefixe) != null ? _b : question.pronom;
  const modeAndTense = [options.omitIndicativeMode ? "" : options.modeLabel || question.mode, options.tenseLabel || question.temps].filter(Boolean).join(" ");
  const formula = [formulaPronoun, question.infinitif, modeAndTense].filter(Boolean).join(" | ");
  if (!formula) return { formula: question.consigne };
  const answerWordCount = expectedAnswerWordCount(question);
  const blank = answerBlank(answerWordCount);
  const hasBlank = /(?:…|\.{3,})/u.test(sentenceTemplate);
  const normalizedSentenceTemplate = sentenceTemplate.replace(/\s+/gu, " ").trim();
  const blankPrefix = answerPronoun ? answerWordCount > 1 ? COMPOUND_TENSE_GAP : " " : "";
  let sentence = hasBlank ? normalizedSentenceTemplate.replace(/\s*(?:…|\.{3,})/gu, `${blankPrefix}${blank}`).trimStart() : `${answerPronoun || ""}${blankPrefix}${blank}`.trimStart();
  if (normalized(question.mode) === "subjonctif") {
    const alreadyContextualizedRelative = question.complementPosition === "before" && /^(?:c['’]est|ce sont)\b/iu.test(sentence);
    sentence = alreadyContextualizedRelative ? sentence : hasBlank ? contextualizeSubjunctiveTemplate(sentence, question) : `${subjunctiveSubject(question)}${blankPrefix}${blank}`;
  }
  return {
    formula: options.omitIndicativeMode ? withoutIndicativeMode(formula) : formula,
    sentence: sentenceCase(sentence)
  };
}

const CHAT_HELP_REMINDER_DELAY_MS = 3e4;

function evaluateExerciseAnswer(answer, expectedAnswers, retryAlreadyOffered) {
  const result = validateAnswer(answer, expectedAnswers);
  return {
    result,
    shouldRetry: !result.isCorrect && !retryAlreadyOffered
  };
}

const coachUiTexts = {
  "Compl\xE8te avec r\xE9ponses": { de: "Ausf\xFChrlich mit Antworten", en: "Detailed with answers", it: "Completo con risposte", es: "Completa con respuestas" },
  "Explication d\xE9taill\xE9e avec r\xE9ponses et surlignages.": { de: "Ausf\xFChrliche Erkl\xE4rung mit Antworten und Hervorhebungen.", en: "Detailed explanation with answers and highlights.", it: "Spiegazione dettagliata con risposte ed evidenziazioni.", es: "Explicaci\xF3n detallada con respuestas y elementos destacados." },
  "Compl\xE8te sans r\xE9ponses": { de: "Ausf\xFChrlich ohne Antworten", en: "Detailed without answers", it: "Completo senza risposte", es: "Completa sin respuestas" },
  "Explication d\xE9taill\xE9e et conseils, sans r\xE9v\xE9ler la r\xE9ponse.": { de: "Ausf\xFChrliche Erkl\xE4rung und Tipps, ohne die Antwort zu verraten.", en: "Detailed explanation and tips without revealing the answer.", it: "Spiegazione dettagliata e consigli, senza rivelare la risposta.", es: "Explicaci\xF3n detallada y consejos, sin revelar la respuesta." },
  "Tr\xE8s condens\xE9e": { de: "Sehr kompakt", en: "Very concise", it: "Molto sintetico", es: "Muy concisa" },
  "Un rappel du groupe et une r\xE8gle courte adapt\xE9e au mode et au temps.": { de: "Eine Erinnerung an die Gruppe und eine kurze Regel passend zu Modus und Zeitform.", en: "A reminder of the group and a short rule suited to the mood and tense.", it: "Un promemoria del gruppo e una breve regola adatta al modo e al tempo.", es: "Un recordatorio del grupo y una regla breve adaptada al modo y al tiempo." },
  "Allophone": { de: "F\xFCr Anderssprachige", en: "For non-native speakers", it: "Per allofoni", es: "Para hablantes de otras lenguas" },
  "Pour l\u2019instant identique \xE0 l\u2019aide compl\xE8te avec r\xE9ponses.": { de: "Derzeit identisch mit der ausf\xFChrlichen Hilfe mit Antworten.", en: "Currently identical to detailed help with answers.", it: "Per ora identico all\u2019aiuto completo con risposte.", es: "Por ahora id\xE9ntica a la ayuda completa con respuestas." },
  "Aide condens\xE9e": { de: "Kompakte Hilfe", en: "Concise help", it: "Aiuto sintetico", es: "Ayuda concisa" },
  "Explique sans donner les r\xE9ponses, avec un minimum de mots": { de: "Erkl\xE4rt mit m\xF6glichst wenigen Worten, ohne die Antworten zu verraten", en: "Explains in as few words as possible without giving the answers", it: "Spiega con pochissime parole senza dare le risposte", es: "Explica con el m\xEDnimo de palabras sin dar las respuestas" },
  "Aide compl\xE8te": { de: "Ausf\xFChrliche Hilfe", en: "Detailed help", it: "Aiuto completo", es: "Ayuda completa" },
  "Explique dans le d\xE9tail, sans jamais donner de r\xE9ponses": { de: "Erkl\xE4rt ausf\xFChrlich, ohne jemals die Antworten zu verraten", en: "Explains in detail without ever giving the answers", it: "Spiega nei dettagli senza mai dare le risposte", es: "Explica en detalle sin dar nunca las respuestas" },
  "Aide compl\xE8te avec r\xE9ponses": { de: "Ausf\xFChrliche Hilfe mit Antworten", en: "Detailed help with answers", it: "Aiuto completo con risposte", es: "Ayuda completa con respuestas" },
  "Explique dans le d\xE9tail et donne les r\xE9ponses de mani\xE8re compl\xE8te": { de: "Erkl\xE4rt ausf\xFChrlich und gibt vollst\xE4ndige Antworten", en: "Explains in detail and gives complete answers", it: "Spiega nei dettagli e fornisce risposte complete", es: "Explica en detalle y da las respuestas completas" },
  "Apprendre, c'est se tromper": { de: "Lernen hei\xDFt, Fehler zu machen", en: "Learning means making mistakes", it: "Imparare significa sbagliare", es: "Aprender es equivocarse" },
  "Le rap et le karat\xE9": { de: "Rap und Karate", en: "Rap and karate", it: "Il rap e il karate", es: "El rap y el k\xE1rate" },
  "Tu progresses chaque fois que tu refuses d'abandonner": { de: "Du machst jedes Mal Fortschritte, wenn du dich weigerst aufzugeben", en: "You make progress every time you refuse to give up", it: "Progredisci ogni volta che ti rifiuti di arrenderti", es: "Progresas cada vez que te niegas a rendirte" },
  "Les promenades en montagne": { de: "Spazierg\xE4nge in den Bergen", en: "Walks in the mountains", it: "Le passeggiate in montagna", es: "Los paseos por la monta\xF1a" },
  "Une petite victoire par jour, \xE7a finit par faire une grosse diff\xE9rence.": { de: "Ein kleiner Sieg pro Tag macht am Ende einen gro\xDFen Unterschied.", en: "One small win a day eventually makes a big difference.", it: "Una piccola vittoria al giorno finisce per fare una grande differenza.", es: "Una peque\xF1a victoria al d\xEDa acaba marcando una gran diferencia." },
  "La musique et voir mes amis": { de: "Musik und meine Freunde treffen", en: "Music and seeing my friends", it: "La musica e vedere i miei amici", es: "La m\xFAsica y ver a mis amigos" },
  "Les gens qui r\xE9ussissent ont surtout beaucoup essay\xE9": { de: "Erfolgreiche Menschen haben es vor allem oft versucht", en: "Successful people have mostly tried many times", it: "Le persone che riescono hanno soprattutto provato tante volte", es: "Quienes triunfan, ante todo, lo han intentado muchas veces" },
  "Le parkour, le basket": { de: "Parkour und Basketball", en: "Parkour and basketball", it: "Il parkour e il basket", es: "El parkour y el baloncesto" },
  "Chaque petit progr\xE8s compte.": { de: "Jeder kleine Fortschritt z\xE4hlt.", en: "Every little bit of progress counts.", it: "Ogni piccolo progresso conta.", es: "Cada peque\xF1o progreso cuenta." },
  "Les mangas de science-fiction": { de: "Science-Fiction-Mangas", en: "Science-fiction manga", it: "I manga di fantascienza", es: "Los mangas de ciencia ficci\xF3n" },
  "Tu es plus capable que tu ne le crois": { de: "Du kannst mehr, als du glaubst", en: "You are more capable than you think", it: "Sei pi\xF9 capace di quanto credi", es: "Eres m\xE1s capaz de lo que crees" },
  "Le foot, le foot, le foot": { de: "Fu\xDFball, Fu\xDFball, Fu\xDFball", en: "Football, football, football", it: "Il calcio, il calcio, il calcio", es: "El f\xFAtbol, el f\xFAtbol, el f\xFAtbol" },
  "Ce n'est pas ton niveau qui compte, c'est ta progression": { de: "Nicht dein Niveau z\xE4hlt, sondern dein Fortschritt", en: "It isn't your level that matters, it's your progress", it: "Non conta il tuo livello, ma i tuoi progressi", es: "No importa tu nivel, sino tu progreso" },
  "La danse contemporaine": { de: "Zeitgen\xF6ssischer Tanz", en: "Contemporary dance", it: "La danza contemporanea", es: "La danza contempor\xE1nea" },
  "Tu n'es pas en comp\xE9tition avec les autres, mais avec toi-m\xEAme": { de: "Du stehst nicht im Wettbewerb mit anderen, sondern mit dir selbst", en: "You're not competing with others, but with yourself", it: "Non sei in competizione con gli altri, ma con te stesso", es: "No compites con los dem\xE1s, sino contigo mismo" },
  "Me promener en ville avec mes amis": { de: "Mit meinen Freunden durch die Stadt gehen", en: "Walking around town with my friends", it: "Passeggiare in citt\xE0 con i miei amici", es: "Pasear por la ciudad con mis amigos" },
  "Si c'est gal\xE8re, c'est que tu progresses": { de: "Wenn es schwierig ist, machst du Fortschritte", en: "If it's hard, it means you're making progress", it: "Se \xE8 difficile, significa che stai progredendo", es: "Si cuesta, es porque est\xE1s progresando" },
  "Jouer au basket": { de: "Basketball spielen", en: "Playing basketball", it: "Giocare a basket", es: "Jugar al baloncesto" },
  "Le cerveau adore qu'on le challenge": { de: "Das Gehirn liebt Herausforderungen", en: "The brain loves a challenge", it: "Il cervello ama le sfide", es: "Al cerebro le encantan los retos" },
  "Battre mes potes aux \xE9checs": { de: "Meine Freunde im Schach schlagen", en: "Beating my friends at chess", it: "Battere i miei amici a scacchi", es: "Ganar a mis amigos al ajedrez" },
  "Tu vaux plus que tes notes": { de: "Du bist mehr wert als deine Noten", en: "You are worth more than your grades", it: "Vali pi\xF9 dei tuoi voti", es: "Vales m\xE1s que tus notas" },
  "Les films d'action": { de: "Actionfilme", en: "Action films", it: "I film d'azione", es: "Las pel\xEDculas de acci\xF3n" },
  "Ce n'est pas parce que c'est difficile que ce n'est pas pour toi.": { de: "Nur weil es schwierig ist, hei\xDFt das nicht, dass es nichts f\xFCr dich ist.", en: "Just because it's difficult doesn't mean it isn't for you.", it: "Solo perch\xE9 \xE8 difficile non significa che non faccia per te.", es: "Que sea dif\xEDcil no significa que no sea para ti." },
  "Voyager, ou que ce soit, mais voyager": { de: "Reisen, egal wohin, Hauptsache reisen", en: "Travelling, wherever it may be, but travelling", it: "Viaggiare, ovunque sia, ma viaggiare", es: "Viajar, donde sea, pero viajar" },
  "Salut ! On commence !": { de: "Hallo! Los geht\u2019s!", en: "Hi! Let\u2019s get started!", it: "Ciao! Cominciamo!", es: "\xA1Hola! \xA1Empezamos!" },
  "Une autre !": { de: "Noch eine!", en: "Another one!", it: "Un\u2019altra!", es: "\xA1Otra!" },
  "Nouveau d\xE9part, c\u2019est parti !": { de: "Neuer Start, los geht\u2019s!", en: "A fresh start\u2014let\u2019s go!", it: "Nuovo inizio, si parte!", es: "Nuevo comienzo, \xA1vamos!" },
  "Super s\xE9rie !": { de: "Tolle Serie!", en: "Great streak!", it: "Ottima serie!", es: "\xA1Gran racha!" },
  "Nouvelle question !": { de: "Neue Frage!", en: "New question!", it: "Nuova domanda!", es: "\xA1Nueva pregunta!" },
  "Bravo !": { de: "Sehr gut!", en: "Well done!", it: "Bravissimo!", es: "\xA1Muy bien!" },
  "Courage !": { de: "Nicht aufgeben!", en: "Keep going!", it: "Coraggio!", es: "\xA1\xC1nimo!" },
  "Tu es en plein forme !": { de: "Du bist richtig gut in Form!", en: "You\u2019re on top form!", it: "Sei in gran forma!", es: "\xA1Est\xE1s en plena forma!" },
  "Je vois que c\u2019est un peu difficile.": { de: "Ich sehe, dass es etwas schwierig ist.", en: "I can see this is a little difficult.", it: "Vedo che \xE8 un po\u2019 difficile.", es: "Veo que esto es un poco dif\xEDcil." },
  "C'est juste !": { de: "Das ist richtig!", en: "That\u2019s correct!", it: "\xC8 giusto!", es: "\xA1Es correcto!" },
  "C'est juste ! Il y a aussi une autre possibilit\xE9.": { de: "Das ist richtig! Es gibt noch eine andere M\xF6glichkeit.", en: "That\u2019s correct! There is another possible answer too.", it: "\xC8 giusto! C\u2019\xE8 anche un\u2019altra possibilit\xE0.", es: "\xA1Es correcto! Tambi\xE9n hay otra posibilidad." },
  "Termin\xE9 ! {score} % avec {correctCount} bonnes r\xE9ponses.": { de: "Fertig! {score} % mit {correctCount} richtigen Antworten.", en: "Finished! {score}% with {correctCount} correct answers.", it: "Finito! {score}% con {correctCount} risposte corrette.", es: "\xA1Terminado! {score}% con {correctCount} respuestas correctas." },
  "C'est faux. La bonne r\xE9ponse est  <b>\xAB {expectedAnswer} \xBB</b>.": { de: "Das ist falsch. Die richtige Antwort ist <b>\u201E{expectedAnswer}\u201C</b>.", en: "That\u2019s incorrect. The correct answer is <b>\u201C{expectedAnswer}\u201D</b>.", it: "Non \xE8 corretto. La risposta giusta \xE8 <b>\xAB{expectedAnswer}\xBB</b>.", es: "No es correcto. La respuesta correcta es <b>\xAB{expectedAnswer}\xBB</b>." },
  "\xAB {complement} \xBB arrive apr\xE8s \xAB {verb} \xBB : pas d\u2019accord, \xAB {participle} \xBB !": { de: "\u201E{complement}\u201C steht nach \u201E{verb}\u201C: keine Angleichung, \u201E{participle}\u201C!", en: "\u201C{complement}\u201D comes after \u201C{verb}\u201D: no agreement, \u201C{participle}\u201D!", it: "\xAB{complement}\xBB viene dopo \xAB{verb}\xBB: nessuna concordanza, \xAB{participle}\xBB!", es: "\xAB{complement}\xBB aparece despu\xE9s de \xAB{verb}\xBB: no hay concordancia, \xAB{participle}\xBB." },
  "Le COD \xAB {complement} \xBB est devant \xAB {verb} \xBB : accord obligatoire avec  {complement} . Le participe est :  \xAB {participle} \xBB !": { de: "Das direkte Objekt \u201E{complement}\u201C steht vor \u201E{verb}\u201C: Die Angleichung an {complement} ist erforderlich. Das Partizip lautet \u201E{participle}\u201C!", en: "The direct object \u201C{complement}\u201D comes before \u201C{verb}\u201D: agreement with {complement} is required. The participle is \u201C{participle}\u201D!", it: "Il complemento oggetto \xAB{complement}\xBB precede \xAB{verb}\xBB: la concordanza con {complement} \xE8 obbligatoria. Il participio \xE8 \xAB{participle}\xBB!", es: "El complemento directo \xAB{complement}\xBB va antes de \xAB{verb}\xBB: la concordancia con {complement} es obligatoria. El participio es \xAB{participle}\xBB." },
  "Attention au pi\xE8ge : \xAB {complement} \xBB est un COI, donc aucun accord !": { de: "Vorsicht: \u201E{complement}\u201C ist ein indirektes Objekt, daher gibt es keine Angleichung!", en: "Watch out: \u201C{complement}\u201D is an indirect object, so there is no agreement!", it: "Attenzione: \xAB{complement}\xBB \xE8 un complemento indiretto, quindi nessuna concordanza!", es: "Atenci\xF3n: \xAB{complement}\xBB es un complemento indirecto, as\xED que no hay concordancia." }
};
const coachHelpApproachTitles = {
  "complete-avec-reponses": {
    fr: "Aide compl\xE8te avec r\xE9ponses",
    de: "Ausf\xFChrliche Hilfe mit Antworten",
    en: "Detailed help with answers",
    it: "Aiuto completo con risposte",
    es: "Ayuda completa con respuestas"
  },
  complete: {
    fr: "Aide compl\xE8te sans r\xE9ponses",
    de: "Ausf\xFChrliche Hilfe ohne Antworten",
    en: "Detailed help without answers",
    it: "Aiuto completo senza risposte",
    es: "Ayuda completa sin respuestas"
  },
  "tres-condensee": {
    fr: "Aide tr\xE8s condens\xE9e",
    de: "Sehr kompakte Hilfe",
    en: "Very concise help",
    it: "Aiuto molto sintetico",
    es: "Ayuda muy concisa"
  },
  allophone: {
    fr: "Aide allophone",
    de: "Hilfe f\xFCr Anderssprachige",
    en: "Help for non-native speakers",
    it: "Aiuto per allofoni",
    es: "Ayuda para hablantes de otras lenguas"
  }
};
function coachHelpApproachTitle(locale, approach) {
  return coachHelpApproachTitles[approach][locale];
}
function translateCoachUiText(locale, value) {
  var _a;
  if (!value || locale === "fr") return value || "";
  return ((_a = coachUiTexts[value]) == null ? void 0 : _a[locale]) || value;
}
function localizeCoachProfile(locale, coach) {
  if (locale === "fr") return coach;
  return {
    ...coach,
    caractereName: translateCoachUiText(locale, coach.caractereName),
    personality: translateCoachUiText(locale, coach.personality),
    pedagogicalStyle: translateCoachUiText(locale, coach.pedagogicalStyle),
    helpApproachName: translateCoachUiText(locale, coach.helpApproachName),
    description: translateCoachUiText(locale, coach.description),
    likes: translateCoachUiText(locale, coach.likes),
    replies: coach.replies.map((reply) => ({ ...reply, content: translateCoachUiText(locale, reply.content) }))
  };
}

function smallestOrder(items, key) {
  const orders = items.map((item) => item[key]).filter((value) => Number.isFinite(value));
  return orders.length ? Math.min(...orders) : void 0;
}
function coachPickerGroups(coaches) {
  const groups = /* @__PURE__ */ new Map();
  const defaultOrder = new Map(COACH_HELP_ENGINE_KEYS.map((approach, index) => [approach, index]));
  for (const coach of coaches) {
    const groupId = coach.helpApproachId ? `id:${coach.helpApproachId}` : `engine:${coach.helpApproach}`;
    const items = groups.get(groupId) || [];
    items.push(coach);
    groups.set(groupId, items);
  }
  return [...groups.entries()].sort(([, leftItems], [, rightItems]) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    const leftApproach = (_a = leftItems[0]) == null ? void 0 : _a.helpApproach;
    const rightApproach = (_b = rightItems[0]) == null ? void 0 : _b.helpApproach;
    const leftOrder = (_e = (_d = (_c = smallestOrder(leftItems, "caractereSortOrder")) != null ? _c : smallestOrder(leftItems, "helpApproachSortOrder")) != null ? _d : leftApproach ? defaultOrder.get(leftApproach) : void 0) != null ? _e : Number.MAX_SAFE_INTEGER;
    const rightOrder = (_h = (_g = (_f = smallestOrder(rightItems, "caractereSortOrder")) != null ? _f : smallestOrder(rightItems, "helpApproachSortOrder")) != null ? _g : rightApproach ? defaultOrder.get(rightApproach) : void 0) != null ? _h : Number.MAX_SAFE_INTEGER;
    return leftOrder - rightOrder || (leftApproach ? (_i = defaultOrder.get(leftApproach)) != null ? _i : Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER) - (rightApproach ? (_j = defaultOrder.get(rightApproach)) != null ? _j : Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
  }).map(([id, items]) => {
    var _a, _b, _c;
    const approach = ((_a = items[0]) == null ? void 0 : _a.helpApproach) || "complete-avec-reponses";
    const profile = coachHelpProfile(approach);
    return {
      id,
      approach,
      label: ((_c = (_b = items.find((item) => {
        var _a2;
        return (_a2 = item.helpApproachName) == null ? void 0 : _a2.trim();
      })) == null ? void 0 : _b.helpApproachName) == null ? void 0 : _c.trim()) || profile.label,
      description: profile.description,
      coaches: [...items].sort((left, right) => left.sortOrder - right.sortOrder || left.firstName.localeCompare(right.firstName, "fr") || left.id - right.id)
    };
  });
}

const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "LearnerErrorDetailMessage",
  __ssrInlineRender: true,
  props: {
    detail: {}
  },
  setup(__props) {
    const props = __props;
    const { interfaceLocale } = useLanguagePreferences();
    const isPersonConfusion = computed(() => props.detail.code === "person.other_form" && Boolean(props.detail.learnerValue) && Boolean(props.detail.expectedValue));
    const personSentence = computed(() => ({
      fr: { intro: "Tu as confondu la personne.", before: "Tu as conjugué avec", middle: "alors que c’était" },
      de: { intro: "Du hast die Person verwechselt.", before: "Du hast mit", middle: "konjugiert, erwartet war aber" },
      en: { intro: "You confused the grammatical person.", before: "You conjugated for", middle: "but the expected person was" },
      it: { intro: "Hai confuso la persona.", before: "Hai coniugato con", middle: "ma la persona richiesta era" },
      es: { intro: "Has confundido la persona.", before: "Has conjugado con", middle: "pero la persona esperada era" }
    })[interfaceLocale.value]);
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(isPersonConfusion)) {
        _push(`<span${ssrRenderAttrs(mergeProps({ class: "person-confusion-message" }, _attrs))} data-v-56038c0b>${ssrInterpolate(unref(personSentence).intro)} ${ssrInterpolate(unref(personSentence).before)} <mark class="is-wrong" data-v-56038c0b>${ssrInterpolate(__props.detail.learnerValue)}</mark>, ${ssrInterpolate(unref(personSentence).middle)} <mark class="is-correct" data-v-56038c0b>${ssrInterpolate(__props.detail.expectedValue)}</mark>. </span>`);
      } else {
        _push(`<span${ssrRenderAttrs(_attrs)} data-v-56038c0b>${ssrInterpolate(unref(localizedLearnerErrorMessage)(__props.detail, unref(interfaceLocale)))}</span>`);
      }
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/exercise/LearnerErrorDetailMessage.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const LearnerErrorDetailMessage = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$5, [["__scopeId", "data-v-56038c0b"]]), { __name: "ExerciseLearnerErrorDetailMessage" });
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "ExerciseSummaryPrintPreview",
  __ssrInlineRender: true,
  props: {
    items: {},
    score: {},
    correctCount: {},
    verbs: {},
    tenses: {}
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const { ui, interfaceLocale } = useLanguagePreferences();
    useSiteAnalytics();
    useTemplateRef("summary-print-dialog");
    useTemplateRef("summary-print-frame");
    const pdfPreviewUrl = ref("");
    const previewError = ref("");
    const isPreviewBusy = ref(true);
    const isFrameReady = ref(false);
    const isPdfBusy = ref(false);
    computed(() => new Intl.DateTimeFormat(`${interfaceLocale.value}-CH`, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(/* @__PURE__ */ new Date()).replace(",", ""));
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="summary-print-overlay" role="dialog" aria-modal="true" aria-labelledby="summary-print-title" data-v-dbdb34db><section class="summary-print-modal" data-v-dbdb34db><header class="summary-print-toolbar" data-v-dbdb34db><h2 id="summary-print-title" data-v-dbdb34db>${ssrInterpolate(unref(ui)("Aperçu du bilan"))}</h2><div data-v-dbdb34db><button type="button" class="secondary-button" data-v-dbdb34db>${ssrInterpolate(unref(ui)("Fermer"))}</button><button type="button" class="secondary-button"${ssrIncludeBooleanAttr(!unref(pdfPreviewUrl) || !unref(isFrameReady)) ? " disabled" : ""} data-v-dbdb34db>${ssrInterpolate(unref(ui)("Imprimer"))}</button><button type="button" class="primary-button"${ssrIncludeBooleanAttr(unref(isPdfBusy)) ? " disabled" : ""} data-v-dbdb34db>${ssrInterpolate(unref(isPdfBusy) ? "Création…" : "PDF")}</button></div></header><main class="summary-print-preview" data-v-dbdb34db>`);
        if (unref(pdfPreviewUrl)) {
          _push2(`<iframe${ssrRenderAttr("src", `${unref(pdfPreviewUrl)}#view=FitH&toolbar=0&navpanes=0`)}${ssrRenderAttr("title", unref(ui)("Aperçu du bilan au format PDF"))} data-v-dbdb34db></iframe>`);
        } else {
          _push2(`<!---->`);
        }
        if (!unref(previewError) && (unref(isPreviewBusy) || !unref(isFrameReady))) {
          _push2(`<div class="summary-print-state" role="status" aria-live="polite" data-v-dbdb34db><span aria-hidden="true" data-v-dbdb34db></span><strong data-v-dbdb34db>${ssrInterpolate(unref(ui)("Création de l’aperçu PDF…"))}</strong></div>`);
        } else {
          _push2(`<!---->`);
        }
        if (unref(previewError)) {
          _push2(`<div class="summary-print-state summary-print-state--error" role="alert" data-v-dbdb34db><strong data-v-dbdb34db>${ssrInterpolate(unref(previewError))}</strong><button type="button" class="secondary-button" data-v-dbdb34db>${ssrInterpolate(unref(ui)("Réessayer"))}</button></div>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`</main></section></div>`);
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/exercise/ExerciseSummaryPrintPreview.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$4, [["__scopeId", "data-v-dbdb34db"]]), { __name: "ExerciseSummaryPrintPreview" });
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "LearnerErrorFeedback",
  __ssrInlineRender: true,
  props: {
    details: {},
    compact: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const { interfaceLocale } = useLanguagePreferences();
    const visibleDetails = computed(() => props.details.filter((detail) => detail.code !== "input.close_form"));
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(visibleDetails).length) {
        _push(`<div${ssrRenderAttrs(mergeProps({
          class: ["learner-error-feedback", { "is-compact": __props.compact }]
        }, _attrs))} data-v-c69925e4><ul data-v-c69925e4><!--[-->`);
        ssrRenderList(unref(visibleDetails), (detail) => {
          _push(`<li data-v-c69925e4><b data-v-c69925e4>`);
          _push(ssrRenderComponent(LearnerErrorDetailMessage, { detail }, null, _parent));
          _push(`</b>`);
          if (detail.code !== "person.other_form" && detail.learnerValue && detail.expectedValue) {
            _push(`<span class="learner-error-feedback__comparison" data-v-c69925e4><del data-v-c69925e4>${ssrInterpolate(detail.learnerValue)}</del><span data-v-c69925e4>${ssrInterpolate(unref(learnerErrorInsteadOf)(unref(interfaceLocale)))}</span><ins data-v-c69925e4>${ssrInterpolate(detail.expectedValue)}</ins></span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</li>`);
        });
        _push(`<!--]--></ul></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/exercise/LearnerErrorFeedback.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const LearnerErrorFeedback = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$3, [["__scopeId", "data-v-c69925e4"]]), { __name: "ExerciseLearnerErrorFeedback" });
let recordingQueue = Promise.resolve(true);
function progressIdentifier(prefix) {
  const uuid = globalThis.crypto?.randomUUID?.();
  return `${prefix}-${uuid || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`}`;
}
function createLearnerTrackingContext(input) {
  return {
    ...input,
    runId: progressIdentifier("run")
  };
}
function compactQuestion(question) {
  return {
    titre: question.titre,
    instruction: question.instruction,
    consigne: question.consigne,
    reponses: [...question.reponses],
    reponsesPourCorrige: [...question.reponsesPourCorrige],
    futureSimpleAnswers: question.futureSimpleAnswers ? [...question.futureSimpleAnswers] : void 0,
    conjugationConfusions: question.conjugationConfusions ? question.conjugationConfusions.map((confusion) => ({
      tense: confusion.tense,
      mode: confusion.mode,
      answers: [...confusion.answers]
    })) : void 0,
    verbeId: question.verbeId,
    tenseId: question.tenseId,
    personId: question.personId,
    infinitif: question.infinitif,
    pronom: question.pronom,
    temps: question.temps,
    mode: question.mode,
    isCompound: question.isCompound,
    conjugaison1: question.conjugaison1,
    conjugaison2: question.conjugaison2,
    conjugaison3: question.conjugaison3,
    radicalReference: question.radicalReference?.paradigmForms?.length ? {
      kind: question.radicalReference.kind,
      label: question.radicalReference.label,
      form: question.radicalReference.form,
      removableEnding: question.radicalReference.removableEnding,
      radical: question.radicalReference.radical,
      paradigmForms: question.radicalReference.paradigmForms.map((form) => ({ ...form }))
    } : void 0,
    complement: question.complement,
    complementPosition: question.complementPosition,
    complementFunction: question.complementFunction,
    saisiePrefixe: question.saisiePrefixe,
    agreementReminder: question.agreementReminder ? { ...question.agreementReminder } : void 0,
    literaryCitation: question.literaryCitation ? { ...question.literaryCitation } : void 0
  };
}
function useLearnerProgress() {
  const { user, clearUser } = useLearnerAuth();
  function recordQuestionPlan(context, questions) {
    if (!context || !user.value || !questions.length) return Promise.resolve(false);
    const task = async () => {
      try {
        await $fetch("/api/learner/activity/plan", {
          method: "POST",
          credentials: "same-origin",
          body: {
            ...context,
            questions: questions.map(compactQuestion)
          }
        });
        return true;
      } catch (error) {
        const status = error?.statusCode ?? error?.response?.status;
        if (status === 401) clearUser();
        console.error("[learner] Plan de questions non enregistré.", error);
        return false;
      }
    };
    recordingQueue = recordingQueue.then(task, task);
    return recordingQueue;
  }
  function recordAttempt(context, attempt, questionIndex) {
    if (!context || !user.value) return Promise.resolve(false);
    const task = async () => {
      try {
        await $fetch("/api/learner/activity/attempt", {
          method: "POST",
          credentials: "same-origin",
          body: {
            attemptId: progressIdentifier("attempt"),
            ...context,
            questionIndex: questionIndex + (context.questionIndexOffset || 0),
            attemptNumber: attempt.attemptNumber || 1,
            question: compactQuestion(attempt.question),
            answer: attempt.answer,
            correct: attempt.status === "correct"
          }
        });
        return true;
      } catch (error) {
        const status = error?.statusCode ?? error?.response?.status;
        if (status === 401) clearUser();
        console.error("[learner] Tentative non enregistrée.", error);
        return false;
      }
    };
    recordingQueue = recordingQueue.then(task, task);
    return recordingQueue;
  }
  return {
    recordQuestionPlan,
    recordAttempt,
    flushProgress: () => recordingQueue
  };
}
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
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
    requireSuccess: { type: Boolean },
    analyticsMetadata: {}
  },
  emits: ["close"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const { interfaceLocale, ui, uiLabel } = useLanguagePreferences();
    const props = __props;
    const { track } = useSiteAnalytics();
    useLearnerProgress();
    const exerciseAnalyticsMetadata = computed(() => ({
      ...props.analyticsMetadata,
      presentation: "chat",
      exerciseKind: props.exerciseKind || props.trackingContext?.challenge.exerciseKind || "conjugation",
      coach: props.coach.id
    }));
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
    const finished = ref(false);
    const finalSummaryPreparing = ref(false);
    const finalSummaryVisible = ref(false);
    const regeneratingQuestions = ref(false);
    ref(false);
    const restartError = ref("");
    const printSummaryOpen = ref(false);
    const closeConfirmationOpen = ref(false);
    const helpOpen = ref(Boolean(props.tourDemo));
    const helpQuestionIndex = ref(null);
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
    const questionNumberOffset = computed(() => props.trackingContext?.questionIndexOffset || 0);
    const displayedQuestionNumber = computed(() => questionNumberOffset.value + currentIndex.value + 1);
    const displayedQuestionCount = computed(() => questionNumberOffset.value ? props.trackingContext?.challenge.questionCount || props.questions.length : props.questions.length);
    const helpQuestion = computed(() => props.questions[helpQuestionIndex.value ?? currentIndex.value]);
    const helpVerb = computed(() => {
      const question = helpQuestion.value;
      if (!question) return void 0;
      return props.verbs.find((verb) => verb.id === question.verbeId) || props.verbs.find((verb) => normalizedInfinitive(verb.infinitif) === normalizedInfinitive(question.infinitif));
    });
    const helpTense = computed(() => {
      const question = helpQuestion.value;
      if (!question) return void 0;
      return props.tenses.find((tense) => tense.id === question.tenseId) || props.tenses.find((tense) => normalizedInfinitive(tense.name) === normalizedInfinitive(question.temps));
    });
    const usesIdentificationHelp = computed(() => isIdentificationExercise.value);
    const targetedHelp = computed(() => helpQuestion.value ? buildTargetedConjugationHelp(helpQuestion.value, helpVerb.value, helpTense.value, {
      tense: uiLabel(helpQuestion.value.temps || helpTense.value?.name),
      mode: uiLabel(helpQuestion.value.mode || helpTense.value?.mode?.name)
    }) : null);
    const helpBlocks = computed(() => usesIdentificationHelp.value ? literaryIdentificationCoachHelpBlocks() : visibleCoachHelpBlocks(props.coach.helpApproach, helpQuestion.value));
    const correctCount = computed(() => attempts.value.filter((item) => item.status === "correct").length);
    const score = computed(() => attempts.value.length ? Math.round(correctCount.value / attempts.value.length * 100) : 0);
    const omitIndicativeMode = computed(() => areOnlyIndicativeTenses(props.tenses));
    const attemptSummaries = computed(() => attempts.value.map((attempt, index) => {
      const bubbles = coachQuestionBubbles(attempt.question, {
        omitIndicativeMode: omitIndicativeMode.value,
        modeLabel: uiLabel(attempt.question.mode),
        tenseLabel: uiLabel(attempt.question.temps)
      });
      const formula = omitIndicativeMode.value ? withoutIndicativeMode(bubbles.formula) : bubbles.formula;
      return {
        index: index + 1,
        questionIndex: index,
        status: attempt.status,
        questionLabel: formula,
        learnerAnswer: attempt.answer,
        expectedAnswer: attempt.question.reponsesPourCorrige.join(` ${ui("ou")} `) || attempt.question.reponses.join(` ${ui("ou")} `),
        errorLabels: attempt.errorLabels || [],
        errorDetails: attempt.errorDetails || [],
        identificationForm: isIdentificationExercise.value && attempt.status === "incorrect" ? identificationFormParts(attempt.question) : null,
        literaryCitation: attempt.question.literaryCitation
      };
    }));
    const hasIncorrectMedia = computed(() => props.coach.assignments.some((assignment) => assignment.isActive && assignment.eventType === "incorrect" && props.coach.media.some((item) => item.id === assignment.mediaId && item.isActive && item.category === "encouragement" && (item.mediaType === "animation" || item.mediaType === "emoji"))));
    function normalizedInfinitive(value) {
      return (value || "").normalize("NFD").replace(new RegExp("\\p{Diacritic}", "gu"), "").trim().toLocaleLowerCase("fr");
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
    function contextFor(question, hideIdentificationAnswer = false) {
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
        mode: hidesAnswer ? void 0 : uiLabel(question?.mode),
        tense: hidesAnswer ? void 0 : uiLabel(question?.temps),
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
        void suggestHelp();
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
    async function suggestHelp() {
      const question = currentQuestion.value;
      if (!question || finished.value) return;
      const wasHelpOpen = helpOpen.value;
      helpQuestionIndex.value = null;
      helpOpen.value = true;
      if (!wasHelpOpen) {
        track("help_opened", { ...exerciseAnalyticsMetadata.value, source: "reminder" });
      }
      await nextTick();
      await addCoachReaction("help-announcement", contextFor(question));
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
      const _component_CoachHelpPanel = __nuxt_component_0$1;
      const _component_ExerciseSummaryPrintPreview = __nuxt_component_0;
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="chat-overlay" data-tour="chat-exercise" style="${ssrRenderStyle(unref(tourDemoReady) ? null : { display: "none" })}" data-v-5bf04c0e><div class="${ssrRenderClass([{ "chat-dialogs--with-help": unref(helpOpen), "chat-dialogs--confirming": unref(closeConfirmationOpen) }, "chat-dialogs"])}" style="${ssrRenderStyle({ "--coach-color": __props.coach.themeColor })}" role="dialog" aria-modal="true" aria-labelledby="chat-title" tabindex="-1" data-v-5bf04c0e><section class="chat-dialog" data-tour="chat-dialog" role="region" aria-labelledby="chat-title" data-v-5bf04c0e><header class="chat-header" data-v-5bf04c0e><img class="coach-avatar"${ssrRenderAttr("src", __props.coach.avatarPath)} alt="" data-v-5bf04c0e><div class="chat-header__identity" data-v-5bf04c0e><h2 id="chat-title" data-v-5bf04c0e>${ssrInterpolate(__props.coach.firstName)}</h2>`);
        if (__props.coach.likes) {
          _push2(`<p class="chat-header__likes" data-v-5bf04c0e><strong data-v-5bf04c0e>${ssrInterpolate(unref(ui)("Aime :"))}</strong> ${ssrInterpolate(__props.coach.likes)}</p>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`</div><div class="chat-header__actions" data-v-5bf04c0e><button type="button" class="chat-close"${ssrRenderAttr("aria-label", unref(ui)("Quitter le chat"))} data-v-5bf04c0e>×</button></div></header><div class="chat-progress"${ssrRenderAttr("aria-label", unref(ui)("Progression"))} data-v-5bf04c0e><span style="${ssrRenderStyle({ width: `${unref(finished) ? 100 : (unref(questionNumberOffset) + unref(currentIndex)) / unref(displayedQuestionCount) * 100}%` })}" data-v-5bf04c0e></span></div>`);
        if (!unref(finished) && unref(currentQuestion)) {
          _push2(`<div class="chat-instruction" data-v-5bf04c0e><span data-v-5bf04c0e>${ssrInterpolate(unref(ui)("Question {current} sur {total}", { current: unref(displayedQuestionNumber), total: unref(displayedQuestionCount) }))}</span></div>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`<div class="chat-thread" aria-live="polite" data-v-5bf04c0e><!--[-->`);
        ssrRenderList(unref(visibleMessages), (message) => {
          _push2(`<div${ssrRenderAttr("data-chat-message-id", message.id)} class="${ssrRenderClass([[
            `chat-message--${message.author}`,
            message.tone ? `chat-message--${message.tone}` : "",
            { "chat-message--comparison": !!message.answerComparison },
            { "chat-message--identification-question": message.identificationPrompt },
            { "chat-message--mobile-help-hint": message.mobileHelpHint },
            { "chat-message--help-link": message.author === "learner" && message.questionIndex !== void 0 },
            { "is-help-selected": unref(helpOpen) && message.questionIndex !== void 0 && message.questionIndex === unref(helpQuestionIndex) }
          ], "chat-message"])}"${ssrRenderAttr("role", message.author === "learner" && message.questionIndex !== void 0 ? "button" : void 0)}${ssrRenderAttr("tabindex", message.author === "learner" && message.questionIndex !== void 0 ? 0 : void 0)}${ssrRenderAttr("aria-label", message.author === "learner" && message.questionIndex !== void 0 ? unref(ui)("Voir l’aide de la question {number} pour la réponse {answer}", { number: message.questionIndex + 1, answer: message.text }) : void 0)} data-v-5bf04c0e>`);
          if (message.errorDetails?.length) {
            _push2(ssrRenderComponent(LearnerErrorFeedback, {
              details: message.errorDetails
            }, null, _parent));
          } else if (message.literaryCitation) {
            _push2(`<div class="chat-literary-question" data-v-5bf04c0e><blockquote class="chat-literary-citation" data-v-5bf04c0e><p data-v-5bf04c0e><span data-v-5bf04c0e>${ssrInterpolate(message.literaryCitation.before)}</span><mark data-v-5bf04c0e>${ssrInterpolate(message.literaryCitation.target)}</mark><span data-v-5bf04c0e>${ssrInterpolate(message.literaryCitation.after)}</span></p><footer data-v-5bf04c0e>${ssrInterpolate(message.literaryCitation.author)}, <cite data-v-5bf04c0e>${ssrInterpolate(message.literaryCitation.work)}</cite></footer></blockquote></div>`);
          } else if (message.identificationForm) {
            _push2(`<p class="chat-identification-form" data-v-5bf04c0e><span data-v-5bf04c0e>${ssrInterpolate(message.identificationForm.before)}</span><mark data-v-5bf04c0e>${ssrInterpolate(message.identificationForm.target)}</mark><span data-v-5bf04c0e>${ssrInterpolate(message.identificationForm.after)}</span></p>`);
          } else if (message.answerComparison) {
            _push2(`<div class="answer-comparison" data-v-5bf04c0e><strong data-v-5bf04c0e>${ssrInterpolate(message.answerComparison.mode === "focused" ? unref(ui)("Regarde où ça change :") : unref(ui)("Repars de la correction complète :"))}</strong><div class="answer-comparison__line answer-comparison__line--learner" data-v-5bf04c0e><small data-v-5bf04c0e>${ssrInterpolate(unref(ui)("Ta réponse"))}</small><p data-v-5bf04c0e><!--[-->`);
            ssrRenderList(message.answerComparison.learnerParts, (part, partIndex) => {
              _push2(`<span class="${ssrRenderClass(`answer-comparison__part--${part.kind}`)}" data-v-5bf04c0e>${ssrInterpolate(part.text)}</span>`);
            });
            _push2(`<!--]--></p></div><div class="answer-comparison__line answer-comparison__line--expected" data-v-5bf04c0e><small data-v-5bf04c0e>${ssrInterpolate(unref(ui)("Correction"))}</small><p data-v-5bf04c0e><!--[-->`);
            ssrRenderList(message.answerComparison.expectedParts, (part, partIndex) => {
              _push2(`<span class="${ssrRenderClass(`answer-comparison__part--${part.kind}`)}" data-v-5bf04c0e>${ssrInterpolate(part.text)}</span>`);
            });
            _push2(`<!--]--></p></div>`);
            if (message.answerComparison.mode === "full") {
              _push2(`<small class="answer-comparison__guidance" data-v-5bf04c0e>${ssrInterpolate(unref(ui)("Les deux réponses sont très différentes : observe d’abord la construction complète."))}</small>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else if (message.text && message.author === "coach") {
            _push2(`<span class="${ssrRenderClass([{ "chat-message__text--emphasis": message.emphasis }, "chat-message__text"])}" data-v-5bf04c0e>${unref(sanitizeCoachHtml)(message.text) ?? ""}</span>`);
          } else if (message.text && message.emphasis) {
            _push2(`<strong data-v-5bf04c0e>${ssrInterpolate(message.text)}</strong>`);
          } else if (message.text) {
            _push2(`<span data-v-5bf04c0e>${ssrInterpolate(message.text)}</span>`);
          } else {
            _push2(`<!---->`);
          }
          if (message.media?.mediaType === "video") {
            _push2(`<video${ssrRenderAttr("src", message.media.filePath)}${ssrRenderAttr("aria-label", message.media.altText)} muted playsinline controls data-v-5bf04c0e></video>`);
          } else if (message.media) {
            _push2(`<img class="${ssrRenderClass({ "chat-media--emoji": message.media.mediaType === "emoji" })}"${ssrRenderAttr("src", message.media.filePath)}${ssrRenderAttr("alt", message.media.altText)} data-v-5bf04c0e>`);
          } else {
            _push2(`<!---->`);
          }
          if (message.identificationPrompt && message.questionIndex === unref(currentIndex)) {
            _push2(`<div class="chat-identification-choices" data-v-5bf04c0e>`);
            if (unref(activeExerciseKind) === "tense-identification" && unref(selectedIdentificationMode)) {
              _push2(`<div class="chat-tense-choice-step" data-v-5bf04c0e><div class="chat-tense-choice-step__header" data-v-5bf04c0e><button type="button" data-v-5bf04c0e>← ${ssrInterpolate(unref(ui)("Modes"))}</button><strong data-v-5bf04c0e>${ssrInterpolate(unref(ui)("Choisis le temps"))}</strong></div><div class="chat-tense-choices" role="group"${ssrRenderAttr("aria-label", unref(ui)("Choisis le temps"))} data-v-5bf04c0e><!--[-->`);
              ssrRenderList(unref(selectedModeTenseRows), (row) => {
                _push2(`<div class="chat-tense-choice-row" data-v-5bf04c0e>`);
                if (row.simple) {
                  _push2(`<button type="button"${ssrIncludeBooleanAttr(unref(waitingForNext) || unref(posingQuestion) || unref(deliveringFeedback)) ? " disabled" : ""} data-v-5bf04c0e>${ssrInterpolate(unref(uiLabel)(row.simple.name))}</button>`);
                } else {
                  _push2(`<span aria-hidden="true" data-v-5bf04c0e></span>`);
                }
                if (row.compound) {
                  _push2(`<button type="button"${ssrIncludeBooleanAttr(unref(waitingForNext) || unref(posingQuestion) || unref(deliveringFeedback)) ? " disabled" : ""} data-v-5bf04c0e>${ssrInterpolate(unref(uiLabel)(row.compound.name))}</button>`);
                } else {
                  _push2(`<span aria-hidden="true" data-v-5bf04c0e></span>`);
                }
                _push2(`</div>`);
              });
              _push2(`<!--]--></div></div>`);
            } else {
              _push2(`<div class="chat-mode-choices" role="group"${ssrRenderAttr("aria-label", unref(ui)("Choisis le mode"))} data-v-5bf04c0e><!--[-->`);
              ssrRenderList(unref(displayedIdentificationModeChoices), (choice) => {
                _push2(`<button type="button"${ssrIncludeBooleanAttr(unref(waitingForNext) || unref(posingQuestion) || unref(deliveringFeedback)) ? " disabled" : ""} data-v-5bf04c0e>${ssrInterpolate(choice.label)}</button>`);
              });
              _push2(`<!--]--></div>`);
            }
            _push2(`</div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div>`);
        });
        _push2(`<!--]-->`);
        if (unref(finalSummaryPreparing)) {
          _push2(`<div class="chat-summary-loading" role="status" aria-live="polite" data-v-5bf04c0e><span aria-hidden="true" data-v-5bf04c0e></span><strong data-v-5bf04c0e>${ssrInterpolate(unref(ui)("Création du bilan"))}</strong></div>`);
        } else {
          _push2(`<!---->`);
        }
        if (unref(finalSummaryVisible)) {
          _push2(`<section class="chat-summary-tool" aria-labelledby="chat-summary-title" data-v-5bf04c0e><header data-v-5bf04c0e><div data-v-5bf04c0e><h3 id="chat-summary-title" data-v-5bf04c0e>${ssrInterpolate(unref(ui)("Bilan du défi"))}</h3></div><strong data-v-5bf04c0e>${ssrInterpolate(unref(score))} %</strong></header><ol class="chat-summary-list" data-v-5bf04c0e><!--[-->`);
          ssrRenderList(unref(attemptSummaries), (item) => {
            _push2(`<li class="${ssrRenderClass([`is-${item.status}`, { "is-help-selected": unref(helpOpen) && item.questionIndex === unref(helpQuestionIndex) }])}" style="${ssrRenderStyle({ "--summary-item-index": `${item.index - 1}` })}" role="button" tabindex="0"${ssrRenderAttr("aria-label", unref(ui)("Voir l’aide de la question {number} : {question}", { number: item.index, question: item.questionLabel }))} data-v-5bf04c0e><span class="chat-summary-list__status" aria-hidden="true" data-v-5bf04c0e>${ssrInterpolate(item.status === "correct" ? "✓" : "×")}</span><div data-v-5bf04c0e><strong class="chat-summary-list__question" data-v-5bf04c0e><span data-v-5bf04c0e>${ssrInterpolate(unref(ui)("Question"))} ${ssrInterpolate(item.index)}</span><span data-v-5bf04c0e>${ssrInterpolate(item.questionLabel)}</span></strong>`);
            if (item.identificationForm) {
              _push2(`<blockquote class="chat-summary-list__citation" data-v-5bf04c0e><p data-v-5bf04c0e><span data-v-5bf04c0e>${ssrInterpolate(item.identificationForm.before)}</span><mark data-v-5bf04c0e>${ssrInterpolate(item.identificationForm.target)}</mark><span data-v-5bf04c0e>${ssrInterpolate(item.identificationForm.after)}</span></p>`);
              if (item.literaryCitation) {
                _push2(`<footer data-v-5bf04c0e>${ssrInterpolate(item.literaryCitation.author)}, <cite data-v-5bf04c0e>${ssrInterpolate(item.literaryCitation.work)}</cite></footer>`);
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
            _push2(`<dl data-v-5bf04c0e><div data-v-5bf04c0e><dt data-v-5bf04c0e>${ssrInterpolate(unref(ui)("Réponse donnée"))}</dt><dd data-v-5bf04c0e>${ssrInterpolate(item.learnerAnswer)}</dd></div><div data-v-5bf04c0e><dt data-v-5bf04c0e>${ssrInterpolate(unref(ui)("Bonne réponse"))}</dt><dd data-v-5bf04c0e>${ssrInterpolate(item.expectedAnswer)}</dd></div></dl></div></li>`);
          });
          _push2(`<!--]--></ol><footer data-v-5bf04c0e><strong data-v-5bf04c0e>${ssrInterpolate(unref(correctCount))} / ${ssrInterpolate(unref(attempts).length)}</strong><span data-v-5bf04c0e>${ssrInterpolate(unref(correctCount) === 1 ? unref(ui)("réponse juste") : unref(ui)("réponses justes"))}</span></footer></section>`);
        } else {
          _push2(`<!---->`);
        }
        if (unref(finalSummaryVisible)) {
          _push2(`<div class="chat-message chat-message--coach chat-restart-prompt" data-v-5bf04c0e><span data-v-5bf04c0e>${ssrInterpolate(unref(ui)("Tu veux refaire ce défi ?"))}</span><div class="chat-restart-prompt__actions" data-v-5bf04c0e><button type="button" class="chat-restart-prompt__same"${ssrIncludeBooleanAttr(unref(regeneratingQuestions)) ? " disabled" : ""} data-v-5bf04c0e>${ssrInterpolate(unref(ui)("Avec les mêmes questions"))}</button><button type="button" class="chat-restart-prompt__new"${ssrIncludeBooleanAttr(unref(regeneratingQuestions)) ? " disabled" : ""} data-v-5bf04c0e>${ssrInterpolate(unref(regeneratingQuestions) ? unref(ui)("Préparation…") : unref(ui)("Avec d’autres questions"))}</button><button type="button" class="chat-restart-prompt__quit"${ssrIncludeBooleanAttr(unref(regeneratingQuestions)) ? " disabled" : ""} data-v-5bf04c0e>${ssrInterpolate(unref(ui)("Quitter le chat"))}</button><button type="button" class="chat-restart-prompt__print"${ssrIncludeBooleanAttr(unref(regeneratingQuestions)) ? " disabled" : ""} data-v-5bf04c0e>${ssrInterpolate(unref(ui)("Imprimer le bilan"))}</button></div>`);
          if (unref(restartError)) {
            _push2(`<small class="chat-restart-prompt__error" role="alert" data-v-5bf04c0e>${ssrInterpolate(unref(restartError))}</small>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`</div>`);
        if (!unref(finished)) {
          _push2(`<form class="chat-composer" data-v-5bf04c0e><label class="sr-only" for="chat-answer" data-v-5bf04c0e>${ssrInterpolate(unref(ui)("Ta réponse"))}</label><input id="chat-answer"${ssrRenderAttr("value", unref(answer))} type="text" autocomplete="off"${ssrIncludeBooleanAttr(unref(waitingForNext)) ? " disabled" : ""}${ssrRenderAttr("placeholder", unref(chatAnswerPlaceholder))} data-v-5bf04c0e><button type="submit"${ssrIncludeBooleanAttr(unref(waitingForNext) || unref(posingQuestion) || unref(deliveringFeedback) || !unref(answer).trim()) ? " disabled" : ""} data-v-5bf04c0e>${ssrInterpolate(unref(posingQuestion) ? unref(ui)("Question…") : unref(deliveringFeedback) ? unref(ui)("Réponse…") : unref(waitingForNext) ? unref(ui)("Suite…") : unref(ui)("Envoyer"))}</button></form>`);
        } else {
          _push2(`<!---->`);
        }
        if (unref(helpOpen) && unref(helpQuestionIndex) !== null) {
          _push2(`<button type="button" class="${ssrRenderClass([{ "chat-latest-help--above-composer": !unref(finished) }, "chat-latest-help"])}"${ssrRenderAttr("aria-label", unref(finished) ? unref(ui)("Revenir à l’aide de la dernière question") : unref(ui)("Revenir à l’aide de la question actuelle"))}${ssrRenderAttr("title", unref(finished) ? unref(ui)("Voir l’aide de la dernière question") : unref(ui)("Voir l’aide de la question actuelle"))} data-v-5bf04c0e><span aria-hidden="true" data-v-5bf04c0e>↓</span></button>`);
        } else {
          _push2(`<!---->`);
        }
        if (unref(closeConfirmationOpen)) {
          _push2(`<div class="chat-close-confirmation" data-v-5bf04c0e><section role="alertdialog" aria-modal="true" aria-labelledby="chat-close-title" aria-describedby="chat-close-description" data-v-5bf04c0e><span class="chat-close-confirmation__icon" aria-hidden="true" data-v-5bf04c0e>?</span><h3 id="chat-close-title" data-v-5bf04c0e>${ssrInterpolate(unref(ui)("Quitter le chat ?"))}</h3><p id="chat-close-description" data-v-5bf04c0e>${ssrInterpolate(unref(ui)("Ta progression actuelle sera perdue."))}</p><div class="chat-close-confirmation__actions" data-v-5bf04c0e><button class="secondary-button" type="button" data-v-5bf04c0e>${ssrInterpolate(unref(ui)("Continuer l’exercice"))}</button><button class="primary-button chat-close-confirmation__leave" type="button" data-v-5bf04c0e>${ssrInterpolate(unref(ui)("Quitter"))}</button></div></section></div>`);
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
            "include-automatic-orthography": !unref(usesIdentificationHelp),
            "enable-automatic-audit": !unref(usesIdentificationHelp),
            onContentScroll: restartHelpReminderTimer,
            onClose: closeHelp
          }, null, _parent));
        } else {
          _push2(`<!---->`);
        }
        _push2(`</template></div>`);
        if (unref(printSummaryOpen)) {
          _push2(ssrRenderComponent(_component_ExerciseSummaryPrintPreview, {
            items: unref(attemptSummaries),
            score: unref(score),
            "correct-count": unref(correctCount),
            verbs: __props.verbs.map((verb) => verb.infinitif),
            tenses: __props.tenses.map((tense) => ({ name: tense.name, mode: tense.mode?.name })),
            onClose: ($event) => printSummaryOpen.value = false
          }, null, _parent));
        } else {
          _push2(`<!---->`);
        }
        _push2(`</div>`);
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/exercise/ChatExercise.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const ChatExercise = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$2, [["__scopeId", "data-v-5bf04c0e"]]), { __name: "ExerciseChatExercise" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
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
    const props = __props;
    const { track } = useSiteAnalytics();
    const { recordAttempt } = useLearnerProgress();
    const currentIndex = ref(0);
    const answer = ref("");
    const selectedIdentificationMode = ref("");
    const lastIncorrectIdentificationAnswer = ref("");
    const isSmallScreen = ref(false);
    const feedback = ref("idle");
    const retryAlreadyOffered = ref(false);
    const retryMessageVisible = ref(false);
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
    const closeConfirmationOpen = ref(false);
    const answerInput = useTemplateRef("answer-input");
    useTemplateRef("keep-exercise-button");
    useTemplateRef("exercise-dialog");
    const exerciseAnalyticsMetadata = computed(() => ({
      ...props.analyticsMetadata,
      presentation: "classic",
      exerciseKind: props.exerciseKind
    }));
    const currentQuestion = computed(() => props.questions[currentIndex.value]);
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
    const correctCount = computed(() => attempts.value.filter((attempt) => attempt.status === "correct").length);
    const scorePercent = computed(() => attempts.value.length ? Math.round(correctCount.value / attempts.value.length * 100) : 0);
    const correction = computed(() => currentQuestion.value?.reponsesPourCorrige.join(` ${ui("ou")} `) ?? "");
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
      errorDetails: attempt.errorDetails || []
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
      const { result, shouldRetry } = evaluateExerciseAnswer(
        answer.value,
        question.reponses,
        retryAlreadyOffered.value
      );
      lastIncorrectIdentificationAnswer.value = isIdentificationExercise.value && !result.isCorrect ? answer.value : "";
      const usedFutureSimple = !isIdentificationExercise.value && !result.isCorrect && isFutureSimpleInsteadOfNearFuture(answer.value, question);
      const otherConjugations = isIdentificationExercise.value || result.isCorrect ? [] : findConjugationConfusions(answer.value, question);
      const impossibleEnding = isIdentificationExercise.value || result.isCorrect ? null : findImpossibleSingularEnding(answer.value, question);
      const hasAgreementError = !isIdentificationExercise.value && !result.isCorrect && Boolean(diagnoseCoachAgreement(answer.value, question));
      const diagnostic = isIdentificationExercise.value ? null : diagnoseCoachAnswer(answer.value, question, result.isCorrect);
      const detectedAuxiliaryError = diagnostic?.errorKind === "auxiliary" && diagnostic.learnerAuxiliary && diagnostic.expectedAuxiliary ? { learner: diagnostic.learnerAuxiliary, expected: diagnostic.expectedAuxiliary } : void 0;
      const currentErrorDetails = result.isCorrect || isIdentificationExercise.value ? [] : learnerErrorDetails(answer.value, question);
      const currentErrorLabels = currentErrorDetails.map((detail) => detail.label);
      const attemptErrorLabels = mergeErrorLabels(pendingErrorLabels.value, currentErrorLabels);
      const attemptErrorDetails = mergeLearnerErrorDetails(pendingErrorDetails.value, currentErrorDetails);
      detectedErrorDetails.value = attemptErrorDetails;
      const trackedAttempt = {
        question,
        answer: answer.value,
        status: result.isCorrect ? "correct" : "incorrect",
        attemptNumber: retryAlreadyOffered.value ? 2 : 1,
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
      if (props.questions.length < 6) return;
      currentIndex.value = 5;
      answer.value = "";
      selectedIdentificationMode.value = "";
      lastIncorrectIdentificationAnswer.value = "";
      feedback.value = "idle";
      retryAlreadyOffered.value = false;
      retryMessageVisible.value = false;
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
      const _component_ExerciseSummaryPrintPreview = __nuxt_component_0;
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="exercise-overlay" data-tour="classic-exercise"><section class="exercise-dialog" role="dialog" aria-modal="true" aria-labelledby="exercise-title" tabindex="-1"><header class="exercise-header"><div><p class="dialog-kicker">${ssrInterpolate(unref(ui)("Questionnaire"))}</p><h2 id="exercise-title">${ssrInterpolate(unref(isFinished) ? unref(ui)("Résultats") : unref(ui)("Question {current} sur {total}", { current: unref(displayedQuestionNumber), total: unref(displayedQuestionCount) }))}</h2></div><button class="dialog-close" type="button"${ssrRenderAttr("aria-label", unref(ui)("Quitter l’exercice"))}>×</button></header><div class="exercise-progress"${ssrRenderAttr("aria-label", unref(ui)("Progression du questionnaire"))}><!--[-->`);
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
            _push2(`<p class="question-instruction">${ssrInterpolate(unref(uiLabel)(unref(currentQuestion).instruction))}</p>`);
          } else {
            _push2(`<!---->`);
          }
          if (__props.exerciseKind === "conjugation" && unref(currentQuestion).complement) {
            _push2(`<!--[--><p class="question-context"${ssrRenderAttr("aria-label", unref(ui)("Contexte grammatical"))}><span>${ssrInterpolate(unref(ui)("Verbe :"))} <strong>${ssrInterpolate(unref(currentQuestion).infinitif)}</strong></span><i aria-hidden="true">|</i><span>${ssrInterpolate(unref(ui)("Mode :"))} <strong>${ssrInterpolate(unref(uiLabel)(unref(currentQuestion).mode))}</strong></span><i aria-hidden="true">|</i><span>${ssrInterpolate(unref(ui)("Temps :"))} <strong>${ssrInterpolate(unref(uiLabel)(unref(currentQuestion).temps))}</strong></span>`);
            if (unref(currentQuestion).mode?.toLocaleLowerCase("fr") === "impératif") {
              _push2(`<!--[--><i aria-hidden="true">|</i><span>${ssrInterpolate(unref(ui)("Personne :"))} <strong>${ssrInterpolate(unref(currentQuestion).pronom)}</strong></span><!--]-->`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</p><form class="${ssrRenderClass([{ "is-awaiting-retry": unref(retryMessageVisible) }, "completion-form"])}"><div class="completion-sentence">`);
            if (unref(currentQuestion).complementPosition === "before") {
              _push2(`<span>${ssrInterpolate(unref(currentQuestion).complement)}</span>`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(currentQuestion).saisiePrefixe) {
              _push2(`<span class="completion-sentence__prefix">${ssrInterpolate(unref(currentQuestion).saisiePrefixe)}</span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<input id="exercise-answer"${ssrRenderAttr("value", unref(answer))} type="text" autocomplete="off"${ssrRenderAttr("aria-label", unref(ui)("Forme conjuguée de {verb}", { verb: unref(currentQuestion).infinitif || "" }))}${ssrIncludeBooleanAttr(unref(feedback) !== "idle") ? " disabled" : ""} class="${ssrRenderClass({
              "is-valid": unref(feedback) === "correct",
              "is-invalid": unref(feedback) === "incorrect" || unref(retryMessageVisible)
            })}"${ssrRenderAttr("aria-invalid", unref(feedback) === "incorrect" || unref(retryMessageVisible))}${ssrRenderAttr("aria-describedby", unref(feedback) !== "idle" ? "answer-feedback" : unref(retryMessageVisible) ? "answer-retry" : void 0)}>`);
            if (unref(currentQuestion).complementPosition !== "before") {
              _push2(`<span>${ssrInterpolate(unref(currentQuestion).complement)}${ssrInterpolate(unref(currentQuestion).mode?.toLocaleLowerCase("fr") === "impératif" ? " !" : "")}</span>`);
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
            if (unref(retryMessageVisible)) {
              _push2(`<div id="answer-retry" class="answer-retry" role="status" aria-live="polite"><span class="answer-retry__icon" aria-hidden="true">↻</span><div><strong>${ssrInterpolate(unref(ui)("Pas encore. Essaie une deuxième fois."))}</strong><small>${ssrInterpolate(unref(ui)("Modifie ta réponse ci-dessus, puis clique à nouveau sur « Vérifier »."))}</small></div></div>`);
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
          if (!(__props.exerciseKind === "conjugation" && unref(currentQuestion).complement)) {
            _push2(`<form class="${ssrRenderClass([{ "is-awaiting-retry": unref(retryMessageVisible) }, "answer-form"])}"><label for="exercise-answer">${ssrInterpolate(unref(ui)("Ta réponse"))}</label><div class="answer-form__row"><input id="exercise-answer"${ssrRenderAttr("value", unref(answer))} type="text" autocomplete="off"${ssrRenderAttr("placeholder", unref(answerPlaceholder))}${ssrIncludeBooleanAttr(unref(feedback) !== "idle") ? " disabled" : ""} class="${ssrRenderClass({
              "is-valid": unref(feedback) === "correct",
              "is-invalid": unref(feedback) === "incorrect" || unref(retryMessageVisible)
            })}"${ssrRenderAttr("aria-invalid", unref(feedback) === "incorrect" || unref(retryMessageVisible))}${ssrRenderAttr("aria-describedby", unref(feedback) !== "idle" ? "answer-feedback" : unref(retryMessageVisible) ? "answer-retry" : void 0)}>`);
            if (unref(feedback) === "idle") {
              _push2(`<button class="primary-button" type="submit"${ssrIncludeBooleanAttr(!unref(answer).trim()) ? " disabled" : ""}>${ssrInterpolate(unref(ui)("Vérifier"))}</button>`);
            } else {
              _push2(`<button class="primary-button" type="submit">${ssrInterpolate(unref(currentIndex) === __props.questions.length - 1 ? unref(ui)("Voir mes résultats") : unref(ui)("Question suivante"))}</button>`);
            }
            _push2(`</div></form>`);
          } else {
            _push2(`<!---->`);
          }
          if (unref(retryMessageVisible) && !(__props.exerciseKind === "conjugation" && unref(currentQuestion).complement)) {
            _push2(`<div id="answer-retry" class="answer-retry" role="status" aria-live="polite"><span class="answer-retry__icon" aria-hidden="true">↻</span><div><strong>${ssrInterpolate(unref(ui)("Pas encore. Essaie une deuxième fois."))}</strong><small>${ssrInterpolate(unref(ui)("Modifie ta réponse ci-dessus, puis clique à nouveau sur « Vérifier »."))}</small></div></div>`);
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
            _push2(`<div id="answer-feedback" data-tour="classic-correction" class="${ssrRenderClass([`answer-feedback--${unref(feedback)}`, "answer-feedback"])}" aria-live="polite"><strong>${ssrInterpolate(unref(feedback) === "correct" ? unref(ui)("Bravo, c’est juste !") : unref(ui)("Pas tout à fait."))}</strong>`);
            if (unref(feedback) === "incorrect") {
              _push2(`<p>${ssrInterpolate(unref(ui)("La réponse attendue était :"))} <strong>${ssrInterpolate(unref(correction))}</strong>.</p>`);
            } else if (unref(alternativeCorrections).length) {
              _push2(`<p>${ssrInterpolate(unref(ui)("On peut aussi répondre :"))} <strong>${ssrInterpolate(unref(alternativeText))}</strong>${ssrInterpolate(unref(alternativePunctuation))}</p>`);
            } else {
              _push2(`<p>${ssrInterpolate(unref(ui)("Tu peux passer à la question suivante."))}</p>`);
            }
            if (unref(detectedErrorDetails).length) {
              _push2(ssrRenderComponent(LearnerErrorFeedback, { details: unref(detectedErrorDetails) }, null, _parent));
            } else {
              _push2(`<!---->`);
            }
            if (unref(futureSimpleConfusion)) {
              _push2(`<aside class="grammar-reminder"><strong>${ssrInterpolate(unref(ui)("Futur proche ou futur simple ?"))}</strong><p>${ssrInterpolate(unref(ui)("Ta conjugaison est correcte au futur simple, mais la question demande le futur proche. Au futur simple, le verbe est conjugué en un seul mot (« tu mangeras »). Au futur proche, on utilise « aller » au présent suivi de l’infinitif (« tu vas manger »)."))}</p></aside>`);
            } else if (unref(conjugationConfusionText)) {
              _push2(`<aside class="grammar-reminder"><strong>${ssrInterpolate(unref(ui)("Attention au temps et au mode"))}</strong><p>${ssrInterpolate(unref(conjugationConfusionText))}</p></aside>`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(impossibleSingularEndingText)) {
              _push2(`<aside class="grammar-reminder"><strong>${ssrInterpolate(unref(ui)("Attention à la personne"))}</strong><p>${ssrInterpolate(unref(impossibleSingularEndingText))}</p></aside>`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(auxiliaryErrorText)) {
              _push2(`<aside class="grammar-reminder"><strong>${ssrInterpolate(unref(ui)("Attention à l’auxiliaire"))}</strong><p>${ssrInterpolate(unref(auxiliaryErrorText))}</p></aside>`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(agreementReminder) || unref(agreementError)) {
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
            _push2(`</td><td>${ssrInterpolate(attempt.answer)}</td><td>${ssrInterpolate(attempt.question.reponsesPourCorrige.join(` ${unref(ui)("ou")} `))}</td><td><span class="${ssrRenderClass({
              "result-good": attempt.status === "correct" && attempt.attemptNumber !== 2,
              "result-good--retry": attempt.status === "correct" && attempt.attemptNumber === 2,
              "result-bad": attempt.status === "incorrect"
            })}"${ssrRenderAttr("aria-label", attempt.status === "correct" && attempt.attemptNumber === 2 ? unref(ui)("Juste au deuxième essai") : void 0)}>${ssrInterpolate(attempt.status === "correct" ? unref(ui)("Juste") : unref(ui)("À revoir"))}</span></td></tr>`);
          });
          _push2(`<!--]--></tbody></table></div><div class="dialog-actions"><button class="secondary-button" type="button">${ssrInterpolate(unref(ui)("Fermer"))}</button><button class="secondary-button" type="button">${ssrInterpolate(unref(ui)("Imprimer le bilan"))}</button><button class="primary-button" type="button">${ssrInterpolate(unref(ui)("Recommencer"))}</button></div></div>`);
        }
        if (unref(closeConfirmationOpen)) {
          _push2(`<div class="exercise-close-confirmation"><section role="alertdialog" aria-modal="true" aria-labelledby="close-confirmation-title" aria-describedby="close-confirmation-description"><span class="exercise-close-confirmation__icon" aria-hidden="true">?</span><h3 id="close-confirmation-title">${ssrInterpolate(unref(ui)("Quitter l’exercice ?"))}</h3><p id="close-confirmation-description">${ssrInterpolate(unref(ui)("Ta progression actuelle sera perdue."))}</p><div class="exercise-close-confirmation__actions"><button class="secondary-button" type="button">${ssrInterpolate(unref(ui)("Continuer l’exercice"))}</button><button class="primary-button exercise-close-confirmation__leave" type="button">${ssrInterpolate(unref(ui)("Quitter"))}</button></div></section></div>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`</section>`);
        if (unref(printSummaryOpen)) {
          _push2(ssrRenderComponent(_component_ExerciseSummaryPrintPreview, {
            items: unref(summaryItems),
            score: unref(scorePercent),
            "correct-count": unref(correctCount),
            verbs: unref(summaryVerbs),
            tenses: unref(summaryTenses),
            onClose: ($event) => printSummaryOpen.value = false
          }, null, _parent));
        } else {
          _push2(`<!---->`);
        }
        _push2(`</div>`);
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/exercise/ClassicExercise.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const ClassicExercise = Object.assign(_sfc_main$1, { __name: "ExerciseClassicExercise" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "CoachPicker",
  __ssrInlineRender: true,
  props: {
    tourDemo: { type: Boolean },
    selectionPending: { type: Boolean },
    selectionError: {}
  },
  emits: ["close", "select"],
  setup(__props, { emit: __emit }) {
    const { interfaceLocale, ui } = useLanguagePreferences();
    const props = __props;
    const coaches = ref([]);
    const loading = ref(true);
    const error = ref("");
    const highlightedGroupId = ref("");
    const coachGroups = computed(() => coachPickerGroups(coaches.value).map((group) => ({
      ...group,
      label: coachHelpApproachTitle(interfaceLocale.value, group.approach),
      description: translateCoachUiText(interfaceLocale.value, group.description),
      coaches: (props.tourDemo && group.approach === "complete" ? group.coaches.slice(0, 2) : group.coaches).map((coach) => localizeCoachProfile(interfaceLocale.value, coach))
    })));
    function coachGroupDomId(id) {
      return `coach-help-${id.replace(/[^a-z0-9]+/giu, "-")}`;
    }
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="coach-picker-overlay" data-tour="coach-picker" data-v-9497308a><section class="coach-picker" role="dialog" aria-modal="true" aria-labelledby="coach-picker-title"${ssrRenderAttr("aria-busy", __props.selectionPending)} data-v-9497308a><header data-v-9497308a><div data-v-9497308a><h2 id="coach-picker-title" data-v-9497308a>${ssrInterpolate(unref(ui)("Choisis ton coach"))}</h2></div><button type="button"${ssrRenderAttr("aria-label", unref(ui)("Fermer"))}${ssrIncludeBooleanAttr(__props.selectionPending) ? " disabled" : ""} data-v-9497308a>×</button></header><div class="coach-safety" data-v-9497308a><strong data-v-9497308a>${ssrInterpolate(unref(ui)("Ces coaches sont des personnages virtuels automatisés."))}</strong><p data-v-9497308a>${ssrInterpolate(unref(ui)("Un avatar, un prénom ou un âge ne prouvent jamais l’identité d’une personne sur Internet."))}</p></div>`);
        if (__props.selectionPending) {
          _push2(`<p class="coach-picker__state coach-picker__state--pending" role="status" data-v-9497308a>${ssrInterpolate(unref(ui)("Préparation de la séance…"))}</p>`);
        } else if (__props.selectionError) {
          _push2(`<p class="coach-picker__state coach-picker__state--error" role="alert" data-v-9497308a>${ssrInterpolate(__props.selectionError)}</p>`);
        } else {
          _push2(`<!---->`);
        }
        if (unref(loading)) {
          _push2(`<p class="coach-picker__state" data-v-9497308a>${ssrInterpolate(unref(ui)("Chargement des coaches…"))}</p>`);
        } else if (unref(error)) {
          _push2(`<p class="coach-picker__state coach-picker__state--error" data-v-9497308a>${ssrInterpolate(unref(error))}</p>`);
        } else {
          _push2(`<!--[--><nav class="coach-help-menu"${ssrRenderAttr("aria-label", unref(ui)("Type d’aide"))} data-v-9497308a><!--[-->`);
          ssrRenderList(unref(coachGroups), (group) => {
            _push2(`<button type="button"${ssrRenderAttr("aria-controls", coachGroupDomId(group.id))} data-v-9497308a>${ssrInterpolate(group.label)}</button>`);
          });
          _push2(`<!--]--></nav><div class="coach-picker__groups" data-v-9497308a><!--[-->`);
          ssrRenderList(unref(coachGroups), (group) => {
            _push2(`<section${ssrRenderAttr("id", coachGroupDomId(group.id))} class="${ssrRenderClass([{ "is-scroll-target": unref(highlightedGroupId) === group.id }, "coach-caractere-group"])}"${ssrRenderAttr("data-tour", group.approach === "complete" ? "coach-complete-group" : void 0)} data-v-9497308a><header class="coach-caractere-group__header" data-v-9497308a><div data-v-9497308a><h3 data-v-9497308a>${ssrInterpolate(group.label)}</h3><p data-v-9497308a>${ssrInterpolate(group.description)}</p></div><small data-v-9497308a>${ssrInterpolate(unref(ui)(group.coaches.length > 1 ? "{count} coaches" : "{count} coach", { count: group.coaches.length }))}</small></header><div class="coach-picker__grid" data-v-9497308a><!--[-->`);
            ssrRenderList(group.coaches, (coach) => {
              _push2(`<button type="button" class="coach-card" style="${ssrRenderStyle({ "--coach-color": coach.themeColor })}"${ssrIncludeBooleanAttr(__props.selectionPending) ? " disabled" : ""} data-v-9497308a><img${ssrRenderAttr("src", coach.avatarPath)}${ssrRenderAttr("alt", unref(ui)("Avatar de {name}", { name: coach.firstName }))} data-v-9497308a><span data-v-9497308a><strong data-v-9497308a>${ssrInterpolate(coach.firstName)}</strong><small class="coach-card__caractere-description" data-v-9497308a>${ssrInterpolate(coach.pedagogicalStyle)}</small></span>`);
              if (coach.description) {
                _push2(`<blockquote data-v-9497308a>« ${ssrInterpolate(coach.description)} »</blockquote>`);
              } else {
                _push2(`<!---->`);
              }
              if (coach.likes) {
                _push2(`<p class="coach-card__likes" data-v-9497308a><b data-v-9497308a>${ssrInterpolate(unref(ui)("Aime :"))}</b> ${ssrInterpolate(coach.likes)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</button>`);
            });
            _push2(`<!--]--></div></section>`);
          });
          _push2(`<!--]--></div><!--]-->`);
        }
        _push2(`</section></div>`);
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/exercise/CoachPicker.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const CoachPicker = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-9497308a"]]), { __name: "ExerciseCoachPicker" });

export { ClassicExercise as C, LearnerErrorDetailMessage as L, ChatExercise as a, CoachPicker as b, createLearnerTrackingContext as c, useLearnerProgress as u };
//# sourceMappingURL=CoachPicker-BZYkJ1oV.mjs.map
