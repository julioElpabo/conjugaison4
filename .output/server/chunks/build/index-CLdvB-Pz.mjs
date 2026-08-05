import { u as useAdminAuth, _ as __nuxt_component_0, a as __nuxt_component_1, g as getAdminErrorMessage } from './AdminShell-C-VPkAQz.mjs';
import { defineComponent, ref, watch, withCtx, unref, createVNode, openBlock, createBlock, createTextVNode, toDisplayString, createCommentVNode, computed, mergeProps, reactive, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderAttrs, ssrRenderAttr, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { m as matchingVerbs, n as normalizeVerbSearch } from '../_/verb-search.mjs';
import { u as useHead } from './server.mjs';
import { i as isFiniteConjugationMode, c as conjugationModeOrder, a as conjugationTenseOrder, b as conjugationTenseLabel } from '../_/conjugation-display.mjs';
import { w as withComplementPreposition, n as normalizeComplementPreposition } from '../_/complement-preposition.mjs';
import './nuxt-link-icjx6oE7.mjs';
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
import './state-DjsguMyT.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';

const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "NewVerbForm",
  __ssrInlineRender: true,
  props: {
    saving: { type: Boolean },
    error: {}
  },
  emits: ["create", "cancel"],
  setup(__props, { emit: __emit }) {
    const form = reactive({
      infinitif: "",
      participePresent: "",
      participePasse: "",
      auxiliaire: "avoir"
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: "new-verb",
        "aria-labelledby": "new-verb-title"
      }, _attrs))} data-v-77bd1d25><div class="admin-section-heading" data-v-77bd1d25><div data-v-77bd1d25><p class="admin-eyebrow" data-v-77bd1d25>Nouveau</p><h2 id="new-verb-title" data-v-77bd1d25>Ajouter un verbe</h2></div></div><p class="admin-muted" data-v-77bd1d25> Créez d’abord sa fiche, puis complétez ses conjugaisons dans la grille. </p><form class="admin-form new-verb__form" data-v-77bd1d25><label class="admin-field" data-v-77bd1d25><span data-v-77bd1d25>Infinitif *</span><input${ssrRenderAttr("value", unref(form).infinitif)} maxlength="255" required autofocus data-v-77bd1d25></label><label class="admin-field" data-v-77bd1d25><span data-v-77bd1d25>Participe présent</span><input${ssrRenderAttr("value", unref(form).participePresent)} maxlength="255" data-v-77bd1d25></label><label class="admin-field" data-v-77bd1d25><span data-v-77bd1d25>Participe passé</span><input${ssrRenderAttr("value", unref(form).participePasse)} maxlength="255" data-v-77bd1d25></label><label class="admin-field" data-v-77bd1d25><span data-v-77bd1d25>Auxiliaire *</span><select required data-v-77bd1d25><option value="avoir" data-v-77bd1d25${ssrIncludeBooleanAttr(Array.isArray(unref(form).auxiliaire) ? ssrLooseContain(unref(form).auxiliaire, "avoir") : ssrLooseEqual(unref(form).auxiliaire, "avoir")) ? " selected" : ""}>avoir</option><option value="être" data-v-77bd1d25${ssrIncludeBooleanAttr(Array.isArray(unref(form).auxiliaire) ? ssrLooseContain(unref(form).auxiliaire, "être") : ssrLooseEqual(unref(form).auxiliaire, "être")) ? " selected" : ""}>être</option></select></label>`);
      if (__props.error) {
        _push(`<p class="admin-notice admin-notice--error" role="alert" data-v-77bd1d25>${ssrInterpolate(__props.error)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="new-verb__actions" data-v-77bd1d25><button class="admin-button" type="button"${ssrIncludeBooleanAttr(__props.saving) ? " disabled" : ""} data-v-77bd1d25> Annuler </button><button class="admin-button admin-button--primary" type="submit"${ssrIncludeBooleanAttr(__props.saving) ? " disabled" : ""} data-v-77bd1d25>${ssrInterpolate(__props.saving ? "Création…" : "Créer le verbe")}</button></div></form></section>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/NewVerbForm.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const AdminNewVerbForm = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$3, [["__scopeId", "data-v-77bd1d25"]]), { __name: "AdminNewVerbForm" });
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "VerbCatalogue",
  __ssrInlineRender: true,
  props: {
    verbs: {},
    selectedId: {},
    loading: { type: Boolean }
  },
  emits: ["select", "create"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const query = ref("");
    const searchOpen = ref(false);
    const activeIndex = ref(-1);
    const filteredVerbs = computed(() => {
      return matchingVerbs(props.verbs, query.value);
    });
    const suggestions = computed(() => normalizeVerbSearch(query.value) ? filteredVerbs.value.slice(0, 10) : []);
    watch(suggestions, (items) => {
      if (!items.length) activeIndex.value = -1;
      else if (activeIndex.value >= items.length) activeIndex.value = 0;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<aside${ssrRenderAttrs(mergeProps({
        class: "verb-catalogue",
        "aria-labelledby": "verb-catalogue-title"
      }, _attrs))} data-v-06f17d2d><div class="verb-catalogue__heading" data-v-06f17d2d><div data-v-06f17d2d><h2 id="verb-catalogue-title" data-v-06f17d2d>Catalogue</h2><p data-v-06f17d2d>${ssrInterpolate(__props.verbs.length)} verbe${ssrInterpolate(__props.verbs.length > 1 ? "s" : "")}</p></div><button class="admin-button admin-button--primary admin-button--small" type="button" data-v-06f17d2d><span aria-hidden="true" data-v-06f17d2d>＋</span> Ajouter </button></div><div class="admin-field verb-catalogue__search" data-v-06f17d2d><label for="admin-verb-search" data-v-06f17d2d>Trouver un verbe</label><div class="verb-catalogue__combobox" data-v-06f17d2d><input id="admin-verb-search"${ssrRenderAttr("value", unref(query))} type="search" role="combobox" autocomplete="off" spellcheck="false" placeholder="Commencez à écrire, ex. voir" aria-autocomplete="list" aria-controls="admin-verb-suggestions"${ssrRenderAttr("aria-expanded", unref(searchOpen))}${ssrRenderAttr("aria-activedescendant", unref(searchOpen) && unref(activeIndex) >= 0 ? `admin-verb-option-${unref(suggestions)[unref(activeIndex)]?.id}` : void 0)} data-v-06f17d2d>`);
      if (unref(query)) {
        _push(`<button type="button" aria-label="Effacer la recherche" data-v-06f17d2d>×</button>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(searchOpen)) {
        _push(`<ul id="admin-verb-suggestions" class="verb-catalogue__suggestions" role="listbox" aria-label="Suggestions de verbes" data-v-06f17d2d><!--[-->`);
        ssrRenderList(unref(suggestions), (verb, index2) => {
          _push(`<li${ssrRenderAttr("id", `admin-verb-option-${verb.id}`)} role="option"${ssrRenderAttr("aria-selected", index2 === unref(activeIndex))} data-v-06f17d2d><button type="button" class="${ssrRenderClass({ "is-active": index2 === unref(activeIndex) })}" data-v-06f17d2d><strong data-v-06f17d2d>${ssrInterpolate(verb.infinitif)}</strong><span data-v-06f17d2d>auxiliaire ${ssrInterpolate(verb.auxiliaire)}</span></button></li>`);
        });
        _push(`<!--]--></ul>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(query)) {
        _push(`<small class="verb-catalogue__result-count" aria-live="polite" data-v-06f17d2d>${ssrInterpolate(unref(filteredVerbs).length)} résultat${ssrInterpolate(unref(filteredVerbs).length > 1 ? "s" : "")}</small>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (__props.loading) {
        _push(`<p class="admin-muted" role="status" data-v-06f17d2d>Chargement du catalogue…</p>`);
      } else if (unref(filteredVerbs).length) {
        _push(`<ul class="verb-catalogue__list" data-v-06f17d2d><!--[-->`);
        ssrRenderList(unref(filteredVerbs), (verb) => {
          _push(`<li data-v-06f17d2d><button type="button" class="${ssrRenderClass({ "is-selected": verb.id === __props.selectedId })}"${ssrRenderAttr("aria-current", verb.id === __props.selectedId ? "true" : void 0)} data-v-06f17d2d><span data-v-06f17d2d>${ssrInterpolate(verb.infinitif)}</span><span class="verb-catalogue__meta" data-v-06f17d2d>`);
          if (verb.helpReviewStatus === "approved") {
            _push(`<small class="verb-catalogue__approved" data-v-06f17d2d>✓ Approuvé</small>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<small data-v-06f17d2d>${ssrInterpolate(verb.auxiliaire || "sans auxiliaire")}</small></span></button></li>`);
        });
        _push(`<!--]--></ul>`);
      } else {
        _push(`<p class="verb-catalogue__empty admin-muted" data-v-06f17d2d> Aucun verbe ne correspond à « ${ssrInterpolate(unref(query))} ». </p>`);
      }
      _push(`</aside>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/VerbCatalogue.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const AdminVerbCatalogue = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$2, [["__scopeId", "data-v-06f17d2d"]]), { __name: "AdminVerbCatalogue" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "VerbEditor",
  __ssrInlineRender: true,
  props: {
    detail: {},
    modes: {},
    tenses: {},
    saving: { type: Boolean },
    error: {},
    success: {}
  },
  emits: ["save", "dirtyChange"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const people = [
      { id: 4, short: "je", label: "Première personne du singulier" },
      { id: 5, short: "tu", label: "Deuxième personne du singulier" },
      { id: 6, short: "il / elle", label: "Troisième personne du singulier" },
      { id: 7, short: "nous", label: "Première personne du pluriel" },
      { id: 8, short: "vous", label: "Deuxième personne du pluriel" },
      { id: 9, short: "ils / elles", label: "Troisième personne du pluriel" }
    ];
    function peopleForMode(mode) {
      return mode.trim().toLocaleLowerCase("fr-CH") === "impératif" ? people.filter((person) => [5, 7, 8].includes(person.id)) : people;
    }
    function modeAnchor(mode) {
      return `mode-${mode.normalize("NFD").replace(new RegExp("\\p{Diacritic}", "gu"), "").toLocaleLowerCase("fr").replace(/[^a-z]+/g, "-")}`;
    }
    const draft = reactive({
      infinitif: "",
      participePresent: "",
      participePasse: "",
      auxiliaire: "avoir",
      meaning: "",
      groupeConjugaison: null,
      familleConjugaison: "",
      terminaison: "",
      typePronominal: "aucun",
      estImpersonnel: false,
      estDefectif: false,
      niveauDifficulte: null,
      niveauCecrl: "",
      registrePrincipal: "courant",
      formeCanonique: "",
      statutValidation: "genere",
      particularites: [],
      niveauxScolaires: [],
      parcoursCif: [],
      categoriesSemantiques: [],
      conjugations: []
    });
    const initialSnapshot = ref("");
    const complementGroups = ref([]);
    const complementDrafts = reactive({});
    const complementGrammar = reactive({});
    const complementGrammarOpen = reactive({});
    const complementNatures = reactive({});
    const firstComplementDraft = ref("");
    const firstComplementGrammar = reactive({ gender: "", number: "" });
    const firstComplementGrammarOpen = ref(false);
    const newCoiDraft = ref("");
    const newCoiPreposition = ref("à");
    const newCoiNature = ref("nominal");
    const newCoiGrammar = reactive({ gender: "", number: "" });
    const complementBusy = ref("");
    const complementError = ref("");
    const complementSuccess = ref("");
    const hasCodConstruction = computed(() => complementGroups.value.some((construction) => !isCoi(construction)));
    const newCoiPreview = computed(() => withComplementPreposition(newCoiDraft.value, newCoiPreposition.value));
    const editableTenses = computed(() => props.tenses.filter((tense) => tense.name.trim().toLocaleLowerCase("fr-CH") !== "futur proche"));
    const groups = computed(() => [...props.modes].filter((mode) => isFiniteConjugationMode(mode.name)).sort((left, right) => conjugationModeOrder(left.name) - conjugationModeOrder(right.name) || left.id - right.id).map((mode) => ({
      mode,
      tenses: editableTenses.value.filter((tense) => tense.modeId === mode.id).sort((left, right) => conjugationTenseOrder(mode.name, left.name) - conjugationTenseOrder(mode.name, right.name) || left.id - right.id).map((tense) => ({
        ...tense,
        rows: peopleForMode(mode.name).map((person) => ({
          person,
          conjugation: draft.conjugations.find((item) => item.tenseId === tense.id && item.personId === person.id)
        }))
      }))
    })).filter((group) => group.tenses.length > 0));
    const auxiliaryParticiple = computed(() => draft.auxiliaire === "être" ? "étant" : "ayant");
    const nonFiniteForms = computed(() => ({
      infinitivePast: [draft.auxiliaire, draft.participePasse].filter(Boolean).join(" "),
      gerundPresent: draft.participePresent ? `en ${draft.participePresent}` : "",
      gerundPast: draft.participePasse ? `en ${auxiliaryParticiple.value} ${draft.participePasse}` : ""
    }));
    function payload() {
      return {
        infinitif: draft.infinitif.trim(),
        participePresent: draft.participePresent.trim(),
        participePasse: draft.participePasse.trim(),
        auxiliaire: draft.auxiliaire.trim(),
        meaning: draft.meaning.trim(),
        groupeConjugaison: draft.groupeConjugaison,
        familleConjugaison: draft.familleConjugaison,
        terminaison: draft.terminaison.trim().replace(/^-+/u, ""),
        typePronominal: draft.typePronominal,
        estImpersonnel: draft.estImpersonnel,
        estDefectif: draft.estDefectif,
        niveauDifficulte: draft.niveauDifficulte,
        niveauCecrl: draft.niveauCecrl,
        registrePrincipal: draft.registrePrincipal.trim(),
        formeCanonique: draft.formeCanonique.trim(),
        statutValidation: draft.statutValidation,
        particularites: [...draft.particularites],
        niveauxScolaires: [...draft.niveauxScolaires],
        parcoursCif: [...draft.parcoursCif],
        categoriesSemantiques: [...draft.categoriesSemantiques].sort(),
        conjugations: draft.conjugations.map((item) => ({
          personId: item.personId,
          tenseId: item.tenseId,
          conjugaison1: item.conjugaison1.trim(),
          conjugaison2: item.conjugaison2.trim(),
          conjugaison3: item.conjugaison3.trim()
        }))
      };
    }
    const dirty = computed(() => JSON.stringify(payload()) !== initialSnapshot.value);
    const isValid = computed(() => Boolean(
      draft.infinitif.trim() && draft.auxiliaire.trim() && draft.groupeConjugaison && draft.familleConjugaison && draft.terminaison.trim() && draft.formeCanonique.trim()
    ));
    function resetDraft() {
      const existing = new Map(
        props.detail.conjugations.map((item) => [`${Number(item.tenseId)}:${Number(item.personId)}`, item])
      );
      const expectedKeys = /* @__PURE__ */ new Set();
      const rows = [];
      for (const tense of editableTenses.value) {
        for (const person of people) {
          const key = `${tense.id}:${person.id}`;
          const item = existing.get(key);
          expectedKeys.add(key);
          rows.push({
            tenseId: tense.id,
            personId: person.id,
            conjugaison1: item?.conjugaison1 ?? "",
            conjugaison2: item?.conjugaison2 ?? "",
            conjugaison3: item?.conjugaison3 ?? ""
          });
        }
      }
      for (const item of props.detail.conjugations) {
        const key = `${Number(item.tenseId)}:${Number(item.personId)}`;
        if (!expectedKeys.has(key)) {
          rows.push({
            tenseId: Number(item.tenseId),
            personId: Number(item.personId),
            conjugaison1: item.conjugaison1 ?? "",
            conjugaison2: item.conjugaison2 ?? "",
            conjugaison3: item.conjugaison3 ?? ""
          });
        }
      }
      draft.infinitif = props.detail.verb.infinitif;
      draft.participePresent = props.detail.verb.participePresent;
      draft.participePasse = props.detail.verb.participePasse;
      draft.auxiliaire = props.detail.verb.auxiliaire || "avoir";
      draft.meaning = props.detail.verb.meaning ?? "";
      draft.groupeConjugaison = props.detail.verb.groupeConjugaison ?? null;
      draft.familleConjugaison = props.detail.verb.familleConjugaison ?? "";
      draft.terminaison = props.detail.verb.terminaison ?? "";
      draft.typePronominal = props.detail.verb.typePronominal ?? "aucun";
      draft.estImpersonnel = Boolean(props.detail.verb.estImpersonnel);
      draft.estDefectif = Boolean(props.detail.verb.estDefectif);
      draft.niveauDifficulte = props.detail.verb.niveauDifficulte ?? null;
      draft.niveauCecrl = props.detail.verb.niveauCecrl ?? "";
      draft.registrePrincipal = props.detail.verb.registrePrincipal ?? "courant";
      draft.formeCanonique = props.detail.verb.formeCanonique || props.detail.verb.infinitif;
      draft.statutValidation = props.detail.verb.statutValidation ?? "genere";
      draft.particularites = [...props.detail.verb.particularites ?? []];
      draft.niveauxScolaires = [...props.detail.verb.niveauxScolaires ?? []];
      draft.parcoursCif = [...props.detail.verb.parcoursCif ?? []];
      draft.categoriesSemantiques = (props.detail.verb.categoriesSemantiques ?? []).map((category) => category.slug);
      draft.conjugations.splice(0, draft.conjugations.length, ...rows);
      initialSnapshot.value = JSON.stringify(payload());
    }
    function resetComplements() {
      complementGroups.value = (props.detail.constructions ?? []).map((construction) => ({
        ...construction,
        complements: construction.complements.map((complement) => ({ ...complement }))
      }));
      complementError.value = "";
      complementSuccess.value = "";
      firstComplementDraft.value = "";
      firstComplementGrammar.gender = "";
      firstComplementGrammar.number = "";
      firstComplementGrammarOpen.value = false;
      newCoiDraft.value = "";
      newCoiPreposition.value = "à";
      newCoiNature.value = "nominal";
      newCoiGrammar.gender = "";
      newCoiGrammar.number = "";
      for (const construction of complementGroups.value) {
        complementNatures[construction.id] = "nominal";
      }
    }
    function grammarDraft(constructionId) {
      return complementGrammar[constructionId] ??= { gender: "", number: "" };
    }
    function grammarComplete(grammar) {
      return Boolean(grammar.gender && grammar.number);
    }
    function isCoi(construction) {
      return construction.fonctionObjet.trim().toLocaleLowerCase("fr-CH") === "coi";
    }
    function complementNature(constructionId) {
      return complementNatures[constructionId] ??= "nominal";
    }
    function complementPreposition(construction) {
      return normalizeComplementPreposition(construction.preposition) ?? "à";
    }
    function complementPreview(construction) {
      const value = complementDrafts[construction.id] ?? "";
      return value.trim() && isCoi(construction) ? withComplementPreposition(value, complementPreposition(construction)) : value.trim();
    }
    function complementPlaceholder(construction) {
      if (construction.fonctionObjet.trim().toLocaleLowerCase("fr-CH") !== "coi") return "Ex. une pomme";
      if (complementNature(construction.id) === "infinitif") return "Ex. résoudre ce problème";
      if (complementNature(construction.id) === "expression") return "Ex. cache-cache";
      return construction.preposition?.trim().toLocaleLowerCase("fr-CH") === "de" ? "Ex. son projet" : "Ex. un ami";
    }
    watch(
      () => [props.detail, props.tenses],
      resetDraft,
      { immediate: true }
    );
    watch(() => props.detail, resetComplements, { immediate: true });
    watch(dirty, (value) => emit("dirtyChange", value), { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<form${ssrRenderAttrs(mergeProps({ class: "verb-editor" }, _attrs))} data-v-3ef31023><div class="verb-editor__top" data-v-3ef31023><div class="admin-section-heading" data-v-3ef31023><div data-v-3ef31023><p class="admin-eyebrow" data-v-3ef31023>Verbe no ${ssrInterpolate(__props.detail.verb.id)}</p><h1 data-v-3ef31023>Modifier « ${ssrInterpolate(__props.detail.verb.infinitif)} »</h1></div></div><div class="verb-editor__actions" data-v-3ef31023><button class="admin-button" type="button"${ssrIncludeBooleanAttr(__props.saving || !unref(dirty)) ? " disabled" : ""} data-v-3ef31023> Annuler les changements </button><button class="admin-button admin-button--primary" type="submit"${ssrIncludeBooleanAttr(__props.saving || !unref(dirty) || !unref(isValid)) ? " disabled" : ""} data-v-3ef31023>${ssrInterpolate(__props.saving ? "Enregistrement…" : "Enregistrer")}</button></div></div>`);
      if (__props.success) {
        _push(`<p class="admin-notice admin-notice--success" role="status" data-v-3ef31023>${ssrInterpolate(__props.success)}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.error) {
        _push(`<p class="admin-notice admin-notice--error" role="alert" data-v-3ef31023>${ssrInterpolate(__props.error)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<fieldset class="verb-editor__metadata" data-v-3ef31023><legend data-v-3ef31023>Fiche du verbe</legend><label class="admin-field" data-v-3ef31023><span data-v-3ef31023>Infinitif *</span><input${ssrRenderAttr("value", unref(draft).infinitif)} maxlength="255" required data-v-3ef31023></label><label class="admin-field" data-v-3ef31023><span data-v-3ef31023>Auxiliaire *</span><select required data-v-3ef31023><option value="avoir" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(draft).auxiliaire) ? ssrLooseContain(unref(draft).auxiliaire, "avoir") : ssrLooseEqual(unref(draft).auxiliaire, "avoir")) ? " selected" : ""}>avoir</option><option value="être" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(draft).auxiliaire) ? ssrLooseContain(unref(draft).auxiliaire, "être") : ssrLooseEqual(unref(draft).auxiliaire, "être")) ? " selected" : ""}>être</option></select></label></fieldset><section class="verb-editor__classification" aria-labelledby="classification-title" data-v-3ef31023><div data-v-3ef31023><h2 id="classification-title" data-v-3ef31023>Classement grammatical et sémantique</h2><p class="admin-muted" data-v-3ef31023>Ces informations alimentent le catalogue, les exercices et les aides liées à ce verbe.</p></div><div class="verb-editor__classification-grid" data-v-3ef31023><label class="admin-field verb-editor__definition" data-v-3ef31023><span data-v-3ef31023>Définition du verbe</span><textarea rows="3" maxlength="4000" placeholder="Décrivez le sens principal de ce verbe." data-v-3ef31023>${ssrInterpolate(unref(draft).meaning)}</textarea><small data-v-3ef31023>Cette définition est disponible dans le catalogue et via la variable <code data-v-3ef31023>{definition}</code> des aides.</small></label><label class="admin-field" data-v-3ef31023><span data-v-3ef31023>Groupe *</span><select required data-v-3ef31023><option${ssrRenderAttr("value", null)} disabled data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(draft).groupeConjugaison) ? ssrLooseContain(unref(draft).groupeConjugaison, null) : ssrLooseEqual(unref(draft).groupeConjugaison, null)) ? " selected" : ""}>À choisir</option><option${ssrRenderAttr("value", 1)} data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(draft).groupeConjugaison) ? ssrLooseContain(unref(draft).groupeConjugaison, 1) : ssrLooseEqual(unref(draft).groupeConjugaison, 1)) ? " selected" : ""}>1er groupe</option><option${ssrRenderAttr("value", 2)} data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(draft).groupeConjugaison) ? ssrLooseContain(unref(draft).groupeConjugaison, 2) : ssrLooseEqual(unref(draft).groupeConjugaison, 2)) ? " selected" : ""}>2e groupe</option><option${ssrRenderAttr("value", 3)} data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(draft).groupeConjugaison) ? ssrLooseContain(unref(draft).groupeConjugaison, 3) : ssrLooseEqual(unref(draft).groupeConjugaison, 3)) ? " selected" : ""}>3e groupe</option></select></label><label class="admin-field" data-v-3ef31023><span data-v-3ef31023>Famille *</span><select required data-v-3ef31023><option value="" disabled data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(draft).familleConjugaison) ? ssrLooseContain(unref(draft).familleConjugaison, "") : ssrLooseEqual(unref(draft).familleConjugaison, "")) ? " selected" : ""}>À choisir</option><!--[-->`);
      ssrRenderList(__props.detail.classificationOptions?.families, (family) => {
        _push(`<option${ssrRenderAttr("value", family.slug)} data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(draft).familleConjugaison) ? ssrLooseContain(unref(draft).familleConjugaison, family.slug) : ssrLooseEqual(unref(draft).familleConjugaison, family.slug)) ? " selected" : ""}>${ssrInterpolate(family.label)}</option>`);
      });
      _push(`<!--]--></select></label><label class="admin-field" data-v-3ef31023><span data-v-3ef31023>Terminaison *</span><input${ssrRenderAttr("value", unref(draft).terminaison)} maxlength="12" placeholder="er" required data-v-3ef31023></label><label class="admin-field" data-v-3ef31023><span data-v-3ef31023>Pronominalité</span><select data-v-3ef31023><option value="aucun" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(draft).typePronominal) ? ssrLooseContain(unref(draft).typePronominal, "aucun") : ssrLooseEqual(unref(draft).typePronominal, "aucun")) ? " selected" : ""}>Aucune</option><option value="occasionnel" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(draft).typePronominal) ? ssrLooseContain(unref(draft).typePronominal, "occasionnel") : ssrLooseEqual(unref(draft).typePronominal, "occasionnel")) ? " selected" : ""}>Occasionnelle</option><option value="essentiel" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(draft).typePronominal) ? ssrLooseContain(unref(draft).typePronominal, "essentiel") : ssrLooseEqual(unref(draft).typePronominal, "essentiel")) ? " selected" : ""}>Essentielle</option></select></label><label class="admin-field" data-v-3ef31023><span data-v-3ef31023>Difficulté</span><select data-v-3ef31023><option${ssrRenderAttr("value", null)} data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(draft).niveauDifficulte) ? ssrLooseContain(unref(draft).niveauDifficulte, null) : ssrLooseEqual(unref(draft).niveauDifficulte, null)) ? " selected" : ""}>Non renseignée</option><option${ssrRenderAttr("value", 1)} data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(draft).niveauDifficulte) ? ssrLooseContain(unref(draft).niveauDifficulte, 1) : ssrLooseEqual(unref(draft).niveauDifficulte, 1)) ? " selected" : ""}>1 / 3 — simple</option><option${ssrRenderAttr("value", 2)} data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(draft).niveauDifficulte) ? ssrLooseContain(unref(draft).niveauDifficulte, 2) : ssrLooseEqual(unref(draft).niveauDifficulte, 2)) ? " selected" : ""}>2 / 3 — intermédiaire</option><option${ssrRenderAttr("value", 3)} data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(draft).niveauDifficulte) ? ssrLooseContain(unref(draft).niveauDifficulte, 3) : ssrLooseEqual(unref(draft).niveauDifficulte, 3)) ? " selected" : ""}>3 / 3 — difficile</option></select></label><label class="admin-field" data-v-3ef31023><span data-v-3ef31023>Niveau CECRL</span><select data-v-3ef31023><option value="" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(draft).niveauCecrl) ? ssrLooseContain(unref(draft).niveauCecrl, "") : ssrLooseEqual(unref(draft).niveauCecrl, "")) ? " selected" : ""}>Non renseigné</option><!--[-->`);
      ssrRenderList(["A1", "A2", "B1", "B2", "C1", "C2"], (level) => {
        _push(`<option${ssrRenderAttr("value", level)} data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(draft).niveauCecrl) ? ssrLooseContain(unref(draft).niveauCecrl, level) : ssrLooseEqual(unref(draft).niveauCecrl, level)) ? " selected" : ""}>${ssrInterpolate(level)}</option>`);
      });
      _push(`<!--]--></select></label><label class="admin-field" data-v-3ef31023><span data-v-3ef31023>Registre *</span><select required data-v-3ef31023><option value="courant" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(draft).registrePrincipal) ? ssrLooseContain(unref(draft).registrePrincipal, "courant") : ssrLooseEqual(unref(draft).registrePrincipal, "courant")) ? " selected" : ""}>Courant</option><option value="familier" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(draft).registrePrincipal) ? ssrLooseContain(unref(draft).registrePrincipal, "familier") : ssrLooseEqual(unref(draft).registrePrincipal, "familier")) ? " selected" : ""}>Familier</option><option value="soutenu" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(draft).registrePrincipal) ? ssrLooseContain(unref(draft).registrePrincipal, "soutenu") : ssrLooseEqual(unref(draft).registrePrincipal, "soutenu")) ? " selected" : ""}>Soutenu</option><option value="rare" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(draft).registrePrincipal) ? ssrLooseContain(unref(draft).registrePrincipal, "rare") : ssrLooseEqual(unref(draft).registrePrincipal, "rare")) ? " selected" : ""}>Rare</option></select></label><label class="admin-field" data-v-3ef31023><span data-v-3ef31023>Forme canonique *</span><input${ssrRenderAttr("value", unref(draft).formeCanonique)} maxlength="255" required data-v-3ef31023></label><label class="admin-field" data-v-3ef31023><span data-v-3ef31023>Statut de validation</span><select data-v-3ef31023><option value="genere" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(draft).statutValidation) ? ssrLooseContain(unref(draft).statutValidation, "genere") : ssrLooseEqual(unref(draft).statutValidation, "genere")) ? " selected" : ""}>Généré</option><option value="a_verifier" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(draft).statutValidation) ? ssrLooseContain(unref(draft).statutValidation, "a_verifier") : ssrLooseEqual(unref(draft).statutValidation, "a_verifier")) ? " selected" : ""}>À vérifier</option><option value="valide" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(draft).statutValidation) ? ssrLooseContain(unref(draft).statutValidation, "valide") : ssrLooseEqual(unref(draft).statutValidation, "valide")) ? " selected" : ""}>Validé</option></select></label><label class="admin-field" data-v-3ef31023><span data-v-3ef31023>Niveaux scolaires</span><input${ssrRenderAttr("value", unref(draft).niveauxScolaires.join(", "))} placeholder="6P, 7H, 8H" data-v-3ef31023></label><label class="admin-field" data-v-3ef31023><span data-v-3ef31023>Parcours CIF</span><input${ssrRenderAttr("value", unref(draft).parcoursCif.join(", "))} placeholder="A1, A2" data-v-3ef31023></label><label class="admin-field verb-editor__definition" data-v-3ef31023><span data-v-3ef31023>Particularités</span><input${ssrRenderAttr("value", unref(draft).particularites.join(", "))} placeholder="ger, pronominal, formes-alternatives" data-v-3ef31023><small data-v-3ef31023>Séparez les étiquettes par des virgules.</small></label></div><div class="verb-editor__boolean-fields" data-v-3ef31023><label data-v-3ef31023><input${ssrIncludeBooleanAttr(Array.isArray(unref(draft).estImpersonnel) ? ssrLooseContain(unref(draft).estImpersonnel, null) : unref(draft).estImpersonnel) ? " checked" : ""} type="checkbox" data-v-3ef31023> Verbe impersonnel</label><label data-v-3ef31023><input${ssrIncludeBooleanAttr(Array.isArray(unref(draft).estDefectif) ? ssrLooseContain(unref(draft).estDefectif, null) : unref(draft).estDefectif) ? " checked" : ""} type="checkbox" data-v-3ef31023> Verbe défectif</label></div><fieldset class="verb-editor__semantic-fields" data-v-3ef31023><legend data-v-3ef31023>Catégories de sens</legend><!--[-->`);
      ssrRenderList(__props.detail.classificationOptions?.semanticCategories, (category) => {
        _push(`<label data-v-3ef31023><input${ssrIncludeBooleanAttr(Array.isArray(unref(draft).categoriesSemantiques) ? ssrLooseContain(unref(draft).categoriesSemantiques, category.slug) : unref(draft).categoriesSemantiques) ? " checked" : ""} type="checkbox"${ssrRenderAttr("value", category.slug)} data-v-3ef31023><span data-v-3ef31023>${ssrInterpolate(category.label)}</span></label>`);
      });
      _push(`<!--]--></fieldset></section><section class="verb-editor__complements" aria-labelledby="complements-title" data-v-3ef31023><div data-v-3ef31023><h2 id="complements-title" data-v-3ef31023>Compléments proposés dans les exercices</h2><p class="admin-muted" data-v-3ef31023> Ces fragments sont liés à un sens et à une construction validée du verbe. </p></div>`);
      if (unref(complementSuccess)) {
        _push(`<p class="admin-notice admin-notice--success" role="status" data-v-3ef31023>${ssrInterpolate(unref(complementSuccess))}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(complementError)) {
        _push(`<p class="admin-notice admin-notice--error" role="alert" data-v-3ef31023>${ssrInterpolate(unref(complementError))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(unref(complementGroups), (construction) => {
        _push(`<article data-v-3ef31023><header data-v-3ef31023><strong data-v-3ef31023>${ssrInterpolate(construction.fonctionObjet.toUpperCase())}</strong><span data-v-3ef31023>${ssrInterpolate(construction.patron)}</span><small data-v-3ef31023>${ssrInterpolate(construction.complements.length)} / 30 compléments</small></header>`);
        if (isCoi(construction)) {
          _push(`<div class="verb-editor__construction-settings" data-v-3ef31023><label data-v-3ef31023> Préposition <select${ssrRenderAttr("value", complementPreposition(construction))}${ssrIncludeBooleanAttr(Boolean(unref(complementBusy))) ? " disabled" : ""} data-v-3ef31023><option value="à" data-v-3ef31023>à</option><option value="de" data-v-3ef31023>de</option></select></label><small data-v-3ef31023>Cette préposition s’applique à toute la construction.</small></div>`);
        } else {
          _push(`<!---->`);
        }
        if (construction.complements.length) {
          _push(`<p class="verb-editor__sentence-preview" data-v-3ef31023> Exemple : il … ${ssrInterpolate(construction.complements[0]?.texte)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="verb-editor__complement-list" data-v-3ef31023><!--[-->`);
        ssrRenderList(construction.complements, (complement) => {
          _push(`<span class="verb-editor__complement-chip" data-v-3ef31023><span data-v-3ef31023>${ssrInterpolate(complement.texte)}</span>`);
          if (!isCoi(construction) && complement.genre && complement.nombre) {
            _push(`<span class="verb-editor__complement-grammar" data-v-3ef31023><button type="button"${ssrIncludeBooleanAttr(Boolean(unref(complementBusy))) ? " disabled" : ""}${ssrRenderAttr("title", complement.genre === "feminin" ? "Passer au masculin" : "Passer au féminin")}${ssrRenderAttr("aria-label", `${complement.texte} : ${complement.genre === "feminin" ? "féminin, passer au masculin" : "masculin, passer au féminin"}`)} data-v-3ef31023>${ssrInterpolate(complement.genre === "feminin" ? "fém." : "mas.")}</button><button type="button"${ssrIncludeBooleanAttr(Boolean(unref(complementBusy))) ? " disabled" : ""}${ssrRenderAttr("title", complement.nombre === "pluriel" ? "Passer au singulier" : "Passer au pluriel")}${ssrRenderAttr("aria-label", `${complement.texte} : ${complement.nombre === "pluriel" ? "pluriel, passer au singulier" : "singulier, passer au pluriel"}`)} data-v-3ef31023>${ssrInterpolate(complement.nombre === "pluriel" ? "plur." : "sing.")}</button></span>`);
          } else if (complement.genre && complement.nombre) {
            _push(`<small data-v-3ef31023>${ssrInterpolate(complement.genre === "feminin" ? "fém." : "mas.")} · ${ssrInterpolate(complement.nombre === "pluriel" ? "plur." : "sing.")}</small>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<button class="verb-editor__complement-delete" type="button"${ssrIncludeBooleanAttr(Boolean(unref(complementBusy))) ? " disabled" : ""}${ssrRenderAttr("title", `Supprimer « ${complement.texte} »`)}${ssrRenderAttr("aria-label", `Supprimer le complément ${complement.texte}`)} data-v-3ef31023><span aria-hidden="true" data-v-3ef31023>×</span></button></span>`);
        });
        _push(`<!--]--></div><div class="verb-editor__complement-add" data-v-3ef31023>`);
        if (isCoi(construction)) {
          _push(`<label class="verb-editor__nature-field" data-v-3ef31023> Nature du complément <select${ssrIncludeBooleanAttr(Boolean(unref(complementBusy))) ? " disabled" : ""} data-v-3ef31023><option value="nominal" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(complementNatures)[construction.id]) ? ssrLooseContain(unref(complementNatures)[construction.id], "nominal") : ssrLooseEqual(unref(complementNatures)[construction.id], "nominal")) ? " selected" : ""}>Groupe nominal</option><option value="infinitif" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(complementNatures)[construction.id]) ? ssrLooseContain(unref(complementNatures)[construction.id], "infinitif") : ssrLooseEqual(unref(complementNatures)[construction.id], "infinitif")) ? " selected" : ""}>Infinitif</option><option value="expression" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(complementNatures)[construction.id]) ? ssrLooseContain(unref(complementNatures)[construction.id], "expression") : ssrLooseEqual(unref(complementNatures)[construction.id], "expression")) ? " selected" : ""}>Expression figée</option></select></label>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<label${ssrRenderAttr("for", `complement-${construction.id}`)} data-v-3ef31023>${ssrInterpolate(isCoi(construction) ? "Complément sans préposition" : "Ajouter un complément")}</label><div data-v-3ef31023><input${ssrRenderAttr("id", `complement-${construction.id}`)}${ssrRenderAttr("value", unref(complementDrafts)[construction.id])} maxlength="180"${ssrRenderAttr("placeholder", complementPlaceholder(construction))}${ssrIncludeBooleanAttr(Boolean(unref(complementBusy)) || construction.complements.length >= 30) ? " disabled" : ""} data-v-3ef31023><button class="admin-button admin-button--small" type="button"${ssrIncludeBooleanAttr(Boolean(unref(complementBusy)) || !unref(complementDrafts)[construction.id]?.trim() || construction.complements.length >= 30 || isCoi(construction) && complementNature(construction.id) === "nominal" && !grammarComplete(grammarDraft(construction.id)) || !isCoi(construction) && unref(complementGrammarOpen)[construction.id] && !grammarComplete(grammarDraft(construction.id))) ? " disabled" : ""} data-v-3ef31023>${ssrInterpolate(unref(complementBusy) === `add:${construction.id}` ? "Ajout…" : "Ajouter")}</button></div>`);
        if (complementPreview(construction)) {
          _push(`<small class="verb-editor__complement-preview" data-v-3ef31023> Aperçu : <strong data-v-3ef31023>${ssrInterpolate(complementPreview(construction))}</strong></small>`);
        } else {
          _push(`<!---->`);
        }
        if (!isCoi(construction)) {
          _push(`<button class="verb-editor__grammar-toggle" type="button"${ssrRenderAttr("aria-expanded", Boolean(unref(complementGrammarOpen)[construction.id]))} data-v-3ef31023>${ssrInterpolate(unref(complementGrammarOpen)[construction.id] ? "Masquer le genre et le nombre" : "Préciser le genre et le nombre")}</button>`);
        } else {
          _push(`<!---->`);
        }
        if (isCoi(construction) && complementNature(construction.id) === "nominal" || !isCoi(construction) && unref(complementGrammarOpen)[construction.id]) {
          _push(`<div class="verb-editor__grammar-fields" data-v-3ef31023><label data-v-3ef31023> Genre <select${ssrIncludeBooleanAttr(Boolean(unref(complementBusy))) ? " disabled" : ""} data-v-3ef31023><option value="" disabled data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(grammarDraft(construction.id).gender) ? ssrLooseContain(grammarDraft(construction.id).gender, "") : ssrLooseEqual(grammarDraft(construction.id).gender, "")) ? " selected" : ""}>À choisir</option><option value="masculin" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(grammarDraft(construction.id).gender) ? ssrLooseContain(grammarDraft(construction.id).gender, "masculin") : ssrLooseEqual(grammarDraft(construction.id).gender, "masculin")) ? " selected" : ""}>Masculin</option><option value="feminin" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(grammarDraft(construction.id).gender) ? ssrLooseContain(grammarDraft(construction.id).gender, "feminin") : ssrLooseEqual(grammarDraft(construction.id).gender, "feminin")) ? " selected" : ""}>Féminin</option></select></label><label data-v-3ef31023> Nombre <select${ssrIncludeBooleanAttr(Boolean(unref(complementBusy))) ? " disabled" : ""} data-v-3ef31023><option value="" disabled data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(grammarDraft(construction.id).number) ? ssrLooseContain(grammarDraft(construction.id).number, "") : ssrLooseEqual(grammarDraft(construction.id).number, "")) ? " selected" : ""}>À choisir</option><option value="singulier" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(grammarDraft(construction.id).number) ? ssrLooseContain(grammarDraft(construction.id).number, "singulier") : ssrLooseEqual(grammarDraft(construction.id).number, "singulier")) ? " selected" : ""}>Singulier</option><option value="pluriel" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(grammarDraft(construction.id).number) ? ssrLooseContain(grammarDraft(construction.id).number, "pluriel") : ssrLooseEqual(grammarDraft(construction.id).number, "pluriel")) ? " selected" : ""}>Pluriel</option></select></label></div>`);
        } else {
          _push(`<!---->`);
        }
        if (isCoi(construction) && complementNature(construction.id) === "nominal") {
          _push(`<small class="admin-muted" data-v-3ef31023> Le genre et le nombre permettent de construire correctement « auquel », « à laquelle », « auxquels » ou « auxquelles ». </small>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></article>`);
      });
      _push(`<!--]-->`);
      if (!unref(hasCodConstruction)) {
        _push(`<article class="verb-editor__empty-complements" data-v-3ef31023><p class="admin-muted" data-v-3ef31023>Aucun COD validé pour ce verbe.</p><div class="verb-editor__complement-add" data-v-3ef31023><label${ssrRenderAttr("for", `first-complement-${__props.detail.verb.id}`)} data-v-3ef31023>Ajouter un premier complément COD</label><div data-v-3ef31023><input${ssrRenderAttr("id", `first-complement-${__props.detail.verb.id}`)}${ssrRenderAttr("value", unref(firstComplementDraft))} maxlength="180" placeholder="Ex. une proposition"${ssrIncludeBooleanAttr(Boolean(unref(complementBusy))) ? " disabled" : ""} data-v-3ef31023><button class="admin-button admin-button--small" type="button"${ssrIncludeBooleanAttr(Boolean(unref(complementBusy)) || !unref(firstComplementDraft).trim() || unref(firstComplementGrammarOpen) && !grammarComplete(unref(firstComplementGrammar))) ? " disabled" : ""} data-v-3ef31023>${ssrInterpolate(unref(complementBusy) === "add:new" ? "Création…" : "Créer la liste COD")}</button></div><button class="verb-editor__grammar-toggle" type="button"${ssrRenderAttr("aria-expanded", unref(firstComplementGrammarOpen))} data-v-3ef31023>${ssrInterpolate(unref(firstComplementGrammarOpen) ? "Masquer le genre et le nombre" : "Préciser le genre et le nombre")}</button>`);
        if (unref(firstComplementGrammarOpen)) {
          _push(`<div class="verb-editor__grammar-fields" data-v-3ef31023><label data-v-3ef31023> Genre <select${ssrIncludeBooleanAttr(Boolean(unref(complementBusy))) ? " disabled" : ""} data-v-3ef31023><option value="" disabled data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(firstComplementGrammar).gender) ? ssrLooseContain(unref(firstComplementGrammar).gender, "") : ssrLooseEqual(unref(firstComplementGrammar).gender, "")) ? " selected" : ""}>À choisir</option><option value="masculin" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(firstComplementGrammar).gender) ? ssrLooseContain(unref(firstComplementGrammar).gender, "masculin") : ssrLooseEqual(unref(firstComplementGrammar).gender, "masculin")) ? " selected" : ""}>Masculin</option><option value="feminin" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(firstComplementGrammar).gender) ? ssrLooseContain(unref(firstComplementGrammar).gender, "feminin") : ssrLooseEqual(unref(firstComplementGrammar).gender, "feminin")) ? " selected" : ""}>Féminin</option></select></label><label data-v-3ef31023> Nombre <select${ssrIncludeBooleanAttr(Boolean(unref(complementBusy))) ? " disabled" : ""} data-v-3ef31023><option value="" disabled data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(firstComplementGrammar).number) ? ssrLooseContain(unref(firstComplementGrammar).number, "") : ssrLooseEqual(unref(firstComplementGrammar).number, "")) ? " selected" : ""}>À choisir</option><option value="singulier" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(firstComplementGrammar).number) ? ssrLooseContain(unref(firstComplementGrammar).number, "singulier") : ssrLooseEqual(unref(firstComplementGrammar).number, "singulier")) ? " selected" : ""}>Singulier</option><option value="pluriel" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(firstComplementGrammar).number) ? ssrLooseContain(unref(firstComplementGrammar).number, "pluriel") : ssrLooseEqual(unref(firstComplementGrammar).number, "pluriel")) ? " selected" : ""}>Pluriel</option></select></label></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></article>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<article class="verb-editor__new-coi" data-v-3ef31023><header data-v-3ef31023><strong data-v-3ef31023>Ajouter des COI</strong><span data-v-3ef31023>Une construction avec « à » ou « de » sera créée si nécessaire.</span></header><div class="verb-editor__complement-add" data-v-3ef31023><div class="verb-editor__new-coi-settings" data-v-3ef31023><label data-v-3ef31023> Préposition <select${ssrIncludeBooleanAttr(Boolean(unref(complementBusy))) ? " disabled" : ""} data-v-3ef31023><option value="à" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(newCoiPreposition)) ? ssrLooseContain(unref(newCoiPreposition), "à") : ssrLooseEqual(unref(newCoiPreposition), "à")) ? " selected" : ""}>à</option><option value="de" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(newCoiPreposition)) ? ssrLooseContain(unref(newCoiPreposition), "de") : ssrLooseEqual(unref(newCoiPreposition), "de")) ? " selected" : ""}>de</option></select></label><label data-v-3ef31023> Nature du complément <select${ssrIncludeBooleanAttr(Boolean(unref(complementBusy))) ? " disabled" : ""} data-v-3ef31023><option value="nominal" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(newCoiNature)) ? ssrLooseContain(unref(newCoiNature), "nominal") : ssrLooseEqual(unref(newCoiNature), "nominal")) ? " selected" : ""}>Groupe nominal</option><option value="infinitif" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(newCoiNature)) ? ssrLooseContain(unref(newCoiNature), "infinitif") : ssrLooseEqual(unref(newCoiNature), "infinitif")) ? " selected" : ""}>Infinitif</option><option value="expression" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(newCoiNature)) ? ssrLooseContain(unref(newCoiNature), "expression") : ssrLooseEqual(unref(newCoiNature), "expression")) ? " selected" : ""}>Expression figée</option></select></label></div><label${ssrRenderAttr("for", `new-coi-${__props.detail.verb.id}`)} data-v-3ef31023>Complément sans préposition</label><div data-v-3ef31023><input${ssrRenderAttr("id", `new-coi-${__props.detail.verb.id}`)}${ssrRenderAttr("value", unref(newCoiDraft))} maxlength="180"${ssrRenderAttr("placeholder", unref(newCoiNature) === "infinitif" ? "Ex. réussir cet exercice" : unref(newCoiNature) === "expression" ? "Ex. cache-cache" : "Ex. ses amis")}${ssrIncludeBooleanAttr(Boolean(unref(complementBusy))) ? " disabled" : ""} data-v-3ef31023><button class="admin-button admin-button--small" type="button"${ssrIncludeBooleanAttr(Boolean(unref(complementBusy)) || !unref(newCoiDraft).trim() || unref(newCoiNature) === "nominal" && !grammarComplete(unref(newCoiGrammar))) ? " disabled" : ""} data-v-3ef31023>${ssrInterpolate(unref(complementBusy) === "add:new-coi" ? "Ajout…" : "Ajouter le COI")}</button></div>`);
      if (unref(newCoiPreview)) {
        _push(`<small class="verb-editor__complement-preview" data-v-3ef31023> Aperçu : <strong data-v-3ef31023>${ssrInterpolate(unref(newCoiPreview))}</strong></small>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(newCoiNature) === "nominal") {
        _push(`<div class="verb-editor__grammar-fields" data-v-3ef31023><label data-v-3ef31023> Genre <select${ssrIncludeBooleanAttr(Boolean(unref(complementBusy))) ? " disabled" : ""} data-v-3ef31023><option value="" disabled data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(newCoiGrammar).gender) ? ssrLooseContain(unref(newCoiGrammar).gender, "") : ssrLooseEqual(unref(newCoiGrammar).gender, "")) ? " selected" : ""}>À choisir</option><option value="masculin" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(newCoiGrammar).gender) ? ssrLooseContain(unref(newCoiGrammar).gender, "masculin") : ssrLooseEqual(unref(newCoiGrammar).gender, "masculin")) ? " selected" : ""}>Masculin</option><option value="feminin" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(newCoiGrammar).gender) ? ssrLooseContain(unref(newCoiGrammar).gender, "feminin") : ssrLooseEqual(unref(newCoiGrammar).gender, "feminin")) ? " selected" : ""}>Féminin</option></select></label><label data-v-3ef31023> Nombre <select${ssrIncludeBooleanAttr(Boolean(unref(complementBusy))) ? " disabled" : ""} data-v-3ef31023><option value="" disabled data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(newCoiGrammar).number) ? ssrLooseContain(unref(newCoiGrammar).number, "") : ssrLooseEqual(unref(newCoiGrammar).number, "")) ? " selected" : ""}>À choisir</option><option value="singulier" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(newCoiGrammar).number) ? ssrLooseContain(unref(newCoiGrammar).number, "singulier") : ssrLooseEqual(unref(newCoiGrammar).number, "singulier")) ? " selected" : ""}>Singulier</option><option value="pluriel" data-v-3ef31023${ssrIncludeBooleanAttr(Array.isArray(unref(newCoiGrammar).number) ? ssrLooseContain(unref(newCoiGrammar).number, "pluriel") : ssrLooseEqual(unref(newCoiGrammar).number, "pluriel")) ? " selected" : ""}>Pluriel</option></select></label></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(newCoiNature) === "nominal") {
        _push(`<small class="admin-muted" data-v-3ef31023> Ces informations permettent notamment de produire « auquel », « à laquelle », « auxquels » ou « auxquelles ». </small>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></article></section><section class="verb-editor__conjugations" aria-labelledby="conjugations-title" data-v-3ef31023><div class="verb-editor__grid-heading" data-v-3ef31023><div data-v-3ef31023><h2 id="conjugations-title" data-v-3ef31023>Grille des conjugaisons</h2><p class="admin-muted" data-v-3ef31023> La première forme est la réponse principale. Les formes 2 et 3 sont des variantes acceptées. </p></div><span class="${ssrRenderClass(["verb-editor__state", { "is-dirty": unref(dirty) }])}" data-v-3ef31023>${ssrInterpolate(unref(dirty) ? "Modifications non enregistrées" : "À jour")}</span></div><nav class="verb-editor__mode-nav" aria-label="Accès rapide aux modes" data-v-3ef31023><!--[-->`);
      ssrRenderList(unref(groups), (group) => {
        _push(`<a${ssrRenderAttr("href", `#${modeAnchor(group.mode.name)}`)} data-v-3ef31023>${ssrInterpolate(group.mode.name)}</a>`);
      });
      _push(`<!--]--><a href="#mode-participe" data-v-3ef31023>Participe</a><a href="#mode-infinitif" data-v-3ef31023>Infinitif</a><a href="#mode-gerondif" data-v-3ef31023>Gérondif</a></nav><!--[-->`);
      ssrRenderList(unref(groups), (group) => {
        _push(`<section${ssrRenderAttr("id", modeAnchor(group.mode.name))} class="verb-editor__mode" data-v-3ef31023><header class="verb-editor__mode-heading" data-v-3ef31023><h2 data-v-3ef31023>${ssrInterpolate(group.mode.name)}</h2><small data-v-3ef31023>${ssrInterpolate(group.tenses.length)} temps</small></header><div class="verb-editor__tenses" data-v-3ef31023><!--[-->`);
        ssrRenderList(group.tenses, (tense) => {
          _push(`<article class="tense-card" data-v-3ef31023><header data-v-3ef31023><h3 data-v-3ef31023>${ssrInterpolate(unref(conjugationTenseLabel)(group.mode.name, tense.name))}</h3>`);
          if (tense.isCompound) {
            _push(`<span data-v-3ef31023>Composé</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</header><div class="tense-card__table-wrap" data-v-3ef31023><table data-v-3ef31023><thead data-v-3ef31023><tr data-v-3ef31023><th scope="col" data-v-3ef31023>Personne</th><th scope="col" data-v-3ef31023>Forme principale</th><th scope="col" data-v-3ef31023>Variante 2</th><th scope="col" data-v-3ef31023>Variante 3</th></tr></thead><tbody data-v-3ef31023><!--[-->`);
          ssrRenderList(tense.rows, (row) => {
            _push(`<tr data-v-3ef31023><th scope="row"${ssrRenderAttr("title", row.person.label)} data-v-3ef31023>${ssrInterpolate(row.person.short)}</th>`);
            if (row.conjugation) {
              _push(`<!--[--><td data-v-3ef31023><input${ssrRenderAttr("value", row.conjugation.conjugaison1)} maxlength="255"${ssrRenderAttr("aria-label", `${tense.name}, ${row.person.label}, forme principale`)} data-v-3ef31023></td><td data-v-3ef31023><input${ssrRenderAttr("value", row.conjugation.conjugaison2)} maxlength="255"${ssrRenderAttr("aria-label", `${tense.name}, ${row.person.label}, variante 2`)} data-v-3ef31023></td><td data-v-3ef31023><input${ssrRenderAttr("value", row.conjugation.conjugaison3)} maxlength="255"${ssrRenderAttr("aria-label", `${tense.name}, ${row.person.label}, variante 3`)} data-v-3ef31023></td><!--]-->`);
            } else {
              _push(`<!---->`);
            }
            _push(`</tr>`);
          });
          _push(`<!--]--></tbody></table></div></article>`);
        });
        _push(`<!--]--></div></section>`);
      });
      _push(`<!--]--><section class="verb-editor__non-finite" aria-labelledby="non-finite-title" data-v-3ef31023><header data-v-3ef31023><h2 id="non-finite-title" data-v-3ef31023>Formes non personnelles</h2><p class="admin-muted" data-v-3ef31023>Participe, infinitif et gérondif, dans l’ordre du site de référence.</p></header><div class="verb-editor__non-finite-grid" data-v-3ef31023><article id="mode-participe" data-v-3ef31023><h3 data-v-3ef31023>Participe</h3><label class="admin-field" data-v-3ef31023><span data-v-3ef31023>Présent</span><input${ssrRenderAttr("value", unref(draft).participePresent)} maxlength="255" data-v-3ef31023></label><label class="admin-field" data-v-3ef31023><span data-v-3ef31023>Passé</span><input${ssrRenderAttr("value", unref(draft).participePasse)} maxlength="255" data-v-3ef31023></label></article><article id="mode-infinitif" data-v-3ef31023><h3 data-v-3ef31023>Infinitif</h3><label class="admin-field" data-v-3ef31023><span data-v-3ef31023>Présent</span><input${ssrRenderAttr("value", unref(draft).infinitif)} readonly data-v-3ef31023></label><label class="admin-field" data-v-3ef31023><span data-v-3ef31023>Passé généré</span><input${ssrRenderAttr("value", unref(nonFiniteForms).infinitivePast)} readonly data-v-3ef31023></label></article><article id="mode-gerondif" data-v-3ef31023><h3 data-v-3ef31023>Gérondif</h3><label class="admin-field" data-v-3ef31023><span data-v-3ef31023>Présent généré</span><input${ssrRenderAttr("value", unref(nonFiniteForms).gerundPresent)} readonly data-v-3ef31023></label><label class="admin-field" data-v-3ef31023><span data-v-3ef31023>Passé généré</span><input${ssrRenderAttr("value", unref(nonFiniteForms).gerundPast)} readonly data-v-3ef31023></label></article></div></section></section><div class="verb-editor__footer" data-v-3ef31023><span class="${ssrRenderClass(["verb-editor__state", { "is-dirty": unref(dirty) }])}" data-v-3ef31023>${ssrInterpolate(unref(dirty) ? "Modifications non enregistrées" : "À jour")}</span><button class="admin-button admin-button--primary" type="submit"${ssrIncludeBooleanAttr(__props.saving || !unref(dirty) || !unref(isValid)) ? " disabled" : ""} data-v-3ef31023>${ssrInterpolate(__props.saving ? "Enregistrement…" : "Enregistrer le verbe")}</button></div></form>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/VerbEditor.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const AdminVerbEditor = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-3ef31023"]]), { __name: "AdminVerbEditor" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { user, handleUnauthorized } = useAdminAuth();
    const catalogue = ref({ verbes: [], modes: [], temps: [] });
    const catalogueLoading = ref(false);
    const catalogueError = ref("");
    const selectedId = ref(null);
    const detail = ref(null);
    const detailLoading = ref(false);
    const detailError = ref("");
    const saveError = ref("");
    const saveSuccess = ref("");
    const saving = ref(false);
    const creating = ref(false);
    const createError = ref("");
    const showCreate = ref(false);
    const editorDirty = ref(false);
    let detailRequest = 0;
    let loadedForUserId = null;
    useHead({ title: "Administration des verbes" });
    async function fetchCatalogue(loadSelection = true) {
      catalogueLoading.value = true;
      catalogueError.value = "";
      try {
        const [response, reviewResponse] = await Promise.all([
          $fetch("/api/catalogue", { credentials: "same-origin" }),
          $fetch("/api/admin/coach-help-verb-reviews", { credentials: "same-origin" })
        ]);
        const reviewByVerb = new Map(reviewResponse.reviews.map((review) => [review.verbId, review.status]));
        catalogue.value = {
          verbes: response.verbes.filter((verb) => verb.id > 0).map((verb) => ({
            ...verb,
            helpReviewStatus: reviewByVerb.get(verb.id) || null
          })).sort((a, b) => a.infinitif.localeCompare(b.infinitif, "fr")),
          modes: [...response.modes].sort((a, b) => a.order - b.order || a.id - b.id),
          temps: [...response.temps]
        };
        if (loadSelection) {
          const selectedStillExists = catalogue.value.verbes.some((verb) => verb.id === selectedId.value);
          const nextId = selectedStillExists ? selectedId.value : catalogue.value.verbes[0]?.id ?? null;
          if (nextId) {
            await loadVerb(nextId);
          } else {
            selectedId.value = null;
            detail.value = null;
          }
        }
      } catch (error) {
        if (!handleUnauthorized(error)) {
          catalogueError.value = getAdminErrorMessage(error, "Impossible de charger le catalogue.");
        }
      } finally {
        catalogueLoading.value = false;
      }
    }
    async function loadVerb(id) {
      const request = ++detailRequest;
      selectedId.value = id;
      detailLoading.value = true;
      detailError.value = "";
      saveError.value = "";
      saveSuccess.value = "";
      try {
        const response = await $fetch(`/api/admin/verbes/${id}`, {
          credentials: "same-origin"
        });
        if (request === detailRequest) {
          detail.value = response;
          editorDirty.value = false;
        }
      } catch (error) {
        if (request === detailRequest && !handleUnauthorized(error)) {
          detail.value = null;
          detailError.value = getAdminErrorMessage(error, "Impossible de charger ce verbe.");
        }
      } finally {
        if (request === detailRequest) {
          detailLoading.value = false;
        }
      }
    }
    function mayDiscardChanges() {
      return !editorDirty.value || (void 0).confirm("Abandonner les modifications non enregistrées ?");
    }
    function selectVerb(id) {
      if (id === selectedId.value && detail.value && !showCreate.value) {
        return;
      }
      if (!mayDiscardChanges()) {
        return;
      }
      showCreate.value = false;
      createError.value = "";
      void loadVerb(id);
    }
    function openCreateForm() {
      if (!mayDiscardChanges()) {
        return;
      }
      showCreate.value = true;
      createError.value = "";
      saveError.value = "";
      saveSuccess.value = "";
    }
    function closeCreateForm() {
      showCreate.value = false;
      createError.value = "";
    }
    async function createVerb(payload) {
      if (creating.value) {
        return;
      }
      creating.value = true;
      createError.value = "";
      try {
        const response = await $fetch("/api/admin/verbes", {
          method: "POST",
          credentials: "same-origin",
          body: payload
        });
        showCreate.value = false;
        await fetchCatalogue(false);
        await loadVerb(response.id);
        saveSuccess.value = `Le verbe « ${payload.infinitif} » a été créé. Vous pouvez maintenant compléter sa grille.`;
      } catch (error) {
        if (!handleUnauthorized(error)) {
          createError.value = getAdminErrorMessage(error, "Impossible de créer ce verbe.");
        }
      } finally {
        creating.value = false;
      }
    }
    async function saveVerb(payload) {
      const id = selectedId.value;
      if (!id || saving.value) {
        return;
      }
      saving.value = true;
      saveError.value = "";
      saveSuccess.value = "";
      try {
        await $fetch(`/api/admin/verbes/${id}`, {
          method: "PUT",
          credentials: "same-origin",
          body: payload
        });
        editorDirty.value = false;
        await fetchCatalogue(false);
        await loadVerb(id);
        saveSuccess.value = `Le verbe « ${payload.infinitif} » a été enregistré.`;
      } catch (error) {
        if (!handleUnauthorized(error)) {
          saveError.value = getAdminErrorMessage(error, "Impossible d’enregistrer ce verbe.");
        }
      } finally {
        saving.value = false;
      }
    }
    watch(user, (currentUser) => {
      if (!currentUser) {
        loadedForUserId = null;
        return;
      }
      if (loadedForUserId !== currentUser.id) {
        loadedForUserId = currentUser.id;
        void fetchCatalogue();
      }
    }, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminAuthBoundary = __nuxt_component_0;
      const _component_AdminShell = __nuxt_component_1;
      _push(ssrRenderComponent(_component_AdminAuthBoundary, _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_AdminShell, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="admin-home" data-v-009a1249${_scopeId2}><header class="admin-section-heading admin-home__heading" data-v-009a1249${_scopeId2}><div data-v-009a1249${_scopeId2}><p class="admin-eyebrow" data-v-009a1249${_scopeId2}>Données de conjugaison</p><h1 data-v-009a1249${_scopeId2}>Gestion des verbes</h1><p class="admin-muted" data-v-009a1249${_scopeId2}> Modifiez les fiches, les formes conjuguées et les variantes acceptées. </p></div></header>`);
                  if (unref(catalogueError)) {
                    _push3(`<p class="admin-notice admin-notice--error" role="alert" data-v-009a1249${_scopeId2}>${ssrInterpolate(unref(catalogueError))} <button class="admin-button admin-button--small" type="button" data-v-009a1249${_scopeId2}> Réessayer </button></p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`<div class="admin-home__workspace" data-v-009a1249${_scopeId2}>`);
                  _push3(ssrRenderComponent(AdminVerbCatalogue, {
                    verbs: unref(catalogue).verbes,
                    "selected-id": unref(selectedId),
                    loading: unref(catalogueLoading),
                    onSelect: selectVerb,
                    onCreate: openCreateForm
                  }, null, _parent3, _scopeId2));
                  _push3(`<div class="admin-home__editor" data-v-009a1249${_scopeId2}>`);
                  if (unref(showCreate)) {
                    _push3(ssrRenderComponent(AdminNewVerbForm, {
                      saving: unref(creating),
                      error: unref(createError),
                      onCreate: createVerb,
                      onCancel: closeCreateForm
                    }, null, _parent3, _scopeId2));
                  } else if (unref(detailLoading)) {
                    _push3(`<div class="admin-home__placeholder" role="status" data-v-009a1249${_scopeId2}><span class="admin-spinner" aria-hidden="true" data-v-009a1249${_scopeId2}></span><p data-v-009a1249${_scopeId2}>Chargement du verbe…</p></div>`);
                  } else if (unref(detailError)) {
                    _push3(`<div class="admin-home__placeholder" data-v-009a1249${_scopeId2}><p class="admin-notice admin-notice--error" role="alert" data-v-009a1249${_scopeId2}>${ssrInterpolate(unref(detailError))}</p>`);
                    if (unref(selectedId)) {
                      _push3(`<button class="admin-button" type="button" data-v-009a1249${_scopeId2}> Réessayer </button>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`</div>`);
                  } else if (unref(detail)) {
                    _push3(ssrRenderComponent(AdminVerbEditor, {
                      detail: unref(detail),
                      modes: unref(catalogue).modes,
                      tenses: unref(catalogue).temps,
                      saving: unref(saving),
                      error: unref(saveError),
                      success: unref(saveSuccess),
                      onSave: saveVerb,
                      onDirtyChange: ($event) => editorDirty.value = $event
                    }, null, _parent3, _scopeId2));
                  } else {
                    _push3(`<div class="admin-home__placeholder" data-v-009a1249${_scopeId2}><p class="admin-muted" data-v-009a1249${_scopeId2}>Sélectionnez un verbe dans le catalogue ou créez-en un nouveau.</p></div>`);
                  }
                  _push3(`</div></div></div>`);
                } else {
                  return [
                    createVNode("div", { class: "admin-home" }, [
                      createVNode("header", { class: "admin-section-heading admin-home__heading" }, [
                        createVNode("div", null, [
                          createVNode("p", { class: "admin-eyebrow" }, "Données de conjugaison"),
                          createVNode("h1", null, "Gestion des verbes"),
                          createVNode("p", { class: "admin-muted" }, " Modifiez les fiches, les formes conjuguées et les variantes acceptées. ")
                        ])
                      ]),
                      unref(catalogueError) ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "admin-notice admin-notice--error",
                        role: "alert"
                      }, [
                        createTextVNode(toDisplayString(unref(catalogueError)) + " ", 1),
                        createVNode("button", {
                          class: "admin-button admin-button--small",
                          type: "button",
                          onClick: ($event) => fetchCatalogue()
                        }, " Réessayer ", 8, ["onClick"])
                      ])) : createCommentVNode("", true),
                      createVNode("div", { class: "admin-home__workspace" }, [
                        createVNode(AdminVerbCatalogue, {
                          verbs: unref(catalogue).verbes,
                          "selected-id": unref(selectedId),
                          loading: unref(catalogueLoading),
                          onSelect: selectVerb,
                          onCreate: openCreateForm
                        }, null, 8, ["verbs", "selected-id", "loading"]),
                        createVNode("div", { class: "admin-home__editor" }, [
                          unref(showCreate) ? (openBlock(), createBlock(AdminNewVerbForm, {
                            key: 0,
                            saving: unref(creating),
                            error: unref(createError),
                            onCreate: createVerb,
                            onCancel: closeCreateForm
                          }, null, 8, ["saving", "error"])) : unref(detailLoading) ? (openBlock(), createBlock("div", {
                            key: 1,
                            class: "admin-home__placeholder",
                            role: "status"
                          }, [
                            createVNode("span", {
                              class: "admin-spinner",
                              "aria-hidden": "true"
                            }),
                            createVNode("p", null, "Chargement du verbe…")
                          ])) : unref(detailError) ? (openBlock(), createBlock("div", {
                            key: 2,
                            class: "admin-home__placeholder"
                          }, [
                            createVNode("p", {
                              class: "admin-notice admin-notice--error",
                              role: "alert"
                            }, toDisplayString(unref(detailError)), 1),
                            unref(selectedId) ? (openBlock(), createBlock("button", {
                              key: 0,
                              class: "admin-button",
                              type: "button",
                              onClick: ($event) => loadVerb(unref(selectedId))
                            }, " Réessayer ", 8, ["onClick"])) : createCommentVNode("", true)
                          ])) : unref(detail) ? (openBlock(), createBlock(AdminVerbEditor, {
                            key: 3,
                            detail: unref(detail),
                            modes: unref(catalogue).modes,
                            tenses: unref(catalogue).temps,
                            saving: unref(saving),
                            error: unref(saveError),
                            success: unref(saveSuccess),
                            onSave: saveVerb,
                            onDirtyChange: ($event) => editorDirty.value = $event
                          }, null, 8, ["detail", "modes", "tenses", "saving", "error", "success", "onDirtyChange"])) : (openBlock(), createBlock("div", {
                            key: 4,
                            class: "admin-home__placeholder"
                          }, [
                            createVNode("p", { class: "admin-muted" }, "Sélectionnez un verbe dans le catalogue ou créez-en un nouveau.")
                          ]))
                        ])
                      ])
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_AdminShell, null, {
                default: withCtx(() => [
                  createVNode("div", { class: "admin-home" }, [
                    createVNode("header", { class: "admin-section-heading admin-home__heading" }, [
                      createVNode("div", null, [
                        createVNode("p", { class: "admin-eyebrow" }, "Données de conjugaison"),
                        createVNode("h1", null, "Gestion des verbes"),
                        createVNode("p", { class: "admin-muted" }, " Modifiez les fiches, les formes conjuguées et les variantes acceptées. ")
                      ])
                    ]),
                    unref(catalogueError) ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "admin-notice admin-notice--error",
                      role: "alert"
                    }, [
                      createTextVNode(toDisplayString(unref(catalogueError)) + " ", 1),
                      createVNode("button", {
                        class: "admin-button admin-button--small",
                        type: "button",
                        onClick: ($event) => fetchCatalogue()
                      }, " Réessayer ", 8, ["onClick"])
                    ])) : createCommentVNode("", true),
                    createVNode("div", { class: "admin-home__workspace" }, [
                      createVNode(AdminVerbCatalogue, {
                        verbs: unref(catalogue).verbes,
                        "selected-id": unref(selectedId),
                        loading: unref(catalogueLoading),
                        onSelect: selectVerb,
                        onCreate: openCreateForm
                      }, null, 8, ["verbs", "selected-id", "loading"]),
                      createVNode("div", { class: "admin-home__editor" }, [
                        unref(showCreate) ? (openBlock(), createBlock(AdminNewVerbForm, {
                          key: 0,
                          saving: unref(creating),
                          error: unref(createError),
                          onCreate: createVerb,
                          onCancel: closeCreateForm
                        }, null, 8, ["saving", "error"])) : unref(detailLoading) ? (openBlock(), createBlock("div", {
                          key: 1,
                          class: "admin-home__placeholder",
                          role: "status"
                        }, [
                          createVNode("span", {
                            class: "admin-spinner",
                            "aria-hidden": "true"
                          }),
                          createVNode("p", null, "Chargement du verbe…")
                        ])) : unref(detailError) ? (openBlock(), createBlock("div", {
                          key: 2,
                          class: "admin-home__placeholder"
                        }, [
                          createVNode("p", {
                            class: "admin-notice admin-notice--error",
                            role: "alert"
                          }, toDisplayString(unref(detailError)), 1),
                          unref(selectedId) ? (openBlock(), createBlock("button", {
                            key: 0,
                            class: "admin-button",
                            type: "button",
                            onClick: ($event) => loadVerb(unref(selectedId))
                          }, " Réessayer ", 8, ["onClick"])) : createCommentVNode("", true)
                        ])) : unref(detail) ? (openBlock(), createBlock(AdminVerbEditor, {
                          key: 3,
                          detail: unref(detail),
                          modes: unref(catalogue).modes,
                          tenses: unref(catalogue).temps,
                          saving: unref(saving),
                          error: unref(saveError),
                          success: unref(saveSuccess),
                          onSave: saveVerb,
                          onDirtyChange: ($event) => editorDirty.value = $event
                        }, null, 8, ["detail", "modes", "tenses", "saving", "error", "success", "onDirtyChange"])) : (openBlock(), createBlock("div", {
                          key: 4,
                          class: "admin-home__placeholder"
                        }, [
                          createVNode("p", { class: "admin-muted" }, "Sélectionnez un verbe dans le catalogue ou créez-en un nouveau.")
                        ]))
                      ])
                    ])
                  ])
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-009a1249"]]);

export { index as default };
//# sourceMappingURL=index-CLdvB-Pz.mjs.map
