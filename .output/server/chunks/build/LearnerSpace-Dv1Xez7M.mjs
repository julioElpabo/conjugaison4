import { _ as __nuxt_component_0$2 } from './nuxt-link-icjx6oE7.mjs';
import { defineComponent, computed, ref, useTemplateRef, reactive, withAsyncContext, watch, nextTick, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderClass, ssrRenderStyle, ssrIncludeBooleanAttr, ssrRenderList, ssrRenderComponent, ssrRenderTeleport } from 'vue/server-renderer';
import QrcodeVue from 'qrcode.vue';
import { w as withDutchVariants, ah as localeLanguageTag, aS as localizedLearnerErrorMessageForCode, aT as localizedLearnerErrorDomain, aU as localizedLearnerErrorLabel } from '../nitro/nitro.mjs';
import { f as useLanguagePreferences, g as useRoute, i as useRequestFetch, h as useState, c as useRuntimeConfig } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { _ as __nuxt_component_1$1 } from './PasswordInput-D9iWnxeu.mjs';
import { a as LearnerErrorDetailMessage } from './VerbConsultationModal-DLbo-LR6.mjs';
import { l as learnerSpaceCopy, u as useColorTheme, a as learnerSpaceText } from './useColorTheme-C6CCVHIc.mjs';
import ChatExercise from './ChatExercise-aXGhGYFV.mjs';
import ClassicExercise from './ClassicExercise-Bb29p9fh.mjs';
import CoachPicker from './CoachPicker-BDhegtjB.mjs';
import { u as useLearnerProgress, c as createLearnerTrackingContext } from './main-DlTU7wez.mjs';
import { u as useLearnerAuth } from './useLearnerAuth-tqISusbB.mjs';
import { u as useSiteAnalytics } from './useSiteAnalytics-CWvs4oMj.mjs';
import { u as useAsyncData } from './asyncData--5yVuH0M.mjs';

const copy = withDutchVariants({
  fr: {
    scopeHint: "Ces modifications concernent uniquement \xAB Mes d\xE9fis \xBB.",
    edit: "Modifier",
    title: "Titre du d\xE9fi",
    description: "Description",
    optional: "Facultative",
    save: "Enregistrer",
    saving: "Enregistrement\u2026",
    cancel: "Annuler",
    saved: "Modifications enregistr\xE9es.",
    copy: "Copier le code",
    copied: "Code copi\xE9 !",
    copyError: "Copie impossible. S\xE9lectionne le code pour le copier.",
    code: "Code du d\xE9fi",
    expand: "Agrandir le QR code",
    scan: "Scannez pour ouvrir le d\xE9fi",
    close: "Fermer",
    launch: "Lancer le d\xE9fi",
    questions: "Questions",
    verbs: "Verbes",
    tenses: "Temps",
    error: "Impossible d\u2019enregistrer. R\xE9essaie dans un instant."
  },
  de: {
    scopeHint: "Diese \xC4nderungen gelten nur f\xFCr \u201EMeine Herausforderungen\u201C.",
    edit: "Bearbeiten",
    title: "Titel der \xDCbung",
    description: "Beschreibung",
    optional: "Optional",
    save: "Speichern",
    saving: "Wird gespeichert\u2026",
    cancel: "Abbrechen",
    saved: "\xC4nderungen gespeichert.",
    copy: "Code kopieren",
    copied: "Code kopiert!",
    copyError: "Kopieren fehlgeschlagen. Markiere den Code zum Kopieren.",
    code: "\xDCbungscode",
    expand: "QR-Code vergr\xF6\xDFern",
    scan: "Scannen und die \xDCbung \xF6ffnen",
    close: "Schlie\xDFen",
    launch: "\xDCbung starten",
    questions: "Fragen",
    verbs: "Verben",
    tenses: "Zeitformen",
    error: "Speichern fehlgeschlagen. Versuche es erneut."
  },
  en: {
    scopeHint: "These changes apply only to \u201CMy challenges\u201D.",
    edit: "Edit",
    title: "Challenge title",
    description: "Description",
    optional: "Optional",
    save: "Save",
    saving: "Saving\u2026",
    cancel: "Cancel",
    saved: "Changes saved.",
    copy: "Copy code",
    copied: "Code copied!",
    copyError: "Copy failed. Select the code to copy it.",
    code: "Challenge code",
    expand: "Enlarge QR code",
    scan: "Scan to open the challenge",
    close: "Close",
    launch: "Start challenge",
    questions: "Questions",
    verbs: "Verbs",
    tenses: "Tenses",
    error: "Could not save. Please try again."
  },
  it: {
    scopeHint: "Queste modifiche riguardano solo \xAB I miei esercizi \xBB.",
    edit: "Modifica",
    title: "Titolo dell\u2019esercizio",
    description: "Descrizione",
    optional: "Facoltativa",
    save: "Salva",
    saving: "Salvataggio\u2026",
    cancel: "Annulla",
    saved: "Modifiche salvate.",
    copy: "Copia il codice",
    copied: "Codice copiato!",
    copyError: "Copia non riuscita. Seleziona il codice per copiarlo.",
    code: "Codice dell\u2019esercizio",
    expand: "Ingrandisci il codice QR",
    scan: "Scansiona per aprire l\u2019esercizio",
    close: "Chiudi",
    launch: "Avvia l\u2019esercizio",
    questions: "Domande",
    verbs: "Verbi",
    tenses: "Tempi",
    error: "Salvataggio non riuscito. Riprova tra un momento."
  },
  es: {
    scopeHint: "Estos cambios solo se aplican a \xAB Mis ejercicios \xBB.",
    edit: "Editar",
    title: "T\xEDtulo del ejercicio",
    description: "Descripci\xF3n",
    optional: "Opcional",
    save: "Guardar",
    saving: "Guardando\u2026",
    cancel: "Cancelar",
    saved: "Cambios guardados.",
    copy: "Copiar el c\xF3digo",
    copied: "\xA1C\xF3digo copiado!",
    copyError: "No se pudo copiar. Selecciona el c\xF3digo para copiarlo.",
    code: "C\xF3digo del ejercicio",
    expand: "Ampliar el c\xF3digo QR",
    scan: "Escanea para abrir el ejercicio",
    close: "Cerrar",
    launch: "Iniciar el ejercicio",
    questions: "Preguntas",
    verbs: "Verbos",
    tenses: "Tiempos",
    error: "No se pudo guardar. Int\xE9ntalo de nuevo."
  },
  nl: {
    scopeHint: "Deze wijzigingen gelden alleen voor \u2018Mijn uitdagingen\u2019.",
    edit: "Wijzigen",
    title: "Titel van de uitdaging",
    description: "Beschrijving",
    optional: "Optioneel",
    save: "Opslaan",
    saving: "Wordt opgeslagen\u2026",
    cancel: "Annuleren",
    saved: "Wijzigingen opgeslagen.",
    copy: "Code kopi\xEBren",
    copied: "Code gekopieerd!",
    copyError: "Kopi\xEBren mislukt. Selecteer de code om die te kopi\xEBren.",
    code: "Code van de uitdaging",
    expand: "QR-code vergroten",
    scan: "Scan om de uitdaging te openen",
    close: "Sluiten",
    launch: "Uitdaging starten",
    questions: "Vragen",
    verbs: "Werkwoorden",
    tenses: "Tijden",
    error: "Opslaan mislukt. Probeer het opnieuw."
  }
});
const savedChallengeCardCopy = (locale) => copy[locale];

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

