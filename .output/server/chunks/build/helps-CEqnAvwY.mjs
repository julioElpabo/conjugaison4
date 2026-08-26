import { _ as __nuxt_component_0, a as __nuxt_component_1 } from './AdminShell-Uralqobm.mjs';
import { _ as __nuxt_component_0$1 } from './nuxt-link-icjx6oE7.mjs';
import { defineComponent, ref, computed, watch, withCtx, unref, createTextVNode, createVNode, toDisplayString, openBlock, createBlock, createCommentVNode, Fragment, renderList, withDirectives, vModelText, withModifiers, mergeProps, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderList, ssrRenderClass, ssrRenderAttr, ssrRenderAttrs } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { v as visibleCoachHelpBlocks, a as automaticCoachHelpApproach, _ as __nuxt_component_0$2, c as coachHelpQuestionVariables, b as conditionalCoachHelpBlocks, r as renderCoachHelpContent, s as sanitizeCoachHtml } from './CoachHelpPanel-BQHM-KrB.mjs';
import { m as matchingVerbs, n as normalizeVerbSearch } from '../_/verb-search.mjs';
import { b as buildRadicalReference } from '../_/radical-reference.mjs';
import { c as coachHelpProfile } from '../_/coach-help-audit.mjs';
import { u as useAdminAuth, g as getAdminErrorMessage } from './useAdminAuth-BdfYT3Lh.mjs';
import { g as useRoute, f as useLanguagePreferences, u as useHead, n as navigateTo } from './server.mjs';
import '../nitro/nitro.mjs';
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
import '@fortawesome/free-solid-svg-icons';
import '@fortawesome/vue-fontawesome';
import '../_/coach.mjs';
import '../_/near-future.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';

