import { defineComponent, ref, useTemplateRef, withAsyncContext, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderClass, ssrRenderList } from 'vue/server-renderer';
import { i as isFiniteConjugationMode, c as conjugationModeOrder, a as conjugationTenseOrder, b as conjugationTenseLabel } from '../_/conjugation-display.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "consulter",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { ui, uiLabel } = useLanguagePreferences();
    const route = useRoute();
    useRouter();
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
    const groups = computed(() => [...catalogue.value?.modes ?? []].filter((mode) => isFiniteConjugationMode(mode.name)).sort((left, right) => conjugationModeOrder(left.name) - conjugationModeOrder(right.name) || left.id - right.id).map((mode) => ({
      mode,
      tenses: [...catalogue.value?.temps ?? []].filter((tense) => tense.modeId === mode.id).sort((left, right) => conjugationTenseOrder(mode.name, left.name) - conjugationTenseOrder(mode.name, right.name) || left.id - right.id).map((tense) => ({
        ...tense,
        rows: (detail.value?.conjugations ?? []).filter((row) => row.tenseId === tense.id)
      })).filter((tense) => tense.rows.length)
    })).filter((group) => group.tenses.length));
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
    function groupLabel(group) {
      if (!group) return ui("groupe irrégulier");
      if (group === 1) return ui("1er groupe");
      if (group === 2) return ui("2e groupe");
      return ui("3e groupe");
    }
    async function loadVerb(id) {
      const request = ++detailRequest;
      selectedId.value = id;
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
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "reference-page" }, _attrs))} data-v-e2e9fc65><header class="reference-hero" data-v-e2e9fc65><p class="reference-eyebrow" data-v-e2e9fc65>${ssrInterpolate(unref(ui)("Le conjugueur"))}</p><h1 data-v-e2e9fc65>${ssrInterpolate(unref(ui)("Consulter un verbe"))}</h1><p data-v-e2e9fc65>${ssrInterpolate(unref(ui)("Écris un infinitif ou parcours le catalogue de A à Z pour afficher toute sa conjugaison."))}</p></header>`);
      if (unref(status) === "pending") {
        _push(`<div class="reference-state" role="status" data-v-e2e9fc65>${ssrInterpolate(unref(ui)("Chargement du catalogue…"))}</div>`);
      } else if (unref(error)) {
        _push(`<div class="reference-state reference-state--error" role="alert" data-v-e2e9fc65><p data-v-e2e9fc65>${ssrInterpolate(unref(ui)("Le catalogue n’a pas pu être chargé."))}</p><button type="button" data-v-e2e9fc65>${ssrInterpolate(unref(ui)("Réessayer"))}</button></div>`);
      } else {
        _push(`<section class="consultation-container" aria-live="polite" data-v-e2e9fc65>`);
        if (!unref(showingDetail)) {
          _push(`<div class="consultation-panel selection-panel" data-v-e2e9fc65><div class="consultation-tabs" role="tablist"${ssrRenderAttr("aria-label", unref(ui)("Méthode de recherche du verbe"))} data-v-e2e9fc65><button id="search-tab" type="button" role="tab"${ssrRenderAttr("aria-selected", unref(activeTab) === "search")} aria-controls="search-panel" class="${ssrRenderClass({ "is-active": unref(activeTab) === "search" })}" data-v-e2e9fc65>${ssrInterpolate(unref(ui)("Rechercher un verbe"))}</button><button id="list-tab" type="button" role="tab"${ssrRenderAttr("aria-selected", unref(activeTab) === "list")} aria-controls="list-panel" class="${ssrRenderClass({ "is-active": unref(activeTab) === "list" })}" data-v-e2e9fc65>${ssrInterpolate(unref(ui)("Liste de A à Z"))}</button></div>`);
          if (unref(activeTab) === "search") {
            _push(`<div id="search-panel" class="tab-panel search-tab-panel" role="tabpanel" aria-labelledby="search-tab" data-v-e2e9fc65><div data-v-e2e9fc65><p class="reference-eyebrow" data-v-e2e9fc65>${ssrInterpolate(unref(ui)("Recherche rapide"))}</p><h2 data-v-e2e9fc65>${ssrInterpolate(unref(ui)("Quel verbe cherches-tu ?"))}</h2><p data-v-e2e9fc65>${ssrInterpolate(unref(ui)("Commence à écrire son infinitif, puis choisis-le dans les propositions."))}</p></div><div class="verb-combobox" data-v-e2e9fc65><input id="public-verb-search"${ssrRenderAttr("value", unref(query))} type="search" role="combobox" autocomplete="off" spellcheck="false"${ssrRenderAttr("placeholder", unref(ui)("Par exemple : venir"))}${ssrRenderAttr("aria-label", unref(ui)("Rechercher un verbe"))} aria-autocomplete="list" aria-controls="public-verb-suggestions"${ssrRenderAttr("aria-expanded", unref(suggestionsOpen))}${ssrRenderAttr("aria-activedescendant", unref(suggestionsOpen) ? `public-verb-option-${unref(suggestions)[unref(activeSuggestion)]?.id}` : void 0)} data-v-e2e9fc65>`);
            if (unref(suggestionsOpen)) {
              _push(`<ul id="public-verb-suggestions" role="listbox" data-v-e2e9fc65><!--[-->`);
              ssrRenderList(unref(suggestions), (verb, index) => {
                _push(`<li${ssrRenderAttr("id", `public-verb-option-${verb.id}`)} role="option"${ssrRenderAttr("aria-selected", index === unref(activeSuggestion))} data-v-e2e9fc65><button type="button" class="${ssrRenderClass({ "is-active": index === unref(activeSuggestion) })}" data-v-e2e9fc65><strong data-v-e2e9fc65>${ssrInterpolate(verb.infinitif)}</strong><small data-v-e2e9fc65>${ssrInterpolate(groupLabel(verb.groupeConjugaison))}</small></button></li>`);
              });
              _push(`<!--]--></ul>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div>`);
          } else {
            _push(`<div id="list-panel" class="tab-panel list-tab-panel" role="tabpanel" aria-labelledby="list-tab" data-v-e2e9fc65><div class="alphabet-heading" data-v-e2e9fc65><div data-v-e2e9fc65><p class="reference-eyebrow" data-v-e2e9fc65>${ssrInterpolate(unref(ui)("Catalogue complet"))}</p><h2 data-v-e2e9fc65>${ssrInterpolate(unref(ui)("Tous les verbes de A à Z"))}</h2></div><span data-v-e2e9fc65>${ssrInterpolate(unref(verbs).length)} ${ssrInterpolate(unref(verbs).length === 1 ? unref(ui)("verbe") : unref(ui)("verbes"))}</span></div><nav class="letter-nav"${ssrRenderAttr("aria-label", unref(ui)("Accès aux lettres"))} data-v-e2e9fc65><!--[-->`);
            ssrRenderList(unref(alphabetGroups), (group) => {
              _push(`<button type="button" data-v-e2e9fc65>${ssrInterpolate(group.letter)}</button>`);
            });
            _push(`<!--]--></nav><div class="alphabet-list" data-v-e2e9fc65><div class="alphabet-groups" data-v-e2e9fc65><!--[-->`);
            ssrRenderList(unref(alphabetGroups), (group) => {
              _push(`<section${ssrRenderAttr("id", `letter-${group.letter}`)} class="letter-group" data-v-e2e9fc65><h3 data-v-e2e9fc65>${ssrInterpolate(group.letter)}</h3><div data-v-e2e9fc65><!--[-->`);
              ssrRenderList(group.verbs, (verb) => {
                _push(`<button type="button" class="${ssrRenderClass({ "is-selected": unref(selectedId) === verb.id })}" data-v-e2e9fc65>${ssrInterpolate(verb.infinitif)}</button>`);
              });
              _push(`<!--]--></div></section>`);
            });
            _push(`<!--]--></div></div></div>`);
          }
          _push(`</div>`);
        } else {
          _push(`<div class="consultation-panel detail-panel" data-v-e2e9fc65><button class="back-button" type="button" data-v-e2e9fc65><span aria-hidden="true" data-v-e2e9fc65>←</span> ${ssrInterpolate(unref(ui)("Retour au choix du verbe"))}</button>`);
          if (unref(detailLoading)) {
            _push(`<div class="reference-state" role="status" data-v-e2e9fc65>${ssrInterpolate(unref(ui)("Chargement de la conjugaison…"))}</div>`);
          } else if (unref(detailError)) {
            _push(`<div class="reference-state reference-state--error" role="alert" data-v-e2e9fc65><p data-v-e2e9fc65>${ssrInterpolate(unref(detailError))}</p><button type="button" data-v-e2e9fc65>${ssrInterpolate(unref(ui)("Retour à la liste"))}</button></div>`);
          } else if (unref(detail)) {
            _push(`<!--[--><header class="conjugation-heading" data-v-e2e9fc65><div data-v-e2e9fc65><p class="reference-eyebrow" data-v-e2e9fc65>${ssrInterpolate(unref(ui)("Conjugaison du verbe"))}</p><h2 data-v-e2e9fc65>${ssrInterpolate(unref(detail).verb.infinitif)}</h2></div><dl data-v-e2e9fc65><div data-v-e2e9fc65><dt data-v-e2e9fc65>${ssrInterpolate(unref(ui)("Groupe"))}</dt><dd data-v-e2e9fc65>${ssrInterpolate(groupLabel(unref(detail).verb.groupeConjugaison))}</dd></div><div data-v-e2e9fc65><dt data-v-e2e9fc65>${ssrInterpolate(unref(ui)("Auxiliaire"))}</dt><dd data-v-e2e9fc65>${ssrInterpolate(unref(detail).verb.auxiliaire)}</dd></div></dl></header><nav class="mode-nav"${ssrRenderAttr("aria-label", unref(ui)("Accès aux modes"))} data-v-e2e9fc65><!--[-->`);
            ssrRenderList(unref(groups), (group) => {
              _push(`<button type="button" data-v-e2e9fc65>${ssrInterpolate(unref(uiLabel)(group.mode.name))}</button>`);
            });
            _push(`<!--]--><button type="button" data-v-e2e9fc65>${ssrInterpolate(unref(ui)("Formes non personnelles"))}</button></nav><!--[-->`);
            ssrRenderList(unref(groups), (group) => {
              _push(`<section${ssrRenderAttr("id", `consult-mode-${group.mode.id}`)} class="mode-section" data-v-e2e9fc65><h2 data-v-e2e9fc65>${ssrInterpolate(unref(uiLabel)(group.mode.name))}</h2><div class="tense-grid" data-v-e2e9fc65><!--[-->`);
              ssrRenderList(group.tenses, (tense) => {
                _push(`<article class="tense-consult-card" data-v-e2e9fc65><h3 data-v-e2e9fc65>${ssrInterpolate(unref(uiLabel)(unref(conjugationTenseLabel)(group.mode.name, tense.name)))}</h3><ul data-v-e2e9fc65><!--[-->`);
                ssrRenderList(tense.rows, (row) => {
                  _push(`<li data-v-e2e9fc65><!--[-->`);
                  ssrRenderList(row.forms, (form, index) => {
                    _push(`<span data-v-e2e9fc65>${ssrInterpolate(displayedForm(row, form, group.mode.name))}`);
                    if (index < row.forms.length - 1) {
                      _push(`<small data-v-e2e9fc65>${ssrInterpolate(unref(ui)("ou"))}</small>`);
                    } else {
                      _push(`<!---->`);
                    }
                    _push(`</span>`);
                  });
                  _push(`<!--]--></li>`);
                });
                _push(`<!--]--></ul></article>`);
              });
              _push(`<!--]--></div></section>`);
            });
            _push(`<!--]--><section id="consult-non-finite" class="mode-section" data-v-e2e9fc65><h2 data-v-e2e9fc65>${ssrInterpolate(unref(ui)("Formes non personnelles"))}</h2><div class="non-finite-grid" data-v-e2e9fc65><!--[-->`);
            ssrRenderList(unref(nonFiniteForms), (item) => {
              _push(`<article data-v-e2e9fc65><p data-v-e2e9fc65>${ssrInterpolate(unref(uiLabel)(item.mode))} · ${ssrInterpolate(unref(uiLabel)(item.tense))}</p><strong data-v-e2e9fc65>${ssrInterpolate(item.form)}</strong></article>`);
            });
            _push(`<!--]--></div></section><!--]-->`);
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
const consulter = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-e2e9fc65"]]);

export { consulter as default };
//# sourceMappingURL=consulter-DI9YNZS_.mjs.map
