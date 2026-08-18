import { u as useAdminAuth, _ as __nuxt_component_0, a as __nuxt_component_1, g as getAdminErrorMessage } from './AdminShell-4Nuy8GEQ.mjs';
import { defineComponent, ref, computed, watch, withCtx, unref, createVNode, toDisplayString, openBlock, createBlock, createCommentVNode, Fragment, renderList, withDirectives, isRef, vModelSelect, vModelText, createTextVNode, withKeys, withModifiers, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrLooseContain, ssrLooseEqual, ssrRenderAttr } from 'vue/server-renderer';
import { u as useHead } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
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
import 'node:fs/promises';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';

const pageSize = 100;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "literary-corpus",
  __ssrInlineRender: true,
  setup(__props) {
    const { user, handleUnauthorized } = useAdminAuth();
    const targets = ref([]);
    const selectedId = ref(null);
    const counts = ref({ candidate: 0, validated: 0, reserve: 0, rejected: 0 });
    const status = ref("candidate");
    const confidence = ref("all");
    const search = ref("");
    const sourceId = ref(0);
    const verbId = ref(0);
    const modeId = ref(0);
    const tenseId = ref(0);
    const personId = ref(0);
    const verbs = ref([]);
    const modes = ref([]);
    const tenses = ref([]);
    const persons = ref([]);
    const sources = ref([]);
    const loading = ref(false);
    const saving = ref(false);
    const error = ref("");
    const success = ref("");
    const editableTargetText = ref("");
    const editableSentenceText = ref("");
    const citationRenderVersion = ref(0);
    const page = ref(0);
    const total = ref(0);
    const pendingSelectionId = ref(null);
    let searchTimer;
    let loadSequence = 0;
    useHead({ title: "Phrases — Administration" });
    const selected = computed(() => targets.value.find((target) => target.id === selectedId.value) || targets.value[0] || null);
    const visibleTenses = computed(() => modeId.value ? tenses.value.filter((tense) => tense.modeId === modeId.value) : []);
    const sentenceParts = computed(() => {
      const target = selected.value;
      if (!target) return { before: "", target: "", after: "" };
      return {
        before: target.text.slice(0, target.targetStart),
        target: target.text.slice(target.targetStart, target.targetEnd),
        after: target.text.slice(target.targetEnd)
      };
    });
    async function loadTargets(resetPage = false) {
      if (!user.value) return;
      if (resetPage) page.value = 0;
      loading.value = true;
      const sequence = ++loadSequence;
      error.value = "";
      try {
        const response = await $fetch("/api/admin/literary-corpus", {
          credentials: "same-origin",
          query: {
            status: status.value,
            confidence: confidence.value === "all" ? void 0 : confidence.value,
            search: search.value || void 0,
            sourceId: sourceId.value || void 0,
            verbId: verbId.value || void 0,
            modeId: modeId.value || void 0,
            tenseId: tenseId.value || void 0,
            personId: personId.value || void 0,
            limit: pageSize,
            offset: page.value * pageSize
          }
        });
        if (sequence !== loadSequence) return;
        targets.value = response.targets;
        counts.value = response.counts;
        total.value = response.total;
        sources.value = response.navigation.sources;
        verbs.value = response.navigation.verbs;
        modes.value = response.navigation.modes;
        tenses.value = response.navigation.tenses;
        persons.value = response.navigation.persons;
        if (!targets.value.some((target) => target.id === selectedId.value)) selectedId.value = targets.value[0]?.id || null;
      } catch (caught) {
        if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, "Impossible de charger le corpus.");
      } finally {
        if (sequence === loadSequence) loading.value = false;
      }
    }
    function chooseMode(id) {
      modeId.value = id;
      tenseId.value = 0;
      personId.value = 0;
      void loadTargets(true);
    }
    function chooseTense(id) {
      tenseId.value = id;
      personId.value = 0;
      void loadTargets(true);
    }
    function choosePerson(id) {
      personId.value = id;
      void loadTargets(true);
    }
    function resetGrammar() {
      modeId.value = 0;
      tenseId.value = 0;
      personId.value = 0;
      void loadTargets(true);
    }
    async function review(nextStatus, options = {}) {
      const target = options.target || selected.value;
      if (!target || saving.value) return;
      let note = null;
      if (nextStatus === "rejected" && !options.quick) {
        note = (void 0).prompt("Motif du rejet ?", target.ambiguityReason || "Phrase inadaptée")?.trim() || null;
        if (!note) return;
      } else if (nextStatus === "rejected") note = target.reviewNote || "Rejet rapide";
      const targetIndex = targets.value.findIndex((item) => item.id === target.id);
      const adjacentId = targets.value[targetIndex + 1]?.id || targets.value[targetIndex - 1]?.id || null;
      saving.value = true;
      error.value = "";
      success.value = "";
      try {
        const response = await $fetch(`/api/admin/literary-corpus/${target.id}`, {
          method: "PUT",
          credentials: "same-origin",
          body: { status: nextStatus, note }
        });
        success.value = response.message || (response.status === "validated" ? "Citation validée." : response.status === "reserve" ? "Citation mise en réserve." : response.status === "rejected" ? "Citation rejetée." : "Citation remise parmi les candidates.");
        await loadTargets();
        const preferredId = options.selectAfter !== void 0 ? options.selectAfter : options.quick ? adjacentId : null;
        if (preferredId && targets.value.some((item) => item.id === preferredId)) selectedId.value = preferredId;
      } catch (caught) {
        if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, "Impossible d’enregistrer la validation.");
      } finally {
        saving.value = false;
        continuePendingSelection();
      }
    }
    function quickToggleStatus(target) {
      const nextStatus = target.reviewStatus === "rejected" ? "validated" : "rejected";
      void review(nextStatus, { quick: true, target });
    }
    async function selectTarget(id) {
      if (selected.value?.id === id) return;
      if (saving.value) {
        pendingSelectionId.value = id;
        return;
      }
      const previous = selected.value;
      if (previous?.reviewStatus === "candidate") {
        await review("validated", { quick: true, target: previous, selectAfter: id });
      } else selectedId.value = id;
    }
    function continuePendingSelection() {
      const id = pendingSelectionId.value;
      pendingSelectionId.value = null;
      if (id && targets.value.some((target) => target.id === id)) void selectTarget(id);
    }
    async function saveTargetText() {
      const target = selected.value;
      const targetText = editableTargetText.value.trim();
      if (!target || saving.value || targetText === target.targetText) return;
      if (!targetText) {
        editableTargetText.value = target.targetText;
        return;
      }
      saving.value = true;
      error.value = "";
      success.value = "";
      try {
        await $fetch(`/api/admin/literary-corpus/${target.id}`, {
          method: "PUT",
          credentials: "same-origin",
          body: { status: target.reviewStatus, note: target.reviewNote, targetText }
        });
        success.value = "Forme ciblée mise à jour.";
        await loadTargets();
      } catch (caught) {
        editableTargetText.value = target.targetText;
        if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, "Impossible de modifier la forme ciblée.");
      } finally {
        saving.value = false;
        continuePendingSelection();
      }
    }
    function updateEditableSentence(event) {
      editableSentenceText.value = event.currentTarget?.textContent || "";
    }
    async function saveSentenceText() {
      const target = selected.value;
      const sentenceText = editableSentenceText.value.replace(/\s+/gu, " ").trim();
      if (!target || saving.value || sentenceText === target.text) return;
      if (!sentenceText) {
        editableSentenceText.value = target.text;
        citationRenderVersion.value++;
        return;
      }
      saving.value = true;
      error.value = "";
      success.value = "";
      try {
        await $fetch(`/api/admin/literary-corpus/${target.id}`, {
          method: "PUT",
          credentials: "same-origin",
          body: { status: target.reviewStatus, note: target.reviewNote, sentenceText }
        });
        success.value = "Phrase mise à jour.";
        await loadTargets();
      } catch (caught) {
        editableSentenceText.value = target.text;
        if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, "Impossible de modifier la phrase.");
      } finally {
        citationRenderVersion.value++;
        saving.value = false;
        continuePendingSelection();
      }
    }
    function finishSentenceEdit(event) {
      event.currentTarget?.blur();
    }
    function cancelSentenceEdit(event) {
      editableSentenceText.value = selected.value?.text || "";
      citationRenderVersion.value++;
      event.currentTarget?.blur();
    }
    function cancelTargetEdit(event) {
      editableTargetText.value = selected.value?.targetText || "";
      event.currentTarget?.blur();
    }
    watch(user, (value) => {
      if (value) void loadTargets();
    }, { immediate: true });
    watch([status, confidence, sourceId], () => {
      void loadTargets(true);
    });
    watch(verbId, () => {
      modeId.value = 0;
      tenseId.value = 0;
      personId.value = 0;
      void loadTargets(true);
    });
    watch(search, () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        void loadTargets(true);
      }, 300);
    });
    watch(() => selected.value?.id, () => {
      editableTargetText.value = selected.value?.targetText || "";
      editableSentenceText.value = selected.value?.text || "";
      citationRenderVersion.value++;
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
                  _push3(`<div class="corpus-admin" data-v-c6f7e24b${_scopeId2}><header class="corpus-admin__header" data-v-c6f7e24b${_scopeId2}><div data-v-c6f7e24b${_scopeId2}><p class="admin-eyebrow" data-v-c6f7e24b${_scopeId2}>Citations contextualisées</p><h1 data-v-c6f7e24b${_scopeId2}>Phrases</h1><p class="admin-muted" data-v-c6f7e24b${_scopeId2}>Parcourez les phrases à contrôler : passer à la suivante valide automatiquement la phrase courante.</p></div><button class="admin-button admin-button--small" type="button"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""} data-v-c6f7e24b${_scopeId2}>${ssrInterpolate(unref(loading) ? "Chargement…" : "Actualiser")}</button></header>`);
                  if (unref(error)) {
                    _push3(`<p class="admin-notice admin-notice--error" role="alert" data-v-c6f7e24b${_scopeId2}>${ssrInterpolate(unref(error))}</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (unref(success)) {
                    _push3(`<p class="admin-notice admin-notice--success" role="status" data-v-c6f7e24b${_scopeId2}>${ssrInterpolate(unref(success))}</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`<section class="corpus-stats" aria-label="État du corpus" data-v-c6f7e24b${_scopeId2}><!--[-->`);
                  ssrRenderList(["candidate", "validated", "reserve", "rejected"], (item) => {
                    _push3(`<button type="button" class="${ssrRenderClass({ active: unref(status) === item })}" data-v-c6f7e24b${_scopeId2}><strong data-v-c6f7e24b${_scopeId2}>${ssrInterpolate(unref(counts)[item])}</strong><span data-v-c6f7e24b${_scopeId2}>${ssrInterpolate(item === "candidate" ? "Candidates" : item === "validated" ? "Validées" : item === "reserve" ? "En réserve" : "Rejetées")}</span></button>`);
                  });
                  _push3(`<!--]--></section><section class="admin-card corpus-filters" data-v-c6f7e24b${_scopeId2}><label class="admin-field" data-v-c6f7e24b${_scopeId2}><span data-v-c6f7e24b${_scopeId2}>Statut</span><select data-v-c6f7e24b${_scopeId2}><option value="all" data-v-c6f7e24b${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "all") : ssrLooseEqual(unref(status), "all")) ? " selected" : ""}${_scopeId2}>Tous</option><option value="candidate" data-v-c6f7e24b${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "candidate") : ssrLooseEqual(unref(status), "candidate")) ? " selected" : ""}${_scopeId2}>Candidates</option><option value="validated" data-v-c6f7e24b${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "validated") : ssrLooseEqual(unref(status), "validated")) ? " selected" : ""}${_scopeId2}>Validées</option><option value="reserve" data-v-c6f7e24b${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "reserve") : ssrLooseEqual(unref(status), "reserve")) ? " selected" : ""}${_scopeId2}>Réserve</option><option value="rejected" data-v-c6f7e24b${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "rejected") : ssrLooseEqual(unref(status), "rejected")) ? " selected" : ""}${_scopeId2}>Rejetées</option></select></label><label class="admin-field" data-v-c6f7e24b${_scopeId2}><span data-v-c6f7e24b${_scopeId2}>Confiance</span><select data-v-c6f7e24b${_scopeId2}><option value="all" data-v-c6f7e24b${ssrIncludeBooleanAttr(Array.isArray(unref(confidence)) ? ssrLooseContain(unref(confidence), "all") : ssrLooseEqual(unref(confidence), "all")) ? " selected" : ""}${_scopeId2}>Toutes</option><option value="high" data-v-c6f7e24b${ssrIncludeBooleanAttr(Array.isArray(unref(confidence)) ? ssrLooseContain(unref(confidence), "high") : ssrLooseEqual(unref(confidence), "high")) ? " selected" : ""}${_scopeId2}>Analyse sûre</option><option value="ambiguous" data-v-c6f7e24b${ssrIncludeBooleanAttr(Array.isArray(unref(confidence)) ? ssrLooseContain(unref(confidence), "ambiguous") : ssrLooseEqual(unref(confidence), "ambiguous")) ? " selected" : ""}${_scopeId2}>Ambiguë</option></select></label><label class="admin-field" data-v-c6f7e24b${_scopeId2}><span data-v-c6f7e24b${_scopeId2}>Œuvre</span><select data-v-c6f7e24b${_scopeId2}><option${ssrRenderAttr("value", 0)} data-v-c6f7e24b${ssrIncludeBooleanAttr(Array.isArray(unref(sourceId)) ? ssrLooseContain(unref(sourceId), 0) : ssrLooseEqual(unref(sourceId), 0)) ? " selected" : ""}${_scopeId2}>Toutes les œuvres</option><!--[-->`);
                  ssrRenderList(unref(sources), (source) => {
                    _push3(`<option${ssrRenderAttr("value", source.id)} data-v-c6f7e24b${ssrIncludeBooleanAttr(Array.isArray(unref(sourceId)) ? ssrLooseContain(unref(sourceId), source.id) : ssrLooseEqual(unref(sourceId), source.id)) ? " selected" : ""}${_scopeId2}>${ssrInterpolate(source.label)} — ${ssrInterpolate(source.author)}</option>`);
                  });
                  _push3(`<!--]--></select></label><label class="admin-field corpus-filters__search" data-v-c6f7e24b${_scopeId2}><span data-v-c6f7e24b${_scopeId2}>Rechercher</span><input${ssrRenderAttr("value", unref(search))} type="search" placeholder="Phrase, œuvre ou verbe" data-v-c6f7e24b${_scopeId2}></label></section><section class="admin-card phrase-navigation" aria-labelledby="phrase-navigation-title" data-v-c6f7e24b${_scopeId2}><header data-v-c6f7e24b${_scopeId2}><div data-v-c6f7e24b${_scopeId2}><p class="admin-eyebrow" data-v-c6f7e24b${_scopeId2}>Explorer les disponibilités</p><h2 id="phrase-navigation-title" data-v-c6f7e24b${_scopeId2}>Verbe, mode, temps et personne</h2></div>`);
                  if (unref(modeId) || unref(tenseId) || unref(personId)) {
                    _push3(`<button class="admin-button admin-button--small" type="button" data-v-c6f7e24b${_scopeId2}>Effacer la sélection grammaticale</button>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</header><label class="admin-field phrase-navigation__verb" data-v-c6f7e24b${_scopeId2}><span data-v-c6f7e24b${_scopeId2}>Verbe</span><select data-v-c6f7e24b${_scopeId2}><option${ssrRenderAttr("value", 0)} data-v-c6f7e24b${ssrIncludeBooleanAttr(Array.isArray(unref(verbId)) ? ssrLooseContain(unref(verbId), 0) : ssrLooseEqual(unref(verbId), 0)) ? " selected" : ""}${_scopeId2}>Tous les verbes</option><!--[-->`);
                  ssrRenderList(unref(verbs), (verb) => {
                    _push3(`<option${ssrRenderAttr("value", verb.id)} data-v-c6f7e24b${ssrIncludeBooleanAttr(Array.isArray(unref(verbId)) ? ssrLooseContain(unref(verbId), verb.id) : ssrLooseEqual(unref(verbId), verb.id)) ? " selected" : ""}${_scopeId2}>${ssrInterpolate(verb.label)} — ${ssrInterpolate(verb.count)}</option>`);
                  });
                  _push3(`<!--]--></select><small data-v-c6f7e24b${_scopeId2}>Les verbes ayant des phrases pour la sélection courante apparaissent en premier.</small></label><div class="phrase-navigation__level" data-v-c6f7e24b${_scopeId2}><h3 data-v-c6f7e24b${_scopeId2}><span data-v-c6f7e24b${_scopeId2}>1</span> Mode</h3><div class="phrase-pills" data-v-c6f7e24b${_scopeId2}><button type="button" class="${ssrRenderClass({ active: unref(modeId) === 0 })}" data-v-c6f7e24b${_scopeId2}>Tous <strong data-v-c6f7e24b${_scopeId2}>${ssrInterpolate(unref(modes).reduce((sum, mode) => sum + mode.count, 0))}</strong></button><!--[-->`);
                  ssrRenderList(unref(modes), (mode) => {
                    _push3(`<button type="button" class="${ssrRenderClass({ active: unref(modeId) === mode.id })}" data-v-c6f7e24b${_scopeId2}>${ssrInterpolate(mode.label)} <strong data-v-c6f7e24b${_scopeId2}>${ssrInterpolate(mode.count)}</strong></button>`);
                  });
                  _push3(`<!--]--></div></div><div class="${ssrRenderClass([{ muted: !unref(modeId) }, "phrase-navigation__level"])}" data-v-c6f7e24b${_scopeId2}><h3 data-v-c6f7e24b${_scopeId2}><span data-v-c6f7e24b${_scopeId2}>2</span> Temps</h3>`);
                  if (!unref(modeId)) {
                    _push3(`<p class="admin-muted" data-v-c6f7e24b${_scopeId2}>Choisissez d’abord un mode.</p>`);
                  } else {
                    _push3(`<div class="phrase-pills" data-v-c6f7e24b${_scopeId2}><button type="button" class="${ssrRenderClass({ active: unref(tenseId) === 0 })}" data-v-c6f7e24b${_scopeId2}>Tous <strong data-v-c6f7e24b${_scopeId2}>${ssrInterpolate(unref(visibleTenses).reduce((sum, tense) => sum + tense.count, 0))}</strong></button><!--[-->`);
                    ssrRenderList(unref(visibleTenses), (tense) => {
                      _push3(`<button type="button" class="${ssrRenderClass({ active: unref(tenseId) === tense.id })}" data-v-c6f7e24b${_scopeId2}>${ssrInterpolate(tense.label)} <strong data-v-c6f7e24b${_scopeId2}>${ssrInterpolate(tense.count)}</strong></button>`);
                    });
                    _push3(`<!--]--></div>`);
                  }
                  _push3(`</div><div class="${ssrRenderClass([{ muted: !unref(tenseId) }, "phrase-navigation__level"])}" data-v-c6f7e24b${_scopeId2}><h3 data-v-c6f7e24b${_scopeId2}><span data-v-c6f7e24b${_scopeId2}>3</span> Personne</h3>`);
                  if (!unref(tenseId)) {
                    _push3(`<p class="admin-muted" data-v-c6f7e24b${_scopeId2}>Choisissez d’abord un temps.</p>`);
                  } else {
                    _push3(`<div class="phrase-pills" data-v-c6f7e24b${_scopeId2}><button type="button" class="${ssrRenderClass({ active: unref(personId) === 0 })}" data-v-c6f7e24b${_scopeId2}>Toutes <strong data-v-c6f7e24b${_scopeId2}>${ssrInterpolate(unref(persons).reduce((sum, person) => sum + person.count, 0))}</strong></button><!--[-->`);
                    ssrRenderList(unref(persons), (person) => {
                      _push3(`<button type="button" class="${ssrRenderClass({ active: unref(personId) === person.id })}" data-v-c6f7e24b${_scopeId2}>${ssrInterpolate(person.label)} <strong data-v-c6f7e24b${_scopeId2}>${ssrInterpolate(person.count)}</strong></button>`);
                    });
                    _push3(`<!--]--></div>`);
                  }
                  _push3(`</div></section><div class="corpus-workspace" data-v-c6f7e24b${_scopeId2}><aside class="admin-card corpus-list" aria-label="Phrases à examiner" data-v-c6f7e24b${_scopeId2}>`);
                  if (unref(targets).length) {
                    _push3(`<p class="corpus-list__shortcuts" data-v-c6f7e24b${_scopeId2}>↑↓ valider et parcourir · X rejeter</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (unref(loading) && !unref(targets).length) {
                    _push3(`<p class="corpus-empty" data-v-c6f7e24b${_scopeId2}>Chargement…</p>`);
                  } else if (!unref(targets).length) {
                    _push3(`<p class="corpus-empty" data-v-c6f7e24b${_scopeId2}>Aucune phrase pour ces filtres.</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`<!--[-->`);
                  ssrRenderList(unref(targets), (target) => {
                    _push3(`<div${ssrRenderAttr("data-phrase-id", target.id)} class="${ssrRenderClass([{ selected: unref(selected)?.id === target.id }, "corpus-list__row"])}" data-v-c6f7e24b${_scopeId2}><button class="corpus-list__select" type="button" data-v-c6f7e24b${_scopeId2}><span data-v-c6f7e24b${_scopeId2}><strong data-v-c6f7e24b${_scopeId2}>${ssrInterpolate(target.infinitive)}</strong><small data-v-c6f7e24b${_scopeId2}>${ssrInterpolate(target.mode)} · ${ssrInterpolate(target.tense)} · ${ssrInterpolate(target.pronoun)}</small></span><span data-v-c6f7e24b${_scopeId2}>${ssrInterpolate(target.text)}</span><em class="${ssrRenderClass(`is-${target.confidence}`)}" data-v-c6f7e24b${_scopeId2}>${ssrInterpolate(target.confidence === "high" ? `${target.wordCount} mots` : "Ambiguë")}</em></button><button class="${ssrRenderClass([{ "is-restore": target.reviewStatus === "rejected" }, "corpus-list__quick-review"])}" type="button"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""}${ssrRenderAttr("title", target.reviewStatus === "rejected" ? "Valider cette phrase" : "Rejeter cette phrase (X)")}${ssrRenderAttr("aria-label", target.reviewStatus === "rejected" ? `Valider : ${target.text}` : `Rejeter : ${target.text}`)} data-v-c6f7e24b${_scopeId2}>${ssrInterpolate(target.reviewStatus === "rejected" ? "✓" : "×")}</button></div>`);
                  });
                  _push3(`<!--]-->`);
                  if (unref(total) > pageSize) {
                    _push3(`<nav class="corpus-pagination" aria-label="Pagination du corpus" data-v-c6f7e24b${_scopeId2}><button type="button"${ssrIncludeBooleanAttr(unref(loading) || unref(page) === 0) ? " disabled" : ""} data-v-c6f7e24b${_scopeId2}>Précédentes</button><span data-v-c6f7e24b${_scopeId2}>${ssrInterpolate(unref(page) * pageSize + 1)}–${ssrInterpolate(Math.min((unref(page) + 1) * pageSize, unref(total)))} sur ${ssrInterpolate(unref(total))}</span><button type="button"${ssrIncludeBooleanAttr(unref(loading) || (unref(page) + 1) * pageSize >= unref(total)) ? " disabled" : ""} data-v-c6f7e24b${_scopeId2}>Suivantes</button></nav>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</aside>`);
                  if (unref(selected)) {
                    _push3(`<article class="admin-card corpus-detail" data-v-c6f7e24b${_scopeId2}><header data-v-c6f7e24b${_scopeId2}><div data-v-c6f7e24b${_scopeId2}><p class="admin-eyebrow" data-v-c6f7e24b${_scopeId2}>Citation #${ssrInterpolate(unref(selected).id)}</p><h2 data-v-c6f7e24b${_scopeId2}>${ssrInterpolate(unref(selected).infinitive)} · ${ssrInterpolate(unref(selected).mode)} · ${ssrInterpolate(unref(selected).tense)}</h2></div><span class="${ssrRenderClass(["corpus-confidence", `is-${unref(selected).confidence}`])}" data-v-c6f7e24b${_scopeId2}>${ssrInterpolate(unref(selected).confidence === "high" ? "Analyse sûre" : "Analyse ambiguë")}</span></header><blockquote class="corpus-editable-quote" contenteditable="plaintext-only" role="textbox" aria-label="Phrase littéraire éditable" title="Cliquer pour modifier la phrase" spellcheck="true" data-v-c6f7e24b${_scopeId2}><span data-v-c6f7e24b${_scopeId2}>${ssrInterpolate(unref(sentenceParts).before)}</span><mark data-v-c6f7e24b${_scopeId2}>${ssrInterpolate(unref(sentenceParts).target)}</mark><span data-v-c6f7e24b${_scopeId2}>${ssrInterpolate(unref(sentenceParts).after)}</span></blockquote>`);
                    if (unref(selected).ambiguityReason) {
                      _push3(`<p class="admin-notice admin-notice--warning" data-v-c6f7e24b${_scopeId2}>${ssrInterpolate(unref(selected).ambiguityReason)}</p>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`<dl data-v-c6f7e24b${_scopeId2}><div data-v-c6f7e24b${_scopeId2}><dt data-v-c6f7e24b${_scopeId2}><label for="literary-target-text" data-v-c6f7e24b${_scopeId2}>Forme</label></dt><dd data-v-c6f7e24b${_scopeId2}><input id="literary-target-text"${ssrRenderAttr("value", unref(editableTargetText))} class="corpus-inline-edit" type="text"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} title="Cliquer pour modifier la forme ciblée" aria-label="Forme ciblée dans la phrase" data-v-c6f7e24b${_scopeId2}></dd></div><div data-v-c6f7e24b${_scopeId2}><dt data-v-c6f7e24b${_scopeId2}>Personne</dt><dd data-v-c6f7e24b${_scopeId2}>${ssrInterpolate(unref(selected).pronoun)}</dd></div><div data-v-c6f7e24b${_scopeId2}><dt data-v-c6f7e24b${_scopeId2}>Longueur</dt><dd data-v-c6f7e24b${_scopeId2}>${ssrInterpolate(unref(selected).wordCount)} mots</dd></div><div data-v-c6f7e24b${_scopeId2}><dt data-v-c6f7e24b${_scopeId2}>Quota</dt><dd data-v-c6f7e24b${_scopeId2}>${ssrInterpolate(unref(selected).validatedForSelection)}/10 pour ce verbe, ce temps et cette personne</dd></div><div data-v-c6f7e24b${_scopeId2}><dt data-v-c6f7e24b${_scopeId2}>Source</dt><dd data-v-c6f7e24b${_scopeId2}>${ssrInterpolate(unref(selected).author)}, <cite data-v-c6f7e24b${_scopeId2}>${ssrInterpolate(unref(selected).work)}</cite></dd></div><div data-v-c6f7e24b${_scopeId2}><dt data-v-c6f7e24b${_scopeId2}>Emplacement</dt><dd data-v-c6f7e24b${_scopeId2}>${ssrInterpolate([unref(selected).chapter, unref(selected).locator].filter(Boolean).join(" · "))}</dd></div></dl><a class="corpus-source"${ssrRenderAttr("href", unref(selected).sourceUrl)} target="_blank" rel="noopener noreferrer" data-v-c6f7e24b${_scopeId2}>Vérifier dans la source ↗</a><footer data-v-c6f7e24b${_scopeId2}><button class="admin-button admin-button--primary" type="button"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} data-v-c6f7e24b${_scopeId2}>Valider</button><button class="admin-button" type="button"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} data-v-c6f7e24b${_scopeId2}>Mettre en réserve</button><button class="admin-button admin-button--danger" type="button"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} data-v-c6f7e24b${_scopeId2}>Rejeter</button>`);
                    if (unref(selected).reviewStatus !== "candidate") {
                      _push3(`<button class="admin-button" type="button"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} data-v-c6f7e24b${_scopeId2}>Remettre en attente</button>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`</footer></article>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</div></div>`);
                } else {
                  return [
                    createVNode("div", { class: "corpus-admin" }, [
                      createVNode("header", { class: "corpus-admin__header" }, [
                        createVNode("div", null, [
                          createVNode("p", { class: "admin-eyebrow" }, "Citations contextualisées"),
                          createVNode("h1", null, "Phrases"),
                          createVNode("p", { class: "admin-muted" }, "Parcourez les phrases à contrôler : passer à la suivante valide automatiquement la phrase courante.")
                        ]),
                        createVNode("button", {
                          class: "admin-button admin-button--small",
                          type: "button",
                          disabled: unref(loading),
                          onClick: ($event) => loadTargets()
                        }, toDisplayString(unref(loading) ? "Chargement…" : "Actualiser"), 9, ["disabled", "onClick"])
                      ]),
                      unref(error) ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "admin-notice admin-notice--error",
                        role: "alert"
                      }, toDisplayString(unref(error)), 1)) : createCommentVNode("", true),
                      unref(success) ? (openBlock(), createBlock("p", {
                        key: 1,
                        class: "admin-notice admin-notice--success",
                        role: "status"
                      }, toDisplayString(unref(success)), 1)) : createCommentVNode("", true),
                      createVNode("section", {
                        class: "corpus-stats",
                        "aria-label": "État du corpus"
                      }, [
                        (openBlock(), createBlock(Fragment, null, renderList(["candidate", "validated", "reserve", "rejected"], (item) => {
                          return createVNode("button", {
                            key: item,
                            type: "button",
                            class: { active: unref(status) === item },
                            onClick: ($event) => status.value = item
                          }, [
                            createVNode("strong", null, toDisplayString(unref(counts)[item]), 1),
                            createVNode("span", null, toDisplayString(item === "candidate" ? "Candidates" : item === "validated" ? "Validées" : item === "reserve" ? "En réserve" : "Rejetées"), 1)
                          ], 10, ["onClick"]);
                        }), 64))
                      ]),
                      createVNode("section", { class: "admin-card corpus-filters" }, [
                        createVNode("label", { class: "admin-field" }, [
                          createVNode("span", null, "Statut"),
                          withDirectives(createVNode("select", {
                            "onUpdate:modelValue": ($event) => isRef(status) ? status.value = $event : null
                          }, [
                            createVNode("option", { value: "all" }, "Tous"),
                            createVNode("option", { value: "candidate" }, "Candidates"),
                            createVNode("option", { value: "validated" }, "Validées"),
                            createVNode("option", { value: "reserve" }, "Réserve"),
                            createVNode("option", { value: "rejected" }, "Rejetées")
                          ], 8, ["onUpdate:modelValue"]), [
                            [vModelSelect, unref(status)]
                          ])
                        ]),
                        createVNode("label", { class: "admin-field" }, [
                          createVNode("span", null, "Confiance"),
                          withDirectives(createVNode("select", {
                            "onUpdate:modelValue": ($event) => isRef(confidence) ? confidence.value = $event : null
                          }, [
                            createVNode("option", { value: "all" }, "Toutes"),
                            createVNode("option", { value: "high" }, "Analyse sûre"),
                            createVNode("option", { value: "ambiguous" }, "Ambiguë")
                          ], 8, ["onUpdate:modelValue"]), [
                            [vModelSelect, unref(confidence)]
                          ])
                        ]),
                        createVNode("label", { class: "admin-field" }, [
                          createVNode("span", null, "Œuvre"),
                          withDirectives(createVNode("select", {
                            "onUpdate:modelValue": ($event) => isRef(sourceId) ? sourceId.value = $event : null
                          }, [
                            createVNode("option", { value: 0 }, "Toutes les œuvres"),
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(sources), (source) => {
                              return openBlock(), createBlock("option", {
                                key: source.id,
                                value: source.id
                              }, toDisplayString(source.label) + " — " + toDisplayString(source.author), 9, ["value"]);
                            }), 128))
                          ], 8, ["onUpdate:modelValue"]), [
                            [
                              vModelSelect,
                              unref(sourceId),
                              void 0,
                              { number: true }
                            ]
                          ])
                        ]),
                        createVNode("label", { class: "admin-field corpus-filters__search" }, [
                          createVNode("span", null, "Rechercher"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => isRef(search) ? search.value = $event : null,
                            type: "search",
                            placeholder: "Phrase, œuvre ou verbe"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(search)]
                          ])
                        ])
                      ]),
                      createVNode("section", {
                        class: "admin-card phrase-navigation",
                        "aria-labelledby": "phrase-navigation-title"
                      }, [
                        createVNode("header", null, [
                          createVNode("div", null, [
                            createVNode("p", { class: "admin-eyebrow" }, "Explorer les disponibilités"),
                            createVNode("h2", { id: "phrase-navigation-title" }, "Verbe, mode, temps et personne")
                          ]),
                          unref(modeId) || unref(tenseId) || unref(personId) ? (openBlock(), createBlock("button", {
                            key: 0,
                            class: "admin-button admin-button--small",
                            type: "button",
                            onClick: resetGrammar
                          }, "Effacer la sélection grammaticale")) : createCommentVNode("", true)
                        ]),
                        createVNode("label", { class: "admin-field phrase-navigation__verb" }, [
                          createVNode("span", null, "Verbe"),
                          withDirectives(createVNode("select", {
                            "onUpdate:modelValue": ($event) => isRef(verbId) ? verbId.value = $event : null
                          }, [
                            createVNode("option", { value: 0 }, "Tous les verbes"),
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(verbs), (verb) => {
                              return openBlock(), createBlock("option", {
                                key: verb.id,
                                value: verb.id
                              }, toDisplayString(verb.label) + " — " + toDisplayString(verb.count), 9, ["value"]);
                            }), 128))
                          ], 8, ["onUpdate:modelValue"]), [
                            [
                              vModelSelect,
                              unref(verbId),
                              void 0,
                              { number: true }
                            ]
                          ]),
                          createVNode("small", null, "Les verbes ayant des phrases pour la sélection courante apparaissent en premier.")
                        ]),
                        createVNode("div", { class: "phrase-navigation__level" }, [
                          createVNode("h3", null, [
                            createVNode("span", null, "1"),
                            createTextVNode(" Mode")
                          ]),
                          createVNode("div", { class: "phrase-pills" }, [
                            createVNode("button", {
                              type: "button",
                              class: { active: unref(modeId) === 0 },
                              onClick: ($event) => chooseMode(0)
                            }, [
                              createTextVNode("Tous "),
                              createVNode("strong", null, toDisplayString(unref(modes).reduce((sum, mode) => sum + mode.count, 0)), 1)
                            ], 10, ["onClick"]),
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(modes), (mode) => {
                              return openBlock(), createBlock("button", {
                                key: mode.id,
                                type: "button",
                                class: { active: unref(modeId) === mode.id },
                                onClick: ($event) => chooseMode(mode.id)
                              }, [
                                createTextVNode(toDisplayString(mode.label) + " ", 1),
                                createVNode("strong", null, toDisplayString(mode.count), 1)
                              ], 10, ["onClick"]);
                            }), 128))
                          ])
                        ]),
                        createVNode("div", {
                          class: ["phrase-navigation__level", { muted: !unref(modeId) }]
                        }, [
                          createVNode("h3", null, [
                            createVNode("span", null, "2"),
                            createTextVNode(" Temps")
                          ]),
                          !unref(modeId) ? (openBlock(), createBlock("p", {
                            key: 0,
                            class: "admin-muted"
                          }, "Choisissez d’abord un mode.")) : (openBlock(), createBlock("div", {
                            key: 1,
                            class: "phrase-pills"
                          }, [
                            createVNode("button", {
                              type: "button",
                              class: { active: unref(tenseId) === 0 },
                              onClick: ($event) => chooseTense(0)
                            }, [
                              createTextVNode("Tous "),
                              createVNode("strong", null, toDisplayString(unref(visibleTenses).reduce((sum, tense) => sum + tense.count, 0)), 1)
                            ], 10, ["onClick"]),
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(visibleTenses), (tense) => {
                              return openBlock(), createBlock("button", {
                                key: tense.id,
                                type: "button",
                                class: { active: unref(tenseId) === tense.id },
                                onClick: ($event) => chooseTense(tense.id)
                              }, [
                                createTextVNode(toDisplayString(tense.label) + " ", 1),
                                createVNode("strong", null, toDisplayString(tense.count), 1)
                              ], 10, ["onClick"]);
                            }), 128))
                          ]))
                        ], 2),
                        createVNode("div", {
                          class: ["phrase-navigation__level", { muted: !unref(tenseId) }]
                        }, [
                          createVNode("h3", null, [
                            createVNode("span", null, "3"),
                            createTextVNode(" Personne")
                          ]),
                          !unref(tenseId) ? (openBlock(), createBlock("p", {
                            key: 0,
                            class: "admin-muted"
                          }, "Choisissez d’abord un temps.")) : (openBlock(), createBlock("div", {
                            key: 1,
                            class: "phrase-pills"
                          }, [
                            createVNode("button", {
                              type: "button",
                              class: { active: unref(personId) === 0 },
                              onClick: ($event) => choosePerson(0)
                            }, [
                              createTextVNode("Toutes "),
                              createVNode("strong", null, toDisplayString(unref(persons).reduce((sum, person) => sum + person.count, 0)), 1)
                            ], 10, ["onClick"]),
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(persons), (person) => {
                              return openBlock(), createBlock("button", {
                                key: person.id,
                                type: "button",
                                class: { active: unref(personId) === person.id },
                                onClick: ($event) => choosePerson(person.id)
                              }, [
                                createTextVNode(toDisplayString(person.label) + " ", 1),
                                createVNode("strong", null, toDisplayString(person.count), 1)
                              ], 10, ["onClick"]);
                            }), 128))
                          ]))
                        ], 2)
                      ]),
                      createVNode("div", { class: "corpus-workspace" }, [
                        createVNode("aside", {
                          class: "admin-card corpus-list",
                          "aria-label": "Phrases à examiner"
                        }, [
                          unref(targets).length ? (openBlock(), createBlock("p", {
                            key: 0,
                            class: "corpus-list__shortcuts"
                          }, "↑↓ valider et parcourir · X rejeter")) : createCommentVNode("", true),
                          unref(loading) && !unref(targets).length ? (openBlock(), createBlock("p", {
                            key: 1,
                            class: "corpus-empty"
                          }, "Chargement…")) : !unref(targets).length ? (openBlock(), createBlock("p", {
                            key: 2,
                            class: "corpus-empty"
                          }, "Aucune phrase pour ces filtres.")) : createCommentVNode("", true),
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(targets), (target) => {
                            return openBlock(), createBlock("div", {
                              key: target.id,
                              "data-phrase-id": target.id,
                              class: ["corpus-list__row", { selected: unref(selected)?.id === target.id }]
                            }, [
                              createVNode("button", {
                                class: "corpus-list__select",
                                type: "button",
                                onClick: ($event) => selectTarget(target.id)
                              }, [
                                createVNode("span", null, [
                                  createVNode("strong", null, toDisplayString(target.infinitive), 1),
                                  createVNode("small", null, toDisplayString(target.mode) + " · " + toDisplayString(target.tense) + " · " + toDisplayString(target.pronoun), 1)
                                ]),
                                createVNode("span", null, toDisplayString(target.text), 1),
                                createVNode("em", {
                                  class: `is-${target.confidence}`
                                }, toDisplayString(target.confidence === "high" ? `${target.wordCount} mots` : "Ambiguë"), 3)
                              ], 8, ["onClick"]),
                              createVNode("button", {
                                class: ["corpus-list__quick-review", { "is-restore": target.reviewStatus === "rejected" }],
                                type: "button",
                                disabled: unref(saving),
                                title: target.reviewStatus === "rejected" ? "Valider cette phrase" : "Rejeter cette phrase (X)",
                                "aria-label": target.reviewStatus === "rejected" ? `Valider : ${target.text}` : `Rejeter : ${target.text}`,
                                onClick: ($event) => quickToggleStatus(target)
                              }, toDisplayString(target.reviewStatus === "rejected" ? "✓" : "×"), 11, ["disabled", "title", "aria-label", "onClick"])
                            ], 10, ["data-phrase-id"]);
                          }), 128)),
                          unref(total) > pageSize ? (openBlock(), createBlock("nav", {
                            key: 3,
                            class: "corpus-pagination",
                            "aria-label": "Pagination du corpus"
                          }, [
                            createVNode("button", {
                              type: "button",
                              disabled: unref(loading) || unref(page) === 0,
                              onClick: ($event) => {
                                page.value--;
                                loadTargets();
                              }
                            }, "Précédentes", 8, ["disabled", "onClick"]),
                            createVNode("span", null, toDisplayString(unref(page) * pageSize + 1) + "–" + toDisplayString(Math.min((unref(page) + 1) * pageSize, unref(total))) + " sur " + toDisplayString(unref(total)), 1),
                            createVNode("button", {
                              type: "button",
                              disabled: unref(loading) || (unref(page) + 1) * pageSize >= unref(total),
                              onClick: ($event) => {
                                page.value++;
                                loadTargets();
                              }
                            }, "Suivantes", 8, ["disabled", "onClick"])
                          ])) : createCommentVNode("", true)
                        ]),
                        unref(selected) ? (openBlock(), createBlock("article", {
                          key: 0,
                          class: "admin-card corpus-detail"
                        }, [
                          createVNode("header", null, [
                            createVNode("div", null, [
                              createVNode("p", { class: "admin-eyebrow" }, "Citation #" + toDisplayString(unref(selected).id), 1),
                              createVNode("h2", null, toDisplayString(unref(selected).infinitive) + " · " + toDisplayString(unref(selected).mode) + " · " + toDisplayString(unref(selected).tense), 1)
                            ]),
                            createVNode("span", {
                              class: ["corpus-confidence", `is-${unref(selected).confidence}`]
                            }, toDisplayString(unref(selected).confidence === "high" ? "Analyse sûre" : "Analyse ambiguë"), 3)
                          ]),
                          (openBlock(), createBlock("blockquote", {
                            key: `${unref(selected).id}-${unref(citationRenderVersion)}`,
                            class: "corpus-editable-quote",
                            contenteditable: "plaintext-only",
                            role: "textbox",
                            "aria-label": "Phrase littéraire éditable",
                            title: "Cliquer pour modifier la phrase",
                            spellcheck: "true",
                            onInput: updateEditableSentence,
                            onBlur: saveSentenceText,
                            onKeydown: [
                              withKeys(withModifiers(finishSentenceEdit, ["prevent"]), ["enter"]),
                              withKeys(withModifiers(cancelSentenceEdit, ["prevent"]), ["escape"])
                            ]
                          }, [
                            createVNode("span", null, toDisplayString(unref(sentenceParts).before), 1),
                            createVNode("mark", null, toDisplayString(unref(sentenceParts).target), 1),
                            createVNode("span", null, toDisplayString(unref(sentenceParts).after), 1)
                          ], 40, ["onKeydown"])),
                          unref(selected).ambiguityReason ? (openBlock(), createBlock("p", {
                            key: 0,
                            class: "admin-notice admin-notice--warning"
                          }, toDisplayString(unref(selected).ambiguityReason), 1)) : createCommentVNode("", true),
                          createVNode("dl", null, [
                            createVNode("div", null, [
                              createVNode("dt", null, [
                                createVNode("label", { for: "literary-target-text" }, "Forme")
                              ]),
                              createVNode("dd", null, [
                                withDirectives(createVNode("input", {
                                  id: "literary-target-text",
                                  "onUpdate:modelValue": ($event) => isRef(editableTargetText) ? editableTargetText.value = $event : null,
                                  class: "corpus-inline-edit",
                                  type: "text",
                                  disabled: unref(saving),
                                  title: "Cliquer pour modifier la forme ciblée",
                                  "aria-label": "Forme ciblée dans la phrase",
                                  onBlur: saveTargetText,
                                  onKeydown: [
                                    withKeys(withModifiers(($event) => $event.currentTarget.blur(), ["prevent"]), ["enter"]),
                                    withKeys(withModifiers(cancelTargetEdit, ["prevent"]), ["escape"])
                                  ]
                                }, null, 40, ["onUpdate:modelValue", "disabled", "onKeydown"]), [
                                  [vModelText, unref(editableTargetText)]
                                ])
                              ])
                            ]),
                            createVNode("div", null, [
                              createVNode("dt", null, "Personne"),
                              createVNode("dd", null, toDisplayString(unref(selected).pronoun), 1)
                            ]),
                            createVNode("div", null, [
                              createVNode("dt", null, "Longueur"),
                              createVNode("dd", null, toDisplayString(unref(selected).wordCount) + " mots", 1)
                            ]),
                            createVNode("div", null, [
                              createVNode("dt", null, "Quota"),
                              createVNode("dd", null, toDisplayString(unref(selected).validatedForSelection) + "/10 pour ce verbe, ce temps et cette personne", 1)
                            ]),
                            createVNode("div", null, [
                              createVNode("dt", null, "Source"),
                              createVNode("dd", null, [
                                createTextVNode(toDisplayString(unref(selected).author) + ", ", 1),
                                createVNode("cite", null, toDisplayString(unref(selected).work), 1)
                              ])
                            ]),
                            createVNode("div", null, [
                              createVNode("dt", null, "Emplacement"),
                              createVNode("dd", null, toDisplayString([unref(selected).chapter, unref(selected).locator].filter(Boolean).join(" · ")), 1)
                            ])
                          ]),
                          createVNode("a", {
                            class: "corpus-source",
                            href: unref(selected).sourceUrl,
                            target: "_blank",
                            rel: "noopener noreferrer"
                          }, "Vérifier dans la source ↗", 8, ["href"]),
                          createVNode("footer", null, [
                            createVNode("button", {
                              class: "admin-button admin-button--primary",
                              type: "button",
                              disabled: unref(saving),
                              onClick: ($event) => review("validated")
                            }, "Valider", 8, ["disabled", "onClick"]),
                            createVNode("button", {
                              class: "admin-button",
                              type: "button",
                              disabled: unref(saving),
                              onClick: ($event) => review("reserve")
                            }, "Mettre en réserve", 8, ["disabled", "onClick"]),
                            createVNode("button", {
                              class: "admin-button admin-button--danger",
                              type: "button",
                              disabled: unref(saving),
                              onClick: ($event) => review("rejected")
                            }, "Rejeter", 8, ["disabled", "onClick"]),
                            unref(selected).reviewStatus !== "candidate" ? (openBlock(), createBlock("button", {
                              key: 0,
                              class: "admin-button",
                              type: "button",
                              disabled: unref(saving),
                              onClick: ($event) => review("candidate")
                            }, "Remettre en attente", 8, ["disabled", "onClick"])) : createCommentVNode("", true)
                          ])
                        ])) : createCommentVNode("", true)
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
                  createVNode("div", { class: "corpus-admin" }, [
                    createVNode("header", { class: "corpus-admin__header" }, [
                      createVNode("div", null, [
                        createVNode("p", { class: "admin-eyebrow" }, "Citations contextualisées"),
                        createVNode("h1", null, "Phrases"),
                        createVNode("p", { class: "admin-muted" }, "Parcourez les phrases à contrôler : passer à la suivante valide automatiquement la phrase courante.")
                      ]),
                      createVNode("button", {
                        class: "admin-button admin-button--small",
                        type: "button",
                        disabled: unref(loading),
                        onClick: ($event) => loadTargets()
                      }, toDisplayString(unref(loading) ? "Chargement…" : "Actualiser"), 9, ["disabled", "onClick"])
                    ]),
                    unref(error) ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "admin-notice admin-notice--error",
                      role: "alert"
                    }, toDisplayString(unref(error)), 1)) : createCommentVNode("", true),
                    unref(success) ? (openBlock(), createBlock("p", {
                      key: 1,
                      class: "admin-notice admin-notice--success",
                      role: "status"
                    }, toDisplayString(unref(success)), 1)) : createCommentVNode("", true),
                    createVNode("section", {
                      class: "corpus-stats",
                      "aria-label": "État du corpus"
                    }, [
                      (openBlock(), createBlock(Fragment, null, renderList(["candidate", "validated", "reserve", "rejected"], (item) => {
                        return createVNode("button", {
                          key: item,
                          type: "button",
                          class: { active: unref(status) === item },
                          onClick: ($event) => status.value = item
                        }, [
                          createVNode("strong", null, toDisplayString(unref(counts)[item]), 1),
                          createVNode("span", null, toDisplayString(item === "candidate" ? "Candidates" : item === "validated" ? "Validées" : item === "reserve" ? "En réserve" : "Rejetées"), 1)
                        ], 10, ["onClick"]);
                      }), 64))
                    ]),
                    createVNode("section", { class: "admin-card corpus-filters" }, [
                      createVNode("label", { class: "admin-field" }, [
                        createVNode("span", null, "Statut"),
                        withDirectives(createVNode("select", {
                          "onUpdate:modelValue": ($event) => isRef(status) ? status.value = $event : null
                        }, [
                          createVNode("option", { value: "all" }, "Tous"),
                          createVNode("option", { value: "candidate" }, "Candidates"),
                          createVNode("option", { value: "validated" }, "Validées"),
                          createVNode("option", { value: "reserve" }, "Réserve"),
                          createVNode("option", { value: "rejected" }, "Rejetées")
                        ], 8, ["onUpdate:modelValue"]), [
                          [vModelSelect, unref(status)]
                        ])
                      ]),
                      createVNode("label", { class: "admin-field" }, [
                        createVNode("span", null, "Confiance"),
                        withDirectives(createVNode("select", {
                          "onUpdate:modelValue": ($event) => isRef(confidence) ? confidence.value = $event : null
                        }, [
                          createVNode("option", { value: "all" }, "Toutes"),
                          createVNode("option", { value: "high" }, "Analyse sûre"),
                          createVNode("option", { value: "ambiguous" }, "Ambiguë")
                        ], 8, ["onUpdate:modelValue"]), [
                          [vModelSelect, unref(confidence)]
                        ])
                      ]),
                      createVNode("label", { class: "admin-field" }, [
                        createVNode("span", null, "Œuvre"),
                        withDirectives(createVNode("select", {
                          "onUpdate:modelValue": ($event) => isRef(sourceId) ? sourceId.value = $event : null
                        }, [
                          createVNode("option", { value: 0 }, "Toutes les œuvres"),
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(sources), (source) => {
                            return openBlock(), createBlock("option", {
                              key: source.id,
                              value: source.id
                            }, toDisplayString(source.label) + " — " + toDisplayString(source.author), 9, ["value"]);
                          }), 128))
                        ], 8, ["onUpdate:modelValue"]), [
                          [
                            vModelSelect,
                            unref(sourceId),
                            void 0,
                            { number: true }
                          ]
                        ])
                      ]),
                      createVNode("label", { class: "admin-field corpus-filters__search" }, [
                        createVNode("span", null, "Rechercher"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => isRef(search) ? search.value = $event : null,
                          type: "search",
                          placeholder: "Phrase, œuvre ou verbe"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(search)]
                        ])
                      ])
                    ]),
                    createVNode("section", {
                      class: "admin-card phrase-navigation",
                      "aria-labelledby": "phrase-navigation-title"
                    }, [
                      createVNode("header", null, [
                        createVNode("div", null, [
                          createVNode("p", { class: "admin-eyebrow" }, "Explorer les disponibilités"),
                          createVNode("h2", { id: "phrase-navigation-title" }, "Verbe, mode, temps et personne")
                        ]),
                        unref(modeId) || unref(tenseId) || unref(personId) ? (openBlock(), createBlock("button", {
                          key: 0,
                          class: "admin-button admin-button--small",
                          type: "button",
                          onClick: resetGrammar
                        }, "Effacer la sélection grammaticale")) : createCommentVNode("", true)
                      ]),
                      createVNode("label", { class: "admin-field phrase-navigation__verb" }, [
                        createVNode("span", null, "Verbe"),
                        withDirectives(createVNode("select", {
                          "onUpdate:modelValue": ($event) => isRef(verbId) ? verbId.value = $event : null
                        }, [
                          createVNode("option", { value: 0 }, "Tous les verbes"),
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(verbs), (verb) => {
                            return openBlock(), createBlock("option", {
                              key: verb.id,
                              value: verb.id
                            }, toDisplayString(verb.label) + " — " + toDisplayString(verb.count), 9, ["value"]);
                          }), 128))
                        ], 8, ["onUpdate:modelValue"]), [
                          [
                            vModelSelect,
                            unref(verbId),
                            void 0,
                            { number: true }
                          ]
                        ]),
                        createVNode("small", null, "Les verbes ayant des phrases pour la sélection courante apparaissent en premier.")
                      ]),
                      createVNode("div", { class: "phrase-navigation__level" }, [
                        createVNode("h3", null, [
                          createVNode("span", null, "1"),
                          createTextVNode(" Mode")
                        ]),
                        createVNode("div", { class: "phrase-pills" }, [
                          createVNode("button", {
                            type: "button",
                            class: { active: unref(modeId) === 0 },
                            onClick: ($event) => chooseMode(0)
                          }, [
                            createTextVNode("Tous "),
                            createVNode("strong", null, toDisplayString(unref(modes).reduce((sum, mode) => sum + mode.count, 0)), 1)
                          ], 10, ["onClick"]),
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(modes), (mode) => {
                            return openBlock(), createBlock("button", {
                              key: mode.id,
                              type: "button",
                              class: { active: unref(modeId) === mode.id },
                              onClick: ($event) => chooseMode(mode.id)
                            }, [
                              createTextVNode(toDisplayString(mode.label) + " ", 1),
                              createVNode("strong", null, toDisplayString(mode.count), 1)
                            ], 10, ["onClick"]);
                          }), 128))
                        ])
                      ]),
                      createVNode("div", {
                        class: ["phrase-navigation__level", { muted: !unref(modeId) }]
                      }, [
                        createVNode("h3", null, [
                          createVNode("span", null, "2"),
                          createTextVNode(" Temps")
                        ]),
                        !unref(modeId) ? (openBlock(), createBlock("p", {
                          key: 0,
                          class: "admin-muted"
                        }, "Choisissez d’abord un mode.")) : (openBlock(), createBlock("div", {
                          key: 1,
                          class: "phrase-pills"
                        }, [
                          createVNode("button", {
                            type: "button",
                            class: { active: unref(tenseId) === 0 },
                            onClick: ($event) => chooseTense(0)
                          }, [
                            createTextVNode("Tous "),
                            createVNode("strong", null, toDisplayString(unref(visibleTenses).reduce((sum, tense) => sum + tense.count, 0)), 1)
                          ], 10, ["onClick"]),
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(visibleTenses), (tense) => {
                            return openBlock(), createBlock("button", {
                              key: tense.id,
                              type: "button",
                              class: { active: unref(tenseId) === tense.id },
                              onClick: ($event) => chooseTense(tense.id)
                            }, [
                              createTextVNode(toDisplayString(tense.label) + " ", 1),
                              createVNode("strong", null, toDisplayString(tense.count), 1)
                            ], 10, ["onClick"]);
                          }), 128))
                        ]))
                      ], 2),
                      createVNode("div", {
                        class: ["phrase-navigation__level", { muted: !unref(tenseId) }]
                      }, [
                        createVNode("h3", null, [
                          createVNode("span", null, "3"),
                          createTextVNode(" Personne")
                        ]),
                        !unref(tenseId) ? (openBlock(), createBlock("p", {
                          key: 0,
                          class: "admin-muted"
                        }, "Choisissez d’abord un temps.")) : (openBlock(), createBlock("div", {
                          key: 1,
                          class: "phrase-pills"
                        }, [
                          createVNode("button", {
                            type: "button",
                            class: { active: unref(personId) === 0 },
                            onClick: ($event) => choosePerson(0)
                          }, [
                            createTextVNode("Toutes "),
                            createVNode("strong", null, toDisplayString(unref(persons).reduce((sum, person) => sum + person.count, 0)), 1)
                          ], 10, ["onClick"]),
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(persons), (person) => {
                            return openBlock(), createBlock("button", {
                              key: person.id,
                              type: "button",
                              class: { active: unref(personId) === person.id },
                              onClick: ($event) => choosePerson(person.id)
                            }, [
                              createTextVNode(toDisplayString(person.label) + " ", 1),
                              createVNode("strong", null, toDisplayString(person.count), 1)
                            ], 10, ["onClick"]);
                          }), 128))
                        ]))
                      ], 2)
                    ]),
                    createVNode("div", { class: "corpus-workspace" }, [
                      createVNode("aside", {
                        class: "admin-card corpus-list",
                        "aria-label": "Phrases à examiner"
                      }, [
                        unref(targets).length ? (openBlock(), createBlock("p", {
                          key: 0,
                          class: "corpus-list__shortcuts"
                        }, "↑↓ valider et parcourir · X rejeter")) : createCommentVNode("", true),
                        unref(loading) && !unref(targets).length ? (openBlock(), createBlock("p", {
                          key: 1,
                          class: "corpus-empty"
                        }, "Chargement…")) : !unref(targets).length ? (openBlock(), createBlock("p", {
                          key: 2,
                          class: "corpus-empty"
                        }, "Aucune phrase pour ces filtres.")) : createCommentVNode("", true),
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(targets), (target) => {
                          return openBlock(), createBlock("div", {
                            key: target.id,
                            "data-phrase-id": target.id,
                            class: ["corpus-list__row", { selected: unref(selected)?.id === target.id }]
                          }, [
                            createVNode("button", {
                              class: "corpus-list__select",
                              type: "button",
                              onClick: ($event) => selectTarget(target.id)
                            }, [
                              createVNode("span", null, [
                                createVNode("strong", null, toDisplayString(target.infinitive), 1),
                                createVNode("small", null, toDisplayString(target.mode) + " · " + toDisplayString(target.tense) + " · " + toDisplayString(target.pronoun), 1)
                              ]),
                              createVNode("span", null, toDisplayString(target.text), 1),
                              createVNode("em", {
                                class: `is-${target.confidence}`
                              }, toDisplayString(target.confidence === "high" ? `${target.wordCount} mots` : "Ambiguë"), 3)
                            ], 8, ["onClick"]),
                            createVNode("button", {
                              class: ["corpus-list__quick-review", { "is-restore": target.reviewStatus === "rejected" }],
                              type: "button",
                              disabled: unref(saving),
                              title: target.reviewStatus === "rejected" ? "Valider cette phrase" : "Rejeter cette phrase (X)",
                              "aria-label": target.reviewStatus === "rejected" ? `Valider : ${target.text}` : `Rejeter : ${target.text}`,
                              onClick: ($event) => quickToggleStatus(target)
                            }, toDisplayString(target.reviewStatus === "rejected" ? "✓" : "×"), 11, ["disabled", "title", "aria-label", "onClick"])
                          ], 10, ["data-phrase-id"]);
                        }), 128)),
                        unref(total) > pageSize ? (openBlock(), createBlock("nav", {
                          key: 3,
                          class: "corpus-pagination",
                          "aria-label": "Pagination du corpus"
                        }, [
                          createVNode("button", {
                            type: "button",
                            disabled: unref(loading) || unref(page) === 0,
                            onClick: ($event) => {
                              page.value--;
                              loadTargets();
                            }
                          }, "Précédentes", 8, ["disabled", "onClick"]),
                          createVNode("span", null, toDisplayString(unref(page) * pageSize + 1) + "–" + toDisplayString(Math.min((unref(page) + 1) * pageSize, unref(total))) + " sur " + toDisplayString(unref(total)), 1),
                          createVNode("button", {
                            type: "button",
                            disabled: unref(loading) || (unref(page) + 1) * pageSize >= unref(total),
                            onClick: ($event) => {
                              page.value++;
                              loadTargets();
                            }
                          }, "Suivantes", 8, ["disabled", "onClick"])
                        ])) : createCommentVNode("", true)
                      ]),
                      unref(selected) ? (openBlock(), createBlock("article", {
                        key: 0,
                        class: "admin-card corpus-detail"
                      }, [
                        createVNode("header", null, [
                          createVNode("div", null, [
                            createVNode("p", { class: "admin-eyebrow" }, "Citation #" + toDisplayString(unref(selected).id), 1),
                            createVNode("h2", null, toDisplayString(unref(selected).infinitive) + " · " + toDisplayString(unref(selected).mode) + " · " + toDisplayString(unref(selected).tense), 1)
                          ]),
                          createVNode("span", {
                            class: ["corpus-confidence", `is-${unref(selected).confidence}`]
                          }, toDisplayString(unref(selected).confidence === "high" ? "Analyse sûre" : "Analyse ambiguë"), 3)
                        ]),
                        (openBlock(), createBlock("blockquote", {
                          key: `${unref(selected).id}-${unref(citationRenderVersion)}`,
                          class: "corpus-editable-quote",
                          contenteditable: "plaintext-only",
                          role: "textbox",
                          "aria-label": "Phrase littéraire éditable",
                          title: "Cliquer pour modifier la phrase",
                          spellcheck: "true",
                          onInput: updateEditableSentence,
                          onBlur: saveSentenceText,
                          onKeydown: [
                            withKeys(withModifiers(finishSentenceEdit, ["prevent"]), ["enter"]),
                            withKeys(withModifiers(cancelSentenceEdit, ["prevent"]), ["escape"])
                          ]
                        }, [
                          createVNode("span", null, toDisplayString(unref(sentenceParts).before), 1),
                          createVNode("mark", null, toDisplayString(unref(sentenceParts).target), 1),
                          createVNode("span", null, toDisplayString(unref(sentenceParts).after), 1)
                        ], 40, ["onKeydown"])),
                        unref(selected).ambiguityReason ? (openBlock(), createBlock("p", {
                          key: 0,
                          class: "admin-notice admin-notice--warning"
                        }, toDisplayString(unref(selected).ambiguityReason), 1)) : createCommentVNode("", true),
                        createVNode("dl", null, [
                          createVNode("div", null, [
                            createVNode("dt", null, [
                              createVNode("label", { for: "literary-target-text" }, "Forme")
                            ]),
                            createVNode("dd", null, [
                              withDirectives(createVNode("input", {
                                id: "literary-target-text",
                                "onUpdate:modelValue": ($event) => isRef(editableTargetText) ? editableTargetText.value = $event : null,
                                class: "corpus-inline-edit",
                                type: "text",
                                disabled: unref(saving),
                                title: "Cliquer pour modifier la forme ciblée",
                                "aria-label": "Forme ciblée dans la phrase",
                                onBlur: saveTargetText,
                                onKeydown: [
                                  withKeys(withModifiers(($event) => $event.currentTarget.blur(), ["prevent"]), ["enter"]),
                                  withKeys(withModifiers(cancelTargetEdit, ["prevent"]), ["escape"])
                                ]
                              }, null, 40, ["onUpdate:modelValue", "disabled", "onKeydown"]), [
                                [vModelText, unref(editableTargetText)]
                              ])
                            ])
                          ]),
                          createVNode("div", null, [
                            createVNode("dt", null, "Personne"),
                            createVNode("dd", null, toDisplayString(unref(selected).pronoun), 1)
                          ]),
                          createVNode("div", null, [
                            createVNode("dt", null, "Longueur"),
                            createVNode("dd", null, toDisplayString(unref(selected).wordCount) + " mots", 1)
                          ]),
                          createVNode("div", null, [
                            createVNode("dt", null, "Quota"),
                            createVNode("dd", null, toDisplayString(unref(selected).validatedForSelection) + "/10 pour ce verbe, ce temps et cette personne", 1)
                          ]),
                          createVNode("div", null, [
                            createVNode("dt", null, "Source"),
                            createVNode("dd", null, [
                              createTextVNode(toDisplayString(unref(selected).author) + ", ", 1),
                              createVNode("cite", null, toDisplayString(unref(selected).work), 1)
                            ])
                          ]),
                          createVNode("div", null, [
                            createVNode("dt", null, "Emplacement"),
                            createVNode("dd", null, toDisplayString([unref(selected).chapter, unref(selected).locator].filter(Boolean).join(" · ")), 1)
                          ])
                        ]),
                        createVNode("a", {
                          class: "corpus-source",
                          href: unref(selected).sourceUrl,
                          target: "_blank",
                          rel: "noopener noreferrer"
                        }, "Vérifier dans la source ↗", 8, ["href"]),
                        createVNode("footer", null, [
                          createVNode("button", {
                            class: "admin-button admin-button--primary",
                            type: "button",
                            disabled: unref(saving),
                            onClick: ($event) => review("validated")
                          }, "Valider", 8, ["disabled", "onClick"]),
                          createVNode("button", {
                            class: "admin-button",
                            type: "button",
                            disabled: unref(saving),
                            onClick: ($event) => review("reserve")
                          }, "Mettre en réserve", 8, ["disabled", "onClick"]),
                          createVNode("button", {
                            class: "admin-button admin-button--danger",
                            type: "button",
                            disabled: unref(saving),
                            onClick: ($event) => review("rejected")
                          }, "Rejeter", 8, ["disabled", "onClick"]),
                          unref(selected).reviewStatus !== "candidate" ? (openBlock(), createBlock("button", {
                            key: 0,
                            class: "admin-button",
                            type: "button",
                            disabled: unref(saving),
                            onClick: ($event) => review("candidate")
                          }, "Remettre en attente", 8, ["disabled", "onClick"])) : createCommentVNode("", true)
                        ])
                      ])) : createCommentVNode("", true)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/literary-corpus.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const PhrasesAdminPage = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c6f7e24b"]]);

export { PhrasesAdminPage as default };
//# sourceMappingURL=literary-corpus-C6vzdCIf.mjs.map
