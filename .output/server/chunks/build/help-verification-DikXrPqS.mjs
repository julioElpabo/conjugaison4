import { u as useAdminAuth, _ as __nuxt_component_0, a as __nuxt_component_1, g as getAdminErrorMessage } from './AdminShell-DAeZS54P.mjs';
import { _ as __nuxt_component_0$1 } from './nuxt-link-icjx6oE7.mjs';
import { v as visibleCoachHelpBlocks, c as coachHelpQuestionVariables, _ as __nuxt_component_0$2 } from './CoachHelpPanel-CV6-CBeI.mjs';
import { defineComponent, computed, ref, useTemplateRef, withCtx, unref, createTextVNode, createVNode, toDisplayString, openBlock, createBlock, createCommentVNode, Fragment, withDirectives, isRef, vModelSelect, renderList, nextTick, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderClass, ssrRenderAttr, ssrRenderStyle, ssrLooseContain, ssrLooseEqual, ssrRenderList } from 'vue/server-renderer';
import { a as auditRenderedCoachHelp } from '../_/coach-help-audit.mjs';
import { b as buildRadicalReference } from '../_/radical-reference.mjs';
import { g as useRoute, f as useLanguagePreferences, u as useHead } from './server.mjs';
import { s as setInterval } from './interval-CYXsK9dZ.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import './state-DjsguMyT.mjs';
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
import '../_/coach.mjs';
import '../_/near-future.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "help-verification",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const { handleUnauthorized } = useAdminAuth();
    const { localePath } = useLanguagePreferences();
    const caractereId = computed(() => Number(route.query.caractere));
    const caractere = ref(null);
    const help = computed(() => caractere.value ? {
      id: caractere.value.id,
      name: `Aide automatique — ${caractere.value.masculineName}`,
      description: "",
      headerTitle: "{helpTitle}",
      headerDescription: "",
      status: "draft",
      blocks: visibleCoachHelpBlocks(caractere.value.helpApproach)
    } : null);
    const caractereName = computed(() => caractere.value ? `${caractere.value.emoticon} ${caractere.value.masculineName}` : "");
    const loading = ref(true);
    const running = ref(false);
    const stopping = ref(false);
    const completed = ref(false);
    const error = ref("");
    const totalCases = ref(0);
    const totalVerbs = ref(0);
    const processed = ref(0);
    const nextAfter = ref(0);
    const allLoaded = ref(false);
    const queue = ref([]);
    const currentCase = ref(null);
    const results = ref([]);
    const restoredResults = ref([]);
    const restoredCounts = ref({ passed: 0, warning: 0, failed: 0 });
    const sessionCounts = ref({ passed: 0, warning: 0, failed: 0 });
    const recentResults = ref([]);
    const cursorVerbId = ref(0);
    const cursorFormKeys = ref([]);
    const startedAt = ref(0);
    const elapsedMs = ref(0);
    const resultFilter = ref("problems");
    const previousRun = ref(null);
    const previewHost = useTemplateRef("previewHost");
    let stopRequested = false;
    let activeRequest = null;
    let clock = null;
    useHead({ title: "Vérifier une aide — Administration" });
    const progress = computed(() => totalCases.value ? Math.min(100, processed.value / totalCases.value * 100) : 0);
    const counts = computed(() => ({
      passed: restoredCounts.value.passed + sessionCounts.value.passed,
      warning: restoredCounts.value.warning + sessionCounts.value.warning,
      failed: restoredCounts.value.failed + sessionCounts.value.failed
    }));
    const visibleResults = computed(() => recentResults.value.filter((result) => resultFilter.value === "all" || resultFilter.value === "problems" && result.status !== "passed" || resultFilter.value === "failed" && result.status === "failed").slice().reverse().slice(0, 250));
    computed(() => `coach-help-audit:caractere:${caractereId.value}`);
    const auditState = computed(() => {
      if (stopping.value) return { kind: "running", title: "Interruption en cours…", detail: "Le cas en cours se termine avant l’arrêt." };
      if (running.value) return { kind: "running", title: "Vérification en cours", detail: currentCase.value ? `Test de ${currentCase.value.verb.infinitif} · ${currentCase.value.form.tense} · ${currentCase.value.form.pronoun}` : "Préparation du premier cas…" };
      if (completed.value) return { kind: "completed", title: "Vérification terminée", detail: `${processed.value.toLocaleString("fr-CH")} formes ont été contrôlées.` };
      if (error.value && processed.value) return { kind: "error", title: "Vérification arrêtée par une erreur", detail: error.value };
      if (processed.value) return { kind: "interrupted", title: "Vérification interrompue", detail: `${(totalCases.value - processed.value).toLocaleString("fr-CH")} formes restent à contrôler. Tu peux reprendre.` };
      return { kind: "ready", title: "Prête à démarrer", detail: "Aucune forme n’est en cours de vérification." };
    });
    const remainingLabel = computed(() => {
      if (completed.value) return "Vérification terminée";
      if (!running.value) return processed.value ? "Vérification interrompue" : "Prête à démarrer";
      if (!processed.value || !elapsedMs.value) return "Estimation après les premiers cas…";
      if (processed.value >= totalCases.value) return "Finalisation…";
      const remainingMs = elapsedMs.value / processed.value * (totalCases.value - processed.value);
      const minutes = Math.floor(remainingMs / 6e4);
      const seconds = Math.max(0, Math.round(remainingMs % 6e4 / 1e3));
      return minutes ? `Environ ${minutes} min ${seconds} s restantes` : `Environ ${seconds} s restantes`;
    });
    function saveAuditSummary(status) {
      return;
    }
    function previousRunLabel(summary) {
      const date = new Intl.DateTimeFormat("fr-CH", { dateStyle: "short", timeStyle: "short" }).format(new Date(summary.updatedAt));
      const state = summary.status === "completed" ? "terminée" : summary.status === "error" ? "arrêtée par une erreur" : "interrompue";
      return `Dernière vérification ${state} le ${date}`;
    }
    const currentValues = computed(() => {
      const item = currentCase.value;
      if (!item) return { coach: { firstName: "Audit" } };
      return {
        coach: { firstName: "Audit" },
        definition: item.verb.meaning || "",
        helpTitle: `${item.verb.infinitif} · ${item.form.tense} (${item.form.mode.toLocaleLowerCase("fr")})`,
        ...coachHelpQuestionVariables(item.question, item.verb, item.tense)
      };
    });
    const automaticBlocks = computed(() => visibleCoachHelpBlocks(help.value));
    function makeCase(entry, form) {
      const accepted = [form.conjugaison1, form.conjugaison2, form.conjugaison3].map((value) => value.trim()).filter(Boolean);
      const reference = buildRadicalReference({
        infinitive: entry.verb.infinitif,
        mode: form.mode,
        tense: form.tense,
        personId: form.personId,
        conjugation: form.conjugaison1,
        isCompound: form.isCompound
      }, entry.conjugations.map((candidate) => ({
        mode: candidate.mode,
        tense: candidate.tense,
        personId: candidate.personId,
        pronoun: candidate.pronoun,
        form: candidate.conjugaison1
      })));
      const question = {
        titre: entry.verb.infinitif,
        consigne: `${form.pronoun} | ${entry.verb.infinitif} | ${form.tense} (${form.mode})`,
        reponses: accepted,
        reponsesPourCorrige: accepted.map((answer) => `${form.pronoun} ${answer}`.trim()),
        verbeId: entry.verb.id,
        tenseId: form.tenseId,
        personId: form.personId,
        infinitif: entry.verb.infinitif,
        pronom: form.pronoun,
        saisiePrefixe: form.pronoun,
        temps: form.tense,
        mode: form.mode,
        isCompound: form.isCompound,
        conjugaison1: form.conjugaison1,
        conjugaison2: form.conjugaison2 || null,
        conjugaison3: form.conjugaison3 || null,
        nousForm: entry.conjugations.find((candidate) => candidate.tenseId === form.tenseId && candidate.personId === 7)?.conjugaison1 || null,
        ...reference ? { radicalReference: reference } : {}
      };
      return {
        key: `${entry.verb.id}:${form.tenseId}:${form.personId}`,
        verb: entry.verb,
        form,
        question,
        tense: {
          id: form.tenseId,
          modeId: form.modeId,
          name: form.tense,
          isCompound: form.isCompound,
          selected: true,
          mode: { id: form.modeId, name: form.mode, order: 0 }
        }
      };
    }
    async function fetchBatch() {
      activeRequest = new AbortController();
      try {
        const batch = await $fetch(`/api/admin/coach-caracteres/${caractereId.value}/audit-cases`, {
          query: { after: nextAfter.value, limit: 8 },
          signal: activeRequest.signal,
          credentials: "same-origin"
        });
        totalCases.value = batch.totalCases;
        totalVerbs.value = batch.totalVerbs;
        nextAfter.value = batch.nextAfter;
        allLoaded.value = batch.done;
        const alreadyProcessed = new Set(cursorFormKeys.value);
        queue.value.push(...batch.verbs.flatMap((entry) => entry.conjugations.map((form) => makeCase(entry, form)).filter((item) => entry.verb.id !== cursorVerbId.value || !alreadyProcessed.has(item.key))));
      } finally {
        activeRequest = null;
      }
    }
    function nextPaint() {
      return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    }
    async function runAudit() {
      if (running.value || !help.value) return;
      if (completed.value) resetAudit();
      running.value = true;
      stopping.value = false;
      stopRequested = false;
      error.value = "";
      startedAt.value = Date.now() - elapsedMs.value;
      clock = setInterval();
      try {
        while (!stopRequested) {
          if (!queue.value.length) {
            if (allLoaded.value) break;
            await fetchBatch();
            if (!queue.value.length && allLoaded.value) break;
          }
          const item = queue.value.shift();
          if (!item) continue;
          currentCase.value = item;
          const caseStartedAt = performance.now();
          await nextTick();
          await nextPaint();
          if (stopRequested) {
            queue.value.unshift(item);
            break;
          }
          const verdict = auditRenderedCoachHelp({
            renderedHtml: previewHost.value?.innerHTML || "",
            blocks: automaticBlocks.value,
            question: item.question,
            verb: item.verb,
            tense: item.tense
          });
          const storedResult = {
            ...verdict,
            key: item.key,
            verb: item.verb.infinitif,
            mode: item.form.mode,
            tense: item.form.tense,
            person: item.form.pronoun,
            expected: item.form.conjugaison1,
            durationMs: Math.round(performance.now() - caseStartedAt)
          };
          results.value.push(storedResult);
          recentResults.value = [...recentResults.value, storedResult].slice(-250);
          sessionCounts.value[storedResult.status] += 1;
          if (cursorVerbId.value !== item.verb.id) {
            cursorVerbId.value = item.verb.id;
            cursorFormKeys.value = [];
          }
          cursorFormKeys.value.push(item.key);
          processed.value += 1;
          elapsedMs.value = Date.now() - startedAt.value;
          if (processed.value % 10 === 0) saveAuditSummary("running");
          if (processed.value % 12 === 0) await new Promise((resolve) => (void 0).setTimeout(resolve, 0));
        }
        completed.value = !stopRequested && allLoaded.value && queue.value.length === 0;
      } catch (caught) {
        if (!stopRequested && !handleUnauthorized(caught)) {
          error.value = getAdminErrorMessage(caught, "La vérification a été interrompue par une erreur.");
        }
      } finally {
        running.value = false;
        stopping.value = false;
        if (clock) clearInterval(clock);
        clock = null;
        if (startedAt.value) elapsedMs.value = Date.now() - startedAt.value;
        if (completed.value) ;
      }
    }
    function stopAudit() {
      if (!running.value) return;
      stopping.value = true;
      stopRequested = true;
      activeRequest?.abort();
    }
    function resetAudit() {
      stopAudit();
      processed.value = 0;
      nextAfter.value = 0;
      allLoaded.value = false;
      queue.value = [];
      currentCase.value = null;
      results.value = [];
      restoredResults.value = [];
      restoredCounts.value = { passed: 0, warning: 0, failed: 0 };
      sessionCounts.value = { passed: 0, warning: 0, failed: 0 };
      recentResults.value = [];
      cursorVerbId.value = 0;
      cursorFormKeys.value = [];
      completed.value = false;
      elapsedMs.value = 0;
      startedAt.value = 0;
      previousRun.value = null;
    }
    function exportReport() {
      if (!results.value.length) return;
      const payload = JSON.stringify({
        help: help.value?.name,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        processed: processed.value,
        totalCases: totalCases.value,
        counts: counts.value,
        results: [...restoredResults.value, ...results.value]
      }, null, 2);
      const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
      const anchor = (void 0).createElement("a");
      anchor.href = url;
      anchor.download = `audit-aide-caractere-${caractereId.value}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminAuthBoundary = __nuxt_component_0;
      const _component_AdminShell = __nuxt_component_1;
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_CoachHelpPanel = __nuxt_component_0$2;
      _push(ssrRenderComponent(_component_AdminAuthBoundary, _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_AdminShell, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<main class="help-audit" data-v-d3b86c81${_scopeId2}><header class="admin-section-heading audit-heading" data-v-d3b86c81${_scopeId2}><div data-v-d3b86c81${_scopeId2}><p class="admin-eyebrow" data-v-d3b86c81${_scopeId2}>Vérification exhaustive</p><h1 data-v-d3b86c81${_scopeId2}>${ssrInterpolate(unref(help)?.name || "Aide")}</h1>`);
                  if (unref(caractereName)) {
                    _push3(`<p data-v-d3b86c81${_scopeId2}>${ssrInterpolate(unref(caractereName))}</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</div><div class="audit-heading__actions" data-v-d3b86c81${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_NuxtLink, {
                    class: "admin-button admin-button--small",
                    to: { path: unref(localePath)("/admin/helps"), query: { caractere: unref(caractereId) } }
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`Retour à l’aide`);
                      } else {
                        return [
                          createTextVNode("Retour à l’aide")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<button class="admin-button admin-button--small" type="button"${ssrIncludeBooleanAttr(!unref(results).length) ? " disabled" : ""} data-v-d3b86c81${_scopeId2}>Exporter le rapport</button></div></header>`);
                  if (unref(error)) {
                    _push3(`<p class="admin-error" data-v-d3b86c81${_scopeId2}>${ssrInterpolate(unref(error))}</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (unref(loading)) {
                    _push3(`<section class="admin-card audit-loading" data-v-d3b86c81${_scopeId2}>Préparation des verbes et des conjugaisons…</section>`);
                  } else if (unref(help)) {
                    _push3(`<!--[--><section class="admin-card audit-control" data-v-d3b86c81${_scopeId2}><div class="audit-control__top" data-v-d3b86c81${_scopeId2}><div data-v-d3b86c81${_scopeId2}><p class="admin-eyebrow" data-v-d3b86c81${_scopeId2}>Progression</p><strong data-v-d3b86c81${_scopeId2}>${ssrInterpolate(unref(processed).toLocaleString("fr-CH"))} / ${ssrInterpolate(unref(totalCases).toLocaleString("fr-CH"))} formes</strong><small data-v-d3b86c81${_scopeId2}>${ssrInterpolate(unref(totalVerbs).toLocaleString("fr-CH"))} verbes dans la base · ${ssrInterpolate(unref(remainingLabel))}</small></div><div class="audit-control__buttons" data-v-d3b86c81${_scopeId2}>`);
                    if (!unref(running)) {
                      _push3(`<button class="admin-button audit-start" type="button" data-v-d3b86c81${_scopeId2}>${ssrInterpolate(unref(completed) ? "Relancer la vérification" : unref(processed) ? "Reprendre" : "Lancer la vérification")}</button>`);
                    } else {
                      _push3(`<button class="admin-button admin-button--danger" type="button"${ssrIncludeBooleanAttr(unref(stopping)) ? " disabled" : ""} data-v-d3b86c81${_scopeId2}>${ssrInterpolate(unref(stopping) ? "Interruption…" : "Interrompre")}</button>`);
                    }
                    _push3(`<button class="admin-button admin-button--small" type="button"${ssrIncludeBooleanAttr(unref(running) || !unref(processed)) ? " disabled" : ""} data-v-d3b86c81${_scopeId2}>Recommencer</button></div></div><div class="${ssrRenderClass([`is-${unref(auditState).kind}`, "audit-state"])}" role="status" aria-live="polite" data-v-d3b86c81${_scopeId2}><span class="audit-state__icon" aria-hidden="true" data-v-d3b86c81${_scopeId2}>${ssrInterpolate(unref(auditState).kind === "completed" ? "✓" : unref(auditState).kind === "error" ? "!" : unref(auditState).kind === "interrupted" ? "Ⅱ" : unref(auditState).kind === "running" ? "●" : "○")}</span><div data-v-d3b86c81${_scopeId2}><strong data-v-d3b86c81${_scopeId2}>${ssrInterpolate(unref(auditState).title)}</strong><span data-v-d3b86c81${_scopeId2}>${ssrInterpolate(unref(auditState).detail)}</span></div></div>`);
                    if (!unref(processed) && unref(previousRun)) {
                      _push3(`<div class="audit-previous" data-v-d3b86c81${_scopeId2}><div data-v-d3b86c81${_scopeId2}><strong data-v-d3b86c81${_scopeId2}>${ssrInterpolate(previousRunLabel(unref(previousRun)))}</strong><span data-v-d3b86c81${_scopeId2}>${ssrInterpolate(unref(previousRun).processed.toLocaleString("fr-CH"))} / ${ssrInterpolate(unref(previousRun).totalCases.toLocaleString("fr-CH"))} formes · ${ssrInterpolate(unref(previousRun).passed)} conformes · ${ssrInterpolate(unref(previousRun).warning)} à examiner · ${ssrInterpolate(unref(previousRun).failed)} erreurs</span></div><small data-v-d3b86c81${_scopeId2}>Ce résumé est conservé après le rechargement de la page. Lance une nouvelle vérification pour obtenir le détail.</small></div>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`<div class="audit-progress" role="progressbar"${ssrRenderAttr("aria-valuenow", Math.round(unref(progress)))} aria-valuemin="0" aria-valuemax="100" data-v-d3b86c81${_scopeId2}><span style="${ssrRenderStyle({ width: `${unref(progress)}%` })}" data-v-d3b86c81${_scopeId2}></span></div><div class="audit-stats" data-v-d3b86c81${_scopeId2}><span class="is-passed" data-v-d3b86c81${_scopeId2}><strong data-v-d3b86c81${_scopeId2}>${ssrInterpolate(unref(counts).passed)}</strong> conformes</span><span class="is-warning" data-v-d3b86c81${_scopeId2}><strong data-v-d3b86c81${_scopeId2}>${ssrInterpolate(unref(counts).warning)}</strong> à examiner</span><span class="is-failed" data-v-d3b86c81${_scopeId2}><strong data-v-d3b86c81${_scopeId2}>${ssrInterpolate(unref(counts).failed)}</strong> erreurs</span><span data-v-d3b86c81${_scopeId2}><strong data-v-d3b86c81${_scopeId2}>${ssrInterpolate(unref(progress).toFixed(1))} %</strong> terminé</span></div></section><div class="audit-workspace" data-v-d3b86c81${_scopeId2}><section class="admin-card audit-results" data-v-d3b86c81${_scopeId2}><div class="audit-section-title" data-v-d3b86c81${_scopeId2}><div data-v-d3b86c81${_scopeId2}><p class="admin-eyebrow" data-v-d3b86c81${_scopeId2}>Résultats</p><h2 data-v-d3b86c81${_scopeId2}>Contrôles automatiques</h2></div><select aria-label="Filtrer les résultats" data-v-d3b86c81${_scopeId2}><option value="problems" data-v-d3b86c81${ssrIncludeBooleanAttr(Array.isArray(unref(resultFilter)) ? ssrLooseContain(unref(resultFilter), "problems") : ssrLooseEqual(unref(resultFilter), "problems")) ? " selected" : ""}${_scopeId2}>À examiner</option><option value="failed" data-v-d3b86c81${ssrIncludeBooleanAttr(Array.isArray(unref(resultFilter)) ? ssrLooseContain(unref(resultFilter), "failed") : ssrLooseEqual(unref(resultFilter), "failed")) ? " selected" : ""}${_scopeId2}>Erreurs seulement</option><option value="all" data-v-d3b86c81${ssrIncludeBooleanAttr(Array.isArray(unref(resultFilter)) ? ssrLooseContain(unref(resultFilter), "all") : ssrLooseEqual(unref(resultFilter), "all")) ? " selected" : ""}${_scopeId2}>Tous les cas</option></select></div><p class="audit-note" data-v-d3b86c81${_scopeId2}>Ce contrôle rapide vérifie le rendu et les incohérences certaines. La campagne sémantique complète mémorisée séparément contrôle aussi les modèles pédagogiques, les irrégularités, les cas suspects et un échantillon régulier avant d’accorder le tag « Approuvé » à un verbe.</p>`);
                    if (!unref(visibleResults).length) {
                      _push3(`<div class="audit-empty" data-v-d3b86c81${_scopeId2}>${ssrInterpolate(unref(processed) ? "Aucun résultat dans ce filtre." : "Lance la vérification pour voir les résultats en direct.")}</div>`);
                    } else {
                      _push3(`<ol class="audit-result-list" data-v-d3b86c81${_scopeId2}><!--[-->`);
                      ssrRenderList(unref(visibleResults), (result) => {
                        _push3(`<li class="${ssrRenderClass(`is-${result.status}`)}" data-v-d3b86c81${_scopeId2}><div data-v-d3b86c81${_scopeId2}><strong data-v-d3b86c81${_scopeId2}>${ssrInterpolate(result.verb)} · ${ssrInterpolate(result.tense)}</strong><span data-v-d3b86c81${_scopeId2}>${ssrInterpolate(result.mode)} · ${ssrInterpolate(result.person)} → ${ssrInterpolate(result.expected)}</span></div><span class="audit-status" data-v-d3b86c81${_scopeId2}>${ssrInterpolate(result.status === "passed" ? "Conforme" : result.status === "warning" ? "À examiner" : "Erreur")}</span>`);
                        if (result.issues.length) {
                          _push3(`<ul data-v-d3b86c81${_scopeId2}><!--[-->`);
                          ssrRenderList(result.issues, (item) => {
                            _push3(`<li data-v-d3b86c81${_scopeId2}><strong data-v-d3b86c81${_scopeId2}>${ssrInterpolate(item.title)}</strong><span data-v-d3b86c81${_scopeId2}>${ssrInterpolate(item.detail)}</span></li>`);
                          });
                          _push3(`<!--]--></ul>`);
                        } else {
                          _push3(`<!---->`);
                        }
                        _push3(`</li>`);
                      });
                      _push3(`<!--]--></ol>`);
                    }
                    _push3(`</section><aside class="audit-live" data-v-d3b86c81${_scopeId2}><div class="audit-live__heading" data-v-d3b86c81${_scopeId2}><div data-v-d3b86c81${_scopeId2}><p class="admin-eyebrow" data-v-d3b86c81${_scopeId2}>Test en direct</p><h2 data-v-d3b86c81${_scopeId2}>${ssrInterpolate(unref(currentCase) ? `${unref(currentCase).verb.infinitif} · ${unref(currentCase).form.tense}` : "En attente")}</h2></div>`);
                    if (unref(currentCase)) {
                      _push3(`<span data-v-d3b86c81${_scopeId2}>${ssrInterpolate(unref(currentCase).form.pronoun)} → ${ssrInterpolate(unref(currentCase).form.conjugaison1)}</span>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`</div><div class="audit-preview" data-v-d3b86c81${_scopeId2}>`);
                    if (unref(currentCase)) {
                      _push3(ssrRenderComponent(_component_CoachHelpPanel, {
                        blocks: unref(automaticBlocks),
                        values: unref(currentValues),
                        "header-title": "{helpTitle}",
                        "header-description": "",
                        "question-number": 3,
                        "coach-color": "#35688f",
                        embedded: ""
                      }, null, _parent3, _scopeId2));
                    } else {
                      _push3(`<div class="audit-preview__empty" data-v-d3b86c81${_scopeId2}>Le composant d’aide apparaîtra ici pendant la vérification.</div>`);
                    }
                    _push3(`</div></aside></div><!--]-->`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</main>`);
                } else {
                  return [
                    createVNode("main", { class: "help-audit" }, [
                      createVNode("header", { class: "admin-section-heading audit-heading" }, [
                        createVNode("div", null, [
                          createVNode("p", { class: "admin-eyebrow" }, "Vérification exhaustive"),
                          createVNode("h1", null, toDisplayString(unref(help)?.name || "Aide"), 1),
                          unref(caractereName) ? (openBlock(), createBlock("p", { key: 0 }, toDisplayString(unref(caractereName)), 1)) : createCommentVNode("", true)
                        ]),
                        createVNode("div", { class: "audit-heading__actions" }, [
                          createVNode(_component_NuxtLink, {
                            class: "admin-button admin-button--small",
                            to: { path: unref(localePath)("/admin/helps"), query: { caractere: unref(caractereId) } }
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Retour à l’aide")
                            ]),
                            _: 1
                          }, 8, ["to"]),
                          createVNode("button", {
                            class: "admin-button admin-button--small",
                            type: "button",
                            disabled: !unref(results).length,
                            onClick: exportReport
                          }, "Exporter le rapport", 8, ["disabled"])
                        ])
                      ]),
                      unref(error) ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "admin-error"
                      }, toDisplayString(unref(error)), 1)) : createCommentVNode("", true),
                      unref(loading) ? (openBlock(), createBlock("section", {
                        key: 1,
                        class: "admin-card audit-loading"
                      }, "Préparation des verbes et des conjugaisons…")) : unref(help) ? (openBlock(), createBlock(Fragment, { key: 2 }, [
                        createVNode("section", { class: "admin-card audit-control" }, [
                          createVNode("div", { class: "audit-control__top" }, [
                            createVNode("div", null, [
                              createVNode("p", { class: "admin-eyebrow" }, "Progression"),
                              createVNode("strong", null, toDisplayString(unref(processed).toLocaleString("fr-CH")) + " / " + toDisplayString(unref(totalCases).toLocaleString("fr-CH")) + " formes", 1),
                              createVNode("small", null, toDisplayString(unref(totalVerbs).toLocaleString("fr-CH")) + " verbes dans la base · " + toDisplayString(unref(remainingLabel)), 1)
                            ]),
                            createVNode("div", { class: "audit-control__buttons" }, [
                              !unref(running) ? (openBlock(), createBlock("button", {
                                key: 0,
                                class: "admin-button audit-start",
                                type: "button",
                                onClick: runAudit
                              }, toDisplayString(unref(completed) ? "Relancer la vérification" : unref(processed) ? "Reprendre" : "Lancer la vérification"), 1)) : (openBlock(), createBlock("button", {
                                key: 1,
                                class: "admin-button admin-button--danger",
                                type: "button",
                                disabled: unref(stopping),
                                onClick: stopAudit
                              }, toDisplayString(unref(stopping) ? "Interruption…" : "Interrompre"), 9, ["disabled"])),
                              createVNode("button", {
                                class: "admin-button admin-button--small",
                                type: "button",
                                disabled: unref(running) || !unref(processed),
                                onClick: resetAudit
                              }, "Recommencer", 8, ["disabled"])
                            ])
                          ]),
                          createVNode("div", {
                            class: ["audit-state", `is-${unref(auditState).kind}`],
                            role: "status",
                            "aria-live": "polite"
                          }, [
                            createVNode("span", {
                              class: "audit-state__icon",
                              "aria-hidden": "true"
                            }, toDisplayString(unref(auditState).kind === "completed" ? "✓" : unref(auditState).kind === "error" ? "!" : unref(auditState).kind === "interrupted" ? "Ⅱ" : unref(auditState).kind === "running" ? "●" : "○"), 1),
                            createVNode("div", null, [
                              createVNode("strong", null, toDisplayString(unref(auditState).title), 1),
                              createVNode("span", null, toDisplayString(unref(auditState).detail), 1)
                            ])
                          ], 2),
                          !unref(processed) && unref(previousRun) ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: "audit-previous"
                          }, [
                            createVNode("div", null, [
                              createVNode("strong", null, toDisplayString(previousRunLabel(unref(previousRun))), 1),
                              createVNode("span", null, toDisplayString(unref(previousRun).processed.toLocaleString("fr-CH")) + " / " + toDisplayString(unref(previousRun).totalCases.toLocaleString("fr-CH")) + " formes · " + toDisplayString(unref(previousRun).passed) + " conformes · " + toDisplayString(unref(previousRun).warning) + " à examiner · " + toDisplayString(unref(previousRun).failed) + " erreurs", 1)
                            ]),
                            createVNode("small", null, "Ce résumé est conservé après le rechargement de la page. Lance une nouvelle vérification pour obtenir le détail.")
                          ])) : createCommentVNode("", true),
                          createVNode("div", {
                            class: "audit-progress",
                            role: "progressbar",
                            "aria-valuenow": Math.round(unref(progress)),
                            "aria-valuemin": "0",
                            "aria-valuemax": "100"
                          }, [
                            createVNode("span", {
                              style: { width: `${unref(progress)}%` }
                            }, null, 4)
                          ], 8, ["aria-valuenow"]),
                          createVNode("div", { class: "audit-stats" }, [
                            createVNode("span", { class: "is-passed" }, [
                              createVNode("strong", null, toDisplayString(unref(counts).passed), 1),
                              createTextVNode(" conformes")
                            ]),
                            createVNode("span", { class: "is-warning" }, [
                              createVNode("strong", null, toDisplayString(unref(counts).warning), 1),
                              createTextVNode(" à examiner")
                            ]),
                            createVNode("span", { class: "is-failed" }, [
                              createVNode("strong", null, toDisplayString(unref(counts).failed), 1),
                              createTextVNode(" erreurs")
                            ]),
                            createVNode("span", null, [
                              createVNode("strong", null, toDisplayString(unref(progress).toFixed(1)) + " %", 1),
                              createTextVNode(" terminé")
                            ])
                          ])
                        ]),
                        createVNode("div", { class: "audit-workspace" }, [
                          createVNode("section", { class: "admin-card audit-results" }, [
                            createVNode("div", { class: "audit-section-title" }, [
                              createVNode("div", null, [
                                createVNode("p", { class: "admin-eyebrow" }, "Résultats"),
                                createVNode("h2", null, "Contrôles automatiques")
                              ]),
                              withDirectives(createVNode("select", {
                                "onUpdate:modelValue": ($event) => isRef(resultFilter) ? resultFilter.value = $event : null,
                                "aria-label": "Filtrer les résultats"
                              }, [
                                createVNode("option", { value: "problems" }, "À examiner"),
                                createVNode("option", { value: "failed" }, "Erreurs seulement"),
                                createVNode("option", { value: "all" }, "Tous les cas")
                              ], 8, ["onUpdate:modelValue"]), [
                                [vModelSelect, unref(resultFilter)]
                              ])
                            ]),
                            createVNode("p", { class: "audit-note" }, "Ce contrôle rapide vérifie le rendu et les incohérences certaines. La campagne sémantique complète mémorisée séparément contrôle aussi les modèles pédagogiques, les irrégularités, les cas suspects et un échantillon régulier avant d’accorder le tag « Approuvé » à un verbe."),
                            !unref(visibleResults).length ? (openBlock(), createBlock("div", {
                              key: 0,
                              class: "audit-empty"
                            }, toDisplayString(unref(processed) ? "Aucun résultat dans ce filtre." : "Lance la vérification pour voir les résultats en direct."), 1)) : (openBlock(), createBlock("ol", {
                              key: 1,
                              class: "audit-result-list"
                            }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(unref(visibleResults), (result) => {
                                return openBlock(), createBlock("li", {
                                  key: result.key,
                                  class: `is-${result.status}`
                                }, [
                                  createVNode("div", null, [
                                    createVNode("strong", null, toDisplayString(result.verb) + " · " + toDisplayString(result.tense), 1),
                                    createVNode("span", null, toDisplayString(result.mode) + " · " + toDisplayString(result.person) + " → " + toDisplayString(result.expected), 1)
                                  ]),
                                  createVNode("span", { class: "audit-status" }, toDisplayString(result.status === "passed" ? "Conforme" : result.status === "warning" ? "À examiner" : "Erreur"), 1),
                                  result.issues.length ? (openBlock(), createBlock("ul", { key: 0 }, [
                                    (openBlock(true), createBlock(Fragment, null, renderList(result.issues, (item) => {
                                      return openBlock(), createBlock("li", {
                                        key: item.code
                                      }, [
                                        createVNode("strong", null, toDisplayString(item.title), 1),
                                        createVNode("span", null, toDisplayString(item.detail), 1)
                                      ]);
                                    }), 128))
                                  ])) : createCommentVNode("", true)
                                ], 2);
                              }), 128))
                            ]))
                          ]),
                          createVNode("aside", { class: "audit-live" }, [
                            createVNode("div", { class: "audit-live__heading" }, [
                              createVNode("div", null, [
                                createVNode("p", { class: "admin-eyebrow" }, "Test en direct"),
                                createVNode("h2", null, toDisplayString(unref(currentCase) ? `${unref(currentCase).verb.infinitif} · ${unref(currentCase).form.tense}` : "En attente"), 1)
                              ]),
                              unref(currentCase) ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(unref(currentCase).form.pronoun) + " → " + toDisplayString(unref(currentCase).form.conjugaison1), 1)) : createCommentVNode("", true)
                            ]),
                            createVNode("div", {
                              ref_key: "previewHost",
                              ref: previewHost,
                              class: "audit-preview"
                            }, [
                              unref(currentCase) ? (openBlock(), createBlock(_component_CoachHelpPanel, {
                                key: 0,
                                blocks: unref(automaticBlocks),
                                values: unref(currentValues),
                                "header-title": "{helpTitle}",
                                "header-description": "",
                                "question-number": 3,
                                "coach-color": "#35688f",
                                embedded: ""
                              }, null, 8, ["blocks", "values"])) : (openBlock(), createBlock("div", {
                                key: 1,
                                class: "audit-preview__empty"
                              }, "Le composant d’aide apparaîtra ici pendant la vérification."))
                            ], 512)
                          ])
                        ])
                      ], 64)) : createCommentVNode("", true)
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
                  createVNode("main", { class: "help-audit" }, [
                    createVNode("header", { class: "admin-section-heading audit-heading" }, [
                      createVNode("div", null, [
                        createVNode("p", { class: "admin-eyebrow" }, "Vérification exhaustive"),
                        createVNode("h1", null, toDisplayString(unref(help)?.name || "Aide"), 1),
                        unref(caractereName) ? (openBlock(), createBlock("p", { key: 0 }, toDisplayString(unref(caractereName)), 1)) : createCommentVNode("", true)
                      ]),
                      createVNode("div", { class: "audit-heading__actions" }, [
                        createVNode(_component_NuxtLink, {
                          class: "admin-button admin-button--small",
                          to: { path: unref(localePath)("/admin/helps"), query: { caractere: unref(caractereId) } }
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Retour à l’aide")
                          ]),
                          _: 1
                        }, 8, ["to"]),
                        createVNode("button", {
                          class: "admin-button admin-button--small",
                          type: "button",
                          disabled: !unref(results).length,
                          onClick: exportReport
                        }, "Exporter le rapport", 8, ["disabled"])
                      ])
                    ]),
                    unref(error) ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "admin-error"
                    }, toDisplayString(unref(error)), 1)) : createCommentVNode("", true),
                    unref(loading) ? (openBlock(), createBlock("section", {
                      key: 1,
                      class: "admin-card audit-loading"
                    }, "Préparation des verbes et des conjugaisons…")) : unref(help) ? (openBlock(), createBlock(Fragment, { key: 2 }, [
                      createVNode("section", { class: "admin-card audit-control" }, [
                        createVNode("div", { class: "audit-control__top" }, [
                          createVNode("div", null, [
                            createVNode("p", { class: "admin-eyebrow" }, "Progression"),
                            createVNode("strong", null, toDisplayString(unref(processed).toLocaleString("fr-CH")) + " / " + toDisplayString(unref(totalCases).toLocaleString("fr-CH")) + " formes", 1),
                            createVNode("small", null, toDisplayString(unref(totalVerbs).toLocaleString("fr-CH")) + " verbes dans la base · " + toDisplayString(unref(remainingLabel)), 1)
                          ]),
                          createVNode("div", { class: "audit-control__buttons" }, [
                            !unref(running) ? (openBlock(), createBlock("button", {
                              key: 0,
                              class: "admin-button audit-start",
                              type: "button",
                              onClick: runAudit
                            }, toDisplayString(unref(completed) ? "Relancer la vérification" : unref(processed) ? "Reprendre" : "Lancer la vérification"), 1)) : (openBlock(), createBlock("button", {
                              key: 1,
                              class: "admin-button admin-button--danger",
                              type: "button",
                              disabled: unref(stopping),
                              onClick: stopAudit
                            }, toDisplayString(unref(stopping) ? "Interruption…" : "Interrompre"), 9, ["disabled"])),
                            createVNode("button", {
                              class: "admin-button admin-button--small",
                              type: "button",
                              disabled: unref(running) || !unref(processed),
                              onClick: resetAudit
                            }, "Recommencer", 8, ["disabled"])
                          ])
                        ]),
                        createVNode("div", {
                          class: ["audit-state", `is-${unref(auditState).kind}`],
                          role: "status",
                          "aria-live": "polite"
                        }, [
                          createVNode("span", {
                            class: "audit-state__icon",
                            "aria-hidden": "true"
                          }, toDisplayString(unref(auditState).kind === "completed" ? "✓" : unref(auditState).kind === "error" ? "!" : unref(auditState).kind === "interrupted" ? "Ⅱ" : unref(auditState).kind === "running" ? "●" : "○"), 1),
                          createVNode("div", null, [
                            createVNode("strong", null, toDisplayString(unref(auditState).title), 1),
                            createVNode("span", null, toDisplayString(unref(auditState).detail), 1)
                          ])
                        ], 2),
                        !unref(processed) && unref(previousRun) ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "audit-previous"
                        }, [
                          createVNode("div", null, [
                            createVNode("strong", null, toDisplayString(previousRunLabel(unref(previousRun))), 1),
                            createVNode("span", null, toDisplayString(unref(previousRun).processed.toLocaleString("fr-CH")) + " / " + toDisplayString(unref(previousRun).totalCases.toLocaleString("fr-CH")) + " formes · " + toDisplayString(unref(previousRun).passed) + " conformes · " + toDisplayString(unref(previousRun).warning) + " à examiner · " + toDisplayString(unref(previousRun).failed) + " erreurs", 1)
                          ]),
                          createVNode("small", null, "Ce résumé est conservé après le rechargement de la page. Lance une nouvelle vérification pour obtenir le détail.")
                        ])) : createCommentVNode("", true),
                        createVNode("div", {
                          class: "audit-progress",
                          role: "progressbar",
                          "aria-valuenow": Math.round(unref(progress)),
                          "aria-valuemin": "0",
                          "aria-valuemax": "100"
                        }, [
                          createVNode("span", {
                            style: { width: `${unref(progress)}%` }
                          }, null, 4)
                        ], 8, ["aria-valuenow"]),
                        createVNode("div", { class: "audit-stats" }, [
                          createVNode("span", { class: "is-passed" }, [
                            createVNode("strong", null, toDisplayString(unref(counts).passed), 1),
                            createTextVNode(" conformes")
                          ]),
                          createVNode("span", { class: "is-warning" }, [
                            createVNode("strong", null, toDisplayString(unref(counts).warning), 1),
                            createTextVNode(" à examiner")
                          ]),
                          createVNode("span", { class: "is-failed" }, [
                            createVNode("strong", null, toDisplayString(unref(counts).failed), 1),
                            createTextVNode(" erreurs")
                          ]),
                          createVNode("span", null, [
                            createVNode("strong", null, toDisplayString(unref(progress).toFixed(1)) + " %", 1),
                            createTextVNode(" terminé")
                          ])
                        ])
                      ]),
                      createVNode("div", { class: "audit-workspace" }, [
                        createVNode("section", { class: "admin-card audit-results" }, [
                          createVNode("div", { class: "audit-section-title" }, [
                            createVNode("div", null, [
                              createVNode("p", { class: "admin-eyebrow" }, "Résultats"),
                              createVNode("h2", null, "Contrôles automatiques")
                            ]),
                            withDirectives(createVNode("select", {
                              "onUpdate:modelValue": ($event) => isRef(resultFilter) ? resultFilter.value = $event : null,
                              "aria-label": "Filtrer les résultats"
                            }, [
                              createVNode("option", { value: "problems" }, "À examiner"),
                              createVNode("option", { value: "failed" }, "Erreurs seulement"),
                              createVNode("option", { value: "all" }, "Tous les cas")
                            ], 8, ["onUpdate:modelValue"]), [
                              [vModelSelect, unref(resultFilter)]
                            ])
                          ]),
                          createVNode("p", { class: "audit-note" }, "Ce contrôle rapide vérifie le rendu et les incohérences certaines. La campagne sémantique complète mémorisée séparément contrôle aussi les modèles pédagogiques, les irrégularités, les cas suspects et un échantillon régulier avant d’accorder le tag « Approuvé » à un verbe."),
                          !unref(visibleResults).length ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: "audit-empty"
                          }, toDisplayString(unref(processed) ? "Aucun résultat dans ce filtre." : "Lance la vérification pour voir les résultats en direct."), 1)) : (openBlock(), createBlock("ol", {
                            key: 1,
                            class: "audit-result-list"
                          }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(visibleResults), (result) => {
                              return openBlock(), createBlock("li", {
                                key: result.key,
                                class: `is-${result.status}`
                              }, [
                                createVNode("div", null, [
                                  createVNode("strong", null, toDisplayString(result.verb) + " · " + toDisplayString(result.tense), 1),
                                  createVNode("span", null, toDisplayString(result.mode) + " · " + toDisplayString(result.person) + " → " + toDisplayString(result.expected), 1)
                                ]),
                                createVNode("span", { class: "audit-status" }, toDisplayString(result.status === "passed" ? "Conforme" : result.status === "warning" ? "À examiner" : "Erreur"), 1),
                                result.issues.length ? (openBlock(), createBlock("ul", { key: 0 }, [
                                  (openBlock(true), createBlock(Fragment, null, renderList(result.issues, (item) => {
                                    return openBlock(), createBlock("li", {
                                      key: item.code
                                    }, [
                                      createVNode("strong", null, toDisplayString(item.title), 1),
                                      createVNode("span", null, toDisplayString(item.detail), 1)
                                    ]);
                                  }), 128))
                                ])) : createCommentVNode("", true)
                              ], 2);
                            }), 128))
                          ]))
                        ]),
                        createVNode("aside", { class: "audit-live" }, [
                          createVNode("div", { class: "audit-live__heading" }, [
                            createVNode("div", null, [
                              createVNode("p", { class: "admin-eyebrow" }, "Test en direct"),
                              createVNode("h2", null, toDisplayString(unref(currentCase) ? `${unref(currentCase).verb.infinitif} · ${unref(currentCase).form.tense}` : "En attente"), 1)
                            ]),
                            unref(currentCase) ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(unref(currentCase).form.pronoun) + " → " + toDisplayString(unref(currentCase).form.conjugaison1), 1)) : createCommentVNode("", true)
                          ]),
                          createVNode("div", {
                            ref_key: "previewHost",
                            ref: previewHost,
                            class: "audit-preview"
                          }, [
                            unref(currentCase) ? (openBlock(), createBlock(_component_CoachHelpPanel, {
                              key: 0,
                              blocks: unref(automaticBlocks),
                              values: unref(currentValues),
                              "header-title": "{helpTitle}",
                              "header-description": "",
                              "question-number": 3,
                              "coach-color": "#35688f",
                              embedded: ""
                            }, null, 8, ["blocks", "values"])) : (openBlock(), createBlock("div", {
                              key: 1,
                              class: "audit-preview__empty"
                            }, "Le composant d’aide apparaîtra ici pendant la vérification."))
                          ], 512)
                        ])
                      ])
                    ], 64)) : createCommentVNode("", true)
                  ])
                ]),
                _: 2
              }, 1024)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/help-verification.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const helpVerification = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-d3b86c81"]]);

export { helpVerification as default };
//# sourceMappingURL=help-verification-DikXrPqS.mjs.map
