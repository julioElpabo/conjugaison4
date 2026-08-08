import { defineComponent, computed, ref, useTemplateRef, withAsyncContext, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderClass, ssrRenderList, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { i as isFiniteConjugationMode, c as conjugationModeOrder, a as conjugationTenseOrder, d as conjugationTenseRow, b as conjugationTenseLabel } from '../_/conjugation-display.mjs';
import { n as normalizeVerbSearch, m as matchingVerbs } from '../_/verb-search.mjs';
import { f as useLanguagePreferences, g as useRoute, a as useRouter, u as useHead } from './server.mjs';
import { u as useSiteAnalytics } from './useSiteAnalytics-D1wpWTOZ.mjs';
import { u as useFetch } from './fetch-CA_A3qtF.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import '../nitro/nitro.mjs';
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
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';
import './state-DjsguMyT.mjs';
import '@vue/shared';
import './asyncData-BBDHP0iC.mjs';
import 'perfect-debounce';

const TRAPS = {
  cedilla: {
    id: "cedilla",
    tone: "orthography",
    title: "C\xE9dille \xE0 ne pas oublier",
    explanation: "Le \xE7 conserve le son [s] devant a, o ou u, ou appartient au radical de certaines formes."
  },
  softG: {
    id: "softG",
    tone: "orthography",
    title: "E protecteur apr\xE8s le g",
    explanation: "Le e plac\xE9 apr\xE8s g conserve le son [\u0292] devant a ou o : mangeais, mangeons."
  },
  yToI: {
    id: "yToI",
    tone: "orthography",
    title: "Y remplac\xE9 par i",
    explanation: "Dans certaines formes des verbes en -yer, le y du radical devient i."
  },
  graveAccent: {
    id: "graveAccent",
    tone: "orthography",
    title: "Accent grave dans le radical",
    explanation: "Un e ou un \xE9 du radical devient \xE8 dans certaines formes."
  },
  doubleConsonant: {
    id: "doubleConsonant",
    tone: "orthography",
    title: "Consonne doubl\xE9e",
    explanation: "Certains verbes en -eler ou -eter doublent le l ou le t dans une partie de leur conjugaison."
  },
  doubleI: {
    id: "doubleI",
    tone: "orthography",
    title: "Deux i cons\xE9cutifs",
    explanation: "Le premier i appartient au radical et le second \xE0 la terminaison : les deux doivent \xEAtre \xE9crits."
  },
  circumflex: {
    id: "circumflex",
    tone: "orthography",
    title: "Accent circonflexe aux temps litt\xE9raires",
    explanation: "Le pass\xE9 simple et le subjonctif imparfait comportent parfois un accent circonflexe facile \xE0 oublier."
  },
  futureStem: {
    id: "futureStem",
    tone: "stem",
    title: "Radical du futur \xE0 m\xE9moriser",
    explanation: "Le futur simple et le conditionnel utilisent ici un radical diff\xE9rent de l\u2019infinitif attendu."
  },
  futureConditional: {
    id: "futureConditional",
    tone: "ending",
    title: "Futur ou conditionnel ?",
    explanation: "Avec je, le futur se termine par -ai et le conditionnel par -ais."
  },
  silentEnt: {
    id: "silentEnt",
    tone: "ending",
    title: "Terminaison -ent muette",
    explanation: "\xC0 la troisi\xE8me personne du pluriel, -ent s\u2019\xE9crit mais ne se prononce g\xE9n\xE9ralement pas."
  },
  imperativeWithoutS: {
    id: "imperativeWithoutS",
    tone: "ending",
    title: "Pas de s \xE0 l\u2019imp\xE9ratif",
    explanation: "\xC0 l\u2019imp\xE9ratif pr\xE9sent, les verbes en -er perdent normalement le s de la forme tu."
  },
  variants: {
    id: "variants",
    tone: "special",
    title: "Plusieurs formes admises",
    explanation: "La base contient plusieurs variantes correctes pour cette personne et ce temps."
  },
  defective: {
    id: "defective",
    tone: "special",
    title: "Conjugaison incompl\xE8te",
    explanation: "Ce verbe est impersonnel ou d\xE9fectif : certaines personnes ou certains temps ne s\u2019emploient pas."
  }
};
function normalized(value) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("fr");
}
function bareInfinitive(value) {
  return value.replace(/^(?:s['’]|se\s+)/iu, "");
}
function lexicalWord(form) {
  var _a;
  const match = form.match(/([^\s’']+)$/u);
  const word = (_a = match == null ? void 0 : match[1]) != null ? _a : form;
  return { word, offset: form.lastIndexOf(word) };
}
function cleanComplement(value) {
  var _a;
  return (_a = value == null ? void 0 : value.replace(/\s+/gu, " ").replace(/[.!?]+$/gu, "").trim()) != null ? _a : "";
}
function sentenceCase(value) {
  return value.charAt(0).toLocaleUpperCase("fr") + value.slice(1);
}
function conjugatedPhrase(row, form) {
  const pronoun = row.pronoun.trim();
  if (pronoun.toLocaleLowerCase("fr") === "je" && /^[aeiouyh]/iu.test(form)) return `j\u2019${form}`;
  return `${pronoun} ${form}`.trim();
}
function simpleTenseInfo(tenseId, tenses, modes) {
  const tense = tenses.get(tenseId);
  const mode = tense ? modes.get(tense.modeId) : void 0;
  return {
    tense,
    mode,
    tenseName: tense ? normalized(tense.name) : "",
    modeName: mode ? normalized(mode.name) : "",
    simple: Boolean(tense && !tense.isCompound)
  };
}
function futureEnding(personId, conditional) {
  var _a;
  const endings = conditional ? /* @__PURE__ */ new Map([[4, "ais"], [5, "ais"], [6, "ait"], [7, "ions"], [8, "iez"], [9, "aient"]]) : /* @__PURE__ */ new Map([[4, "ai"], [5, "as"], [6, "a"], [7, "ons"], [8, "ez"], [9, "ont"]]);
  return (_a = endings.get(personId)) != null ? _a : "";
}
function conjugationTrapFormKey(tenseId, personId, form) {
  return `${tenseId}:${personId}:${form}`;
}
function analyzeConjugationTraps(verb, conjugations, tensesList, modesList, exampleComplement) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  const tenses = new Map(tensesList.map((tense) => [Number(tense.id), tense]));
  const modes = new Map(modesList.map((mode) => [Number(mode.id), mode]));
  const markers = [];
  const examples = /* @__PURE__ */ new Map();
  const infinitive = bareInfinitive(verb.infinitif);
  const infinitiveStem = /er$/iu.test(infinitive) ? infinitive.slice(0, -2) : infinitive;
  const complement = cleanComplement(exampleComplement);
  function exampleSentence(row, form) {
    const info = simpleTenseInfo(row.tenseId, tenses, modes);
    const object = complement ? ` ${complement}` : "";
    if (info.modeName === "imperatif") return `${sentenceCase(form)}${object} !`;
    const phrase = conjugatedPhrase(row, form);
    if (info.modeName === "subjonctif") return `Il faut que ${phrase}${object}.`;
    if (info.modeName === "indicatif" && info.tenseName === "futur") {
      return `Demain, ${phrase}${object}.`;
    }
    if (info.modeName === "conditionnel" && info.tenseName === "present") {
      return `Si c\u2019\xE9tait possible, ${phrase}${object}.`;
    }
    return `${sentenceCase(phrase)}${object}.`;
  }
  function addExample(trapId, sentence) {
    var _a2;
    const current = (_a2 = examples.get(trapId)) != null ? _a2 : [];
    if (current.includes(sentence)) return;
    if (trapId !== "futureConditional" && current.length) return;
    examples.set(trapId, [...current, sentence]);
  }
  function addMarker(row, form, trapId, start, length, priority) {
    if (start < 0 || length < 1 || start + length > form.length) return;
    if (markers.some((marker) => marker.tenseId === row.tenseId && marker.personId === row.personId && marker.form === form && marker.trapId === trapId && marker.start === start && marker.length === length)) return;
    markers.push({ tenseId: row.tenseId, personId: row.personId, form, trapId, start, length, priority });
    addExample(trapId, exampleSentence(row, form));
  }
  function addTrapWithoutMarker(trapId, example) {
    addExample(trapId, example);
  }
  for (const row of conjugations) {
    const info = simpleTenseInfo(row.tenseId, tenses, modes);
    for (const form of row.forms) {
      const lexical = lexicalWord(form);
      if (info.simple) {
        for (const match of lexical.word.matchAll(/ç/giu)) {
          addMarker(row, form, "cedilla", lexical.offset + ((_a = match.index) != null ? _a : 0), 1, 40);
        }
        for (const match of lexical.word.matchAll(/ge(?=[aoâ])/giu)) {
          addMarker(row, form, "softG", lexical.offset + ((_b = match.index) != null ? _b : 0) + 1, 1, 40);
        }
        if (/yer$/iu.test(infinitive)) {
          const prefix = infinitive.slice(0, -3);
          if (normalized(lexical.word.slice(0, prefix.length)) === normalized(prefix) && ((_c = lexical.word[prefix.length]) == null ? void 0 : _c.toLocaleLowerCase("fr")) === "i") {
            addMarker(row, form, "yToI", lexical.offset + prefix.length, 1, 40);
          }
        }
        for (const match of lexical.word.matchAll(/è/giu)) {
          const index = (_d = match.index) != null ? _d : 0;
          if (index < infinitiveStem.length && normalized((_e = lexical.word[index]) != null ? _e : "") === normalized((_f = infinitiveStem[index]) != null ? _f : "")) {
            addMarker(row, form, "graveAccent", lexical.offset + index, 1, 40);
          }
        }
        if (/(?:eler|eter)$/iu.test(infinitive)) {
          for (const match of lexical.word.matchAll(/ll|tt/giu)) {
            addMarker(row, form, "doubleConsonant", lexical.offset + ((_g = match.index) != null ? _g : 0), 2, 40);
          }
        }
        for (const match of lexical.word.matchAll(/ii(?=ons|ez)/giu)) {
          addMarker(row, form, "doubleI", lexical.offset + ((_h = match.index) != null ? _h : 0), 2, 40);
        }
        if (info.tenseName === "passe simple" || info.modeName === "subjonctif" && info.tenseName === "imparfait") {
          for (const match of lexical.word.matchAll(/[âîû]/giu)) {
            addMarker(row, form, "circumflex", lexical.offset + ((_i = match.index) != null ? _i : 0), 1, 40);
          }
        }
        const conditional = info.modeName === "conditionnel" && info.tenseName === "present";
        const future = info.modeName === "indicatif" && info.tenseName === "futur";
        if (future || conditional) {
          const ending = futureEnding(row.personId, conditional);
          if (ending && normalized(lexical.word).endsWith(ending)) {
            const stem = lexical.word.slice(0, -ending.length);
            const expectedStem = /re$/iu.test(infinitive) ? infinitive.slice(0, -1) : infinitive;
            if (normalized(stem) !== normalized(expectedStem)) {
              addMarker(row, form, "futureStem", lexical.offset, stem.length, 25);
            }
            if (row.personId === 4) {
              addMarker(row, form, "futureConditional", lexical.offset + lexical.word.length - ending.length, ending.length, 35);
            }
          }
        }
        if (row.personId === 9 && /ent$/iu.test(lexical.word)) {
          addMarker(row, form, "silentEnt", lexical.offset + lexical.word.length - 3, 3, 30);
        }
        if (info.modeName === "imperatif" && info.tenseName === "present" && row.personId === 5 && verb.groupeConjugaison === 1 && !/[sx]$/iu.test(lexical.word)) {
          addMarker(row, form, "imperativeWithoutS", lexical.offset + lexical.word.length - 1, 1, 30);
        }
      }
      if (row.forms.length > 1) addMarker(row, form, "variants", 0, form.length, 5);
    }
  }
  if (verb.estImpersonnel || verb.estDefectif) {
    const firstRow = conjugations[0];
    const firstForm = firstRow == null ? void 0 : firstRow.forms[0];
    addTrapWithoutMarker("defective", firstRow && firstForm ? exampleSentence(firstRow, firstForm) : `${sentenceCase(verb.infinitif)}.`);
  }
  return {
    markers,
    traps: Object.values(TRAPS).filter((trap) => examples.has(trap.id)).map((trap) => ({ ...trap, examples: examples.get(trap.id) }))
  };
}

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "consulter",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { ui, uiLabel } = useLanguagePreferences();
    const route = useRoute();
    useRouter();
    const embeddedInChallenge = computed(() => route.query.embed === "challenge");
    useSiteAnalytics();
    const query = ref("");
    const suggestionsOpen = ref(false);
    const activeSuggestion = ref(0);
    const activeTab = ref("search");
    const showingDetail = ref(false);
    ref("forward");
    useTemplateRef("consultation-container");
    useTemplateRef("alphabet-list");
    const selectedId = ref(null);
    const detail = ref(null);
    const detailLoading = ref(false);
    const detailError = ref("");
    const agreementOpen = ref(false);
    const trapsOpen = ref(false);
    let detailRequest = 0;
    useHead(() => ({
      title: ui("Consulter un verbe"),
      meta: [{ name: "description", content: ui("Recherchez un verbe et consultez sa conjugaison à tous les modes et à tous les temps.") }]
    }));
    const { data: catalogue, status, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/catalogue",
      {
        key: "public-conjugation-catalogue"
      },
      "$7TmcIgRWNT"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const verbs = computed(() => [...catalogue.value?.verbes ?? []].sort((left, right) => left.infinitif.localeCompare(right.infinitif, "fr") || left.id - right.id));
    const suggestions = computed(() => normalizeVerbSearch(query.value) ? matchingVerbs(verbs.value, query.value).slice(0, 10) : []);
    const alphabetGroups = computed(() => {
      const groups2 = /* @__PURE__ */ new Map();
      for (const verb of verbs.value) {
        const letter = verb.infinitif.normalize("NFD").replace(new RegExp("\\p{Diacritic}", "gu"), "").charAt(0).toLocaleUpperCase("fr") || "#";
        const values = groups2.get(letter) ?? [];
        values.push(verb);
        groups2.set(letter, values);
      }
      return [...groups2].map(([letter, values]) => ({ letter, verbs: values }));
    });
    const groups = computed(() => [...catalogue.value?.modes ?? []].filter((mode) => isFiniteConjugationMode(mode.name)).sort((left, right) => conjugationModeOrder(left.name) - conjugationModeOrder(right.name) || left.id - right.id).map((mode) => {
      const tenses = [...catalogue.value?.temps ?? []].filter((tense) => tense.modeId === mode.id).sort((left, right) => conjugationTenseOrder(mode.name, left.name) - conjugationTenseOrder(mode.name, right.name) || left.id - right.id).map((tense) => ({
        ...tense,
        rows: (detail.value?.conjugations ?? []).filter((row) => row.tenseId === tense.id)
      })).filter((tense) => tense.rows.length);
      const rows = /* @__PURE__ */ new Map();
      for (const tense of tenses) {
        const row = conjugationTenseRow(mode.name, tense.name);
        rows.set(row, [...rows.get(row) ?? [], tense]);
      }
      return { mode, tenseRows: [...rows.values()] };
    }).filter((group) => group.tenseRows.length));
    const nonFiniteForms = computed(() => {
      const verb = detail.value?.verb;
      if (!verb) return [];
      const isPronominal = /^(?:s['’]|se\s)/iu.test(verb.infinitif);
      const auxiliaryInfinitive = isPronominal ? "s’être" : verb.auxiliaire ?? "";
      const auxiliaryParticiple = isPronominal ? "s’étant" : verb.auxiliaire?.toLocaleLowerCase("fr") === "être" ? "étant" : "ayant";
      return [
        { mode: "Infinitif", tense: "présent", form: verb.infinitif },
        { mode: "Infinitif", tense: "passé", form: [auxiliaryInfinitive, verb.participePasse].filter(Boolean).join(" ") },
        { mode: "Participe", tense: "présent", form: verb.participePresent ?? "" },
        { mode: "Participe", tense: "passé", form: verb.participePasse ?? "" },
        { mode: "Gérondif", tense: "présent", form: verb.participePresent ? `en ${verb.participePresent}` : "" },
        { mode: "Gérondif", tense: "passé", form: verb.participePasse ? `en ${auxiliaryParticiple} ${verb.participePasse}` : "" }
      ].filter((item) => item.form.trim());
    });
    const trapAnalysis = computed(() => detail.value ? analyzeConjugationTraps(
      detail.value.verb,
      detail.value.conjugations,
      catalogue.value?.temps ?? [],
      catalogue.value?.modes ?? [],
      detail.value.trapExampleComplement
    ) : { traps: [], markers: [] });
    const trapById = computed(() => new Map(trapAnalysis.value.traps.map((trap) => [trap.id, trap])));
    const trapMarkersByForm = computed(() => {
      const markers = /* @__PURE__ */ new Map();
      for (const marker of trapAnalysis.value.markers) {
        const key = conjugationTrapFormKey(marker.tenseId, marker.personId, marker.form);
        markers.set(key, [...markers.get(key) ?? [], marker]);
      }
      return markers;
    });
    function startsWithElidableSound(value, infinitive) {
      const normalized = value.trim().normalize("NFD").replace(new RegExp("\\p{Diacritic}", "gu"), "").toLocaleLowerCase("fr");
      if ("aeiouy".includes(normalized.charAt(0))) return true;
      return normalized.startsWith("h") && infinitive.toLocaleLowerCase("fr") !== "haïr";
    }
    function displayedForm(row, form, mode) {
      if (mode.toLocaleLowerCase("fr") === "impératif") return `${form} !`;
      const pronoun = row.pronoun;
      const phrase = pronoun === "je" && startsWithElidableSound(form, detail.value?.verb.infinitif ?? "") ? `j’${form}` : `${pronoun} ${form}`;
      if (mode.toLocaleLowerCase("fr") !== "subjonctif") return phrase;
      return /^[aeiouy]/iu.test(pronoun) ? `qu’${phrase}` : `que ${phrase}`;
    }
    function displayedFormSegments(row, form, mode) {
      const phrase = displayedForm(row, form, mode);
      const formOffset = phrase.lastIndexOf(form);
      const markers = trapMarkersByForm.value.get(conjugationTrapFormKey(row.tenseId, row.personId, form)) ?? [];
      if (formOffset < 0 || !markers.length) return [{ text: phrase, trap: null }];
      const ranges = markers.map((marker) => ({
        start: formOffset + marker.start,
        end: formOffset + marker.start + marker.length,
        priority: marker.priority,
        trap: trapById.value.get(marker.trapId) ?? null
      })).filter((range) => range.trap && range.start < range.end);
      const boundaries = [.../* @__PURE__ */ new Set([0, phrase.length, ...ranges.flatMap((range) => [range.start, range.end])])].sort((left, right) => left - right);
      return boundaries.slice(0, -1).flatMap((start, index) => {
        const end = boundaries[index + 1];
        const active = ranges.filter((range) => range.start <= start && range.end >= end).sort((left, right) => right.priority - left.priority)[0];
        const text = phrase.slice(start, end);
        return text ? [{ text, trap: active?.trap ?? null }] : [];
      });
    }
    function trapToneClass(trap) {
      return `trap-tone--${trap.tone}`;
    }
    function groupLabel(group) {
      if (!group) return ui("groupe irrégulier");
      if (group === 1) return ui("1er groupe");
      if (group === 2) return ui("2e groupe");
      return ui("3e groupe");
    }
    function agreementGenderLabel(gender) {
      return gender === "feminin" ? ui("féminin") : ui("masculin");
    }
    async function loadVerb(id) {
      const request = ++detailRequest;
      selectedId.value = id;
      agreementOpen.value = false;
      trapsOpen.value = false;
      detailLoading.value = true;
      detailError.value = "";
      try {
        const response = await $fetch(`/api/conjugaisons/${id}`);
        if (request === detailRequest) detail.value = response;
      } catch {
        if (request === detailRequest) {
          detail.value = null;
          detailError.value = ui("Impossible de charger la conjugaison de ce verbe.");
        }
      } finally {
        if (request === detailRequest) detailLoading.value = false;
      }
    }
    const initialId = Number(route.query.verbe);
    if (Number.isSafeInteger(initialId) && initialId !== 0) {
      const initialVerb = verbs.value.find((verb) => verb.id === initialId);
      if (initialVerb) query.value = initialVerb.infinitif;
      [__temp, __restore] = withAsyncContext(() => loadVerb(initialId)), await __temp, __restore();
      showingDetail.value = true;
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["reference-page", { "reference-page--embedded": unref(embeddedInChallenge) }]
      }, _attrs))} data-v-d51de97c>`);
      if (!unref(embeddedInChallenge)) {
        _push(`<header class="reference-hero" data-v-d51de97c><p class="reference-eyebrow" data-v-d51de97c>${ssrInterpolate(unref(ui)("Le conjugueur"))}</p><h1 data-v-d51de97c>${ssrInterpolate(unref(ui)("Consulter un verbe"))}</h1></header>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(status) === "pending") {
        _push(`<div class="reference-state" role="status" data-v-d51de97c>${ssrInterpolate(unref(ui)("Chargement du catalogue…"))}</div>`);
      } else if (unref(error)) {
        _push(`<div class="reference-state reference-state--error" role="alert" data-v-d51de97c><p data-v-d51de97c>${ssrInterpolate(unref(ui)("Le catalogue n’a pas pu être chargé."))}</p><button type="button" data-v-d51de97c>${ssrInterpolate(unref(ui)("Réessayer"))}</button></div>`);
      } else {
        _push(`<section class="consultation-container" aria-live="polite" data-v-d51de97c>`);
        if (!unref(showingDetail)) {
          _push(`<div class="consultation-panel selection-panel" data-v-d51de97c><div class="consultation-tabs" role="tablist"${ssrRenderAttr("aria-label", unref(ui)("Méthode de recherche du verbe"))} data-v-d51de97c><button id="search-tab" type="button" role="tab"${ssrRenderAttr("aria-selected", unref(activeTab) === "search")} aria-controls="search-panel" class="${ssrRenderClass({ "is-active": unref(activeTab) === "search" })}" data-v-d51de97c>${ssrInterpolate(unref(ui)("Rechercher un verbe"))}</button><button id="list-tab" type="button" role="tab"${ssrRenderAttr("aria-selected", unref(activeTab) === "list")} aria-controls="list-panel" class="${ssrRenderClass({ "is-active": unref(activeTab) === "list" })}" data-v-d51de97c>${ssrInterpolate(unref(ui)("Liste de A à Z"))}</button></div>`);
          if (unref(activeTab) === "search") {
            _push(`<div id="search-panel" class="tab-panel search-tab-panel" role="tabpanel" aria-labelledby="search-tab" data-v-d51de97c><div data-v-d51de97c><p class="reference-eyebrow" data-v-d51de97c>${ssrInterpolate(unref(ui)("Recherche rapide"))}</p><h2 data-v-d51de97c>${ssrInterpolate(unref(ui)("Quel verbe cherches-tu ?"))}</h2><p data-v-d51de97c>${ssrInterpolate(unref(ui)("Commence à écrire son infinitif, puis choisis-le dans les propositions."))}</p></div><div class="verb-combobox" data-v-d51de97c><input id="public-verb-search"${ssrRenderAttr("value", unref(query))} type="search" role="combobox" autocomplete="off" spellcheck="false"${ssrRenderAttr("placeholder", unref(ui)("Par exemple : venir"))}${ssrRenderAttr("aria-label", unref(ui)("Rechercher un verbe"))} aria-autocomplete="list" aria-controls="public-verb-suggestions"${ssrRenderAttr("aria-expanded", unref(suggestionsOpen))}${ssrRenderAttr("aria-activedescendant", unref(suggestionsOpen) ? `public-verb-option-${unref(suggestions)[unref(activeSuggestion)]?.id}` : void 0)} data-v-d51de97c>`);
            if (unref(suggestionsOpen)) {
              _push(`<ul id="public-verb-suggestions" role="listbox" data-v-d51de97c><!--[-->`);
              ssrRenderList(unref(suggestions), (verb, index) => {
                _push(`<li${ssrRenderAttr("id", `public-verb-option-${verb.id}`)} role="option"${ssrRenderAttr("aria-selected", index === unref(activeSuggestion))} data-v-d51de97c><button type="button" class="${ssrRenderClass({ "is-active": index === unref(activeSuggestion) })}" data-v-d51de97c><strong data-v-d51de97c>${ssrInterpolate(verb.infinitif)}</strong><small data-v-d51de97c>${ssrInterpolate(groupLabel(verb.groupeConjugaison))}</small></button></li>`);
              });
              _push(`<!--]--></ul>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div>`);
          } else {
            _push(`<div id="list-panel" class="tab-panel list-tab-panel" role="tabpanel" aria-labelledby="list-tab" data-v-d51de97c><div class="alphabet-heading" data-v-d51de97c><div data-v-d51de97c><p class="reference-eyebrow" data-v-d51de97c>${ssrInterpolate(unref(ui)("Catalogue complet"))}</p><h2 data-v-d51de97c>${ssrInterpolate(unref(ui)("Tous les verbes de A à Z"))}</h2></div><span data-v-d51de97c>${ssrInterpolate(unref(verbs).length)} ${ssrInterpolate(unref(verbs).length === 1 ? unref(ui)("verbe") : unref(ui)("verbes"))}</span></div><nav class="letter-nav"${ssrRenderAttr("aria-label", unref(ui)("Accès aux lettres"))} data-v-d51de97c><!--[-->`);
            ssrRenderList(unref(alphabetGroups), (group) => {
              _push(`<button type="button" data-v-d51de97c>${ssrInterpolate(group.letter)}</button>`);
            });
            _push(`<!--]--></nav><div class="alphabet-list" data-v-d51de97c><div class="alphabet-groups" data-v-d51de97c><!--[-->`);
            ssrRenderList(unref(alphabetGroups), (group) => {
              _push(`<section${ssrRenderAttr("id", `letter-${group.letter}`)} class="letter-group" data-v-d51de97c><h3 data-v-d51de97c>${ssrInterpolate(group.letter)}</h3><div data-v-d51de97c><!--[-->`);
              ssrRenderList(group.verbs, (verb) => {
                _push(`<button type="button" class="${ssrRenderClass({ "is-selected": unref(selectedId) === verb.id })}" data-v-d51de97c>${ssrInterpolate(verb.infinitif)}</button>`);
              });
              _push(`<!--]--></div></section>`);
            });
            _push(`<!--]--></div></div></div>`);
          }
          _push(`</div>`);
        } else {
          _push(`<div class="consultation-panel detail-panel" data-v-d51de97c><div class="detail-toolbar" data-v-d51de97c><button class="back-button" type="button" data-v-d51de97c><span aria-hidden="true" data-v-d51de97c>←</span> ${ssrInterpolate(unref(embeddedInChallenge) ? unref(ui)("Retour au défi") : unref(ui)("Retour au choix du verbe"))}</button>`);
          if (unref(detail)) {
            _push(`<button class="print-consultation-button" type="button" data-v-d51de97c><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" data-v-d51de97c><path d="M7 2.75h6.8L19 7.95v13.3H7z" data-v-d51de97c></path><path d="M13.5 2.75v5.5H19" data-v-d51de97c></path><path d="M9.3 16.9v-4.4h1.45a1.35 1.35 0 0 1 0 2.7H9.3m4.05 1.7v-4.4h1.05c1.35 0 2.15.8 2.15 2.2s-.8 2.2-2.15 2.2zm4.7 0v-4.4h2.65m-2.65 1.85h2.2" data-v-d51de97c></path></svg> ${ssrInterpolate(unref(ui)("Exporter en PDF"))}</button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
          if (unref(detailLoading)) {
            _push(`<div class="reference-state" role="status" data-v-d51de97c>${ssrInterpolate(unref(ui)("Chargement de la conjugaison…"))}</div>`);
          } else if (unref(detailError)) {
            _push(`<div class="reference-state reference-state--error" role="alert" data-v-d51de97c><p data-v-d51de97c>${ssrInterpolate(unref(detailError))}</p><button type="button" data-v-d51de97c>${ssrInterpolate(unref(embeddedInChallenge) ? unref(ui)("Retour au défi") : unref(ui)("Retour à la liste"))}</button></div>`);
          } else if (unref(detail)) {
            _push(`<!--[--><header class="conjugation-heading" data-v-d51de97c><h2 data-v-d51de97c>${ssrInterpolate(unref(detail).verb.infinitif)}</h2><dl data-v-d51de97c><div data-v-d51de97c><dt data-v-d51de97c>${ssrInterpolate(unref(ui)("Groupe"))}</dt><dd data-v-d51de97c>${ssrInterpolate(groupLabel(unref(detail).verb.groupeConjugaison))}</dd></div><div data-v-d51de97c><dt data-v-d51de97c>${ssrInterpolate(unref(ui)("Auxiliaire"))}</dt><dd data-v-d51de97c>${ssrInterpolate(unref(detail).verb.auxiliaire)}</dd></div></dl></header><div class="conjugation-disclosures" data-v-d51de97c><button type="button"${ssrRenderAttr("aria-expanded", unref(agreementOpen))}${ssrRenderAttr("aria-controls", `agreement-panel-${unref(detail).verb.id}`)} data-v-d51de97c><span data-v-d51de97c>${ssrInterpolate(unref(agreementOpen) ? unref(ui)("Masquer le COD") : unref(ui)("Voir avec un COD"))}</span><span class="disclosure-chevron" aria-hidden="true" data-v-d51de97c>⌄</span></button><button type="button"${ssrRenderAttr("aria-expanded", unref(trapsOpen))} aria-controls="consult-trap-legend" data-v-d51de97c><span data-v-d51de97c>${ssrInterpolate(unref(trapsOpen) ? unref(ui)("Masquer les pièges") : unref(ui)("Voir les pièges"))}</span><span class="disclosure-chevron" aria-hidden="true" data-v-d51de97c>⌄</span></button></div><div class="${ssrRenderClass([{ "is-open": unref(agreementOpen) }, "detail-disclosure"])}"${ssrRenderAttr("aria-hidden", !unref(agreementOpen))}${ssrIncludeBooleanAttr(!unref(agreementOpen)) ? " inert" : ""} data-v-d51de97c><div class="detail-disclosure__inner" data-v-d51de97c><section${ssrRenderAttr("id", `agreement-panel-${unref(detail).verb.id}`)} class="agreement-panel"${ssrRenderAttr("aria-labelledby", `agreement-title-${unref(detail).verb.id}`)} data-v-d51de97c>`);
            if (unref(detail).pastParticipleAgreement) {
              _push(`<header data-v-d51de97c><p class="reference-eyebrow" data-v-d51de97c>${ssrInterpolate(unref(ui)("Le participe passé avec avoir"))}</p><h3${ssrRenderAttr("id", `agreement-title-${unref(detail).verb.id}`)} data-v-d51de97c>${ssrInterpolate(unref(ui)("La place du COD change l’accord"))}</h3></header>`);
            } else {
              _push(`<!---->`);
            }
            if (unref(detail).pastParticipleAgreement) {
              _push(`<div class="agreement-examples" data-v-d51de97c><article data-v-d51de97c><span class="agreement-badge" data-v-d51de97c>${ssrInterpolate(unref(ui)("COD placé après"))}</span><p class="agreement-sentence" data-v-d51de97c>${ssrInterpolate(unref(detail).pastParticipleAgreement.afterSentence)}</p><p class="agreement-rule" data-v-d51de97c>${ssrInterpolate(unref(ui)("Avec avoir, le participe passé ne s’accorde pas avec le COD placé après."))}</p></article><article data-v-d51de97c><span class="agreement-badge agreement-badge--before" data-v-d51de97c>${ssrInterpolate(unref(ui)("COD placé avant"))}</span><p class="agreement-sentence" data-v-d51de97c>${ssrInterpolate(unref(detail).pastParticipleAgreement.beforeSentenceStart)}${ssrInterpolate(unref(detail).pastParticipleAgreement.agreedParticipleStart)}<mark data-v-d51de97c>${ssrInterpolate(unref(detail).pastParticipleAgreement.agreementLetters)}</mark>${ssrInterpolate(unref(detail).pastParticipleAgreement.beforeSentenceEnd)}</p><p class="agreement-rule" data-v-d51de97c>${ssrInterpolate(unref(ui)("COD « {cod} » placé avant : accord avec le COD ({gender}, {number}).", {
                cod: unref(detail).pastParticipleAgreement.cod,
                gender: agreementGenderLabel(unref(detail).pastParticipleAgreement.gender),
                number: unref(ui)(unref(detail).pastParticipleAgreement.number)
              }))}</p></article></div>`);
            } else {
              _push(`<!--[--><header data-v-d51de97c><p class="reference-eyebrow" data-v-d51de97c>${ssrInterpolate(unref(ui)("Avec un COD"))}</p><h3${ssrRenderAttr("id", `agreement-title-${unref(detail).verb.id}`)} data-v-d51de97c>${ssrInterpolate(unref(ui)("Exemple indisponible"))}</h3></header><p class="agreement-rule" data-v-d51de97c>${ssrInterpolate(unref(ui)("Aucun exemple avec un COD n’est disponible pour ce verbe."))}</p><!--]-->`);
            }
            _push(`</section></div></div><div class="${ssrRenderClass([{ "is-open": unref(trapsOpen) }, "detail-disclosure"])}"${ssrRenderAttr("aria-hidden", !unref(trapsOpen))}${ssrIncludeBooleanAttr(!unref(trapsOpen)) ? " inert" : ""} data-v-d51de97c><div class="detail-disclosure__inner" data-v-d51de97c><aside id="consult-trap-legend" class="trap-legend" data-v-d51de97c><header data-v-d51de97c><p class="reference-eyebrow" data-v-d51de97c>${ssrInterpolate(unref(ui)("Difficultés repérées"))}</p><h3 data-v-d51de97c>${ssrInterpolate(unref(ui)("Pièges à surveiller pour « {verb} »", { verb: unref(detail).verb.infinitif }))}</h3></header>`);
            if (!unref(trapAnalysis).traps.length) {
              _push(`<p class="trap-legend__empty" data-v-d51de97c>${ssrInterpolate(unref(ui)("Aucun piège particulier n’a été détecté dans les formes de ce verbe."))}</p>`);
            } else {
              _push(`<ul data-v-d51de97c><!--[-->`);
              ssrRenderList(unref(trapAnalysis).traps, (trap) => {
                _push(`<li class="${ssrRenderClass(trapToneClass(trap))}" data-v-d51de97c><span aria-hidden="true" data-v-d51de97c></span><div data-v-d51de97c><strong data-v-d51de97c>${ssrInterpolate(unref(uiLabel)(trap.title))}</strong><p data-v-d51de97c>${ssrInterpolate(unref(uiLabel)(trap.explanation))}</p><!--[-->`);
                ssrRenderList(trap.examples, (example) => {
                  _push(`<small data-v-d51de97c>${ssrInterpolate(example)}</small>`);
                });
                _push(`<!--]--></div></li>`);
              });
              _push(`<!--]--></ul>`);
            }
            _push(`</aside></div></div><nav class="mode-nav"${ssrRenderAttr("aria-label", unref(ui)("Accès aux modes"))} data-v-d51de97c><!--[-->`);
            ssrRenderList(unref(groups), (group) => {
              _push(`<button type="button" data-v-d51de97c>${ssrInterpolate(unref(uiLabel)(group.mode.name))}</button>`);
            });
            _push(`<!--]--><button type="button" data-v-d51de97c>${ssrInterpolate(unref(ui)("Formes non personnelles"))}</button></nav><!--[-->`);
            ssrRenderList(unref(groups), (group) => {
              _push(`<section${ssrRenderAttr("id", `consult-mode-${group.mode.id}`)} class="mode-section" data-v-d51de97c><h2 data-v-d51de97c>${ssrInterpolate(unref(uiLabel)(group.mode.name))}</h2><div class="tense-grid" data-v-d51de97c><!--[-->`);
              ssrRenderList(group.tenseRows, (tenseRow, rowIndex) => {
                _push(`<div class="tense-row" data-v-d51de97c><!--[-->`);
                ssrRenderList(tenseRow, (tense) => {
                  _push(`<article class="tense-consult-card" data-v-d51de97c><h3 data-v-d51de97c>${ssrInterpolate(unref(uiLabel)(unref(conjugationTenseLabel)(group.mode.name, tense.name)))}</h3><ul data-v-d51de97c><!--[-->`);
                  ssrRenderList(tense.rows, (row) => {
                    _push(`<li data-v-d51de97c><!--[-->`);
                    ssrRenderList(row.forms, (form, index) => {
                      _push(`<span data-v-d51de97c><!--[-->`);
                      ssrRenderList(displayedFormSegments(row, form, group.mode.name), (segment, segmentIndex) => {
                        _push(`<!--[-->`);
                        if (segment.trap && unref(trapsOpen)) {
                          _push(`<mark class="${ssrRenderClass([trapToneClass(segment.trap), "conjugation-trap-mark"])}"${ssrRenderAttr("title", unref(uiLabel)(segment.trap.title))} data-v-d51de97c>${ssrInterpolate(segment.text)}</mark>`);
                        } else {
                          _push(`<span data-v-d51de97c>${ssrInterpolate(segment.text)}</span>`);
                        }
                        _push(`<!--]-->`);
                      });
                      _push(`<!--]-->`);
                      if (index < row.forms.length - 1) {
                        _push(`<small data-v-d51de97c>${ssrInterpolate(unref(ui)("ou"))}</small>`);
                      } else {
                        _push(`<!---->`);
                      }
                      _push(`</span>`);
                    });
                    _push(`<!--]--></li>`);
                  });
                  _push(`<!--]--></ul></article>`);
                });
                _push(`<!--]--></div>`);
              });
              _push(`<!--]--></div></section>`);
            });
            _push(`<!--]--><section id="consult-non-finite" class="mode-section" data-v-d51de97c><h2 data-v-d51de97c>${ssrInterpolate(unref(ui)("Formes non personnelles"))}</h2><div class="non-finite-grid" data-v-d51de97c><!--[-->`);
            ssrRenderList(unref(nonFiniteForms), (item) => {
              _push(`<article data-v-d51de97c><p data-v-d51de97c>${ssrInterpolate(unref(uiLabel)(item.mode))} · ${ssrInterpolate(unref(uiLabel)(item.tense))}</p><strong data-v-d51de97c>${ssrInterpolate(item.form)}</strong></article>`);
            });
            _push(`<!--]--></div></section>`);
            if (unref(embeddedInChallenge)) {
              _push(`<div class="consultation-return-bottom" data-v-d51de97c><button class="back-button" type="button" data-v-d51de97c><span aria-hidden="true" data-v-d51de97c>←</span> ${ssrInterpolate(unref(ui)("Retour au défi"))}</button></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<!--]-->`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        }
        _push(`</section>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/consulter.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const consulter = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-d51de97c"]]);

export { consulter as default };
//# sourceMappingURL=consulter-CjLZx07A.mjs.map