function randomIndex(length, random) {
  return Math.min(length - 1, Math.max(0, Math.floor(random() * length)));
}
function shuffled(values, random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = randomIndex(index + 1, random);
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}
function randomConjugationPreviews(modes, tenses, conjugations, count = 4, random = Math.random) {
  const availableFormsByTense = /* @__PURE__ */ new Map();
  for (const form of conjugations) {
    if (!form.conjugaison1.trim()) continue;
    const forms = availableFormsByTense.get(form.tenseId) || [];
    forms.push(form);
    availableFormsByTense.set(form.tenseId, forms);
  }
  const availableModes = modes.map((mode) => ({
    mode,
    tenses: tenses.filter((tense) => tense.modeId === mode.id && availableFormsByTense.has(tense.id))
  })).filter((candidate) => candidate.tenses.length > 0);
  return shuffled(availableModes, random).slice(0, count).map(({ mode, tenses: modeTenses }) => {
    const tense = modeTenses[randomIndex(modeTenses.length, random)];
    const forms = availableFormsByTense.get(tense.id);
    const form = forms[randomIndex(forms.length, random)];
    return {
      modeName: mode.name,
      tenseName: tense.name,
      pronoun: form.pronom
    };
  });
}

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "CustomSelect",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    options: {},
    label: {},
    placeholder: {},
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const root = ref(null);
    const open = ref(false);
    const activeIndex = ref(-1);
    const selectedOption = computed(() => props.options.find((option) => option.value === props.modelValue));
    const groupedOptions = computed(() => {
      const groups = /* @__PURE__ */ new Map();
      props.options.forEach((option, index) => {
        const group = option.group || "";
        const items = groups.get(group) || [];
        items.push({ option, index });
        groups.set(group, items);
      });
      return [...groups].map(([label, items]) => ({ label, items }));
    });
    function close() {
      open.value = false;
      activeIndex.value = -1;
    }
    watch(() => props.options, (options) => {
      if (!options.length) close();
      else if (activeIndex.value >= options.length) activeIndex.value = 0;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        ref_key: "root",
        ref: root,
        class: ["admin-custom-select", { "is-open": unref(open), "is-disabled": __props.disabled }]
      }, _attrs))} data-v-833a5525><span class="admin-custom-select__label" data-v-833a5525>${ssrInterpolate(__props.label)}</span><button type="button" class="admin-custom-select__trigger"${ssrIncludeBooleanAttr(__props.disabled || !__props.options.length) ? " disabled" : ""}${ssrRenderAttr("aria-expanded", unref(open))} aria-haspopup="listbox" data-v-833a5525><span data-v-833a5525><strong data-v-833a5525>${ssrInterpolate(unref(selectedOption)?.label || __props.placeholder || "Choisir")}</strong>`);
      if (unref(selectedOption)?.description) {
        _push(`<small data-v-833a5525>${ssrInterpolate(unref(selectedOption).description)}</small>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</span><i aria-hidden="true" data-v-833a5525>⌄</i></button>`);
      if (unref(open)) {
        _push(`<ul role="listbox"${ssrRenderAttr("aria-label", __props.label)} data-v-833a5525><!--[-->`);
        ssrRenderList(unref(groupedOptions), (group) => {
          _push(`<!--[-->`);
          if (group.label) {
            _push(`<li class="admin-custom-select__group" role="presentation" data-v-833a5525>${ssrInterpolate(group.label)}</li>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--[-->`);
          ssrRenderList(group.items, (item) => {
            _push(`<li role="option"${ssrRenderAttr("aria-selected", item.option.value === __props.modelValue)} data-v-833a5525><button type="button" class="${ssrRenderClass({ "is-active": item.index === unref(activeIndex), "is-selected": item.option.value === __props.modelValue })}" data-v-833a5525><span data-v-833a5525><strong data-v-833a5525>${ssrInterpolate(item.option.label)}</strong>`);
            if (item.option.description) {
              _push(`<small data-v-833a5525>${ssrInterpolate(item.option.description)}</small>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</span>`);
            if (item.option.value === __props.modelValue) {
              _push(`<b aria-hidden="true" data-v-833a5525>✓</b>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</button></li>`);
          });
          _push(`<!--]--><!--]-->`);
        });
        _push(`<!--]--></ul>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/CustomSelect.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_3 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-833a5525"]]), { __name: "AdminCustomSelect" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "helps",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const { user, handleUnauthorized } = useAdminAuth();
    const { localePath } = useLanguagePreferences();
    const loading = ref(false);
    const error = ref("");
    const caracteres = ref([]);
    const verbs = ref([]);
    const modes = ref([]);
    const tenses = ref([]);
    const previews = ref(Array.from({ length: 4 }, (_, index) => ({
      id: index + 1,
      verb: null,
      verbQuery: "manger",
      suggestionsOpen: false,
      conjugations: [],
      tenseId: 0,
      personId: 0,
      loading: false,
      copyState: "idle"
    })));
    const detailCache = /* @__PURE__ */ new Map();
    let loaded = false;
    useHead({ title: "Aides automatiques — Administration" });
    const requestedCaractereId = computed(() => Number(route.query.caractere));
    const currentCaractere = computed(() => caracteres.value.find((caractere) => caractere.id === requestedCaractereId.value) || null);
    const automaticBlocks = computed(() => visibleCoachHelpBlocks(currentCaractere.value?.helpApproach));
    const approach = computed(() => automaticCoachHelpApproach(currentCaractere.value?.helpApproach));
    const approachLabel = computed(() => coachHelpProfile(approach.value).label);
    function normalized(value) {
      return normalizeVerbSearch(value || "");
    }
    function clone(value) {
      return JSON.parse(JSON.stringify(value));
    }
    function tenseFor(state) {
      return tenses.value.find((tense) => tense.id === state.tenseId);
    }
    function modeFor(state) {
      const tense = tenseFor(state);
      return modes.value.find((mode) => mode.id === tense?.modeId);
    }
    function formsFor(state) {
      return state.conjugations.filter((form) => form.tenseId === state.tenseId && form.conjugaison1.trim());
    }
    function currentForm(state) {
      return formsFor(state).find((form) => form.personId === state.personId) || formsFor(state)[0];
    }
    function tenseOptions(state) {
      return tenses.value.filter((tense) => state.conjugations.some((form) => form.tenseId === tense.id && form.conjugaison1.trim())).map((tense) => {
        const modeName = modes.value.find((mode) => mode.id === tense.modeId)?.name || "Autres formes";
        return {
          value: tense.id,
          label: tense.name,
          group: modeName,
          description: modeName
        };
      });
    }
    function personOptions(state) {
      const seen = /* @__PURE__ */ new Set();
      return formsFor(state).filter((form) => !seen.has(form.personId) && seen.add(form.personId)).map((form) => ({ value: form.personId, label: form.pronom || "Forme non personnelle", description: form.conjugaison1 }));
    }
    function suggestions(state) {
      if (!normalized(state.verbQuery)) return [];
      return matchingVerbs(verbs.value, state.verbQuery).slice(0, 7);
    }
    function syncPerson(state, preferredPronoun = "") {
      const forms = formsFor(state);
      const selected = forms.find((form) => normalized(form.pronom) === normalized(preferredPronoun)) || forms.find((form) => form.personId === state.personId) || forms[0];
      if (selected) state.personId = selected.personId;
    }
    function selectTense(state, value) {
      state.tenseId = Number(value);
      syncPerson(state);
    }
    function selectPerson(state, value) {
      state.personId = Number(value);
    }
    async function verbDetail(verbId) {
      if (!detailCache.has(verbId)) {
        detailCache.set(verbId, $fetch(`/api/admin/verbes/${verbId}`, { credentials: "same-origin" }));
      }
      return await detailCache.get(verbId);
    }
    async function chooseVerb(state, verb, options = {}) {
      state.loading = true;
      state.suggestionsOpen = false;
      state.verbQuery = verb.infinitif;
      try {
        const detail = await verbDetail(verb.id);
        state.verb = { ...verb, ...clone(detail.verb) };
        state.conjugations = clone(detail.conjugations);
        const requestedMode = options.modeName ? modes.value.find((mode) => normalized(mode.name) === normalized(options.modeName)) : void 0;
        let target = options.tenseName ? tenses.value.find((tense) => normalized(tense.name) === normalized(options.tenseName) && (!requestedMode || tense.modeId === requestedMode.id) && state.conjugations.some((form) => form.tenseId === tense.id && form.conjugaison1.trim())) : tenses.value.find((tense) => tense.id === state.tenseId && state.conjugations.some((form) => form.tenseId === tense.id && form.conjugaison1.trim()));
        if (!target && options.compound !== void 0) {
          target = tenses.value.find((tense) => tense.isCompound === options.compound && state.conjugations.some((form) => form.tenseId === tense.id && form.conjugaison1.trim()));
        }
        target ||= tenses.value.find((tense) => state.conjugations.some((form) => form.tenseId === tense.id && form.conjugaison1.trim()));
        state.tenseId = target?.id || 0;
        syncPerson(state, options.pronoun);
      } catch (caught) {
        if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, `Impossible de charger « ${verb.infinitif} ».`);
      } finally {
        state.loading = false;
      }
    }
    function closeSuggestions(state) {
      (void 0).setTimeout(() => {
        state.suggestionsOpen = false;
      }, 120);
    }
    function previewQuestion(state) {
      const form = currentForm(state);
      const tense = tenseFor(state);
      const mode = modeFor(state);
      const verb = state.verb;
      const accepted = [form?.conjugaison1, form?.conjugaison2, form?.conjugaison3].map((value) => value?.trim()).filter((value) => Boolean(value));
      const reference = verb && form ? buildRadicalReference({
        infinitive: verb.infinitif,
        mode: mode?.name || "",
        tense: tense?.name || "",
        personId: form.personId,
        conjugation: form.conjugaison1,
        isCompound: tense?.isCompound
      }, state.conjugations.map((candidate) => {
        const candidateTense = tenses.value.find((item) => item.id === candidate.tenseId);
        return {
          mode: modes.value.find((item) => item.id === candidateTense?.modeId)?.name || "",
          tense: candidateTense?.name || "",
          personId: candidate.personId,
          pronoun: candidate.pronom,
          form: candidate.conjugaison1
        };
      })) : void 0;
      return {
        titre: verb?.infinitif || "",
        consigne: `${form?.pronom || ""} | ${verb?.infinitif || ""} | ${tense?.name || ""}`,
        reponses: accepted,
        reponsesPourCorrige: accepted.map((answer) => `${form?.pronom || ""} ${answer}`.trim()),
        verbeId: verb?.id,
        tenseId: tense?.id,
        personId: form?.personId,
        infinitif: verb?.infinitif || "",
        pronom: form?.pronom || "",
        saisiePrefixe: form?.pronom || "",
        temps: tense?.name || "",
        mode: mode?.name || "",
        isCompound: Boolean(tense?.isCompound),
        conjugaison1: form?.conjugaison1 || "",
        conjugaison2: form?.conjugaison2 || null,
        conjugaison3: form?.conjugaison3 || null,
        nousForm: state.conjugations.find((candidate) => candidate.tenseId === tense?.id && candidate.personId === 7)?.conjugaison1 || null,
        ...reference ? { radicalReference: reference } : {}
      };
    }
    function previewValues(state) {
      const question = previewQuestion(state);
      const verb = state.verb;
      const tense = tenseFor(state);
      return {
        coach: { firstName: "Aperçu" },
        definition: verb?.meaning || "",
        helpTitle: `${verb?.infinitif || "Verbe"} · ${tense?.name || "temps"}${modeFor(state)?.name ? ` (${modeFor(state).name.toLocaleLowerCase("fr")})` : ""}`,
        ...coachHelpQuestionVariables(question, verb || void 0, tense)
      };
    }
    function diagnosticBlock(block, values) {
      const isDefinition = block.content.trim() === "{definitionHelp}";
      const isContextual = block.content.trim() === "{contextualBaseHelp}";
      return {
        id: block.id,
        type: block.type,
        title: isDefinition ? "Définition" : isContextual ? "" : block.title,
        automaticContentKey: block.content,
        pedagogicalApproach: block.explanationApproach,
        renderedHtml: sanitizeCoachHtml(renderCoachHelpContent(block.content, values, block.explanationApproach)),
        children: (block.children || []).filter((child) => child.isActive).map((child) => diagnosticBlock(child, values))
      };
    }
    function previewDiagnostic(state) {
      const question = previewQuestion(state);
      const values = previewValues(state);
      const blocks = [
        ...automaticBlocks.value.filter((block) => block.isActive),
        ...conditionalCoachHelpBlocks(approach.value, values)
      ];
      return {
        schemaVersion: 1,
        caractere: currentCaractere.value ? {
          id: currentCaractere.value.id,
          name: currentCaractere.value.masculineName,
          icon: currentCaractere.value.emoticon
        } : null,
        help: {
          pedagogicalApproach: approach.value,
          structure: "fully-automatic"
        },
        selection: {
          verb: state.verb,
          mode: modeFor(state) || null,
          tense: tenseFor(state) || null,
          person: currentForm(state) || null
        },
        question,
        calculatedVariables: values,
        renderedHelp: {
          header: {
            kicker: "Aide",
            title: renderCoachHelpContent("{helpTitle}", values),
            descriptionHtml: ""
          },
          blocks: blocks.map((block) => diagnosticBlock(block, values))
        }
      };
    }
    async function writeClipboard(value) {
      if ((void 0).clipboard?.writeText) {
        await (void 0).clipboard.writeText(value);
        return;
      }
      const textarea = (void 0).createElement("textarea");
      textarea.value = value;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      (void 0).body.appendChild(textarea);
      textarea.select();
      const copied = (void 0).execCommand("copy");
      textarea.remove();
      if (!copied) throw new Error("Copie impossible");
    }
    async function copyPreviewJson(state) {
      try {
        await writeClipboard(JSON.stringify(previewDiagnostic(state), null, 2));
        state.copyState = "copied";
      } catch {
        state.copyState = "error";
      }
      (void 0).setTimeout(() => {
        state.copyState = "idle";
      }, 1800);
    }
    async function openVerification() {
      if (!currentCaractere.value) return;
      await navigateTo({ path: localePath("/admin/help-verification"), query: { caractere: requestedCaractereId.value } });
    }
    async function prepareRandomPreviews() {
      if (!verbs.value.length) throw new Error("Aucun verbe disponible");
      const firstVerbIndex = Math.floor(Math.random() * verbs.value.length);
      let selectedVerb;
      let randomForms = [];
      for (let offset = 0; offset < verbs.value.length; offset += 1) {
        const candidate = verbs.value[(firstVerbIndex + offset) % verbs.value.length];
        const detail = await verbDetail(candidate.id);
        const candidateForms = randomConjugationPreviews(modes.value, tenses.value, detail.conjugations, previews.value.length);
        if (candidateForms.length < previews.value.length) continue;
        selectedVerb = candidate;
        randomForms = candidateForms;
        break;
      }
      if (!selectedVerb) throw new Error("Aucun verbe ne possède au moins quatre modes disponibles.");
      await Promise.all(previews.value.map((state, index) => chooseVerb(state, selectedVerb, randomForms[index])));
    }
    async function reloadPreviews() {
      loading.value = true;
      error.value = "";
      try {
        await prepareRandomPreviews();
      } catch (caught) {
        if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, "Impossible de tirer quatre nouvelles formes.");
      } finally {
        loading.value = false;
      }
    }
    async function load() {
      loading.value = true;
      error.value = "";
      try {
        if (!Number.isInteger(requestedCaractereId.value) || requestedCaractereId.value < 1) {
          await navigateTo(localePath("/admin/caracteres"));
          return;
        }
        const [caractereResponse, catalogue] = await Promise.all([
          $fetch("/api/admin/coach-caracteres"),
          $fetch("/api/catalogue")
        ]);
        caracteres.value = caractereResponse.caracteres;
        verbs.value = catalogue.verbes.filter((verb) => verb.id > 0);
        modes.value = catalogue.modes;
        tenses.value = catalogue.temps;
        if (!currentCaractere.value) throw new Error("Caractère introuvable");
        await prepareRandomPreviews();
      } catch (caught) {
        if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, "Impossible de préparer les aperçus automatiques.");
      } finally {
        loading.value = false;
      }
    }
    watch(user, (current) => {
      if (current && !loaded) {
        loaded = true;
        void load();
      }
      if (!current) loaded = false;
    }, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminAuthBoundary = __nuxt_component_0;
      const _component_AdminShell = __nuxt_component_1;
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_AdminCustomSelect = __nuxt_component_3;
      const _component_CoachHelpPanel = __nuxt_component_0$2;
      _push(ssrRenderComponent(_component_AdminAuthBoundary, _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_AdminShell, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<main class="automatic-help-admin" data-v-d022c73f${_scopeId2}><header class="admin-section-heading automatic-help-heading" data-v-d022c73f${_scopeId2}><div data-v-d022c73f${_scopeId2}><p class="admin-eyebrow" data-v-d022c73f${_scopeId2}>Aide entièrement automatique</p><h1 data-v-d022c73f${_scopeId2}>${ssrInterpolate(unref(currentCaractere) ? `${unref(currentCaractere).emoticon} ${unref(currentCaractere).masculineName}` : "Aides")}</h1><p data-v-d022c73f${_scopeId2}>Le script choisit les blocs et leur contenu selon le verbe, le temps et la personne.</p></div><div class="automatic-help-heading__actions" data-v-d022c73f${_scopeId2}><span class="automatic-help-approach" data-v-d022c73f${_scopeId2}>${ssrInterpolate(unref(approachLabel))}</span>`);
                  if (unref(currentCaractere)) {
                    _push3(ssrRenderComponent(_component_NuxtLink, {
                      class: "admin-button admin-button--small",
                      to: { path: unref(localePath)("/admin/caracteres"), query: { caractere: unref(currentCaractere).id } }
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`Retour au caractère`);
                        } else {
                          return [
                            createTextVNode("Retour au caractère")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`<button class="admin-button admin-button--small automatic-help-reload" type="button"${ssrIncludeBooleanAttr(unref(loading) || !unref(currentCaractere)) ? " disabled" : ""} data-v-d022c73f${_scopeId2}>Recharger</button><button class="admin-button automatic-help-verify" type="button"${ssrIncludeBooleanAttr(unref(loading) || !unref(currentCaractere)) ? " disabled" : ""} data-v-d022c73f${_scopeId2}>Vérifier cette aide</button></div></header>`);
                  if (unref(error)) {
                    _push3(`<p class="admin-notice admin-notice--error" data-v-d022c73f${_scopeId2}>${ssrInterpolate(unref(error))}</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (unref(loading)) {
                    _push3(`<section class="admin-card automatic-help-loading" data-v-d022c73f${_scopeId2}>Préparation des quatre formes de comparaison…</section>`);
                  } else {
                    _push3(`<section class="automatic-preview-scroll" aria-label="Comparaison de quatre formes conjuguées" data-v-d022c73f${_scopeId2}><div class="automatic-preview-grid" data-v-d022c73f${_scopeId2}><!--[-->`);
                    ssrRenderList(unref(previews), (state, index) => {
                      _push3(`<article class="automatic-preview-column" data-v-d022c73f${_scopeId2}><header data-v-d022c73f${_scopeId2}><span data-v-d022c73f${_scopeId2}>Forme ${ssrInterpolate(index + 1)}</span><div data-v-d022c73f${_scopeId2}><strong data-v-d022c73f${_scopeId2}>${ssrInterpolate(tenseFor(state)?.isCompound ? "Temps composé" : "Temps simple")}</strong><button type="button" class="${ssrRenderClass({ "is-copied": state.copyState === "copied", "is-error": state.copyState === "error" })}"${ssrIncludeBooleanAttr(state.loading || !state.verb) ? " disabled" : ""} data-v-d022c73f${_scopeId2}>${ssrInterpolate(state.copyState === "copied" ? "✓ JSON copié" : state.copyState === "error" ? "Copie impossible" : "Copier le JSON")}</button></div></header><div class="automatic-preview-controls" data-v-d022c73f${_scopeId2}><label class="automatic-verb-picker" data-v-d022c73f${_scopeId2}><span data-v-d022c73f${_scopeId2}>Verbe</span><div data-v-d022c73f${_scopeId2}><input${ssrRenderAttr("value", state.verbQuery)} type="search" autocomplete="off"${ssrRenderAttr("aria-expanded", state.suggestionsOpen)} data-v-d022c73f${_scopeId2}>`);
                      if (state.suggestionsOpen && suggestions(state).length) {
                        _push3(`<ul data-v-d022c73f${_scopeId2}><!--[-->`);
                        ssrRenderList(suggestions(state), (verb) => {
                          _push3(`<li data-v-d022c73f${_scopeId2}><button type="button" data-v-d022c73f${_scopeId2}><strong data-v-d022c73f${_scopeId2}>${ssrInterpolate(verb.infinitif)}</strong><small data-v-d022c73f${_scopeId2}>${ssrInterpolate(verb.meaning || "Définition à compléter")}</small></button></li>`);
                        });
                        _push3(`<!--]--></ul>`);
                      } else {
                        _push3(`<!---->`);
                      }
                      _push3(`</div></label>`);
                      _push3(ssrRenderComponent(_component_AdminCustomSelect, {
                        "model-value": state.tenseId,
                        options: tenseOptions(state),
                        label: "Temps",
                        placeholder: "Choisir un temps",
                        "onUpdate:modelValue": ($event) => selectTense(state, $event)
                      }, null, _parent3, _scopeId2));
                      _push3(ssrRenderComponent(_component_AdminCustomSelect, {
                        "model-value": state.personId,
                        options: personOptions(state),
                        label: "Personne",
                        placeholder: "Choisir une personne",
                        "onUpdate:modelValue": ($event) => selectPerson(state, $event)
                      }, null, _parent3, _scopeId2));
                      _push3(`</div>`);
                      if (state.loading) {
                        _push3(`<div class="automatic-preview-wait" data-v-d022c73f${_scopeId2}>Chargement de la conjugaison…</div>`);
                      } else if (state.verb && currentForm(state)) {
                        _push3(ssrRenderComponent(_component_CoachHelpPanel, {
                          blocks: unref(automaticBlocks),
                          values: previewValues(state),
                          "header-title": "{helpTitle}",
                          "header-description": "",
                          "question-number": index + 1,
                          "coach-color": "#35688f",
                          embedded: ""
                        }, null, _parent3, _scopeId2));
                      } else {
                        _push3(`<!---->`);
                      }
                      _push3(`</article>`);
                    });
                    _push3(`<!--]--></div></section>`);
                  }
                  _push3(`</main>`);
                } else {
                  return [
                    createVNode("main", { class: "automatic-help-admin" }, [
                      createVNode("header", { class: "admin-section-heading automatic-help-heading" }, [
                        createVNode("div", null, [
                          createVNode("p", { class: "admin-eyebrow" }, "Aide entièrement automatique"),
                          createVNode("h1", null, toDisplayString(unref(currentCaractere) ? `${unref(currentCaractere).emoticon} ${unref(currentCaractere).masculineName}` : "Aides"), 1),
                          createVNode("p", null, "Le script choisit les blocs et leur contenu selon le verbe, le temps et la personne.")
                        ]),
                        createVNode("div", { class: "automatic-help-heading__actions" }, [
                          createVNode("span", { class: "automatic-help-approach" }, toDisplayString(unref(approachLabel)), 1),
                          unref(currentCaractere) ? (openBlock(), createBlock(_component_NuxtLink, {
                            key: 0,
                            class: "admin-button admin-button--small",
                            to: { path: unref(localePath)("/admin/caracteres"), query: { caractere: unref(currentCaractere).id } }
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Retour au caractère")
                            ]),
                            _: 1
                          }, 8, ["to"])) : createCommentVNode("", true),
                          createVNode("button", {
                            class: "admin-button admin-button--small automatic-help-reload",
                            type: "button",
                            disabled: unref(loading) || !unref(currentCaractere),
                            onClick: reloadPreviews
                          }, "Recharger", 8, ["disabled"]),
                          createVNode("button", {
                            class: "admin-button automatic-help-verify",
                            type: "button",
                            disabled: unref(loading) || !unref(currentCaractere),
                            onClick: openVerification
                          }, "Vérifier cette aide", 8, ["disabled"])
                        ])
                      ]),
                      unref(error) ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "admin-notice admin-notice--error"
                      }, toDisplayString(unref(error)), 1)) : createCommentVNode("", true),
                      unref(loading) ? (openBlock(), createBlock("section", {
                        key: 1,
                        class: "admin-card automatic-help-loading"
                      }, "Préparation des quatre formes de comparaison…")) : (openBlock(), createBlock("section", {
                        key: 2,
                        class: "automatic-preview-scroll",
                        "aria-label": "Comparaison de quatre formes conjuguées"
                      }, [
                        createVNode("div", { class: "automatic-preview-grid" }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(previews), (state, index) => {
                            return openBlock(), createBlock("article", {
                              key: state.id,
                              class: "automatic-preview-column"
                            }, [
                              createVNode("header", null, [
                                createVNode("span", null, "Forme " + toDisplayString(index + 1), 1),
                                createVNode("div", null, [
                                  createVNode("strong", null, toDisplayString(tenseFor(state)?.isCompound ? "Temps composé" : "Temps simple"), 1),
                                  createVNode("button", {
                                    type: "button",
                                    class: { "is-copied": state.copyState === "copied", "is-error": state.copyState === "error" },
                                    disabled: state.loading || !state.verb,
                                    onClick: ($event) => copyPreviewJson(state)
                                  }, toDisplayString(state.copyState === "copied" ? "✓ JSON copié" : state.copyState === "error" ? "Copie impossible" : "Copier le JSON"), 11, ["disabled", "onClick"])
                                ])
                              ]),
                              createVNode("div", { class: "automatic-preview-controls" }, [
                                createVNode("label", { class: "automatic-verb-picker" }, [
                                  createVNode("span", null, "Verbe"),
                                  createVNode("div", null, [
                                    withDirectives(createVNode("input", {
                                      "onUpdate:modelValue": ($event) => state.verbQuery = $event,
                                      type: "search",
                                      autocomplete: "off",
                                      "aria-expanded": state.suggestionsOpen,
                                      onFocus: ($event) => state.suggestionsOpen = true,
                                      onInput: ($event) => state.suggestionsOpen = true,
                                      onBlur: ($event) => closeSuggestions(state)
                                    }, null, 40, ["onUpdate:modelValue", "aria-expanded", "onFocus", "onInput", "onBlur"]), [
                                      [vModelText, state.verbQuery]
                                    ]),
                                    state.suggestionsOpen && suggestions(state).length ? (openBlock(), createBlock("ul", { key: 0 }, [
                                      (openBlock(true), createBlock(Fragment, null, renderList(suggestions(state), (verb) => {
                                        return openBlock(), createBlock("li", {
                                          key: verb.id
                                        }, [
                                          createVNode("button", {
                                            type: "button",
                                            onMousedown: withModifiers(($event) => chooseVerb(state, verb), ["prevent"])
                                          }, [
                                            createVNode("strong", null, toDisplayString(verb.infinitif), 1),
                                            createVNode("small", null, toDisplayString(verb.meaning || "Définition à compléter"), 1)
                                          ], 40, ["onMousedown"])
                                        ]);
                                      }), 128))
                                    ])) : createCommentVNode("", true)
                                  ])
                                ]),
                                createVNode(_component_AdminCustomSelect, {
                                  "model-value": state.tenseId,
                                  options: tenseOptions(state),
                                  label: "Temps",
                                  placeholder: "Choisir un temps",
                                  "onUpdate:modelValue": ($event) => selectTense(state, $event)
                                }, null, 8, ["model-value", "options", "onUpdate:modelValue"]),
                                createVNode(_component_AdminCustomSelect, {
                                  "model-value": state.personId,
                                  options: personOptions(state),
                                  label: "Personne",
                                  placeholder: "Choisir une personne",
                                  "onUpdate:modelValue": ($event) => selectPerson(state, $event)
                                }, null, 8, ["model-value", "options", "onUpdate:modelValue"])
                              ]),
                              state.loading ? (openBlock(), createBlock("div", {
                                key: 0,
                                class: "automatic-preview-wait"
                              }, "Chargement de la conjugaison…")) : state.verb && currentForm(state) ? (openBlock(), createBlock(_component_CoachHelpPanel, {
                                key: 1,
                                blocks: unref(automaticBlocks),
                                values: previewValues(state),
                                "header-title": "{helpTitle}",
                                "header-description": "",
                                "question-number": index + 1,
                                "coach-color": "#35688f",
                                embedded: ""
                              }, null, 8, ["blocks", "values", "question-number"])) : createCommentVNode("", true)
                            ]);
                          }), 128))
                        ])
                      ]))
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
                  createVNode("main", { class: "automatic-help-admin" }, [
                    createVNode("header", { class: "admin-section-heading automatic-help-heading" }, [
                      createVNode("div", null, [
                        createVNode("p", { class: "admin-eyebrow" }, "Aide entièrement automatique"),
                        createVNode("h1", null, toDisplayString(unref(currentCaractere) ? `${unref(currentCaractere).emoticon} ${unref(currentCaractere).masculineName}` : "Aides"), 1),
                        createVNode("p", null, "Le script choisit les blocs et leur contenu selon le verbe, le temps et la personne.")
                      ]),
                      createVNode("div", { class: "automatic-help-heading__actions" }, [
                        createVNode("span", { class: "automatic-help-approach" }, toDisplayString(unref(approachLabel)), 1),
                        unref(currentCaractere) ? (openBlock(), createBlock(_component_NuxtLink, {
                          key: 0,
                          class: "admin-button admin-button--small",
                          to: { path: unref(localePath)("/admin/caracteres"), query: { caractere: unref(currentCaractere).id } }
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Retour au caractère")
                          ]),
                          _: 1
                        }, 8, ["to"])) : createCommentVNode("", true),
                        createVNode("button", {
                          class: "admin-button admin-button--small automatic-help-reload",
                          type: "button",
                          disabled: unref(loading) || !unref(currentCaractere),
                          onClick: reloadPreviews
                        }, "Recharger", 8, ["disabled"]),
                        createVNode("button", {
                          class: "admin-button automatic-help-verify",
                          type: "button",
                          disabled: unref(loading) || !unref(currentCaractere),
                          onClick: openVerification
                        }, "Vérifier cette aide", 8, ["disabled"])
                      ])
                    ]),
                    unref(error) ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "admin-notice admin-notice--error"
                    }, toDisplayString(unref(error)), 1)) : createCommentVNode("", true),
                    unref(loading) ? (openBlock(), createBlock("section", {
                      key: 1,
                      class: "admin-card automatic-help-loading"
                    }, "Préparation des quatre formes de comparaison…")) : (openBlock(), createBlock("section", {
                      key: 2,
                      class: "automatic-preview-scroll",
                      "aria-label": "Comparaison de quatre formes conjuguées"
                    }, [
                      createVNode("div", { class: "automatic-preview-grid" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(previews), (state, index) => {
                          return openBlock(), createBlock("article", {
                            key: state.id,
                            class: "automatic-preview-column"
                          }, [
                            createVNode("header", null, [
                              createVNode("span", null, "Forme " + toDisplayString(index + 1), 1),
                              createVNode("div", null, [
                                createVNode("strong", null, toDisplayString(tenseFor(state)?.isCompound ? "Temps composé" : "Temps simple"), 1),
                                createVNode("button", {
                                  type: "button",
                                  class: { "is-copied": state.copyState === "copied", "is-error": state.copyState === "error" },
                                  disabled: state.loading || !state.verb,
                                  onClick: ($event) => copyPreviewJson(state)
                                }, toDisplayString(state.copyState === "copied" ? "✓ JSON copié" : state.copyState === "error" ? "Copie impossible" : "Copier le JSON"), 11, ["disabled", "onClick"])
                              ])
                            ]),
                            createVNode("div", { class: "automatic-preview-controls" }, [
                              createVNode("label", { class: "automatic-verb-picker" }, [
                                createVNode("span", null, "Verbe"),
                                createVNode("div", null, [
                                  withDirectives(createVNode("input", {
                                    "onUpdate:modelValue": ($event) => state.verbQuery = $event,
                                    type: "search",
                                    autocomplete: "off",
                                    "aria-expanded": state.suggestionsOpen,
                                    onFocus: ($event) => state.suggestionsOpen = true,
                                    onInput: ($event) => state.suggestionsOpen = true,
                                    onBlur: ($event) => closeSuggestions(state)
                                  }, null, 40, ["onUpdate:modelValue", "aria-expanded", "onFocus", "onInput", "onBlur"]), [
                                    [vModelText, state.verbQuery]
                                  ]),
                                  state.suggestionsOpen && suggestions(state).length ? (openBlock(), createBlock("ul", { key: 0 }, [
                                    (openBlock(true), createBlock(Fragment, null, renderList(suggestions(state), (verb) => {
                                      return openBlock(), createBlock("li", {
                                        key: verb.id
                                      }, [
                                        createVNode("button", {
                                          type: "button",
                                          onMousedown: withModifiers(($event) => chooseVerb(state, verb), ["prevent"])
                                        }, [
                                          createVNode("strong", null, toDisplayString(verb.infinitif), 1),
                                          createVNode("small", null, toDisplayString(verb.meaning || "Définition à compléter"), 1)
                                        ], 40, ["onMousedown"])
                                      ]);
                                    }), 128))
                                  ])) : createCommentVNode("", true)
                                ])
                              ]),
                              createVNode(_component_AdminCustomSelect, {
                                "model-value": state.tenseId,
                                options: tenseOptions(state),
                                label: "Temps",
                                placeholder: "Choisir un temps",
                                "onUpdate:modelValue": ($event) => selectTense(state, $event)
                              }, null, 8, ["model-value", "options", "onUpdate:modelValue"]),
                              createVNode(_component_AdminCustomSelect, {
                                "model-value": state.personId,
                                options: personOptions(state),
                                label: "Personne",
                                placeholder: "Choisir une personne",
                                "onUpdate:modelValue": ($event) => selectPerson(state, $event)
                              }, null, 8, ["model-value", "options", "onUpdate:modelValue"])
                            ]),
                            state.loading ? (openBlock(), createBlock("div", {
                              key: 0,
                              class: "automatic-preview-wait"
                            }, "Chargement de la conjugaison…")) : state.verb && currentForm(state) ? (openBlock(), createBlock(_component_CoachHelpPanel, {
                              key: 1,
                              blocks: unref(automaticBlocks),
                              values: previewValues(state),
                              "header-title": "{helpTitle}",
                              "header-description": "",
                              "question-number": index + 1,
                              "coach-color": "#35688f",
                              embedded: ""
                            }, null, 8, ["blocks", "values", "question-number"])) : createCommentVNode("", true)
                          ]);
                        }), 128))
                      ])
                    ]))
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/helps.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const helps = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-d022c73f"]]);

export { helps as default };
//# sourceMappingURL=helps-CEqnAvwY.mjs.map
