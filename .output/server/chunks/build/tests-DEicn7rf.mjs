import { u as useAdminAuth, _ as __nuxt_component_0, a as __nuxt_component_1, g as getAdminErrorMessage } from './AdminShell-Vsqkwhjy.mjs';
import { defineComponent, ref, computed, watch, withCtx, unref, createVNode, toDisplayString, openBlock, createBlock, createTextVNode, Fragment, renderList, createCommentVNode, withDirectives, isRef, vModelCheckbox, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrLooseContain, ssrRenderClass } from 'vue/server-renderer';
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
import './state-DjsguMyT.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "tests",
  __ssrInlineRender: true,
  setup(__props) {
    const { user, handleUnauthorized } = useAdminAuth();
    const tests2 = ref([]);
    const selected = ref([]);
    const loading = ref(false);
    const running = ref(false);
    const error = ref("");
    const result = ref(null);
    const scenarioFilter = ref("all");
    const ruleFilter = ref("all");
    const selectedScenarioId = ref("");
    const promptCopied = ref(false);
    let loaded = false;
    useHead({ title: "Tests — Administration" });
    const allSelected = computed(() => tests2.value.length > 0 && selected.value.length === tests2.value.length);
    const testGroups = computed(() => {
      const groups = /* @__PURE__ */ new Map();
      for (const test of tests2.value) groups.set(test.category, [...groups.get(test.category) || [], test]);
      return [...groups].map(([title, items]) => ({ title, items }));
    });
    const visibleScenarios = computed(() => {
      const scenarios = result.value?.conjugationScenarios || [];
      return scenarios.filter((scenario) => {
        const statusMatches = scenarioFilter.value === "all" || scenarioFilter.value === "passed" && scenario.passed || scenarioFilter.value === "failed" && !scenario.passed;
        const ruleMatches = ruleFilter.value === "all" || scenario.rules.some((rule) => rule.id === ruleFilter.value);
        return statusMatches && ruleMatches;
      });
    });
    const selectedScenario = computed(() => {
      return visibleScenarios.value.find((scenario) => scenario.id === selectedScenarioId.value) || visibleScenarios.value[0] || null;
    });
    const scenarioCounts = computed(() => {
      const scenarios = result.value?.conjugationScenarios || [];
      return {
        all: scenarios.length,
        passed: scenarios.filter((scenario) => scenario.passed).length,
        failed: scenarios.filter((scenario) => !scenario.passed).length
      };
    });
    const availableRules = computed(() => {
      const rules = /* @__PURE__ */ new Map();
      for (const scenario of result.value?.conjugationScenarios || []) {
        for (const rule of scenario.rules) {
          const current = rules.get(rule.id);
          rules.set(rule.id, { ...rule, count: (current?.count || 0) + 1 });
        }
      }
      return [...rules.values()].sort((left, right) => left.label.localeCompare(right.label, "fr"));
    });
    const scenariosByMode = computed(() => {
      const modeOrder = ["indicatif", "subjonctif", "conditionnel", "impératif", "participe", "infinitif", "gérondif"];
      const groups = /* @__PURE__ */ new Map();
      for (const scenario of visibleScenarios.value) groups.set(scenario.mode, [...groups.get(scenario.mode) || [], scenario]);
      return [...groups].sort(([left], [right]) => modeOrder.indexOf(left.toLocaleLowerCase("fr")) - modeOrder.indexOf(right.toLocaleLowerCase("fr"))).map(([mode, scenarios]) => ({ mode, scenarios }));
    });
    const generalResultGroups = computed(() => result.value?.groups.filter((group) => group.kind === "general") || []);
    const resultSuites = computed(() => (result.value?.suiteResults || []).map((suite, index) => ({
      ...suite,
      id: resultSuiteId(index),
      groups: generalResultGroups.value.filter((group) => group.category === suite.title)
    })));
    const passedResultSuites = computed(() => resultSuites.value.filter((suite) => suite.passed));
    const failedResultSuites = computed(() => resultSuites.value.filter((suite) => !suite.passed));
    function resultSuiteId(index) {
      return `test-results-suite-${index + 1}`;
    }
    const assertionLabels = {
      titre: "Infinitif",
      consigne: "Consigne",
      reponsesPourCorrige: "Forme attendue dans le corrigé",
      reponses: "Forme acceptée par le correcteur"
    };
    const assertionExplanations = {
      titre: "Le verbe demandé est correctement identifié.",
      consigne: "Le pronom, le verbe, le temps et le mode sont correctement assemblés.",
      reponsesPourCorrige: "Cette forme doit apparaître comme solution dans le corrigé.",
      reponses: "Cette saisie doit être reconnue comme juste par le correcteur."
    };
    async function loadTests() {
      loading.value = true;
      error.value = "";
      try {
        const response = await $fetch("/api/admin/tests", { credentials: "same-origin" });
        tests2.value = response.tests;
        selected.value = response.tests.map((test) => test.id);
      } catch (caught) {
        if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, "Impossible de charger les tests.");
      } finally {
        loading.value = false;
      }
    }
    function toggleAll() {
      selected.value = allSelected.value ? [] : tests2.value.map((test) => test.id);
    }
    async function runTests() {
      if (running.value || selected.value.length === 0) return;
      running.value = true;
      result.value = null;
      error.value = "";
      try {
        result.value = await $fetch("/api/admin/tests/run", {
          method: "POST",
          credentials: "same-origin",
          body: { files: selected.value }
        });
        scenarioFilter.value = result.value.conjugationScenarios.some((scenario) => !scenario.passed) ? "failed" : "all";
        ruleFilter.value = "all";
        selectedScenarioId.value = result.value.conjugationScenarios.find((scenario) => !scenario.passed)?.id || result.value.conjugationScenarios[0]?.id || "";
        promptCopied.value = false;
      } catch (caught) {
        if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, "Impossible de lancer les tests.");
      } finally {
        running.value = false;
      }
    }
    async function copyRepairPrompt() {
      if (!result.value?.repairPrompt) return;
      await (void 0).clipboard.writeText(result.value.repairPrompt);
      promptCopied.value = true;
      (void 0).setTimeout(() => {
        promptCopied.value = false;
      }, 2500);
    }
    watch(user, (current) => {
      if (current && !loaded) {
        loaded = true;
        void loadTests();
      }
      if (!current) loaded = false;
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
                  _push3(`<div class="admin-tests" data-v-3b3031a5${_scopeId2}><header class="admin-section-heading" data-v-3b3031a5${_scopeId2}><div data-v-3b3031a5${_scopeId2}><p class="admin-eyebrow" data-v-3b3031a5${_scopeId2}>Qualité</p><h1 data-v-3b3031a5${_scopeId2}>Tests automatisés</h1><p class="admin-muted" data-v-3b3031a5${_scopeId2}>Lancez les tests métier et les scénarios importés de Postman sans quitter l’administration.</p></div><button class="admin-button admin-button--primary"${ssrIncludeBooleanAttr(unref(running) || unref(selected).length === 0) ? " disabled" : ""} data-v-3b3031a5${_scopeId2}>${ssrInterpolate(unref(running) ? "Tests en cours…" : `Lancer ${unref(selected).length} fichier${unref(selected).length > 1 ? "s" : ""}`)}</button></header>`);
                  if (unref(result) && !unref(running)) {
                    _push3(`<nav class="admin-tests__summary" aria-label="Résumé de la dernière exécution" data-v-3b3031a5${_scopeId2}>`);
                    if (unref(passedResultSuites).length) {
                      _push3(`<section class="is-passed" data-v-3b3031a5${_scopeId2}><strong data-v-3b3031a5${_scopeId2}><span aria-hidden="true" data-v-3b3031a5${_scopeId2}>✓</span> Suites réussies</strong><div data-v-3b3031a5${_scopeId2}><!--[-->`);
                      ssrRenderList(unref(passedResultSuites), (suite) => {
                        _push3(`<a${ssrRenderAttr("href", `#${suite.id}`)} data-v-3b3031a5${_scopeId2}>${ssrInterpolate(suite.title)}</a>`);
                      });
                      _push3(`<!--]--></div></section>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    if (unref(failedResultSuites).length) {
                      _push3(`<section class="is-failed" data-v-3b3031a5${_scopeId2}><strong data-v-3b3031a5${_scopeId2}><span aria-hidden="true" data-v-3b3031a5${_scopeId2}>×</span> Suites échouées</strong><div data-v-3b3031a5${_scopeId2}><!--[-->`);
                      ssrRenderList(unref(failedResultSuites), (suite) => {
                        _push3(`<a${ssrRenderAttr("href", `#${suite.id}`)} data-v-3b3031a5${_scopeId2}>${ssrInterpolate(suite.title)}</a>`);
                      });
                      _push3(`<!--]--></div></section>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`</nav>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (unref(error)) {
                    _push3(`<p class="admin-notice admin-notice--error" role="alert" data-v-3b3031a5${_scopeId2}>${ssrInterpolate(unref(error))}</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`<section class="admin-tests__selection admin-card" aria-labelledby="test-selection-title" data-v-3b3031a5${_scopeId2}><div class="admin-tests__selection-heading" data-v-3b3031a5${_scopeId2}><div data-v-3b3031a5${_scopeId2}><h2 id="test-selection-title" data-v-3b3031a5${_scopeId2}>Suites disponibles</h2><p class="admin-muted" data-v-3b3031a5${_scopeId2}>Les fichiers sont exécutés côté serveur avec le moteur de test Node.</p></div><button class="admin-button admin-button--small" type="button"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""} data-v-3b3031a5${_scopeId2}>${ssrInterpolate(unref(allSelected) ? "Tout désélectionner" : "Tout sélectionner")}</button></div>`);
                  if (unref(loading)) {
                    _push3(`<div class="admin-tests__loading" data-v-3b3031a5${_scopeId2}><span class="admin-spinner" aria-hidden="true" data-v-3b3031a5${_scopeId2}></span> Chargement…</div>`);
                  } else {
                    _push3(`<div class="admin-tests__catalog" data-v-3b3031a5${_scopeId2}><!--[-->`);
                    ssrRenderList(unref(testGroups), (group) => {
                      _push3(`<section data-v-3b3031a5${_scopeId2}><h3 data-v-3b3031a5${_scopeId2}>${ssrInterpolate(group.title)}</h3><div class="admin-tests__list" data-v-3b3031a5${_scopeId2}><!--[-->`);
                      ssrRenderList(group.items, (test) => {
                        _push3(`<label data-v-3b3031a5${_scopeId2}><input${ssrIncludeBooleanAttr(Array.isArray(unref(selected)) ? ssrLooseContain(unref(selected), test.id) : unref(selected)) ? " checked" : ""} type="checkbox"${ssrRenderAttr("value", test.id)} data-v-3b3031a5${_scopeId2}><span data-v-3b3031a5${_scopeId2}><strong data-v-3b3031a5${_scopeId2}>${ssrInterpolate(test.title)}</strong><small data-v-3b3031a5${_scopeId2}>${ssrInterpolate(test.description)}</small></span></label>`);
                      });
                      _push3(`<!--]--></div></section>`);
                    });
                    _push3(`<!--]--></div>`);
                  }
                  _push3(`</section>`);
                  if (unref(result)) {
                    _push3(`<section class="${ssrRenderClass(["admin-tests__result", "admin-card", { "is-success": unref(result).success, "is-failure": !unref(result).success }])}" aria-live="polite" data-v-3b3031a5${_scopeId2}><header data-v-3b3031a5${_scopeId2}><div data-v-3b3031a5${_scopeId2}><p class="admin-eyebrow" data-v-3b3031a5${_scopeId2}>Dernière exécution</p><h2 data-v-3b3031a5${_scopeId2}>${ssrInterpolate(unref(result).success ? "Tous les tests passent" : "Des tests ont échoué")}</h2></div><strong data-v-3b3031a5${_scopeId2}>${ssrInterpolate((unref(result).durationMs / 1e3).toFixed(2))} s</strong></header><dl data-v-3b3031a5${_scopeId2}><div data-v-3b3031a5${_scopeId2}><dt data-v-3b3031a5${_scopeId2}>Tests</dt><dd data-v-3b3031a5${_scopeId2}>${ssrInterpolate(unref(result).summary.tests)}</dd></div><div data-v-3b3031a5${_scopeId2}><dt data-v-3b3031a5${_scopeId2}>Réussis</dt><dd data-v-3b3031a5${_scopeId2}>${ssrInterpolate(unref(result).summary.passed)}</dd></div><div data-v-3b3031a5${_scopeId2}><dt data-v-3b3031a5${_scopeId2}>Échoués</dt><dd data-v-3b3031a5${_scopeId2}>${ssrInterpolate(unref(result).summary.failed)}</dd></div><div data-v-3b3031a5${_scopeId2}><dt data-v-3b3031a5${_scopeId2}>Ignorés</dt><dd data-v-3b3031a5${_scopeId2}>${ssrInterpolate(unref(result).summary.skipped)}</dd></div></dl>`);
                    if (unref(result).repairPrompt) {
                      _push3(`<section class="repair-prompt" aria-labelledby="repair-prompt-title" data-v-3b3031a5${_scopeId2}><header data-v-3b3031a5${_scopeId2}><div data-v-3b3031a5${_scopeId2}><p class="admin-eyebrow" data-v-3b3031a5${_scopeId2}>Aide à la réparation</p><h3 id="repair-prompt-title" data-v-3b3031a5${_scopeId2}>Prompt généré à partir des échecs</h3><p data-v-3b3031a5${_scopeId2}>Copiez ce texte et envoyez-le-moi : il contient les tests concernés, les résultats attendus et le journal utile.</p></div><button class="admin-button admin-button--primary" type="button" data-v-3b3031a5${_scopeId2}>${ssrInterpolate(unref(promptCopied) ? "Prompt copié ✓" : "Copier le prompt")}</button></header><textarea readonly aria-label="Prompt de réparation généré" data-v-3b3031a5${_scopeId2}>${ssrInterpolate(unref(result).repairPrompt)}</textarea></section>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    if (unref(generalResultGroups).length) {
                      _push3(`<div class="test-groups" data-v-3b3031a5${_scopeId2}><header data-v-3b3031a5${_scopeId2}><p class="admin-eyebrow" data-v-3b3031a5${_scopeId2}>Détail des tests</p><h3 data-v-3b3031a5${_scopeId2}>Ce qui a été vérifié</h3></header><!--[-->`);
                      ssrRenderList(unref(resultSuites), (suite) => {
                        _push3(`<section${ssrRenderAttr("id", suite.id)} class="test-groups__suite" data-v-3b3031a5${_scopeId2}><h4 data-v-3b3031a5${_scopeId2}>${ssrInterpolate(suite.title)}</h4><!--[-->`);
                        ssrRenderList(suite.groups, (group) => {
                          _push3(`<details${ssrIncludeBooleanAttr(!group.passed) ? " open" : ""} data-v-3b3031a5${_scopeId2}><summary data-v-3b3031a5${_scopeId2}><span class="${ssrRenderClass(["postman-status", group.passed ? "is-passed" : "is-failed"])}" aria-hidden="true" data-v-3b3031a5${_scopeId2}>${ssrInterpolate(group.passed ? "✓" : "×")}</span><span data-v-3b3031a5${_scopeId2}><strong data-v-3b3031a5${_scopeId2}>${ssrInterpolate(group.title)}</strong><small data-v-3b3031a5${_scopeId2}>${ssrInterpolate(group.description)}</small></span><b data-v-3b3031a5${_scopeId2}>${ssrInterpolate(group.cases.filter((testCase) => testCase.passed).length)}/${ssrInterpolate(group.cases.length)}</b></summary><ul data-v-3b3031a5${_scopeId2}><!--[-->`);
                          ssrRenderList(group.cases, (testCase) => {
                            _push3(`<li data-v-3b3031a5${_scopeId2}><span class="${ssrRenderClass(["postman-status", testCase.passed ? "is-passed" : "is-failed"])}" aria-hidden="true" data-v-3b3031a5${_scopeId2}>${ssrInterpolate(testCase.passed ? "✓" : "×")}</span><span data-v-3b3031a5${_scopeId2}>${ssrInterpolate(testCase.title)}</span>`);
                            if (testCase.skipped) {
                              _push3(`<small data-v-3b3031a5${_scopeId2}>Ignoré</small>`);
                            } else {
                              _push3(`<!---->`);
                            }
                            _push3(`</li>`);
                          });
                          _push3(`<!--]--></ul></details>`);
                        });
                        _push3(`<!--]--></section>`);
                      });
                      _push3(`<!--]--></div>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    if (unref(result).coachCredibility.length) {
                      _push3(`<section class="credibility-report" aria-labelledby="credibility-title" data-v-3b3031a5${_scopeId2}><header data-v-3b3031a5${_scopeId2}><div data-v-3b3031a5${_scopeId2}><p class="admin-eyebrow" data-v-3b3031a5${_scopeId2}>Conversation simulée</p><h3 id="credibility-title" data-v-3b3031a5${_scopeId2}>Crédibilité des coaches</h3></div><strong data-v-3b3031a5${_scopeId2}>${ssrInterpolate(unref(result).coachCredibility.filter((report) => report.passed).length)}/${ssrInterpolate(unref(result).coachCredibility.length)} crédibles</strong></header><div class="credibility-grid" data-v-3b3031a5${_scopeId2}><!--[-->`);
                      ssrRenderList(unref(result).coachCredibility, (report) => {
                        _push3(`<details${ssrIncludeBooleanAttr(!report.passed) ? " open" : ""} data-v-3b3031a5${_scopeId2}><summary data-v-3b3031a5${_scopeId2}><span class="${ssrRenderClass(["credibility-score", report.passed ? "is-passed" : "is-failed"])}" data-v-3b3031a5${_scopeId2}>${ssrInterpolate(report.score)} %</span><span data-v-3b3031a5${_scopeId2}><strong data-v-3b3031a5${_scopeId2}>${ssrInterpolate(report.coachName)}</strong><small data-v-3b3031a5${_scopeId2}>${ssrInterpolate(report.caractereName)}</small></span><b data-v-3b3031a5${_scopeId2}>${ssrInterpolate(report.passed ? "Crédible" : "À améliorer")}</b></summary><ul data-v-3b3031a5${_scopeId2}><!--[-->`);
                        ssrRenderList(report.checks, (check) => {
                          _push3(`<li class="${ssrRenderClass({ "is-failed": !check.passed })}" data-v-3b3031a5${_scopeId2}><span class="${ssrRenderClass(["postman-status", check.passed ? "is-passed" : "is-failed"])}" data-v-3b3031a5${_scopeId2}>${ssrInterpolate(check.passed ? "✓" : "×")}</span><span data-v-3b3031a5${_scopeId2}><strong data-v-3b3031a5${_scopeId2}>${ssrInterpolate(check.label)}</strong><small data-v-3b3031a5${_scopeId2}>${ssrInterpolate(check.passed ? check.actual : `Attendu : ${check.expected} · Obtenu : ${check.actual}`)}</small></span></li>`);
                        });
                        _push3(`<!--]--></ul></details>`);
                      });
                      _push3(`<!--]--></div></section>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    if (unref(result).conjugationScenarios.length) {
                      _push3(`<div id="test-results-conjugation" class="postman-report" data-v-3b3031a5${_scopeId2}><header class="postman-report__header" data-v-3b3031a5${_scopeId2}><div data-v-3b3031a5${_scopeId2}><p class="admin-eyebrow" data-v-3b3031a5${_scopeId2}>Collection Postman</p><h3 data-v-3b3031a5${_scopeId2}>Résultats par forme verbale</h3></div><div class="postman-report__filters" aria-label="Filtrer les scénarios" data-v-3b3031a5${_scopeId2}><!--[-->`);
                      ssrRenderList([["all", "Tous"], ["passed", "Réussis"], ["failed", "Échoués"]], (filter) => {
                        _push3(`<button type="button" class="${ssrRenderClass({ "is-active": unref(scenarioFilter) === filter[0] })}" data-v-3b3031a5${_scopeId2}>${ssrInterpolate(filter[1])} <span data-v-3b3031a5${_scopeId2}>${ssrInterpolate(unref(scenarioCounts)[filter[0]])}</span></button>`);
                      });
                      _push3(`<!--]--></div></header><div class="postman-report__rule-filters" aria-label="Filtrer par règle de conjugaison" data-v-3b3031a5${_scopeId2}><strong data-v-3b3031a5${_scopeId2}>Règle testée</strong><button type="button" class="${ssrRenderClass({ "is-active": unref(ruleFilter) === "all" })}" data-v-3b3031a5${_scopeId2}> Toutes <span data-v-3b3031a5${_scopeId2}>${ssrInterpolate(unref(scenarioCounts).all)}</span></button><!--[-->`);
                      ssrRenderList(unref(availableRules), (rule) => {
                        _push3(`<button type="button" class="${ssrRenderClass({ "is-active": unref(ruleFilter) === rule.id })}" data-v-3b3031a5${_scopeId2}>${ssrInterpolate(rule.label)} <span data-v-3b3031a5${_scopeId2}>${ssrInterpolate(rule.count)}</span></button>`);
                      });
                      _push3(`<!--]--></div><div class="postman-report__workspace" data-v-3b3031a5${_scopeId2}><nav class="postman-report__scenarios" aria-label="Scénarios de conjugaison" data-v-3b3031a5${_scopeId2}><!--[-->`);
                      ssrRenderList(unref(scenariosByMode), (group) => {
                        _push3(`<section data-v-3b3031a5${_scopeId2}><h4 data-v-3b3031a5${_scopeId2}>${ssrInterpolate(group.mode)} <span data-v-3b3031a5${_scopeId2}>${ssrInterpolate(group.scenarios.length)}</span></h4><!--[-->`);
                        ssrRenderList(group.scenarios, (scenario) => {
                          _push3(`<button type="button" class="${ssrRenderClass({ "is-selected": unref(selectedScenario)?.id === scenario.id })}" data-v-3b3031a5${_scopeId2}><span class="${ssrRenderClass(["postman-status", scenario.passed ? "is-passed" : "is-failed"])}" aria-hidden="true" data-v-3b3031a5${_scopeId2}>${ssrInterpolate(scenario.passed ? "✓" : "×")}</span><span data-v-3b3031a5${_scopeId2}><strong data-v-3b3031a5${_scopeId2}>${ssrInterpolate(scenario.name)}</strong><small data-v-3b3031a5${_scopeId2}>${ssrInterpolate(scenario.tense)}</small></span></button>`);
                        });
                        _push3(`<!--]--></section>`);
                      });
                      _push3(`<!--]-->`);
                      if (unref(visibleScenarios).length === 0) {
                        _push3(`<p class="admin-muted" data-v-3b3031a5${_scopeId2}>Aucun scénario dans ce filtre.</p>`);
                      } else {
                        _push3(`<!---->`);
                      }
                      _push3(`</nav>`);
                      if (unref(selectedScenario)) {
                        _push3(`<article class="postman-report__detail" data-v-3b3031a5${_scopeId2}><header data-v-3b3031a5${_scopeId2}><div data-v-3b3031a5${_scopeId2}><span class="${ssrRenderClass(["postman-result-badge", unref(selectedScenario).passed ? "is-passed" : "is-failed"])}" data-v-3b3031a5${_scopeId2}>${ssrInterpolate(unref(selectedScenario).passed ? "Réussi" : "Échoué")}</span><h3 data-v-3b3031a5${_scopeId2}>${ssrInterpolate(unref(selectedScenario).title)}</h3><p class="postman-report__purpose" data-v-3b3031a5${_scopeId2}>${ssrInterpolate(unref(selectedScenario).purpose)}</p></div></header><div class="postman-report__tags" data-v-3b3031a5${_scopeId2}><!--[-->`);
                        ssrRenderList(unref(selectedScenario).rules, (rule) => {
                          _push3(`<span data-v-3b3031a5${_scopeId2}>${ssrInterpolate(rule.label)}</span>`);
                        });
                        _push3(`<!--]--></div><div class="postman-report__source" data-v-3b3031a5${_scopeId2}><span data-v-3b3031a5${_scopeId2}>Forme${ssrInterpolate(unref(selectedScenario).sourceForms.length > 1 ? "s" : "")} en entrée</span><!--[-->`);
                        ssrRenderList(unref(selectedScenario).sourceForms, (form) => {
                          _push3(`<code data-v-3b3031a5${_scopeId2}>${ssrInterpolate(form)}</code>`);
                        });
                        _push3(`<!--]--></div><div class="postman-report__assertions" data-v-3b3031a5${_scopeId2}><!--[-->`);
                        ssrRenderList(unref(selectedScenario).assertions, (assertion) => {
                          _push3(`<section class="${ssrRenderClass({ "is-failed": !assertion.passed })}" data-v-3b3031a5${_scopeId2}><header data-v-3b3031a5${_scopeId2}><span class="${ssrRenderClass(["postman-status", assertion.passed ? "is-passed" : "is-failed"])}" aria-hidden="true" data-v-3b3031a5${_scopeId2}>${ssrInterpolate(assertion.passed ? "✓" : "×")}</span><span data-v-3b3031a5${_scopeId2}><strong data-v-3b3031a5${_scopeId2}>${ssrInterpolate(assertionLabels[assertion.property])}</strong><small data-v-3b3031a5${_scopeId2}>${ssrInterpolate(assertionExplanations[assertion.property])}</small></span></header><dl data-v-3b3031a5${_scopeId2}><div data-v-3b3031a5${_scopeId2}><dt data-v-3b3031a5${_scopeId2}>Attendu</dt><dd data-v-3b3031a5${_scopeId2}><code data-v-3b3031a5${_scopeId2}>${ssrInterpolate(assertion.expected)}</code></dd></div><div data-v-3b3031a5${_scopeId2}><dt data-v-3b3031a5${_scopeId2}>Obtenu</dt>`);
                          if (Array.isArray(assertion.actual)) {
                            _push3(`<dd class="postman-values" data-v-3b3031a5${_scopeId2}><!--[-->`);
                            ssrRenderList(assertion.actual, (value) => {
                              _push3(`<code class="${ssrRenderClass({ "is-match": value === assertion.expected })}" data-v-3b3031a5${_scopeId2}>${ssrInterpolate(value)}</code>`);
                            });
                            _push3(`<!--]--></dd>`);
                          } else {
                            _push3(`<dd data-v-3b3031a5${_scopeId2}><code data-v-3b3031a5${_scopeId2}>${ssrInterpolate(assertion.actual)}</code></dd>`);
                          }
                          _push3(`</div></dl></section>`);
                        });
                        _push3(`<!--]--></div></article>`);
                      } else {
                        _push3(`<!---->`);
                      }
                      _push3(`</div></div>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`<details data-v-3b3031a5${_scopeId2}><summary data-v-3b3031a5${_scopeId2}>Afficher le journal technique</summary><pre data-v-3b3031a5${_scopeId2}>${ssrInterpolate(unref(result).output)}</pre></details></section>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "admin-tests" }, [
                      createVNode("header", { class: "admin-section-heading" }, [
                        createVNode("div", null, [
                          createVNode("p", { class: "admin-eyebrow" }, "Qualité"),
                          createVNode("h1", null, "Tests automatisés"),
                          createVNode("p", { class: "admin-muted" }, "Lancez les tests métier et les scénarios importés de Postman sans quitter l’administration.")
                        ]),
                        createVNode("button", {
                          class: "admin-button admin-button--primary",
                          disabled: unref(running) || unref(selected).length === 0,
                          onClick: runTests
                        }, toDisplayString(unref(running) ? "Tests en cours…" : `Lancer ${unref(selected).length} fichier${unref(selected).length > 1 ? "s" : ""}`), 9, ["disabled"])
                      ]),
                      unref(result) && !unref(running) ? (openBlock(), createBlock("nav", {
                        key: 0,
                        class: "admin-tests__summary",
                        "aria-label": "Résumé de la dernière exécution"
                      }, [
                        unref(passedResultSuites).length ? (openBlock(), createBlock("section", {
                          key: 0,
                          class: "is-passed"
                        }, [
                          createVNode("strong", null, [
                            createVNode("span", { "aria-hidden": "true" }, "✓"),
                            createTextVNode(" Suites réussies")
                          ]),
                          createVNode("div", null, [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(passedResultSuites), (suite) => {
                              return openBlock(), createBlock("a", {
                                key: suite.id,
                                href: `#${suite.id}`
                              }, toDisplayString(suite.title), 9, ["href"]);
                            }), 128))
                          ])
                        ])) : createCommentVNode("", true),
                        unref(failedResultSuites).length ? (openBlock(), createBlock("section", {
                          key: 1,
                          class: "is-failed"
                        }, [
                          createVNode("strong", null, [
                            createVNode("span", { "aria-hidden": "true" }, "×"),
                            createTextVNode(" Suites échouées")
                          ]),
                          createVNode("div", null, [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(failedResultSuites), (suite) => {
                              return openBlock(), createBlock("a", {
                                key: suite.id,
                                href: `#${suite.id}`
                              }, toDisplayString(suite.title), 9, ["href"]);
                            }), 128))
                          ])
                        ])) : createCommentVNode("", true)
                      ])) : createCommentVNode("", true),
                      unref(error) ? (openBlock(), createBlock("p", {
                        key: 1,
                        class: "admin-notice admin-notice--error",
                        role: "alert"
                      }, toDisplayString(unref(error)), 1)) : createCommentVNode("", true),
                      createVNode("section", {
                        class: "admin-tests__selection admin-card",
                        "aria-labelledby": "test-selection-title"
                      }, [
                        createVNode("div", { class: "admin-tests__selection-heading" }, [
                          createVNode("div", null, [
                            createVNode("h2", { id: "test-selection-title" }, "Suites disponibles"),
                            createVNode("p", { class: "admin-muted" }, "Les fichiers sont exécutés côté serveur avec le moteur de test Node.")
                          ]),
                          createVNode("button", {
                            class: "admin-button admin-button--small",
                            type: "button",
                            disabled: unref(loading),
                            onClick: toggleAll
                          }, toDisplayString(unref(allSelected) ? "Tout désélectionner" : "Tout sélectionner"), 9, ["disabled"])
                        ]),
                        unref(loading) ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "admin-tests__loading"
                        }, [
                          createVNode("span", {
                            class: "admin-spinner",
                            "aria-hidden": "true"
                          }),
                          createTextVNode(" Chargement…")
                        ])) : (openBlock(), createBlock("div", {
                          key: 1,
                          class: "admin-tests__catalog"
                        }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(testGroups), (group) => {
                            return openBlock(), createBlock("section", {
                              key: group.title
                            }, [
                              createVNode("h3", null, toDisplayString(group.title), 1),
                              createVNode("div", { class: "admin-tests__list" }, [
                                (openBlock(true), createBlock(Fragment, null, renderList(group.items, (test) => {
                                  return openBlock(), createBlock("label", {
                                    key: test.id
                                  }, [
                                    withDirectives(createVNode("input", {
                                      "onUpdate:modelValue": ($event) => isRef(selected) ? selected.value = $event : null,
                                      type: "checkbox",
                                      value: test.id
                                    }, null, 8, ["onUpdate:modelValue", "value"]), [
                                      [vModelCheckbox, unref(selected)]
                                    ]),
                                    createVNode("span", null, [
                                      createVNode("strong", null, toDisplayString(test.title), 1),
                                      createVNode("small", null, toDisplayString(test.description), 1)
                                    ])
                                  ]);
                                }), 128))
                              ])
                            ]);
                          }), 128))
                        ]))
                      ]),
                      unref(result) ? (openBlock(), createBlock("section", {
                        key: 2,
                        class: ["admin-tests__result", "admin-card", { "is-success": unref(result).success, "is-failure": !unref(result).success }],
                        "aria-live": "polite"
                      }, [
                        createVNode("header", null, [
                          createVNode("div", null, [
                            createVNode("p", { class: "admin-eyebrow" }, "Dernière exécution"),
                            createVNode("h2", null, toDisplayString(unref(result).success ? "Tous les tests passent" : "Des tests ont échoué"), 1)
                          ]),
                          createVNode("strong", null, toDisplayString((unref(result).durationMs / 1e3).toFixed(2)) + " s", 1)
                        ]),
                        createVNode("dl", null, [
                          createVNode("div", null, [
                            createVNode("dt", null, "Tests"),
                            createVNode("dd", null, toDisplayString(unref(result).summary.tests), 1)
                          ]),
                          createVNode("div", null, [
                            createVNode("dt", null, "Réussis"),
                            createVNode("dd", null, toDisplayString(unref(result).summary.passed), 1)
                          ]),
                          createVNode("div", null, [
                            createVNode("dt", null, "Échoués"),
                            createVNode("dd", null, toDisplayString(unref(result).summary.failed), 1)
                          ]),
                          createVNode("div", null, [
                            createVNode("dt", null, "Ignorés"),
                            createVNode("dd", null, toDisplayString(unref(result).summary.skipped), 1)
                          ])
                        ]),
                        unref(result).repairPrompt ? (openBlock(), createBlock("section", {
                          key: 0,
                          class: "repair-prompt",
                          "aria-labelledby": "repair-prompt-title"
                        }, [
                          createVNode("header", null, [
                            createVNode("div", null, [
                              createVNode("p", { class: "admin-eyebrow" }, "Aide à la réparation"),
                              createVNode("h3", { id: "repair-prompt-title" }, "Prompt généré à partir des échecs"),
                              createVNode("p", null, "Copiez ce texte et envoyez-le-moi : il contient les tests concernés, les résultats attendus et le journal utile.")
                            ]),
                            createVNode("button", {
                              class: "admin-button admin-button--primary",
                              type: "button",
                              onClick: copyRepairPrompt
                            }, toDisplayString(unref(promptCopied) ? "Prompt copié ✓" : "Copier le prompt"), 1)
                          ]),
                          createVNode("textarea", {
                            value: unref(result).repairPrompt,
                            readonly: "",
                            "aria-label": "Prompt de réparation généré"
                          }, null, 8, ["value"])
                        ])) : createCommentVNode("", true),
                        unref(generalResultGroups).length ? (openBlock(), createBlock("div", {
                          key: 1,
                          class: "test-groups"
                        }, [
                          createVNode("header", null, [
                            createVNode("p", { class: "admin-eyebrow" }, "Détail des tests"),
                            createVNode("h3", null, "Ce qui a été vérifié")
                          ]),
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(resultSuites), (suite) => {
                            return openBlock(), createBlock("section", {
                              id: suite.id,
                              key: suite.id,
                              class: "test-groups__suite"
                            }, [
                              createVNode("h4", null, toDisplayString(suite.title), 1),
                              (openBlock(true), createBlock(Fragment, null, renderList(suite.groups, (group) => {
                                return openBlock(), createBlock("details", {
                                  key: group.title,
                                  open: !group.passed
                                }, [
                                  createVNode("summary", null, [
                                    createVNode("span", {
                                      class: ["postman-status", group.passed ? "is-passed" : "is-failed"],
                                      "aria-hidden": "true"
                                    }, toDisplayString(group.passed ? "✓" : "×"), 3),
                                    createVNode("span", null, [
                                      createVNode("strong", null, toDisplayString(group.title), 1),
                                      createVNode("small", null, toDisplayString(group.description), 1)
                                    ]),
                                    createVNode("b", null, toDisplayString(group.cases.filter((testCase) => testCase.passed).length) + "/" + toDisplayString(group.cases.length), 1)
                                  ]),
                                  createVNode("ul", null, [
                                    (openBlock(true), createBlock(Fragment, null, renderList(group.cases, (testCase) => {
                                      return openBlock(), createBlock("li", {
                                        key: testCase.title
                                      }, [
                                        createVNode("span", {
                                          class: ["postman-status", testCase.passed ? "is-passed" : "is-failed"],
                                          "aria-hidden": "true"
                                        }, toDisplayString(testCase.passed ? "✓" : "×"), 3),
                                        createVNode("span", null, toDisplayString(testCase.title), 1),
                                        testCase.skipped ? (openBlock(), createBlock("small", { key: 0 }, "Ignoré")) : createCommentVNode("", true)
                                      ]);
                                    }), 128))
                                  ])
                                ], 8, ["open"]);
                              }), 128))
                            ], 8, ["id"]);
                          }), 128))
                        ])) : createCommentVNode("", true),
                        unref(result).coachCredibility.length ? (openBlock(), createBlock("section", {
                          key: 2,
                          class: "credibility-report",
                          "aria-labelledby": "credibility-title"
                        }, [
                          createVNode("header", null, [
                            createVNode("div", null, [
                              createVNode("p", { class: "admin-eyebrow" }, "Conversation simulée"),
                              createVNode("h3", { id: "credibility-title" }, "Crédibilité des coaches")
                            ]),
                            createVNode("strong", null, toDisplayString(unref(result).coachCredibility.filter((report) => report.passed).length) + "/" + toDisplayString(unref(result).coachCredibility.length) + " crédibles", 1)
                          ]),
                          createVNode("div", { class: "credibility-grid" }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(result).coachCredibility, (report) => {
                              return openBlock(), createBlock("details", {
                                key: report.coachId,
                                open: !report.passed
                              }, [
                                createVNode("summary", null, [
                                  createVNode("span", {
                                    class: ["credibility-score", report.passed ? "is-passed" : "is-failed"]
                                  }, toDisplayString(report.score) + " %", 3),
                                  createVNode("span", null, [
                                    createVNode("strong", null, toDisplayString(report.coachName), 1),
                                    createVNode("small", null, toDisplayString(report.caractereName), 1)
                                  ]),
                                  createVNode("b", null, toDisplayString(report.passed ? "Crédible" : "À améliorer"), 1)
                                ]),
                                createVNode("ul", null, [
                                  (openBlock(true), createBlock(Fragment, null, renderList(report.checks, (check) => {
                                    return openBlock(), createBlock("li", {
                                      key: check.id,
                                      class: { "is-failed": !check.passed }
                                    }, [
                                      createVNode("span", {
                                        class: ["postman-status", check.passed ? "is-passed" : "is-failed"]
                                      }, toDisplayString(check.passed ? "✓" : "×"), 3),
                                      createVNode("span", null, [
                                        createVNode("strong", null, toDisplayString(check.label), 1),
                                        createVNode("small", null, toDisplayString(check.passed ? check.actual : `Attendu : ${check.expected} · Obtenu : ${check.actual}`), 1)
                                      ])
                                    ], 2);
                                  }), 128))
                                ])
                              ], 8, ["open"]);
                            }), 128))
                          ])
                        ])) : createCommentVNode("", true),
                        unref(result).conjugationScenarios.length ? (openBlock(), createBlock("div", {
                          key: 3,
                          id: "test-results-conjugation",
                          class: "postman-report"
                        }, [
                          createVNode("header", { class: "postman-report__header" }, [
                            createVNode("div", null, [
                              createVNode("p", { class: "admin-eyebrow" }, "Collection Postman"),
                              createVNode("h3", null, "Résultats par forme verbale")
                            ]),
                            createVNode("div", {
                              class: "postman-report__filters",
                              "aria-label": "Filtrer les scénarios"
                            }, [
                              (openBlock(), createBlock(Fragment, null, renderList([["all", "Tous"], ["passed", "Réussis"], ["failed", "Échoués"]], (filter) => {
                                return createVNode("button", {
                                  key: filter[0],
                                  type: "button",
                                  class: { "is-active": unref(scenarioFilter) === filter[0] },
                                  onClick: ($event) => scenarioFilter.value = filter[0]
                                }, [
                                  createTextVNode(toDisplayString(filter[1]) + " ", 1),
                                  createVNode("span", null, toDisplayString(unref(scenarioCounts)[filter[0]]), 1)
                                ], 10, ["onClick"]);
                              }), 64))
                            ])
                          ]),
                          createVNode("div", {
                            class: "postman-report__rule-filters",
                            "aria-label": "Filtrer par règle de conjugaison"
                          }, [
                            createVNode("strong", null, "Règle testée"),
                            createVNode("button", {
                              type: "button",
                              class: { "is-active": unref(ruleFilter) === "all" },
                              onClick: ($event) => ruleFilter.value = "all"
                            }, [
                              createTextVNode(" Toutes "),
                              createVNode("span", null, toDisplayString(unref(scenarioCounts).all), 1)
                            ], 10, ["onClick"]),
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(availableRules), (rule) => {
                              return openBlock(), createBlock("button", {
                                key: rule.id,
                                type: "button",
                                class: { "is-active": unref(ruleFilter) === rule.id },
                                onClick: ($event) => ruleFilter.value = rule.id
                              }, [
                                createTextVNode(toDisplayString(rule.label) + " ", 1),
                                createVNode("span", null, toDisplayString(rule.count), 1)
                              ], 10, ["onClick"]);
                            }), 128))
                          ]),
                          createVNode("div", { class: "postman-report__workspace" }, [
                            createVNode("nav", {
                              class: "postman-report__scenarios",
                              "aria-label": "Scénarios de conjugaison"
                            }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(unref(scenariosByMode), (group) => {
                                return openBlock(), createBlock("section", {
                                  key: group.mode
                                }, [
                                  createVNode("h4", null, [
                                    createTextVNode(toDisplayString(group.mode) + " ", 1),
                                    createVNode("span", null, toDisplayString(group.scenarios.length), 1)
                                  ]),
                                  (openBlock(true), createBlock(Fragment, null, renderList(group.scenarios, (scenario) => {
                                    return openBlock(), createBlock("button", {
                                      key: scenario.id,
                                      type: "button",
                                      class: { "is-selected": unref(selectedScenario)?.id === scenario.id },
                                      onClick: ($event) => selectedScenarioId.value = scenario.id
                                    }, [
                                      createVNode("span", {
                                        class: ["postman-status", scenario.passed ? "is-passed" : "is-failed"],
                                        "aria-hidden": "true"
                                      }, toDisplayString(scenario.passed ? "✓" : "×"), 3),
                                      createVNode("span", null, [
                                        createVNode("strong", null, toDisplayString(scenario.name), 1),
                                        createVNode("small", null, toDisplayString(scenario.tense), 1)
                                      ])
                                    ], 10, ["onClick"]);
                                  }), 128))
                                ]);
                              }), 128)),
                              unref(visibleScenarios).length === 0 ? (openBlock(), createBlock("p", {
                                key: 0,
                                class: "admin-muted"
                              }, "Aucun scénario dans ce filtre.")) : createCommentVNode("", true)
                            ]),
                            unref(selectedScenario) ? (openBlock(), createBlock("article", {
                              key: 0,
                              class: "postman-report__detail"
                            }, [
                              createVNode("header", null, [
                                createVNode("div", null, [
                                  createVNode("span", {
                                    class: ["postman-result-badge", unref(selectedScenario).passed ? "is-passed" : "is-failed"]
                                  }, toDisplayString(unref(selectedScenario).passed ? "Réussi" : "Échoué"), 3),
                                  createVNode("h3", null, toDisplayString(unref(selectedScenario).title), 1),
                                  createVNode("p", { class: "postman-report__purpose" }, toDisplayString(unref(selectedScenario).purpose), 1)
                                ])
                              ]),
                              createVNode("div", { class: "postman-report__tags" }, [
                                (openBlock(true), createBlock(Fragment, null, renderList(unref(selectedScenario).rules, (rule) => {
                                  return openBlock(), createBlock("span", {
                                    key: rule.id
                                  }, toDisplayString(rule.label), 1);
                                }), 128))
                              ]),
                              createVNode("div", { class: "postman-report__source" }, [
                                createVNode("span", null, "Forme" + toDisplayString(unref(selectedScenario).sourceForms.length > 1 ? "s" : "") + " en entrée", 1),
                                (openBlock(true), createBlock(Fragment, null, renderList(unref(selectedScenario).sourceForms, (form) => {
                                  return openBlock(), createBlock("code", { key: form }, toDisplayString(form), 1);
                                }), 128))
                              ]),
                              createVNode("div", { class: "postman-report__assertions" }, [
                                (openBlock(true), createBlock(Fragment, null, renderList(unref(selectedScenario).assertions, (assertion) => {
                                  return openBlock(), createBlock("section", {
                                    key: assertion.id,
                                    class: { "is-failed": !assertion.passed }
                                  }, [
                                    createVNode("header", null, [
                                      createVNode("span", {
                                        class: ["postman-status", assertion.passed ? "is-passed" : "is-failed"],
                                        "aria-hidden": "true"
                                      }, toDisplayString(assertion.passed ? "✓" : "×"), 3),
                                      createVNode("span", null, [
                                        createVNode("strong", null, toDisplayString(assertionLabels[assertion.property]), 1),
                                        createVNode("small", null, toDisplayString(assertionExplanations[assertion.property]), 1)
                                      ])
                                    ]),
                                    createVNode("dl", null, [
                                      createVNode("div", null, [
                                        createVNode("dt", null, "Attendu"),
                                        createVNode("dd", null, [
                                          createVNode("code", null, toDisplayString(assertion.expected), 1)
                                        ])
                                      ]),
                                      createVNode("div", null, [
                                        createVNode("dt", null, "Obtenu"),
                                        Array.isArray(assertion.actual) ? (openBlock(), createBlock("dd", {
                                          key: 0,
                                          class: "postman-values"
                                        }, [
                                          (openBlock(true), createBlock(Fragment, null, renderList(assertion.actual, (value) => {
                                            return openBlock(), createBlock("code", {
                                              key: value,
                                              class: { "is-match": value === assertion.expected }
                                            }, toDisplayString(value), 3);
                                          }), 128))
                                        ])) : (openBlock(), createBlock("dd", { key: 1 }, [
                                          createVNode("code", null, toDisplayString(assertion.actual), 1)
                                        ]))
                                      ])
                                    ])
                                  ], 2);
                                }), 128))
                              ])
                            ])) : createCommentVNode("", true)
                          ])
                        ])) : createCommentVNode("", true),
                        createVNode("details", null, [
                          createVNode("summary", null, "Afficher le journal technique"),
                          createVNode("pre", null, toDisplayString(unref(result).output), 1)
                        ])
                      ], 2)) : createCommentVNode("", true)
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
                  createVNode("div", { class: "admin-tests" }, [
                    createVNode("header", { class: "admin-section-heading" }, [
                      createVNode("div", null, [
                        createVNode("p", { class: "admin-eyebrow" }, "Qualité"),
                        createVNode("h1", null, "Tests automatisés"),
                        createVNode("p", { class: "admin-muted" }, "Lancez les tests métier et les scénarios importés de Postman sans quitter l’administration.")
                      ]),
                      createVNode("button", {
                        class: "admin-button admin-button--primary",
                        disabled: unref(running) || unref(selected).length === 0,
                        onClick: runTests
                      }, toDisplayString(unref(running) ? "Tests en cours…" : `Lancer ${unref(selected).length} fichier${unref(selected).length > 1 ? "s" : ""}`), 9, ["disabled"])
                    ]),
                    unref(result) && !unref(running) ? (openBlock(), createBlock("nav", {
                      key: 0,
                      class: "admin-tests__summary",
                      "aria-label": "Résumé de la dernière exécution"
                    }, [
                      unref(passedResultSuites).length ? (openBlock(), createBlock("section", {
                        key: 0,
                        class: "is-passed"
                      }, [
                        createVNode("strong", null, [
                          createVNode("span", { "aria-hidden": "true" }, "✓"),
                          createTextVNode(" Suites réussies")
                        ]),
                        createVNode("div", null, [
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(passedResultSuites), (suite) => {
                            return openBlock(), createBlock("a", {
                              key: suite.id,
                              href: `#${suite.id}`
                            }, toDisplayString(suite.title), 9, ["href"]);
                          }), 128))
                        ])
                      ])) : createCommentVNode("", true),
                      unref(failedResultSuites).length ? (openBlock(), createBlock("section", {
                        key: 1,
                        class: "is-failed"
                      }, [
                        createVNode("strong", null, [
                          createVNode("span", { "aria-hidden": "true" }, "×"),
                          createTextVNode(" Suites échouées")
                        ]),
                        createVNode("div", null, [
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(failedResultSuites), (suite) => {
                            return openBlock(), createBlock("a", {
                              key: suite.id,
                              href: `#${suite.id}`
                            }, toDisplayString(suite.title), 9, ["href"]);
                          }), 128))
                        ])
                      ])) : createCommentVNode("", true)
                    ])) : createCommentVNode("", true),
                    unref(error) ? (openBlock(), createBlock("p", {
                      key: 1,
                      class: "admin-notice admin-notice--error",
                      role: "alert"
                    }, toDisplayString(unref(error)), 1)) : createCommentVNode("", true),
                    createVNode("section", {
                      class: "admin-tests__selection admin-card",
                      "aria-labelledby": "test-selection-title"
                    }, [
                      createVNode("div", { class: "admin-tests__selection-heading" }, [
                        createVNode("div", null, [
                          createVNode("h2", { id: "test-selection-title" }, "Suites disponibles"),
                          createVNode("p", { class: "admin-muted" }, "Les fichiers sont exécutés côté serveur avec le moteur de test Node.")
                        ]),
                        createVNode("button", {
                          class: "admin-button admin-button--small",
                          type: "button",
                          disabled: unref(loading),
                          onClick: toggleAll
                        }, toDisplayString(unref(allSelected) ? "Tout désélectionner" : "Tout sélectionner"), 9, ["disabled"])
                      ]),
                      unref(loading) ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "admin-tests__loading"
                      }, [
                        createVNode("span", {
                          class: "admin-spinner",
                          "aria-hidden": "true"
                        }),
                        createTextVNode(" Chargement…")
                      ])) : (openBlock(), createBlock("div", {
                        key: 1,
                        class: "admin-tests__catalog"
                      }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(testGroups), (group) => {
                          return openBlock(), createBlock("section", {
                            key: group.title
                          }, [
                            createVNode("h3", null, toDisplayString(group.title), 1),
                            createVNode("div", { class: "admin-tests__list" }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(group.items, (test) => {
                                return openBlock(), createBlock("label", {
                                  key: test.id
                                }, [
                                  withDirectives(createVNode("input", {
                                    "onUpdate:modelValue": ($event) => isRef(selected) ? selected.value = $event : null,
                                    type: "checkbox",
                                    value: test.id
                                  }, null, 8, ["onUpdate:modelValue", "value"]), [
                                    [vModelCheckbox, unref(selected)]
                                  ]),
                                  createVNode("span", null, [
                                    createVNode("strong", null, toDisplayString(test.title), 1),
                                    createVNode("small", null, toDisplayString(test.description), 1)
                                  ])
                                ]);
                              }), 128))
                            ])
                          ]);
                        }), 128))
                      ]))
                    ]),
                    unref(result) ? (openBlock(), createBlock("section", {
                      key: 2,
                      class: ["admin-tests__result", "admin-card", { "is-success": unref(result).success, "is-failure": !unref(result).success }],
                      "aria-live": "polite"
                    }, [
                      createVNode("header", null, [
                        createVNode("div", null, [
                          createVNode("p", { class: "admin-eyebrow" }, "Dernière exécution"),
                          createVNode("h2", null, toDisplayString(unref(result).success ? "Tous les tests passent" : "Des tests ont échoué"), 1)
                        ]),
                        createVNode("strong", null, toDisplayString((unref(result).durationMs / 1e3).toFixed(2)) + " s", 1)
                      ]),
                      createVNode("dl", null, [
                        createVNode("div", null, [
                          createVNode("dt", null, "Tests"),
                          createVNode("dd", null, toDisplayString(unref(result).summary.tests), 1)
                        ]),
                        createVNode("div", null, [
                          createVNode("dt", null, "Réussis"),
                          createVNode("dd", null, toDisplayString(unref(result).summary.passed), 1)
                        ]),
                        createVNode("div", null, [
                          createVNode("dt", null, "Échoués"),
                          createVNode("dd", null, toDisplayString(unref(result).summary.failed), 1)
                        ]),
                        createVNode("div", null, [
                          createVNode("dt", null, "Ignorés"),
                          createVNode("dd", null, toDisplayString(unref(result).summary.skipped), 1)
                        ])
                      ]),
                      unref(result).repairPrompt ? (openBlock(), createBlock("section", {
                        key: 0,
                        class: "repair-prompt",
                        "aria-labelledby": "repair-prompt-title"
                      }, [
                        createVNode("header", null, [
                          createVNode("div", null, [
                            createVNode("p", { class: "admin-eyebrow" }, "Aide à la réparation"),
                            createVNode("h3", { id: "repair-prompt-title" }, "Prompt généré à partir des échecs"),
                            createVNode("p", null, "Copiez ce texte et envoyez-le-moi : il contient les tests concernés, les résultats attendus et le journal utile.")
                          ]),
                          createVNode("button", {
                            class: "admin-button admin-button--primary",
                            type: "button",
                            onClick: copyRepairPrompt
                          }, toDisplayString(unref(promptCopied) ? "Prompt copié ✓" : "Copier le prompt"), 1)
                        ]),
                        createVNode("textarea", {
                          value: unref(result).repairPrompt,
                          readonly: "",
                          "aria-label": "Prompt de réparation généré"
                        }, null, 8, ["value"])
                      ])) : createCommentVNode("", true),
                      unref(generalResultGroups).length ? (openBlock(), createBlock("div", {
                        key: 1,
                        class: "test-groups"
                      }, [
                        createVNode("header", null, [
                          createVNode("p", { class: "admin-eyebrow" }, "Détail des tests"),
                          createVNode("h3", null, "Ce qui a été vérifié")
                        ]),
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(resultSuites), (suite) => {
                          return openBlock(), createBlock("section", {
                            id: suite.id,
                            key: suite.id,
                            class: "test-groups__suite"
                          }, [
                            createVNode("h4", null, toDisplayString(suite.title), 1),
                            (openBlock(true), createBlock(Fragment, null, renderList(suite.groups, (group) => {
                              return openBlock(), createBlock("details", {
                                key: group.title,
                                open: !group.passed
                              }, [
                                createVNode("summary", null, [
                                  createVNode("span", {
                                    class: ["postman-status", group.passed ? "is-passed" : "is-failed"],
                                    "aria-hidden": "true"
                                  }, toDisplayString(group.passed ? "✓" : "×"), 3),
                                  createVNode("span", null, [
                                    createVNode("strong", null, toDisplayString(group.title), 1),
                                    createVNode("small", null, toDisplayString(group.description), 1)
                                  ]),
                                  createVNode("b", null, toDisplayString(group.cases.filter((testCase) => testCase.passed).length) + "/" + toDisplayString(group.cases.length), 1)
                                ]),
                                createVNode("ul", null, [
                                  (openBlock(true), createBlock(Fragment, null, renderList(group.cases, (testCase) => {
                                    return openBlock(), createBlock("li", {
                                      key: testCase.title
                                    }, [
                                      createVNode("span", {
                                        class: ["postman-status", testCase.passed ? "is-passed" : "is-failed"],
                                        "aria-hidden": "true"
                                      }, toDisplayString(testCase.passed ? "✓" : "×"), 3),
                                      createVNode("span", null, toDisplayString(testCase.title), 1),
                                      testCase.skipped ? (openBlock(), createBlock("small", { key: 0 }, "Ignoré")) : createCommentVNode("", true)
                                    ]);
                                  }), 128))
                                ])
                              ], 8, ["open"]);
                            }), 128))
                          ], 8, ["id"]);
                        }), 128))
                      ])) : createCommentVNode("", true),
                      unref(result).coachCredibility.length ? (openBlock(), createBlock("section", {
                        key: 2,
                        class: "credibility-report",
                        "aria-labelledby": "credibility-title"
                      }, [
                        createVNode("header", null, [
                          createVNode("div", null, [
                            createVNode("p", { class: "admin-eyebrow" }, "Conversation simulée"),
                            createVNode("h3", { id: "credibility-title" }, "Crédibilité des coaches")
                          ]),
                          createVNode("strong", null, toDisplayString(unref(result).coachCredibility.filter((report) => report.passed).length) + "/" + toDisplayString(unref(result).coachCredibility.length) + " crédibles", 1)
                        ]),
                        createVNode("div", { class: "credibility-grid" }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(result).coachCredibility, (report) => {
                            return openBlock(), createBlock("details", {
                              key: report.coachId,
                              open: !report.passed
                            }, [
                              createVNode("summary", null, [
                                createVNode("span", {
                                  class: ["credibility-score", report.passed ? "is-passed" : "is-failed"]
                                }, toDisplayString(report.score) + " %", 3),
                                createVNode("span", null, [
                                  createVNode("strong", null, toDisplayString(report.coachName), 1),
                                  createVNode("small", null, toDisplayString(report.caractereName), 1)
                                ]),
                                createVNode("b", null, toDisplayString(report.passed ? "Crédible" : "À améliorer"), 1)
                              ]),
                              createVNode("ul", null, [
                                (openBlock(true), createBlock(Fragment, null, renderList(report.checks, (check) => {
                                  return openBlock(), createBlock("li", {
                                    key: check.id,
                                    class: { "is-failed": !check.passed }
                                  }, [
                                    createVNode("span", {
                                      class: ["postman-status", check.passed ? "is-passed" : "is-failed"]
                                    }, toDisplayString(check.passed ? "✓" : "×"), 3),
                                    createVNode("span", null, [
                                      createVNode("strong", null, toDisplayString(check.label), 1),
                                      createVNode("small", null, toDisplayString(check.passed ? check.actual : `Attendu : ${check.expected} · Obtenu : ${check.actual}`), 1)
                                    ])
                                  ], 2);
                                }), 128))
                              ])
                            ], 8, ["open"]);
                          }), 128))
                        ])
                      ])) : createCommentVNode("", true),
                      unref(result).conjugationScenarios.length ? (openBlock(), createBlock("div", {
                        key: 3,
                        id: "test-results-conjugation",
                        class: "postman-report"
                      }, [
                        createVNode("header", { class: "postman-report__header" }, [
                          createVNode("div", null, [
                            createVNode("p", { class: "admin-eyebrow" }, "Collection Postman"),
                            createVNode("h3", null, "Résultats par forme verbale")
                          ]),
                          createVNode("div", {
                            class: "postman-report__filters",
                            "aria-label": "Filtrer les scénarios"
                          }, [
                            (openBlock(), createBlock(Fragment, null, renderList([["all", "Tous"], ["passed", "Réussis"], ["failed", "Échoués"]], (filter) => {
                              return createVNode("button", {
                                key: filter[0],
                                type: "button",
                                class: { "is-active": unref(scenarioFilter) === filter[0] },
                                onClick: ($event) => scenarioFilter.value = filter[0]
                              }, [
                                createTextVNode(toDisplayString(filter[1]) + " ", 1),
                                createVNode("span", null, toDisplayString(unref(scenarioCounts)[filter[0]]), 1)
                              ], 10, ["onClick"]);
                            }), 64))
                          ])
                        ]),
                        createVNode("div", {
                          class: "postman-report__rule-filters",
                          "aria-label": "Filtrer par règle de conjugaison"
                        }, [
                          createVNode("strong", null, "Règle testée"),
                          createVNode("button", {
                            type: "button",
                            class: { "is-active": unref(ruleFilter) === "all" },
                            onClick: ($event) => ruleFilter.value = "all"
                          }, [
                            createTextVNode(" Toutes "),
                            createVNode("span", null, toDisplayString(unref(scenarioCounts).all), 1)
                          ], 10, ["onClick"]),
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(availableRules), (rule) => {
                            return openBlock(), createBlock("button", {
                              key: rule.id,
                              type: "button",
                              class: { "is-active": unref(ruleFilter) === rule.id },
                              onClick: ($event) => ruleFilter.value = rule.id
                            }, [
                              createTextVNode(toDisplayString(rule.label) + " ", 1),
                              createVNode("span", null, toDisplayString(rule.count), 1)
                            ], 10, ["onClick"]);
                          }), 128))
                        ]),
                        createVNode("div", { class: "postman-report__workspace" }, [
                          createVNode("nav", {
                            class: "postman-report__scenarios",
                            "aria-label": "Scénarios de conjugaison"
                          }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(scenariosByMode), (group) => {
                              return openBlock(), createBlock("section", {
                                key: group.mode
                              }, [
                                createVNode("h4", null, [
                                  createTextVNode(toDisplayString(group.mode) + " ", 1),
                                  createVNode("span", null, toDisplayString(group.scenarios.length), 1)
                                ]),
                                (openBlock(true), createBlock(Fragment, null, renderList(group.scenarios, (scenario) => {
                                  return openBlock(), createBlock("button", {
                                    key: scenario.id,
                                    type: "button",
                                    class: { "is-selected": unref(selectedScenario)?.id === scenario.id },
                                    onClick: ($event) => selectedScenarioId.value = scenario.id
                                  }, [
                                    createVNode("span", {
                                      class: ["postman-status", scenario.passed ? "is-passed" : "is-failed"],
                                      "aria-hidden": "true"
                                    }, toDisplayString(scenario.passed ? "✓" : "×"), 3),
                                    createVNode("span", null, [
                                      createVNode("strong", null, toDisplayString(scenario.name), 1),
                                      createVNode("small", null, toDisplayString(scenario.tense), 1)
                                    ])
                                  ], 10, ["onClick"]);
                                }), 128))
                              ]);
                            }), 128)),
                            unref(visibleScenarios).length === 0 ? (openBlock(), createBlock("p", {
                              key: 0,
                              class: "admin-muted"
                            }, "Aucun scénario dans ce filtre.")) : createCommentVNode("", true)
                          ]),
                          unref(selectedScenario) ? (openBlock(), createBlock("article", {
                            key: 0,
                            class: "postman-report__detail"
                          }, [
                            createVNode("header", null, [
                              createVNode("div", null, [
                                createVNode("span", {
                                  class: ["postman-result-badge", unref(selectedScenario).passed ? "is-passed" : "is-failed"]
                                }, toDisplayString(unref(selectedScenario).passed ? "Réussi" : "Échoué"), 3),
                                createVNode("h3", null, toDisplayString(unref(selectedScenario).title), 1),
                                createVNode("p", { class: "postman-report__purpose" }, toDisplayString(unref(selectedScenario).purpose), 1)
                              ])
                            ]),
                            createVNode("div", { class: "postman-report__tags" }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(unref(selectedScenario).rules, (rule) => {
                                return openBlock(), createBlock("span", {
                                  key: rule.id
                                }, toDisplayString(rule.label), 1);
                              }), 128))
                            ]),
                            createVNode("div", { class: "postman-report__source" }, [
                              createVNode("span", null, "Forme" + toDisplayString(unref(selectedScenario).sourceForms.length > 1 ? "s" : "") + " en entrée", 1),
                              (openBlock(true), createBlock(Fragment, null, renderList(unref(selectedScenario).sourceForms, (form) => {
                                return openBlock(), createBlock("code", { key: form }, toDisplayString(form), 1);
                              }), 128))
                            ]),
                            createVNode("div", { class: "postman-report__assertions" }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(unref(selectedScenario).assertions, (assertion) => {
                                return openBlock(), createBlock("section", {
                                  key: assertion.id,
                                  class: { "is-failed": !assertion.passed }
                                }, [
                                  createVNode("header", null, [
                                    createVNode("span", {
                                      class: ["postman-status", assertion.passed ? "is-passed" : "is-failed"],
                                      "aria-hidden": "true"
                                    }, toDisplayString(assertion.passed ? "✓" : "×"), 3),
                                    createVNode("span", null, [
                                      createVNode("strong", null, toDisplayString(assertionLabels[assertion.property]), 1),
                                      createVNode("small", null, toDisplayString(assertionExplanations[assertion.property]), 1)
                                    ])
                                  ]),
                                  createVNode("dl", null, [
                                    createVNode("div", null, [
                                      createVNode("dt", null, "Attendu"),
                                      createVNode("dd", null, [
                                        createVNode("code", null, toDisplayString(assertion.expected), 1)
                                      ])
                                    ]),
                                    createVNode("div", null, [
                                      createVNode("dt", null, "Obtenu"),
                                      Array.isArray(assertion.actual) ? (openBlock(), createBlock("dd", {
                                        key: 0,
                                        class: "postman-values"
                                      }, [
                                        (openBlock(true), createBlock(Fragment, null, renderList(assertion.actual, (value) => {
                                          return openBlock(), createBlock("code", {
                                            key: value,
                                            class: { "is-match": value === assertion.expected }
                                          }, toDisplayString(value), 3);
                                        }), 128))
                                      ])) : (openBlock(), createBlock("dd", { key: 1 }, [
                                        createVNode("code", null, toDisplayString(assertion.actual), 1)
                                      ]))
                                    ])
                                  ])
                                ], 2);
                              }), 128))
                            ])
                          ])) : createCommentVNode("", true)
                        ])
                      ])) : createCommentVNode("", true),
                      createVNode("details", null, [
                        createVNode("summary", null, "Afficher le journal technique"),
                        createVNode("pre", null, toDisplayString(unref(result).output), 1)
                      ])
                    ], 2)) : createCommentVNode("", true)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/tests.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const tests = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-3b3031a5"]]);

export { tests as default };
//# sourceMappingURL=tests-DEicn7rf.mjs.map