const DAY_MS = 864e5;
const dateParts = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Zurich",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});
const labels = withDutchVariants({
  fr: { today: "Aujourd\u2019hui", yesterday: "Hier", week: "La semaine derni\xE8re", school: "Ann\xE9e scolaire", unknown: "Date inconnue" },
  de: { today: "Heute", yesterday: "Gestern", week: "Letzte Woche", school: "Schuljahr", unknown: "Datum unbekannt" },
  en: { today: "Today", yesterday: "Yesterday", week: "Last week", school: "School year", unknown: "Unknown date" },
  it: { today: "Oggi", yesterday: "Ieri", week: "La settimana scorsa", school: "Anno scolastico", unknown: "Data sconosciuta" },
  es: { today: "Hoy", yesterday: "Ayer", week: "La semana pasada", school: "Curso escolar", unknown: "Fecha desconocida" },
  nl: { today: "Vandaag", yesterday: "Gisteren", week: "Vorige week", school: "Schooljaar", unknown: "Onbekende datum" }
});
function calendarDate(date) {
  const parts = Object.fromEntries(dateParts.formatToParts(date).map((part) => [part.type, part.value]));
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  return { year, month, day, ordinal: Date.UTC(year, month - 1, day) / DAY_MS, iso: `${parts.year}-${parts.month}-${parts.day}` };
}
function shortDate(date, locale) {
  if (locale !== "fr") {
    return new Intl.DateTimeFormat(localeLanguageTag(locale), {
      timeZone: "Europe/Zurich",
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(date);
  }
  const { year, month, day, ordinal } = calendarDate(date);
  const weekday = ["di", "lu", "ma", "me", "je", "ve", "sa"][new Date(ordinal * DAY_MS).getUTCDay()];
  const monthLabel = ["jan", "fev", "mar", "avr", "mai", "juin", "juil", "aout", "sep", "oct", "nov", "dec"][month - 1];
  return `${weekday} ${day} ${monthLabel} ${year}`;
}
function groupSavedChallenges(challenges, now, locale) {
  const today = calendarDate(now);
  const currentSchoolYear = today.year - (today.month < 8 ? 1 : 0);
  const copy = labels[locale];
  const groups = /* @__PURE__ */ new Map();
  const sorted = challenges.map((challenge) => ({ challenge, date: new Date(challenge.savedAt) })).sort((a, b) => (Number.isNaN(b.date.getTime()) ? -Infinity : b.date.getTime()) - (Number.isNaN(a.date.getTime()) ? -Infinity : a.date.getTime()));
  for (const { challenge, date } of sorted) {
    let key = "unknown";
    let title = copy.unknown;
    let dateLabel = copy.unknown;
    let dateTime;
    if (!Number.isNaN(date.getTime())) {
      const saved = calendarDate(date);
      const age = today.ordinal - saved.ordinal;
      const schoolYear = saved.year - (saved.month < 8 ? 1 : 0);
      key = age <= 0 ? "today" : age === 1 ? "yesterday" : age <= 7 ? "week" : age <= 30 ? `month-${saved.iso.slice(0, 7)}` : schoolYear === currentSchoolYear ? "school" : `${schoolYear}-${schoolYear + 1}`;
      title = key in copy ? copy[key] : key;
      if (key.startsWith("month-")) {
        const monthName = new Intl.DateTimeFormat(localeLanguageTag(locale), { timeZone: "Europe/Zurich", month: "long" }).format(date);
        title = `${monthName.charAt(0).toLocaleUpperCase(locale)}${monthName.slice(1)} ${String(saved.year).slice(-2)}`;
      } else if (key === "school") {
        title = `${copy.school} ${currentSchoolYear}-${currentSchoolYear + 1}`;
      }
      dateLabel = shortDate(date, locale);
      dateTime = saved.iso;
    }
    if (!groups.has(key)) groups.set(key, { key, title, entries: [] });
    groups.get(key).entries.push({ challenge, dateLabel, dateTime });
  }
  return [...groups.values()];
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

const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "SavedChallengeQrDialog",
  __ssrInlineRender: true,
  props: {
    url: {},
    title: {},
    code: {}
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const { interfaceLocale } = useLanguagePreferences();
    const copy = computed(() => savedChallengeCardCopy(interfaceLocale.value));
    useTemplateRef("dialog");
    useTemplateRef("close-button");
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="challenge-qr-backdrop" data-v-68b585e5><section class="challenge-qr-dialog" role="dialog" aria-modal="true" aria-labelledby="challenge-qr-title" tabindex="-1" data-v-68b585e5><header data-v-68b585e5><div data-v-68b585e5><p data-v-68b585e5>${ssrInterpolate(unref(copy).scan)}</p><h2 id="challenge-qr-title" data-v-68b585e5>${ssrInterpolate(__props.title)}</h2></div><button type="button" data-v-68b585e5>${ssrInterpolate(unref(copy).close)} <span aria-hidden="true" data-v-68b585e5>×</span></button></header>`);
        _push2(ssrRenderComponent(QrcodeVue, {
          class: "challenge-qr-image",
          value: __props.url,
          size: 720,
          margin: 4,
          level: "M",
          "render-as": "svg",
          background: "#ffffff",
          foreground: "#000000",
          role: "img",
          "aria-label": `${unref(copy).code} ${__props.code}`
        }, null, _parent));
        _push2(`<strong class="challenge-qr-code" data-v-68b585e5>${ssrInterpolate(__props.code)}</strong><a class="challenge-qr-link"${ssrRenderAttr("href", __props.url)} data-v-68b585e5>${ssrInterpolate(__props.url)}</a></section></div>`);
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/learner/SavedChallengeQrDialog.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$3, [["__scopeId", "data-v-68b585e5"]]), { __name: "LearnerSavedChallengeQrDialog" });
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "SavedChallengeCard",
  __ssrInlineRender: true,
  props: {
    challenge: {},
    dateLabel: {},
    dateTime: {},
    readOnly: { type: Boolean }
  },
  emits: ["updated"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const { interfaceLocale, localePath } = useLanguagePreferences();
    const config = useRuntimeConfig();
    const copy = computed(() => savedChallengeCardCopy(interfaceLocale.value));
    const challengePath = computed(() => localePath(`/defi/${props.challenge.code}`));
    const shareUrl = computed(() => new URL(challengePath.value, String(config.public.siteUrl)).toString());
    const qrOpen = ref(false);
    const editing = ref(false);
    const saving = ref(false);
    const title = ref("");
    const description = ref("");
    const error = ref("");
    const notice = ref("");
    const copyStatus = ref("idle");
    useTemplateRef("title-input");
    useTemplateRef("edit-button");
    const valid = computed(() => title.value.trim().length >= 1 && title.value.trim().length <= 80 && description.value.trim().length <= 1e3);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$2;
      const _component_LearnerSavedChallengeQrDialog = __nuxt_component_1;
      _push(`<article${ssrRenderAttrs(mergeProps({ class: "saved-card" }, _attrs))} data-v-2256ed8a><header class="saved-card__top" data-v-2256ed8a><div class="saved-card__heading" data-v-2256ed8a>`);
      if (__props.dateTime) {
        _push(`<time${ssrRenderAttr("datetime", __props.dateTime)} data-v-2256ed8a>${ssrInterpolate(__props.dateLabel)}</time>`);
      } else {
        _push(`<span data-v-2256ed8a></span>`);
      }
      if (!__props.readOnly && !unref(editing)) {
        _push(`<button type="button" class="saved-card__edit" data-v-2256ed8a><span aria-hidden="true" data-v-2256ed8a>✎</span> ${ssrInterpolate(unref(copy).edit)}</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(editing)) {
        _push(`<form class="saved-card__form" data-v-2256ed8a><p class="saved-card__scope" data-v-2256ed8a>${ssrInterpolate(unref(copy).scopeHint)}</p><label${ssrRenderAttr("for", `saved-title-${__props.challenge.code}`)} data-v-2256ed8a>${ssrInterpolate(unref(copy).title)}</label><input${ssrRenderAttr("id", `saved-title-${__props.challenge.code}`)}${ssrRenderAttr("value", unref(title))} maxlength="80" required${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} data-v-2256ed8a><small data-v-2256ed8a>${ssrInterpolate(unref(title).length)}/80</small><label${ssrRenderAttr("for", `saved-description-${__props.challenge.code}`)} data-v-2256ed8a>${ssrInterpolate(unref(copy).description)} <span data-v-2256ed8a>· ${ssrInterpolate(unref(copy).optional)}</span></label><textarea${ssrRenderAttr("id", `saved-description-${__props.challenge.code}`)} rows="4" maxlength="1000"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} data-v-2256ed8a>${ssrInterpolate(unref(description))}</textarea><small data-v-2256ed8a>${ssrInterpolate(unref(description).length)}/1000</small>`);
        if (unref(error)) {
          _push(`<p class="saved-card__error" role="alert" data-v-2256ed8a>${ssrInterpolate(unref(error))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="saved-card__form-actions" data-v-2256ed8a><button type="button"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} data-v-2256ed8a>${ssrInterpolate(unref(copy).cancel)}</button><button type="submit" class="saved-card__primary"${ssrIncludeBooleanAttr(unref(saving) || !unref(valid)) ? " disabled" : ""} data-v-2256ed8a>${ssrInterpolate(unref(saving) ? unref(copy).saving : unref(copy).save)}</button></div></form>`);
      } else {
        _push(`<div class="saved-card__content" data-v-2256ed8a><h4 data-v-2256ed8a>${ssrInterpolate(__props.challenge.title)}</h4>`);
        if (__props.challenge.description) {
          _push(`<p class="saved-card__description" data-v-2256ed8a>${ssrInterpolate(__props.challenge.description)}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(notice)) {
          _push(`<p class="saved-card__notice" role="status" data-v-2256ed8a>${ssrInterpolate(unref(notice))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`<dl class="saved-card__stats" data-v-2256ed8a><div data-v-2256ed8a><dt data-v-2256ed8a>${ssrInterpolate(unref(copy).verbs)}</dt><dd data-v-2256ed8a>${ssrInterpolate(__props.challenge.verbCount)}</dd></div><div data-v-2256ed8a><dt data-v-2256ed8a>${ssrInterpolate(unref(copy).tenses)}</dt><dd data-v-2256ed8a>${ssrInterpolate(__props.challenge.tenseCount)}</dd></div><div data-v-2256ed8a><dt data-v-2256ed8a>${ssrInterpolate(unref(copy).questions)}</dt><dd data-v-2256ed8a>${ssrInterpolate(__props.challenge.questionCount)}</dd></div></dl></header><div class="saved-card__share" data-v-2256ed8a><div class="saved-card__code" data-v-2256ed8a><span data-v-2256ed8a>${ssrInterpolate(unref(copy).code)}</span><strong data-v-2256ed8a>${ssrInterpolate(__props.challenge.code)}</strong><button type="button" class="saved-card__copy" data-v-2256ed8a>${ssrInterpolate(unref(copyStatus) === "success" ? unref(copy).copied : unref(copy).copy)}</button><span class="${ssrRenderClass([{ "saved-card__sr-only": unref(copyStatus) === "success" }, "saved-card__copy-status"])}" role="status" data-v-2256ed8a>${ssrInterpolate(unref(copyStatus) === "error" ? unref(copy).copyError : unref(copyStatus) === "success" ? unref(copy).copied : "")}</span></div><button type="button" class="saved-card__qr"${ssrRenderAttr("aria-label", `${unref(copy).expand} — ${__props.challenge.title}`)} data-v-2256ed8a>`);
      _push(ssrRenderComponent(QrcodeVue, {
        value: unref(shareUrl),
        size: 104,
        margin: 4,
        level: "M",
        "render-as": "svg",
        background: "#ffffff",
        foreground: "#000000",
        "aria-hidden": "true"
      }, null, _parent));
      _push(`<span data-v-2256ed8a>${ssrInterpolate(unref(copy).expand)}</span></button></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "saved-card__launch",
        to: unref(challengePath)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(copy).launch)} <span aria-hidden="true" data-v-2256ed8a${_scopeId}>→</span>`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(copy).launch) + " ", 1),
              createVNode("span", { "aria-hidden": "true" }, "→")
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(qrOpen)) {
        _push(ssrRenderComponent(_component_LearnerSavedChallengeQrDialog, {
          url: unref(shareUrl),
          title: __props.challenge.title,
          code: __props.challenge.code,
          onClose: ($event) => qrOpen.value = false
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</article>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/learner/SavedChallengeCard.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_0$1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$2, [["__scopeId", "data-v-2256ed8a"]]), { __name: "LearnerSavedChallengeCard" });
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
      const middle = withDutchVariants({
        fr: "réussites sur",
        de: "Erfolge von",
        en: "correct out of",
        it: "risposte corrette su",
        es: "aciertos de",
        nl: "juist van"
      })[interfaceLocale.value];
      return `${props.correctCount} ${middle} ${props.totalCount}`;
    });
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="history-summary-overlay" role="presentation" data-v-2127c342><section class="history-summary-dialog" role="dialog" aria-modal="true" aria-labelledby="history-summary-title" data-v-2127c342><header class="history-summary-dialog__header" data-v-2127c342><div data-v-2127c342><span data-v-2127c342>${ssrInterpolate(unref(ui)("Bilan de la séance"))}</span><h2 id="history-summary-title" data-v-2127c342>${ssrInterpolate(__props.title)}</h2><p data-v-2127c342>${ssrInterpolate(unref(resultLabel))}</p></div><button type="button"${ssrRenderAttr("aria-label", unref(ui)("Fermer"))} data-v-2127c342>×</button></header><div class="history-summary-dialog__content" data-v-2127c342>`);
        if (unref(incorrectItems).length) {
          _push2(`<section class="history-summary-section history-summary-section--errors" data-v-2127c342><h3 data-v-2127c342>${ssrInterpolate(unref(ui)("Mes erreurs"))} <span data-v-2127c342>${ssrInterpolate(unref(incorrectItems).length)}</span></h3><ol data-v-2127c342><!--[-->`);
          ssrRenderList(unref(incorrectItems), (item) => {
            _push2(`<li data-v-2127c342><p class="history-summary-item__question" data-v-2127c342>${ssrInterpolate(item.questionLabel)}</p>`);
            if (item.identificationForm) {
              _push2(`<blockquote class="history-summary-item__citation" data-v-2127c342><p data-v-2127c342><span data-v-2127c342>${ssrInterpolate(item.identificationForm.before)}</span><mark data-v-2127c342>${ssrInterpolate(item.identificationForm.target)}</mark><span data-v-2127c342>${ssrInterpolate(item.identificationForm.after)}</span></p>`);
              if (item.literaryCitation) {
                _push2(`<footer data-v-2127c342>${ssrInterpolate(item.literaryCitation.author)}, <cite data-v-2127c342>${ssrInterpolate(item.literaryCitation.work)}</cite></footer>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</blockquote>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<!--[-->`);
            ssrRenderList([answerComparison(item)], (comparison) => {
              _push2(`<div class="history-summary-item__comparison" data-v-2127c342><span class="history-summary-item__answer history-summary-item__answer--learner" data-v-2127c342>`);
              if (item.isIdentification) {
                _push2(`<!--[-->${ssrInterpolate(item.learnerAnswer || "—")}<!--]-->`);
              } else if (comparison) {
                _push2(`<!--[-->`);
                ssrRenderList(comparison.learnerParts, (part, partIndex) => {
                  _push2(`<span class="${ssrRenderClass(`history-summary-item__part--${part.kind}`)}" data-v-2127c342>${ssrInterpolate(part.text)}</span>`);
                });
                _push2(`<!--]-->`);
              } else {
                _push2(`<!--[-->${ssrInterpolate(item.learnerAnswer || "—")}<!--]-->`);
              }
              _push2(`</span><b aria-hidden="true" data-v-2127c342>→</b><strong class="history-summary-item__answer history-summary-item__answer--expected" data-v-2127c342>`);
              if (item.isIdentification) {
                _push2(`<!--[-->${ssrInterpolate(item.expectedAnswer)}<!--]-->`);
              } else if (comparison) {
                _push2(`<!--[-->`);
                ssrRenderList(comparison.expectedParts, (part, partIndex) => {
                  _push2(`<span class="${ssrRenderClass(`history-summary-item__part--${part.kind}`)}" data-v-2127c342>${ssrInterpolate(part.text)}</span>`);
                });
                _push2(`<!--]-->`);
              } else {
                _push2(`<!--[-->${ssrInterpolate(item.expectedAnswer)}<!--]-->`);
              }
              _push2(`</strong></div>`);
            });
            _push2(`<!--]-->`);
            if (item.errorDetails.length) {
              _push2(`<ul class="history-summary-item__reasons" data-v-2127c342><!--[-->`);
              ssrRenderList(item.errorDetails, (detail) => {
                _push2(`<li data-v-2127c342>`);
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
        _push2(`<section class="history-summary-section history-summary-section--successes" data-v-2127c342><h3 data-v-2127c342>${ssrInterpolate(unref(ui)("Mes réussites"))} <span data-v-2127c342>${ssrInterpolate(unref(correctItems).length)}</span></h3>`);
        if (unref(correctItems).length) {
          _push2(`<ol data-v-2127c342><!--[-->`);
          ssrRenderList(unref(correctItems), (item) => {
            _push2(`<li data-v-2127c342><p class="history-summary-item__question" data-v-2127c342>${ssrInterpolate(item.questionLabel)}</p><strong class="history-summary-item__correct" data-v-2127c342>${ssrInterpolate(item.expectedAnswer)}</strong></li>`);
          });
          _push2(`<!--]--></ol>`);
        } else {
          _push2(`<p class="history-summary-section__empty" data-v-2127c342>${ssrInterpolate(unref(ui)("Aucune réussite dans cette séance."))}</p>`);
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
const __nuxt_component_2 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-2127c342"]]), { __name: "LearnerHistorySessionSummaryDialog" });
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
    const savedCopy = computed(() => withDutchVariants({
      fr: {
        tab: "Mes défis",
        eyebrow: "Mes défis enregistrés",
        title: "Mes défis",
        intro: "Retrouve les défis que tu as créés ou ajoutés à ton compte.",
        addTitle: "Ajouter un ancien défi",
        addHint: "Entre le code d’un défi créé avant ton compte ou avant l’arrivée de cette fonction.",
        code: "Code du défi",
        add: "Ajouter",
        adding: "Ajout…",
        launch: "Lancer",
        loading: "Chargement de tes défis…",
        empty: "Tu n’as encore aucun défi enregistré.",
        emptyHint: "Les défis que tu créeras en étant connecté apparaîtront ici.",
        invalid: "Entre un code au format AB-CD-EF-23.",
        missing: "Ce code ne correspond à aucun défi.",
        duplicate: "Ce défi est déjà dans ton compte.",
        added: "Le défi a été ajouté à ton compte.",
        error: "Impossible de charger tes défis pour le moment.",
        addError: "Impossible d’ajouter ce défi pour le moment."
      },
      de: {
        tab: "Meine Herausforderungen",
        eyebrow: "Meine gespeicherten Herausforderungen",
        title: "Meine Herausforderungen",
        intro: "Hier findest du die Herausforderungen, die du erstellt oder deinem Konto hinzugefügt hast.",
        addTitle: "Ältere Herausforderung hinzufügen",
        addHint: "Gib den Code einer Herausforderung ein, die vor deinem Konto oder dieser Funktion erstellt wurde.",
        code: "Herausforderungscode",
        add: "Hinzufügen",
        adding: "Wird hinzugefügt…",
        launch: "Starten",
        loading: "Deine Herausforderungen werden geladen…",
        empty: "Du hast noch keine Herausforderung gespeichert.",
        emptyHint: "Herausforderungen, die du angemeldet erstellst, erscheinen hier.",
        invalid: "Gib einen Code im Format AB-CD-EF-23 ein.",
        missing: "Dieser Code gehört zu keiner Herausforderung.",
        duplicate: "Diese Herausforderung ist bereits in deinem Konto.",
        added: "Die Herausforderung wurde deinem Konto hinzugefügt.",
        error: "Deine Herausforderungen können momentan nicht geladen werden.",
        addError: "Diese Herausforderung kann momentan nicht hinzugefügt werden."
      },
      en: {
        tab: "My challenges",
        eyebrow: "My saved challenges",
        title: "My challenges",
        intro: "Find the challenges you created or added to your account.",
        addTitle: "Add an older challenge",
        addHint: "Enter the code of a challenge created before your account or before this feature existed.",
        code: "Challenge code",
        add: "Add",
        adding: "Adding…",
        launch: "Start",
        loading: "Loading your challenges…",
        empty: "You have not saved any challenges yet.",
        emptyHint: "Challenges you create while signed in will appear here.",
        invalid: "Enter a code in the format AB-CD-EF-23.",
        missing: "This code does not match any challenge.",
        duplicate: "This challenge is already in your account.",
        added: "The challenge was added to your account.",
        error: "Your challenges cannot be loaded right now.",
        addError: "This challenge cannot be added right now."
      },
      it: {
        tab: "I miei esercizi",
        eyebrow: "I miei esercizi salvati",
        title: "I miei esercizi",
        intro: "Ritrova gli esercizi che hai creato o aggiunto al tuo account.",
        addTitle: "Aggiungi un vecchio esercizio",
        addHint: "Inserisci il codice di un esercizio creato prima del tuo account o di questa funzione.",
        code: "Codice dell’esercizio",
        add: "Aggiungi",
        adding: "Aggiunta…",
        launch: "Avvia",
        loading: "Caricamento degli esercizi…",
        empty: "Non hai ancora salvato nessun esercizio.",
        emptyHint: "Gli esercizi creati mentre sei connesso appariranno qui.",
        invalid: "Inserisci un codice nel formato AB-CD-EF-23.",
        missing: "Questo codice non corrisponde a nessun esercizio.",
        duplicate: "Questo esercizio è già nel tuo account.",
        added: "L’esercizio è stato aggiunto al tuo account.",
        error: "Impossibile caricare gli esercizi al momento.",
        addError: "Impossibile aggiungere questo esercizio al momento."
      },
      es: {
        tab: "Mis ejercicios",
        eyebrow: "Mis ejercicios guardados",
        title: "Mis ejercicios",
        intro: "Encuentra los ejercicios que has creado o añadido a tu cuenta.",
        addTitle: "Añadir un ejercicio anterior",
        addHint: "Introduce el código de un ejercicio creado antes de tu cuenta o de esta función.",
        code: "Código del ejercicio",
        add: "Añadir",
        adding: "Añadiendo…",
        launch: "Iniciar",
        loading: "Cargando tus ejercicios…",
        empty: "Todavía no has guardado ningún ejercicio.",
        emptyHint: "Los ejercicios que crees mientras estés conectado aparecerán aquí.",
        invalid: "Introduce un código con el formato AB-CD-EF-23.",
        missing: "Este código no corresponde a ningún ejercicio.",
        duplicate: "Este ejercicio ya está en tu cuenta.",
        added: "El ejercicio se ha añadido a tu cuenta.",
        error: "No se pueden cargar tus ejercicios en este momento.",
        addError: "No se puede añadir este ejercicio en este momento."
      },
      nl: {
        tab: "Mijn uitdagingen",
        eyebrow: "Mijn opgeslagen uitdagingen",
        title: "Mijn uitdagingen",
        intro: "Vind de uitdagingen die je hebt aangemaakt of aan je account hebt toegevoegd.",
        addTitle: "Een oude uitdaging toevoegen",
        addHint: "Voer de code in van een uitdaging die is aangemaakt vóór je account of vóór deze functie bestond.",
        code: "Code van de uitdaging",
        add: "Toevoegen",
        adding: "Wordt toegevoegd…",
        launch: "Starten",
        loading: "Je uitdagingen worden geladen…",
        empty: "Je hebt nog geen uitdagingen opgeslagen.",
        emptyHint: "Uitdagingen die je aanmaakt terwijl je aangemeld bent, verschijnen hier.",
        invalid: "Voer een code in met de vorm AB-CD-EF-23.",
        missing: "Deze code hoort niet bij een uitdaging.",
        duplicate: "Deze uitdaging staat al in je account.",
        added: "De uitdaging is aan je account toegevoegd.",
        error: "Je uitdagingen kunnen momenteel niet worden geladen.",
        addError: "Deze uitdaging kan momenteel niet worden toegevoegd."
      }
    })[interfaceLocale.value]);
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
    const requestedTab = (value) => ["saved", "progress", "history", "preferences", "account"].includes(String(value)) ? String(value) : "history";
    const activeTab = ref(requestedTab(route.query.tab));
    const savedChallenges = ref([]);
    const savedChallengesNow = ref(/* @__PURE__ */ new Date());
    const savedChallengeGroups = computed(() => groupSavedChallenges(savedChallenges.value, savedChallengesNow.value, interfaceLocale.value));
    const savedChallengesLoaded = ref(false);
    const savedChallengesPending = ref(false);
    const savedChallengesError = ref("");
    const savedChallengeCode = ref("");
    const savedChallengeFormOpen = ref(false);
    useTemplateRef("saved-challenge-code-input");
    const savedChallengeAdding = ref(false);
    const savedChallengeAddError = ref("");
    const savedChallengeAddNotice = ref("");
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
      if (tab === "saved") return "learner.saved-challenges";
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
      { value: "es", label: ui("Espagnol"), flag: "🇪🇸" },
      { value: "nl-NL", label: "Nederlands (Nederland)", flag: "🇳🇱" },
      { value: "nl", label: "Nederlands (België)", flag: "🇧🇪" }
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
      if (tab === "saved") void loadSavedChallenges();
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
      return new Intl.DateTimeFormat(localeLanguageTag(interfaceLocale.value), {
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
      return new Intl.DateTimeFormat(localeLanguageTag(interfaceLocale.value), {
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
      return new Intl.DateTimeFormat(localeLanguageTag(interfaceLocale.value), {
        timeZone: "Europe/Zurich",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(value));
    }
    function challengeErrorsLabel(count) {
      if (interfaceLocale.value === "nl" || interfaceLocale.value === "nl-NL") return `${count} ${count === 1 ? "fout" : "fouten"}`;
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
      const correctText = pluralLabel(correct, withDutchVariants({
        fr: ["réussite", "réussites"],
        de: ["Erfolg", "Erfolge"],
        en: ["success", "successes"],
        it: ["risposta corretta", "risposte corrette"],
        es: ["acierto", "aciertos"],
        nl: ["juist antwoord", "juiste antwoorden"]
      }));
      const incorrectText = pluralLabel(incorrect, withDutchVariants({
        fr: ["erreur", "erreurs"],
        de: ["Fehler", "Fehler"],
        en: ["mistake", "mistakes"],
        it: ["errore", "errori"],
        es: ["error", "errores"],
        nl: ["fout", "fouten"]
      }));
      return `${correctText} · ${incorrectText}`;
    }
    function trainingCountLabel(count) {
      return pluralLabel(count, withDutchVariants({
        fr: ["entraînement", "entraînements"],
        de: ["Training", "Trainings"],
        en: ["practice session", "practice sessions"],
        it: ["allenamento", "allenamenti"],
        es: ["entrenamiento", "entrenamientos"],
        nl: ["oefensessie", "oefensessies"]
      }));
    }
    function occurrenceCountLabel(count) {
      return pluralLabel(count, withDutchVariants({
        fr: ["occurrence", "occurrences"],
        de: ["Sitzung", "Sitzungen"],
        en: ["session", "sessions"],
        it: ["sessione", "sessioni"],
        es: ["sesión", "sesiones"],
        nl: ["sessie", "sessies"]
      }));
    }
    function questionCountLabel(count) {
      return pluralLabel(count, withDutchVariants({
        fr: ["question", "questions"],
        de: ["Frage", "Fragen"],
        en: ["question", "questions"],
        it: ["domanda", "domande"],
        es: ["pregunta", "preguntas"],
        nl: ["vraag", "vragen"]
      }));
    }
    function successPercentLabel(rate) {
      const suffix = withDutchVariants({ fr: "de réussite", de: "Erfolg", en: "success", it: "di successo", es: "de aciertos", nl: "juiste antwoorden" })[interfaceLocale.value];
      return `${rate}% ${suffix}`;
    }
    function successEvolutionLabel(label) {
      const prefix = withDutchVariants({
        fr: "Évolution du pourcentage de réussite pour",
        de: "Entwicklung der Erfolgsquote für",
        en: "Success rate over time for",
        it: "Evoluzione della percentuale di successo per",
        es: "Evolución del porcentaje de aciertos para",
        nl: "Slaagpercentage door de tijd heen voor"
      })[interfaceLocale.value];
      return `${prefix} ${label}`;
    }
    function trainingPointLabel(point) {
      const ending = withDutchVariants({
        fr: "Voir les erreurs de cette session.",
        de: "Fehler dieser Sitzung anzeigen.",
        en: "View the mistakes from this session.",
        it: "Vedi gli errori di questa sessione.",
        es: "Ver los errores de esta sesión.",
        nl: "Bekijk de fouten uit deze sessie."
      })[interfaceLocale.value];
      return `${trainingDateLabel(point.occurredAt, true)}: ${successPercentLabel(point.successPercent)}. ${ending}`;
    }
    function responseSummaryLabel(correct, incorrect) {
      return resultCountLabel(correct, incorrect);
    }
    function questionsOutOfLabel(answered, total) {
      const middle = withDutchVariants({ fr: "questions sur", de: "Fragen von", en: "questions out of", it: "domande su", es: "preguntas de", nl: "vragen van" })[interfaceLocale.value];
      return `${answered} ${middle} ${total}`;
    }
    function localizedTrainingReportTitle(title) {
      if (!title || interfaceLocale.value === "fr") return title;
      if (title === learnerSpaceCopy("fr").trainChallengeErrors) return copy.value.trainChallengeErrors;
      const frenchPrefix = "Entraînement des erreurs du ";
      if (title.startsWith(frenchPrefix)) {
        const suffix = title.slice(frenchPrefix.length);
        const prefix = withDutchVariants({
          de: "Fehlertraining vom ",
          en: "Mistake practice from ",
          it: "Allenamento sugli errori del ",
          es: "Entrenamiento de errores del ",
          nl: "Fouten oefenen van "
        })[interfaceLocale.value];
        return `${prefix}${suffix}`;
      }
      return title;
    }
    function trainQuestionsLabel(count) {
      if (interfaceLocale.value === "fr") {
        return count === 1 ? "Entraîner cette question" : `Entraîner ces ${count} questions`;
      }
      const prefix = withDutchVariants({ fr: "Entraîner ces", de: "Diese", en: "Practise these", it: "Allenare queste", es: "Practicar estas", nl: "Oefen deze" })[interfaceLocale.value];
      const suffix = interfaceLocale.value === "de" ? count === 1 ? "Frage trainieren" : "Fragen trainieren" : questionCountLabel(count).replace(String(count), "").trim();
      return interfaceLocale.value === "de" ? `${prefix} ${count} ${suffix}` : `${prefix} ${count} ${suffix}`;
    }
    function sessionResultLabel(correct, total) {
      const middle = withDutchVariants({ fr: "réussites sur", de: "Erfolge von", en: "successes out of", it: "risposte corrette su", es: "aciertos de", nl: "juiste antwoorden van" })[interfaceLocale.value];
      return `${correct} ${middle} ${total}`;
    }
    function errorEvolutionLabel(label) {
      const prefix = withDutchVariants({
        fr: "Évolution du taux d’erreurs pour",
        de: "Entwicklung der Fehlerquote für",
        en: "Error rate over time for",
        it: "Evoluzione della percentuale di errori per",
        es: "Evolución del porcentaje de errores para",
        nl: "Foutenpercentage door de tijd heen voor"
      })[interfaceLocale.value];
      return `${prefix} ${label}`;
    }
    function chartPointLabel(rate, errors, opportunities) {
      const values = withDutchVariants({
        fr: `${rate}% de fautes, ${errors} sur ${opportunities} occasions testées`,
        de: `${rate}% Fehler, ${errors} von ${opportunities} geprüften Gelegenheiten`,
        en: `${rate}% mistakes, ${errors} out of ${opportunities} tested opportunities`,
        it: `${rate}% di errori, ${errors} su ${opportunities} occasioni verificate`,
        es: `${rate}% de errores, ${errors} de ${opportunities} ocasiones evaluadas`,
        nl: `${rate}% fouten, ${errors} van ${opportunities} testgelegenheden`
      });
      return values[interfaceLocale.value];
    }
    function totalOpportunitiesLabel(count) {
      const values = withDutchVariants({
        fr: `${count} occasion${count === 1 ? "" : "s"} réellement testée${count === 1 ? "" : "s"} au total`,
        de: `${count} tatsächlich geprüfte ${count === 1 ? "Gelegenheit" : "Gelegenheiten"} insgesamt`,
        en: `${count} ${count === 1 ? "opportunity" : "opportunities"} actually tested in total`,
        it: `${count} ${count === 1 ? "occasione realmente verificata" : "occasioni realmente verificate"} in totale`,
        es: `${count} ${count === 1 ? "ocasión realmente evaluada" : "ocasiones realmente evaluadas"} en total`,
        nl: `${count} ${count === 1 ? "testgelegenheid" : "testgelegenheden"} in totaal`
      });
      return values[interfaceLocale.value];
    }
    function affectedChallengesLabel(count) {
      const values = withDutchVariants({
        fr: `${count === 1 ? "défi concerné" : "défis concernés"}`,
        de: count === 1 ? "betroffene Übung" : "betroffene Übungen",
        en: count === 1 ? "challenge concerned" : "challenges concerned",
        it: count === 1 ? "esercizio interessato" : "esercizi interessati",
        es: count === 1 ? "ejercicio relacionado" : "ejercicios relacionados",
        nl: count === 1 ? "betrokken uitdaging" : "betrokken uitdagingen"
      });
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
      if (interfaceLocale.value === "nl" || interfaceLocale.value === "nl-NL") {
        return shown < total ? `Bekijk ${shown} van mijn ${total} fouten` : `Bekijk mijn ${total} ${total === 1 ? "fout" : "fouten"}`;
      }
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
    function updateSavedChallenge(value) {
      const challenge = savedChallenges.value.find((item) => item.code === value.code);
      if (challenge) Object.assign(challenge, value);
    }
    async function loadSavedChallenges(force = false) {
      savedChallengesNow.value = /* @__PURE__ */ new Date();
      if (savedChallengesPending.value || savedChallengesLoaded.value && !force) return;
      savedChallengesPending.value = true;
      savedChallengesError.value = "";
      try {
        const response = await $fetch(learnerApi("saved-challenges"), {
          credentials: "same-origin"
        });
        savedChallenges.value = response.challenges;
        savedChallengesLoaded.value = true;
      } catch {
        savedChallengesError.value = savedCopy.value.error;
      } finally {
        savedChallengesPending.value = false;
      }
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
        return interfaceLocale.value === "de" ? `${count} Fehlerpunkte weniger` : interfaceLocale.value === "nl" || interfaceLocale.value === "nl-NL" ? `${count} procentpunten minder fouten` : interfaceLocale.value === "en" ? `${count} fewer error points` : interfaceLocale.value === "it" ? `${count} punti di errore in meno` : interfaceLocale.value === "es" ? `${count} puntos de error menos` : `${count} points d’erreur en moins`;
      }
      if (card.trend === "worsening") {
        const count = Math.abs(card.trendDelta || 0);
        return interfaceLocale.value === "de" ? `${count} Fehlerpunkte mehr` : interfaceLocale.value === "nl" || interfaceLocale.value === "nl-NL" ? `${count} procentpunten meer fouten` : interfaceLocale.value === "en" ? `${count} more error points` : interfaceLocale.value === "it" ? `${count} punti di errore in più` : interfaceLocale.value === "es" ? `${count} puntos de error más` : `${count} points d’erreur en plus`;
      }
      if (card.trend === "stable") return copy.value.stableRate;
      return copy.value.tooFewComparable;
    }
    function progressLastTestLabel(card) {
      if (card.daysSinceLastTest === 0) return copy.value.testedToday;
      if (card.daysSinceLastTest === 1) return copy.value.testedYesterday;
      const count = card.daysSinceLastTest;
      return interfaceLocale.value === "de" ? `Vor ${count} Tagen getestet` : interfaceLocale.value === "nl" || interfaceLocale.value === "nl-NL" ? `${count} dagen geleden getest` : interfaceLocale.value === "en" ? `Tested ${count} days ago` : interfaceLocale.value === "it" ? `Verificato ${count} giorni fa` : interfaceLocale.value === "es" ? `Evaluado hace ${count} días` : `Testé il y a ${count} jours`;
    }
    function progressDateLabel(value) {
      return new Intl.DateTimeFormat(localeLanguageTag(interfaceLocale.value), {
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
      const _component_LearnerSavedChallengeCard = __nuxt_component_0$1;
      const _component_PasswordInput = __nuxt_component_1$1;
      const _component_LearnerHistorySessionSummaryDialog = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["learner-space", { "learner-space--dark": unref(preferredTheme) === "dark" }]
      }, _attrs))} data-v-3792aaca><header class="learner-space__hero" data-v-3792aaca><div data-v-3792aaca><h1 data-v-3792aaca>${ssrInterpolate(unref(copy).hello)} ${ssrInterpolate(unref(displayUsername))}</h1></div><nav class="learner-space__hero-actions"${ssrRenderAttr("aria-label", unref(copy).personalSettings)} data-v-3792aaca><button class="${ssrRenderClass({ "is-active": unref(activeTab) === "preferences" })}" type="button" data-v-3792aaca>${ssrInterpolate(unref(copy).preferences)}</button><button class="${ssrRenderClass({ "is-active": unref(activeTab) === "account" })}" type="button" data-v-3792aaca>${ssrInterpolate(unref(copy).account)}</button></nav></header><nav class="learner-tabs" style="${ssrRenderStyle(unref(stickyTabsStyle))}"${ssrRenderAttr("aria-label", unref(copy).spaceSections)} data-v-3792aaca><button class="${ssrRenderClass({ "is-active": unref(activeTab) === "saved" })}" type="button" data-v-3792aaca>${ssrInterpolate(unref(savedCopy).tab)}</button><button class="${ssrRenderClass([{ "is-active": unref(activeTab) === "history" }, "learner-tabs__primary"])}" type="button" data-v-3792aaca><span aria-hidden="true" data-v-3792aaca>✦</span> ${ssrInterpolate(unref(copy).history)}</button><button class="${ssrRenderClass({ "is-active": unref(activeTab) === "progress" })}" type="button" data-v-3792aaca>${ssrInterpolate(unref(copy).commonErrors)}</button></nav>`);
      if (unref(activeTab) === "saved") {
        _push(`<section class="learner-panel" aria-labelledby="saved-challenges-title" data-v-3792aaca><div class="learner-panel__heading" data-v-3792aaca><div data-v-3792aaca><p class="learner-eyebrow" data-v-3792aaca>${ssrInterpolate(unref(savedCopy).eyebrow)}</p><h2 id="saved-challenges-title" data-v-3792aaca>${ssrInterpolate(unref(savedCopy).title)}</h2></div></div><p class="saved-challenges__intro" data-v-3792aaca>${ssrInterpolate(unref(savedCopy).intro)}</p>`);
        if (!props.readOnly) {
          _push(`<form class="${ssrRenderClass([{ "is-collapsed": !unref(savedChallengeFormOpen) }, "saved-challenge-form"])}" data-v-3792aaca><div class="saved-challenge-form__header" data-v-3792aaca><strong data-v-3792aaca>${ssrInterpolate(unref(savedCopy).addTitle)}</strong>`);
          if (!unref(savedChallengeFormOpen)) {
            _push(`<button type="button"${ssrRenderAttr("aria-expanded", unref(savedChallengeFormOpen))} aria-controls="saved-challenge-form-details"${ssrIncludeBooleanAttr(unref(savedChallengeAdding)) ? " disabled" : ""} data-v-3792aaca>${ssrInterpolate(unref(savedCopy).add)}</button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div id="saved-challenge-form-details" class="${ssrRenderClass([{ "is-open": unref(savedChallengeFormOpen) }, "saved-challenge-form__details"])}"${ssrIncludeBooleanAttr(!unref(savedChallengeFormOpen)) ? " inert" : ""}${ssrRenderAttr("aria-hidden", !unref(savedChallengeFormOpen))} data-v-3792aaca><div class="saved-challenge-form__body" data-v-3792aaca><div class="saved-challenge-form__fields" data-v-3792aaca><p data-v-3792aaca>${ssrInterpolate(unref(savedCopy).addHint)}</p><label for="saved-challenge-code" data-v-3792aaca>${ssrInterpolate(unref(savedCopy).code)}</label><div class="saved-challenge-form__control" data-v-3792aaca><input id="saved-challenge-code"${ssrRenderAttr("value", unref(savedChallengeCode))} type="text" inputmode="text" autocomplete="off" maxlength="11" placeholder="AB-CD-EF-23"${ssrIncludeBooleanAttr(unref(savedChallengeAdding)) ? " disabled" : ""} data-v-3792aaca><button type="submit"${ssrIncludeBooleanAttr(unref(savedChallengeAdding)) ? " disabled" : ""} data-v-3792aaca>${ssrInterpolate(unref(savedChallengeAdding) ? unref(savedCopy).adding : unref(savedCopy).add)}</button></div>`);
          if (unref(savedChallengeAddError)) {
            _push(`<p class="saved-challenge-form__error" role="alert" data-v-3792aaca>${ssrInterpolate(unref(savedChallengeAddError))}</p>`);
          } else if (unref(savedChallengeAddNotice)) {
            _push(`<p class="saved-challenge-form__notice" role="status" data-v-3792aaca>${ssrInterpolate(unref(savedChallengeAddNotice))}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div></div></form>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(savedChallengesPending) && !unref(savedChallengesLoaded)) {
          _push(`<p class="learner-empty" data-v-3792aaca>${ssrInterpolate(unref(savedCopy).loading)}</p>`);
        } else if (unref(savedChallengesError)) {
          _push(`<p class="saved-challenge-form__error" role="alert" data-v-3792aaca>${ssrInterpolate(unref(savedChallengesError))}</p>`);
        } else if (unref(savedChallenges).length) {
          _push(`<div class="saved-challenges__groups" data-v-3792aaca><!--[-->`);
          ssrRenderList(unref(savedChallengeGroups), (group) => {
            _push(`<section class="saved-challenges__group"${ssrRenderAttr("aria-labelledby", `saved-group-${group.key}`)} data-v-3792aaca><h3${ssrRenderAttr("id", `saved-group-${group.key}`)} class="saved-challenges__group-title" data-v-3792aaca>${ssrInterpolate(group.title)}</h3><div class="saved-challenges__grid" data-v-3792aaca><!--[-->`);
            ssrRenderList(group.entries, ({ challenge, dateLabel, dateTime }) => {
              _push(ssrRenderComponent(_component_LearnerSavedChallengeCard, {
                key: challenge.code,
                challenge,
                "date-label": dateLabel,
                "date-time": dateTime,
                "read-only": props.readOnly,
                onUpdated: updateSavedChallenge
              }, null, _parent));
            });
            _push(`<!--]--></div></section>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<p class="learner-empty" data-v-3792aaca><strong data-v-3792aaca>${ssrInterpolate(unref(savedCopy).empty)}</strong><span data-v-3792aaca>${ssrInterpolate(unref(savedCopy).emptyHint)}</span></p>`);
        }
        _push(`</section>`);
      } else if (unref(activeTab) === "challenges" || unref(activeTab) === "history") {
        _push(`<section class="learner-panel" aria-labelledby="challenges-title" data-v-3792aaca><div class="learner-panel__heading" data-v-3792aaca><div data-v-3792aaca><p class="learner-eyebrow" data-v-3792aaca>${ssrInterpolate(unref(activeTab) === "history" ? unref(copy).findActivities : unref(copy).resumeAndConsolidate)}</p><h2 id="challenges-title" data-v-3792aaca>${ssrInterpolate(unref(activeTab) === "history" ? unref(copy).history : unref(copy).improve)}</h2></div></div><aside class="learner-section-intro" data-v-3792aaca><strong data-v-3792aaca>${ssrInterpolate(unref(activeTab) === "history" ? unref(copy).reviewJourney : unref(copy).chooseTraining)}</strong>`);
        if (unref(activeTab) === "history") {
          _push(`<p data-v-3792aaca>${ssrInterpolate(unref(copy).historyIntro)}</p>`);
        } else {
          _push(`<p data-v-3792aaca>${ssrInterpolate(unref(copy).improveIntro)}</p>`);
        }
        _push(`</aside>`);
        if (unref(activeTab) === "history") {
          _push(`<!--[-->`);
          if (unref(dashboardPending)) {
            _push(`<p class="learner-empty" data-v-3792aaca>${ssrInterpolate(unref(copy).loadingChallenges)}</p>`);
          } else if (unref(dashboard)?.challenges.length) {
            _push(`<!--[--><ol class="challenge-history"${ssrRenderAttr("aria-label", unref(copy).challengeHistory)} data-v-3792aaca><!--[-->`);
            ssrRenderList(unref(challengeDays), (day) => {
              _push(`<li class="challenge-history__day" data-v-3792aaca><time class="challenge-history__date"${ssrRenderAttr("datetime", day.key)} data-v-3792aaca>${ssrInterpolate(day.label)}</time><ol class="challenge-history__day-list" data-v-3792aaca><!--[-->`);
              ssrRenderList(day.challenges, (challenge, challengeIndex) => {
                _push(`<li class="${ssrRenderClass({
                  "is-left": challengeIndex % 2 === 0,
                  "is-right": challengeIndex % 2 !== 0,
                  "is-work-menu-open": unref(selectedWork)?.challenge.id === challenge.id && unref(workMenuFingerprint)
                })}" data-v-3792aaca><span class="challenge-history__dot" aria-hidden="true" data-v-3792aaca></span><article class="${ssrRenderClass([{ "challenge-card--perfect": challengeIsComplete(challenge) && challenge.incorrectCount === 0 }, "challenge-card"])}" data-v-3792aaca><div class="challenge-card__top" data-v-3792aaca><div class="challenge-card__heading" data-v-3792aaca><h3 data-v-3792aaca>${ssrInterpolate(challengeDisplayLabel(challenge))}</h3>`);
                if (challengeExerciseKindLabel(challenge)) {
                  _push(`<p class="challenge-card__exercise-kind" data-v-3792aaca>${ssrInterpolate(challengeExerciseKindLabel(challenge))}</p>`);
                } else {
                  _push(`<!---->`);
                }
                _push(`</div><span data-v-3792aaca>${ssrInterpolate(formattedChallengeTime(challenge.lastActivityAt))}</span></div>`);
                if (challenge.description && challenge.incorrectCount > 0) {
                  _push(`<div class="challenge-card__description" data-v-3792aaca><p data-v-3792aaca>${ssrInterpolate(challenge.description)}</p></div>`);
                } else {
                  _push(`<!---->`);
                }
                _push(`<div class="challenge-card__question-progress" role="img"${ssrRenderAttr("aria-label", challengeProgressLabel(challenge))} data-v-3792aaca><!--[-->`);
                ssrRenderList(challenge.challenge.questionCount, (index) => {
                  _push(`<span${ssrRenderAttr("title", challengeQuestionLabel(challenge, index - 1))} class="${ssrRenderClass({
                    "is-correct": challengeQuestionResult(challenge, index - 1)?.status === "correct" && challengeQuestionResult(challenge, index - 1)?.attemptNumber !== 2,
                    "is-correct-retry": challengeQuestionResult(challenge, index - 1)?.status === "correct" && challengeQuestionResult(challenge, index - 1)?.attemptNumber === 2,
                    "is-incorrect": challengeQuestionResult(challenge, index - 1)?.status === "incorrect"
                  })}" data-v-3792aaca></span>`);
                });
                _push(`<!--]--></div><div class="${ssrRenderClass([{
                  "has-single-action": __props.readOnly || challengeIsComplete(challenge)
                }, "challenge-card__primary-actions"])}" data-v-3792aaca>`);
                if (!__props.readOnly && !challengeIsComplete(challenge)) {
                  _push(`<div class="challenge-finish" data-v-3792aaca><button type="button" class="challenge-card__finish-session"${ssrRenderAttr("aria-expanded", unref(finishMenuChallengeId) === challenge.id)} data-v-3792aaca><span class="review-button__scope-icon" aria-hidden="true" data-v-3792aaca><svg viewBox="0 0 24 24" data-v-3792aaca><path d="M8 5v14l11-7z" data-v-3792aaca></path></svg></span><span class="review-button__scope-copy" data-v-3792aaca><strong data-v-3792aaca>${ssrInterpolate(unref(ui)("Terminer la séance"))}</strong><small data-v-3792aaca>${ssrInterpolate(unref(ui)("Reprendre à la prochaine question"))}</small></span></button>`);
                  if (unref(finishMenuChallengeId) === challenge.id) {
                    _push(`<div class="challenge-presentation-menu" role="group"${ssrRenderAttr("aria-label", unref(copy).choosePresentation)} data-v-3792aaca><button class="action-button action-button--primary" type="button"${ssrIncludeBooleanAttr(Boolean(unref(challengeStarting))) ? " disabled" : ""} data-v-3792aaca><span class="action-button__icon" aria-hidden="true" data-v-3792aaca>●</span><span data-v-3792aaca><strong data-v-3792aaca>${ssrInterpolate(unref(copy).classic)}</strong></span></button><button class="action-button action-button--chat" type="button"${ssrIncludeBooleanAttr(Boolean(unref(challengeStarting))) ? " disabled" : ""} data-v-3792aaca><span class="action-button__icon" aria-hidden="true" data-v-3792aaca>`);
                    if (unref(randomCoachAvatar)) {
                      _push(`<img${ssrRenderAttr("src", unref(randomCoachAvatar))} alt="" data-v-3792aaca>`);
                    } else {
                      _push(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" data-v-3792aaca><circle cx="12" cy="8" r="4" data-v-3792aaca></circle><path d="M4.5 21a7.5 7.5 0 0 1 15 0" data-v-3792aaca></path></svg>`);
                    }
                    _push(`</span><span data-v-3792aaca><strong data-v-3792aaca>${ssrInterpolate(unref(copy).withCoach)}</strong></span></button></div>`);
                  } else {
                    _push(`<!---->`);
                  }
                  _push(`</div>`);
                } else {
                  _push(`<!---->`);
                }
                _push(`<button type="button" class="review-button review-button--summary"${ssrIncludeBooleanAttr(unref(historySummaryPendingId) === challenge.id) ? " disabled" : ""} data-v-3792aaca><span class="review-button__scope-icon" aria-hidden="true" data-v-3792aaca><svg viewBox="0 0 24 24" data-v-3792aaca><path d="M6 3h9l3 3v15H6zM9 10h6M9 14h6M9 18h4" data-v-3792aaca></path></svg></span><span class="review-button__scope-copy" data-v-3792aaca><strong data-v-3792aaca>${ssrInterpolate(unref(copy).viewSummary)}</strong><small data-v-3792aaca>${ssrInterpolate(unref(copy).summaryHint)}</small></span></button></div>`);
                if (unref(historySummaryError)?.challengeId === challenge.id) {
                  _push(`<p class="preferences-error" role="alert" data-v-3792aaca>${ssrInterpolate(unref(historySummaryError).message)}</p>`);
                } else {
                  _push(`<!---->`);
                }
                if (!__props.readOnly) {
                  _push(`<div class="challenge-work" data-v-3792aaca>`);
                  if (challengeIsComplete(challenge)) {
                    _push(`<div class="challenge-work__group" data-v-3792aaca><header class="challenge-work__heading" data-v-3792aaca><strong data-v-3792aaca>${ssrInterpolate(unref(copy).retrainChallenge)}</strong></header><div data-v-3792aaca><button type="button" class="review-button review-button--choice"${ssrIncludeBooleanAttr(Boolean(unref(challengeStarting))) ? " disabled" : ""}${ssrRenderAttr("title", challenge.exactQuestions.length ? unref(copy).sameDraw : unref(copy).oldDraw)}${ssrRenderAttr("aria-expanded", unref(workMenuFingerprint) === `${challenge.id}-same`)} data-v-3792aaca><svg viewBox="0 0 24 24" aria-hidden="true" data-v-3792aaca><path d="M7 7h10M7 12h10M7 17h10M4 7h.01M4 12h.01M4 17h.01" data-v-3792aaca></path></svg><span data-v-3792aaca>${ssrInterpolate(unref(copy).sameOrder)}</span></button><button type="button" class="review-button review-button--choice"${ssrIncludeBooleanAttr(Boolean(unref(challengeStarting))) ? " disabled" : ""}${ssrRenderAttr("aria-expanded", unref(workMenuFingerprint) === `${challenge.id}-random`)} data-v-3792aaca><svg viewBox="0 0 24 24" aria-hidden="true" data-v-3792aaca><path d="M4 7h3c4 0 6 10 10 10h3M17 4l3 3-3 3M4 17h3c1.7 0 3-1.7 4.2-3.7M16 7h4M17 14l3 3-3 3" data-v-3792aaca></path></svg><span data-v-3792aaca>${ssrInterpolate(unref(copy).randomOrder)}</span></button></div></div>`);
                  } else {
                    _push(`<!---->`);
                  }
                  if (challenge.unresolvedCount > 0) {
                    _push(`<div class="challenge-work__group" data-v-3792aaca><header class="challenge-work__heading" data-v-3792aaca><strong data-v-3792aaca>${ssrInterpolate(unref(copy).retrainErrors)}</strong></header><div data-v-3792aaca>`);
                    if (challenge.unresolvedCount > 0) {
                      _push(`<button type="button" class="review-button review-button--error-scope"${ssrIncludeBooleanAttr(Boolean(unref(challengeStarting))) ? " disabled" : ""}${ssrRenderAttr("aria-expanded", unref(workMenuFingerprint) === `${challenge.id}-incorrect`)} data-v-3792aaca><span class="review-button__scope-icon" aria-hidden="true" data-v-3792aaca><svg viewBox="0 0 24 24" data-v-3792aaca><rect x="5" y="3" width="14" height="18" rx="3" data-v-3792aaca></rect><path d="M9 8h6M9 12h6M9 16h4" data-v-3792aaca></path></svg></span><span class="review-button__scope-copy" data-v-3792aaca><strong data-v-3792aaca>${ssrInterpolate(unref(copy).errorsThisSession)}</strong><small data-v-3792aaca>${ssrInterpolate(challengeErrorsLabel(challenge.unresolvedCount))}</small></span></button>`);
                    } else {
                      _push(`<!---->`);
                    }
                    if (challenge.allUnresolvedCount > 0) {
                      _push(`<button type="button" class="review-button review-button--error-scope"${ssrIncludeBooleanAttr(Boolean(unref(challengeStarting))) ? " disabled" : ""}${ssrRenderAttr("aria-expanded", unref(workMenuFingerprint) === `${challenge.id}-all-incorrect`)} data-v-3792aaca><span class="review-button__scope-icon" aria-hidden="true" data-v-3792aaca><svg viewBox="0 0 24 24" data-v-3792aaca><rect x="7" y="3" width="12" height="16" rx="3" data-v-3792aaca></rect><path d="M5 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1M10 8h6M10 12h6" data-v-3792aaca></path></svg></span><span class="review-button__scope-copy" data-v-3792aaca><strong data-v-3792aaca>${ssrInterpolate(unref(copy).errorsWholeChallenge)}</strong><small data-v-3792aaca>${ssrInterpolate(challengeErrorsLabel(challenge.allUnresolvedCount))}</small></span></button>`);
                    } else {
                      _push(`<!---->`);
                    }
                    _push(`</div></div>`);
                  } else {
                    _push(`<!---->`);
                  }
                  if (unref(selectedWork)?.challenge.id === challenge.id && unref(workMenuFingerprint)) {
                    _push(`<div class="challenge-presentation-menu" style="${ssrRenderStyle({ left: `${unref(workMenuLeft)}px` })}" role="group"${ssrRenderAttr("aria-label", unref(copy).choosePresentation)} data-v-3792aaca><button class="action-button action-button--primary" type="button"${ssrIncludeBooleanAttr(Boolean(unref(challengeStarting))) ? " disabled" : ""} data-v-3792aaca><span class="action-button__icon" aria-hidden="true" data-v-3792aaca>●</span><span data-v-3792aaca><strong data-v-3792aaca>${ssrInterpolate(unref(copy).classic)}</strong></span></button><button class="action-button action-button--chat" type="button"${ssrIncludeBooleanAttr(Boolean(unref(challengeStarting))) ? " disabled" : ""} data-v-3792aaca><span class="action-button__icon" aria-hidden="true" data-v-3792aaca>`);
                    if (unref(randomCoachAvatar)) {
                      _push(`<img${ssrRenderAttr("src", unref(randomCoachAvatar))} alt="" data-v-3792aaca>`);
                    } else {
                      _push(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" data-v-3792aaca><circle cx="12" cy="8" r="4" data-v-3792aaca></circle><path d="M4.5 21a7.5 7.5 0 0 1 15 0" data-v-3792aaca></path></svg>`);
                    }
                    _push(`</span><span data-v-3792aaca><strong data-v-3792aaca>${ssrInterpolate(unref(copy).withCoach)}</strong></span></button></div>`);
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
              _push(`<p class="preferences-error" role="alert" data-v-3792aaca>${ssrInterpolate(unref(challengeStartError))}</p>`);
            } else {
              _push(`<!---->`);
            }
            if (unref(historyHasMore)) {
              _push(`<div class="challenge-loader-sentinel" aria-hidden="true" data-v-3792aaca></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<!--]-->`);
          } else {
            _push(`<div class="learner-empty" data-v-3792aaca><strong data-v-3792aaca>${ssrInterpolate(unref(copy).noChallenge)}</strong><span data-v-3792aaca>${ssrInterpolate(unref(copy).futureAnswers)}</span></div>`);
          }
          _push(`<!--]-->`);
        } else {
          _push(`<!--[-->`);
          if (unref(challengeTrainingsError)) {
            _push(`<p class="preferences-error" role="alert" data-v-3792aaca>${ssrInterpolate(unref(challengeTrainingsError))}</p>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(challengeTrainingsPending) && !unref(challengeTrainings).length) {
            _push(`<p class="learner-empty" data-v-3792aaca>${ssrInterpolate(unref(copy).groupingTrainings)}</p>`);
          } else if (unref(challengeTrainings).length) {
            _push(`<div class="challenge-training-layout" data-v-3792aaca><nav class="challenge-training-list"${ssrRenderAttr("aria-label", unref(copy).trainedChallenges)} data-v-3792aaca><!--[-->`);
            ssrRenderList(unref(challengeTrainings), (training) => {
              _push(`<button type="button" class="${ssrRenderClass({ "is-active": unref(selectedTrainingFingerprint) === training.fingerprint })}"${ssrRenderAttr("aria-current", unref(selectedTrainingFingerprint) === training.fingerprint ? "true" : void 0)} data-v-3792aaca><span data-v-3792aaca>${ssrInterpolate(training.label)}</span><small data-v-3792aaca>${ssrInterpolate(trainingDateLabel(training.lastTrainedAt))}</small><b data-v-3792aaca>${ssrInterpolate(trainingCountLabel(training.sessionCount))} · ${ssrInterpolate(training.latestSuccessPercent)}% </b></button>`);
            });
            _push(`<!--]--></nav><section class="challenge-training-analysis" aria-live="polite" data-v-3792aaca>`);
            if (unref(selectedTraining)) {
              _push(`<header data-v-3792aaca><div data-v-3792aaca><p data-v-3792aaca>${ssrInterpolate(unref(copy).successEvolution)}</p><h3 data-v-3792aaca>${ssrInterpolate(unref(selectedTraining).label)}</h3></div></header>`);
            } else {
              _push(`<!---->`);
            }
            if (unref(selectedTrainingProgressError)) {
              _push(`<p class="preferences-error" role="alert" data-v-3792aaca>${ssrInterpolate(unref(selectedTrainingProgressError))}</p>`);
            } else if (unref(selectedTrainingProgressPending)) {
              _push(`<div class="challenge-training-state" data-v-3792aaca>${ssrInterpolate(unref(copy).calculatingProgress)}</div>`);
            } else if (unref(selectedTrainingProgress)?.points.length) {
              _push(`<!--[--><div class="challenge-training-chart" data-v-3792aaca><div class="challenge-training-chart__plot" data-v-3792aaca><svg viewBox="0 0 640 190" role="img"${ssrRenderAttr("aria-label", successEvolutionLabel(unref(selectedTraining)?.label || ""))} data-v-3792aaca><defs data-v-3792aaca><linearGradient id="training-success-gradient" x1="0" y1="156" x2="0" y2="16" gradientUnits="userSpaceOnUse" data-v-3792aaca><stop offset="0%" stop-color="#ef6760" data-v-3792aaca></stop><stop offset="50%" stop-color="#d6a33e" data-v-3792aaca></stop><stop offset="100%" stop-color="#3aa66f" data-v-3792aaca></stop></linearGradient></defs><g class="challenge-training-chart__grid" data-v-3792aaca><line x1="42" x2="624" y1="16" y2="16" data-v-3792aaca></line><line x1="42" x2="624" y1="86" y2="86" data-v-3792aaca></line><line x1="42" x2="624" y1="156" y2="156" data-v-3792aaca></line></g>`);
              if (unref(trainingChartCoordinates).length > 1) {
                _push(`<polyline${ssrRenderAttr("points", unref(trainingChartPolyline))} data-v-3792aaca></polyline>`);
              } else {
                _push(`<!---->`);
              }
              _push(`<!--[-->`);
              ssrRenderList(unref(trainingChartCoordinates), (coordinate) => {
                _push(`<circle${ssrRenderAttr("cx", coordinate.x)}${ssrRenderAttr("cy", coordinate.y)} style="${ssrRenderStyle({ stroke: trainingSuccessColor(coordinate.point.successPercent) })}" class="${ssrRenderClass({ "is-active": unref(hoveredTrainingPointId) === coordinate.point.id })}" role="button" tabindex="0"${ssrRenderAttr("aria-label", trainingPointLabel(coordinate.point))}${ssrRenderAttr("r", trainingPointRadius(coordinate.point.totalCount) + (unref(hoveredTrainingPointId) === coordinate.point.id ? 2 : 0))} data-v-3792aaca></circle>`);
              });
              _push(`<!--]--><!--[-->`);
              ssrRenderList(unref(trainingChartCoordinates), (coordinate) => {
                _push(`<text class="challenge-training-chart__point-count"${ssrRenderAttr("x", coordinate.x)}${ssrRenderAttr("y", coordinate.y)} aria-hidden="true" data-v-3792aaca>${ssrInterpolate(coordinate.point.totalCount)}</text>`);
              });
              _push(`<!--]--></svg>`);
              if (unref(hoveredTrainingCoordinate)) {
                _push(`<div class="challenge-training-chart__tooltip" style="${ssrRenderStyle({
                  left: `${Math.max(18, Math.min(82, unref(hoveredTrainingCoordinate).x / 640 * 100))}%`,
                  top: `${unref(hoveredTrainingCoordinate).y / 190 * 100}%`
                })}" role="tooltip" data-v-3792aaca><strong data-v-3792aaca>${ssrInterpolate(successPercentLabel(unref(hoveredTrainingCoordinate).point.successPercent))}</strong><span data-v-3792aaca>${ssrInterpolate(trainingDateLabel(unref(hoveredTrainingCoordinate).point.occurredAt, true))}</span><small data-v-3792aaca>${ssrInterpolate(unref(hoveredTrainingCoordinate).point.correctCount)}/${ssrInterpolate(unref(hoveredTrainingCoordinate).point.totalCount)} ${ssrInterpolate(responseSummaryLabel(unref(hoveredTrainingCoordinate).point.correctCount, unref(hoveredTrainingCoordinate).point.incorrectCount))}</small><b data-v-3792aaca>${ssrInterpolate(unref(copy).clickSession)}</b></div>`);
              } else {
                _push(`<!---->`);
              }
              _push(`<div class="challenge-training-chart__rate-axis" aria-hidden="true" data-v-3792aaca><span class="is-high" data-v-3792aaca>100%</span><span class="is-middle" data-v-3792aaca>50%</span><span class="is-low" data-v-3792aaca>0%</span></div><div class="challenge-training-chart__date-axis" aria-hidden="true" data-v-3792aaca><span data-v-3792aaca>${ssrInterpolate(trainingDateLabel(unref(selectedTrainingProgress).points[0].occurredAt))}</span><span data-v-3792aaca>${ssrInterpolate(trainingDateLabel(unref(selectedTrainingProgress).points.at(-1).occurredAt))}</span></div></div><footer data-v-3792aaca><span data-v-3792aaca>${ssrInterpolate(occurrenceCountLabel(unref(selectedTrainingProgress).points.length))}</span></footer></div><section class="challenge-training-achievement"${ssrRenderAttr("aria-label", unref(copy).achievementLabel)} data-v-3792aaca><div data-v-3792aaca><span data-v-3792aaca>${ssrInterpolate(unref(copy).bestResult)}</span><strong data-v-3792aaca><span class="challenge-training-achievement__rate" data-v-3792aaca>${ssrInterpolate(successPercentLabel(unref(selectedTrainingProgress).achievement.bestSuccessPercent))}</span><small data-v-3792aaca>${ssrInterpolate(unref(selectedTrainingProgress).achievement.bestAnsweredQuestionCount)} ${ssrInterpolate(questionsOutOfLabel(unref(selectedTrainingProgress).achievement.bestAnsweredQuestionCount, unref(selectedTrainingProgress).achievement.questionCount))}</small></strong></div><div class="${ssrRenderClass([{ "is-achieved": unref(selectedTrainingProgress).achievement.completedWithoutError }, "challenge-training-achievement__complete"])}" data-v-3792aaca><span class="challenge-training-achievement__check" role="img"${ssrRenderAttr("aria-label", unref(selectedTrainingProgress).achievement.completedWithoutError ? unref(copy).completeSuccess : unref(copy).notCompleteSuccess)}${ssrRenderAttr("aria-disabled", !unref(selectedTrainingProgress).achievement.completedWithoutError)} data-v-3792aaca>✓</span><p data-v-3792aaca><strong data-v-3792aaca>${ssrInterpolate(unref(copy).exerciseCompleted)}</strong><span data-v-3792aaca>(${ssrInterpolate(questionCountLabel(unref(selectedTrainingProgress).achievement.questionCount))})</span></p></div></section>`);
              if (!__props.readOnly) {
                _push(`<div class="challenge-work challenge-training-all-work" data-v-3792aaca><button type="button" class="challenge-training-all-work__button"${ssrIncludeBooleanAttr(!unref(allTrainingErrorQuestions).length || Boolean(unref(challengeStarting))) ? " disabled" : ""}${ssrRenderAttr("aria-expanded", unref(workMenuFingerprint) === "training-all")} data-v-3792aaca>${ssrInterpolate(unref(copy).practiseChallengeErrors)}</button>`);
                if (unref(workMenuFingerprint) === "training-all") {
                  _push(`<div class="challenge-presentation-menu" style="${ssrRenderStyle({ left: `${unref(workMenuLeft)}px` })}" role="group"${ssrRenderAttr("aria-label", unref(copy).choosePresentation)} data-v-3792aaca><button class="action-button action-button--primary" type="button"${ssrIncludeBooleanAttr(Boolean(unref(challengeStarting))) ? " disabled" : ""} data-v-3792aaca><span class="action-button__icon" aria-hidden="true" data-v-3792aaca>●</span><span data-v-3792aaca><strong data-v-3792aaca>${ssrInterpolate(unref(copy).classic)}</strong></span></button><button class="action-button action-button--chat" type="button"${ssrIncludeBooleanAttr(Boolean(unref(challengeStarting))) ? " disabled" : ""} data-v-3792aaca><span class="action-button__icon" aria-hidden="true" data-v-3792aaca>`);
                  if (unref(randomCoachAvatar)) {
                    _push(`<img${ssrRenderAttr("src", unref(randomCoachAvatar))} alt="" data-v-3792aaca>`);
                  } else {
                    _push(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" data-v-3792aaca><circle cx="12" cy="8" r="4" data-v-3792aaca></circle><path d="M4.5 21a7.5 7.5 0 0 1 15 0" data-v-3792aaca></path></svg>`);
                  }
                  _push(`</span><span data-v-3792aaca><strong data-v-3792aaca>${ssrInterpolate(unref(copy).withCoach)}</strong></span></button></div>`);
                } else {
                  _push(`<!---->`);
                }
                _push(`</div>`);
              } else {
                _push(`<!---->`);
              }
              _push(`<section class="challenge-training-sessions" aria-labelledby="training-sessions-title" data-v-3792aaca><header data-v-3792aaca><div data-v-3792aaca><p data-v-3792aaca>${ssrInterpolate(unref(copy).newestFirst)}</p><h4 id="training-sessions-title" data-v-3792aaca>${ssrInterpolate(unref(copy).errorsBySession)}</h4></div><span data-v-3792aaca>${ssrInterpolate(occurrenceCountLabel(unref(trainingSessions).length))}</span></header><div class="challenge-training-sessions__list" data-v-3792aaca><!--[-->`);
              ssrRenderList(unref(trainingSessions), (session) => {
                _push(`<article${ssrRenderAttr("id", trainingSessionId(session.id))} tabindex="-1" data-v-3792aaca>`);
                if (session.errors.length && !__props.readOnly) {
                  _push(`<div class="challenge-work challenge-training-session__work" data-v-3792aaca><button type="button"${ssrIncludeBooleanAttr(Boolean(unref(challengeStarting))) ? " disabled" : ""}${ssrRenderAttr("aria-expanded", unref(workMenuFingerprint) === `training-session-work-${session.id}`)} data-v-3792aaca>${ssrInterpolate(trainQuestionsLabel(session.errors.length))}</button>`);
                  if (unref(workMenuFingerprint) === `training-session-work-${session.id}`) {
                    _push(`<div class="challenge-presentation-menu" style="${ssrRenderStyle({ left: `${unref(workMenuLeft)}px` })}" role="group"${ssrRenderAttr("aria-label", unref(copy).choosePresentation)} data-v-3792aaca><button class="action-button action-button--primary" type="button"${ssrIncludeBooleanAttr(Boolean(unref(challengeStarting))) ? " disabled" : ""} data-v-3792aaca><span class="action-button__icon" aria-hidden="true" data-v-3792aaca>●</span><span data-v-3792aaca><strong data-v-3792aaca>${ssrInterpolate(unref(copy).classic)}</strong></span></button><button class="action-button action-button--chat" type="button"${ssrIncludeBooleanAttr(Boolean(unref(challengeStarting))) ? " disabled" : ""} data-v-3792aaca><span class="action-button__icon" aria-hidden="true" data-v-3792aaca>`);
                    if (unref(randomCoachAvatar)) {
                      _push(`<img${ssrRenderAttr("src", unref(randomCoachAvatar))} alt="" data-v-3792aaca>`);
                    } else {
                      _push(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" data-v-3792aaca><circle cx="12" cy="8" r="4" data-v-3792aaca></circle><path d="M4.5 21a7.5 7.5 0 0 1 15 0" data-v-3792aaca></path></svg>`);
                    }
                    _push(`</span><span data-v-3792aaca><strong data-v-3792aaca>${ssrInterpolate(unref(copy).withCoach)}</strong></span></button></div>`);
                  } else {
                    _push(`<!---->`);
                  }
                  _push(`</div>`);
                } else {
                  _push(`<!---->`);
                }
                _push(`<header data-v-3792aaca><div data-v-3792aaca>`);
                if (session.title) {
                  _push(`<h5 data-v-3792aaca>${ssrInterpolate(localizedTrainingReportTitle(session.title))}</h5>`);
                } else {
                  _push(`<!---->`);
                }
                _push(`<time${ssrRenderAttr("datetime", session.occurredAt)} data-v-3792aaca>${ssrInterpolate(trainingDateLabel(session.occurredAt, true))}</time><span data-v-3792aaca>${ssrInterpolate(sessionResultLabel(session.correctCount, session.totalCount))}</span></div><strong style="${ssrRenderStyle({ color: trainingSuccessColor(session.successPercent) })}" data-v-3792aaca>${ssrInterpolate(session.successPercent)}% </strong></header>`);
                if (session.errors.length) {
                  _push(`<ol data-v-3792aaca><!--[-->`);
                  ssrRenderList(session.errors, (error) => {
                    _push(`<li data-v-3792aaca><span data-v-3792aaca>${ssrInterpolate([error.infinitive, error.mode, error.tense, error.person].filter(Boolean).join(" · "))}</span><div data-v-3792aaca><span class="challenge-training-error__answer" data-v-3792aaca>${ssrInterpolate(error.learnerAnswer)}</span><span aria-hidden="true" data-v-3792aaca>→</span><strong data-v-3792aaca>${ssrInterpolate(error.expectedAnswers.join(` ${unref(ui)("ou")} `) || unref(copy).unavailableAnswer)}</strong></div><!--[-->`);
                    ssrRenderList(error.explanations, (explanation) => {
                      _push(`<p class="challenge-training-error__explanation" data-v-3792aaca>${ssrInterpolate(explanation)}</p>`);
                    });
                    _push(`<!--]--></li>`);
                  });
                  _push(`<!--]--></ol>`);
                } else {
                  _push(`<p class="challenge-training-session__perfect" data-v-3792aaca>${ssrInterpolate(unref(copy).noSessionError)}</p>`);
                }
                _push(`</article>`);
              });
              _push(`<!--]--></div></section><!--]-->`);
            } else {
              _push(`<div class="challenge-training-state" data-v-3792aaca>${ssrInterpolate(unref(copy).noUsableOccurrence)}</div>`);
            }
            _push(`</section></div>`);
          } else if (!unref(challengeTrainingsPending)) {
            _push(`<div class="learner-empty" data-v-3792aaca><strong data-v-3792aaca>${ssrInterpolate(unref(copy).noTraining)}</strong><span data-v-3792aaca>${ssrInterpolate(unref(copy).noTrainingHint)}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--]-->`);
        }
        _push(`</section>`);
      } else if (unref(activeTab) === "progress") {
        _push(`<section class="learner-panel" aria-labelledby="progress-title" data-v-3792aaca><div class="learner-panel__heading learner-panel__heading--progress" data-v-3792aaca><div data-v-3792aaca><p class="learner-eyebrow" data-v-3792aaca>${ssrInterpolate(unref(copy).measureProgress)}</p><h2 id="progress-title" data-v-3792aaca>${ssrInterpolate(unref(copy).commonErrors)}</h2></div><div class="progress-explanation" data-v-3792aaca><button type="button" class="progress-explanation__button"${ssrRenderAttr("aria-label", unref(copy).progressCalculation)} aria-controls="progress-explanation-tooltip"${ssrRenderAttr("aria-expanded", unref(progressExplanationOpen))}${ssrRenderAttr("aria-describedby", unref(progressExplanationOpen) ? "progress-explanation-tooltip" : void 0)} data-v-3792aaca><span aria-hidden="true" data-v-3792aaca>i</span></button>`);
        if (unref(progressExplanationOpen)) {
          _push(`<div id="progress-explanation-tooltip" class="progress-explanation__tooltip" role="tooltip" data-v-3792aaca><strong data-v-3792aaca>${ssrInterpolate(unref(copy).compareRates)}</strong><p data-v-3792aaca>${ssrInterpolate(text("progressExplanation", { count: unref(learnerProgress)?.opportunityWindow || 10 }))}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><aside class="learner-section-intro" data-v-3792aaca><strong data-v-3792aaca>${ssrInterpolate(unref(copy).errorsOverTime)}</strong><p data-v-3792aaca>${ssrInterpolate(unref(copy).errorsIntro)}</p></aside>`);
        if (unref(learnerProgressError)) {
          _push(`<p class="preferences-error" role="alert" data-v-3792aaca>${ssrInterpolate(unref(learnerProgressError))}</p>`);
        } else if (unref(learnerProgressPending) && !unref(learnerProgress)) {
          _push(`<p class="learner-empty" data-v-3792aaca>${ssrInterpolate(unref(copy).analysingProgress)}</p>`);
        } else if (unref(learnerProgress)?.cards.length) {
          _push(`<div class="error-progress-list" data-v-3792aaca><!--[-->`);
          ssrRenderList(unref(learnerProgress).cards, (card, cardIndex) => {
            _push(`<article${ssrRenderAttr("id", progressCardId(card))} class="${ssrRenderClass([[
              `is-${card.trend}`,
              "is-errors",
              { "is-stale": card.isStale }
            ], "error-progress-card"])}" tabindex="-1" data-v-3792aaca><header class="error-progress-card__heading" data-v-3792aaca><div data-v-3792aaca><span data-v-3792aaca>${ssrInterpolate(progressCardDomain(card))}</span><h3 data-v-3792aaca>${ssrInterpolate(progressCardLabel(card))}</h3><p data-v-3792aaca>${ssrInterpolate(progressCardAdvice(card))}</p></div><div class="error-progress-card__badges" data-v-3792aaca><div class="error-progress-card__affected" data-v-3792aaca><strong data-v-3792aaca>${ssrInterpolate(card.affectedChallengeCount)}</strong><span data-v-3792aaca>${ssrInterpolate(affectedChallengesLabel(card.affectedChallengeCount))}</span></div><div class="error-progress-card__rate" data-v-3792aaca><strong data-v-3792aaca>${ssrInterpolate(progressCurrentRate(card))}%</strong><span data-v-3792aaca>${ssrInterpolate(unref(copy).errorRate)}</span></div></div></header><div class="error-progress-card__status" data-v-3792aaca><strong data-v-3792aaca>${ssrInterpolate(progressTrendLabel(card))}</strong><span class="${ssrRenderClass({ "is-warning": card.isStale })}" data-v-3792aaca>${ssrInterpolate(progressLastTestLabel(card))}</span></div>`);
            if (card.points.length) {
              _push(`<div class="error-progress-chart" data-v-3792aaca><div class="error-progress-chart__plot" data-v-3792aaca><svg viewBox="0 0 640 190" role="img"${ssrRenderAttr("aria-label", errorEvolutionLabel(progressCardLabel(card)))} data-v-3792aaca><defs data-v-3792aaca><linearGradient${ssrRenderAttr("id", progressGradientId(card))} x1="0" y1="156" x2="0" y2="16" gradientUnits="userSpaceOnUse" data-v-3792aaca><stop offset="0%" stop-color="#3aa66f" data-v-3792aaca></stop><stop offset="10%" stop-color="#d6a33e" data-v-3792aaca></stop><stop offset="20%" stop-color="#ef6760" data-v-3792aaca></stop><stop offset="100%" stop-color="#ef6760" data-v-3792aaca></stop></linearGradient></defs><g class="error-progress-chart__grid" data-v-3792aaca><line x1="42" x2="624" y1="16" y2="16" data-v-3792aaca></line><line x1="42" x2="624" y1="86" y2="86" data-v-3792aaca></line><line x1="42" x2="624" y1="156" y2="156" data-v-3792aaca></line></g><!--[-->`);
              ssrRenderList(progressChartSegments(card), (segment, segmentIndex) => {
                _push(`<polyline${ssrRenderAttr("points", segment.map((coordinate) => `${coordinate.x},${coordinate.y}`).join(" "))} style="${ssrRenderStyle({ stroke: `url(#${progressGradientId(card)})` })}" data-v-3792aaca></polyline>`);
              });
              _push(`<!--]--><!--[-->`);
              ssrRenderList(progressChartCoordinates(card), (coordinate, coordinateIndex) => {
                _push(`<circle${ssrRenderAttr("cx", coordinate.x)}${ssrRenderAttr("cy", coordinate.y)} style="${ssrRenderStyle({ stroke: progressMetricColor(coordinate.rate) })}" r="5" data-v-3792aaca><title data-v-3792aaca>${ssrInterpolate(progressDateLabel(coordinate.point.date))} : ${ssrInterpolate(chartPointLabel(coordinate.rate, coordinate.point.errors, coordinate.point.opportunities))}</title></circle>`);
              });
              _push(`<!--]--></svg><div class="error-progress-chart__rate-axis is-errors" aria-hidden="true" data-v-3792aaca><span class="is-high" data-v-3792aaca>100%</span><span class="is-middle" data-v-3792aaca>50%</span><span class="is-low" data-v-3792aaca>0%</span></div><div class="error-progress-chart__date-axis" aria-hidden="true" data-v-3792aaca><span data-v-3792aaca>${ssrInterpolate(progressDateLabel(card.points[0].date))}</span><span data-v-3792aaca>${ssrInterpolate(progressDateLabel(card.points.at(-1).date))}</span></div></div><div class="error-progress-chart__legend" data-v-3792aaca><span data-v-3792aaca>${ssrInterpolate(unref(copy).fewerErrorsBelow)}</span><span data-v-3792aaca>${ssrInterpolate(totalOpportunitiesLabel(card.totalOpportunities))}</span></div></div>`);
            } else {
              _push(`<div class="error-progress-card__insufficient" data-v-3792aaca>${ssrInterpolate(text("reliableCurve", { count: unref(learnerProgress).minimumEvidence }))}</div>`);
            }
            if (card.examples.length) {
              _push(`<details class="error-progress-examples"${ssrIncludeBooleanAttr(cardIndex === 0) ? " open" : ""} data-v-3792aaca><summary data-v-3792aaca><span class="error-progress-examples__label" data-v-3792aaca><span class="error-progress-examples__chevron" aria-hidden="true" data-v-3792aaca></span> ${ssrInterpolate(progressExamplesLabel(card))}</span></summary><ol data-v-3792aaca><!--[-->`);
              ssrRenderList(card.examples, (example) => {
                _push(`<li data-v-3792aaca><dl data-v-3792aaca><div data-v-3792aaca><dt data-v-3792aaca>${ssrInterpolate(unref(copy).question)}</dt><dd data-v-3792aaca>${ssrInterpolate(example.question)}</dd></div><!--[-->`);
                ssrRenderList([learnerErrorComparison(example)], (comparison) => {
                  _push(`<!--[-->`);
                  if (comparison) {
                    _push(`<div class="error-progress-comparison-row error-progress-comparison-row--learner" data-v-3792aaca><dt data-v-3792aaca>${ssrInterpolate(unref(ui)("Ta réponse"))}</dt><dd class="error-progress-comparison__answer error-progress-comparison__answer--learner" data-v-3792aaca><!--[-->`);
                    ssrRenderList(comparison.learnerParts, (part, partIndex) => {
                      _push(`<span class="${ssrRenderClass(`error-progress-comparison__part--${part.kind}`)}" data-v-3792aaca>${ssrInterpolate(part.text)}</span>`);
                    });
                    _push(`<!--]--></dd></div>`);
                  } else {
                    _push(`<!---->`);
                  }
                  if (comparison) {
                    _push(`<div class="error-progress-comparison-row error-progress-comparison-row--expected" data-v-3792aaca><dt data-v-3792aaca>${ssrInterpolate(unref(copy).correction)}</dt><dd class="error-progress-comparison__answer error-progress-comparison__answer--expected" data-v-3792aaca><!--[-->`);
                    ssrRenderList(comparison.expectedParts, (part, partIndex) => {
                      _push(`<span class="${ssrRenderClass(`error-progress-comparison__part--${part.kind}`)}" data-v-3792aaca>${ssrInterpolate(part.text)}</span>`);
                    });
                    _push(`<!--]--></dd></div>`);
                  } else {
                    _push(`<!--[--><div data-v-3792aaca><dt data-v-3792aaca>${ssrInterpolate(unref(copy).yourError)}</dt><dd class="error-progress-examples__wrong" data-v-3792aaca>${ssrInterpolate(example.learnerAnswer || unref(copy).noAnswer)}</dd></div><div data-v-3792aaca><dt data-v-3792aaca>${ssrInterpolate(unref(copy).correction)}</dt><dd class="error-progress-examples__correct" data-v-3792aaca>${ssrInterpolate(example.expectedAnswers.join(` ${unref(ui)("ou")} `) || unref(copy).unavailableAnswer)}</dd></div><!--]-->`);
                  }
                  _push(`<!--]-->`);
                });
                _push(`<!--]--><div data-v-3792aaca><dt data-v-3792aaca>${ssrInterpolate(unref(copy).reason)}</dt><dd data-v-3792aaca>`);
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
                _push(`<div class="error-progress-examples__more" data-v-3792aaca><button type="button"${ssrIncludeBooleanAttr(unref(progressExamplesPendingCode) === card.code) ? " disabled" : ""} data-v-3792aaca>${ssrInterpolate(unref(progressExamplesPendingCode) === card.code ? unref(copy).loadingMoreErrors : unref(copy).seeMore)}</button></div>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</details>`);
            } else {
              _push(`<!---->`);
            }
            if (!__props.readOnly && errorChallengeIsAvailable(card)) {
              _push(`<button type="button" class="error-progress-card__challenge"${ssrIncludeBooleanAttr(Boolean(unref(errorChallengePendingCode)) || Boolean(unref(challengeStarting))) ? " disabled" : ""} data-v-3792aaca><span aria-hidden="true" data-v-3792aaca>▶</span><strong data-v-3792aaca>${ssrInterpolate(unref(errorChallengePendingCode) === card.code ? unref(copy).preparingErrorChallenge : errorChallengeButtonLabel(card))}</strong><small data-v-3792aaca>${ssrInterpolate(unref(copy).tenQuestionChallenge)}</small></button>`);
            } else {
              _push(`<!---->`);
            }
            if (unref(errorChallengeErrorCode) === card.code) {
              _push(`<p class="preferences-error" role="alert" data-v-3792aaca>${ssrInterpolate(unref(copy).prepareError)}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</article>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="learner-empty" data-v-3792aaca><strong data-v-3792aaca>${ssrInterpolate(unref(copy).insufficientData)}</strong><span data-v-3792aaca>${ssrInterpolate(unref(copy).futureErrorTypes)}</span></div>`);
        }
        _push(`</section>`);
      } else if (unref(activeTab) === "preferences") {
        _push(`<section class="learner-panel" aria-labelledby="preferences-title" data-v-3792aaca><div class="learner-panel__heading" data-v-3792aaca><div data-v-3792aaca><p class="learner-eyebrow" data-v-3792aaca>${ssrInterpolate(unref(copy).adaptInterface)}</p><h2 id="preferences-title" data-v-3792aaca>${ssrInterpolate(unref(copy).preferences)}</h2></div>`);
        if (unref(preferencesSaved)) {
          _push(`<span class="preferences-saved" data-v-3792aaca>${ssrInterpolate(unref(copy).saved)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (unref(preferencesError)) {
          _push(`<p class="preferences-error" role="alert" data-v-3792aaca>${ssrInterpolate(unref(preferencesError))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="preference-block" data-v-3792aaca><div data-v-3792aaca><h3 data-v-3792aaca>${ssrInterpolate(unref(copy).language)}</h3><p data-v-3792aaca>${ssrInterpolate(unref(copy).languageHint)}</p></div><div class="locale-choices" role="group"${ssrRenderAttr("aria-label", unref(copy).preferredLanguage)} data-v-3792aaca><!--[-->`);
        ssrRenderList(unref(localeOptions), (option) => {
          _push(`<button type="button" class="${ssrRenderClass({ "is-active": unref(preferredLocale) === option.value })}"${ssrIncludeBooleanAttr(__props.readOnly || unref(preferencesSaving)) ? " disabled" : ""} data-v-3792aaca><span aria-hidden="true" data-v-3792aaca>${ssrInterpolate(option.flag)}</span>${ssrInterpolate(option.label)}</button>`);
        });
        _push(`<!--]--></div></div><div class="preference-block" data-v-3792aaca><div data-v-3792aaca><h3 data-v-3792aaca>${ssrInterpolate(unref(copy).appearance)}</h3><p data-v-3792aaca>${ssrInterpolate(unref(copy).appearanceHint)}</p></div><div class="theme-choices" role="group"${ssrRenderAttr("aria-label", unref(copy).preferredAppearance)} data-v-3792aaca><button type="button" class="${ssrRenderClass({ "is-active": unref(preferredTheme) === "light" })}"${ssrIncludeBooleanAttr(__props.readOnly || unref(preferencesSaving)) ? " disabled" : ""} data-v-3792aaca><span aria-hidden="true" data-v-3792aaca>☀️</span> ${ssrInterpolate(unref(copy).light)}</button><button type="button" class="${ssrRenderClass({ "is-active": unref(preferredTheme) === "dark" })}"${ssrIncludeBooleanAttr(__props.readOnly || unref(preferencesSaving)) ? " disabled" : ""} data-v-3792aaca><span aria-hidden="true" data-v-3792aaca>🌙</span> ${ssrInterpolate(unref(copy).dark)}</button></div></div></section>`);
      } else {
        _push(`<section class="learner-panel account-panel" aria-labelledby="account-title" data-v-3792aaca><div class="learner-panel__heading" data-v-3792aaca><div data-v-3792aaca><p class="learner-eyebrow" data-v-3792aaca>${ssrInterpolate(unref(copy).dataSimply)}</p><h2 id="account-title" data-v-3792aaca>${ssrInterpolate(unref(copy).account)}</h2></div></div><div class="account-privacy" data-v-3792aaca><span aria-hidden="true" data-v-3792aaca>◌</span><div data-v-3792aaca><h3 data-v-3792aaca>${ssrInterpolate(unref(copy).privateAccount)}</h3><p data-v-3792aaca>${ssrInterpolate(text("privacy", { username: unref(displayUsername) }))}</p></div></div>`);
        if (unref(resultsDeleted)) {
          _push(`<p class="account-success" role="status" data-v-3792aaca>${ssrInterpolate(unref(copy).resultsDeleted)}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (!__props.readOnly) {
          _push(`<form id="change-password" class="account-password" data-v-3792aaca><div data-v-3792aaca><h3 data-v-3792aaca>${ssrInterpolate(unref(copy).changePassword)}</h3><p id="password-help" data-v-3792aaca>${ssrInterpolate(unref(copy).passwordHint)}</p></div><div class="account-password__fields" data-v-3792aaca><label class="is-current" data-v-3792aaca><span data-v-3792aaca>${ssrInterpolate(unref(copy).currentPassword)}</span>`);
          _push(ssrRenderComponent(_component_PasswordInput, {
            modelValue: unref(passwordForm).currentPassword,
            "onUpdate:modelValue": ($event) => unref(passwordForm).currentPassword = $event,
            name: "current-password",
            autocomplete: "current-password",
            maxlength: 200,
            required: ""
          }, null, _parent));
          _push(`</label><label data-v-3792aaca><span data-v-3792aaca>${ssrInterpolate(unref(copy).newPassword)}</span>`);
          _push(ssrRenderComponent(_component_PasswordInput, {
            modelValue: unref(passwordForm).newPassword,
            "onUpdate:modelValue": ($event) => unref(passwordForm).newPassword = $event,
            name: "new-password",
            autocomplete: "new-password",
            minlength: 10,
            maxlength: 200,
            describedby: "password-help",
            required: ""
          }, null, _parent));
          _push(`</label><label data-v-3792aaca><span data-v-3792aaca>${ssrInterpolate(unref(copy).confirmPassword)}</span>`);
          _push(ssrRenderComponent(_component_PasswordInput, {
            modelValue: unref(passwordForm).confirmation,
            "onUpdate:modelValue": ($event) => unref(passwordForm).confirmation = $event,
            name: "new-password-confirmation",
            autocomplete: "new-password",
            minlength: 10,
            maxlength: 200,
            required: ""
          }, null, _parent));
          _push(`</label></div>`);
          if (unref(passwordError)) {
            _push(`<p class="preferences-error" role="alert" data-v-3792aaca>${ssrInterpolate(unref(passwordError))}</p>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(passwordChanged)) {
            _push(`<p class="account-success" role="status" data-v-3792aaca>${ssrInterpolate(unref(copy).passwordChanged)}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<button type="submit" class="account-button account-button--primary"${ssrIncludeBooleanAttr(unref(passwordChanging)) ? " disabled" : ""} data-v-3792aaca>${ssrInterpolate(unref(passwordChanging) ? unref(copy).changing : unref(copy).changePasswordButton)}</button></form>`);
        } else {
          _push(`<!---->`);
        }
        if (!__props.readOnly) {
          _push(`<div class="account-actions" data-v-3792aaca><article data-v-3792aaca><div data-v-3792aaca><h3 data-v-3792aaca>${ssrInterpolate(unref(copy).deleteResults)}</h3><p data-v-3792aaca>${ssrInterpolate(unref(copy).deleteResultsHint)}</p></div><button type="button" class="account-button account-button--warning" data-v-3792aaca>${ssrInterpolate(unref(copy).deleteResults)}</button></article><article data-v-3792aaca><div data-v-3792aaca><h3 data-v-3792aaca>${ssrInterpolate(unref(copy).deleteAccount)}</h3><p data-v-3792aaca>${ssrInterpolate(text("deleteAccountHint", { username: unref(displayUsername) }))}</p></div><button type="button" class="account-button account-button--danger" data-v-3792aaca>${ssrInterpolate(unref(copy).deleteAccount)}</button></article></div>`);
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
          _push2(`<div class="account-dialog-backdrop" role="presentation" data-v-3792aaca><section class="account-dialog" role="alertdialog" aria-modal="true" aria-labelledby="account-dialog-title" aria-describedby="account-dialog-description" data-v-3792aaca><button class="account-dialog__close" type="button"${ssrRenderAttr("aria-label", unref(copy).close)} autofocus${ssrIncludeBooleanAttr(unref(accountActionPending)) ? " disabled" : ""} data-v-3792aaca> × </button><span class="account-dialog__icon" aria-hidden="true" data-v-3792aaca>!</span><h2 id="account-dialog-title" data-v-3792aaca>${ssrInterpolate(unref(accountDialog) === "results" ? unref(copy).deleteAllResultsQuestion : unref(copy).deleteAccountQuestion)}</h2><p id="account-dialog-description" data-v-3792aaca>${ssrInterpolate(unref(accountDialog) === "results" ? text("deleteResultsDialog", { username: unref(displayUsername) }) : text("deleteAccountDialog", { username: unref(displayUsername) }))}</p>`);
          if (unref(accountActionError)) {
            _push2(`<p class="preferences-error" role="alert" data-v-3792aaca>${ssrInterpolate(unref(accountActionError))}</p>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="account-dialog__actions" data-v-3792aaca><button type="button"${ssrIncludeBooleanAttr(unref(accountActionPending)) ? " disabled" : ""} data-v-3792aaca>${ssrInterpolate(unref(copy).cancel)}</button><button type="button" class="is-danger"${ssrIncludeBooleanAttr(unref(accountActionPending)) ? " disabled" : ""} data-v-3792aaca>${ssrInterpolate(unref(accountActionPending) ? unref(copy).deleting : unref(accountDialog) === "results" ? unref(copy).confirmDeleteResults : unref(copy).confirmDeleteAccount)}</button></div></section></div>`);
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
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-3792aaca"]]), { __name: "LearnerSpace" });

export { __nuxt_component_0 as _ };
//# sourceMappingURL=LearnerSpace-Dv1Xez7M.mjs.map
