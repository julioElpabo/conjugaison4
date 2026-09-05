import { defineComponent, ref, computed, unref, useSSRContext } from 'vue';
import { ssrRenderTeleport, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderList, ssrRenderStyle } from 'vue/server-renderer';
import { w as withDutchVariants } from '../nitro/nitro.mjs';
import { f as useLanguagePreferences } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
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

const coachUiTexts = {
  "Compl\xE8te avec r\xE9ponses": withDutchVariants({ de: "Ausf\xFChrlich mit Antworten", en: "Detailed with answers", it: "Completo con risposte", es: "Completa con respuestas", nl: "Uitgebreid met antwoorden" }),
  "Explication d\xE9taill\xE9e avec r\xE9ponses et surlignages.": withDutchVariants({ de: "Ausf\xFChrliche Erkl\xE4rung mit Antworten und Hervorhebungen.", en: "Detailed explanation with answers and highlights.", it: "Spiegazione dettagliata con risposte ed evidenziazioni.", es: "Explicaci\xF3n detallada con respuestas y elementos destacados.", nl: "Uitgebreide uitleg met antwoorden en markeringen." }),
  "Compl\xE8te sans r\xE9ponses": withDutchVariants({ de: "Ausf\xFChrlich ohne Antworten", en: "Detailed without answers", it: "Completo senza risposte", es: "Completa sin respuestas", nl: "Uitgebreid zonder antwoorden" }),
  "Explication d\xE9taill\xE9e et conseils, sans r\xE9v\xE9ler la r\xE9ponse.": withDutchVariants({ de: "Ausf\xFChrliche Erkl\xE4rung und Tipps, ohne die Antwort zu verraten.", en: "Detailed explanation and tips without revealing the answer.", it: "Spiegazione dettagliata e consigli, senza rivelare la risposta.", es: "Explicaci\xF3n detallada y consejos, sin revelar la respuesta.", nl: "Uitgebreide uitleg en tips zonder het antwoord te verklappen." }),
  "Tr\xE8s condens\xE9e": withDutchVariants({ de: "Sehr kompakt", en: "Very concise", it: "Molto sintetico", es: "Muy concisa", nl: "Zeer beknopt" }),
  "Un rappel du groupe et une r\xE8gle courte adapt\xE9e au mode et au temps.": withDutchVariants({ de: "Eine Erinnerung an die Gruppe und eine kurze Regel passend zu Modus und Zeitform.", en: "A reminder of the group and a short rule suited to the mood and tense.", it: "Un promemoria del gruppo e una breve regola adatta al modo e al tempo.", es: "Un recordatorio del grupo y una regla breve adaptada al modo y al tiempo.", nl: "Een herinnering aan de groep en een korte regel die past bij de wijs en de tijd." }),
  "Allophone": withDutchVariants({ de: "F\xFCr Anderssprachige", en: "For non-native speakers", it: "Per allofoni", es: "Para hablantes de otras lenguas", nl: "Voor anderstaligen" }),
  "Une aide pas \xE0 pas, avec les r\xE9ponses, pens\xE9e pour les personnes qui apprennent le fran\xE7ais et le parlent depuis peu.": withDutchVariants({ de: "Eine schrittweise Hilfe mit Antworten f\xFCr Menschen, die Franz\xF6sisch lernen und es erst seit Kurzem sprechen.", en: "Step-by-step help with answers for people who are learning French and have only recently begun speaking it.", it: "Un aiuto passo dopo passo, con le risposte, pensato per chi sta imparando il francese e lo parla da poco.", es: "Una ayuda paso a paso, con respuestas, pensada para quienes est\xE1n aprendiendo franc\xE9s y lo hablan desde hace poco.", nl: "Stapsgewijze hulp met antwoorden voor wie Frans leert en de taal nog maar kort spreekt." }),
  "Aide condens\xE9e": withDutchVariants({ de: "Kompakte Hilfe", en: "Concise help", it: "Aiuto sintetico", es: "Ayuda concisa", nl: "Beknopte hulp" }),
  "Explique sans donner les r\xE9ponses, avec un minimum de mots": withDutchVariants({ de: "Erkl\xE4rt mit m\xF6glichst wenigen Worten, ohne die Antworten zu verraten", en: "Explains in as few words as possible without giving the answers", it: "Spiega con pochissime parole senza dare le risposte", es: "Explica con el m\xEDnimo de palabras sin dar las respuestas", nl: "Legt het zo kort mogelijk uit zonder de antwoorden te geven" }),
  "Aide compl\xE8te": withDutchVariants({ de: "Ausf\xFChrliche Hilfe", en: "Detailed help", it: "Aiuto completo", es: "Ayuda completa", nl: "Uitgebreide hulp" }),
  "Explique dans le d\xE9tail, sans jamais donner de r\xE9ponses": withDutchVariants({ de: "Erkl\xE4rt ausf\xFChrlich, ohne jemals die Antworten zu verraten", en: "Explains in detail without ever giving the answers", it: "Spiega nei dettagli senza mai dare le risposte", es: "Explica en detalle sin dar nunca las respuestas", nl: "Legt alles uitgebreid uit zonder ooit de antwoorden te geven" }),
  "Aide compl\xE8te avec r\xE9ponses": withDutchVariants({ de: "Ausf\xFChrliche Hilfe mit Antworten", en: "Detailed help with answers", it: "Aiuto completo con risposte", es: "Ayuda completa con respuestas", nl: "Uitgebreide hulp met antwoorden" }),
  "Explique dans le d\xE9tail et donne les r\xE9ponses de mani\xE8re compl\xE8te": withDutchVariants({ de: "Erkl\xE4rt ausf\xFChrlich und gibt vollst\xE4ndige Antworten", en: "Explains in detail and gives complete answers", it: "Spiega nei dettagli e fornisce risposte complete", es: "Explica en detalle y da las respuestas completas", nl: "Legt alles uitgebreid uit en geeft volledige antwoorden" }),
  "Apprendre, c'est se tromper": withDutchVariants({ de: "Lernen hei\xDFt, Fehler zu machen", en: "Learning means making mistakes", it: "Imparare significa sbagliare", es: "Aprender es equivocarse", nl: "Leren is fouten maken" }),
  "Le rap et le karat\xE9": withDutchVariants({ de: "Rap und Karate", en: "Rap and karate", it: "Il rap e il karate", es: "El rap y el k\xE1rate", nl: "Rap en karate" }),
  "Tu progresses chaque fois que tu refuses d'abandonner": withDutchVariants({ de: "Du machst jedes Mal Fortschritte, wenn du dich weigerst aufzugeben", en: "You make progress every time you refuse to give up", it: "Progredisci ogni volta che ti rifiuti di arrenderti", es: "Progresas cada vez que te niegas a rendirte", nl: "Je gaat vooruit telkens als je niet opgeeft" }),
  "Les promenades en montagne": withDutchVariants({ de: "Spazierg\xE4nge in den Bergen", en: "Walks in the mountains", it: "Le passeggiate in montagna", es: "Los paseos por la monta\xF1a", nl: "Wandelen in de bergen" }),
  "Une petite victoire par jour, \xE7a finit par faire une grosse diff\xE9rence.": withDutchVariants({ de: "Ein kleiner Sieg pro Tag macht am Ende einen gro\xDFen Unterschied.", en: "One small win a day eventually makes a big difference.", it: "Una piccola vittoria al giorno finisce per fare una grande differenza.", es: "Una peque\xF1a victoria al d\xEDa acaba marcando una gran diferencia.", nl: "Elke dag een kleine overwinning maakt uiteindelijk een groot verschil." }),
  "La musique et voir mes amis": withDutchVariants({ de: "Musik und meine Freunde treffen", en: "Music and seeing my friends", it: "La musica e vedere i miei amici", es: "La m\xFAsica y ver a mis amigos", nl: "Muziek en afspreken met mijn vrienden" }),
  "Les gens qui r\xE9ussissent ont surtout beaucoup essay\xE9": withDutchVariants({ de: "Erfolgreiche Menschen haben es vor allem oft versucht", en: "Successful people have mostly tried many times", it: "Le persone che riescono hanno soprattutto provato tante volte", es: "Quienes triunfan, ante todo, lo han intentado muchas veces", nl: "Wie slaagt, heeft vooral vaak geprobeerd" }),
  "Le parkour, le basket": withDutchVariants({ de: "Parkour und Basketball", en: "Parkour and basketball", it: "Il parkour e il basket", es: "El parkour y el baloncesto", nl: "Parkour en basketbal" }),
  "Chaque petit progr\xE8s compte.": withDutchVariants({ de: "Jeder kleine Fortschritt z\xE4hlt.", en: "Every little bit of progress counts.", it: "Ogni piccolo progresso conta.", es: "Cada peque\xF1o progreso cuenta.", nl: "Elk beetje vooruitgang telt." }),
  "Les mangas de science-fiction": withDutchVariants({ de: "Science-Fiction-Mangas", en: "Science-fiction manga", it: "I manga di fantascienza", es: "Los mangas de ciencia ficci\xF3n", nl: "Sciencefictionmanga" }),
  "Tu es plus capable que tu ne le crois": withDutchVariants({ de: "Du kannst mehr, als du glaubst", en: "You are more capable than you think", it: "Sei pi\xF9 capace di quanto credi", es: "Eres m\xE1s capaz de lo que crees", nl: "Je kunt meer dan je denkt" }),
  "Le foot, le foot, le foot": withDutchVariants({ de: "Fu\xDFball, Fu\xDFball, Fu\xDFball", en: "Football, football, football", it: "Il calcio, il calcio, il calcio", es: "El f\xFAtbol, el f\xFAtbol, el f\xFAtbol", nl: "Voetbal, voetbal, voetbal" }),
  "Ce n'est pas ton niveau qui compte, c'est ta progression": withDutchVariants({ de: "Nicht dein Niveau z\xE4hlt, sondern dein Fortschritt", en: "It isn't your level that matters, it's your progress", it: "Non conta il tuo livello, ma i tuoi progressi", es: "No importa tu nivel, sino tu progreso", nl: "Je vooruitgang telt, niet je niveau" }),
  "La danse contemporaine": withDutchVariants({ de: "Zeitgen\xF6ssischer Tanz", en: "Contemporary dance", it: "La danza contemporanea", es: "La danza contempor\xE1nea", nl: "Hedendaagse dans" }),
  "Tu n'es pas en comp\xE9tition avec les autres, mais avec toi-m\xEAme": withDutchVariants({ de: "Du stehst nicht im Wettbewerb mit anderen, sondern mit dir selbst", en: "You're not competing with others, but with yourself", it: "Non sei in competizione con gli altri, ma con te stesso", es: "No compites con los dem\xE1s, sino contigo mismo", nl: "Je neemt het op tegen jezelf, niet tegen anderen" }),
  "Me promener en ville avec mes amis": withDutchVariants({ de: "Mit meinen Freunden durch die Stadt gehen", en: "Walking around town with my friends", it: "Passeggiare in citt\xE0 con i miei amici", es: "Pasear por la ciudad con mis amigos", nl: "Met mijn vrienden door de stad wandelen" }),
  "Si c'est gal\xE8re, c'est que tu progresses": withDutchVariants({ de: "Wenn es schwierig ist, machst du Fortschritte", en: "If it's hard, it means you're making progress", it: "Se \xE8 difficile, significa che stai progredendo", es: "Si cuesta, es porque est\xE1s progresando", nl: "Als het moeilijk is, ga je vooruit" }),
  "Jouer au basket": withDutchVariants({ de: "Basketball spielen", en: "Playing basketball", it: "Giocare a basket", es: "Jugar al baloncesto", nl: "Basketballen" }),
  "Le cerveau adore qu'on le challenge": withDutchVariants({ de: "Das Gehirn liebt Herausforderungen", en: "The brain loves a challenge", it: "Il cervello ama le sfide", es: "Al cerebro le encantan los retos", nl: "Je brein houdt van een uitdaging" }),
  "Battre mes potes aux \xE9checs": withDutchVariants({ de: "Meine Freunde im Schach schlagen", en: "Beating my friends at chess", it: "Battere i miei amici a scacchi", es: "Ganar a mis amigos al ajedrez", nl: "Mijn vrienden verslaan met schaken" }),
  "Tu vaux plus que tes notes": withDutchVariants({ de: "Du bist mehr wert als deine Noten", en: "You are worth more than your grades", it: "Vali pi\xF9 dei tuoi voti", es: "Vales m\xE1s que tus notas", nl: "Je bent meer waard dan je punten" }),
  "Les films d'action": withDutchVariants({ de: "Actionfilme", en: "Action films", it: "I film d'azione", es: "Las pel\xEDculas de acci\xF3n", nl: "Actiefilms" }),
  "Ce n'est pas parce que c'est difficile que ce n'est pas pour toi.": withDutchVariants({ de: "Nur weil es schwierig ist, hei\xDFt das nicht, dass es nichts f\xFCr dich ist.", en: "Just because it's difficult doesn't mean it isn't for you.", it: "Solo perch\xE9 \xE8 difficile non significa che non faccia per te.", es: "Que sea dif\xEDcil no significa que no sea para ti.", nl: "Dat iets moeilijk is, betekent niet dat het niets voor jou is." }),
  "Voyager, ou que ce soit, mais voyager": withDutchVariants({ de: "Reisen, egal wohin, Hauptsache reisen", en: "Travelling, wherever it may be, but travelling", it: "Viaggiare, ovunque sia, ma viaggiare", es: "Viajar, donde sea, pero viajar", nl: "Reizen, waarheen dan ook, maar reizen" }),
  "Salut ! On commence !": withDutchVariants({ de: "Hallo! Los geht\u2019s!", en: "Hi! Let\u2019s get started!", it: "Ciao! Cominciamo!", es: "\xA1Hola! \xA1Empezamos!", nl: "Hoi! We gaan eraan beginnen!" }),
  "Une autre !": withDutchVariants({ de: "Noch eine!", en: "Another one!", it: "Un\u2019altra!", es: "\xA1Otra!", nl: "Nog eentje!" }),
  "Nouveau d\xE9part, c\u2019est parti !": withDutchVariants({ de: "Neuer Start, los geht\u2019s!", en: "A fresh start\u2014let\u2019s go!", it: "Nuovo inizio, si parte!", es: "Nuevo comienzo, \xA1vamos!", nl: "Een nieuwe start, daar gaan we!" }),
  "Super s\xE9rie !": withDutchVariants({ de: "Tolle Serie!", en: "Great streak!", it: "Ottima serie!", es: "\xA1Gran racha!", nl: "Goed bezig!" }),
  "Nouvelle question !": withDutchVariants({ de: "Neue Frage!", en: "New question!", it: "Nuova domanda!", es: "\xA1Nueva pregunta!", nl: "Nieuwe vraag!" }),
  "Bravo !": withDutchVariants({ de: "Sehr gut!", en: "Well done!", it: "Bravissimo!", es: "\xA1Muy bien!", nl: "Goed gedaan!" }),
  "Courage !": withDutchVariants({ de: "Nicht aufgeben!", en: "Keep going!", it: "Coraggio!", es: "\xA1\xC1nimo!", nl: "Doe zo voort!" }),
  "Tu es en plein forme !": withDutchVariants({ de: "Du bist richtig gut in Form!", en: "You\u2019re on top form!", it: "Sei in gran forma!", es: "\xA1Est\xE1s en plena forma!", nl: "Je bent in topvorm!" }),
  "Je vois que c\u2019est un peu difficile.": withDutchVariants({ de: "Ich sehe, dass es etwas schwierig ist.", en: "I can see this is a little difficult.", it: "Vedo che \xE8 un po\u2019 difficile.", es: "Veo que esto es un poco dif\xEDcil.", nl: "Ik zie dat dit wat moeilijk is." }),
  "C'est juste !": withDutchVariants({ de: "Das ist richtig!", en: "That\u2019s correct!", it: "\xC8 giusto!", es: "\xA1Es correcto!", nl: "Dat is juist!" }),
  "C'est juste ! Il y a aussi une autre possibilit\xE9.": withDutchVariants({ de: "Das ist richtig! Es gibt noch eine andere M\xF6glichkeit.", en: "That\u2019s correct! There is another possible answer too.", it: "\xC8 giusto! C\u2019\xE8 anche un\u2019altra possibilit\xE0.", es: "\xA1Es correcto! Tambi\xE9n hay otra posibilidad.", nl: "Dat is juist! Er is ook nog een ander mogelijk antwoord." }),
  "Termin\xE9 ! {score} % avec {correctCount} bonnes r\xE9ponses.": withDutchVariants({ de: "Fertig! {score} % mit {correctCount} richtigen Antworten.", en: "Finished! {score}% with {correctCount} correct answers.", it: "Finito! {score}% con {correctCount} risposte corrette.", es: "\xA1Terminado! {score}% con {correctCount} respuestas correctas.", nl: "Klaar! {score}% met {correctCount} juiste antwoorden." }),
  "C'est faux. La bonne r\xE9ponse est  <b>\xAB {expectedAnswer} \xBB</b>.": withDutchVariants({ de: "Das ist falsch. Die richtige Antwort ist <b>\u201E{expectedAnswer}\u201C</b>.", en: "That\u2019s incorrect. The correct answer is <b>\u201C{expectedAnswer}\u201D</b>.", it: "Non \xE8 corretto. La risposta giusta \xE8 <b>\xAB{expectedAnswer}\xBB</b>.", es: "No es correcto. La respuesta correcta es <b>\xAB{expectedAnswer}\xBB</b>.", nl: "Dat is niet juist. Het juiste antwoord is <b>\u201C{expectedAnswer}\u201D</b>." }),
  "\xAB {complement} \xBB arrive apr\xE8s \xAB {verb} \xBB : pas d\u2019accord, \xAB {participle} \xBB !": withDutchVariants({ de: "\u201E{complement}\u201C steht nach \u201E{verb}\u201C: keine Angleichung, \u201E{participle}\u201C!", en: "\u201C{complement}\u201D comes after \u201C{verb}\u201D: no agreement, \u201C{participle}\u201D!", it: "\xAB{complement}\xBB viene dopo \xAB{verb}\xBB: nessuna concordanza, \xAB{participle}\xBB!", es: "\xAB{complement}\xBB aparece despu\xE9s de \xAB{verb}\xBB: no hay concordancia, \xAB{participle}\xBB.", nl: "\u201C{complement}\u201D staat na \u201C{verb}\u201D: geen overeenkomst, \u201C{participle}\u201D!" }),
  "Le COD \xAB {complement} \xBB est devant \xAB {verb} \xBB : accord obligatoire avec  {complement} . Le participe est :  \xAB {participle} \xBB !": withDutchVariants({ de: "Das direkte Objekt \u201E{complement}\u201C steht vor \u201E{verb}\u201C: Die Angleichung an {complement} ist erforderlich. Das Partizip lautet \u201E{participle}\u201C!", en: "The direct object \u201C{complement}\u201D comes before \u201C{verb}\u201D: agreement with {complement} is required. The participle is \u201C{participle}\u201D!", it: "Il complemento oggetto \xAB{complement}\xBB precede \xAB{verb}\xBB: la concordanza con {complement} \xE8 obbligatoria. Il participio \xE8 \xAB{participle}\xBB!", es: "El complemento directo \xAB{complement}\xBB va antes de \xAB{verb}\xBB: la concordancia con {complement} es obligatoria. El participio es \xAB{participle}\xBB.", nl: "Het lijdend voorwerp \u201C{complement}\u201D staat v\xF3\xF3r \u201C{verb}\u201D: overeenkomst met {complement} is nodig. Het deelwoord is \u201C{participle}\u201D!" }),
  "Attention au pi\xE8ge : \xAB {complement} \xBB est un COI, donc aucun accord !": withDutchVariants({ de: "Vorsicht: \u201E{complement}\u201C ist ein indirektes Objekt, daher gibt es keine Angleichung!", en: "Watch out: \u201C{complement}\u201D is an indirect object, so there is no agreement!", it: "Attenzione: \xAB{complement}\xBB \xE8 un complemento indiretto, quindi nessuna concordanza!", es: "Atenci\xF3n: \xAB{complement}\xBB es un complemento indirecto, as\xED que no hay concordancia.", nl: "Let op: \u201C{complement}\u201D is een meewerkend voorwerp, dus er is geen overeenkomst!" })
};
const coachHelpApproachTitles = {
  "complete-avec-reponses": withDutchVariants({
    fr: "Aide compl\xE8te avec r\xE9ponses",
    de: "Ausf\xFChrliche Hilfe mit Antworten",
    en: "Detailed help with answers",
    it: "Aiuto completo con risposte",
    es: "Ayuda completa con respuestas",
    nl: "Uitgebreide hulp met antwoorden"
  }),
  complete: withDutchVariants({
    fr: "Aide compl\xE8te sans r\xE9ponses",
    de: "Ausf\xFChrliche Hilfe ohne Antworten",
    en: "Detailed help without answers",
    it: "Aiuto completo senza risposte",
    es: "Ayuda completa sin respuestas",
    nl: "Uitgebreide hulp zonder antwoorden"
  }),
  "tres-condensee": withDutchVariants({
    fr: "Aide tr\xE8s condens\xE9e",
    de: "Sehr kompakte Hilfe",
    en: "Very concise help",
    it: "Aiuto molto sintetico",
    es: "Ayuda muy concisa",
    nl: "Zeer beknopte hulp"
  }),
  allophone: withDutchVariants({
    fr: "Aide allophone",
    de: "Hilfe f\xFCr Anderssprachige",
    en: "Help for non-native speakers",
    it: "Aiuto per allofoni",
    es: "Ayuda para hablantes de otras lenguas",
    nl: "Hulp voor anderstaligen"
  })
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "CoachPicker",
  __ssrInlineRender: true,
  props: {
    tourDemo: { type: Boolean },
    selectionPending: { type: Boolean },
    selectionError: {},
    learningSupportMode: {}
  },
  emits: ["close", "select"],
  setup(__props, { emit: __emit }) {
    const { interfaceLocale, ui } = useLanguagePreferences();
    const props = __props;
    const coachPairs = ref([]);
    const loading = ref(true);
    const error = ref("");
    const allophoneOnly = computed(() => props.learningSupportMode === "cif-fle");
    const coachGroups = computed(
      () => coachPairs.value.filter((group) => !allophoneOnly.value || group.approach === "allophone").map((group) => ({
        ...group,
        label: coachHelpApproachTitle(interfaceLocale.value, group.approach),
        description: translateCoachUiText(interfaceLocale.value, group.description),
        coaches: group.coaches.map((coach) => localizeCoachProfile(interfaceLocale.value, coach))
      }))
    );
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="coach-picker-overlay" data-tour="coach-picker" data-v-c53d0b2f><section class="coach-picker" role="dialog" aria-modal="true" aria-labelledby="coach-picker-title"${ssrRenderAttr("aria-busy", __props.selectionPending)} data-v-c53d0b2f><header data-v-c53d0b2f><div data-v-c53d0b2f><h2 id="coach-picker-title" data-v-c53d0b2f>${ssrInterpolate(unref(ui)("Choisis ton coach"))}</h2></div><button type="button"${ssrRenderAttr("aria-label", unref(ui)("Fermer"))}${ssrIncludeBooleanAttr(__props.selectionPending) ? " disabled" : ""} data-v-c53d0b2f>×</button></header>`);
        if (__props.selectionPending) {
          _push2(`<p class="coach-picker__state coach-picker__state--pending" role="status" data-v-c53d0b2f>${ssrInterpolate(unref(ui)("Préparation de la séance…"))}</p>`);
        } else if (__props.selectionError) {
          _push2(`<p class="coach-picker__state coach-picker__state--error" role="alert" data-v-c53d0b2f>${ssrInterpolate(__props.selectionError)}</p>`);
        } else {
          _push2(`<!---->`);
        }
        if (unref(loading)) {
          _push2(`<p class="coach-picker__state" data-v-c53d0b2f>${ssrInterpolate(unref(ui)("Chargement des coaches…"))}</p>`);
        } else if (unref(error)) {
          _push2(`<p class="coach-picker__state coach-picker__state--error" data-v-c53d0b2f>${ssrInterpolate(unref(error))}</p>`);
        } else {
          _push2(`<div class="coach-picker__groups" data-v-c53d0b2f><!--[-->`);
          ssrRenderList(unref(coachGroups), (group) => {
            _push2(`<section class="coach-caractere-group"${ssrRenderAttr("data-help-approach", group.approach)}${ssrRenderAttr("data-tour", group.approach === "complete" ? "coach-complete-group" : void 0)} data-v-c53d0b2f>`);
            if (!unref(allophoneOnly)) {
              _push2(`<header class="coach-caractere-group__header" data-v-c53d0b2f><div data-v-c53d0b2f><h3 data-v-c53d0b2f>${ssrInterpolate(group.label)}</h3><p data-v-c53d0b2f>${ssrInterpolate(group.description)}</p></div></header>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="coach-picker__grid" data-v-c53d0b2f><!--[-->`);
            ssrRenderList(group.coaches, (coach) => {
              _push2(`<button type="button" class="coach-card" style="${ssrRenderStyle({ "--coach-color": coach.themeColor })}"${ssrIncludeBooleanAttr(__props.selectionPending) ? " disabled" : ""} data-v-c53d0b2f><img${ssrRenderAttr("src", coach.avatarPath)}${ssrRenderAttr("alt", unref(ui)("Avatar de {name}", { name: coach.firstName }))} data-v-c53d0b2f><strong data-v-c53d0b2f>${ssrInterpolate(coach.firstName)}</strong></button>`);
            });
            _push2(`<!--]--></div></section>`);
          });
          _push2(`<!--]--></div>`);
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
const CoachPicker = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-c53d0b2f"]]), { __name: "ExerciseCoachPicker" });

export { CoachPicker as default };
//# sourceMappingURL=CoachPicker-BDhegtjB.mjs.map
